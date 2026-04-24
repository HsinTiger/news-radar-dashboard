// ArchivePage — 3-col card grid of published posts with per-platform likes.

import { Icon } from "@/components/Icon.jsx";
import { StatusPill, EmergencyBadge } from "@/components/StatusPill.jsx";
import { ScoreChip } from "@/components/ScoreChip.jsx";
import { RelTime } from "@/components/RelTime.jsx";
import { useNewsRadarDB } from "@/hooks/useNewsRadarDB.js";
import { isEmergency } from "@/lib/origin.js";

export function ArchivePage({ openDetail }) {
  const { items: all, topicById } = useNewsRadarDB();
  const items = all.filter((i) => i.status === "published");

  return (
    <div style={{ padding: "20px 28px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["最近 7 天", "上週", "本月"].map((l, i) => (
            <button
              key={l}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: i === 0 ? "var(--fg)" : "var(--bg-raised)",
                color: i === 0 ? "var(--bg)" : "var(--fg-1)",
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--fg-2)" }}>
          共{" "}
          <span data-mono style={{ color: "var(--fg)", fontWeight: 600 }}>
            {items.length}
          </span>{" "}
          篇 · 平均{" "}
          <span data-mono style={{ color: "var(--score-good)", fontWeight: 600 }}>
            0.81
          </span>{" "}
          分
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {items.map((it) => {
          const topic = topicById(it.topic_category);
          const fbLikes = it.engagement?.facebook?.likes || 0;
          const igLikes = it.engagement?.instagram?.likes || 0;
          const thLikes = it.engagement?.threads?.likes || 0;
          const failed = it.publish_log?.some((p) => !p.success);
          return (
            <button
              key={it.id}
              onClick={() => openDetail(it.id)}
              className="nr-card"
              style={{
                textAlign: "left",
                padding: 0,
                overflow: "hidden",
                background: "var(--bg-raised)",
                transition: "transform 120ms, box-shadow 120ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              {/* thumb */}
              <div style={{ aspectRatio: "16 / 9", background: "var(--bg-inset)", position: "relative", overflow: "hidden" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                      "linear-gradient(135deg, color-mix(in oklab, var(--accent) 20%, var(--bg-inset)) 0%, var(--bg-inset) 100%)",
                  }}
                />
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 28 }}>
                  {topic.emoji}
                </div>
                <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
                  <StatusPill kind="published" size="sm" />
                  {isEmergency(it) && <EmergencyBadge size="sm" />}
                  {failed && <StatusPill kind="failed" size="sm" />}
                </div>
                <div style={{ position: "absolute", top: 10, right: 10 }}>
                  <ScoreChip score={it.confidence_score} />
                </div>
              </div>
              {/* body */}
              <div style={{ padding: "14px 14px 12px" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--fg)",
                    lineHeight: 1.4,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    minHeight: 36,
                  }}
                >
                  {it.title}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 10,
                    fontSize: 11,
                    color: "var(--fg-3)",
                  }}
                >
                  <span>
                    <Icon name="rss" size={10} /> {it.feed_name}
                  </span>
                  <span style={{ color: "var(--fg-4)" }}>·</span>
                  <RelTime date={it.publish_at} showAbs={false} />
                </div>
              </div>
              {/* engagement footer */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  borderTop: "1px solid var(--border)",
                  background: "var(--bg-muted)",
                }}
              >
                {[
                  { k: "fb", n: fbLikes, fg: "#1877F2" },
                  { k: "ig", n: igLikes, fg: "#E4405F" },
                  { k: "th", n: thLikes, fg: "var(--fg)" },
                ].map((p, i) => (
                  <div
                    key={p.k}
                    style={{
                      padding: "8px 10px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      borderLeft: i > 0 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <span style={{ color: p.fg }}>
                      <Icon name={p.k} size={12} strokeWidth={1.8} />
                    </span>
                    <Icon name="heart" size={11} stroke="var(--fg-3)" />
                    <span data-mono style={{ fontSize: 12, fontWeight: 600 }}>
                      {p.n}
                    </span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
