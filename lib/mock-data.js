/* News Radar Dashboard — mock data.
   All dates relative to "NOW" = 2026-04-23 14:30 Taipei. */

const NOW = new Date("2026-04-23T06:30:00Z"); // 14:30 +08:00
const hrs = (h) => new Date(NOW.getTime() - h * 3600_000);
const mins = (m) => new Date(NOW.getTime() - m * 60_000);
const future = (h) => new Date(NOW.getTime() + h * 3600_000);
const futureM = (m) => new Date(NOW.getTime() + m * 60_000);

window.MOCK_TIME = {
  now: NOW,
  fmtHM: (d) => {
    const dt = typeof d === "string" ? new Date(d) : d;
    const tpe = new Date(dt.getTime() + 8 * 3600_000);
    return `${String(tpe.getUTCHours()).padStart(2,"0")}:${String(tpe.getUTCMinutes()).padStart(2,"0")}`;
  },
  fmtRel: (d) => {
    const dt = typeof d === "string" ? new Date(d) : d;
    const diff = dt.getTime() - NOW.getTime();
    const abs = Math.abs(diff);
    const m = Math.round(abs / 60_000);
    const h = Math.round(abs / 3600_000);
    const day = Math.round(abs / 86400_000);
    const pre = diff >= 0 ? "再" : "";
    const suf = diff >= 0 ? "後" : "前";
    if (m < 60) return `${pre}${m} 分鐘${suf}`;
    if (h < 24) return `${pre}${h} 小時${suf}`;
    return `${pre}${day} 天${suf}`;
  },
};

// ---------- Topics (Phase 8.20) ----------
window.MOCK_TOPICS = [
  { id: "ai_model",       name: "AI 模型",   emoji: "🧠", weight: 1.85, samples: 142, last_delta:  0.08 },
  { id: "big_tech",       name: "Big Tech 戰略",emoji:"🏢", weight: 1.72, samples: 118, last_delta:  0.05 },
  { id: "semi_chips",     name: "半導體",    emoji: "💾", weight: 1.58, samples:  74, last_delta:  0.12 },
  { id: "crypto_web3",    name: "加密貨幣",  emoji: "₿",  weight: 1.34, samples:  96, last_delta: -0.03 },
  { id: "biotech_pharma", name: "生技製藥",  emoji: "🧬", weight: 1.18, samples:  41, last_delta:  0.22 },
  { id: "hardware_robot", name: "硬體機器人",emoji: "🤖", weight: 1.05, samples:  53, last_delta:  0.00 },
  { id: "startup_vc",     name: "新創與 VC", emoji: "🚀", weight: 0.92, samples:  88, last_delta: -0.08 },
  { id: "policy_regulate",name: "政策監管",  emoji: "⚖️", weight: 0.78, samples:  45, last_delta:  0.04 },
  { id: "consumer_app",   name: "消費應用",  emoji: "📱", weight: 0.54, samples:  67, last_delta: -0.11 },
  { id: "celebrity_drama",name: "名人嘴砲",  emoji: "🎭", weight: 0.32, samples:  29, last_delta: -0.15 },
];
window.MOCK_TOPIC_BY_ID = (id) => window.MOCK_TOPICS.find(t => t.id === id) || { id, name: id, emoji: "📄", weight: 1.0 };

// ---------- Items ----------
// Shape: id, title, feed_name, source_url, published_at, fetched_at,
// topic_id, confidence_score, weighted_score, score_breakdown,
// status, queue_status, platforms:{fb,ig,threads}, image_status,
// publish_at, engagement:{fb,ig,threads}, drop_reason, drop_detail, publish_log
// full_texts:{fb,ig,threads}

const mkE = (lk, co, sh, sv, rp, qt, vw) => ({ likes: lk, comments: co, shares: sh, saves: sv, reposts: rp, quotes: qt, views: vw });

