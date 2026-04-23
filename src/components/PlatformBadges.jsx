// PlatformBadges — three small squares (FB / IG / Threads) showing which
// platforms a draft landed on. Dimmed square = platform excluded.

import { Icon } from "@/components/Icon.jsx";

const PLATS = [
  { key: "facebook",  icon: "fb", fg: "#1877F2" },
  { key: "instagram", icon: "ig", fg: "#E4405F" },
  { key: "threads",   icon: "th", fg: "var(--fg)" },
];

export function PlatformBadges({ platforms, size = 14 }) {
  return (
    <span style={{ display: "inline-flex", gap: 6 }}>
      {PLATS.map((p) => {
        const has = !platforms || platforms[p.key];
        return (
          <span
            key={p.key}
            title={p.key}
            style={{
              width: size + 10,
              height: size + 10,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: has ? "var(--bg-muted)" : "transparent",
              color: has ? p.fg : "var(--fg-4)",
              borderRadius: 6,
              border: "1px solid var(--border)",
              opacity: has ? 1 : 0.4,
            }}
          >
            <Icon name={p.icon} size={size} strokeWidth={1.8} />
          </span>
        );
      })}
    </span>
  );
}
