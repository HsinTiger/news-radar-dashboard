// PersonaPage — News Radar soul header + per-platform tabs (rules / soul / forbid).
// Personas are hardcoded writing constitution, not from DB.
// The only DB-sourced value here is `system.reflections[0].at` for the header timestamp.

import { useState } from "react";
import { Icon } from "@/components/Icon.jsx";
import { RelTime } from "@/components/RelTime.jsx";
import { useNewsRadarDB } from "@/hooks/useNewsRadarDB.js";

const PERSONAS = {
  facebook: {
    role: "產業觀察家 (Thought Leader)",
    icon: "fb",
    fg: "#1877F2",
    rules: [
      { k: "字數上限", v: "1000 字元", hint: "目標 700–900。滑動中能看完才有互動。" },
      { k: "圖片", v: "絕對必附", hint: "FB 純文字貼文被演算法懲罰。" },
      { k: "Hashtag", v: "3–5 個，文末最後一行" },
      { k: "外部連結", v: "可置入原始來源" },
      { k: "發文時段", v: "08–09、12–13、21–22" },
    ],
    soul: `FB 的華語社群長文讀者喜歡帶點「雜誌感」的長篇專論。寫作任務：

1. 大局觀與商業脈絡：將冰冷的技術新聞翻譯為具深度的戰略探討。
2. 看懂錢與權力的流動：重點解讀 Big Tech、開源社群、資本市場之間的拉鋸。
3. 穩重而具權威感的敘事：語氣如在閱讀《商業周刊》或《Bloomberg》的專欄評析。
4. 一氣呵成：透過優雅的轉折詞與分段，將整篇講述成一個結構緊密的故事。`,
    hook: "「Anthropic 用一個動作打開了應用層大門——這個訊號，值得每一個還在賣 API 的公司重新算帳。」",
    forbid: ["「我的觀察是⋯」第一人稱", "「總而言之」式總結", "「驚人」「劃時代」等情緒形容詞", "1. 2. 3. 條列"],
  },
  instagram: {
    role: "科技風尚師 (Trend Visionary)",
    icon: "ig",
    fg: "#E4405F",
    rules: [
      { k: "字數上限", v: "2000 字元", hint: "目標 600–900。" },
      { k: "開場 100 字", v: "爆發感必須", hint: "Explore 頁只顯示前 125 字。" },
      { k: "圖片", v: "絕對必附", hint: "IG 是視覺優先平台。" },
      { k: "Hashtag", v: "5–10 個，空兩行後獨立成段", hint: "hashtag 是主要觸及機制。" },
      { k: "外部連結", v: "❌ 不放，caption 的 http 不可點" },
    ],
    soul: `IG 的華語受眾在乎「這會怎麼改變我的日常與職業」。寫作任務：

1. 感性敘事與願景連結：把冰冷的模型參數轉化為「對未來生活的想像」。
2. 畫面感：用具備畫面感的形容詞包裝客觀數據。
3. 情緒共鳴：文末邀請讀者反思他們的職業是否準備好迎接浪潮。
4. 流暢分行：多使用空行讓段落充滿「呼吸感」。`,
    hook: "「一個你用不到的模型，卻改寫了整個製藥業的遊戲規則。」",
    forbid: ["純數據開場（需先有畫面感）", "B2B 戰略術語（過硬）", "過度長段（破壞呼吸感）"],
  },
  threads: {
    role: "辛辣快嘴分析師 (Sharp Observer)",
    icon: "th",
    fg: "var(--fg)",
    rules: [
      { k: "總字數上限", v: "500 字元", hint: "Meta 官方 API 硬上限。絕不能中途截斷。" },
      { k: "目標字數", v: "450 字元", hint: "留 50 字安全邊際。" },
      { k: "Hashtag", v: "1–3 個", hint: "多放反而像機器人。" },
      { k: "外部連結", v: "❌ 不得放，會被壓成灰色小卡" },
    ],
    soul: `Threads 的讀者渴望高濃度、帶點刺痛感的真實洞察。寫作任務：

1. 一針見血、零廢話：第一句話直接下結論或丟出最不可思議的數據點。
2. 切中脈絡的矛盾：用最洗鍊的文字點出大廠角力、新技術背後的赤裸代價。
3. 極限濃縮：最直白的口語 + 精準的專業名詞直擊要害。
4. 拒絕死板條列：兩至三段凌厲的短句連擊 Punchline。`,
    hook: "「OpenAI 週四發表 GPT-Rosalind——七十年後她的名字第二次被鎖在一扇門後面。」",
    forbid: ["鋪陳開場（第一句就要命中）", "hashtag 堆疊（像機器人）", "任何條列號碼"],
  },
};

