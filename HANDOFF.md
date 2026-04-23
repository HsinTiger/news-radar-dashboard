# News Radar Dashboard — Handoff Spec

**Audience:** Claude Code (Next.js + FastAPI implementation)
**Source of truth for visuals:** `News Radar Dashboard.html` (open in Canvas mode; six artboards)
**Source of truth for schema / business rules:** this doc + the design tokens file + the existing backend repo

---

## 1. Scope & Non-goals

**In scope**
- Read-only dashboard for the operator (`Alex`) to monitor the News Radar pipeline.
- Six pages: Home, Queue, Archive, Dropped, Persona, Settings.
- One slide-in Detail overlay with four tabs (Post Preview / Scorer / Metrics / Meta).

**Out of scope (v1)**
- Any write action (approve / reject / edit / reschedule / retry).
- Auth, multi-user, team features.
- Real-time push — polling every 30 s is fine for v1.

---

## 2. Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 App Router, React 18, TypeScript |
| Styling | CSS variables (copy from `lib/tokens.css`) + CSS Modules or Tailwind preset bound to the tokens |
| Data fetching | Server components for first paint + `useSWR` with 30 s refresh for live pages (Home, Queue) |
| Icons | Inline SVG (see `lib/shell.jsx` `Icon`) — no icon-font deps |
| Backend | Existing FastAPI (no changes required beyond the endpoints below) |
| Fonts | Inter, Noto Sans TC, JetBrains Mono, Newsreader — all via Google Fonts |

---

## 3. Design Tokens

Copy `lib/tokens.css` verbatim into `styles/tokens.css` and import at root layout. It defines:

- Neutral surfaces: `--bg`, `--bg-raised`, `--bg-muted`, `--bg-inset`
- Text: `--fg`, `--fg-1`, `--fg-2`, `--fg-3`
- Accent: `--accent` (violet), `--accent-soft`
- Status colors: `--st-queued`, `--st-published`, `--st-error`, `--st-dropped` (each has a matching `-bg`)
- Score thresholds: `--score-good` (≥0.70), `--score-ok` (0.65–0.70), `--score-bad` (<0.65)
- Shadows + radii
- `[data-theme="dark"]` flips all of the above.

**Do not invent new colors** outside this palette. If you need one, add it as a token first.

---

## 4. Routing

```
/                 → HomePage
/queue            → QueuePage
/archive          → ArchivePage
/dropped          → DroppedPage
/persona          → PersonaPage
/settings         → SettingsPage
```

Detail overlay is **not** a route — it is a client-side drawer triggered from any item row. Use a search param `?item=<id>` so the state is linkable and the back button closes it.

---

## 5. API Endpoints

The FastAPI side should expose these. Shapes are derived from `lib/mock-data.js` — use that as the literal fixture for testing.

### `GET /api/system/state`
```ts
{
  last_publish: { at: ISO8601, title: string, platforms: ("facebook"|"instagram"|"threads")[] } | null,
  next_publish_at: ISO8601 | null,
  queued_count: number,
  today: { cost_usd: number, llm_calls: number },
  budget: { daily_usd: number },
  thresholds: { AUTO_PUBLISH: number, RESCUE_PUBLISH: number, MIN_SCORE: number },
  alerts: Array<{ level: "info"|"warn"|"error", text: string, at: ISO8601 }>,
}
```

### `GET /api/timeline?hours=24`
```ts
Array<{ kind: "publish"|"harvest"|"score"|"error",
        at: ISO8601,
        label: string,
        item_id?: string }>
```

### `GET /api/items`
Query params: `status` (`queued`|`published`|`dropped`|`all`), `topic_id?`, `since?`, `until?`, `limit?`, `offset?`.
Returns a paged list with the shape used throughout `lib/mock-data.js`.

### `GET /api/items/:id`
The full item including `full_texts`, `publish_log`, `engagement`, `score_breakdown`, `editorial_note`.

### `GET /api/topics`
```ts
Array<{ id: string, name: string, emoji: string, weight: number,
        samples: number, last_delta: number }>
```

### `GET /api/reflections?limit=20`
```ts
Array<{ at: ISO8601, samples: number, rules_added: number, rationale: string }>
```

### `GET /api/persona`
Return the parsed persona YAML/MD (used only by PersonaPage). Structure is already shown in that page — mirror it.

---

## 6. Page-by-page notes

### Home (`/`)
Three-column grid on the main card area.
- **Left (2/3):** 24 h activity chart. Group by 1 h buckets. Stack: publishes (filled violet), harvests (hollow dot), errors (red tick). X axis in Asia/Taipei.
- **Right top (1/3):** Pulse card — last publish + next publish countdown + queued count.
- **Right bottom:** Cost today / budget bar. Animate on mount.
- **Below:** Recent 5 items across all statuses. Clicking any row opens detail drawer.

### Queue (`/queue`)
Timeline-style list sorted by `publish_at` ascending. Each row:
- Left: time badge (HH:MM + relative)
- Middle: title + feed + topic chip + score chip
- Right: platform badges (dimmed if platform is off) + image_status badge

Hover shows the full editorial note if present. Clicking opens drawer.

