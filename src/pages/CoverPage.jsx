// CoverPage — Phase 9.5 / Phase 2 brand audit surface.
//
// Renders a grid of recently-published drafts with their FB + IG cover
// thumbnails (loaded directly from raw.githubusercontent.com on the
// cover-cdn branch). Boss surface for "did the cover render correctly,
// and is brand consistency holding up across platforms?"
//
// URL pattern (kept in sync with news_radar/src/cover_uploader.py):
//   https://raw.githubusercontent.com/{owner}/{repo}/cover-cdn/{draft_id}_{platform}.png
//
// No DB schema changes — draft_id is already on every item via dbAdapter.
// Missing covers (older drafts pre-Phase-2 or failed uploads) render a
// placeholder card so the failure is visible.

import { useMemo, useState } from "react";
import { useNewsRadarDB } from "@/hooks/useNewsRadarDB.js";
import { Icon } from "@/components/Icon.jsx";
import { fmtRel } from "@/lib/time.js";

// Repo coordinates — must match cover_uploader.py constants.
// If you fork the repo, override here AND there in the same commit.
const COVER_CDN_OWNER = "HsinTiger";
const COVER_CDN_REPO = "news-radar";
const COVER_CDN_BRANCH = "cover-cdn";

function coverUrl(draftId, platform) {
  return `https://raw.githubusercontent.com/${COVER_CDN_OWNER}/${COVER_CDN_REPO}/${COVER_CDN_BRANCH}/${draftId}_${platform}.png`;
}

const DATE_FILTERS = [
  { key: "7", label: "近 7 天", days: 7 },
  { key: "30", label: "近 30 天", days: 30 },
  { key: "all", label: "全部", days: null },
];

function publishedWithin(item, days) {
  if (!days) return true;
  if (!item.publish_at) return false;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(item.publish_at).getTime() >= cutoff;
}

function platformSuccess(item, platform) {
  // Truth source: publish_log (real publish-time API result).
  //
  // Earlier this read item.platforms which is the COMPOSE-time flag —
  // true if a platform_drafts row exists, regardless of whether the
  // publish API call actually succeeded. That's misleading: caused 25h
  // of "IG ✓ but actually nothing on IG profile" mystery on 2026-05-02.
  //
  // Now: look at the LATEST publish_log entry for this platform.
  //   no entry          → null  (never attempted; badge shows "—")
  //   success === true  → true  (badge shows ✓ green)
  //   success === false → false (badge shows ✗ red)
  const platformName = { fb: "facebook", ig: "instagram", threads: "threads" }[platform];
  if (!platformName) return null;

  const logs = item.publish_log;
  if (!logs || logs.length === 0) return null;

  const entries = logs.filter((l) => l.platform === platformName);
  if (entries.length === 0) return null;

  // Take the latest attempt — sort by posted_at desc, first entry wins.
  // Lex-compares ISO timestamps which is stable.
  const latest = entries.reduce(
    (a, b) => (String(a.posted_at) > String(b.posted_at) ? a : b)
  );
  return latest.success === true;
}

