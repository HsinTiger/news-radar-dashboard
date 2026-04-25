// Time helpers — two modes.
//
// Mock mode (default): `_now` is frozen at NOW_MOCK so the dashboard renders
// a stable, reviewable state for screenshots / dev. The hrs / mins / future
// helpers use this so MOCK_ITEMS' relative timestamps don't drift.
//
// Live mode: useNewsRadarDB calls setLive(true) at module load. After that,
// `getNow()` returns a fresh `new Date()` on every call, so fmtRel always
// computes "N 小時前" against real wall-clock time. RelTime separately ticks
// every 60s to force re-render as time advances.
//
// All absolute-time displays are Taipei (+08:00) — Hsin's operational timezone.
// DB timestamps are confirmed UTC ISO with `+00:00` suffix (backend audit
// 2026-04-25, all 1751 timestamps clean), so `+8h → Taipei` is safe.

export const NOW_MOCK = new Date("2026-04-23T06:30:00Z"); // 14:30 Taipei

let _now = NOW_MOCK;
let _isLive = false;

/** Allow tests / mock mode to override the reference "now". No-op in live mode. */
export function setNow(d) {
  _now = typeof d === "string" ? new Date(d) : d;
}

/** Switch the module into live-clock mode. Called once by useNewsRadarDB. */
export function setLive(v) {
  _isLive = !!v;
}

export function getNow() {
  return _isLive ? new Date() : _now;
}

// hrs / mins / future / futureM are mock-data builders (run at module load before
// setLive flips). They intentionally read `_now` directly so MOCK_ITEMS gets
// timestamps relative to the frozen NOW_MOCK.
export const hrs = (h) => new Date(_now.getTime() - h * 3600_000);
export const mins = (m) => new Date(_now.getTime() - m * 60_000);
export const future = (h) => new Date(_now.getTime() + h * 3600_000);
export const futureM = (m) => new Date(_now.getTime() + m * 60_000);

function toDate(d) {
  return typeof d === "string" ? new Date(d) : d;
}

/** Format as `HH:MM` in Taipei (+08:00). */
export function fmtHM(d) {
  const dt = toDate(d);
  const tpe = new Date(dt.getTime() + 8 * 3600_000);
  return `${String(tpe.getUTCHours()).padStart(2, "0")}:${String(
    tpe.getUTCMinutes()
  ).padStart(2, "0")}`;
}

/** Relative time like「42 分鐘前」/「再 1 小時後」. */
export function fmtRel(d) {
  const dt = toDate(d);
  const diff = dt.getTime() - getNow().getTime();
  const abs = Math.abs(diff);
  const m = Math.round(abs / 60_000);
  const h = Math.round(abs / 3600_000);
  const day = Math.round(abs / 86400_000);
  const pre = diff >= 0 ? "再" : "";
  const suf = diff >= 0 ? "後" : "前";
  if (m < 60) return `${pre}${m} 分鐘${suf}`;
  if (h < 24) return `${pre}${h} 小時${suf}`;
  return `${pre}${day} 天${suf}`;
}
