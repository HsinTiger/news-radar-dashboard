/* global React, Icon, StatusPill, StatusDot, ScoreChip, PlatformBadges, RelTime, ImageStatusChip */
const { useState: useS1, useMemo: useM1 } = React;

// =================== HOME ===================
const HomePage = ({ openDetail }) => {
  const sys = window.MOCK_SYSTEM;
  const nextItem = window.MOCK_ITEMS.find(i => i.queue_status === "queued");
  const topQueued = window.MOCK_ITEMS.filter(i => i.queue_status === "queued").slice(0, 3);

  const costLevel = sys.today_cost_usd < 1 ? "good" : sys.today_cost_usd < 3 ? "ok" : "bad";
  const costColor = { good: "var(--score-good)", ok: "var(--score-ok)", bad: "var(--score-bad)" }[costLevel];

  return (
    <div style={{ padding: "24px 28px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <StatCard
          label="上次發文"
          hint={sys.last_publish_platforms.join(" · ")}
          value={<RelTime date={sys.last_publish_at}/>}
          footer={<div style={{
            fontSize: 12, color: "var(--fg-1)", marginTop: 10, lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
          }}>{sys.last_publish_title}</div>}
          accent="var(--st-published)"
          onClick={() => openDetail("d_p01")}
        />
        <StatCard
          label="佇列中"
          hint="最近一篇預計"
          value={<span data-mono style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em" }}>
            {sys.queued_count} <span style={{ fontSize: 14, color: "var(--fg-2)", fontWeight: 400 }}>篇</span>
          </span>}
          footer={
            <div style={{ marginTop: 10, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="clock" size={12} stroke="var(--st-queued)"/>
              <span style={{ color: "var(--fg-1)" }}>{window.MOCK_TIME.fmtHM(sys.next_publish_at)}</span>
              <span style={{ color: "var(--fg-3)" }}>· {window.MOCK_TIME.fmtRel(sys.next_publish_at)}</span>
            </div>
          }
          accent="var(--st-queued)"
        />
        <StatCard
          label="今日 token 成本"
          hint={`${sys.today_llm_calls} 次 LLM call`}
          value={<span data-mono style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", color: costColor }}>
            ${sys.today_cost_usd.toFixed(2)} <span style={{ fontSize: 12, color: "var(--fg-3)", fontWeight: 400 }}>USD</span>
          </span>}
          footer={<BudgetBar value={sys.today_cost_usd} max={sys.budget_daily} color={costColor}/>}
          accent={costColor}
        />
      </div>

      {/* timeline */}
      <section className="nr-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>過去 24 小時</h2>
          <div style={{ fontSize: 12, color: "var(--fg-3)" }}>harvest · scoring · 發文 · 錯誤</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, fontSize: 11, color: "var(--fg-2)" }}>
            {[
              ["harvest", "var(--st-scored)"], ["scoring", "var(--st-drafted)"],
              ["發文", "var(--st-published)"], ["錯誤", "var(--st-error)"]
            ].map(([l,c]) => (
              <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span className="nr-dot" style={{ background: c, width: 6, height: 6 }}/>{l}
              </span>
            ))}
          </div>
        </div>
        <Timeline onPublishClick={(id) => openDetail(id)}/>
      </section>

      {/* bottom row: 3 columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 12 }}>
        <section className="nr-card" style={{ padding: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 600, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>下一批即將發布</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topQueued.map(it => (
              <button key={it.id} onClick={() => openDetail(it.id)}
                style={{ textAlign: "left", padding: "10px 12px", borderRadius: 8, background: "var(--bg-muted)",
                  border: "1px solid transparent", display: "flex", gap: 10, alignItems: "flex-start" }}
                className="nr-hover">
                <div data-mono style={{ fontSize: 11, color: "var(--st-queued)", fontWeight: 600, flexShrink: 0, minWidth: 42 }}>
                  {window.MOCK_TIME.fmtHM(it.publish_at)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, color: "var(--fg)",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{it.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--fg-3)" }}>{window.MOCK_TOPIC_BY_ID(it.topic_id).emoji} {it.topic_id}</span>
                    <span style={{ color: "var(--fg-4)", fontSize: 10 }}>·</span>
                    <ScoreChip score={it.confidence_score}/>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="nr-card" style={{ padding: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 600, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>最近 7 天 平均互動</h3>
          <EngagementSpark/>
        </section>

        <section className="nr-card" style={{ padding: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 600, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>系統警示</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sys.alerts.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--fg-3)" }}>過去 24 小時無警示</div>
            ) : sys.alerts.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, fontSize: 12 }}>
                <Icon name="alert" size={14} stroke={a.level === "warn" ? "var(--st-queued)" : "var(--st-scored)"}/>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "var(--fg-1)", lineHeight: 1.5 }}>{a.text}</div>
                  <div data-mono style={{ fontSize: 10, color: "var(--fg-3)", marginTop: 3 }}>{window.MOCK_TIME.fmtRel(a.at)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard = ({ label, hint, value, footer, accent, onClick }) => (
  <div className="nr-card nr-hover" onClick={onClick}
    style={{ padding: 18, position: "relative", cursor: onClick ? "pointer" : "default", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: accent }}/>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
      {hint && <span style={{ fontSize: 11, color: "var(--fg-3)" }}>{hint}</span>}
    </div>
    <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.01em", color: "var(--fg)" }}>{value}</div>
    {footer}
  </div>
);

const BudgetBar = ({ value, max, color }) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ height: 4, background: "var(--bg-inset)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }}/>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "var(--fg-3)" }} data-mono>
        <span>{pct.toFixed(0)}% of ${max.toFixed(0)}/day</span>
        <span style={{ color: "var(--score-good)" }}>● 正常</span>
      </div>
    </div>
  );
};

const Timeline = ({ onPublishClick }) => {
  const events = window.MOCK_TIMELINE;
  // hours 0..24 (0 = now, 24 = 24h ago); render right-to-left so now is on the right
  const height = 110;
  return (
    <div style={{ position: "relative", height: height + 36, userSelect: "none" }}>
      {/* axis */}
      <div style={{ position: "absolute", left: 0, right: 0, top: height/2, height: 1, background: "var(--border)" }}/>
      {/* hour marks */}
      {[0, 4, 8, 12, 16, 20, 24].map(h => {
        const x = 100 - (h / 24) * 100;
        return (
          <div key={h} style={{ position: "absolute", left: `${x}%`, top: 0, bottom: 0, transform: "translateX(-50%)" }}>
            <div style={{ position: "absolute", top: height/2 - 3, width: 1, height: 6, background: "var(--border-strong)" }}/>
            <div data-mono style={{ position: "absolute", top: height + 8, fontSize: 10, color: "var(--fg-3)", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
              {h === 0 ? "現在" : `-${h}h`}
            </div>
          </div>
        );
      })}
      {/* events */}
      {events.map((e, i) => {
        const x = 100 - (e.hours_ago / 24) * 100;
        if (e.kind === "publish") {
          return (
            <button key={i} onClick={() => onPublishClick(e.item_id)}
              title={e.label}
              style={{
                position: "absolute", left: `${x}%`, top: height/2 - 20,
                width: 2, height: 40,
                background: "var(--st-published)",
                transform: "translateX(-50%)",
                borderRadius: 1,
              }}>
              <span style={{
                position: "absolute", top: -7, left: "50%", transform: "translateX(-50%)",
                width: 10, height: 10, borderRadius: "50%",
                background: "var(--st-published)",
                border: "2px solid var(--bg-raised)",
              }}/>
            </button>
          );
        }
        if (e.kind === "harvest") {
          return <div key={i} title="harvest"
            style={{ position: "absolute", left: `${x}%`, top: height/2 - 3, width: 6, height: 6, borderRadius: "50%",
              background: "var(--st-scored)", transform: "translateX(-50%)", opacity: 0.6 }}/>;
        }
        if (e.kind === "score") {
          return <div key={i} title="scoring"
            style={{ position: "absolute", left: `${x}%`, top: height/2 + 8, width: 4, height: 4, borderRadius: "50%",
              background: "var(--st-drafted)", transform: "translateX(-50%)", opacity: 0.7 }}/>;
        }
        if (e.kind === "error") {
          return (
            <div key={i} title={e.label}
              style={{ position: "absolute", left: `${x}%`, top: height/2 - 14, transform: "translateX(-50%)",
                width: 14, height: 14, borderRadius: "50%",
                background: "var(--st-error-bg)",
                border: "2px solid var(--st-error)",
                display: "grid", placeItems: "center",
                color: "var(--st-error)", fontSize: 10, fontWeight: 700,
              }}>!</div>
          );
        }
        return null;
      })}
    </div>
  );
};

const EngagementSpark = () => {
  const plats = [
    { k: "facebook", icon: "fb", fg: "#1877F2", label: "FB",    avg: 12, series: [8, 11, 9, 14, 15, 13, 12] },
    { k: "instagram",icon: "ig", fg: "#E4405F", label: "IG",    avg:  8, series: [5, 6, 9, 7, 10, 9, 8] },
    { k: "threads",  icon: "th", fg: "var(--fg)",label: "Threads",avg:  5, series: [3, 4, 6, 5, 6, 4, 5] },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {plats.map(p => {
        const max = Math.max(...p.series);
        return (
          <div key={p.k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: p.fg, display: "inline-flex" }}>
              <Icon name={p.icon} size={14} strokeWidth={1.8}/>
            </span>
            <span style={{ fontSize: 12, color: "var(--fg-1)", minWidth: 54 }}>{p.label} 平均</span>
            <span data-mono style={{ fontSize: 13, fontWeight: 600 }}>{p.avg}</span>
            <span style={{ fontSize: 11, color: "var(--fg-3)" }}>讚</span>
            <svg width="70" height="20" style={{ marginLeft: "auto" }}>
              <polyline
                points={p.series.map((v, i) => `${(i / (p.series.length - 1)) * 68 + 1},${18 - (v / max) * 16}`).join(" ")}
                fill="none" stroke={p.fg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      })}
      <div style={{ fontSize: 10, color: "var(--fg-3)", textAlign: "right", marginTop: -4 }} data-mono>
        過去 7 天 · 每篇平均
      </div>
    </div>
  );
};

// =================== QUEUE ===================
const QueuePage = ({ openDetail }) => {
  const [statusFilter, setStatusFilter] = useS1("all");
  const items = window.MOCK_ITEMS.filter(i => i.status !== "dropped");

  const tabs = [
    { k: "all",       label: "全部", count: items.length },
    { k: "queued",    label: "待發布", count: items.filter(i => i.queue_status === "queued").length },
    { k: "published", label: "已發布", count: items.filter(i => i.queue_status === "published").length },
    { k: "failed",    label: "失敗",  count: items.filter(i => i.queue_status === "failed").length },
  ];

  const filtered = statusFilter === "all" ? items : items.filter(i => i.queue_status === statusFilter);

  return (
    <div style={{ padding: "20px 28px 40px" }}>
      {/* filter bar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "inline-flex", padding: 2, background: "var(--bg-muted)", borderRadius: 8 }}>
          {tabs.map(t => (
            <button key={t.k} onClick={() => setStatusFilter(t.k)}
              style={{
                padding: "6px 12px", fontSize: 12, fontWeight: 500, borderRadius: 6,
                background: statusFilter === t.k ? "var(--bg-raised)" : "transparent",
                color: statusFilter === t.k ? "var(--fg)" : "var(--fg-2)",
                boxShadow: statusFilter === t.k ? "var(--shadow-sm)" : "none",
              }}>
              {t.label} <span data-mono style={{ opacity: .7, marginLeft: 4, fontSize: 11 }}>{t.count}</span>
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <FilterChip icon="tag" label="所有主題"/>
          <FilterChip icon="filter" label="分數 ≥ 0.65"/>
          <FilterChip icon="clock" label="最近 24 小時"/>
        </div>
      </div>

      {/* table */}
      <div className="nr-card" style={{ overflow: "hidden" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "110px 1fr 90px 140px 90px 160px 100px",
          padding: "10px 16px",
          background: "var(--bg-muted)",
          borderBottom: "1px solid var(--border)",
          fontSize: 11, fontWeight: 600, color: "var(--fg-2)",
          textTransform: "uppercase", letterSpacing: "0.05em",
          alignItems: "center",
        }}>
          <div>狀態</div>
          <div>標題</div>
          <div>分數</div>
          <div>主題</div>
          <div>圖片</div>
          <div>預計發布</div>
          <div>平台</div>
        </div>
        {filtered.map(it => (
          <button key={it.id} onClick={() => openDetail(it.id)}
            style={{
              width: "100%", textAlign: "left",
              display: "grid",
              gridTemplateColumns: "110px 1fr 90px 140px 90px 160px 100px",
              padding: "14px 16px",
              borderBottom: "1px solid var(--border)",
              alignItems: "center",
              background: "transparent",
            }}
            className="nr-hover">
            <div><StatusPill kind={it.queue_status || it.status} size="sm"/></div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)", paddingRight: 16, lineHeight: 1.4 }}>
              {it.title}
              <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 3, fontWeight: 400 }}>
                <Icon name="rss" size={10} className="nr-inline"/> {it.feed_name}
              </div>
            </div>
            <div><ScoreChip score={it.confidence_score}/></div>
            <div style={{ fontSize: 12, color: "var(--fg-1)" }}>
              {window.MOCK_TOPIC_BY_ID(it.topic_id).emoji} <span data-mono style={{ color: "var(--fg-2)" }}>{it.topic_id}</span>
            </div>
            <div><ImageStatusChip kind={it.image_status || "ok"}/></div>
            <div style={{ fontSize: 12 }}>
              {it.queue_status === "published" ? (
                <span style={{ color: "var(--fg-2)" }}>
                  <span data-mono>{window.MOCK_TIME.fmtHM(it.publish_at)}</span>
                  <span style={{ color: "var(--fg-3)", marginLeft: 4 }}>· {window.MOCK_TIME.fmtRel(it.publish_at)}</span>
                </span>
              ) : (
                <span>
                  <span data-mono style={{ color: "var(--st-queued)", fontWeight: 600 }}>{window.MOCK_TIME.fmtHM(it.publish_at)}</span>
                  <span style={{ color: "var(--fg-3)", marginLeft: 4 }}>· {window.MOCK_TIME.fmtRel(it.publish_at)}</span>
                </span>
              )}
            </div>
            <div><PlatformBadges platforms={it.platforms}/></div>
          </button>
        ))}
      </div>
    </div>
  );
};

const FilterChip = ({ icon, label }) => (
  <button className="nr-hover" style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "6px 10px", fontSize: 12,
    border: "1px solid var(--border)", borderRadius: 6,
    color: "var(--fg-1)", background: "var(--bg-raised)",
  }}>
    <Icon name={icon} size={13} stroke="var(--fg-2)"/>
    {label}
    <Icon name="chevron_d" size={12} stroke="var(--fg-3)"/>
  </button>
);

