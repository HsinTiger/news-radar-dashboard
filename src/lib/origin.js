// origin.js — unified helper for distinguishing emergency-manual publishes
// from regular harvester-driven pipeline publishes.
//
// Source of truth: news_items.feed_name. Emergency oneshot (tools/emergency_oneshot.py
// in the backend repo) writes `feed_name='emergency_manual'` when the operator
// manually kicks off a publish that bypasses the harvester white-list.
//
// This helper lives here (not inlined) so every page uses the same rule —
// change the rule in one place if the backend adds more origin variants later
// (e.g. `emergency_pdf`, `emergency_note`).

export function isEmergency(item) {
  if (!item) return false;
  if (item.origin === "emergency") return true;
  const fn = (item.feed_name || "").toLowerCase();
  return fn.startsWith("emergency");
}

// originOf returns a canonical string. Useful when displaying mixed state
// (e.g. tooltip text "來源：手動發布 / 自動 pipeline").
export function originOf(item) {
  return isEmergency(item) ? "emergency" : "pipeline";
}