window.MOCK_ITEMS = [
  // --- Last published (primary detail target) ---
  {
    id: "d_p01",
    title: "Rosalind 的第二次被剝奪——OpenAI 把垂直 AI 鎖進企業圍牆",
    feed_name: "Decrypt", source_url: "https://decrypt.co/364783/openai-gpt-rosalind-drug-discovery-life-sciences-model",
    published_at: hrs(3.5).toISOString(), fetched_at: hrs(3.2).toISOString(),
    topic_id: "biotech_pharma",
    confidence_score: 0.82, weighted_score: 1.52,
    score_breakdown: { data_density: 0.70, strategic_signal: 0.85, news_novelty: 0.85, persona_fit: 0.90 },
    editorial_note: "垂直 AI + FDA 監管 + 具名科學家降溫 + $500M 合作金額——四條訊號同時命中。結構性改變 biotech 價值鏈，屬於 Forest-level 題材。",
    status: "published", queue_status: "published",
    platforms: { facebook: true, instagram: true, threads: true },
    image_status: "ok",
    publish_at: mins(42).toISOString(),
    image_url: "https://cdn.decrypt.co/resize/1024/height/512/wp-content/uploads/2026/04/decrypt-style-openai-logo-gID_7.png",
    engagement: { facebook: mkE(24, 3, 5, 0, 0, 0, 1240), instagram: mkE(18, 1, 0, 4, 0, 0, 890), threads: mkE(9, 2, 0, 0, 3, 1, 620) },
    publish_log: [
      { platform: "facebook",  success: true, platform_post_id: "100123456_987654", posted_at: mins(42).toISOString() },
      { platform: "instagram", success: true, platform_post_id: "DA_pGxYzW1q",      posted_at: mins(41).toISOString() },
      { platform: "threads",   success: true, platform_post_id: "C8nxYzAbcde",      posted_at: mins(40).toISOString() },
    ],
    full_texts: {
      facebook: `Rosalind 的第二次被剝奪——OpenAI 把垂直 AI 鎖進企業圍牆

OpenAI 週四發表 GPT-Rosalind，第一個『領域專用』推理模型，開啟所謂的 Life Sciences 系列。命名選擇本身就是一則寓言——Rosalind Franklin 生前因為性別被剝奪 DNA 雙螺旋的署名權，七十年後她的名字掛在一個你用不到的封閉模型上；存取限美國企業用戶，要通過資格與安全審查。

數據是有力的：BixBench 跑出 0.751 pass rate，目前公開結果中的最高分；LABBench2 十一項任務贏 GPT-5.4 六項；對 Dyno Therapeutics 提供的未公開 RNA 序列，best-of-ten 在序列預測達人類專家 95th percentile、生成任務 84th percentile。搭配免費的 Codex Life Sciences 外掛串接 50 多個科學資料庫。

新藥從標靶發現走到 FDA 批准平均 10 到 15 年，早期發現階段約佔總成本 25–30%——這正是 GPT-Rosalind 瞄準的區段。真正的對手不是 Anthropic，而是 DeepMind 的 AlphaFold 系、Recursion、Insilico 與一票大學實驗室。

價值鏈的位移發生在訂價邏輯：製藥產業過去把 AI 當工具採購,現在 OpenAI 把『推理層』本身賣成訂閱。Amgen、Moderna、Thermo Fisher 已經排隊,中間那批靠 wrapper 吃飯的 AI biotech 新創護城河瞬間變薄。

OpenAI 生命科學研究負責人 Joy Jiao 刻意降溫:『我們不認為 Rosalind 能自主創造新藥』——這句話的謹慎對比 Altman 過去在 AGI 議題上的張揚,是進入 FDA 監管領域後的語言馴化。100 多位科學家已連署要求更嚴的 AI 生物資料管制,而『限制存取』同時解了安全焦慮也築了商業護城河。

下一個可追蹤的線頭,是 Los Alamos 國家實驗室的蛋白質與催化劑設計合作成果發佈——那會決定這條垂直線能否從製藥延伸到能源與材料。

#GPTRosalind #OpenAI #垂直AI #生技AI #藥物研發`,
      instagram: `一個你用不到的模型,卻改寫了整個製藥業的遊戲規則

如果把新藥研發想成一場十五年的長跑,前面那段翻文獻、查資料庫、設計試劑的苦工,現在有人想把它壓縮進幾個月。

OpenAI 週四發表 GPT-Rosalind,是他們第一個『領域專用』推理模型,以那位生前被剝奪 DNA 雙螺旋署名權的英國化學家命名。名字很美,但使用權限被鎖得很緊——僅限通過資格與安全審查的美國企業用戶。

數字很有說服力:BixBench 拿到 0.751 pass rate,目前公開分數中的最高;針對 Dyno Therapeutics 未公開的 RNA 序列,best-of-ten 成績在序列預測贏過 95% 的人類專家、生成任務贏過 84%。搭配免費的 Codex 外掛串接 50 多個科學資料庫。

這是一個時代正在分叉的訊號。OpenAI 從通用模型路線切出一刀,把推理層本身賣成訂閱——Amgen、Moderna、Thermo Fisher 已經簽下。

下次你聽到『AI 加速新藥』這類話術時,可以追問一句:加速的是哪一段,省下的錢最後流向藥廠、OpenAI,還是病人?


#GPTRosalind #OpenAI #RosalindFranklin #垂直AI #生技AI #藥物研發 #AlphaFold`,
      threads: `OpenAI 週四發表 GPT-Rosalind,它第一個『領域專用』推理模型,也是 Life Sciences 系列的開端。命名向生前被剝奪 DNA 雙螺旋署名權的 Rosalind Franklin 致敬,但存取權限只給通過資格與安全審查的美國企業——七十年後她的名字第二次被鎖在一扇門後面。

數據密度很高:BixBench 0.751 pass rate,目前公開最高;LABBench2 十一項贏 GPT-5.4 六項;對 Dyno Therapeutics 未公開的 RNA 序列,best-of-ten 在序列預測達人類專家 95th percentile、生成任務 84th percentile。

#GPTRosalind`,
    },
  },

  // --- Queued items ---
  {
    id: "d_q01",
    title: "AI 讓 App Store 的護城河反轉,開發者稅基正被重新定義",
    feed_name: "TechCrunch", source_url: "https://techcrunch.com/2026/04/18/the-app-store-is-booming-again-and-ai-may-be-why/",
    published_at: hrs(1.2).toISOString(), fetched_at: hrs(1.0).toISOString(),
    topic_id: "big_tech",
    confidence_score: 0.68, weighted_score: 1.17,
    score_breakdown: { data_density: 0.65, strategic_signal: 0.72, news_novelty: 0.55, persona_fit: 0.80 },
    editorial_note: "類別洗牌是 structural signal,但 Appfigures 只追上架不追留存——data_density 扣分。rescue 模式會撈到。",
    status: "auto_approved", queue_status: "queued",
    platforms: { facebook: true, instagram: true, threads: true },
    image_status: "ok",
    publish_at: futureM(28).toISOString(),
  },
  {
    id: "d_q02",
    title: "量子破密提前到 2032?Bitcoin $711B 暴露錢包卡在硬分叉死結",
    feed_name: "Decrypt", source_url: "https://decrypt.co/resources/what-q-day-quantum-threat-bitcoin-explained",
    published_at: hrs(2.8).toISOString(), fetched_at: hrs(2.5).toISOString(),
    topic_id: "crypto_web3",
    confidence_score: 0.74, weighted_score: 0.99,
    score_breakdown: { data_density: 0.55, strategic_signal: 0.88, news_novelty: 0.65, persona_fit: 0.85 },
    editorial_note: "不可變性 vs 升級,這是比特幣治理的經典矛盾。量子提前是結構性訊號。",
    status: "auto_approved", queue_status: "queued",
    platforms: { facebook: true, instagram: true, threads: true },
    image_status: "rewrote",
    publish_at: future(1.5).toISOString(),
  },
  {
    id: "d_q03",
    title: "英諾賽科把 GaN 價格砍 50%——美國在功率半導體輸了第二局",
    feed_name: "Bloomberg Technology", source_url: "https://www.bloomberg.com/tech/gan-power-semi",
    published_at: hrs(4.5).toISOString(), fetched_at: hrs(4.2).toISOString(),
    topic_id: "semi_chips",
    confidence_score: 0.79, weighted_score: 1.25,
    score_breakdown: { data_density: 0.75, strategic_signal: 0.90, news_novelty: 0.70, persona_fit: 0.80 },
    status: "auto_approved", queue_status: "queued",
    platforms: { facebook: true, instagram: true, threads: true },
    image_status: "ok",
    publish_at: future(2.8).toISOString(),
  },
  {
    id: "d_q04",
    title: "DeepMind 組 30 人突擊小組,挑戰 GPT-Rosalind 的生技垂直",
    feed_name: "The Information", source_url: "https://www.theinformation.com/deepmind-biotech",
    published_at: hrs(5.1).toISOString(), fetched_at: hrs(4.8).toISOString(),
    topic_id: "ai_model",
    confidence_score: 0.71, weighted_score: 1.31,
    score_breakdown: { data_density: 0.60, strategic_signal: 0.85, news_novelty: 0.75, persona_fit: 0.80 },
    status: "auto_approved", queue_status: "queued",
    platforms: { facebook: true, instagram: true, threads: true },
    image_status: "ok",
    publish_at: future(4.2).toISOString(),
  },
  {
    id: "d_q05",
    title: "Nvidia H200 後繼被 TSMC 3nm 卡產能,2026Q3 交期推遲 14 週",
    feed_name: "DigiTimes", source_url: "https://www.digitimes.com/h200-delay",
    published_at: hrs(6.2).toISOString(), fetched_at: hrs(6.0).toISOString(),
    topic_id: "semi_chips",
    confidence_score: 0.76, weighted_score: 1.20,
    score_breakdown: { data_density: 0.80, strategic_signal: 0.75, news_novelty: 0.70, persona_fit: 0.80 },
    status: "auto_approved", queue_status: "queued",
    platforms: { facebook: true, instagram: false, threads: true },
    image_status: "failed",
    publish_at: future(5.5).toISOString(),
  },

  // --- Published (archive) ---
  ...[
    { id: "d_ap01", title: "Anthropic 推出 Claude Design,所有應用層都在射程內", topic: "ai_model", score: 0.91, hours: 5,  feed: "Anthropic Blog", fbL: 87, igL: 54, thL: 32 },
    { id: "d_ap02", title: "Tesla Optimus V3 拆解:BoM 4,200 美元,但手指良率卡在 62%",     topic: "hardware_robot", score: 0.84, hours: 9,  feed: "The Verge",     fbL: 65, igL: 41, thL: 28 },
    { id: "d_ap03", title: "台積電 CoWoS 產能預售至 2028,AI 伺服器的交期戰才剛開始",    topic: "semi_chips",      score: 0.88, hours: 13, feed: "Bloomberg",     fbL: 112,igL: 39, thL: 44 },
    { id: "d_ap04", title: "Perplexity Pro 免費發放 90 天——估值 90 億要靠用戶數撐估值",    topic: "big_tech",        score: 0.73, hours: 17, feed: "TechCrunch",    fbL: 43, igL: 29, thL: 15 },
    { id: "d_ap05", title: "Coinbase 跟 Circle 分家:穩定幣抽成爭執從 50% 升級到訴訟",     topic: "crypto_web3",     score: 0.80, hours: 21, feed: "CoinDesk",      fbL: 58, igL: 22, thL: 21, failed: ["instagram"] },
    { id: "d_ap06", title: "Figma Sites 上線 3 週流失 12% 設計師——Canva 收割潮開始",      topic: "big_tech",        score: 0.76, hours: 23, feed: "UX Collective",  fbL: 94, igL: 71, thL: 26 },
  ].map(x => ({
    id: x.id, title: x.title, feed_name: x.feed, source_url: "https://example.com/" + x.id,
    published_at: hrs(x.hours + 0.5).toISOString(), fetched_at: hrs(x.hours + 0.3).toISOString(),
    topic_id: x.topic,
    confidence_score: x.score, weighted_score: x.score * window.MOCK_TOPIC_BY_ID(x.topic).weight,
    score_breakdown: { data_density: 0.7, strategic_signal: 0.8, news_novelty: 0.7, persona_fit: 0.85 },
    status: "published", queue_status: "published",
    platforms: { facebook: !x.failed?.includes("facebook"), instagram: !x.failed?.includes("instagram"), threads: !x.failed?.includes("threads") },
    image_status: "ok",
    publish_at: hrs(x.hours).toISOString(),
    engagement: { facebook: mkE(x.fbL, 4, 8, 0, 0, 0, x.fbL * 50), instagram: mkE(x.igL, 2, 0, 6, 0, 0, x.igL * 45), threads: mkE(x.thL, 3, 0, 0, 2, 1, x.thL * 70) },
    publish_log: [
      { platform: "facebook",  success: !x.failed?.includes("facebook"),  posted_at: hrs(x.hours).toISOString(), error_message: x.failed?.includes("facebook")  ? "Image download failed" : null },
      { platform: "instagram", success: !x.failed?.includes("instagram"), posted_at: hrs(x.hours).toISOString(), error_message: x.failed?.includes("instagram") ? "Aspect ratio rejected by Graph API (need 4:5 or 1:1)" : null },
      { platform: "threads",   success: !x.failed?.includes("threads"),   posted_at: hrs(x.hours).toISOString() },
    ],
  })),

  // --- Dropped ---
  { id: "d_dr01", title: "Sam Altman 發推:『AGI by 2027』隨即刪文",
    feed_name: "Twitter - OpenAI", source_url: "https://x.com/sama/status/xxx",
    published_at: hrs(1.8).toISOString(), fetched_at: hrs(1.6).toISOString(),
    topic_id: "celebrity_drama",
    confidence_score: 0.48, weighted_score: 0.15,
    drop_reason: "topic_downweighted",
    drop_detail: "名人嘴砲類別權重 0.32,weighted_score 不到 0.3;且沒有後續行動,符合 Soul §Ⅴ 自動 drop 規則。",
    status: "dropped", queue_status: null, platforms: null, image_status: null },
  { id: "d_dr02", title: "ChatGPT 介面小改:思考過程摺疊改為可展開",
    feed_name: "OpenAI Changelog", source_url: "https://openai.com/changelog",
    published_at: hrs(3.2).toISOString(), fetched_at: hrs(3.0).toISOString(),
    topic_id: "ai_model",
    confidence_score: 0.52, weighted_score: 0.96,
    drop_reason: "pure_feature_update",
    drop_detail: "純 UX 微調,沒有商業模式影響;scorer data_density 0.3, strategic_signal 0.2,未過 0.65 門檻。",
    status: "dropped", queue_status: null, platforms: null, image_status: null },
  { id: "d_dr03", title: "Gartner 預測:2027 年全球 AI 市場將達 8,500 億美元",
    feed_name: "Gartner Press", source_url: "https://www.gartner.com/press",
    published_at: hrs(5.7).toISOString(), fetched_at: hrs(5.5).toISOString(),
    topic_id: "ai_model",
    confidence_score: 0.41, weighted_score: 0.76,
    drop_reason: "score_too_low",
    drop_detail: "預測性報告,Soul §Ⅴ 明示自動 drop;且無量化錨點來源,strategic_signal 僅 0.25。",
    status: "dropped", queue_status: null, platforms: null, image_status: null },
  { id: "d_dr04", title: "OpenAI 發表 GPT-Rosalind 垂直 AI 模型(路透社版)",
    feed_name: "Reuters Tech", source_url: "https://www.reuters.com/tech/openai-gpt-rosalind",
    published_at: hrs(3.4).toISOString(), fetched_at: hrs(3.3).toISOString(),
    topic_id: "biotech_pharma",
    confidence_score: 0.71, weighted_score: 1.31,
    drop_reason: "duplicate",
    drop_detail: "與 d_p01 同題,且後於 Decrypt 原文 12 分鐘。Scorer 偵測到 title 相似度 0.89 > 0.75 閾值。",
    status: "dropped", queue_status: null, platforms: null, image_status: null },
  { id: "d_dr05", title: "Elon Musk 又改 X 演算法,表示『真實使用者會被放大 10 倍』",
    feed_name: "Twitter - elonmusk", source_url: "https://x.com/elonmusk/status/yyy",
    published_at: hrs(7.8).toISOString(), fetched_at: hrs(7.5).toISOString(),
    topic_id: "celebrity_drama",
    confidence_score: 0.38, weighted_score: 0.12,
    drop_reason: "topic_downweighted",
    drop_detail: "名人嘴砲類別;且 X 演算法調整屬於沒有明確代碼落地的 vague claim,不符合 first-mover 原則。",
    status: "dropped", queue_status: null, platforms: null, image_status: null },
];

