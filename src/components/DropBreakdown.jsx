// DropBreakdown — horizontal stacked bar for drop_reason counts.
//
// Split into "permanent" and "retry" blocks so Alex can see at a glance
// whether drops are scorer judgement calls or transient infra issues.
// If any single reason exceeds 60% of the total, a hint chip appears
// linking to the Settings page (so Alex can adjust the relevant threshold).
//
// Categorization lives in dbAdapter.js DROP_REASON_CATEGORY — keep in sync
// with the backend scorer's drop_reason literals.

import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/Icon.jsx";

const REASON_LABEL = {
  score_too_low:       "分數不夠",
  topic_downweighted:  "主題被降權",
  duplicate:           "重複新聞",
  pure_feature_update: "純功能更新",
  off_topic:           "偏離主題",
  image_fetch_failed:  "抓圖失敗",
  llm_rate_limited:    "LLM 限流",
  llm_error:           "LLM 錯誤",
  scorer_error:        "Scorer 錯誤",
};

// Deterministic palette — same reason always gets the same shade.
const REASON_COLOR = {
  score_too_low:       "var(--st-error)",
  topic_downweighted:  "var(--st-queued)",
  duplicate:           "var(--st-scored)",
  pure_feature_update: "var(--fg-2)",
  off_topic:           "var(--st-drafted)",
  image_fetch_failed:  "var(--accent)",
  llm_rate_limited:    "var(--accent)",
  llm_error:           "var(--st-error)",
  scorer_error:        "var(--st-error)",
};

export function DropBreakdown({ dropBreakdown }) {
  const navigate = useNavigate();
  const { reasons = [], total = 0, dominantReason } = dropBreakdown || {};

  const permanent = reasons.filter((r) => r.category === "permanent");
  const retry = reasons.filter((r) => r.category === "retry");
  const permTotal = permanent.reduce((s, r) => s + r.count, 0);
  const retryTotal = retry.reduce((s, r) => s + r.count, 0);

  if (total === 0) {
    return (
      <section className="nr-card" style={{ padding: 20, marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600 }}>Drop 分佈</h2>
        <div style={{ fontSize: 12, color: "var(--fg-3)" }}>沒有被 drop 的新聞</div>
      </section>
    );
  }

  return (
    <section className="nr-card" style={{ padding: 20, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>
          Drop 分佈
        </h2>
        <span style={{ fontSize: 12, color: "var(--fg-3)" }}>
          共 <span data-mono style={{ color: "var(--fg-1)" }}>{total}</span> 篇 ·
          永久 <span data-mono style={{ color: "var(--fg-1)" }}>{permTotal}</span> ·
          可重試 <span data-mono style={{ color: "var(--fg-1)" }}>{retryTotal}</span>
        </span>
        {dominantReason && (
          <button
            onClick={() => navigate("/settings")}
            style={{
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              fontSize: 11,
              fontWeight: 500,
              borderRadius: 999,
              background: "color-mix(in oklab, var(--st-queued) 12%, transparent)",
              border: "1px solid color-mix(in oklab, var(--st-queued) 28%, var(--border))",
              color: "var(--st-queued)",
              cursor: "pointer",
            }}
            className="nr-hover"
            title="到設定頁檢視 / 調整"
          >
            <Icon name="alert" size={12} stroke="var(--st-queued)" />
            <span>
              {REASON_LABEL[dominantReason.code] || dominantReason.code} 佔{" "}
              {(dominantReason.share * 100).toFixed(0)}%
            </span>
            <span style={{ color: "var(--fg-3)" }}>→ 設定頁</span>
          </button>
        )}
      </div>

      {/* Stacked bar — permanent on left, retry on right, with thin divider */}
      <div
        style={{
          display: "flex",
          height: 22,
          borderRadius: 6,
          overflow: "hidden",
          background: "var(--bg-inset)",
        }}
      >
        {[...permanent, ...retry].map((r, i, arr) => {
          const w = (r.count / total) * 100;
          const isLastPerm = r.category === "permanent" && (arr[i + 1]?.category === "retry");
          return (
            <div
              key={r.code}
              title={`${REASON_LABEL[r.code] || r.code} · ${r.count} 篇 (${(r.share * 100).toFixed(0)}%)`}
              style={{
                width: `${w}%`,
                background: REASON_COLOR[r.code] || "var(--fg-3)",
                borderRight: isLastPerm ? "2px solid var(--bg-raised)" : "none",
                display: "grid",
                placeItems: "center",
                fontSize: 10,
                fontWeight: 600,
                color: "#fff",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
              data-mono
            >
              {w >= 8 ? r.count : ""}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "6px 14px",
          marginTop: 12,
        }}
      >
        {reasons.map((r) => (
          <div
            key={r.code}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 11.5,
              color: "var(--fg-1)",
            }}
          >
            <span
              className="nr-dot"
              style={{ background: REASON_COLOR[r.code] || "var(--fg-3)", width: 8, height: 8 }}
            />
            <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {REASON_LABEL[r.code] || r.code}
            </span>
            <span
              data-mono
              style={{ fontSize: 10.5, color: "var(--fg-3)", textTransform: "uppercase" }}
              title={r.category === "permanent" ? "永久（判斷）" : "可重試（暫時性）"}
            >
              {r.category === "permanent" ? "永久" : "重試"}
            </span>
            <span data-mono style={{ fontWeight: 600, color: "var(--fg)" }}>
              {r.count}
            </span>
            <span data-mono style={{ fontSize: 10.5, color: "var(--fg-3)" }}>
              {(r.share * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
