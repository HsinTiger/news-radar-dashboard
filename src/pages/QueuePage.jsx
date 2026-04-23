// QueuePage — ranked next-N list (Phase 2 c) at the top, then a filterable
// table of all drafts below (queued / published / failed).
//
// The "next-N" rank is the *freshness-first* queue — it mirrors the backend
// picker (`pick_freshest_queued`) so Alex can see at a glance which draft
// the next cron will grab. See QueueRankCard.jsx for the contract link.

import { useState } from "react";
import { Icon } from "@/components/Icon.jsx";
import { StatusPill } from "@/components/StatusPill.jsx";
import { ScoreChip } from "@/components/ScoreChip.jsx";
import { PlatformBadges } from "@/components/PlatformBadges.jsx";
import { ImageStatusChip } from "@/components/ImageStatusChip.jsx";
import { QueueRankCard } from "@/components/QueueRankCard.jsx";
import { useNewsRadarDB } from "@/hooks/useNewsRadarDB.js";
import { fmtHM, fmtRel } from "@/lib/time.js";

export function QueuePage({ openDetail }) {
  const { items: all, system, now, updatedAt, topicById } = useNewsRadarDB();
  const [statusFilter, setStatusFilter] = useState("all");
  const items = all.filter((i) => i.status !== "dropped");

  const tabs = [
    { k: "all",       label: "全部",  count: items.length },
    { k: "queued",    label: "待發布", count: items.filter((i) => i.queue_status === "queued").length },
    { k: "published", label: "已發布", count: items.filter((i) => i.queue_status === "published").length },
    { k: "failed",    label: "失敗",  count: items.filter((i) => i.queue_status === "failed").length },
  ];

  const filtered = statusFilter === "all" ? items : items.filter((i) => i.queue_status === statusFilter);

  return (
    <div style={{ padding: "20px 28px 40px" }}>
      {/* Phase 2 (c): freshness-first ranked next-N list */}
      <QueueRankCard
        items={items}
        system={system}
        now={now}
        updatedAt={updatedAt}
        topicById={topicById}
        openDetail={openDetail}
        limit={8}
        onShowAll={() =>
          document
            .getElementById("queue-full-table")
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      />

      {/* filter bar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "inline-flex", padding: 2, background: "var(--bg-muted)", borderRadius: 8 }}>
          {tabs.map((t) => (
            <button
              key={t.k}
              onClick={() => setStatusFilter(t.k)}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 6,
                background: statusFilter === t.k ? "var(--bg-raised)" : "transparent",
                color: statusFilter === t.k ? "var(--fg)" : "var(--fg-2)",
                boxShadow: statusFilter === t.k ? "var(--shadow-sm)" : "none",
              }}
            >
              {t.label}{" "}
              <span data-mono style={{ opacity: 0.7, marginLeft: 4, fontSize: 11 }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <FilterChip icon="tag" label="所有主題" />
          <FilterChip icon="filter" label="分數 ≥ 0.65" />
          <FilterChip icon="clock" label="最近 24 小時" />
        </div>
      </div>

      {/* table */}
      <div id="queue-full-table" className="nr-card" style={{ overflow: "hidden", scrollMarginTop: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "110px 1fr 90px 140px 90px 160px 100px",
            padding: "10px 16px",
            background: "var(--bg-muted)",
            borderBottom: "1px solid var(--border)",
            fontSize: 11,
            fontWeight: 600,
            color: "var(--fg-2)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            alignItems: "center",
          }}
        >
          <div>狀態</div>
          <div>標題</div>
          <div>分數</div>
          <div>主題</div>
          <div>圖片</div>
          <div>新聞發布時間</div>
          <div>平台</div>
        </div>
        {filtered.map((it) => {
          const topic = topicById(it.topic_category);
          return (
            <button
              key={it.id}
              onClick={() => openDetail(it.id)}
              style={{
                width: "100%",
                textAlign: "left",
                display: "grid",
                gridTemplateColumns: "110px 1fr 90px 140px 90px 160px 100px",
                padding: "14px 16px",
                borderBottom: "1px solid var(--border)",
                alignItems: "center",
                background: "transparent",
              }}
              className="nr-hover"
            >
              <div>
                <StatusPill kind={it.queue_status || it.status} size="sm" />
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)", paddingRight: 16, lineHeight: 1.4 }}>
                {it.title}
                <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 3, fontWeight: 400 }}>
                  <Icon name="rss" size={10} /> {it.feed_name}
                </div>
              </div>
              <div>
                <ScoreChip score={it.confidence_score} />
              </div>
              <div style={{ fontSize: 12, color: "var(--fg-1)" }}>
                {topic.emoji}{" "}
                <span data-mono style={{ color: "var(--fg-2)" }}>
                  {it.topic_category}
                </span>
              </div>
              <div>
                <ImageStatusChip kind={it.image_status || "ok"} />
              </div>
              {/* news_items.published_at — this is what the picker orders by.
                  Seeing it = predicting rank. Never show drafts.publish_at
                  here; that's an enqueue timestamp with zero operational
                  meaning under the Phase 8.18 freshness-first contract. */}
              <div style={{ fontSize: 12 }}>
                <span data-mono style={{ color: "var(--fg-1)", fontWeight: 500 }}>
                  {fmtHM(it.published_at)}
                </span>
                <span style={{ color: "var(--fg-3)", marginLeft: 4 }}>
                  · {fmtRel(it.published_at)}
                </span>
              </div>
              <div>
                <PlatformBadges platforms={it.platforms} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({ icon, label }) {
  return (
    <button
      className="nr-hover"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        fontSize: 12,
        border: "1px solid var(--border)",
        borderRadius: 6,
        color: "var(--fg-1)",
        background: "var(--bg-raised)",
      }}
    >
      <Icon name={icon} size={13} stroke="var(--fg-2)" />
      {label}
      <Icon name="chevron_d" size={12} stroke="var(--fg-3)" />
    </button>
  );
}
