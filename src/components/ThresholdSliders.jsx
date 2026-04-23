// ThresholdSliders — draggable AUTO_PUBLISH / RESCUE_PUBLISH / MIN_SCORE
// sliders with a live counterfactual readout over the last 7 days.
//
// The dashboard is read-only, so these sliders DO NOT write to the DB.
// Moving a slider updates the local "proposed" thresholds and runs a
// pure-JS simulation over the weighted_score series to show how many
// items would have been auto-published / rescued / dropped.
//
// Score semantics (matches backend scorer.py + run_pipeline.py):
//   weighted_score >= AUTO_PUBLISH  → auto-publish (the "clear pass")
//   MIN_SCORE <= score < AUTO_PUBLISH, ≥ RESCUE_PUBLISH → fallback/rescue
//   score < MIN_SCORE               → dropped (no draft written)
//
// If Alex wants to actually apply a change, they do it in the backend
// config. The slider UI is strictly for "what would happen if..." thinking.

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon.jsx";

const MIN = 0.5;
const MAX = 1.0;

export function ThresholdSliders({ thresholds, scores }) {
  const current = thresholds || { AUTO_PUBLISH: 0.7, RESCUE_PUBLISH: 0.65, MIN_SCORE: 0.65 };

  const [proposed, setProposed] = useState(current);

  // Enforce invariant: MIN_SCORE ≤ RESCUE_PUBLISH ≤ AUTO_PUBLISH.
  // Clamp neighbours when the user drags past the constraint instead of
  // ignoring the input — dragging feels broken if nothing happens.
  const setValue = (k, v) => {
    const clamped = Math.max(MIN, Math.min(MAX, Number(v)));
    setProposed((prev) => {
      const next = { ...prev, [k]: clamped };
      if (k === "AUTO_PUBLISH") {
        if (next.RESCUE_PUBLISH > next.AUTO_PUBLISH) next.RESCUE_PUBLISH = next.AUTO_PUBLISH;
        if (next.MIN_SCORE > next.AUTO_PUBLISH) next.MIN_SCORE = next.AUTO_PUBLISH;
      }
      if (k === "RESCUE_PUBLISH") {
        if (next.RESCUE_PUBLISH > next.AUTO_PUBLISH) next.AUTO_PUBLISH = next.RESCUE_PUBLISH;
        if (next.MIN_SCORE > next.RESCUE_PUBLISH) next.MIN_SCORE = next.RESCUE_PUBLISH;
      }
      if (k === "MIN_SCORE") {
        if (next.MIN_SCORE > next.RESCUE_PUBLISH) next.RESCUE_PUBLISH = next.MIN_SCORE;
        if (next.RESCUE_PUBLISH > next.AUTO_PUBLISH) next.AUTO_PUBLISH = next.RESCUE_PUBLISH;
      }
      return next;
    });
  };

  const reset = () => setProposed(current);
  const dirty =
    proposed.AUTO_PUBLISH !== current.AUTO_PUBLISH ||
    proposed.RESCUE_PUBLISH !== current.RESCUE_PUBLISH ||
    proposed.MIN_SCORE !== current.MIN_SCORE;

  const simCurrent = useMemo(() => simulate(scores, current), [scores, current]);
  const simProposed = useMemo(() => simulate(scores, proposed), [scores, proposed]);

  return (
    <section className="nr-card" style={{ padding: 22, marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>
          門檻模擬 (過去 7 天反事實)
        </h2>
        <span style={{ fontSize: 11, color: "var(--fg-3)" }} data-mono>
          樣本 {scores?.length ?? 0} 篇 · read-only · 不會寫回 DB
        </span>
      </div>
      <div style={{ fontSize: 11.5, color: "var(--fg-2)", marginBottom: 18, lineHeight: 1.5 }}>
        拖動下面的 slider 看「若門檻是這個值,過去 7 天會多發/少發幾篇」。真的要改請到 backend config。
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Slider
          name="AUTO_PUBLISH"
          label="AUTO_PUBLISH · 嚴格模式發文門檻"
          color="var(--st-published)"
          value={proposed.AUTO_PUBLISH}
          original={current.AUTO_PUBLISH}
          onChange={(v) => setValue("AUTO_PUBLISH", v)}
        />
        <Slider
          name="RESCUE_PUBLISH"
          label="RESCUE_PUBLISH · 空窗救援門檻"
          color="var(--st-queued)"
          value={proposed.RESCUE_PUBLISH}
          original={current.RESCUE_PUBLISH}
          onChange={(v) => setValue("RESCUE_PUBLISH", v)}
        />
        <Slider
          name="MIN_SCORE"
          label="MIN_SCORE · 最低寫稿門檻"
          color="var(--st-error)"
          value={proposed.MIN_SCORE}
          original={current.MIN_SCORE}
          onChange={(v) => setValue("MIN_SCORE", v)}
        />
      </div>

      {/* counterfactual diff */}
      <div
        style={{
          marginTop: 22,
          padding: 16,
          borderRadius: 10,
          background: "var(--bg-muted)",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        <Outcome
          label="auto-publish 數"
          before={simCurrent.autoPub}
          after={simProposed.autoPub}
          color="var(--st-published)"
        />
        <Outcome
          label="rescue 數 (fallback)"
          before={simCurrent.rescue}
          after={simProposed.rescue}
          color="var(--st-queued)"
        />
        <Outcome
          label="dropped 數"
          before={simCurrent.dropped}
          after={simProposed.dropped}
          color="var(--st-error)"
          invert
        />
      </div>

      {dirty && (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 8,
            fontSize: 11,
            color: "var(--fg-2)",
          }}
        >
          <span>已修改 proposed 值</span>
          <button
            onClick={reset}
            className="nr-hover"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              fontSize: 11,
              borderRadius: 6,
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
              color: "var(--fg-1)",
              cursor: "pointer",
            }}
          >
            <Icon name="refresh" size={11} />
            重置為目前設定
          </button>
        </div>
      )}
    </section>
  );
}

