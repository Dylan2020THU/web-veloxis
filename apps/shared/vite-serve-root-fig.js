import { createReadStream, existsSync } from "node:fs";
import { extname, resolve } from "node:path";
var MIME = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".webp": "image/webp",
};
/** Dev-only: serve repo-root /fig/* so sub-app TopBars show the same logo as production. */
export function serveRootFig(appDir) {
    var figRoot = resolve(appDir, "../../fig");
    return {
        name: "serve-root-fig",
        configureServer: function (server) {
            server.middlewares.use(function (req, res, next) {
                var _a, _b;
                if (!((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith("/fig/")))
                    return next();
                var rel = decodeURIComponent(req.url.slice("/fig/".length).split("?")[0]);
                var file = resolve(figRoot, rel);
                if (!file.startsWith(figRoot) || !existsSync(file))
                    return next();
                res.setHeader("Content-Type", (_b = MIME[extname(file)]) !== null && _b !== void 0 ? _b : "application/octet-stream");
                createReadStream(file).pipe(res);
            });
        },
    };
}
