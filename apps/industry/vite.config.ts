import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
// Shared dev middleware (plain .mjs — no TS types)
// @ts-expect-error untyped ESM helper
import { serveRootFig } from "../shared/vite-serve-root-fig.mjs";

const base = process.env.VITE_BASE ?? "/industry/";

export default defineConfig({
  base,
  plugins: [react(), serveRootFig(__dirname)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5174,
    open: true,
  },
});