// =================== ARCHIVE ===================
const ArchivePage = ({ openDetail }) => {
  const items = window.MOCK_ITEMS.filter(i => i.status === "published");
  return (
    <div style={{ padding: "20px 28px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["最近 7 天", "上週", "本月"].map((l, i) => (
            <button key={l} style={{
              padding: "6px 12px", fontSize: 12, fontWeight: 500,
              borderRadius: 6, border: "1px solid var(--border)",
              background: i === 0 ? "var(--fg)" : "var(--bg-raised)",
              color: i === 0 ? "var(--bg)" : "var(--fg-1)",
            }}>{l}</button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--fg-2)" }}>
          共 <span data-mono style={{ color: "var(--fg)", fontWeight: 600 }}>{items.length}</span> 篇
          · 平均 <span data-mono style={{ color: "var(--score-good)", fontWeight: 600 }}>0.81</span> 分
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {items.map(it => {
          const topic = window.MOCK_TOPIC_BY_ID(it.topic_id);
          const fbLikes = it.engagement?.facebook?.likes || 0;
          const igLikes = it.engagement?.instagram?.likes || 0;
          const thLikes = it.engagement?.threads?.likes || 0;
          const failed = it.publish_log?.some(p => !p.success);
          return (
            <button key={it.id} onClick={() => openDetail(it.id)}
              className="nr-card"
              style={{ textAlign: "left", padding: 0, overflow: "hidden", background: "var(--bg-raised)", transition: "transform 120ms, box-shadow 120ms" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              {/* thumb */}
              <div style={{ aspectRatio: "16 / 9", background: "var(--bg-inset)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0,
                  backgroundImage: `linear-gradient(135deg, color-mix(in oklab, var(--accent) 20%, var(--bg-inset)) 0%, var(--bg-inset) 100%)` }}/>
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 28 }}>{topic.emoji}</div>
                <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
                  <StatusPill kind="published" size="sm"/>
                  {failed && <StatusPill kind="failed" size="sm"/>}
                </div>
                <div style={{ position: "absolute", top: 10, right: 10 }}>
                  <ScoreChip score={it.confidence_score}/>
                </div>
              </div>
              {/* body */}
              <div style={{ padding: "14px 14px 12px" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)", lineHeight: 1.4,
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                  minHeight: 36 }}>{it.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 11, color: "var(--fg-3)" }}>
                  <span><Icon name="rss" size={10}/> {it.feed_name}</span>
                  <span style={{ color: "var(--fg-4)" }}>·</span>
                  <RelTime date={it.publish_at} showAbs={false}/>
                </div>
              </div>
              {/* engagement footer */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--border)",
                background: "var(--bg-muted)" }}>
                {[
                  { k: "fb", n: fbLikes, fg: "#1877F2" },
                  { k: "ig", n: igLikes, fg: "#E4405F" },
                  { k: "th", n: thLikes, fg: "var(--fg)" },
                ].map((p, i) => (
                  <div key={p.k} style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: 6,
                    borderLeft: i > 0 ? "1px solid var(--border)" : "none" }}>
                    <span style={{ color: p.fg }}><Icon name={p.k} size={12} strokeWidth={1.8}/></span>
                    <Icon name="heart" size={11} stroke="var(--fg-3)"/>
                    <span data-mono style={{ fontSize: 12, fontWeight: 600 }}>{p.n}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

Object.assign(window, { HomePage, QueuePage, ArchivePage });