### Archive (`/archive`)
Table-like grid sorted by `publish_at` desc. Columns: cover thumb, title+feed, topic, score, platforms (with per-platform engagement inline `♥ 87  💬 4  ↻ 8`), time. Failed publishes get a red dot on the platform icon.

### Dropped (`/dropped`)
Same row shape as Queue, but the score chip is greyed and a `drop_reason` pill sits where the platform badges would be. Hover/expand to show `drop_detail`.

Reasons map to pill color:
- `duplicate` → neutral grey
- `topic_downweighted` → amber
- `pure_feature_update` → neutral grey
- `score_too_low` → amber
- `policy_block` → red

### Persona (`/persona`)
Pure read. Render the parsed YAML sections as cards. No edit.

### Settings (`/settings`)
Three panels:
1. **Thresholds** — display-only, three numeric cards.
2. **Topic weights** — bar chart with samples + last delta. Do **not** allow editing (the Reflector owns this).
3. **Reflection log** — vertical list from `/api/reflections`. Each entry shows date, sample count, rules added, rationale paragraph.

---

## 7. Detail Overlay

Mounted once at the root layout. Open via `?item=<id>`. Slides in from right, 820 px wide, full height, with backdrop blur.

Header: status pill · topic chip · score chip · external-source link · close (Esc).

Tabs:
1. **Post Preview** — platform switcher (FB/IG/Threads). Renders `full_texts[platform]` inside a mock post card. IG is 1:1, FB/Threads is 1.91:1. Show a character counter with platform-specific limits (FB 1000, IG 2000, Threads 500). Over-limit turns the count red.
2. **Scorer** — three top metric boxes (confidence, topic_weight, weighted), then a bar-breakdown of the four sub-scores, then the editorial_note rendered in a serif quote card with an "AI" chip and the model name. Color the bars by score band (green / amber / red).
3. **Metrics** — one card per platform, with the metrics grid (FB: likes/comments/shares/views; IG: likes/comments/saves/views; Threads: likes/comments/reposts/quotes/views). Show the platform `post_id` top-right.
4. **Meta** — the raw DB row as a label/value table, plus the publish_log entries with success/error pills.

---

## 8. Status → color mapping

| Status | Color token | Chinese label |
|---|---|---|
| `queued` | `--st-queued` (blue) | 已排入 |
| `published` | `--st-published` (green) | 已發布 |
| `error` / publish fail | `--st-error` (red) | 發布失敗 |
| `dropped` | `--st-dropped` (grey) | 已擋掉 |

Score chip color:
- `≥ 0.70` — green (auto-publish band)
- `0.65–0.70` — amber (rescue band)
- `< 0.65` — red / grey (below floor, normally only appears on dropped items)

---

## 9. Copy / Voice

The dashboard speaks Traditional Chinese with a dry, slightly literary voice, matching News Radar Soul. Sample phrases from the design (reuse verbatim where they fit):

- Page subtitles lean into metaphor — "過去 24 小時的 News Radar 呼吸節奏", "看看你自己會不會不同意"
- Empty states should be **one sentence**, not a pep talk. No emoji except for topic labels.
- Relative times: `剛剛 / N 分鐘前 / N 小時前 / N 天前 / 再 N 分鐘後` etc. See `MOCK_TIME.fmtRel` for the exact rule.
- Times shown in the UI: **Asia/Taipei, 24 h**. Never show local-browser TZ.

---

## 10. Accessibility + interaction

- All interactive rows must be keyboard-focusable. Enter/Space opens the drawer.
- Drawer closes on Esc and on backdrop click.
- Score bars animate once on mount (400 ms cubic-bezier(.2,.8,.2,1)). No looping animation anywhere.
- Respect `prefers-reduced-motion` — disable the slide-in and the bar fill animations.
- Contrast: all text must pass WCAG AA against its surface. Token set already satisfies this; don't introduce greyer-than-`--fg-3` text for anything users need to read.

---

## 11. Known gaps (pass back to product before building)

1. The `image_status` field has values `ok | rewrote | failed` in the mock. Confirm `rewrote` is a thing the backend actually emits (image-prompt retry).
2. No "retry publish" action is in scope for v1, but failed rows in Archive currently have nothing you can do from them. Confirm that is the intended behavior, or add a follow-up ticket.
3. Timeline granularity is 1 h buckets. If harvest cadence changes from 90 min to 30 min, buckets should drop to 15 min — make this a config, not a magic number.
4. Persona page is display-only. If Hsin wants to edit inline later, that becomes a new `PATCH /api/persona` + a diff-based review flow — design separately.

---

## 12. File map (inside this design project, for reference)

```
News Radar Dashboard.html     — entry, composes Canvas or Prototype
lib/tokens.css                — copy into Next.js as-is
lib/mock-data.js              — shape reference + test fixtures
lib/shell.jsx                 — Sidebar, Topbar, Icon, StatusPill, ScoreChip, PlatformBadges, RelTime
lib/pages-1.jsx               — Home, Queue
lib/pages-2.jsx               — Archive, Dropped, Persona, Settings
lib/detail.jsx                — Detail overlay + 4 tabs
lib/design-canvas.jsx         — starter component (presentation only; drop when porting)
```

When porting, map each `jsx` component 1:1 to a `components/*.tsx` file. Keep the file split — it's load-bearing for review velocity.
