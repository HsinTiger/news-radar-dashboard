# Deploy to GitHub Pages

This dashboard deploys as GitHub Pages **project pages** under `HsinTiger/news-radar-dashboard`, which makes it reachable at `https://hsintiger.github.io/news-radar-dashboard/`.

The whole thing is driven by `.github/workflows/deploy.yml` — push to `main`, and the workflow builds the site (with `VITE_USE_LIVE_DB=1`) and publishes it to Pages. No `gh-pages` branch involved; it uses the modern `actions/deploy-pages` flow.

---

## First-time setup

### 1. Create the repo

```bash
gh repo create HsinTiger/news-radar-dashboard --public --source=. --remote=origin
git push -u origin main
```

Or via the GitHub UI: create `HsinTiger/news-radar-dashboard`, then `git remote add origin` and push.

### 2. Enable Pages

Settings → Pages → **Source: GitHub Actions**

No branch selection needed — the workflow uploads the artifact directly.

### 3. Confirm the backend repo is readable

`src/lib/db.js` fetches `https://raw.githubusercontent.com/HsinTiger/news-radar/state/data/01_harvest/news_radar.db` at runtime from the user's browser. That means:

- `HsinTiger/news-radar` must be **public** (it is — confirmed), OR
- If it goes private later, the dashboard will need a server-side proxy.

`raw.githubusercontent.com` serves with `Access-Control-Allow-Origin: *`, so no CORS config is needed.

### 4. Push to main

```bash
git push origin main
```

Watch the Actions tab — the workflow has two jobs (`build` then `deploy`) and usually finishes in under 2 minutes. The deploy step prints the live URL.

---

## Local verification before pushing

```bash
npm run build:live        # builds with VITE_USE_LIVE_DB=1, outputs to dist/
npm run preview           # serves dist/ at http://localhost:4173/news-radar-dashboard/
```

Open the preview URL and confirm:
- Home page loads without the loading spinner getting stuck
- `?item=<id>` deep links open the detail overlay
- Reloading on `/queue` doesn't 404 (that's what `404.html` fallback is for — in `preview` it's the dev-server that handles this, in prod GH Pages serves `404.html` for unknown paths)

---

## Configuration knobs

Set these as env vars at build time if you need to override defaults:

| Variable             | Default                                                                                          | Purpose                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `VITE_USE_LIVE_DB`   | unset (mock mode)                                                                                | When set, `useNewsRadarDB` fetches the live DB instead of using mock |
| `VITE_DB_URL`        | `https://raw.githubusercontent.com/HsinTiger/news-radar/state/data/01_harvest/news_radar.db`      | Override the DB fetch URL (useful for testing against a fork)        |

The Vite `base` is pinned in `vite.config.js` to `/news-radar-dashboard/`. Change it there if the repo is ever renamed — the router picks it up via `import.meta.env.BASE_URL`.

---

## Troubleshooting

**Blank page, console says "Failed to fetch sql-wasm.wasm"**
→ `base` and the deployed URL don't match. Confirm `vite.config.js` matches the repo name, and that `public/sql-wasm.wasm` was copied into `dist/sql-wasm.wasm` during the build.

**Deep link 404**
→ `dist/404.html` missing. The workflow copies `dist/index.html → dist/404.html` after the build; if you're building locally, run that copy manually before previewing.

**CORS error fetching the DB**
→ `raw.githubusercontent.com` sends `*`. If you see CORS errors, it's usually because the backend repo went private — check visibility on `HsinTiger/news-radar`.

**Stale data**
→ The dashboard caches the DB bytes in memory and re-fetches every 5 minutes. The URL includes `?t=<timestamp>` + `cache: "no-store"`, so a manual refresh hits a fresh copy.
