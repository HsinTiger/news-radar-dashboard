import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MOCK_ITEMS,
  MOCK_TIMELINE,
  MOCK_SYSTEM,
  MOCK_NOW,
  MOCK_PIPELINE_HEALTH,
  MOCK_DROP_BREAKDOWN,
  MOCK_COUNTERFACTUAL_SCORES,
  MOCK_PROPOSALS,
} from "@/data/mockData.js";
import { TOPICS, topicById } from "@/lib/topics.js";
import { setLive, getNow } from "@/lib/time.js";
import { getISOWeekString } from "@/lib/iso-week.js";

const LIVE_MODE = !!import.meta.env.VITE_USE_LIVE_DB;
const REFRESH_MS = 5 * 60 * 1000;

// Switch time.js out of frozen-mock mode at module load. After this flips,
// getNow() returns `new Date()` on every call, so RelTime / fmtRel render
// against real wall-clock time instead of the 2026-04-23T06:30Z mock anchor.
// Module-level call (not effect) so even the first SSR-style render is correct.
if (LIVE_MODE) {
  setLive(true);
}

/**
 * Main data hook.
 * @returns {{
 *   items: Array,
 *   timeline: Array,
 *   system: Object,
 *   topics: Array,
 *   topicById: (id: string) => Object,
 *   now: Date,
 *   loading: boolean,
 *   error: Error | null,
 *   proposals: Array,
 *   refresh: () => void,
 * }}
 */
export function useNewsRadarDB() {
  // State is used even in mock mode so the hook's shape (and thus React's hook
  // call order) doesn't depend on the env var.
  //
  // `updatedAt` is the wall-clock time the snapshot was last materialized
  // (either the mock's fixed MOCK_NOW or the live-mode load's `new Date()`).
  // Pages use it to render the "資料更新於 HH:MM" freshness indicator so
  // Alex can see at a glance whether the 5-min poll is still ticking.
  const [snapshot, setSnapshot] = useState(() =>
    LIVE_MODE
      ? {
          items: [],
          timeline: [],
          // Safe shell so pages can access nested fields before the first load
          // resolves, without threading loading checks through every component.
          system: {
            last_publish_at: null,
            last_publish_title: null,
            last_publish_platforms: [],
            last_publish_feed_name: null,
            last_publish_origin: null,
            next_publish_at: null,
            queued_count: 0,
            today_cost_usd: 0,
            today_llm_calls: 0,
            budget_daily: 2.0,
            thresholds: { AUTO_PUBLISH: 0.7, RESCUE_PUBLISH: 0.65, MIN_SCORE: 0.65 },
            alerts: [],
            reflections: [],
          },
          topics: TOPICS,
          now: new Date(),
          updatedAt: null,
          pipelineHealth: { harvested: 0, scored: 0, composed: 0, queued: 0, published: 0, window_mins: 60 },
          dropBreakdown: { reasons: [], total: 0, dominantReason: null },
          counterfactualScores: [],
          proposals: [],
          proposalsPollTime: null,
        }
      : {
          items: MOCK_ITEMS,
          timeline: MOCK_TIMELINE,
          system: MOCK_SYSTEM,
          topics: TOPICS,
          now: MOCK_NOW,
          updatedAt: MOCK_NOW,
          pipelineHealth: MOCK_PIPELINE_HEALTH,
          dropBreakdown: MOCK_DROP_BREAKDOWN,
          counterfactualScores: MOCK_COUNTERFACTUAL_SCORES,
          proposals: MOCK_PROPOSALS,
          proposalsPollTime: MOCK_NOW,
        }
  );
  const [loading, setLoading] = useState(LIVE_MODE);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  const dbRef = useRef(null);

  const doRefresh = useCallback(() => {
    if (!LIVE_MODE) return;
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!LIVE_MODE) return undefined;

    let cancelled = false;
    let currentDb = null;

    (async () => {
      try {
        // Dynamic import keeps sql.js out of the mock-mode bundle.
        const [{ loadLiveDB }, adapter, { fetchProposalsLive }] = await Promise.all([
          import("@/lib/db.js"),
          import("@/lib/dbAdapter.js"),
          import("@/lib/dbAdapter.js"),
        ]);
        if (cancelled) return;

        // Only show the full-page spinner on the very first load; subsequent
        // refreshes swap data in place so the UI doesn't flash.
        if (tick === 0) setLoading(true);

        const db = await loadLiveDB();
        if (cancelled) {
          db.close();
          return;
        }
        currentDb = db;

        const now = getNow();
        const isoWeek = getISOWeekString(now);
        const proposals = await fetchProposalsLive(isoWeek);

        const next = {
          items: adapter.buildItems(db),
          timeline: adapter.buildTimeline(db, now),
          system: adapter.buildSystem(db, now),
          topics: adapter.buildTopics(db),
          now,
          updatedAt: now,
          pipelineHealth: adapter.buildPipelineHealth(db, now),
          dropBreakdown: adapter.buildDropBreakdown(db),
          counterfactualScores: adapter.buildCounterfactualScores(db, now),
          proposals,
          proposalsPollTime: proposals.length > 0 ? now : null,
        };

        // Close the previously-held DB before swapping in the new one.
        if (dbRef.current && dbRef.current !== db) {
          try {
            dbRef.current.close();
          } catch {
            /* ignore */
          }
        }
        dbRef.current = db;

        setSnapshot(next);
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (currentDb && currentDb !== dbRef.current) {
        try {
          currentDb.close();
        } catch {
          /* ignore */
        }
      }
    };
  }, [tick]);

  // 5-minute polling loop for live mode.
  useEffect(() => {
    if (!LIVE_MODE) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  // visibilitychange — when Alex tabs back in, force a refresh so he doesn't
  // wait up to 5 minutes to see the latest pipeline state. Only fires on the
  // actual visible transition; background tabs still use the poll interval.
  useEffect(() => {
    if (!LIVE_MODE) return undefined;
    if (typeof document === "undefined") return undefined;
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        setTick((t) => t + 1);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // Free the DB on unmount.
  useEffect(() => {
    return () => {
      if (dbRef.current) {
        try {
          dbRef.current.close();
        } catch {
          /* ignore */
        }
        dbRef.current = null;
      }
    };
  }, []);

  return useMemo(
    () => ({
      items: snapshot.items,
      timeline: snapshot.timeline,
      system: snapshot.system,
      topics: snapshot.topics,
      topicById,
      now: snapshot.now,
      updatedAt: snapshot.updatedAt,
      pipelineHealth: snapshot.pipelineHealth,
      dropBreakdown: snapshot.dropBreakdown,
      counterfactualScores: snapshot.counterfactualScores,
      proposals: snapshot.proposals,
      proposalsPollTime: snapshot.proposalsPollTime,
      loading,
      error,
      refresh: doRefresh,
    }),
    [snapshot, loading, error, doRefresh]
  );
}

// Convenience selectors for pages that only need a slice.
export function useItem(id) {
  const { items } = useNewsRadarDB();
  return useMemo(() => items.find((i) => i.id === id) || null, [items, id]);
}
