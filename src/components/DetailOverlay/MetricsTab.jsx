// MetricsTab — per-platform engagement counters for a published item.

import { Icon } from "@/components/Icon.jsx";

// Per-platform metric tuples: [engagement_object_key, display_label, icon_name].
// Native column names match engagement_stats post-fix (2026-04-25):
//   - FB:      likes / comments / shares / views / reach (post_impressions_unique)
//   - IG:      likes / comments / saves / views / reach (insights metric=reach)
//   - Threads: likes / replies / reposts / quotes / views (no comments/shares/reach)
//
// Pre-fix rows (Threads only) had reply counts misaliased into `comments` and
// reposts+quotes summed into `shares`. `dbAdapter.js` takes the LATEST row per
// (draft, platform), so once a Threads post gets a fresh poll the dashboard
// auto-corrects without any code change here.
const PLATS = [
  {
    k: "facebook",
    label: "Facebook",
    icon: "fb",
    fg: "#1877F2",
    metrics: [
      ["likes", "讚", "heart"],
      ["comments", "留言", "comment"],
      ["shares", "分享", "share"],
      ["reach", "觸及", "views"],
      ["views", "觀看", "views"],
    ],
  },
  {
    k: "instagram",
    label: "Instagram",
    icon: "ig",
    fg: "#E4405F",
    metrics: [
      ["likes", "讚", "heart"],
      ["comments", "留言", "comment"],
      ["saves", "收藏", "save"],
      ["reach", "觸及", "views"],
      ["views", "觀看", "views"],
    ],
  },
  {
    k: "threads",
    label: "Threads",
    icon: "th",
    fg: "var(--fg)",
    metrics: [
      ["likes", "讚", "heart"],
      ["replies", "回覆", "comment"],
      ["reposts", "轉發", "share"],
      ["quotes", "引用", "comment"],
      ["views", "觀看", "views"],
    ],
  },
];

export function MetricsTab({ item }) {
  if (!item.engagement) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--fg-3)", fontSize: 13 }}>
        還未發布，沒有互動數據。
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {PLATS.map((p) => {
        const e = item.engagement[p.k] || {};
        return (
          <section key={p.k} className="nr-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ color: p.fg }}>
                <Icon name={p.icon} size={18} strokeWidth={1.8} />
              </span>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{p.label}</h3>
              <span
                data-mono
                style={{ fontSize: 11, color: "var(--fg-3)", marginLeft: "auto" }}
              >
                post_id:{" "}
                {item.publish_log?.find((l) => l.platform === p.k)?.platform_post_id || "—"}
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${p.metrics.length}, 1fr)`,
                gap: 10,
              }}
            >
              {p.metrics.map(([k, label, icon]) => (
                <div
                  key={k}
                  style={{ padding: "10px 12px", background: "var(--bg-muted)", borderRadius: 8 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                    <Icon name={icon} size={12} stroke="var(--fg-3)" />
                    <span style={{ fontSize: 11, color: "var(--fg-2)" }}>{label}</span>
                  </div>
                  <div data-mono style={{ fontSize: 18, fontWeight: 600, color: "var(--fg)" }}>
                    {(e[k] || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
