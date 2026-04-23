/* global React */
const { useState, useMemo, useEffect } = React;

// ---------- tiny icon set (stroke line icons, 16/20 px) ----------
const Icon = ({ name, size = 16, stroke = "currentColor", strokeWidth = 1.6, className = "" }) => {
  const paths = {
    home:      <><path d="M3 10.5 10 4l7 6.5V17a1 1 0 0 1-1 1h-3v-5h-6v5H4a1 1 0 0 1-1-1v-6.5Z"/></>,
    queue:     <><path d="M4 6h12M4 10h12M4 14h8"/></>,
    archive:   <><rect x="3" y="4" width="14" height="4" rx="1"/><path d="M4 8v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8M8 11h4"/></>,
    dropped:   <><path d="M10 4v8m0 3.5v.5M3.5 16.5 10 4l6.5 12.5Z"/></>,
    persona:   <><circle cx="10" cy="8" r="3"/><path d="M4 17c1-3 3.5-4.5 6-4.5S15 14 16 17"/></>,
    settings:  <><circle cx="10" cy="10" r="2.5"/><path d="m10 2 .7 2.3 2.4-.6 1 2.2 2.2 1-.6 2.4L18 10l-2.3.7.6 2.4-2.2 1-1 2.2-2.4-.6L10 18l-.7-2.3-2.4.6-1-2.2L3.7 13 2 12l2.3-.7-.6-2.4 2.2-1 1-2.2 2.4.6L10 2Z"/></>,
    search:    <><circle cx="9" cy="9" r="5"/><path d="m13.5 13.5 3 3"/></>,
    bell:      <><path d="M6 8a4 4 0 1 1 8 0v3l1.5 2.5H4.5L6 11V8Z"/><path d="M8.5 16a1.5 1.5 0 0 0 3 0"/></>,
    sun:       <><circle cx="10" cy="10" r="3.5"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4"/></>,
    moon:      <><path d="M15 12a5 5 0 0 1-7-7 6 6 0 1 0 7 7Z"/></>,
    chevron_r: <><path d="m8 5 5 5-5 5"/></>,
    chevron_d: <><path d="m5 8 5 5 5-5"/></>,
    check:     <><path d="m4 10 4 4 8-8"/></>,
    x:         <><path d="M5 5l10 10M15 5 5 15"/></>,
    alert:     <><path d="M10 4v6m0 3v.5"/><circle cx="10" cy="10" r="7"/></>,
    external:  <><path d="M7 4H4v12h12v-3M10 4h6v6M9 11l7-7"/></>,
    clock:     <><circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/></>,
    rss:       <><path d="M4 4a12 12 0 0 1 12 12M4 9a7 7 0 0 1 7 7"/><circle cx="5" cy="15" r="1.2"/></>,
    image:     <><rect x="3" y="4" width="14" height="12" rx="1.5"/><circle cx="7.5" cy="8.5" r="1.2"/><path d="m4 14 4-4 4 4 2-2 2 2"/></>,
    fb:        <><path d="M12 3h2v3h-2c-.6 0-1 .4-1 1v2h3l-.5 3H11v5H8v-5H6v-3h2V7c0-2.2 1.8-4 4-4Z"/></>,
    ig:        <><rect x="3" y="3" width="14" height="14" rx="4"/><circle cx="10" cy="10" r="3.5"/><circle cx="14" cy="6" r="0.8" fill="currentColor"/></>,
    th:        <><path d="M10 3c-4 0-7 2.5-7 7s3 7 7 7c3 0 5.5-2 6-5-2 1.5-4 1.5-5 0-1-1.5 0-3 1.5-3s3 1 2 4"/></>,
    heart:     <><path d="M10 16s-6-3.5-6-8a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 4.5-6 8-6 8Z"/></>,
    comment:   <><path d="M4 5h12v9h-5l-3 3v-3H4V5Z"/></>,
    share:     <><circle cx="5" cy="10" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="15" cy="15" r="2"/><path d="m7 9 6-3M7 11l6 3"/></>,
    save:      <><path d="M5 4h10v13l-5-3-5 3V4Z"/></>,
    views:     <><path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z"/><circle cx="10" cy="10" r="2.5"/></>,
    play:      <><path d="M6 4v12l10-6L6 4Z" fill="currentColor" stroke="none"/></>,
    trend_up:  <><path d="M3 14l5-5 3 3 6-6M13 6h4v4"/></>,
    filter:    <><path d="M3 5h14M5 10h10M8 15h4"/></>,
    tag:       <><path d="M3 3h7l7 7-7 7-7-7V3Z"/><circle cx="7" cy="7" r="1.2" fill="currentColor"/></>,
    info:      <><circle cx="10" cy="10" r="7"/><path d="M10 9v5M10 6v.5"/></>,
    refresh:   <><path d="M4 10a6 6 0 0 1 10-4.2L16 4v4h-4M16 10a6 6 0 0 1-10 4.2L4 16v-4h4"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

// ---------- small shared primitives ----------

const StatusDot = ({ kind }) => {
  const colors = {
    fetched:  "var(--st-fetched)",
    scored:   "var(--st-scored)",
    drafted:  "var(--st-drafted)",
    queued:   "var(--st-queued)",
    published:"var(--st-published)",
    failed:   "var(--st-error)",
    error:    "var(--st-error)",
    dropped:  "var(--st-error)",
    rejected: "var(--st-error)",
  };
  return <span className="nr-dot" style={{ background: colors[kind] || "var(--st-fetched)" }} />;
};

const StatusPill = ({ kind, size="md" }) => {
  const map = {
    fetched:  { label: "已抓取", bg: "var(--st-fetched-bg)", fg: "var(--st-fetched)" },
    scored:   { label: "已評分", bg: "var(--st-scored-bg)",   fg: "var(--st-scored)" },
    drafted:  { label: "已產稿", bg: "var(--st-drafted-bg)", fg: "var(--st-drafted)" },
    queued:   { label: "待發布", bg: "var(--st-queued-bg)",   fg: "var(--st-queued)" },
    published:{ label: "已發布", bg: "var(--st-published-bg)",fg: "var(--st-published)" },
    failed:   { label: "發布失敗", bg: "var(--st-error-bg)",  fg: "var(--st-error)" },
    dropped:  { label: "已丟棄", bg: "var(--st-error-bg)",   fg: "var(--st-error)" },
    rejected: { label: "已否決", bg: "var(--st-error-bg)",   fg: "var(--st-error)" },
  };
  const m = map[kind] || map.fetched;
  const sz = size === "sm" ? { p:"2px 7px", fs:"11px" } : { p:"3px 9px", fs:"12px" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: sz.p, fontSize: sz.fs, fontWeight: 500, lineHeight: 1,
      borderRadius: "999px",
      background: m.bg, color: m.fg,
    }}>
      <span className="nr-dot" style={{ background: m.fg, width: 6, height: 6 }}/>
      {m.label}
    </span>
  );
};

