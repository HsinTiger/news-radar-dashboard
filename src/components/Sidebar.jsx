// Sidebar — navigation + system-pulse strip + data-source footer.
// `currentPage` and `setPage` are passed from the router-aware AppShell so
// this component stays decoupled from react-router.

import { Icon } from "@/components/Icon.jsx";

export function Sidebar({ currentPage, setPage, counts = { queued: 0, dropped: 0 } }) {
  const items = [
    { key: "home",     label: "首頁",         icon: "home" },
    { key: "queue",    label: "佇列",         icon: "queue",    badge: counts.queued },
    { key: "archive",  label: "歷史",         icon: "archive" },
    { key: "dropped",  label: "被擋掉",       icon: "dropped",  badge: counts.dropped },
    { key: "persona",  label: "語氣 Persona", icon: "persona" },
    { key: "settings", label: "設定顯示",     icon: "settings" },
  ];
  return (
    <aside
      style={{
        background: "var(--bg-raised)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: 232,
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div style={{ padding: "18px 18px 12px", display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(140deg, #6E56CF 0%, #8879EC 100%)",
            display: "grid", placeItems: "center",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,.15)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="10" cy="10" r="2" />
            <circle cx="10" cy="10" r="5.5" />
            <path d="M10 2v2M18 10h-2M10 18v-2M2 10h2" />
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em" }}>News Radar</div>
          <div data-mono style={{ fontSize: 10, color: "var(--fg-3)" }}>editor dashboard · v1</div>
        </div>
      </div>

      {/* System pulse */}
      <div
        style={{
          margin: "2px 12px 12px",
          padding: "10px 12px",
          background: "var(--bg-muted)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 12,
        }}
      >
        <span style={{ position: "relative", width: 8, height: 8 }}>
          <span className="nr-dot" style={{ background: "var(--st-published)", position: "absolute", inset: 0 }} />
          <span
            style={{
              position: "absolute",
              inset: -3,
              borderRadius: "50%",
              border: "1.5px solid var(--st-published)",
              opacity: 0.3,
              animation: "pulse 2s infinite",
            }}
          />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ color: "var(--fg-1)", fontWeight: 500 }}>系統正常</div>
          <div data-mono style={{ color: "var(--fg-3)", fontSize: 10, marginTop: 1 }}>上次心跳 42 分鐘前</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "0 8px" }}>
        {items.map((it) => {
          const active = it.key === currentPage;
          return (
            <button
              key={it.key}
              onClick={() => setPage(it.key)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                marginBottom: 2,
                borderRadius: 6,
                color: active ? "var(--fg)" : "var(--fg-2)",
                background: active ? "var(--bg-muted)" : "transparent",
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                transition: "background 80ms",
              }}
              onMouseEnter={(e) => !active && (e.currentTarget.style.background = "var(--bg-muted)")}
              onMouseLeave={(e) => !active && (e.currentTarget.style.background = "transparent")}
            >
              <Icon name={it.icon} size={16} strokeWidth={active ? 1.8 : 1.6} />
              <span>{it.label}</span>
              {it.badge ? (
                <span
                  data-mono
                  style={{
                    marginLeft: "auto",
                    padding: "1px 6px",
                    borderRadius: 999,
                    background: active ? "var(--bg-raised)" : "var(--bg-inset)",
                    color: "var(--fg-2)",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  {it.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* data source footer */}
      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--fg-3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span className="nr-dot" style={{ background: "var(--st-published)", width: 6, height: 6 }} />
          <span>連線至 <span data-mono style={{ color: "var(--fg-2)" }}>origin/state</span></span>
        </div>
        <div data-mono style={{ color: "var(--fg-4)" }}>DB 1.68 MB · 更新於 42 分前</div>
      </div>
    </aside>
  );
}
