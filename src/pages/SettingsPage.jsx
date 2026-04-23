// SettingsPage — read-only view of scoring thresholds, topic weights, and recent reflector runs.
// All values come from the automated system; dashboard cannot edit.

import { Fragment } from "react";
import { Icon } from "@/components/Icon.jsx";
import { RelTime } from "@/components/RelTime.jsx";
import { ThresholdSliders } from "@/components/ThresholdSliders.jsx";
import { useNewsRadarDB } from "@/hooks/useNewsRadarDB.js";

export function SettingsPage() {
  const { system, topics: allTopics, counterfactualScores } = useNewsRadarDB();
  const topics = [...allTopics].sort((a, b) => b.weight - a.weight);
  const thresholds = system.thresholds;
  const reflections = system.reflections || [];

  return (
    <div style={{ padding: "20px 28px 40px" }}>
      <div
        className="nr-card"
        style={{
          padding: "12px 16px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--bg-muted)",
        }}
      >
        <Icon name="info" size={14} stroke="var(--fg-2)" />
        <span style={{ fontSize: 12, color: "var(--fg-1)" }}>
          此頁<strong>純顯示</strong>。所有設定由自動系統調整，Alex 無法從 dashboard 改動。
        </span>
      </div>

      {/* Phase 1D: interactive threshold sliders + 7-day counterfactual */}
      <ThresholdSliders thresholds={thresholds} scores={counterfactualScores} />

      {/* thresholds */}
      <section className="nr-card" style={{ padding: 22, marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>
            發文門檻
          </h2>
          <span style={{ fontSize: 11, color: "var(--fg-3)" }} data-mono>
            2026-04-23 起 · 量取勝 2 週實驗
          </span>
        </div>

        <div style={{ position: "relative", height: 50, margin: "0 20px 10px" }}>
          {/* axis line */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 20,
              height: 3,
              borderRadius: 2,
              background:
                "linear-gradient(to right, var(--st-error) 0%, var(--st-queued) 50%, var(--st-published) 100%)",
              opacity: 0.35,
            }}
          />
          {/* 0.5 .. 1.0 ticks */}
          {[0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((t) => {
            const x = ((t - 0.5) / 0.5) * 100;
            return (
              <Fragment key={t}>
                <div
                  style={{
                    position: "absolute",
                    left: `${x}%`,
                    top: 16,
                    width: 1,
                    height: 11,
                    background: "var(--fg-3)",
                    opacity: 0.4,
                  }}
                />
                <div
                  data-mono
                  style={{
                    position: "absolute",
                    left: `${x}%`,
                    top: 33,
                    fontSize: 10,
                    color: "var(--fg-3)",
                    transform: "translateX(-50%)",
                  }}
                >
                  {t.toFixed(1)}
                </div>
              </Fragment>
            );
          })}
          {/* markers */}
          {[
            { v: 0.65, label: "RESCUE", color: "var(--st-queued)", top: -4 },
            { v: 0.7, label: "AUTO", color: "var(--st-published)", top: -4 },
          ].map((m) => {
            const x = ((m.v - 0.5) / 0.5) * 100;
            return (
              <div
                key={m.v}
                style={{
                  position: "absolute",
                  left: `${x}%`,
                  top: m.top,
                  transform: "translateX(-50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  data-mono
                  style={{ fontSize: 10, fontWeight: 600, color: m.color, marginBottom: 1 }}
                >
                  {m.label}
                </div>
                <div style={{ width: 2, height: 28, background: m.color, borderRadius: 1 }} />
              </div>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 18 }}>
          {[
            { k: "AUTO_PUBLISH", v: thresholds.AUTO_PUBLISH, hint: "≥ 此分 → 嚴格模式發文" },
            { k: "RESCUE_PUBLISH", v: thresholds.RESCUE_PUBLISH, hint: "≥ 此分 → 避免空窗時發文" },
            { k: "MIN_SCORE", v: thresholds.MIN_SCORE, hint: "< 此分 → dropped，不寫稿" },
          ].map((t) => (
            <div
              key={t.k}
              style={{ padding: "12px 14px", background: "var(--bg-muted)", borderRadius: 8 }}
            >
              <div data-mono style={{ fontSize: 10, color: "var(--fg-3)", marginBottom: 4 }}>
                {t.k}
              </div>
              <div data-mono style={{ fontSize: 20, fontWeight: 600, color: "var(--fg)" }}>
                {t.v.toFixed(2)}
              </div>
              <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 3 }}>{t.hint}</div>
            </div>
          ))}
        </div>
      </section>

      {/* topic weights */}
      <section className="nr-card" style={{ padding: 22, marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>
            主題權重
          </h2>
          <span style={{ fontSize: 11, color: "var(--fg-3)" }}>
            <span data-mono>{topics.length}</span> 類 · 每週由 reflector back-prop 調整
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {topics.map((t) => {
            const width = (t.weight / 2.0) * 100;
            const barColor =
              t.weight >= 1.3
                ? "var(--st-published)"
                : t.weight >= 1.0
                ? "var(--st-drafted)"
                : t.weight >= 0.7
                ? "var(--st-queued)"
                : "var(--st-error)";
            return (
              <div
                key={t.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "200px 1fr 70px 70px 90px",
                  alignItems: "center",
                  gap: 12,
                  padding: "7px 0",
                  borderBottom:
                    "1px dashed color-mix(in oklab, var(--border) 60%, transparent)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <span style={{ fontSize: 15 }}>{t.emoji}</span>
                  <span style={{ color: "var(--fg)" }}>{t.name}</span>
                  <span data-mono style={{ fontSize: 10, color: "var(--fg-4)" }}>
                    {t.id}
                  </span>
                </div>
                <div style={{ position: "relative", height: 18 }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 7,
                      right: 0,
                      height: 4,
                      background: "var(--bg-inset)",
                      borderRadius: 2,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 7,
                      width: `${width}%`,
                      height: 4,
                      background: barColor,
                      borderRadius: 2,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: 0,
                      bottom: 0,
                      width: 1,
                      background: "var(--border-strong)",
                      opacity: 0.5,
                    }}
                  />
                </div>
                <div
                  data-mono
                  style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)", textAlign: "right" }}
                >
                  {t.weight.toFixed(2)}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    color:
                      t.last_delta > 0
                        ? "var(--st-published)"
                        : t.last_delta < 0
                        ? "var(--st-error)"
                        : "var(--fg-3)",
                    justifyContent: "flex-end",
                  }}
                  data-mono
                >
                  {t.last_delta > 0 ? "↗" : t.last_delta < 0 ? "↘" : "→"}{" "}
                  {t.last_delta > 0 ? "+" : ""}
                  {t.last_delta.toFixed(2)}
                </div>
                <div data-mono style={{ fontSize: 11, color: "var(--fg-3)", textAlign: "right" }}>
                  {t.samples} 篇
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* reflection events */}
      <section className="nr-card" style={{ padding: 22 }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>
          最近 reflector 執行
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {reflections.map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 14,
                padding: "10px 12px",
                background: "var(--bg-muted)",
                borderRadius: 8,
              }}
            >
              <div style={{ width: 90, fontSize: 11, color: "var(--fg-2)" }}>
                <RelTime date={r.at} showAbs={false} />
              </div>
              <div style={{ width: 70 }}>
                <div data-mono style={{ fontSize: 13, fontWeight: 600 }}>
                  {r.samples}
                </div>
                <div style={{ fontSize: 10, color: "var(--fg-3)" }}>samples</div>
              </div>
              <div style={{ width: 70 }}>
                <div
                  data-mono
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: r.rules_added > 0 ? "var(--accent)" : "var(--fg-3)",
                  }}
                >
                  +{r.rules_added}
                </div>
                <div style={{ fontSize: 10, color: "var(--fg-3)" }}>規則</div>
              </div>
              <div style={{ flex: 1, fontSize: 12, color: "var(--fg-1)", lineHeight: 1.5 }}>
                {r.rationale}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
