// PostTab — phone-ish preview of the composed post per platform + char counter.

import { useState } from "react";
import { Icon } from "@/components/Icon.jsx";
import { RelTime } from "@/components/RelTime.jsx";

const PLATS = [
  { k: "facebook", label: "Facebook", icon: "fb", fg: "#1877F2", limit: 1000 },
  { k: "instagram", label: "Instagram", icon: "ig", fg: "#E4405F", limit: 2000 },
  { k: "threads", label: "Threads", icon: "th", fg: "var(--fg)", limit: 500 },
];

export function PostTab({ item }) {
  const [platform, setPlatform] = useState("facebook");

  if (!item.full_texts) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--fg-3)", fontSize: 13 }}>
        <Icon name="clock" size={20} stroke="var(--fg-3)" />
        <div style={{ marginTop: 10 }}>
          這篇還在佇列中，composer 產出的文本會在發布時一併顯示。
        </div>
      </div>
    );
  }

  const cur = PLATS.find((p) => p.k === platform);
  const text = item.full_texts[platform] || "";
  const count = Array.from(text).length;

  return (
    <div>
      {/* platform switcher */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {PLATS.map((p) => {
          const active = p.k === platform;
          const pLog = item.publish_log?.find((x) => x.platform === p.k);
          return (
            <button
              key={p.k}
              onClick={() => setPlatform(p.k)}
              style={{
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 500,
                borderRadius: 8,
                border: "1px solid " + (active ? p.fg : "var(--border)"),
                background: active
                  ? "color-mix(in oklab, " + p.fg + " 8%, var(--bg-raised))"
                  : "var(--bg-raised)",
                color: active ? p.fg : "var(--fg-1)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Icon name={p.icon} size={14} strokeWidth={active ? 2 : 1.6} />
              {p.label}
              {pLog &&
                (pLog.success ? (
                  <span
                    className="nr-dot"
                    style={{ background: "var(--st-published)", width: 6, height: 6 }}
                  />
                ) : (
                  <span
                    className="nr-dot"
                    style={{ background: "var(--st-error)", width: 6, height: 6 }}
                  />
                ))}
            </button>
          );
        })}
      </div>

      {/* phone-ish preview */}
      <div style={{ background: "var(--bg-muted)", borderRadius: 12, padding: 24 }}>
        <div
          style={{
            maxWidth: 520,
            margin: "0 auto",
            background: "var(--bg-raised)",
            borderRadius: 12,
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          {/* mock post header */}
          <div
            style={{
              padding: "14px 16px 10px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(140deg, var(--accent) 0%, #8879EC 100%)",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              📡
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>News Radar</div>
              <div style={{ fontSize: 11, color: "var(--fg-3)" }} data-mono>
                <RelTime date={item.publish_at} showAbs={false} /> ·{" "}
                <span style={{ color: cur.fg }}>{cur.label}</span>
              </div>
            </div>
          </div>
          {/* image */}
          {item.image_url && (
            <div
              style={{
                aspectRatio: platform === "instagram" ? "1 / 1" : "1.91 / 1",
                background: "var(--bg-inset)",
                backgroundImage:
                  "linear-gradient(135deg, color-mix(in oklab, var(--accent) 25%, var(--bg-inset)), var(--bg-inset))",
                display: "grid",
                placeItems: "center",
                fontSize: 36,
              }}
            >
              🧬
            </div>
          )}
          {/* body */}
          <div
            style={{
              padding: "14px 16px 16px",
              fontSize: 13.5,
              lineHeight: 1.72,
              whiteSpace: "pre-wrap",
              fontFamily: "var(--f-serif)",
              color: "var(--fg)",
            }}
          >
            {text}
          </div>
        </div>
      </div>

      {/* char counter */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          color: "var(--fg-2)",
        }}
      >
        <span>字元數</span>
        <span data-mono>
          <span style={{ color: count > cur.limit ? "var(--st-error)" : "var(--fg)", fontWeight: 600 }}>
            {count}
          </span>
          <span style={{ color: "var(--fg-3)" }}> / {cur.limit}</span>
        </span>
      </div>
    </div>
  );
}