// ---------- Timeline (24h) ----------
window.MOCK_TIMELINE = [
  // publishes (tied to published items)
  { kind: "publish",  hours_ago: 0.7,  label: "Rosalind 已發布",          item_id: "d_p01" },
  { kind: "publish",  hours_ago: 5,    label: "Claude Design 已發布",     item_id: "d_ap01" },
  { kind: "publish",  hours_ago: 9,    label: "Optimus V3 已發布",       item_id: "d_ap02" },
  { kind: "publish",  hours_ago: 13,   label: "CoWoS 已發布",            item_id: "d_ap03" },
  { kind: "publish",  hours_ago: 17,   label: "Perplexity 已發布",       item_id: "d_ap04" },
  { kind: "publish",  hours_ago: 21,   label: "Coinbase×Circle 已發布",  item_id: "d_ap05" },
  { kind: "publish",  hours_ago: 23,   label: "Figma Sites 已發布",      item_id: "d_ap06" },
  // harvests (every ~90 min)
  ...Array.from({ length: 16 }, (_, i) => ({ kind: "harvest", hours_ago: i * 1.5, label: "harvest" })),
  // scoring blips
  ...Array.from({ length: 28 }, (_, i) => ({ kind: "score", hours_ago: i * 0.85 + 0.2, label: "scoring" })),
  // errors
  { kind: "error", hours_ago: 11.2, label: "Gemini 429 quota · fallback claude-cli" },
  { kind: "error", hours_ago: 18.7, label: "IG Graph API: aspect ratio rejected" },
];

