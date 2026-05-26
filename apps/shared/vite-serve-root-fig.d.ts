import type { Plugin } from "vite";
/** Dev-only: serve repo-root /fig/* so sub-app TopBars show the same logo as production. */
export declare function serveRootFig(appDir: string): Plugin;
