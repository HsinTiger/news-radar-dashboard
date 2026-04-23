// DroppedPage — what scorer rejected and why. Read-only, no actions.

import { useState } from "react";
import { Icon } from "@/components/Icon.jsx";
import { ScoreChip } from "@/components/ScoreChip.jsx";
import { RelTime } from "@/components/RelTime.jsx";
import { DropBreakdown } from "@/components/DropBreakdown.jsx";
import { useNewsRadarDB } from "@/hooks/useNewsRadarDB.js";

const REASON_MAP = {
  score_too_low:       { label: "分數不夠",   fg: "var(--st-error)" },
  topic_downweighted:  { label: "主題被降權", fg: "var(--st-queued)" },
  duplicate:           { label: "重複新聞",   fg: "var(--st-scored)" },
  pure_feature_update: { label: "純功能更新", fg: "var(--fg-2)" },
};

export function DroppedPage() {
  const { items: all, topicById, dropBreakdown } = useNewsRadarDB();
  const items = all.filter((i) => i.status === "dropped");
  const [activeReason, setActiveReason] = useState("all");
  const filtered =
    activeReason === "all" ? items : items.filter((i) => i.drop_reason === activeReason);

  const byReason = {};
  items.forEach((i) => {
    byReason[i.drop_reason] = (byReason[i.drop_reason] || 0) + 1;
  });

  return (
    <div style={{ padding: "20px 28px 40px" }}>
      {/* Phase 1C: Drop reason stacked breakdown */}
      <DropBreakdown dropBreakdown={dropBreakdown} />

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => setActiveReason("all")} style={pillStyle(activeReason === "all")}>
          全部{" "}
          <span data-mono style={{ opacity: 0.7, marginLeft: 4 }}>
            {items.length}
          </span>
        </button>
        {Object.entries(byReason).map(([r, n]) => (
          <button key={r} onClick={() => setActiveReason(r)} style={pillStyle(activeReason === r)}>
            <span
              className="nr-dot"
              style={{ background: REASON_MAP[r]?.fg || "var(--fg-3)", width: 6, height: 6, marginRight: 6 }}
            />
            {REASON_MAP[r]?.label || r}
            <span data-mono style={{ opacity: 0.7, marginLeft: 4 }}>
              {n}
            </span>
          </button>
        ))}
      </div>

      <div
        className="nr-card"
        style={{
          padding: "14px 18px",
          marginBottom: 14,
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          background: "color-mix(in oklab, var(--accent-soft) 50%, var(--bg-raised))",
          borderColor: "color-mix(in oklab, var(--accent) 15%, var(--border))",
        }}
      >
        <Icon name="info" size={16} stroke="var(--accent)" />
        <div style={{ fontSize: 12.5, color: "var(--fg-1)", lineHeight: 1.55 }}>
          這頁列的是 scorer 判定 <strong>不值得發</strong>{" "}
          的新聞。有時分數臨界、主題被低估，Alex 可以自己點原文判斷要不要截圖手動發。
          <strong>Dashboard 不會改動這裡的資料</strong>——一切還是自動化系統決定。
        </div>
      </div>

      <div className="nr-card" style={{ overflow: "hidden" }}>
        {filtered.map((it, idx) => {
          const rm = REASON_MAP[it.drop_reason] || { label: it.drop_reason, fg: "var(--fg-3)" };
          const topic = topicById(it.topic_category);
          return (
            <div
              key={it.id}
              style={{
                padding: "16px 18px",
                borderBottom: idx === filtered.length - 1 ? "none" : "1px solid var(--border)",
                display: "grid",
                gridTemplateColumns: "1fr 150px 130px 100px 32px",
                gap: 16,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--fg-1)", lineHeight: 1.4 }}>
                  {it.title}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--fg-3)", marginTop: 4, lineHeight: 1.5, maxWidth: 620 }}>
                  {it.drop_detail}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 8,
                    fontSize: 11,
                    color: "var(--fg-3)",
                  }}
                >
                  <span>
                    <Icon name="rss" size={10} /> {it.feed_name}
                  </span>
                  <span>·</span>
                  <RelTime date={it.published_at} showAbs={false} />
                  <span>·</span>
                  <span>
                    {topic.emoji}{" "}
                    <span data-mono style={{ color: "var(--fg-2)" }}>
                      {it.topic_category}
                    </span>
                  </span>
                </div>
              </div>
              <div>
                <span
                  className="nr-chip"
                  style={{
                    background: "color-mix(in oklab," + rm.fg + " 10%, transparent)",
                    color: rm.fg,
                    borderColor: "color-mix(in oklab," + rm.fg + " 20%, var(--border))",
                  }}
                >
                  <span className="nr-dot" style={{ background: rm.fg, width: 6, height: 6 }} />
                  {rm.label}
                </span>
              </div>
              <div>
                <ScoreChip score={it.confidence_score} weighted={it.weighted_score} />
              </div>
              <div style={{ fontSize: 12, color: "var(--fg-2)" }}>
                <RelTime date={it.published_at} showAbs={false} />
              </div>
              <a
                href={it.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  display: "grid",
                  placeItems: "center",
                  color: "var(--fg-2)",
                }}
                className="nr-hover"
                title="打開原始新聞"
              >
                <Icon name="external" size={14} />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function pillStyle(active) {
  return {
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 999,
    border: "1px solid " + (active ? "var(--fg)" : "var(--border)"),
    background: active ? "var(--fg)" : "var(--bg-raised)",
    color: active ? "var(--bg)" : "var(--fg-1)",
    display: "inline-flex",
    alignItems: "center",
  };
}
