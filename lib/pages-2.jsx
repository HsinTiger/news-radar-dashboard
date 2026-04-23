/* global React, Icon, StatusPill, ScoreChip, PlatformBadges, RelTime */
const { useState: useS2, useMemo: useM2 } = React;

// =================== DROPPED ===================
const DroppedPage = () => {
  const items = window.MOCK_ITEMS.filter(i => i.status === "dropped");
  const reasonMap = {
    score_too_low:      { label: "分數不夠",     fg: "var(--st-error)" },
    topic_downweighted: { label: "主題被降權",   fg: "var(--st-queued)" },
    duplicate:          { label: "重複新聞",     fg: "var(--st-scored)" },
    pure_feature_update:{ label: "純功能更新",   fg: "var(--fg-2)" },
  };

  const [activeReason, setActiveReason] = useS2("all");
  const filtered = activeReason === "all" ? items : items.filter(i => i.drop_reason === activeReason);

  const byReason = {};
  items.forEach(i => byReason[i.drop_reason] = (byReason[i.drop_reason] || 0) + 1);

  return (
    <div style={{ padding: "20px 28px 40px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => setActiveReason("all")}
          style={pillStyle(activeReason === "all")}>
          全部 <span data-mono style={{ opacity: .7, marginLeft: 4 }}>{items.length}</span>
        </button>
        {Object.entries(byReason).map(([r, n]) => (
          <button key={r} onClick={() => setActiveReason(r)}
            style={pillStyle(activeReason === r)}>
            <span className="nr-dot" style={{ background: reasonMap[r]?.fg || "var(--fg-3)", width: 6, height: 6, marginRight: 6 }}/>
            {reasonMap[r]?.label || r}
            <span data-mono style={{ opacity: .7, marginLeft: 4 }}>{n}</span>
          </button>
        ))}
      </div>

      <div className="nr-card" style={{ padding: "14px 18px", marginBottom: 14,
        display: "flex", alignItems: "flex-start", gap: 10,
        background: "color-mix(in oklab, var(--accent-soft) 50%, var(--bg-raised))",
        borderColor: "color-mix(in oklab, var(--accent) 15%, var(--border))" }}>
        <Icon name="info" size={16} stroke="var(--accent)"/>
        <div style={{ fontSize: 12.5, color: "var(--fg-1)", lineHeight: 1.55 }}>
          這頁列的是 scorer 判定 <strong>不值得發</strong> 的新聞。有時分數臨界、主題被低估，Alex 可以自己點原文判斷要不要截圖手動發。
          <strong>Dashboard 不會改動這裡的資料</strong>——一切還是自動化系統決定。
        </div>
      </div>

      <div className="nr-card" style={{ overflow: "hidden" }}>
        {filtered.map((it, idx) => {
          const rm = reasonMap[it.drop_reason] || { label: it.drop_reason, fg: "var(--fg-3)" };
          const topic = window.MOCK_TOPIC_BY_ID(it.topic_id);
          return (
            <div key={it.id} style={{
              padding: "16px 18px",
              borderBottom: idx === filtered.length - 1 ? "none" : "1px solid var(--border)",
              display: "grid", gridTemplateColumns: "1fr 150px 130px 100px 32px", gap: 16, alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--fg-1)", lineHeight: 1.4 }}>{it.title}</div>
                <div style={{ fontSize: 11.5, color: "var(--fg-3)", marginTop: 4, lineHeight: 1.5, maxWidth: 620 }}>
                  {it.drop_detail}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, fontSize: 11, color: "var(--fg-3)" }}>
                  <span><Icon name="rss" size={10}/> {it.feed_name}</span>
                  <span>·</span>
                  <RelTime date={it.published_at} showAbs={false}/>
                  <span>·</span>
                  <span>{topic.emoji} <span data-mono style={{ color: "var(--fg-2)" }}>{it.topic_id}</span></span>
                </div>
              </div>
              <div>
                <span className="nr-chip" style={{ background: "color-mix(in oklab," + rm.fg + " 10%, transparent)",
                  color: rm.fg, borderColor: "color-mix(in oklab," + rm.fg + " 20%, var(--border))" }}>
                  <span className="nr-dot" style={{ background: rm.fg, width: 6, height: 6 }}/>
                  {rm.label}
                </span>
              </div>
              <div><ScoreChip score={it.confidence_score} weighted={it.weighted_score}/></div>
              <div style={{ fontSize: 12, color: "var(--fg-2)" }}>
                <RelTime date={it.published_at} showAbs={false}/>
              </div>
              <a href={it.source_url} target="_blank" rel="noreferrer"
                onClick={e => e.stopPropagation()}
                style={{ width: 32, height: 32, borderRadius: 6, display: "grid", placeItems: "center", color: "var(--fg-2)" }}
                className="nr-hover" title="打開原始新聞">
                <Icon name="external" size={14}/>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const pillStyle = (active) => ({
  padding: "6px 12px", fontSize: 12, fontWeight: 500,
  borderRadius: 999, border: "1px solid " + (active ? "var(--fg)" : "var(--border)"),
  background: active ? "var(--fg)" : "var(--bg-raised)",
  color: active ? "var(--bg)" : "var(--fg-1)",
  display: "inline-flex", alignItems: "center",
});

// =================== PERSONA ===================
const PersonaPage = () => {
  const [tab, setTab] = useS2("facebook");
  const personas = {
    facebook: {
      role: "產業觀察家 (Thought Leader)",
      icon: "fb", fg: "#1877F2",
      rules: [
        { k: "字數上限", v: "1000 字元", hint: "目標 700–900。滑動中能看完才有互動。" },
        { k: "圖片",     v: "絕對必附", hint: "FB 純文字貼文被演算法懲罰。" },
        { k: "Hashtag",  v: "3–5 個，文末最後一行" },
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
      icon: "ig", fg: "#E4405F",
      rules: [
        { k: "字數上限", v: "2000 字元", hint: "目標 600–900。" },
        { k: "開場 100 字", v: "爆發感必須", hint: "Explore 頁只顯示前 125 字。" },
        { k: "圖片",     v: "絕對必附", hint: "IG 是視覺優先平台。" },
        { k: "Hashtag",  v: "5–10 個，空兩行後獨立成段", hint: "hashtag 是主要觸及機制。" },
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
      icon: "th", fg: "var(--fg)",
      rules: [
        { k: "總字數上限", v: "500 字元", hint: "Meta 官方 API 硬上限。絕不能中途截斷。" },
        { k: "目標字數",   v: "450 字元", hint: "留 50 字安全邊際。" },
        { k: "Hashtag",    v: "1–3 個", hint: "多放反而像機器人。" },
        { k: "外部連結",   v: "❌ 不得放，會被壓成灰色小卡" },
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

  const p = personas[tab];

  return (
    <div style={{ padding: "20px 28px 40px" }}>
      {/* soul header */}
      <div className="nr-card" style={{ padding: 22, marginBottom: 16,
        background: "linear-gradient(135deg, color-mix(in oklab, var(--accent-soft) 60%, var(--bg-raised)) 0%, var(--bg-raised) 60%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "var(--accent)", display: "grid", placeItems: "center",
            color: "#fff", fontSize: 16,
          }}>📡</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.015em" }}>News Radar Soul</div>
            <div style={{ fontSize: 11, color: "var(--fg-3)" }} data-mono>version · v4.1 · 短文速報靈魂</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--fg-2)" }}>
            最近一次 reflector update <RelTime date={window.MOCK_SYSTEM.reflections[0].at} showAbs={false}/>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: "var(--fg-1)", maxWidth: 720 }}>
          冷靜且具同理心的科技商業戰略評論家，<strong>第三人稱敘事</strong>為主，不給人太強的第一人稱觀點。
          讀者平均閱讀 &lt; 90 秒，期望看到「客觀的價值鏈分析」與「充滿同理心的市場觀察」。
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          {["自然體貼", "Tree → Forest", "Ternus 聲線", "第三人稱敘事", "列推導不下結論", "300–450 字"].map(t => (
            <span key={t} className="nr-chip">{t}</span>
          ))}
        </div>
      </div>

      {/* platform tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
        {Object.keys(personas).map(k => {
          const pp = personas[k];
          return (
            <button key={k} onClick={() => setTab(k)}
              style={{
                padding: "10px 16px", fontSize: 13, fontWeight: 500,
                color: tab === k ? "var(--fg)" : "var(--fg-2)",
                borderBottom: `2px solid ${tab === k ? "var(--fg)" : "transparent"}`,
                marginBottom: -1,
                display: "inline-flex", alignItems: "center", gap: 8,
              }}>
              <span style={{ color: pp.fg }}><Icon name={pp.icon} size={15} strokeWidth={1.8}/></span>
              {k === "facebook" ? "Facebook" : k === "instagram" ? "Instagram" : "Threads"}
              <span data-mono style={{ fontSize: 10, color: "var(--fg-3)", textTransform: "lowercase" }}>{pp.role.match(/\((.*)\)/)?.[1]}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, alignItems: "flex-start" }}>
        {/* soul body */}
        <section className="nr-card" style={{ padding: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
            身分
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.015em", color: p.fg, marginBottom: 18 }}>
            {p.role}
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            寫作任務
          </div>
          <div style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.75, color: "var(--fg-1)", fontFamily: "var(--f-serif)" }}>
            {p.soul}
          </div>

          <div style={{ marginTop: 22, padding: 16, borderLeft: `3px solid ${p.fg}`, background: "var(--bg-muted)", borderRadius: "0 6px 6px 0" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Hook 範例
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--fg)", fontFamily: "var(--f-serif)", fontStyle: "italic" }}>
              {p.hook}
            </div>
          </div>
        </section>

        {/* rules + forbid */}
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="nr-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
              絕對紀律
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {p.rules.map((r, i) => (
                  <tr key={i} style={{ borderBottom: i === p.rules.length - 1 ? "none" : "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 0", fontSize: 12, color: "var(--fg-2)", width: 100, verticalAlign: "top" }}>{r.k}</td>
                    <td style={{ padding: "10px 0" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--fg)" }}>{r.v}</div>
                      {r.hint && <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 3 }}>{r.hint}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="nr-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--st-error)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
              🛑 禁止用語 / 結構
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {p.forbid.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--fg-1)", lineHeight: 1.5 }}>
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
};

// =================== SETTINGS ===================
const SettingsPage = () => {
  const sys = window.MOCK_SYSTEM;
  const topics = [...window.MOCK_TOPICS].sort((a, b) => b.weight - a.weight);

  return (
    <div style={{ padding: "20px 28px 40px" }}>
      <div className="nr-card" style={{ padding: "12px 16px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 10,
        background: "var(--bg-muted)" }}>
        <Icon name="info" size={14} stroke="var(--fg-2)"/>
        <span style={{ fontSize: 12, color: "var(--fg-1)" }}>
          此頁<strong>純顯示</strong>。所有設定由自動系統調整，Alex 無法從 dashboard 改動。
        </span>
      </div>

      {/* thresholds */}
      <section className="nr-card" style={{ padding: 22, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>發文門檻</h2>
          <span style={{ fontSize: 11, color: "var(--fg-3)" }} data-mono>2026-04-23 起 · 量取勝 2 週實驗</span>
        </div>

        <div style={{ position: "relative", height: 50, margin: "0 20px 10px" }}>
          {/* axis line */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 20, height: 3, borderRadius: 2,
            background: "linear-gradient(to right, var(--st-error) 0%, var(--st-queued) 50%, var(--st-published) 100%)",
            opacity: 0.35 }}/>
          {/* 0.5 .. 1.0 ticks */}
          {[0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map(t => {
            const x = ((t - 0.5) / 0.5) * 100;
            return (
              <React.Fragment key={t}>
                <div style={{ position: "absolute", left: `${x}%`, top: 16, width: 1, height: 11, background: "var(--fg-3)", opacity: .4 }}/>
                <div data-mono style={{ position: "absolute", left: `${x}%`, top: 33, fontSize: 10, color: "var(--fg-3)", transform: "translateX(-50%)" }}>{t.toFixed(1)}</div>
              </React.Fragment>
            );
          })}
          {/* markers */}
          {[
            { v: 0.65, label: "RESCUE", color: "var(--st-queued)", top: -4 },
            { v: 0.70, label: "AUTO",   color: "var(--st-published)", top: -4 },
          ].map(m => {
            const x = ((m.v - 0.5) / 0.5) * 100;
            return (
              <div key={m.v} style={{ position: "absolute", left: `${x}%`, top: m.top, transform: "translateX(-50%)",
                display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div data-mono style={{ fontSize: 10, fontWeight: 600, color: m.color, marginBottom: 1 }}>{m.label}</div>
                <div style={{ width: 2, height: 28, background: m.color, borderRadius: 1 }}/>
              </div>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 18 }}>
          {[
            { k: "AUTO_PUBLISH", v: sys.thresholds.AUTO_PUBLISH, hint: "≥ 此分 → 嚴格模式發文" },
            { k: "RESCUE_PUBLISH", v: sys.thresholds.RESCUE_PUBLISH, hint: "≥ 此分 → 避免空窗時發文" },
            { k: "MIN_SCORE", v: sys.thresholds.MIN_SCORE, hint: "< 此分 → dropped，不寫稿" },
          ].map(t => (
            <div key={t.k} style={{ padding: "12px 14px", background: "var(--bg-muted)", borderRadius: 8 }}>
              <div data-mono style={{ fontSize: 10, color: "var(--fg-3)", marginBottom: 4 }}>{t.k}</div>
              <div data-mono style={{ fontSize: 20, fontWeight: 600, color: "var(--fg)" }}>{t.v.toFixed(2)}</div>
              <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 3 }}>{t.hint}</div>
            </div>
          ))}
        </div>
      </section>

      {/* topic weights */}
      <section className="nr-card" style={{ padding: 22, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>主題權重</h2>
          <span style={{ fontSize: 11, color: "var(--fg-3)" }}>
            <span data-mono>{topics.length}</span> 類 · 每週由 reflector back-prop 調整
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {topics.map(t => {
            const width = (t.weight / 2.0) * 100;
            const barColor = t.weight >= 1.3 ? "var(--st-published)" :
                             t.weight >= 1.0 ? "var(--st-drafted)" :
                             t.weight >= 0.7 ? "var(--st-queued)" : "var(--st-error)";
            return (
              <div key={t.id} style={{ display: "grid", gridTemplateColumns: "200px 1fr 70px 70px 90px",
                alignItems: "center", gap: 12, padding: "7px 0",
                borderBottom: "1px dashed color-mix(in oklab, var(--border) 60%, transparent)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <span style={{ fontSize: 15 }}>{t.emoji}</span>
                  <span style={{ color: "var(--fg)" }}>{t.name}</span>
                  <span data-mono style={{ fontSize: 10, color: "var(--fg-4)" }}>{t.id}</span>
                </div>
                <div style={{ position: "relative", height: 18 }}>
                  <div style={{ position: "absolute", left: 0, top: 7, right: 0, height: 4,
                    background: "var(--bg-inset)", borderRadius: 2 }}/>
                  <div style={{ position: "absolute", left: 0, top: 7, width: `${width}%`, height: 4,
                    background: barColor, borderRadius: 2 }}/>
                  <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1,
                    background: "var(--border-strong)", opacity: 0.5 }}/>
                </div>
                <div data-mono style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)", textAlign: "right" }}>
                  {t.weight.toFixed(2)}
                </div>
                <div style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 3,
                  color: t.last_delta > 0 ? "var(--st-published)" : t.last_delta < 0 ? "var(--st-error)" : "var(--fg-3)",
                  justifyContent: "flex-end" }} data-mono>
                  {t.last_delta > 0 ? "↗" : t.last_delta < 0 ? "↘" : "→"} {t.last_delta > 0 ? "+" : ""}{t.last_delta.toFixed(2)}
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
        <h2 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>最近 reflector 執行</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sys.reflections.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 14, padding: "10px 12px",
              background: "var(--bg-muted)", borderRadius: 8 }}>
              <div style={{ width: 90, fontSize: 11, color: "var(--fg-2)" }}>
                <RelTime date={r.at} showAbs={false}/>
              </div>
              <div style={{ width: 70 }}>
                <div data-mono style={{ fontSize: 13, fontWeight: 600 }}>{r.samples}</div>
                <div style={{ fontSize: 10, color: "var(--fg-3)" }}>samples</div>
              </div>
              <div style={{ width: 70 }}>
                <div data-mono style={{ fontSize: 13, fontWeight: 600,
                  color: r.rules_added > 0 ? "var(--accent)" : "var(--fg-3)" }}>
                  +{r.rules_added}
                </div>
                <div style={{ fontSize: 10, color: "var(--fg-3)" }}>規則</div>
              </div>
              <div style={{ flex: 1, fontSize: 12, color: "var(--fg-1)", lineHeight: 1.5 }}>{r.rationale}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

Object.assign(window, { DroppedPage, PersonaPage, SettingsPage });
