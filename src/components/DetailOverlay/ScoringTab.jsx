// ScoringTab — scoring breakdown + reviewer rationale for the item.

import { useNewsRadarDB } from "@/hooks/useNewsRadarDB.js";

const ROWS = [
  { k: "data_density", label: "數據密度", hint: "具體數字、百分比、金額" },
  { k: "strategic_signal", label: "結構性訊號", hint: "改變產業版圖、商業模式" },
  { k: "news_novelty", label: "首發性", hint: "是不是第一手官方來源" },
  { k: "persona_fit", label: "Persona 貼合度", hint: "符合 News Radar Soul 語氣" },
];

export function ScoringTab({ item }) {
  const { topicById } = useNewsRadarDB();
  const topic = topicById(item.topic_category);
  const b = item.score_breakdown;

  // confidence_score can be NULL for historical rows that predate the scoring
  // pipeline — guard every numeric access.
  const cs = item.confidence_score;
  const hasScore = typeof cs === "number" && Number.isFinite(cs);
  const scoreAccent = !hasScore
    ? "var(--fg-3)"
    : cs >= 0.7
    ? "var(--score-good)"
    : cs >= 0.65
    ? "var(--score-ok)"
    : "var(--score-bad)";
  const scoreSub = !hasScore
    ? "未評分"
    : cs >= 0.7
    ? "AUTO 門檻之上"
    : cs >= 0.65
    ? "RESCUE 門檻之上"
    : "低於門檻";

  return (
    <div>
      {/* overall */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        <MetricBox
          label="confidence_score"
          value={hasScore ? cs.toFixed(2) : "—"}
          sub={scoreSub}
          accent={scoreAccent}
        />
        <MetricBox
          label="topic_weight"
          value={topic.weight.toFixed(2)}
          sub={topic.name}
          accent="var(--accent)"
        />
        <MetricBox
          label="weighted_score"
          value={(item.weighted_score || 0).toFixed(2)}
          sub="排序實際用這個"
          accent="var(--fg)"
        />
      </div>

      <section className="nr-card" style={{ padding: 20, marginBottom: 14 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 600 }}>Score Breakdown</h3>
        {!b || Object.values(b).every((x) => x == null) ? (
          // Historical rows from before the subscore pipeline (pre-8.x) carry
          // no breakdown at all — don't render 0% bars which would misread as
          // "scored zero on everything".
          <div
            style={{
              fontSize: 12,
              color: "var(--fg-3)",
              padding: "10px 0",
              fontStyle: "italic",
            }}
          >
            未計算 · 此 draft 在 sub-score pipeline 上線前建立
          </div>
        ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {ROWS.map((r) => {
            // Coerce defensively in case backend ever stores sub-scores as
            // strings — `Number(null) === 0`, `Number(undefined) === NaN`,
            // `Number("0.85") === 0.85`. Guard NaN → 0.
            const raw = b?.[r.k];
            const n = Number(raw);
            const v = Number.isFinite(n) ? n : 0;
            const hasVal = raw != null && Number.isFinite(n);
            const color = !hasVal
              ? "var(--fg-3)"
              : v >= 0.75 ? "var(--score-good)" : v >= 0.55 ? "var(--score-ok)" : "var(--score-bad)";
            return (
              <div key={r.k}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{r.label}</span>
                  <span style={{ fontSize: 11, color: "var(--fg-3)" }}>{r.hint}</span>
                  <span
                    data-mono
                    style={{
                      marginLeft: "auto",
                      fontSize: 13,
                      fontWeight: 600,
                      color,
                    }}
                  >
                    {hasVal ? v.toFixed(2) : "—"}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "var(--bg-inset)",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${v * 100}%`,
                      height: "100%",
                      background: color,
                      borderRadius: 3,
                      transition: "width 400ms cubic-bezier(.2,.8,.2,1)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        )}
      </section>

      {item.editorial_note && (
        <section className="nr-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: "var(--accent-soft)",
                color: "var(--accent)",
                display: "grid",
                placeItems: "center",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              AI
            </div>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Reviewer 判讀</h3>
            <span data-mono style={{ marginLeft: "auto", fontSize: 10, color: "var(--fg-3)" }}>
              gemini-flash-latest
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.65,
              color: "var(--fg-1)",
              fontFamily: "var(--f-serif)",
            }}
          >
            {item.editorial_note}
          </p>
        </section>
      )}
    </div>
  );
}

function MetricBox({ label, value, sub, accent }) {
  return (
    <div className="nr-card" style={{ padding: "14px 16px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: accent }} />
      <div
        data-mono
        style={{
          fontSize: 10,
          color: "var(--fg-3)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div data-mono style={{ fontSize: 22, fontWeight: 600, color: accent }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 2 }}>{sub}</div>
    </div>
  );
}
