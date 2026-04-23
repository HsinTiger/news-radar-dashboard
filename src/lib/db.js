// db.js — loads sql.js + the live news_radar.db from the backend's `state` branch.
//
// Data flow:
//   1. Initialize sql.js with the wasm binary served from /sql-wasm.wasm (public/).
//   2. Fetch the DB file as ArrayBuffer from raw.githubusercontent.com.
//   3. Open an in-memory SQL.Database for read-only querying.
//
// Each call to `loadLiveDB()` fetches fresh bytes. Upstream (useNewsRadarDB)
// is responsible for cadence — typically once on mount, then every 5 minutes.

// sql.js is UMD (`module.exports = initSqlJs`). With `optimizeDeps` letting
// Vite pre-bundle it (default behavior — don't `exclude` sql.js), esbuild
// correctly synthesizes the default export as the init function.
import initSqlJs from "sql.js";
// Vite's `?url` suffix resolves the .wasm to a hashed URL at build time and
// a dev-server URL in dev mode — more robust than hand-computing via BASE_URL.
// Using `sql.js/dist/sql-wasm.wasm` (from node_modules) avoids drift with the
// copy in /public if the vendored versions ever diverge.
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";

const DB_URL =
  import.meta.env.VITE_DB_URL ||
  "https://raw.githubusercontent.com/HsinTiger/news-radar/state/data/01_harvest/news_radar.db";

let sqlPromise = null;

function getSqlRuntime() {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({
      // Ignore the `file` arg; we only ever need sql-wasm.wasm, and Vite has
      // already resolved its URL for us.
      locateFile: () => sqlWasmUrl,
    });
  }
  return sqlPromise;
}

export async function loadLiveDB() {
  const SQL = await getSqlRuntime();
  // Add a cache-buster; raw.githubusercontent.com serves with short TTL but CDNs can be sticky.
  const url = `${DB_URL}?t=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch DB (HTTP ${res.status}): ${url}`);
  }
  const buf = await res.arrayBuffer();
  return new SQL.Database(new Uint8Array(buf));
}
