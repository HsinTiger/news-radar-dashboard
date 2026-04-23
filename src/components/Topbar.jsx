// Topbar — page title + search + theme toggle + alert + Alex avatar.
// `theme` is read from `document.documentElement.dataset.theme` and flipped
// by setTheme (wired in AppShell).

import { Icon } from "@/components/Icon.jsx";

export function Topbar({ title, subtitle, theme, setTheme }) {
  return (
    <header
      style={{
        padding: "16px 28px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        background: "var(--bg)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: "-0.015em" }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 2 }}>{subtitle}</div>}
      </div>

      {/* search (visual only in v1) */}
      <div style={{ position: "relative", width: 260 }}>
        <Icon name="search" size={14} className="nr-search-icon" />
        <input
          placeholder="搜尋標題、hashtag、來源 feed…"
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
          onFocus={(e) => {
            e.target.style.background = "var(--bg-raised)";
            e.target.style.borderColor = "var(--border-strong)";
          }}
          onBlur={(e) => {
            e.target.style.background = "var(--bg-muted)";
            e.target.style.borderColor = "transparent";
          }}
        />
        <style>{`.nr-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--fg-3); pointer-events: none; }`}</style>
      </div>

      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        title="切換深淺色"
        style={{ width: 30, height: 30, borderRadius: 6, display: "grid", placeItems: "center", color: "var(--fg-2)" }}
        className="nr-hover"
      >
        <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
      </button>

      <button
        style={{ width: 30, height: 30, borderRadius: 6, display: "grid", placeItems: "center", color: "var(--fg-2)", position: "relative" }}
        className="nr-hover"
        title="警示"
      >
        <Icon name="bell" size={16} />
        <span
          className="nr-dot"
          style={{
            background: "var(--st-queued)",
            width: 7,
            height: 7,
            position: "absolute",
            top: 6,
            right: 6,
            border: "1.5px solid var(--bg)",
          }}
        />
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 4px 4px 10px",
          border: "1px solid var(--border)",
          borderRadius: 999,
        }}
      >
        <span style={{ fontSize: 12, color: "var(--fg-1)", fontWeight: 500 }}>Alex</span>
        <div
          style={{
            width: 24, height: 24, borderRadius: "50%",
            background: "linear-gradient(140deg, #F7B955 0%, #E4405F 100%)",
            display: "grid", placeItems: "center",
            color: "#fff", fontSize: 11, fontWeight: 600,
          }}
        >
          A
        </div>
      </div>
    </header>
  );
}
