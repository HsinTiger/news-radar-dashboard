import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Vite config for News Radar Dashboard.
// - `base` is `/news-radar-dashboard/` so built assets resolve correctly under
//   GitHub Pages project-pages hosting (hsintiger.github.io/news-radar-dashboard/).
//   For local dev, Vite ignores `base` on the dev server root, but import.meta.env.BASE_URL
//   still reflects it — which is what db.js uses to locate sql-wasm.wasm.
// - `@/*` alias points to src/.
export default defineConfig({
  base: "/news-radar-dashboard/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  // sql.js is UMD. Letting esbuild pre-bundle it (the default) ensures a
  // proper `default` export is synthesized from CJS `module.exports = fn`.
  // Excluding sql.js here breaks native-ESM default resolution in dev —
  // the browser ends up with the Emscripten `Module` object instead of the
  // `initSqlJs` function, throwing "initSqlJs is not a function".
  // The .wasm binary is still served from /public via the runtime
  // `locateFile` callback in src/lib/db.js — pre-bundling the JS wrapper
  // does NOT affect that path.
});
