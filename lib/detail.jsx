/* global React, Icon, StatusPill, ScoreChip, PlatformBadges, RelTime */
const { useState: useSD, useEffect: useED } = React;

const DetailOverlay = ({ itemId, onClose }) => {
  const [tab, setTab] = useSD("post");
  const item = window.MOCK_ITEMS.find(i => i.id === itemId);

  useED(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!item) return null;

  const topic = window.MOCK_TOPIC_BY_ID(item.topic_id);

  return (
    <div onClick={onClose}
      style={{ position: "absolute", inset: 0, zIndex: 50,
        background: "color-mix(in oklab, var(--fg) 30%, transparent)",
        backdropFilter: "blur(3px)",
        display: "flex", justifyContent: "flex-end",
      }}>
      <div onClick={e => e.stopPropagation()}
        style={{ width: 820, height: "100%", background: "var(--bg)",
          borderLeft: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          boxShadow: "-20px 0 48px rgba(20,20,24,0.12)",
          animation: "slideIn 180ms ease-out",
        }}>
        <style>{`@keyframes slideIn { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

        {/* Header */}
        <div style={{ padding: "20px 28px 0", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <StatusPill kind={item.queue_status || item.status}/>
            <span className="nr-chip">{topic.emoji} {topic.name}</span>
            <ScoreChip score={item.confidence_score} weighted={item.weighted_score}/>
            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              <a href={item.source_url} target="_blank" rel="noreferrer"
                style={{ padding: "6px 10px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6,
                  color: "var(--fg-1)", borderRadius: 6 }} className="nr-hover">
                <Icon name="external" size={13}/> 原始新聞
              </a>
              <button onClick={onClose}
                style={{ width: 32, height: 32, display: "grid", placeItems: "center", borderRadius: 6, color: "var(--fg-2)" }}
                className="nr-hover">
                <Icon name="x" size={16}/>
              </button>
            </div>
          </div>
          <h1 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
            {item.title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--fg-2)", paddingBottom: 14 }}>
            <Icon name="rss" size={12}/> {item.feed_name}
            <span>·</span>
            <RelTime date={item.published_at}/>
            <span>·</span>
            <span data-mono style={{ fontSize: 11, color: "var(--fg-3)" }}>id: {item.id}</span>
          </div>

          {/* tabs */}
          <div style={{ display: "flex", gap: 2 }}>
            {[
              ["post",    "貼文預覽"],
              ["scoring", "Scorer 判斷"],
              ["metrics", "互動數據"],
              ["meta",    "原始 Meta"],
            ].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)}
                style={{
                  padding: "10px 14px", fontSize: 13, fontWeight: 500,
                  color: tab === k ? "var(--fg)" : "var(--fg-2)",
                  borderBottom: `2px solid ${tab === k ? "var(--fg)" : "transparent"}`,
                  marginBottom: -1,
                }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 28px 28px" }}>
          {tab === "post"    && <PostTab item={item}/>}
          {tab === "scoring" && <ScoringTab item={item}/>}
          {tab === "metrics" && <MetricsTab item={item}/>}
          {tab === "meta"    && <MetaTab item={item}/>}
        </div>
      </div>
    </div>
  );
};

// ---------- Tab: Post Preview ----------
const PostTab = ({ item }) => {
  const [platform, setPlatform] = useSD("facebook");
  if (!item.full_texts) {
    return <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--fg-3)", fontSize: 13 }}>
      <Icon name="clock" size={20} stroke="var(--fg-3)"/>
      <div style={{ marginTop: 10 }}>這篇還在佇列中,composer 產出的文本會在發布時一併顯示。</div>
    </div>;
  }
  const plats = [
    { k: "facebook",  label: "Facebook",  icon: "fb", fg: "#1877F2", limit: 1000 },
    { k: "instagram", label: "Instagram", icon: "ig", fg: "#E4405F", limit: 2000 },
    { k: "threads",   label: "Threads",   icon: "th", fg: "var(--fg)", limit: 500 },
  ];
  const cur = plats.find(p => p.k === platform);
  const text = item.full_texts[platform];
  const count = Array.from(text).length;

  return (
    <div>
      {/* platform switcher */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {plats.map(p => {
          const active = p.k === platform;
          const pLog = item.publish_log?.find(x => x.platform === p.k);
          return (
            <button key={p.k} onClick={() => setPlatform(p.k)}
              style={{
                padding: "8px 14px", fontSize: 13, fontWeight: 500,
                borderRadius: 8, border: "1px solid " + (active ? p.fg : "var(--border)"),
                background: active ? "color-mix(in oklab, " + p.fg + " 8%, var(--bg-raised))" : "var(--bg-raised)",
                color: active ? p.fg : "var(--fg-1)",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}>
              <Icon name={p.icon} size={14} strokeWidth={active ? 2 : 1.6}/>
              {p.label}
              {pLog && (pLog.success
                ? <span className="nr-dot" style={{ background: "var(--st-published)", width: 6, height: 6 }}/>
                : <span className="nr-dot" style={{ background: "var(--st-error)", width: 6, height: 6 }}/>)}
            </button>
          );
        })}
      </div>

      {/* phone-ish preview */}
      <div style={{ background: "var(--bg-muted)", borderRadius: 12, padding: 24 }}>
        <div style={{ maxWidth: 520, margin: "0 auto", background: "var(--bg-raised)", borderRadius: 12,
          border: "1px solid var(--border)", overflow: "hidden" }}>
          {/* mock post header */}
          <div style={{ padding: "14px 16px 10px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border)" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(140deg, var(--accent) 0%, #8879EC 100%)",
              display: "grid", placeItems: "center", color: "#fff", fontWeight: 600, fontSize: 14 }}>📡</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>News Radar</div>
              <div style={{ fontSize: 11, color: "var(--fg-3)" }} data-mono>
                <RelTime date={item.publish_at} showAbs={false}/>  ·  <span style={{ color: cur.fg }}>{cur.label}</span>
              </div>
            </div>
          </div>
          {/* image */}
          {item.image_url && (
            <div style={{ aspectRatio: platform === "instagram" ? "1 / 1" : "1.91 / 1",
              background: "var(--bg-inset)",
              backgroundImage: `linear-gradient(135deg, color-mix(in oklab, var(--accent) 25%, var(--bg-inset)), var(--bg-inset))`,
              display: "grid", placeItems: "center", fontSize: 36 }}>
              🧬
            </div>
          )}
          {/* body */}
          <div style={{ padding: "14px 16px 16px", fontSize: 13.5, lineHeight: 1.72, whiteSpace: "pre-wrap",
            fontFamily: "var(--f-serif)", color: "var(--fg)" }}>
            {text}
          </div>
        </div>
      </div>

      {/* char counter */}
      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--fg-2)" }}>
        <span>字元數</span>
        <span data-mono>
          <span style={{ color: count > cur.limit ? "var(--st-error)" : "var(--fg)", fontWeight: 600 }}>{count}</span>
          <span style={{ color: "var(--fg-3)" }}> / {cur.limit}</span>
        </span>
      </div>
    </div>
  );
};

// ---------- Tab: Scoring ----------
const ScoringTab = ({ item }) => {
  const b = item.score_breakdown;
  const rows = [
    { k: "data_density",     label: "數據密度",   hint: "具體數字、百分比、金額" },
    { k: "strategic_signal", label: "結構性訊號", hint: "改變產業版圖、商業模式" },
    { k: "news_novelty",     label: "首發性",     hint: "是不是第一手官方來源" },
    { k: "persona_fit",      label: "Persona 貼合度", hint: "符合 News Radar Soul 語氣" },
  ];
  return (
    <div>
      {/* overall */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        <MetricBox label="confidence_score" value={item.confidence_score.toFixed(2)}
          sub={item.confidence_score >= 0.7 ? "AUTO 門檻之上" : item.confidence_score >= 0.65 ? "RESCUE 門檻之上" : "低於門檻"} accent={item.confidence_score >= 0.7 ? "var(--score-good)" : item.confidence_score >= 0.65 ? "var(--score-ok)" : "var(--score-bad)"}/>
        <MetricBox label="topic_weight" value={window.MOCK_TOPIC_BY_ID(item.topic_id).weight.toFixed(2)}
          sub={window.MOCK_TOPIC_BY_ID(item.topic_id).name} accent="var(--accent)"/>
        <MetricBox label="weighted_score" value={(item.weighted_score || 0).toFixed(2)}
          sub="排序實際用這個" accent="var(--fg)"/>
      </div>

      <section className="nr-card" style={{ padding: 20, marginBottom: 14 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 600 }}>Score Breakdown</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {rows.map(r => {
            const v = b?.[r.k] ?? 0;
            const color = v >= 0.75 ? "var(--score-good)" : v >= 0.55 ? "var(--score-ok)" : "var(--score-bad)";
            return (
              <div key={r.k}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{r.label}</span>
                  <span style={{ fontSize: 11, color: "var(--fg-3)" }}>{r.hint}</span>
                  <span data-mono style={{ marginLeft: "auto", fontSize: 13, fontWeight: 600, color }}>{v.toFixed(2)}</span>
                </div>
                <div style={{ height: 6, background: "var(--bg-inset)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${v * 100}%`, height: "100%", background: color, borderRadius: 3,
                    transition: "width 400ms cubic-bezier(.2,.8,.2,1)" }}/>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {item.editorial_note && (
        <section className="nr-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: "var(--accent-soft)",
              color: "var(--accent)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>AI</div>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Reviewer 判讀</h3>
            <span data-mono style={{ marginLeft: "auto", fontSize: 10, color: "var(--fg-3)" }}>gemini-flash-latest</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: "var(--fg-1)", fontFamily: "var(--f-serif)" }}>
            {item.editorial_note}
          </p>
        </section>
      )}
    </div>
  );
};

