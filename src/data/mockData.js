// Mock data for v1. Shape aligned to data/01_harvest/schema.sql.
//
// Schema mapping notes (mock → real table.column):
//   id              → drafts.id
//   news_id         → news_items.id
//   title           → news_items.title
//   url             → news_items.url            (was `source_url` in canvas mock)
//   feed_name       → news_items.feed_name
//   published_at    → news_items.published_at
//   fetched_at      → news_items.fetched_at
//   topic_category  → news_items.topic_category (was `topic_id` in canvas mock)
//   confidence_score, weighted_score, score_breakdown, editorial_note
//                   → news_items (or review JSON blob)
//   queue_status    → drafts.queue_status  ∈ { NULL, queued, published, stale, failed }
//   publish_at      → drafts.publish_at
//   image_status    → derived              ∈ { ok, rewrote, failed }
//   image_url       → news_items.image_url
//   platforms.*     → presence in platform_drafts.platform
//   full_texts.*    → platform_drafts.body
//   engagement.*    → engagement_stats rows (platform-specific columns)
//   publish_log     → publish_log table
//
// `status` is a dashboard-level composite: "published" | "dropped" | "auto_approved" | ...
// We keep it for readable filtering; sql.js layer will derive it.

import { hrs, mins, future, futureM, NOW_MOCK } from "@/lib/time.js";
import { topicById } from "@/lib/topics.js";

// Engagement helper. Native column names match engagement_stats post-fix
// (2026-04-25): replies/reposts/quotes/reach are real native columns; the
// pre-fix Threads aliasing (replies → comments, reposts+quotes → shares)
// is gone. Mock data follows the native convention so MetricsTab + dbAdapter
// don't need parallel "is this mock or live?" branches.
const mkE = (o = {}) => ({
  likes: o.likes || 0,
  comments: o.comments || 0,  // FB/IG only
  replies: o.replies || 0,    // Threads only
  shares: o.shares || 0,      // FB only
  saves: o.saves || 0,        // IG only
  reposts: o.reposts || 0,    // Threads only
  quotes: o.quotes || 0,      // Threads only
  views: o.views || 0,
  reach: o.reach || 0,        // FB/IG only (Threads writes 0)
});

