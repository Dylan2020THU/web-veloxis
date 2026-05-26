import { createReadStream, existsSync } from "node:fs";
import { extname, resolve } from "node:path";

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

/** Dev-only: serve repo-root /fig/* so sub-app TopBars show the same logo as production. */
export function serveRootFig(appDir) {
  const figRoot = resolve(appDir, "../../fig");

  return {
    name: "serve-root-fig",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/fig/")) return next();
        const rel = decodeURIComponent(req.url.slice("/fig/".length).split("?")[0]);
        const file = resolve(figRoot, rel);
        if (!file.startsWith(figRoot) || !existsSync(file)) return next();
        res.setHeader(
          "Content-Type",
          MIME[extname(file)] ?? "application/octet-stream"
        );
        createReadStream(file).pipe(res);
      });
    },
  };
}
