// TrendTab — engagement growth curves per platform.
//
// Backend (Phase 8.23, commits 0db9840 / 9b31efa) polls each published post at
// post-age buckets [1h, 24h, 168h] and writes time-series rows to
// engagement_stats with `post_age_bucket` set. dbAdapter exposes those rows
// as `item.engagement_history[platform]`, sorted by bucket ASC.
//
// Layout per platform: two side-by-side charts.
//   - 互動 chart: likes + comments-equivalent + shares-equivalent (platform varies)
//   - 曝光 chart: views + reach (Threads has no reach; line just stays at 0)
//
// Empty state is shown when:
//   1. item is unpublished (no engagement field at all), OR
//   2. published but no bucketed rows yet (next 1h cron will write the first
//      data point — the message tells the user that's expected).

import { Icon } from "@/components/Icon.jsx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

// Canonical buckets must match backend src/engagement.py CANONICAL_BUCKETS.
const BUCKETS = [1, 24, 168];
const BUCKET_LABELS = { 1: "1 小時", 24: "24 小時", 168: "7 天" };

// Per-platform metric mapping. Keep ≤3 lines per chart so the legend stays
// readable. "interactions" lines use scaled colors (good/ok/bad) for visual
// hierarchy; "exposure" uses a calmer two-tone (accent + accent-soft equivalent).
const PLATFORMS = [
  {
    k: "facebook",
    label: "Facebook",
    icon: "fb",
    fg: "#1877F2",
    interactions: [
      { key: "likes",    label: "讚",   color: "var(--score-good)" },
      { key: "comments", label: "留言", color: "var(--score-ok)" },
      { key: "shares",   label: "分享", color: "var(--accent)" },
    ],
    exposure: [
      { key: "views", label: "觀看", color: "var(--score-good)" },
      { key: "reach", label: "觸及", color: "var(--accent)" },
    ],
  },
  {
    k: "instagram",
    label: "Instagram",
    icon: "ig",
    fg: "#E4405F",
    interactions: [
      { key: "likes",    label: "讚",   color: "var(--score-good)" },
      { key: "comments", label: "留言", color: "var(--score-ok)" },
      { key: "saves",    label: "收藏", color: "var(--accent)" },
    ],
    exposure: [
      { key: "views", label: "觀看", color: "var(--score-good)" },
      { key: "reach", label: "觸及", color: "var(--accent)" },
    ],
  },
  {
    k: "threads",
    label: "Threads",
    icon: "th",
    fg: "var(--fg)",
    interactions: [
      { key: "likes",   label: "讚",   color: "var(--score-good)" },
      { key: "replies", label: "回覆", color: "var(--score-ok)" },
      { key: "reposts", label: "轉發", color: "var(--accent)" },
    ],
    // Threads doesn't expose reach in the Meta Graph API; backend writes 0.
    // We still render the line but it'll flatline at 0 — that's the truthful
    // signal that "Threads + reach = no data available".
    exposure: [
      { key: "views", label: "觀看", color: "var(--score-good)" },
    ],
  },
];

// Convert dbAdapter's engagement_history[platform] (array of {post_age_bucket,
// likes, ...}) into the array shape recharts wants:
//   [{ age: "1h", likes: 6, comments: 0, ... }, ...]
// Buckets that haven't been polled yet are absent from the input — we surface
// them as data points with `null` for each metric so recharts doesn't connect
// across the gap.
function shapeForChart(history, lines) {
  const byBucket = new Map();
  for (const row of history || []) byBucket.set(row.post_age_bucket, row);
  return BUCKETS.map((b) => {
    const row = byBucket.get(b);
    const out = { bucket: b, label: BUCKET_LABELS[b] };
    for (const ln of lines) {
      out[ln.key] = row ? (row[ln.key] ?? 0) : null;
    }
    return out;
  });
}

function MiniLineChart({ data, lines, height = 160 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--fg-2)" }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--fg-3)" }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          contentStyle={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--fg-2)", fontSize: 11 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
          iconSize={8}
          iconType="circle"
        />
        {lines.map((ln) => (
          <Line
            key={ln.key}
            type="monotone"
            dataKey={ln.key}
            name={ln.label}
            stroke={ln.color}
            strokeWidth={1.8}
            dot={{ r: 3, fill: ln.color }}
            activeDot={{ r: 4 }}
            connectNulls={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function PlatformSection({ platform, history }) {
  const platHistory = history?.[platform.k];
  const hasAny = Array.isArray(platHistory) && platHistory.length > 0;

  const interactionData = shapeForChart(platHistory, platform.interactions);
  const exposureData = shapeForChart(platHistory, platform.exposure);

  return (
    <section className="nr-card" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ color: platform.fg }}>
          <Icon name={platform.icon} size={18} strokeWidth={1.8} />
        </span>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{platform.label}</h3>
        {hasAny && (
          <span data-mono style={{ fontSize: 11, color: "var(--fg-3)", marginLeft: "auto" }}>
            {platHistory.length}/3 buckets
          </span>
        )}
      </div>

      {hasAny ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "var(--fg-2)", marginBottom: 4 }}>互動</div>
            <MiniLineChart data={interactionData} lines={platform.interactions} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--fg-2)", marginBottom: 4 }}>曝光</div>
            <MiniLineChart data={exposureData} lines={platform.exposure} />
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: "24px 12px",
            textAlign: "center",
            color: "var(--fg-3)",
            fontSize: 12,
            background: "var(--bg-muted)",
            borderRadius: 8,
          }}
        >
          資料收集中（每篇 post 在 1h / 24h / 7d 各 poll 一次）
        </div>
      )}
    </section>
  );
}

export function TrendTab({ item }) {
  // Tab is reachable for any item, but unpublished items have no engagement at
  // all — show the same "no data" message MetricsTab uses so the two tabs feel
  // consistent.
  if (!item.engagement) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--fg-3)", fontSize: 13 }}>
        還未發布，沒有趨勢數據。
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {PLATFORMS.map((p) => (
        <PlatformSection key={p.k} platform={p} history={item.engagement_history} />
      ))}
    </div>
  );
}
