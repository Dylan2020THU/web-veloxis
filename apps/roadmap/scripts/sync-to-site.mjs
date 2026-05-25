// Sync the freshly built SPA `dist/` into the marketing site's `roadmap/`
// sub-directory at the monorepo root. The live www.veloxisai.com is served
// from this repo's root via GitHub Pages, and `/roadmap/` is just a
// snapshot of this SPA's dist living at `<repo-root>/roadmap/`.
//
// Layout (after the monorepo merge):
//     <repo-root>/                 ← GitHub Pages root, www.veloxisai.com
//         index.html               ← marketing landing page
//         roadmap/                 ← snapshot copied by this script
//         apps/
//             roadmap/             ← this SPA's source (scripts/, src/, etc.)
//                 dist/            ← vite build output (input to this script)
//
// Usage (from apps/roadmap):
//     npm run sync:site            # assumes dist/ is up to date
//     npm run deploy:site          # build + sync
//
// After syncing, commit and push from the repo root:
//     cd ../..
//     git add roadmap
//     git commit -m "chore(roadmap): sync latest build"
//     git push origin main
//
// The script intentionally stops short of touching git state — it prints a
// checklist instead, so a stray `git add .` never silently sweeps unrelated
// working-tree changes into the deploy commit.

import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  copyFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, "..");
const distDir = join(appRoot, "dist");

// After the monorepo merge, the marketing root and this app share the same
// git repo: <repo-root>/roadmap/ is two levels up from apps/roadmap/scripts/.
// SITE_ROADMAP_DIR override is kept for emergencies (e.g. running the script
// from an unpacked tarball outside the repo).
const repoRoot = resolve(appRoot, "..", "..");
const defaultSiteRoadmap = join(repoRoot, "roadmap");
const siteRoadmap = process.env.SITE_ROADMAP_DIR
  ? resolve(process.env.SITE_ROADMAP_DIR)
  : defaultSiteRoadmap;

// Files in dist/ that should NOT propagate to the marketing repo. CNAME is
// owned by the marketing repo root (one per Pages site); copying it into a
// sub-dir is harmless but adds noise to git diffs.
const EXCLUDE = new Set(["CNAME"]);

function die(msg) {
  console.error(`[sync:site] ${msg}`);
  process.exit(1);
}

if (!existsSync(distDir)) {
  die(
    `dist/ not found at ${distDir}. Run \`npm run build\` first, or use \`npm run deploy:site\` which builds before syncing.`
  );
}
if (!existsSync(repoRoot)) {
  die(`Repo root not found at ${repoRoot}. Did you run this from outside the repo?`);
}

if (!existsSync(siteRoadmap)) {
  mkdirSync(siteRoadmap, { recursive: true });
} else {
  // Wipe the previous snapshot so removed/renamed files don't linger.
  for (const child of readdirSync(siteRoadmap)) {
    rmSync(join(siteRoadmap, child), { recursive: true, force: true });
  }
}

function copyTree(src, dest) {
  const stats = statSync(src);
  if (stats.isDirectory()) {
    mkdirSync(dest, { recursive: true });
    for (const child of readdirSync(src)) {
      copyTree(join(src, child), join(dest, child));
    }
  } else {
    copyFileSync(src, dest);
  }
}

let fileCount = 0;
for (const child of readdirSync(distDir)) {
  if (EXCLUDE.has(child)) continue;
  copyTree(join(distDir, child), join(siteRoadmap, child));
}
// Re-count after copy so the log reflects the actual fanout.
function countFiles(dir) {
  let n = 0;
  for (const child of readdirSync(dir)) {
    const p = join(dir, child);
    n += statSync(p).isDirectory() ? countFiles(p) : 1;
  }
  return n;
}
fileCount = countFiles(siteRoadmap);

const relDest = relative(process.cwd(), siteRoadmap) || siteRoadmap;
console.log(`[sync:site] copied ${fileCount} files from dist/ -> ${relDest}`);
console.log("[sync:site] next steps (run from the repo root):");
console.log(`    cd ${repoRoot}`);
console.log("    git status   # review the diff");
console.log("    git add roadmap");
console.log('    git commit -m "chore(roadmap): sync latest build"');
console.log("    git push origin main");
