// HomePage — three stat cards + 24h timeline + next-batch/engagement-spark/alerts row.
//
// Phase 2 (c) note: the "佇列中" stat card and "接下來的 queue" section both
// read the NEWS publication time (n.published_at) rather than drafts.publish_at,
// and the top-of-hour cron tick comes from publishCron.js — never from the DB.
// This keeps dashboard language honest about the Phase 8.18 freshness-first
// picker contract. See components/QueueRankCard.jsx for the full rationale.

import { Icon } from "@/components/Icon.jsx";
import { ScoreChip } from "@/components/ScoreChip.jsx";
import { RelTime } from "@/components/RelTime.jsx";
import { PipelineHealthBar } from "@/components/PipelineHealthBar.jsx";
import { useNewsRadarDB } from "@/hooks/useNewsRadarDB.js";
import { fmtRel } from "@/lib/time.js";
import { nextPublishLabel, minutesToNextPublish } from "@/lib/publishCron.js";

export function HomePage({ openDetail }) {
  const { items, system: sys, timeline, topicById, pipelineHealth, now } = useNewsRadarDB();
  // Match backend pick_freshest_queued WHERE clause — only queued AND approved
  // drafts are pickable. Sort by news published_at DESC (picker's ORDER BY).
  const topQueued = items
    .filter(
      (i) =>
        i.queue_status === "queued" &&
        (i.status === "approved" || i.status === "auto_approved")
    )
    .slice()
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    )
    .slice(0, 3);
  const cronLabel = nextPublishLabel(now);
  const cronInMin = minutesToNextPublish(now);

  const costLevel = sys.today_cost_usd < 1 ? "good" : sys.today_cost_usd < 3 ? "ok" : "bad";
  const costColor = { good: "var(--score-good)", ok: "var(--score-ok)", bad: "var(--score-bad)" }[costLevel];

  return (
    <div style={{ padding: "24px 28px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <StatCard
          label="上次發文"
          hint={sys.last_publish_platforms.join(" · ")}
          value={<RelTime date={sys.last_publish_at} />}
          footer={
            <div
              style={{
                fontSize: 12, color: "var(--fg-1)", marginTop: 10, lineHeight: 1.4,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
              }}
            >
              {sys.last_publish_title}
            </div>
          }
          accent="var(--st-published)"
          onClick={() => openDetail("d_p01")}
        />
        <StatCard
          label="佇列中"
          hint="下個 cron"
          value={
            <span data-mono style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em" }}>
              {sys.queued_count}{" "}
              <span style={{ fontSize: 14, color: "var(--fg-2)", fontWeight: 400 }}>篇</span>
            </span>
          }
          footer={
            <div style={{ marginTop: 10, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="clock" size={12} stroke="var(--st-queued)" />
              {/* Cron tick from publishCron.js — advisory, never a schedule.
                  Used to read sys.next_publish_at (drafts.publish_at) which is
                  a dead field under the Phase 8.18 freshness-first picker. */}
              <span data-mono style={{ color: "var(--fg-1)" }}>{cronLabel}</span>
              <span style={{ color: "var(--fg-3)" }}>· 再 {cronInMin} 分鐘</span>
            </div>
          }
          accent="var(--st-queued)"
        />
        <StatCard
          label="今日 token 成本"
          hint={`${sys.today_llm_calls} 次 LLM call`}
          value={
            <span
              data-mono
              style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", color: costColor }}
            >
              ${sys.today_cost_usd.toFixed(2)}{" "}
              <span style={{ fontSize: 12, color: "var(--fg-3)", fontWeight: 400 }}>USD</span>
            </span>
          }
          footer={<BudgetBar value={sys.today_cost_usd} max={sys.budget_daily} color={costColor} />}
          accent={costColor}
        />
      </div>

      {/* Phase 1A: Pipeline health bar */}
      <PipelineHealthBar pipelineHealth={pipelineHealth} now={now} />

      {/* timeline */}
      <section className="nr-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>過去 24 小時</h2>
          <div style={{ fontSize: 12, color: "var(--fg-3)" }}>harvest · scoring · 發文 · 錯誤</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, fontSize: 11, color: "var(--fg-2)" }}>
            {[
              ["harvest", "var(--st-scored)"],
              ["scoring", "var(--st-drafted)"],
              ["發文", "var(--st-published)"],
              ["錯誤", "var(--st-error)"],
            ].map(([l, c]) => (
              <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span className="nr-dot" style={{ background: c, width: 6, height: 6 }} />
                {l}
              </span>
            ))}
          </div>
        </div>
        <Timeline events={timeline} onPublishClick={(id) => openDetail(id)} />
      </section>

      {/* bottom row: 3 columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 12 }}>
        <section className="nr-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
            <h3
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--fg-2)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              接下來的 queue
            </h3>
            <span style={{ fontSize: 10, color: "var(--fg-3)" }}>· 按新鮮度排序</span>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--fg-3)", marginBottom: 12 }}>
            下個 cron 從第 1 名撿
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topQueued.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--fg-3)" }}>
                目前沒有 queued 且已審核的 draft
              </div>
            ) : (
              topQueued.map((it, idx) => {
                const topic = topicById(it.topic_category);
                const rank = idx + 1;
                const isTop = rank === 1;
                return (
                  <button
                    key={it.id}
                    onClick={() => openDetail(it.id)}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: 8,
                      background: isTop
                        ? "color-mix(in oklab, var(--accent-soft) 70%, var(--bg-muted))"
                        : "var(--bg-muted)",
                      border: isTop
                        ? "1px solid color-mix(in oklab, var(--accent) 25%, var(--border))"
                        : "1px solid transparent",
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                    className="nr-hover"
                    title={isTop ? "下個 cron 會挑這一篇" : `第 ${rank} 名`}
                  >
                    <div
                      data-mono
                      style={{
                        fontSize: 13,
                        color: isTop ? "var(--accent)" : "var(--fg-3)",
                        fontWeight: 700,
                        flexShrink: 0,
                        minWidth: 28,
                        textAlign: "center",
                      }}
                    >
                      #{rank}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 500,
                          lineHeight: 1.4,
                          color: "var(--fg)",
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
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 6,
                          fontSize: 11,
                          color: "var(--fg-3)",
                        }}
                      >
                        <span>
                          {topic.emoji} {it.topic_category}
                        </span>
                        <span style={{ color: "var(--fg-4)", fontSize: 10 }}>·</span>
                        <ScoreChip score={it.confidence_score} />
                        <span style={{ color: "var(--fg-4)", fontSize: 10 }}>·</span>
                        <span data-mono>
                          新聞 <RelTime date={it.published_at} showAbs={false} />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          <div
            style={{
              marginTop: 10,
              paddingTop: 8,
              borderTop: "1px dashed color-mix(in oklab, var(--border) 60%, transparent)",
              fontSize: 10,
              color: "var(--fg-3)",
              textAlign: "right",
            }}
            data-mono
          >
            下個 cron <span style={{ color: "var(--accent)" }}>{cronLabel}</span> · 再 {cronInMin} 分
          </div>
        </section>

        <section className="nr-card" style={{ padding: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 600, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            最近 7 天 平均互動
          </h3>
          <EngagementSpark />
        </section>

        <section className="nr-card" style={{ padding: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 600, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            系統警示
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sys.alerts.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--fg-3)" }}>過去 24 小時無警示</div>
            ) : (
              sys.alerts.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 10, fontSize: 12 }}>
                  <Icon name="alert" size={14} stroke={a.level === "warn" ? "var(--st-queued)" : "var(--st-scored)"} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "var(--fg-1)", lineHeight: 1.5 }}>{a.text}</div>
                    <div data-mono style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 3 }}>
                      {fmtRel(a.at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------- Home-local sub-components ----------

function StatCard({ label, hint, value, footer, accent, onClick }) {
  return (
    <div
      className="nr-card nr-hover"
      onClick={onClick}
      style={{ padding: 18, position: "relative", cursor: onClick ? "pointer" : "default", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: accent }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </span>
        {hint && <span style={{ fontSize: 11, color: "var(--fg-3)" }}>{hint}</span>}
      </div>
      <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.01em", color: "var(--fg)" }}>{value}</div>
      {footer}
    </div>
  );
}

function BudgetBar({ value, max, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ height: 4, background: "var(--bg-inset)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }} />
      </div>
      <div
        style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "var(--fg-3)" }}
        data-mono
      >
        <span>{pct.toFixed(0)}% of ${max.toFixed(0)}/day</span>
        <span style={{ color: "var(--score-good)" }}>● 正常</span>
      </div>
    </div>
  );
}

function Timeline({ events, onPublishClick }) {
  const height = 110;
  return (
    <div style={{ position: "relative", height: height + 36, userSelect: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: height / 2, height: 1, background: "var(--border)" }} />
      {[0, 4, 8, 12, 16, 20, 24].map((h) => {
        const x = 100 - (h / 24) * 100;
        return (
          <div key={h} style={{ position: "absolute", left: `${x}%`, top: 0, bottom: 0, transform: "translateX(-50%)" }}>
            <div style={{ position: "absolute", top: height / 2 - 3, width: 1, height: 6, background: "var(--border-strong)" }} />
            <div
              data-mono
              style={{
                position: "absolute",
                top: height + 8,
                fontSize: 10,
                color: "var(--fg-3)",
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
              }}
            >
              {h === 0 ? "現在" : `-${h}h`}
            </div>
          </div>
        );
      })}
      {events.map((e, i) => {
        const x = 100 - (e.hours_ago / 24) * 100;
        if (e.kind === "publish") {
          return (
            <button
              key={i}
              onClick={() => onPublishClick(e.item_id)}
              title={e.label}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: height / 2 - 20,
                width: 2,
                height: 40,
                background: "var(--st-published)",
                transform: "translateX(-50%)",
                borderRadius: 1,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: -7,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "var(--st-published)",
                  border: "2px solid var(--bg-raised)",
                }}
              />
            </button>
          );
        }
        if (e.kind === "harvest") {
          return (
            <div
              key={i}
              title="harvest"
              style={{
                position: "absolute", left: `${x}%`, top: height / 2 - 3,
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--st-scored)", transform: "translateX(-50%)", opacity: 0.6,
              }}
            />
          );
        }
        if (e.kind === "score") {
          return (
            <div
              key={i}
              title="scoring"
              style={{
                position: "absolute", left: `${x}%`, top: height / 2 + 8,
                width: 4, height: 4, borderRadius: "50%",
                background: "var(--st-drafted)", transform: "translateX(-50%)", opacity: 0.7,
              }}
            />
          );
        }
        if (e.kind === "error") {
          return (
            <div
              key={i}
              title={e.label}
              style={{
                position: "absolute", left: `${x}%`, top: height / 2 - 14, transform: "translateX(-50%)",
                width: 14, height: 14, borderRadius: "50%",
                background: "var(--st-error-bg)", border: "2px solid var(--st-error)",
                display: "grid", placeItems: "center",
                color: "var(--st-error)", fontSize: 10, fontWeight: 700,
              }}
            >
              !
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function EngagementSpark() {
  // Placeholder figures — v1 renders a stable visual. v2 will join engagement_stats
  // over a rolling window and compute per-platform averages.
  const plats = [
    { k: "facebook",  icon: "fb", fg: "#1877F2", label: "FB",      avg: 12, series: [8, 11, 9, 14, 15, 13, 12] },
    { k: "instagram", icon: "ig", fg: "#E4405F", label: "IG",      avg:  8, series: [5, 6, 9, 7, 10, 9, 8] },
    { k: "threads",   icon: "th", fg: "var(--fg)", label: "Threads", avg:  5, series: [3, 4, 6, 5, 6, 4, 5] },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {plats.map((p) => {
        const max = Math.max(...p.series);
        return (
          <div key={p.k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: p.fg, display: "inline-flex" }}>
              <Icon name={p.icon} size={14} strokeWidth={1.8} />
            </span>
            <span style={{ fontSize: 12, color: "var(--fg-1)", minWidth: 54 }}>{p.label} 平均</span>
            <span data-mono style={{ fontSize: 13, fontWeight: 600 }}>{p.avg}</span>
            <span style={{ fontSize: 11, color: "var(--fg-3)" }}>讚</span>
            <svg width="70" height="20" style={{ marginLeft: "auto" }}>
              <polyline
                points={p.series
                  .map((v, i) => `${(i / (p.series.length - 1)) * 68 + 1},${18 - (v / max) * 16}`)
                  .join(" ")}
                fill="none"
                stroke={p.fg}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      })}
      <div style={{ fontSize: 10, color: "var(--fg-3)", textAlign: "right", marginTop: -4 }} data-mono>
        過去 7 天 · 每篇平均
      </div>
    </div>
  );
}