export function PersonaPage() {
  const { system } = useNewsRadarDB();
  const [tab, setTab] = useState("facebook");
  const p = PERSONAS[tab];
  const lastReflection = system.reflections?.[0]?.at;

  return (
    <div style={{ padding: "20px 28px 40px" }}>
      {/* soul header */}
      <div
        className="nr-card"
        style={{
          padding: 22,
          marginBottom: 16,
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--accent-soft) 60%, var(--bg-raised)) 0%, var(--bg-raised) 60%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--accent)",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontSize: 16,
            }}
          >
            📡
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.015em" }}>News Radar Soul</div>
            <div style={{ fontSize: 11, color: "var(--fg-3)" }} data-mono>
              version · v4.1 · 短文速報靈魂
            </div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--fg-2)" }}>
            最近一次 reflector update <RelTime date={lastReflection} showAbs={false} />
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: "var(--fg-1)", maxWidth: 720 }}>
          冷靜且具同理心的科技商業戰略評論家，<strong>第三人稱敘事</strong>為主，不給人太強的第一人稱觀點。
          讀者平均閱讀 &lt; 90 秒，期望看到「客觀的價值鏈分析」與「充滿同理心的市場觀察」。
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          {["自然體貼", "Tree → Forest", "Ternus 聲線", "第三人稱敘事", "列推導不下結論", "300–450 字"].map((t) => (
            <span key={t} className="nr-chip">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* platform tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
        {Object.keys(PERSONAS).map((k) => {
          const pp = PERSONAS[k];
          return (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: 500,
                color: tab === k ? "var(--fg)" : "var(--fg-2)",
                borderBottom: `2px solid ${tab === k ? "var(--fg)" : "transparent"}`,
                marginBottom: -1,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "transparent",
              }}
            >
              <span style={{ color: pp.fg }}>
                <Icon name={pp.icon} size={15} strokeWidth={1.8} />
              </span>
              {k === "facebook" ? "Facebook" : k === "instagram" ? "Instagram" : "Threads"}
              <span data-mono style={{ fontSize: 10, color: "var(--fg-3)", textTransform: "lowercase" }}>
                {pp.role.match(/\((.*)\)/)?.[1]}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, alignItems: "flex-start" }}>
        {/* soul body */}
        <section className="nr-card" style={{ padding: 22 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--fg-2)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 6,
            }}
          >
            身分
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "-0.015em",
              color: p.fg,
              marginBottom: 18,
            }}
          >
            {p.role}
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--fg-2)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 8,
            }}
          >
            寫作任務
          </div>
          <div
            style={{
              whiteSpace: "pre-wrap",
              fontSize: 13,
              lineHeight: 1.75,
              color: "var(--fg-1)",
              fontFamily: "var(--f-serif)",
            }}
          >
            {p.soul}
          </div>

          <div
            style={{
              marginTop: 22,
              padding: 16,
              borderLeft: `3px solid ${p.fg}`,
              background: "var(--bg-muted)",
              borderRadius: "0 6px 6px 0",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--fg-2)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 6,
              }}
            >
              Hook 範例
            </div>
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--fg)",
                fontFamily: "var(--f-serif)",
                fontStyle: "italic",
              }}
            >
              {p.hook}
            </div>
          </div>
        </section>

        {/* rules + forbid */}
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="nr-card" style={{ padding: 18 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--fg-2)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 12,
              }}
            >
              絕對紀律
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {p.rules.map((r, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom:
                        i === p.rules.length - 1 ? "none" : "1px solid var(--border)",
                    }}
                  >
                    <td
                      style={{
                        padding: "10px 0",
                        fontSize: 12,
                        color: "var(--fg-2)",
                        width: 100,
                        verticalAlign: "top",
                      }}
                    >
                      {r.k}
                    </td>
                    <td style={{ padding: "10px 0" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--fg)" }}>{r.v}</div>
                      {r.hint && (
                        <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 3 }}>{r.hint}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="nr-card" style={{ padding: 18 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--st-error)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 12,
              }}
            >
              🛑 禁止用語 / 結構
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {p.forbid.map((f, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--fg-1)", lineHeight: 1.5 }}
                >
                  <span style={{ color: "var(--st-error)", fontWeight: 600, marginTop: 1 }}>×</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