// Reusable thumbnail with onError swap to placeholder.
function CoverThumb({ src, label, aspectStyle }) {
  const [errored, setErrored] = useState(false);
  return (
    <div
      style={{
        ...aspectStyle,
        background: "var(--bg-inset)",
        borderRadius: 6,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {errored ? (
        <div
          style={{
            fontSize: 10,
            color: "var(--fg-3)",
            textAlign: "center",
            padding: 8,
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontSize: 18, marginBottom: 4 }}>○</div>
          無 {label} cover
          <div style={{ fontSize: 9, color: "var(--fg-4)", marginTop: 2 }}>
            (Pre-Phase 2 或 upload 失敗)
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={`${label} cover`}
          loading="lazy"
          onError={() => setErrored(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      )}
      <div
        style={{
          position: "absolute",
          bottom: 4,
          right: 4,
          background: "rgba(0,0,0,0.55)",
          color: "#fff",
          fontSize: 9,
          padding: "2px 5px",
          borderRadius: 3,
          letterSpacing: "0.04em",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function PlatformBadge({ platform, ok }) {
  const isOk = ok === true;
  const isUnknown = ok === null || ok === undefined;
  const color = isUnknown
    ? "var(--fg-4)"
    : isOk
    ? "var(--st-published)"
    : "var(--st-error)";
  const symbol = isUnknown ? "—" : isOk ? "✓" : "✗";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 999,
        background: isUnknown ? "var(--bg-inset)" : isOk ? "var(--st-published-soft, var(--bg-muted))" : "var(--bg-muted)",
        color,
        fontSize: 10,
        fontWeight: 600,
        border: `1px solid ${color}33`,
      }}
    >
      {platform.toUpperCase()} {symbol}
    </span>
  );
}

function CoverCard({ item, onOpenDetail }) {
  const draftId = item.draft_id || item.id;
  const fbUrl = coverUrl(draftId, "fb");
  const igUrl = coverUrl(draftId, "ig");
  const threadsUrl = coverUrl(draftId, "threads");

  const fbOk = platformSuccess(item, "fb");
  const igOk = platformSuccess(item, "ig");
  const threadsOk = platformSuccess(item, "threads");

  // Thumbnail sizing — 3 thumbnails fit in card width.
  // FB 1:1 (square), IG 4:5 (tall), Threads 4:5 (tall) — same as IG.
  return (
    <button
      onClick={() => onOpenDetail && onOpenDetail(item.id)}
      style={{
        textAlign: "left",
        padding: 14,
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        cursor: onOpenDetail ? "pointer" : "default",
        transition: "border-color 80ms",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "var(--fg)",
          marginBottom: 4,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 2,
          lineHeight: 1.3,
        }}
      >
        {item.title}
      </div>
      <div
        data-mono
        style={{
          fontSize: 10,
          color: "var(--fg-3)",
          marginBottom: 12,
          display: "flex",
          gap: 8,
        }}
      >
        <span>{item.publish_at ? fmtRel(item.publish_at) : "(未發布)"}</span>
        {item.topic_category && <span>· {item.topic_category}</span>}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <CoverThumb src={fbUrl} label="FB" aspectStyle={{ width: 96, height: 96 }} />
        <CoverThumb src={igUrl} label="IG" aspectStyle={{ width: 76, height: 96 }} />
        <CoverThumb src={threadsUrl} label="TH" aspectStyle={{ width: 76, height: 96 }} />
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <PlatformBadge platform="FB" ok={fbOk} />
        <PlatformBadge platform="IG" ok={igOk} />
        <PlatformBadge platform="TH" ok={threadsOk} />
      </div>
    </button>
  );
}

export function CoverPage({ openDetail }) {
  const { items, loading } = useNewsRadarDB();
  const [dateFilter, setDateFilter] = useState("30");
  const [platformFilter, setPlatformFilter] = useState("all"); // all | fb | ig | failed

  const days = DATE_FILTERS.find((f) => f.key === dateFilter)?.days ?? null;

  const visible = useMemo(() => {
    return items
      .filter((it) => it.status === "published")
      .filter((it) => publishedWithin(it, days))
      .filter((it) => {
        if (platformFilter === "all") return true;
        if (platformFilter === "fb") return platformSuccess(it, "fb");
        if (platformFilter === "ig") return platformSuccess(it, "ig");
        if (platformFilter === "failed") {
          // Show items where at least one of FB/IG failed
          return platformSuccess(it, "fb") === false || platformSuccess(it, "ig") === false;
        }
        return true;
      })
      .sort((a, b) => {
        const ta = a.publish_at ? new Date(a.publish_at).getTime() : 0;
        const tb = b.publish_at ? new Date(b.publish_at).getTime() : 0;
        return tb - ta;
      });
  }, [items, days, platformFilter]);

  if (loading) {
    return (
      <div style={{ padding: 24, color: "var(--fg-3)" }}>載入中…</div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header + filters */}
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>封面 Cover Audit</h2>
        <p style={{ margin: "4px 0 12px", fontSize: 12, color: "var(--fg-3)" }}>
          每篇貼文的 FB + IG 封面圖，從 cover-cdn branch 直接讀。點圖開大圖、點卡片開草稿詳情。
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {DATE_FILTERS.map((f) => (
            <Pill key={f.key} active={dateFilter === f.key} onClick={() => setDateFilter(f.key)}>
              {f.label}
            </Pill>
          ))}
          <span style={{ width: 1, height: 16, background: "var(--border)" }} />
          <Pill active={platformFilter === "all"} onClick={() => setPlatformFilter("all")}>
            全部
          </Pill>
          <Pill active={platformFilter === "fb"} onClick={() => setPlatformFilter("fb")}>
            FB ✓
          </Pill>
          <Pill active={platformFilter === "ig"} onClick={() => setPlatformFilter("ig")}>
            IG ✓
          </Pill>
          <Pill active={platformFilter === "failed"} onClick={() => setPlatformFilter("failed")}>
            含失敗
          </Pill>
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--fg-3)" }}>
          顯示 <strong style={{ color: "var(--fg)" }}>{visible.length}</strong> 筆
        </div>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: "var(--fg-3)",
            background: "var(--bg-muted)",
            borderRadius: 10,
            fontSize: 13,
          }}
        >
          這個篩選範圍內沒有已發布的草稿。
          <div style={{ fontSize: 11, marginTop: 8, color: "var(--fg-4)" }}>
            如果 Phase 2 剛上線，等下次 cron 跑完才會出現第一張新封面。
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 14,
          }}
        >
          {visible.map((item) => (
            <CoverCard key={item.id} item={item} onOpenDetail={openDetail} />
          ))}
        </div>
      )}
    </div>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px",
        borderRadius: 999,
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        background: active ? "var(--accent)" : "var(--bg-raised)",
        color: active ? "#fff" : "var(--fg-2)",
        fontSize: 11,
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
        transition: "all 80ms",
      }}
    >
      {children}
    </button>
  );
}
