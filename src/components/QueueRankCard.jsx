// QueueRankCard — ranked next-N list for the Queue page (and reused on Home's
// "接下來的 queue" section).
//
// Backend contract (Phase 8.18 freshness-first):
//   picker = `pick_freshest_queued` at db.py:502
//     WHERE queue_status = 'queued' AND status IN ('approved', 'auto_approved')
//     ORDER BY news_items.published_at DESC  ← this is the ranking key
//   fallback = `pick_fallback_any_approved` at db.py:527, triggered when
//     elapsed_since_last_publish >= MAX_INTERVAL_SECONDS (7200s = 2h) AND
//     `pick_freshest_queued` returns None (no queued-and-approved drafts).
//     Fallback ORDER BY weighted_score DESC, published_at DESC, and WHERE
//     only requires status='approved' (so `queue_status='stale'` drafts are
//     eligible too — this is why the fallback copy flags "含 stale draft").
//
// The card is deliberately NOT a schedule. It's a rank. Each row's time
// column shows the NEWS publication time (n.published_at) because that's
// literally the picker's ORDER BY key — seeing it lets Alex predict which
// item will fly next cron.
//
// The cron tick time is an ADVISORY label (from publishCron.js) — it says
// "when the publisher will next wake up and pick", nothing more. It is
// never wired to any specific draft.

import { useMemo } from "react";
import { Icon } from "@/components/Icon.jsx";
import { ScoreChip } from "@/components/ScoreChip.jsx";
import { PlatformBadges } from "@/components/PlatformBadges.jsx";
import { RelTime } from "@/components/RelTime.jsx";
import { fmtHM } from "@/lib/time.js";
import { nextPublishLabel, minutesToNextPublish } from "@/lib/publishCron.js";

// Matches backend MAX_INTERVAL_SECONDS in run_publish_queue.py:48 (7200s / 2h).
// If elapsed crosses this and queue is empty of queued-approved drafts, the
// publisher flips to pick_fallback_any_approved.
const FALLBACK_ELAPSED_MIN = 120;

// Match backend `pick_freshest_queued` WHERE clause exactly.
function isPickable(it) {
  return (
    it.queue_status === "queued" &&
    (it.status === "approved" || it.status === "auto_approved")
  );
}

// Stale indicator: if the snapshot hasn't refreshed for this long, warn.
// 2× the poll interval (10 min) is the practical "something is wrong" floor.
const STALE_SNAPSHOT_MIN = 10;

