// publishCron.js — hardcoded knowledge of the backend's publish cadence so the
// dashboard can answer "when does the next publish fire?" without querying the DB.
//
// Source of truth (backend `news-radar` repo):
//   - .github/workflows/pipeline.yml runs `cron: "0 * * * *"` in UTC.
//   - run_publish_queue.py honours MIN_INTERVAL_SECONDS = 3600 (1h upper bound);
//     a cycle *may* skip if the last successful publish was < 60 min ago, or run
//     but pick nothing if the queue is empty. We don't model that here — we just
//     report the next scheduled *cycle*. That matches the spec: "寫死 cron 邏輯,
//     不要 query DB".
//
// If the cron ever changes, update both CRON_MINUTE_UTC and the comment block
// together, and bump the `docs/DEPLOY.md` note.

export const CRON_MINUTE_UTC = 0; // fires at :00 UTC every hour

/**
 * Returns the next scheduled publish cycle as a Date.
 * If the current minute equals CRON_MINUTE_UTC exactly, returns the NEXT hour
 * (assume the current cycle has already started / is in flight).
 */
export function nextPublishCycle(now = new Date()) {
  const next = new Date(now);
  next.setUTCSeconds(0, 0);
  if (now.getUTCMinutes() >= CRON_MINUTE_UTC) {
    next.setUTCHours(now.getUTCHours() + 1, CRON_MINUTE_UTC);
  } else {
    next.setUTCMinutes(CRON_MINUTE_UTC);
  }
  return next;
}

/**
 * "HH:MM" in Asia/Taipei (+08:00) for the next cycle.
 * UTC top-of-hour stays top-of-hour in Taipei, so this is always "HH:00".
 */
export function nextPublishLabel(now = new Date()) {
  const d = nextPublishCycle(now);
  const tpe = new Date(d.getTime() + 8 * 3600_000);
  return `${String(tpe.getUTCHours()).padStart(2, "0")}:${String(
    tpe.getUTCMinutes()
  ).padStart(2, "0")}`;
}

/** Minutes between now and the next scheduled cycle (≥ 0). */
export function minutesToNextPublish(now = new Date()) {
  return Math.max(0, Math.round((nextPublishCycle(now).getTime() - now.getTime()) / 60_000));
}