export const MOCK_ITEMS = [
  // --- Last published (primary detail target) ---
  {
    id: "d_p01",
    title: "Rosalind 的第二次被剝奪——OpenAI 把垂直 AI 鎖進企業圍牆",
    feed_name: "Decrypt",
    url: "https://decrypt.co/364783/openai-gpt-rosalind-drug-discovery-life-sciences-model",
    published_at: hrs(3.5).toISOString(),
    fetched_at: hrs(3.2).toISOString(),
    topic_category: "biotech_pharma",
    confidence_score: 0.82,
    weighted_score: 1.52,
    score_breakdown: { data_density: 0.70, strategic_signal: 0.85, news_novelty: 0.85, persona_fit: 0.90 },
    editorial_note:
      "垂直 AI + FDA 監管 + 具名科學家降溫 + $500M 合作金額——四條訊號同時命中。結構性改變 biotech 價值鏈，屬於 Forest-level 題材。",
    status: "published",
    queue_status: "published",
    platforms: { facebook: true, instagram: true, threads: true },
    image_status: "ok",
    publish_at: mins(42).toISOString(),
    image_url:
      "https://cdn.decrypt.co/resize/1024/height/512/wp-content/uploads/2026/04/decrypt-style-openai-logo-gID_7.png",
    engagement: {
      facebook:  mkE({ likes: 24, comments: 3, shares: 5, views: 1240, reach:  860 }),
      instagram: mkE({ likes: 18, comments: 1, saves:  4, views:  890, reach:  640 }),
      threads:   mkE({ likes:  9, replies:  2, reposts: 3, quotes: 1, views: 620 }),
    },
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
    feed_name: "TechCrunch",
    url: "https://techcrunch.com/2026/04/18/the-app-store-is-booming-again-and-ai-may-be-why/",
    published_at: hrs(1.2).toISOString(),
    fetched_at: hrs(1.0).toISOString(),
    topic_category: "big_tech",
    confidence_score: 0.68,
    weighted_score: 1.17,
    score_breakdown: { data_density: 0.65, strategic_signal: 0.72, news_novelty: 0.55, persona_fit: 0.80 },
    editorial_note:
      "類別洗牌是 structural signal,但 Appfigures 只追上架不追留存——data_density 扣分。rescue 模式會撈到。",
    status: "auto_approved",
    queue_status: "queued",
    platforms: { facebook: true, instagram: true, threads: true },
    image_status: "ok",
    publish_at: futureM(28).toISOString(),
  },
  {
    id: "d_q02",
    title: "量子破密提前到 2032?Bitcoin $711B 暴露錢包卡在硬分叉死結",
    feed_name: "Decrypt",
    url: "https://decrypt.co/resources/what-q-day-quantum-threat-bitcoin-explained",
    published_at: hrs(2.8).toISOString(),
    fetched_at: hrs(2.5).toISOString(),
    topic_category: "crypto_web3",
    confidence_score: 0.74,
    weighted_score: 0.99,
    score_breakdown: { data_density: 0.55, strategic_signal: 0.88, news_novelty: 0.65, persona_fit: 0.85 },
    editorial_note: "不可變性 vs 升級,這是比特幣治理的經典矛盾。量子提前是結構性訊號。",
    status: "auto_approved",
    queue_status: "queued",
    platforms: { facebook: true, instagram: true, threads: true },
    image_status: "rewrote",
    publish_at: future(1.5).toISOString(),
  },
  {
    id: "d_q03",
    title: "英諾賽科把 GaN 價格砍 50%——美國在功率半導體輸了第二局",
    feed_name: "Bloomberg Technology",
    url: "https://www.bloomberg.com/tech/gan-power-semi",
    published_at: hrs(4.5).toISOString(),
    fetched_at: hrs(4.2).toISOString(),
    topic_category: "semi_chips",
    confidence_score: 0.79,
    weighted_score: 1.25,
    score_breakdown: { data_density: 0.75, strategic_signal: 0.90, news_novelty: 0.70, persona_fit: 0.80 },
    status: "auto_approved",
    queue_status: "queued",
    platforms: { facebook: true, instagram: true, threads: true },
    image_status: "ok",
    publish_at: future(2.8).toISOString(),
  },
  {
    id: "d_q04",
    title: "DeepMind 組 30 人突擊小組,挑戰 GPT-Rosalind 的生技垂直",
    feed_name: "The Information",
    url: "https://www.theinformation.com/deepmind-biotech",
    published_at: hrs(5.1).toISOString(),
    fetched_at: hrs(4.8).toISOString(),
    topic_category: "ai_model",
    confidence_score: 0.71,
    weighted_score: 1.31,
    score_breakdown: { data_density: 0.60, strategic_signal: 0.85, news_novelty: 0.75, persona_fit: 0.80 },
    status: "auto_approved",
    queue_status: "queued",
    platforms: { facebook: true, instagram: true, threads: true },
    image_status: "ok",
    publish_at: future(4.2).toISOString(),
  },
  {
    id: "d_q05",
    title: "Nvidia H200 後繼被 TSMC 3nm 卡產能,2026Q3 交期推遲 14 週",
    feed_name: "DigiTimes",
    url: "https://www.digitimes.com/h200-delay",
    published_at: hrs(6.2).toISOString(),
    fetched_at: hrs(6.0).toISOString(),
    topic_category: "semi_chips",
    confidence_score: 0.76,
    weighted_score: 1.20,
    score_breakdown: { data_density: 0.80, strategic_signal: 0.75, news_novelty: 0.70, persona_fit: 0.80 },
    status: "auto_approved",
    queue_status: "queued",
    platforms: { facebook: true, instagram: false, threads: true },
    image_status: "failed",
    publish_at: future(5.5).toISOString(),
  },

  // --- Published (archive) ---
  ...[
    { id: "d_ap01", title: "Anthropic 推出 Claude Design,所有應用層都在射程內",           topic: "ai_model",        score: 0.91, hours:  5, feed: "Anthropic Blog", fbL:  87, igL: 54, thL: 32 },
    { id: "d_ap02", title: "Tesla Optimus V3 拆解:BoM 4,200 美元,但手指良率卡在 62%",    topic: "hardware_robot",  score: 0.84, hours:  9, feed: "The Verge",      fbL:  65, igL: 41, thL: 28 },
    { id: "d_ap03", title: "台積電 CoWoS 產能預售至 2028,AI 伺服器的交期戰才剛開始",     topic: "semi_chips",      score: 0.88, hours: 13, feed: "Bloomberg",       fbL: 112, igL: 39, thL: 44 },
    { id: "d_ap04", title: "Perplexity Pro 免費發放 90 天——估值 90 億要靠用戶數撐估值",    topic: "big_tech",        score: 0.73, hours: 17, feed: "TechCrunch",      fbL:  43, igL: 29, thL: 15 },
    { id: "d_ap05", title: "Coinbase 跟 Circle 分家:穩定幣抽成爭執從 50% 升級到訴訟",      topic: "crypto_web3",     score: 0.80, hours: 21, feed: "CoinDesk",        fbL:  58, igL: 22, thL: 21, failed: ["instagram"] },
    { id: "d_ap06", title: "Figma Sites 上線 3 週流失 12% 設計師——Canva 收割潮開始",       topic: "big_tech",        score: 0.76, hours: 23, feed: "UX Collective",   fbL:  94, igL: 71, thL: 26 },
  ].map((x) => ({
    id: x.id,
    title: x.title,
    feed_name: x.feed,
    url: "https://example.com/" + x.id,
    published_at: hrs(x.hours + 0.5).toISOString(),
    fetched_at: hrs(x.hours + 0.3).toISOString(),
    topic_category: x.topic,
    confidence_score: x.score,
    weighted_score: x.score * topicById(x.topic).weight,
    score_breakdown: { data_density: 0.7, strategic_signal: 0.8, news_novelty: 0.7, persona_fit: 0.85 },
    status: "published",
    queue_status: "published",
    platforms: {
      facebook:  !x.failed?.includes("facebook"),
      instagram: !x.failed?.includes("instagram"),
      threads:   !x.failed?.includes("threads"),
    },
    image_status: "ok",
    publish_at: hrs(x.hours).toISOString(),
    engagement: {
      facebook:  mkE({ likes: x.fbL, comments: 4, shares: 8, views: x.fbL * 50, reach: x.fbL * 30 }),
      instagram: mkE({ likes: x.igL, comments: 2, saves:  6, views: x.igL * 45, reach: x.igL * 25 }),
      threads:   mkE({ likes: x.thL, replies:  3, reposts: 2, quotes: 1, views: x.thL * 70 }),
    },
    publish_log: [
      { platform: "facebook",  success: !x.failed?.includes("facebook"),  posted_at: hrs(x.hours).toISOString(), error_message: x.failed?.includes("facebook")  ? "Image download failed" : null },
      { platform: "instagram", success: !x.failed?.includes("instagram"), posted_at: hrs(x.hours).toISOString(), error_message: x.failed?.includes("instagram") ? "Aspect ratio rejected by Graph API (need 4:5 or 1:1)" : null },
      { platform: "threads",   success: !x.failed?.includes("threads"),   posted_at: hrs(x.hours).toISOString() },
    ],
  })),

  // --- Dropped ---
  {
    id: "d_dr01",
    title: "Sam Altman 發推:『AGI by 2027』隨即刪文",
    feed_name: "Twitter - OpenAI", url: "https://x.com/sama/status/xxx",
    published_at: hrs(1.8).toISOString(), fetched_at: hrs(1.6).toISOString(),
    topic_category: "celebrity_drama",
    confidence_score: 0.48, weighted_score: 0.15,
    drop_reason: "topic_downweighted",
    drop_detail: "名人嘴砲類別權重 0.32,weighted_score 不到 0.3;且沒有後續行動,符合 Soul §Ⅴ 自動 drop 規則。",
    status: "dropped", queue_status: null, platforms: null, image_status: null,
  },
  {
    id: "d_dr02",
    title: "ChatGPT 介面小改:思考過程摺疊改為可展開",
    feed_name: "OpenAI Changelog", url: "https://openai.com/changelog",
    published_at: hrs(3.2).toISOString(), fetched_at: hrs(3.0).toISOString(),
    topic_category: "ai_model",
    confidence_score: 0.52, weighted_score: 0.96,
    drop_reason: "pure_feature_update",
    drop_detail: "純 UX 微調,沒有商業模式影響;scorer data_density 0.3, strategic_signal 0.2,未過 0.65 門檻。",
    status: "dropped", queue_status: null, platforms: null, image_status: null,
  },
  {
    id: "d_dr03",
    title: "Gartner 預測:2027 年全球 AI 市場將達 8,500 億美元",
    feed_name: "Gartner Press", url: "https://www.gartner.com/press",
    published_at: hrs(5.7).toISOString(), fetched_at: hrs(5.5).toISOString(),
    topic_category: "ai_model",
    confidence_score: 0.41, weighted_score: 0.76,
    drop_reason: "score_too_low",
    drop_detail: "預測性報告,Soul §Ⅴ 明示自動 drop;且無量化錨點來源,strategic_signal 僅 0.25。",
    status: "dropped", queue_status: null, platforms: null, image_status: null,
  },
  {
    id: "d_dr04",
    title: "OpenAI 發表 GPT-Rosalind 垂直 AI 模型(路透社版)",
    feed_name: "Reuters Tech", url: "https://www.reuters.com/tech/openai-gpt-rosalind",
    published_at: hrs(3.4).toISOString(), fetched_at: hrs(3.3).toISOString(),
    topic_category: "biotech_pharma",
    confidence_score: 0.71, weighted_score: 1.31,
    drop_reason: "duplicate",
    drop_detail: "與 d_p01 同題,且後於 Decrypt 原文 12 分鐘。Scorer 偵測到 title 相似度 0.89 > 0.75 閾值。",
    status: "dropped", queue_status: null, platforms: null, image_status: null,
  },
  {
    id: "d_dr05",
    title: "Elon Musk 又改 X 演算法,表示『真實使用者會被放大 10 倍』",
    feed_name: "Twitter - elonmusk", url: "https://x.com/elonmusk/status/yyy",
    published_at: hrs(7.8).toISOString(), fetched_at: hrs(7.5).toISOString(),
    topic_category: "celebrity_drama",
    confidence_score: 0.38, weighted_score: 0.12,
    drop_reason: "topic_downweighted",
    drop_detail: "名人嘴砲類別;且 X 演算法調整屬於沒有明確代碼落地的 vague claim,不符合 first-mover 原則。",
    status: "dropped", queue_status: null, platforms: null, image_status: null,
  },
];

