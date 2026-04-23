// Topic lookup helpers. Canonical list of Phase 8.20 topic taxonomy.
// When wired to sql.js, topic weights come from the `topic_weights` table.

export const TOPICS = [
  { id: "ai_model",        name: "AI 模型",       emoji: "🧠", weight: 1.85, samples: 142, last_delta:  0.08 },
  { id: "big_tech",        name: "Big Tech 戰略", emoji: "🏢", weight: 1.72, samples: 118, last_delta:  0.05 },
  { id: "semi_chips",      name: "半導體",        emoji: "💾", weight: 1.58, samples:  74, last_delta:  0.12 },
  { id: "crypto_web3",     name: "加密貨幣",      emoji: "₿",  weight: 1.34, samples:  96, last_delta: -0.03 },
  { id: "biotech_pharma",  name: "生技製藥",      emoji: "🧬", weight: 1.18, samples:  41, last_delta:  0.22 },
  { id: "hardware_robot",  name: "硬體機器人",    emoji: "🤖", weight: 1.05, samples:  53, last_delta:  0.00 },
  { id: "startup_vc",      name: "新創與 VC",     emoji: "🚀", weight: 0.92, samples:  88, last_delta: -0.08 },
  { id: "policy_regulate", name: "政策監管",      emoji: "⚖️", weight: 0.78, samples:  45, last_delta:  0.04 },
  { id: "consumer_app",    name: "消費應用",      emoji: "📱", weight: 0.54, samples:  67, last_delta: -0.11 },
  { id: "celebrity_drama", name: "名人嘴砲",      emoji: "🎭", weight: 0.32, samples:  29, last_delta: -0.15 },
];

/** Return the topic row for a given topic_category, or a graceful fallback. */
export function topicById(id) {
  return TOPICS.find((t) => t.id === id) || { id, name: id, emoji: "📄", weight: 1.0 };
}
