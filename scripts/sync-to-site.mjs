// Sync the freshly built SPA `dist/` into the marketing site's `roadmap/`
// sub-directory. This exists because the live www.veloxisai.com is served
// from the sibling repo `web-veloxis` (its `main` branch root powers
// GitHub Pages), and `/roadmap/` is just a snapshot of this repo's dist
// living at `../web-veloxisai/roadmap/`. The previous `gh-pages` deploy
// flow pushed dist to a branch that nobody consumed, so it was a no-op.
//
// Usage (from this package):
//     npm run sync:site         # assumes dist/ is up to date
//     npm run deploy:site       # build + sync
//
// After syncing you still need to commit and push the marketing repo:
//     cd ../web-veloxisai
//     git add roadmap
//     git commit -m "chore(roadmap): sync latest build"
//     git push origin main
//
// The script intentionally stops short of touching the marketing repo's
// git state — it prints a checklist instead, so a stray `git add .` over
// there never silently sweeps unrelated working-tree changes into the
// deploy commit.

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
const repoRoot = resolve(__dirname, "..");
const distDir = join(repoRoot, "dist");

// The marketing repo is expected to be a sibling on disk. If it lives
// somewhere else, set SITE_ROADMAP_DIR before running.
const defaultSiteRoadmap = resolve(repoRoot, "..", "web-veloxisai", "roadmap");
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
const siteParent = dirname(siteRoadmap);
if (!existsSync(siteParent)) {
  die(
    `Marketing-site repo not found at ${siteParent}. Either checkout it as a sibling of this repo, or set SITE_ROADMAP_DIR to its /roadmap directory.`
  );
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
console.log("[sync:site] next steps (run in the marketing repo):");
console.log(`    cd ${dirname(siteRoadmap)}`);
console.log("    git status   # review the diff");
console.log("    git add roadmap");
console.log('    git commit -m "chore(roadmap): sync latest build"');
console.log("    git push origin main");