// ---------- Timeline (24h) ----------
export const MOCK_TIMELINE = [
  { kind: "publish", hours_ago: 0.7, label: "Rosalind 已發布",         item_id: "d_p01" },
  { kind: "publish", hours_ago: 5,   label: "Claude Design 已發布",    item_id: "d_ap01" },
  { kind: "publish", hours_ago: 9,   label: "Optimus V3 已發布",       item_id: "d_ap02" },
  { kind: "publish", hours_ago: 13,  label: "CoWoS 已發布",            item_id: "d_ap03" },
  { kind: "publish", hours_ago: 17,  label: "Perplexity 已發布",       item_id: "d_ap04" },
  { kind: "publish", hours_ago: 21,  label: "Coinbase×Circle 已發布",  item_id: "d_ap05" },
  { kind: "publish", hours_ago: 23,  label: "Figma Sites 已發布",      item_id: "d_ap06" },
  ...Array.from({ length: 16 }, (_, i) => ({ kind: "harvest", hours_ago: i * 1.5, label: "harvest" })),
  ...Array.from({ length: 28 }, (_, i) => ({ kind: "score", hours_ago: i * 0.85 + 0.2, label: "scoring" })),
  { kind: "error", hours_ago: 11.2, label: "Gemini 429 quota · fallback claude-cli" },
  { kind: "error", hours_ago: 18.7, label: "IG Graph API: aspect ratio rejected" },
];

