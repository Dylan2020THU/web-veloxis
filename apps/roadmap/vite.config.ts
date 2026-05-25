import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// The roadmap site is now mounted as a sub-path of the company site
// (https://www.veloxisai.com/roadmap/), so the default base is "/roadmap/".
// Override with `$env:VITE_BASE = "/"` (or any other path) before running
// `npm run dev` / `npm run build` if you want to host it elsewhere.
const base = process.env.VITE_BASE ?? "/roadmap/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