const ScoreChip = ({ score, weighted = null }) => {
  let color = "var(--score-bad)";
  if (score >= 0.8) color = "var(--score-good)";
  else if (score >= 0.65) color = "var(--score-ok)";
  return (
    <span data-mono style={{
      display:"inline-flex", alignItems:"center", gap:6,
      padding:"2px 7px", borderRadius: 6,
      fontSize: 12, fontWeight: 600, color,
      background: `color-mix(in oklab, ${color} 12%, transparent)`,
    }}>
      {score.toFixed(2)}
      {weighted !== null && <span style={{opacity:.7, fontWeight:500}}>· w {weighted.toFixed(2)}</span>}
    </span>
  );
};

const PlatformBadges = ({ platforms, size = 14, engagement = null }) => {
  const plats = [
    { key: "facebook", icon: "fb", fg: "#1877F2" },
    { key: "instagram",icon: "ig", fg: "#E4405F" },
    { key: "threads",  icon: "th", fg: "var(--fg)" },
  ];
  return (
    <span style={{ display: "inline-flex", gap: 6 }}>
      {plats.map(p => {
        const has = !platforms || platforms[p.key];
        return (
          <span key={p.key} title={p.key}
            style={{
              width: size + 10, height: size + 10,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: has ? "var(--bg-muted)" : "transparent",
              color: has ? p.fg : "var(--fg-4)",
              borderRadius: 6,
              border: "1px solid var(--border)",
              opacity: has ? 1 : 0.4,
            }}>
            <Icon name={p.icon} size={size} strokeWidth={1.8}/>
          </span>
        );
      })}
    </span>
  );
};

