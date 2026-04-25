// RelTime — prints both「42 分鐘前」and mono `14:30`. The reference "now"
// comes from src/lib/time.js (live mode → fresh `new Date()` each render;
// mock mode → frozen NOW_MOCK).
//
// The 60-second ticker forces re-render so "N 分鐘前" stays current as wall-
// clock advances. In mock mode the tick is harmless — fmtRel reads a frozen
// NOW so output is identical between ticks.

import { useEffect, useState } from "react";
import { fmtRel, fmtHM } from "@/lib/time.js";

export function RelTime({ date, showAbs = true }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

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
