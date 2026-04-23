// Status atoms — a colored dot or pill, keyed by a status string.
// Status names match `drafts.queue_status` (queued/published/failed/stale) plus
// dashboard-level derivatives (fetched/scored/drafted/dropped/rejected).

const COLORS = {
  fetched:   "var(--st-fetched)",
  scored:    "var(--st-scored)",
  drafted:   "var(--st-drafted)",
  queued:    "var(--st-queued)",
  published: "var(--st-published)",
  stale:     "var(--st-queued)",
  failed:    "var(--st-error)",
  error:     "var(--st-error)",
  dropped:   "var(--st-error)",
  rejected:  "var(--st-error)",
};

const PILL_MAP = {
  fetched:   { label: "已抓取",   bg: "var(--st-fetched-bg)",   fg: "var(--st-fetched)" },
  scored:    { label: "已評分",   bg: "var(--st-scored-bg)",    fg: "var(--st-scored)" },
  drafted:   { label: "已產稿",   bg: "var(--st-drafted-bg)",   fg: "var(--st-drafted)" },
  queued:    { label: "待發布",   bg: "var(--st-queued-bg)",    fg: "var(--st-queued)" },
  published: { label: "已發布",   bg: "var(--st-published-bg)", fg: "var(--st-published)" },
  stale:     { label: "逾時 stale", bg: "var(--st-queued-bg)",  fg: "var(--st-queued)" },
  failed:    { label: "發布失敗", bg: "var(--st-error-bg)",     fg: "var(--st-error)" },
  dropped:   { label: "已丟棄",   bg: "var(--st-error-bg)",     fg: "var(--st-error)" },
  rejected:  { label: "已否決",   bg: "var(--st-error-bg)",     fg: "var(--st-error)" },
};

export function StatusDot({ kind }) {
  return (
    <span
      className="nr-dot"
      style={{ background: COLORS[kind] || COLORS.fetched }}
    />
  );
}

export function StatusPill({ kind, size = "md" }) {
  const m = PILL_MAP[kind] || PILL_MAP.fetched;
  const sz = size === "sm" ? { p: "2px 7px", fs: "11px" } : { p: "3px 9px", fs: "12px" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: sz.p,
        fontSize: sz.fs,
        fontWeight: 500,
        lineHeight: 1,
        borderRadius: "999px",
        background: m.bg,
        color: m.fg,
      }}
    >
      <span className="nr-dot" style={{ background: m.fg, width: 6, height: 6 }} />
      {m.label}
    </span>
  );
}
