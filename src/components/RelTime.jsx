// RelTime — prints both「42 分鐘前」and mono `14:30`. The reference "now"
// comes from src/lib/time.js; set via setNow() when wiring to live data.

import { fmtRel, fmtHM } from "@/lib/time.js";

export function RelTime({ date, showAbs = true }) {
  if (!date) return <span style={{ color: "var(--fg-3)" }}>—</span>;
  return (
    <span style={{ whiteSpace: "nowrap" }}>
      <span style={{ color: "var(--fg-1)" }}>{fmtRel(date)}</span>
      {showAbs && (
        <span
          data-mono
          style={{ color: "var(--fg-3)", marginLeft: 6, fontSize: "0.92em" }}
        >
          · {fmtHM(date)}
        </span>
      )}
    </span>
  );
}
