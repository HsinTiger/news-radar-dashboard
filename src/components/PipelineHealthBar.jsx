// PipelineHealthBar — 5-stage throughput visual for the past 60 min.
//
// Reads pipelineHealth from the hook. Shows harvest → scored → composed →
// queued → published with a connecting chevron bar. The last segment also
// displays "next publish: HH:MM" which is computed purely from the cron
// schedule — never from the DB (see lib/publishCron.js).
//
// Design notes:
//   - Bar widths are equal; the count is the scalar. A "starved" pipeline
//     (e.g. queued=0) is visually signalled with a dimmed segment, not a
//     zero-width bar.
//   - Stage colors reuse the status token palette from tokens.css so the
//     bar reads the same as the StatusPill elsewhere.
//   - "queued" is a snapshot count (not last-hour throughput) — labelled
//     so the difference is obvious.

import { Icon } from "@/components/Icon.jsx";
import { nextPublishLabel, minutesToNextPublish } from "@/lib/publishCron.js";

const STAGES = [
  { key: "harvested", label: "Harvest",   hint: "RSS 抓取",        color: "var(--st-scored)",    icon: "rss" },
  { key: "scored",    label: "Scored",    hint: "weighted_score",   color: "var(--st-drafted)",   icon: "trend_up" },
  { key: "composed",  label: "Composed",  hint: "LLM 寫稿",          color: "var(--st-queued)",    icon: "tag" },
  { key: "queued",    label: "Queued",    hint: "等待發布(當下)",     color: "var(--accent)",        icon: "clock", snapshot: true },
  { key: "published", label: "Published", hint: "成功發上雲",        color: "var(--st-published)", icon: "check" },
];

export function PipelineHealthBar({ pipelineHealth, now = new Date() }) {
  const ph = pipelineHealth || { harvested: 0, scored: 0, composed: 0, queued: 0, published: 0, window_mins: 60 };
  const nextLabel = nextPublishLabel(now);
  const nextInMins = minutesToNextPublish(now);

  return (
    <section className="nr-card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>
          Pipeline 健康
        </h2>
        <span style={{ fontSize: 12, color: "var(--fg-3)" }}>
          過去 {ph.window_mins} 分鐘的吞吐量 · queued 為當下快照
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--fg-2)" }}>
          <Icon name="clock" size={12} stroke="var(--accent)" />
          <span>下個 cron</span>
          <span data-mono style={{ color: "var(--accent)", fontWeight: 600 }}>{nextLabel}</span>
          <span style={{ color: "var(--fg-3)" }}>· 再 {nextInMins} 分鐘</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
        {STAGES.map((s, i) => {
          const n = ph[s.key] ?? 0;
          const dim = n === 0;
          const showArrow = i < STAGES.length - 1;
          return (
            <div key={s.key} style={{ position: "relative" }}>
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 8,
                  background: dim ? "var(--bg-inset)" : "var(--bg-muted)",
                  border: `1px solid ${dim ? "var(--border)" : "color-mix(in oklab, " + s.color + " 25%, var(--border))"}`,
                  opacity: dim ? 0.55 : 1,
                  transition: "opacity 120ms ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--fg-2)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <Icon name={s.icon} size={11} stroke={s.color} />
                  <span>{s.label}</span>
                  {s.snapshot && (
                    <span
                      data-mono
                      style={{
                        marginLeft: "auto",
                        fontSize: 9,
                        color: "var(--fg-3)",
                        textTransform: "none",
                        letterSpacing: 0,
                      }}
                    >
                      NOW
                    </span>
                  )}
                </div>
                <div
                  data-mono
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: dim ? "var(--fg-3)" : "var(--fg)",
                    marginTop: 4,
                    lineHeight: 1.1,
                  }}
                >
                  {n}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--fg-3)", marginTop: 2 }}>{s.hint}</div>
                {/* subtle bottom accent bar */}
                <div
                  style={{
                    marginTop: 8,
                    height: 3,
                    borderRadius: 2,
                    background: dim ? "var(--bg-inset)" : s.color,
                    opacity: dim ? 0.4 : 0.85,
                  }}
                />
              </div>
              {showArrow && (
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    right: -8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--fg-4)",
                    fontSize: 14,
                    lineHeight: 1,
                    zIndex: 1,
                    background: "var(--bg-raised)",
                    padding: "0 2px",
                  }}
                >
                  ›
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