// ---------- System state ----------
export const MOCK_SYSTEM = {
  last_publish_at: mins(42).toISOString(),
  last_publish_title: "Rosalind 的第二次被剝奪——OpenAI 把垂直 AI 鎖進企業圍牆",
  last_publish_platforms: ["Facebook", "Instagram", "Threads"],
  last_publish_feed_name: "Decrypt",
  last_publish_origin: "pipeline",
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
    { level: "info", text: "Reflector 將於 06:00 UTC 執行 topic_weights back-prop。",                    at: hrs(2).toISOString() },
  ],

  reflections: [
    { at: hrs(8).toISOString(),  samples: 12, rules_added: 2, rationale: "Hsin 偏好把 hook 從時間副詞開頭改為『主體 + 隱喻動作』。新增結構規則。" },
    { at: hrs(32).toISOString(), samples: 10, rules_added: 1, rationale: "biotech_pharma 類別發文 IG saves 平均 +38%,weight 由 0.96 → 1.18。" },
    { at: hrs(56).toISOString(), samples: 14, rules_added: 0, rationale: "樣本數與上週持平,無顯著 pattern 變化,本次不下新規則。" },
  ],
};

// ---------- Phase 1A: Pipeline health (last 60 min) ----------
export const MOCK_PIPELINE_HEALTH = {
  harvested: 14,
  scored: 12,
  composed: 4,
  queued: 5,   // snapshot (not windowed) — matches MOCK_SYSTEM.queued_count
  published: 1,
  window_mins: 60,
};

