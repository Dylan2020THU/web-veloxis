// Sync apps/industry/dist/ → <repo-root>/industry/
// Same pattern as apps/roadmap/scripts/sync-to-site.mjs.

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
const repoRoot = resolve(appRoot, "..", "..");
const defaultSiteDir = join(repoRoot, "industry");
const siteDir = process.env.SITE_INDUSTRY_DIR
  ? resolve(process.env.SITE_INDUSTRY_DIR)
  : defaultSiteDir;

const EXCLUDE = new Set(["CNAME"]);

function die(msg) {
  console.error(`[sync:site] ${msg}`);
  process.exit(1);
}

if (!existsSync(distDir)) {
  die(
    `dist/ not found at ${distDir}. Run \`npm run build\` first, or use \`npm run deploy:site\`.`
  );
}
if (!existsSync(repoRoot)) {
  die(`Repo root not found at ${repoRoot}.`);
}

if (!existsSync(siteDir)) {
  mkdirSync(siteDir, { recursive: true });
} else {
  for (const child of readdirSync(siteDir)) {
    rmSync(join(siteDir, child), { recursive: true, force: true });
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

for (const child of readdirSync(distDir)) {
  if (EXCLUDE.has(child)) continue;
  copyTree(join(distDir, child), join(siteDir, child));
}

function countFiles(dir) {
  let n = 0;
  for (const child of readdirSync(dir)) {
    const p = join(dir, child);
    n += statSync(p).isDirectory() ? countFiles(p) : 1;
  }
  return n;
}

const fileCount = countFiles(siteDir);
const relDest = relative(process.cwd(), siteDir) || siteDir;
console.log(`[sync:site] copied ${fileCount} files from dist/ -> ${relDest}`);
console.log("[sync:site] next steps (run from the repo root):");
console.log(`    cd ${repoRoot}`);
console.log("    git status");
console.log("    git add industry");
console.log('    git commit -m "chore(industry): sync latest build"');
console.log("    git push origin main");