// ---------- simulate: pure function over the sorted score array ----------

function simulate(scores, th) {
  if (!scores || !scores.length) return { autoPub: 0, rescue: 0, dropped: 0 };
  let autoPub = 0;
  let rescue = 0;
  let dropped = 0;
  for (const s of scores) {
    if (s >= th.AUTO_PUBLISH) autoPub++;
    else if (s >= th.RESCUE_PUBLISH && s >= th.MIN_SCORE) rescue++;
    else if (s < th.MIN_SCORE) dropped++;
    else rescue++; // between MIN and RESCUE when RESCUE > MIN — treat as rescue-eligible
  }
  return { autoPub, rescue, dropped };
}

// ---------- UI sub-components ----------

function Slider({ name, label, color, value, original, onChange }) {
  const pct = ((value - MIN) / (MAX - MIN)) * 100;
  const origPct = ((original - MIN) / (MAX - MIN)) * 100;
  const delta = value - original;
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <label data-mono style={{ fontSize: 11, color: "var(--fg-2)" }}>
          {label}
        </label>
        <div
          style={{ display: "flex", alignItems: "baseline", gap: 10, fontSize: 12 }}
          data-mono
        >
          <span style={{ fontSize: 17, fontWeight: 600, color }}>{value.toFixed(2)}</span>
          {delta !== 0 && (
            <span
              style={{
                fontSize: 11,
                color: delta > 0 ? "var(--st-published)" : "var(--st-error)",
              }}
            >
              {delta > 0 ? "+" : ""}
              {delta.toFixed(2)} vs {original.toFixed(2)}
            </span>
          )}
        </div>
      </div>
      <div style={{ position: "relative", height: 24 }}>
        {/* track */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 11,
            height: 4,
            borderRadius: 2,
            background: "var(--bg-inset)",
          }}
        />
        {/* filled portion */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 11,
            width: `${pct}%`,
            height: 4,
            borderRadius: 2,
            background: color,
          }}
        />
        {/* original marker */}
        <div
          title={`目前設定 ${original.toFixed(2)}`}
          style={{
            position: "absolute",
            left: `${origPct}%`,
            top: 6,
            width: 2,
            height: 14,
            transform: "translateX(-1px)",
            background: "var(--fg-3)",
            opacity: 0.55,
          }}
        />
        {/* the actual (invisible) range input on top for interaction */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={0.01}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={name}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 4,
            width: "100%",
            height: 18,
            appearance: "none",
            background: "transparent",
            cursor: "pointer",
          }}
        />
      </div>
    </div>
  );
}

function Outcome({ label, before, after, color, invert }) {
  const diff = after - before;
  const goodDir = invert ? diff <= 0 : diff >= 0;
  const diffColor =
    diff === 0 ? "var(--fg-3)" : goodDir ? "var(--st-published)" : "var(--st-error)";
  return (
    <div>
      <div
        data-mono
        style={{
          fontSize: 10,
          color: "var(--fg-3)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
        <div data-mono style={{ fontSize: 22, fontWeight: 600, color }}>
          {after}
        </div>
        <div style={{ fontSize: 11, color: "var(--fg-3)" }} data-mono>
          (目前 {before})
        </div>
      </div>
      <div style={{ marginTop: 3, fontSize: 11, color: diffColor }} data-mono>
        {diff > 0 ? "+" : ""}
        {diff} 篇
      </div>
    </div>
  );
}
