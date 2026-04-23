// MetaTab — raw DB row + publish log for debugging / transparency.

import { Icon } from "@/components/Icon.jsx";
import { useNewsRadarDB } from "@/hooks/useNewsRadarDB.js";
import { fmtHM } from "@/lib/time.js";

export function MetaTab({ item }) {
  const { topicById } = useNewsRadarDB();
  const topic = topicById(item.topic_category);
  const fields = [
    ["news_id", item.id],
    ["feed_name", item.feed_name],
    ["source_type", "article"],
    ["published_at", item.published_at],
    ["fetched_at", item.fetched_at],
    ["language", "zh-TW (composed) · en (source)"],
    ["topic_category", item.topic_category],
    ["topic_weight", topic.weight.toFixed(2)],
    ["status", item.status],
    ["queue_status", item.queue_status || "—"],
    ["publish_at", item.publish_at || "—"],
  ];

  return (
    <div>
      <section className="nr-card" style={{ padding: 18, marginBottom: 14 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600 }}>Database row</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <tbody>
            {fields.map(([k, v]) => (
              <tr key={k} style={{ borderBottom: "1px solid var(--border)" }}>
                <td data-mono style={{ padding: "7px 0", color: "var(--fg-3)", width: 160 }}>
                  {k}
                </td>
                <td data-mono style={{ padding: "7px 0", color: "var(--fg)", wordBreak: "break-all" }}>
                  {v}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {item.publish_log && (
        <section className="nr-card" style={{ padding: 18 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600 }}>Publish log</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {item.publish_log.map((l, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  background: l.success ? "var(--st-published-bg)" : "var(--st-error-bg)",
                  borderRadius: 8,
                }}
              >
                <Icon
                  name={l.success ? "check" : "x"}
                  size={14}
                  stroke={l.success ? "var(--st-published)" : "var(--st-error)"}
                  strokeWidth={2.2}
                />
                <span
                  style={{ fontSize: 13, fontWeight: 500, textTransform: "capitalize", width: 80 }}
                >
                  {l.platform}
                </span>
                <span data-mono style={{ fontSize: 11, color: "var(--fg-2)" }}>
                  {fmtHM(l.posted_at)}
                </span>
                <span
                  data-mono
                  style={{ fontSize: 11, color: "var(--fg-3)", marginLeft: "auto" }}
                >
                  {l.success ? l.platform_post_id || "ok" : l.error_message}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
