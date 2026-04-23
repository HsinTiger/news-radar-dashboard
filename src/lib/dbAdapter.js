// dbAdapter.js — shape rows from news_radar.db into the mock-compatible objects
// that the pages already consume. Keeping the output identical to mockData.js
// means pages/components don't need to care whether data is live or mocked.
//
// Tables read: news_items, drafts, platform_drafts, publish_log, engagement_stats,
// topic_weights, reflection_events, token_usage_daily.

import { TOPICS } from "@/lib/topics.js";

// Convenience: run a SELECT and return rows as plain objects.
function query(db, sql, params = []) {
  const stmt = db.prepare(sql);
  try {
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    return rows;
  } finally {
    stmt.free();
  }
}

function tryParseJSON(s) {
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function groupBy(rows, key) {
  const m = new Map();
  for (const r of rows) {
    const k = r[key];
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  }
  return m;
}

function todayUtcDateStr(now = new Date()) {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Build the big flat items array matching MOCK_ITEMS shape.
export function buildItems(db) {
  // news_items: dropped OR has_draft (joined below).
  // We pull the union of (a) dropped items and (b) items that have a draft.
  const items = query(
    db,
    `
    SELECT
      n.id            AS news_id,
      n.feed_name,
      n.url,
      n.title,
      n.published_at,
      n.fetched_at,
      n.og_image_url,
      n.status        AS n_status,
      n.drop_reason,
      n.topic_category,
      n.weighted_score,
      d.id            AS draft_id,
      d.status        AS d_status,
      d.queue_status,
      d.publish_at,
      d.confidence_score,
      d.score_breakdown
    FROM news_items n
    LEFT JOIN drafts d ON d.news_id = n.id
    WHERE n.status = 'dropped' OR d.id IS NOT NULL
    ORDER BY COALESCE(d.publish_at, n.fetched_at) DESC
    `
  );

  if (items.length === 0) return [];

  const draftIds = items.map((r) => r.draft_id).filter(Boolean);
  const platformDrafts = draftIds.length
    ? query(
        db,
        `SELECT draft_id, platform, full_text FROM platform_drafts WHERE draft_id IN (${draftIds
          .map(() => "?")
          .join(",")})`,
        draftIds
      )
    : [];
  const publishLogs = draftIds.length
    ? query(
        db,
        `SELECT draft_id, platform, platform_post_id, posted_at, success, error_message
         FROM publish_log WHERE draft_id IN (${draftIds.map(() => "?").join(",")})`,
        draftIds
      )
    : [];
  const engagementRows = draftIds.length
    ? query(
        db,
        `SELECT draft_id, platform, likes, comments, shares, saves, reposts, quotes, views, fetched_at
         FROM engagement_stats WHERE draft_id IN (${draftIds.map(() => "?").join(",")})
         ORDER BY fetched_at ASC`,
        draftIds
      )
    : [];

  const pdByDraft = groupBy(platformDrafts, "draft_id");
  const plByDraft = groupBy(publishLogs, "draft_id");
  const enByDraft = groupBy(engagementRows, "draft_id");

  return items.map((r) => {
    const pds = pdByDraft.get(r.draft_id) || [];
    const pls = plByDraft.get(r.draft_id) || [];
    const ens = enByDraft.get(r.draft_id) || [];

    // platforms: present in platform_drafts (ever composed for this platform).
    const platformSet = new Set(pds.map((p) => p.platform));
    const platforms = pds.length
      ? {
          facebook: platformSet.has("facebook"),
          instagram: platformSet.has("instagram"),
          threads: platformSet.has("threads"),
        }
      : null;

    // full_texts — keyed by platform.
    const full_texts = pds.length
      ? pds.reduce((acc, p) => {
          acc[p.platform] = p.full_text;
          return acc;
        }, {})
      : null;

    // publish_log — one entry per log row, success as boolean.
    const publish_log = pls.length
      ? pls.map((l) => ({
          platform: l.platform,
          success: !!l.success,
          platform_post_id: l.platform_post_id || null,
          posted_at: l.posted_at,
          error_message: l.error_message || null,
        }))
      : undefined;

    // engagement — take the LATEST row per platform.
    let engagement;
    if (ens.length) {
      const latest = {};
      for (const e of ens) latest[e.platform] = e;
      engagement = {};
      for (const plat of ["facebook", "instagram", "threads"]) {
        const e = latest[plat];
        if (e) {
          engagement[plat] = {
            likes: e.likes || 0,
            comments: e.comments || 0,
            shares: e.shares || 0,
            saves: e.saves || 0,
            reposts: e.reposts || 0,
            quotes: e.quotes || 0,
            views: e.views || 0,
          };
        }
      }
    }

    // status: mirrors mock — dropped items show drop state, otherwise use drafts.status.
    // queue_status mirrors drafts.queue_status (null when dropped/never-queued).
    const status = r.n_status === "dropped" ? "dropped" : r.d_status || r.n_status;

    // image_status — derive. 'ok' when we have an image URL, 'failed' when
    // this was a publish where any platform logged an image-related error.
    let image_status = r.og_image_url ? "ok" : null;
    if (pls.some((l) => !l.success && /image|aspect|media/i.test(l.error_message || ""))) {
      image_status = "failed";
    }

    return {
      id: r.draft_id || r.news_id,
      news_id: r.news_id,
      title: r.title,
      feed_name: r.feed_name,
      url: r.url,
      published_at: r.published_at,
      fetched_at: r.fetched_at,
      topic_category: r.topic_category,
      confidence_score:
        r.confidence_score != null ? r.confidence_score : null,
      weighted_score: r.weighted_score != null ? r.weighted_score : null,
      score_breakdown: tryParseJSON(r.score_breakdown),
      editorial_note: null, // not stored in current schema
      status,
      queue_status: r.queue_status || null,
      platforms,
      image_status,
      image_url: r.og_image_url || null,
      publish_at: r.publish_at || null,
      drop_reason: r.drop_reason || null,
      drop_detail: null, // not stored in current schema
      engagement,
      publish_log,
      full_texts,
    };
  });
}

// Build a synthetic 24h timeline from publish_log + news_items + errors.
export function buildTimeline(db, now = new Date()) {
  const nowIso = now.toISOString();
  const cutoffIso = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const publishes = query(
    db,
    `
    SELECT pl.posted_at, pl.draft_id, pl.success, pl.error_message, n.title
    FROM publish_log pl
    JOIN drafts d ON d.id = pl.draft_id
    JOIN news_items n ON n.id = d.news_id
    WHERE pl.posted_at >= ?
    ORDER BY pl.posted_at DESC
    `,
    [cutoffIso]
  );

  const harvests = query(
    db,
    `
    SELECT fetched_at FROM news_items WHERE fetched_at >= ? ORDER BY fetched_at DESC
    `,
    [cutoffIso]
  );

  const scored = query(
    db,
    `
    SELECT fetched_at FROM news_items
    WHERE weighted_score IS NOT NULL AND fetched_at >= ?
    ORDER BY fetched_at DESC
    `,
    [cutoffIso]
  );

  const toHoursAgo = (iso) => (now.getTime() - new Date(iso).getTime()) / 3600000;

  const events = [];

  // Collapse multi-platform publishes into one entry per (draft, minute) to mimic mock cadence.
  const collapsedPublishes = new Map();
  for (const p of publishes) {
    const key = `${p.draft_id}:${p.posted_at.slice(0, 16)}`;
    if (!collapsedPublishes.has(key)) collapsedPublishes.set(key, p);
  }
  for (const p of collapsedPublishes.values()) {
    if (p.success) {
      events.push({
        kind: "publish",
        hours_ago: toHoursAgo(p.posted_at),
        label: `${p.title.slice(0, 18)}${p.title.length > 18 ? "…" : ""} 已發布`,
        item_id: p.draft_id,
      });
    } else {
      events.push({
        kind: "error",
        hours_ago: toHoursAgo(p.posted_at),
        label: p.error_message || "publish failed",
      });
    }
  }
  for (const h of harvests) {
    events.push({ kind: "harvest", hours_ago: toHoursAgo(h.fetched_at), label: "harvest" });
  }
  for (const s of scored) {
    events.push({ kind: "score", hours_ago: toHoursAgo(s.fetched_at), label: "scoring" });
  }

  return events;
}

// Build the system-state panel (HomePage, SettingsPage).
export function buildSystem(db, now = new Date()) {
  const lastPublishRow = query(
    db,
    `
    SELECT pl.posted_at, n.title, GROUP_CONCAT(pl.platform) AS platforms
    FROM publish_log pl
    JOIN drafts d ON d.id = pl.draft_id
    JOIN news_items n ON n.id = d.news_id
    WHERE pl.success = 1
    GROUP BY pl.draft_id
    ORDER BY pl.posted_at DESC
    LIMIT 1
    `
  )[0];

  const nextPublishRow = query(
    db,
    `SELECT publish_at FROM drafts WHERE queue_status = 'queued' ORDER BY publish_at ASC LIMIT 1`
  )[0];

  const queuedCount = query(
    db,
    `SELECT COUNT(*) AS n FROM drafts WHERE queue_status = 'queued'`
  )[0]?.n || 0;

  const today = todayUtcDateStr(now);
  const todayUsage = query(
    db,
    `SELECT
       SUM(total_cost_usd) AS cost,
       SUM(call_count) AS calls
     FROM token_usage_daily WHERE date = ?`,
    [today]
  )[0] || {};

  const reflectionRows = query(
    db,
    `SELECT ran_at, samples_used, rules_added_json, rationale, status
     FROM reflection_events ORDER BY ran_at DESC LIMIT 20`
  );

  const platformMap = {
    facebook: "Facebook",
    instagram: "Instagram",
    threads: "Threads",
  };
  const lastPublishPlatforms = lastPublishRow?.platforms
    ? [...new Set(lastPublishRow.platforms.split(","))]
        .map((p) => platformMap[p] || p)
    : [];

  return {
    last_publish_at: lastPublishRow?.posted_at || null,
    last_publish_title: lastPublishRow?.title || null,
    last_publish_platforms: lastPublishPlatforms,
    next_publish_at: nextPublishRow?.publish_at || null,
    queued_count: queuedCount,
    today_cost_usd: todayUsage.cost || 0,
    today_llm_calls: todayUsage.calls || 0,
    budget_daily: 2.0,

    thresholds: {
      AUTO_PUBLISH: 0.7,
      RESCUE_PUBLISH: 0.65,
      MIN_SCORE: 0.65,
    },

    // Schema has no alerts table — dashboard suppresses this panel when empty.
    alerts: [],

    reflections: reflectionRows.map((r) => {
      const rules = tryParseJSON(r.rules_added_json) || [];
      return {
        at: r.ran_at,
        samples: r.samples_used || 0,
        rules_added: Array.isArray(rules) ? rules.length : 0,
        rationale: r.rationale || "",
      };
    }),
  };
}

// ---------- Phase 1A: Pipeline health ----------

// Stage counts over the past 1 hour, matching the hourly publish cron cadence.
// `queued` is intentionally a SNAPSHOT (not windowed) — it answers "how many
// are waiting for the publisher RIGHT NOW?", which is the load-bearing number.
export function buildPipelineHealth(db, now = new Date()) {
  const cutoffIso = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

  const harvested = query(
    db,
    `SELECT COUNT(*) AS n FROM news_items WHERE fetched_at >= ?`,
    [cutoffIso]
  )[0]?.n || 0;

  const scored = query(
    db,
    `SELECT COUNT(*) AS n FROM news_items WHERE weighted_score IS NOT NULL AND fetched_at >= ?`,
    [cutoffIso]
  )[0]?.n || 0;

  // "composed" = draft written in the window. drafts.generated_at is the
  // authoritative compose timestamp (populated by run_pipeline.py).
  const composed = query(
    db,
    `SELECT COUNT(*) AS n FROM drafts WHERE generated_at >= ?`,
    [cutoffIso]
  )[0]?.n || 0;

  const queued = query(
    db,
    `SELECT COUNT(*) AS n FROM drafts WHERE queue_status = 'queued'`
  )[0]?.n || 0;

  // A single draft publishing to 3 platforms is one publish event, not three.
  const published = query(
    db,
    `SELECT COUNT(DISTINCT draft_id) AS n FROM publish_log WHERE success = 1 AND posted_at >= ?`,
    [cutoffIso]
  )[0]?.n || 0;

  return { harvested, scored, composed, queued, published, window_mins: 60 };
}

// ---------- Phase 1C: Drop-reason breakdown ----------

// Permanent-vs-retry categorization is UI-layer knowledge — the scorer doesn't
// label reasons this way. Keep in sync with backend scorer drop_reason literals.
const DROP_REASON_CATEGORY = {
  // permanent: judgement call, won't flip on retry
  score_too_low: "permanent",
  topic_downweighted: "permanent",
  duplicate: "permanent",
  pure_feature_update: "permanent",
  off_topic: "permanent",
  // retry: transient, the item could come back through the pipeline
  image_fetch_failed: "retry",
  llm_rate_limited: "retry",
  llm_error: "retry",
  scorer_error: "retry",
};

export function buildDropBreakdown(db) {
  const rows = query(
    db,
    `SELECT drop_reason, COUNT(*) AS n
     FROM news_items
     WHERE status = 'dropped' AND drop_reason IS NOT NULL AND drop_reason != ''
     GROUP BY drop_reason
     ORDER BY n DESC`
  );
  const total = rows.reduce((s, r) => s + (r.n || 0), 0);
  const reasons = rows.map((r) => ({
    code: r.drop_reason,
    count: r.n,
    category: DROP_REASON_CATEGORY[r.drop_reason] || "permanent",
    share: total ? r.n / total : 0,
  }));
  const dominantReason = reasons.find((r) => r.share > 0.6) || null;
  return { reasons, total, dominantReason };
}

// ---------- Phase 1D: Counterfactual threshold simulator ----------

// Lean score series over the last 7 days. The slider component does the
// threshold math locally so dragging is instant (no re-query).
// news_items.weighted_score is the right source: it's what the scorer already
// persists, and every draft (via drafts.news_id FK) has exactly one row here.
// No migration to add weighted_score onto drafts is needed.
export function buildCounterfactualScores(db, now = new Date()) {
  const cutoffIso = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
  const rows = query(
    db,
    `SELECT weighted_score FROM news_items
     WHERE weighted_score IS NOT NULL AND fetched_at >= ?
     ORDER BY weighted_score ASC`,
    [cutoffIso]
  );
  return rows.map((r) => r.weighted_score);
}

// Build topics with weights from the live DB, merged with hardcoded emoji from topics.js.
export function buildTopics(db) {
  const rows = query(
    db,
    `SELECT category_id, display_name, weight, sample_count, last_delta FROM topic_weights`
  );
  // Overlay live values on the static topic list (so emojis from topics.js remain intact).
  const byId = Object.fromEntries(rows.map((r) => [r.category_id, r]));
  return TOPICS.map((t) => {
    const live = byId[t.id];
    if (!live) return t;
    return {
      ...t,
      name: live.display_name || t.name,
      weight: live.weight != null ? live.weight : t.weight,
      samples: live.sample_count != null ? live.sample_count : t.samples,
      last_delta: live.last_delta != null ? live.last_delta : t.last_delta,
    };
  });
}