export function QueueRankCard({
  items,
  system,
  now = new Date(),
  updatedAt = null,
  topicById,
  openDetail,
  limit = 8,
  onRowClick,
  onShowAll,
}) {
  // Sort key is news_items.published_at DESC — this is the *exact* ordering
  // the backend picker uses. Don't reach for confidence_score / weighted_score
  // here; that's a fallback-only concern.
  const ranked = useMemo(() => {
    return items
      .filter(isPickable)
      .slice()
      .sort((a, b) => {
        const ta = a.published_at ? new Date(a.published_at).getTime() : 0;
        const tb = b.published_at ? new Date(b.published_at).getTime() : 0;
        return tb - ta;
      });
  }, [items]);

  const top = ranked.slice(0, limit);
  const hidden = Math.max(0, ranked.length - top.length);

  // Advisory-badge state machine — mirrors the backend picker's 3 real cases:
  //
  //   normal        ranked.length > 0              → pick_freshest_queued wins
  //   empty-interim ranked.length === 0            → compose 已見底，但 cadence
  //                 AND elapsed < 120min             還沒到 fallback 門檻。
  //                                                  publisher 這一輪會 skip publish。
  //   fallback      ranked.length === 0            → publisher 會降格呼叫
  //                 AND elapsed >= 120min            pick_fallback_any_approved
  //
  // Backend source: run_publish_queue.py `_decide_cadence` + `_pick_draft`.
  // Keep these branches mutually exclusive — fallbackMode is a strict subset
  // of "queue empty", not a separate dimension.
  const elapsedMin = system?.last_publish_at
    ? Math.floor((now.getTime() - new Date(system.last_publish_at).getTime()) / 60000)
    : null;
  const queueEmpty = ranked.length === 0;
  const fallbackMode =
    queueEmpty && elapsedMin != null && elapsedMin >= FALLBACK_ELAPSED_MIN;
  const emptyInterim = queueEmpty && !fallbackMode;

  const cronLabel = nextPublishLabel(now);
  const cronInMin = minutesToNextPublish(now);

  // Snapshot freshness — only render "stale" when we actually have an
  // updatedAt (live mode). Mock mode passes MOCK_NOW, which is frozen but
  // "fresh" relative to itself.
  const updatedAtDate = updatedAt ? new Date(updatedAt) : null;
  const snapshotAgeMin = updatedAtDate
    ? Math.floor((now.getTime() - updatedAtDate.getTime()) / 60000)
    : 0;
  const snapshotStale = snapshotAgeMin >= STALE_SNAPSHOT_MIN;

  return (
    <section className="nr-card" style={{ padding: 20, marginBottom: 16 }}>
      {/* Header — 2-tier: big title + tooltip-ish subtitle */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>
          接下來的 queue · 按新鮮度排序
        </h2>
        <span data-mono style={{ fontSize: 11, color: "var(--fg-3)" }}>
          {ranked.length} 篇
          {hidden > 0 && <> · 顯示前 {top.length}</>}
        </span>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "var(--fg-2)",
          }}
        >
          <Icon name="clock" size={12} stroke="var(--accent)" />
          <span>下個 cron</span>
          <span data-mono style={{ color: "var(--accent)", fontWeight: 600 }}>
            {cronLabel}
          </span>
          <span style={{ color: "var(--fg-3)" }}>· 再 {cronInMin} 分鐘</span>
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: "var(--fg-3)", marginBottom: 14 }}>
        下個 cron 從第 1 名撿,queue 隨新聞進來重排
      </div>

      {/* Advisory badge — 3-way on the (queueEmpty, elapsed) state machine */}
      {fallbackMode && (
        <div
          role="alert"
          style={{
            padding: "10px 12px",
            marginBottom: 14,
            borderRadius: 8,
            background: "color-mix(in oklab, var(--st-error) 10%, var(--bg-muted))",
            border: "1px solid color-mix(in oklab, var(--st-error) 30%, var(--border))",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            fontSize: 12,
            color: "var(--fg-1)",
            lineHeight: 1.5,
          }}
        >
          <Icon name="alert" size={14} stroke="var(--st-error)" />
          <div>
            <strong style={{ color: "var(--st-error)" }}>
              ⚠️ 已 {elapsedMin} 分鐘未發 (≥ 2h)
            </strong>{" "}
            · 下個 cron 走 fallback:挑 weighted_score 最高的 approved
            <span style={{ color: "var(--fg-3)" }}>(含已過期的 draft)</span>
          </div>
        </div>
      )}
      {emptyInterim && (
        <div
          style={{
            padding: "10px 12px",
            marginBottom: 14,
            borderRadius: 8,
            background: "color-mix(in oklab, var(--st-queued) 10%, var(--bg-muted))",
            border: "1px solid color-mix(in oklab, var(--st-queued) 25%, var(--border))",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            fontSize: 12,
            color: "var(--fg-1)",
            lineHeight: 1.5,
          }}
        >
          <Icon name="clock" size={14} stroke="var(--st-queued)" />
          <div>
            <span style={{ color: "var(--st-queued)", fontWeight: 600 }}>
              queue 暫時見底
            </span>
            <span> · 下一輪 compose 後會有新 draft</span>
            {elapsedMin != null && (
              <span style={{ color: "var(--fg-3)" }} data-mono>
                {" "}
                · 距上次發文 {elapsedMin} 分 · fallback 於 {FALLBACK_ELAPSED_MIN} 分觸發
              </span>
            )}
          </div>
        </div>
      )}
      {!queueEmpty && (
        <div
          style={{
            padding: "8px 12px",
            marginBottom: 14,
            borderRadius: 8,
            background: "var(--bg-muted)",
            display: "flex",
            gap: 8,
            alignItems: "center",
            fontSize: 11.5,
            color: "var(--fg-2)",
          }}
        >
          <Icon name="info" size={12} stroke="var(--fg-3)" />
          <span>下個 cron 挑新鮮度最高的</span>
        </div>
      )}

      {/* Ranked list */}
      {top.length === 0 ? (
        <div
          style={{
            padding: 20,
            textAlign: "center",
            fontSize: 12,
            color: "var(--fg-3)",
            background: "var(--bg-muted)",
            borderRadius: 8,
          }}
        >
          目前沒有 queued 且已審核的 draft
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {top.map((it, idx) => {
            const topic = topicById ? topicById(it.topic_category) : { emoji: "", name: it.topic_category };
            const rank = idx + 1;
            const isTop = rank === 1;
            return (
              <button
                key={it.id}
                onClick={() => (onRowClick || openDetail)?.(it.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "grid",
                  gridTemplateColumns: "32px 1fr 150px 90px 110px",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: isTop
                    ? "color-mix(in oklab, var(--accent-soft) 70%, var(--bg-muted))"
                    : "var(--bg-muted)",
                  border: isTop
                    ? "1px solid color-mix(in oklab, var(--accent) 25%, var(--border))"
                    : "1px solid transparent",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                className="nr-hover"
                title={isTop ? "下個 cron 會挑這一篇" : `第 ${rank} 名`}
              >
                {/* rank badge */}
                <div
                  data-mono
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isTop ? "var(--accent)" : "var(--fg-3)",
                    textAlign: "center",
                  }}
                >
                  #{rank}
                </div>

                {/* title + feed */}
                <div style={{ minWidth: 0 }}>
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
                    }}
                  >
                    {it.title}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--fg-3)",
                      marginTop: 3,
                      display: "flex",
                      gap: 6,
                      alignItems: "center",
                    }}
                  >
                    <Icon name="rss" size={10} /> {it.feed_name}
                    <span style={{ color: "var(--fg-4)" }}>·</span>
                    <span>
                      {topic.emoji}{" "}
                      <span data-mono style={{ color: "var(--fg-2)" }}>
                        {it.topic_category}
                      </span>
                    </span>
                  </div>
                </div>

                {/* news published_at — the picker's ORDER BY key */}
                <div style={{ fontSize: 12, color: "var(--fg-1)" }}>
                  <div data-mono style={{ fontWeight: 600 }}>
                    {fmtHM(it.published_at)}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--fg-3)", marginTop: 2 }}>
                    新聞發布 · <RelTime date={it.published_at} showAbs={false} />
                  </div>
                </div>

                {/* confidence score */}
                <div>
                  <ScoreChip score={it.confidence_score} weighted={it.weighted_score} />
                </div>

                {/* platforms */}
                <div>
                  <PlatformBadges platforms={it.platforms} />
                </div>
              </button>
            );
          })}
          {hidden > 0 && (
            onShowAll ? (
              <button
                onClick={onShowAll}
                className="nr-hover"
                data-mono
                style={{
                  textAlign: "center",
                  padding: "8px 0 0",
                  fontSize: 11,
                  color: "var(--fg-2)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  textDecoration: "underline",
                  textDecorationColor: "var(--fg-4)",
                  textUnderlineOffset: 3,
                }}
                title="捲動到下方完整 table"
              >
                +{hidden} 篇沒列出 · 看完整 table ↓
              </button>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "8px 0 0",
                  fontSize: 11,
                  color: "var(--fg-3)",
                }}
                data-mono
              >
                +{hidden} 篇沒列出 · 排在更後面要等新聞上空出位
              </div>
            )
          )}
        </div>
      )}

      {/* footer — data-freshness + cron */}
      <div
        style={{
          marginTop: 14,
          paddingTop: 10,
          borderTop: "1px dashed color-mix(in oklab, var(--border) 60%, transparent)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 11,
          color: "var(--fg-3)",
        }}
        data-mono
      >
        <span>
          資料更新於{" "}
          <span style={{ color: snapshotStale ? "var(--st-error)" : "var(--fg-2)" }}>
            {updatedAtDate ? fmtHM(updatedAtDate) : "—"}
          </span>
        </span>
        <span>·</span>
        <span>
          下個 cron <span style={{ color: "var(--accent)" }}>{cronLabel}</span>
        </span>
        {snapshotStale && (
          <span style={{ marginLeft: "auto", color: "var(--st-error)" }}>
            ⚠️ 資料陳舊 ({snapshotAgeMin} 分鐘未更新)
          </span>
        )}
      </div>
    </section>
  );
}
