// ImageStatusChip — small chip signaling whether the composer's image
// passed (ok), was rewritten to meet platform rules (rewrote), or failed.

import { Icon } from "@/components/Icon.jsx";

const MAP = {
  ok:      { icon: "check", label: "合規",   fg: "var(--st-published)", bg: "var(--st-published-bg)" },
  rewrote: { icon: "image", label: "已改寫", fg: "var(--st-queued)",    bg: "var(--st-queued-bg)" },
  failed:  { icon: "x",     label: "失敗",   fg: "var(--st-error)",     bg: "var(--st-error-bg)" },
};

export function ImageStatusChip({ kind }) {
  const m = MAP[kind] || MAP.ok;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 7px",
        borderRadius: 999,
        fontSize: 11,
        color: m.fg,
        background: m.bg,
      }}
    >
      <Icon name={m.icon} size={12} strokeWidth={2} /> {m.label}
    </span>
  );
}
