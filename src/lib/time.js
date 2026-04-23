// Time helpers — v1 uses a fixed NOW that matches the mock data so the dashboard
// always shows a stable, reviewable state. When wired to sql.js, we'll swap NOW
// to `new Date()` at the module boundary.
//
// All absolute-time displays are Taipei (+08:00) since that's Hsin's operational
// timezone. All `date` inputs accept Date or ISO string.

export const NOW_MOCK = new Date("2026-04-23T06:30:00Z"); // 14:30 Taipei

let _now = NOW_MOCK;

/** Allow callers (tests, live mode) to override the reference "now". */
export function setNow(d) {
  _now = typeof d === "string" ? new Date(d) : d;
}

export function getNow() {
  return _now;
}

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
  const diff = dt.getTime() - _now.getTime();
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