// ---------- System state ----------
window.MOCK_SYSTEM = {
  last_publish_at: mins(42).toISOString(),
  last_publish_title: "Rosalind 的第二次被剝奪——OpenAI 把垂直 AI 鎖進企業圍牆",
  last_publish_platforms: ["Facebook", "Instagram", "Threads"],
  next_publish_at: futureM(28).toISOString(),
  queued_count: 5,
  today_cost_usd: 0.42,
  today_llm_calls: 73,
  budget_daily: 2.0,

  thresholds: {
    AUTO_PUBLISH: 0.70,
    RESCUE_PUBLISH: 0.65,
    MIN_SCORE: 0.65,
  },

  alerts: [
    { level: "warn", text: "Gemini 3-Flash 今日已用 14/20,即將觸發 429。Fallback claude-cli 已就緒。", at: mins(78).toISOString() },
    { level: "info", text: "Reflector 將於 06:00 UTC 執行 topic_weights back-prop。",                      at: hrs(2).toISOString() },
  ],

  reflections: [
    { at: hrs(8).toISOString(),  samples: 12, rules_added: 2, rationale: "Hsin 偏好把 hook 從時間副詞開頭改為『主體 + 隱喻動作』。新增結構規則。" },
    { at: hrs(32).toISOString(), samples: 10, rules_added: 1, rationale: "biotech_pharma 類別發文 IG saves 平均 +38%,weight 由 0.96 → 1.18。" },
    { id: "r3", at: hrs(56).toISOString(), samples: 14, rules_added: 0, rationale: "樣本數與上週持平,無顯著 pattern 變化,本次不下新規則。" },
  ],
};