// ---------- Phase 1C: Drop-reason breakdown ----------
// Mirrors the shape of buildDropBreakdown() — counts align with MOCK_ITEMS'
// `status: "dropped"` entries above so the page's chart and row list agree.
export const MOCK_DROP_BREAKDOWN = (() => {
  const cat = {
    score_too_low: "permanent",
    topic_downweighted: "permanent",
    duplicate: "permanent",
    pure_feature_update: "permanent",
    image_fetch_failed: "retry",
    llm_rate_limited: "retry",
  };
  const raw = [
    { code: "topic_downweighted", count: 24 },
    { code: "score_too_low", count: 11 },
    { code: "pure_feature_update", count: 7 },
    { code: "duplicate", count: 5 },
    { code: "image_fetch_failed", count: 3 },
  ];
  const total = raw.reduce((s, r) => s + r.count, 0);
  const reasons = raw.map((r) => ({
    ...r,
    category: cat[r.code] || "permanent",
    share: r.count / total,
  }));
  return { reasons, total, dominantReason: reasons.find((r) => r.share > 0.6) || null };
})();

// ---------- Phase 1D: 7-day weighted_score series for counterfactual ----------
// Deterministic pseudo-population so sliders show stable numbers in mock mode.
export const MOCK_COUNTERFACTUAL_SCORES = (() => {
  const arr = [];
  // crude "realistic" distribution: mostly 0.3–0.8, long tail above 0.7
  for (let i = 0; i < 220; i++) {
    const r = Math.sin(i * 12.9898) * 43758.5453; // deterministic pseudo-random
    const u = r - Math.floor(r); // [0,1)
    // Skewed toward middle with some AUTO-quality outliers
    const s = 0.35 + u * 0.55 + (u > 0.85 ? 0.1 : 0);
    arr.push(Number(Math.min(1.0, Math.max(0.2, s)).toFixed(3)));
  }
  return arr.sort((a, b) => a - b);
})();

// sanity: the assumed "now" of this mock snapshot, used by time helpers.
export const MOCK_NOW = NOW_MOCK;
