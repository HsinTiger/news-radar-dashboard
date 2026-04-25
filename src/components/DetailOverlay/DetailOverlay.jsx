// DetailOverlay — right-side slide-in panel showing a single item across 4 tabs.
// Opened from any list page via `openDetail(id)`; closes on Escape or scrim click.

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon.jsx";
import { StatusPill } from "@/components/StatusPill.jsx";
import { ScoreChip } from "@/components/ScoreChip.jsx";
import { RelTime } from "@/components/RelTime.jsx";
import { useNewsRadarDB, useItem } from "@/hooks/useNewsRadarDB.js";
import { PostTab } from "./PostTab.jsx";
import { ScoringTab } from "./ScoringTab.jsx";
import { MetricsTab } from "./MetricsTab.jsx";
import { TrendTab } from "./TrendTab.jsx";
import { MetaTab } from "./MetaTab.jsx";

const TABS = [
  ["post", "貼文預覽"],
  ["scoring", "Scorer 判斷"],
  ["metrics", "互動數據"],
  ["trend", "趨勢"],
  ["meta", "原始 Meta"],
];

export function DetailOverlay({ itemId, onClose }) {
  const [tab, setTab] = useState("post");
  const { topicById } = useNewsRadarDB();
  const item = useItem(itemId);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!item) return null;

  const topic = topicById(item.topic_category);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "color-mix(in oklab, var(--fg) 30%, transparent)",
        backdropFilter: "blur(3px)",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 820,
          maxWidth: "100vw",
          height: "100%",
          background: "var(--bg)",
          borderLeft: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-20px 0 48px rgba(20,20,24,0.12)",
          animation: "slideIn 180ms ease-out",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 28px 0", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <StatusPill kind={item.queue_status || item.status} />
            <span className="nr-chip">
              {topic.emoji} {topic.name}
            </span>
            <ScoreChip score={item.confidence_score} weighted={item.weighted_score} />
            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "6px 10px",
                  fontSize: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--fg-1)",
                  borderRadius: 6,
                }}
                className="nr-hover"
              >
                <Icon name="external" size={13} /> 原始新聞
              </a>
              <button
                onClick={onClose}
                style={{
                  width: 32,
                  height: 32,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 6,
                  color: "var(--fg-2)",
                  background: "transparent",
                }}
                className="nr-hover"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          </div>
          <h1
            style={{
              margin: "0 0 10px",
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.3,
            }}
          >
            {item.title}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 12,
              color: "var(--fg-2)",
              paddingBottom: 14,
            }}
          >
            <Icon name="rss" size={12} /> {item.feed_name}
            <span>·</span>
            <RelTime date={item.published_at} />
            <span>·</span>
            <span data-mono style={{ fontSize: 11, color: "var(--fg-3)" }}>
              id: {item.id}
            </span>
          </div>

          {/* tabs */}
          <div style={{ display: "flex", gap: 2 }}>
            {TABS.map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                style={{
                  padding: "10px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: tab === k ? "var(--fg)" : "var(--fg-2)",
                  borderBottom: `2px solid ${tab === k ? "var(--fg)" : "transparent"}`,
                  marginBottom: -1,
                  background: "transparent",
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 28px 28px" }}>
          {tab === "post" && <PostTab item={item} />}
          {tab === "scoring" && <ScoringTab item={item} />}
          {tab === "metrics" && <MetricsTab item={item} />}
          {tab === "trend" && <TrendTab item={item} />}
          {tab === "meta" && <MetaTab item={item} />}
        </div>
      </div>
    </div>
  );
}