const MetricBox = ({ label, value, sub, accent }) => (
  <div className="nr-card" style={{ padding: "14px 16px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: accent }}/>
    <div data-mono style={{ fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
    <div data-mono style={{ fontSize: 22, fontWeight: 600, color: accent }}>{value}</div>
    <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 2 }}>{sub}</div>
  </div>
);

// ---------- Tab: Metrics ----------
const MetricsTab = ({ item }) => {
  if (!item.engagement) {
    return <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--fg-3)", fontSize: 13 }}>
      還未發布,沒有互動數據。
    </div>;
  }
  const plats = [
    { k: "facebook",  label: "Facebook",  icon: "fb", fg: "#1877F2",
      metrics: [["likes","讚","heart"],["comments","留言","comment"],["shares","分享","share"],["views","觀看","views"]] },
    { k: "instagram", label: "Instagram", icon: "ig", fg: "#E4405F",
      metrics: [["likes","讚","heart"],["comments","留言","comment"],["saves","收藏","save"],["views","觀看","views"]] },
    { k: "threads",   label: "Threads",   icon: "th", fg: "var(--fg)",
      metrics: [["likes","讚","heart"],["comments","回覆","comment"],["reposts","轉發","share"],["quotes","引用","comment"],["views","觀看","views"]] },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {plats.map(p => {
        const e = item.engagement[p.k];
        return (
          <section key={p.k} className="nr-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ color: p.fg }}><Icon name={p.icon} size={18} strokeWidth={1.8}/></span>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{p.label}</h3>
              <span data-mono style={{ fontSize: 11, color: "var(--fg-3)", marginLeft: "auto" }}>
                post_id: {item.publish_log?.find(l => l.platform === p.k)?.platform_post_id || "—"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${p.metrics.length}, 1fr)`, gap: 10 }}>
              {p.metrics.map(([k, label, icon]) => (
                <div key={k} style={{ padding: "10px 12px", background: "var(--bg-muted)", borderRadius: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                    <Icon name={icon} size={12} stroke="var(--fg-3)"/>
                    <span style={{ fontSize: 11, color: "var(--fg-2)" }}>{label}</span>
                  </div>
                  <div data-mono style={{ fontSize: 18, fontWeight: 600, color: "var(--fg)" }}>
                    {(e[k] || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

// ---------- Tab: Meta ----------
const MetaTab = ({ item }) => {
  const topic = window.MOCK_TOPIC_BY_ID(item.topic_id);
  const fields = [
    ["news_id",        item.id],
    ["feed_name",      item.feed_name],
    ["source_type",    "article"],
    ["published_at",   item.published_at],
    ["fetched_at",     item.fetched_at],
    ["language",       "zh-TW (composed) · en (source)"],
    ["topic_category", item.topic_id],
    ["topic_weight",   topic.weight.toFixed(2)],
    ["status",         item.status],
    ["queue_status",   item.queue_status || "—"],
    ["publish_at",     item.publish_at || "—"],
  ];
  return (
    <div>
      <section className="nr-card" style={{ padding: 18, marginBottom: 14 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600 }}>Database row</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <tbody>
            {fields.map(([k, v]) => (
              <tr key={k} style={{ borderBottom: "1px solid var(--border)" }}>
                <td data-mono style={{ padding: "7px 0", color: "var(--fg-3)", width: 160 }}>{k}</td>
                <td data-mono style={{ padding: "7px 0", color: "var(--fg)", wordBreak: "break-all" }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {item.publish_log && (
        <section className="nr-card" style={{ padding: 18 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600 }}>Publish log</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {item.publish_log.map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                background: l.success ? "var(--st-published-bg)" : "var(--st-error-bg)", borderRadius: 8 }}>
                <Icon name={l.success ? "check" : "x"} size={14}
                  stroke={l.success ? "var(--st-published)" : "var(--st-error)"} strokeWidth={2.2}/>
                <span style={{ fontSize: 13, fontWeight: 500, textTransform: "capitalize", width: 80 }}>{l.platform}</span>
                <span data-mono style={{ fontSize: 11, color: "var(--fg-2)" }}>{window.MOCK_TIME.fmtHM(l.posted_at)}</span>
                <span data-mono style={{ fontSize: 11, color: "var(--fg-3)", marginLeft: "auto" }}>
                  {l.success ? (l.platform_post_id || "ok") : l.error_message}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

Object.assign(window, { DetailOverlay });