const RelTime = ({ date, showAbs = true }) => {
  const rel = window.MOCK_TIME.fmtRel(date);
  const abs = window.MOCK_TIME.fmtHM(date);
  return (
    <span style={{ whiteSpace: "nowrap" }}>
      <span style={{ color: "var(--fg-1)" }}>{rel}</span>
      {showAbs && <span data-mono style={{ color: "var(--fg-3)", marginLeft: 6, fontSize: "0.92em" }}>· {abs}</span>}
    </span>
  );
};

const ImageStatusChip = ({ kind }) => {
  const map = {
    ok:      { icon: "check", label: "合規",   fg: "var(--st-published)", bg: "var(--st-published-bg)" },
    rewrote: { icon: "image", label: "已改寫", fg: "var(--st-queued)",    bg: "var(--st-queued-bg)" },
    failed:  { icon: "x",     label: "失敗",   fg: "var(--st-error)",     bg: "var(--st-error-bg)" },
  };
  const m = map[kind] || map.ok;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 7px", borderRadius: 999,
      fontSize: 11, color: m.fg, background: m.bg }}>
      <Icon name={m.icon} size={12} strokeWidth={2}/> {m.label}
    </span>
  );
};

// ---------- SIDEBAR ----------
const Sidebar = ({ currentPage, setPage, counts }) => {
  const items = [
    { key: "home",     label: "首頁",       icon: "home" },
    { key: "queue",    label: "佇列",       icon: "queue",    badge: counts.queued },
    { key: "archive",  label: "歷史",       icon: "archive" },
    { key: "dropped",  label: "被擋掉",     icon: "dropped",  badge: counts.dropped },
    { key: "persona",  label: "語氣 Persona",icon: "persona" },
    { key: "settings", label: "設定顯示",   icon: "settings" },
  ];
  return (
    <aside style={{
      background: "var(--bg-raised)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      height: "100%",
    }}>
      {/* Brand */}
      <div style={{ padding: "18px 18px 12px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: "linear-gradient(140deg, #6E56CF 0%, #8879EC 100%)",
          display: "grid", placeItems: "center",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,.15)",
        }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="10" cy="10" r="2"/>
            <circle cx="10" cy="10" r="5.5"/>
            <path d="M10 2v2M18 10h-2M10 18v-2M2 10h2"/>
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em" }}>News Radar</div>
          <div data-mono style={{ fontSize: 10, color: "var(--fg-3)" }}>editor dashboard · v1</div>
        </div>
      </div>

      {/* System pulse */}
      <div style={{ margin: "2px 12px 12px", padding: "10px 12px",
        background: "var(--bg-muted)", borderRadius: 8,
        display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
        <span style={{ position: "relative", width: 8, height: 8 }}>
          <span className="nr-dot" style={{ background: "var(--st-published)", position: "absolute", inset: 0 }}/>
          <span style={{ position: "absolute", inset: -3, borderRadius: "50%",
            border: "1.5px solid var(--st-published)", opacity: 0.3, animation: "pulse 2s infinite" }}/>
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ color: "var(--fg-1)", fontWeight: 500 }}>系統正常</div>
          <div data-mono style={{ color: "var(--fg-3)", fontSize: 10, marginTop: 1 }}>上次心跳 42 分鐘前</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "0 8px" }}>
        {items.map(it => {
          const active = it.key === currentPage;
          return (
            <button key={it.key} onClick={() => setPage(it.key)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", marginBottom: 2,
                borderRadius: 6,
                color: active ? "var(--fg)" : "var(--fg-2)",
                background: active ? "var(--bg-muted)" : "transparent",
                fontSize: 13, fontWeight: active ? 500 : 400,
                transition: "background 80ms",
              }}
              onMouseEnter={e => !active && (e.currentTarget.style.background = "var(--bg-muted)")}
              onMouseLeave={e => !active && (e.currentTarget.style.background = "transparent")}>
              <Icon name={it.icon} size={16} strokeWidth={active ? 1.8 : 1.6}/>
              <span>{it.label}</span>
              {it.badge && (
                <span data-mono style={{
                  marginLeft: "auto",
                  padding: "1px 6px", borderRadius: 999,
                  background: active ? "var(--bg-raised)" : "var(--bg-inset)",
                  color: "var(--fg-2)", fontSize: 10, fontWeight: 600,
                }}>{it.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* data source footer */}
      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border)",
        fontSize: 11, color: "var(--fg-3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span className="nr-dot" style={{ background: "var(--st-published)", width: 6, height: 6 }}/>
          <span>連線至 <span data-mono style={{ color: "var(--fg-2)" }}>origin/state</span></span>
        </div>
        <div data-mono style={{ color: "var(--fg-4)" }}>DB 1.68 MB · 更新於 42 分前</div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: .35; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </aside>
  );
};

// ---------- TOPBAR ----------
const Topbar = ({ title, subtitle, onOpen, theme, setTheme }) => {
  return (
    <header style={{
      padding: "16px 28px",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", gap: 16,
      background: "var(--bg)",
      position: "sticky", top: 0, zIndex: 10,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: "-0.015em" }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 2 }}>{subtitle}</div>}
      </div>

      {/* search */}
      <div style={{ position: "relative", width: 260 }}>
        <Icon name="search" size={14} className="nr-search-icon"/>
        <input placeholder="搜尋標題、hashtag、來源 feed…"
          style={{
            width: "100%",
            padding: "7px 10px 7px 30px",
            background: "var(--bg-muted)",
            border: "1px solid transparent",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--fg)",
            outline: "none",
            fontFamily: "inherit",
          }}
          onFocus={e => { e.target.style.background = "var(--bg-raised)"; e.target.style.borderColor = "var(--border-strong)"; }}
          onBlur={e => { e.target.style.background = "var(--bg-muted)"; e.target.style.borderColor = "transparent"; }}
        />
        <style>{`.nr-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--fg-3); pointer-events: none; }`}</style>
      </div>

      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        title="切換深淺色"
        style={{ width: 30, height: 30, borderRadius: 6, display: "grid", placeItems: "center", color: "var(--fg-2)" }}
        className="nr-hover">
        <Icon name={theme === "dark" ? "sun" : "moon"} size={16}/>
      </button>

      <button
        style={{ width: 30, height: 30, borderRadius: 6, display: "grid", placeItems: "center", color: "var(--fg-2)", position: "relative" }}
        className="nr-hover" title="警示">
        <Icon name="bell" size={16}/>
        <span className="nr-dot" style={{
          background: "var(--st-queued)", width: 7, height: 7,
          position: "absolute", top: 6, right: 6, border: "1.5px solid var(--bg)"
        }}/>
      </button>

      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "4px 4px 4px 10px",
        border: "1px solid var(--border)",
        borderRadius: 999,
      }}>
        <span style={{ fontSize: 12, color: "var(--fg-1)", fontWeight: 500 }}>Alex</span>
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          background: "linear-gradient(140deg, #F7B955 0%, #E4405F 100%)",
          display: "grid", placeItems: "center",
          color: "#fff", fontSize: 11, fontWeight: 600,
        }}>A</div>
      </div>
    </header>
  );
};

Object.assign(window, { Icon, StatusDot, StatusPill, ScoreChip, PlatformBadges, RelTime, ImageStatusChip, Sidebar, Topbar });
