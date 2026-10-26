# 🪦 GitHub Graveyard

Enter a GitHub username, get a tombstone for every abandoned side project, each with a cause of death.

> RIP todo-app-v3 · 2022 – 2023 · *Cause of death: Replaced by its own sequel*

## How it works

- **A grave** is any repo the user owns (not a fork, not the profile README) that is archived or hasn't had a push in 180+ days.
- **Causes of death** (`lib/epitaphs.ts`) are deterministic, so the same repo always dies the same way. Name/description jokes come first (todo apps, `-v2` rewrites, AI wrappers, crypto, tutorials, Advent of Code…), then trait jokes (archived, famous, lots of open issues, died in 2 days, language). Each cause is used at most once per graveyard.
- **Ranks** ("Weekend Warrior", "Serial Abandoner", "Mass Grave Operator"…) come from the dead-to-alive ratio and the average lifespan.
- **Data** comes from GitHub's REST API and is cached for hours with `"use cache"` + `cacheLife("hours")`. Repos are fetched least-recently-pushed first (up to 300), so even prolific users show their real dead.

## Routes

| Route | What |
| --- | --- |
| `/` | Landing: dig form, featured devs to haunt, their most famous dead repos |
| `/:username` | The graveyard: rank, stats, share bar, tombstone grid, "roast a friend" |
| `/:username/:repo` | One grave, with its own OG card, for "RIP <repo>" posts |
| `/api/og/:username` | 1200×630 share card (`?format=portrait` → 1080×1350 for image posts) |
| `/api/og/:username/:repo` | 1200×630 single-grave card |
| `POST /api/dig` | Counts a dig (real GitHub users only) in Firestore |

## Run locally

```bash
npm install
cp .env.example .env   # fill in what you need; everything is optional locally
GITHUB_TOKENS=$(gh auth token) npm run dev
```

## Analytics and the dig counter

- **Firebase Analytics** tracks page views, digs, shares (by method, and whether people roast themselves or a friend), featured-dev clicks and stars. It loads after first paint and only sends events from production builds; in dev they're logged to the console. Add tracking to any element with `data-track="event"` plus `data-track-*` params.
- **Dig counter**: each dig increments `digs/{login}` in Firestore (count + last dug). Nothing about the visitor is stored. Writes go through `POST /api/dig` with the Admin SDK; without `FIREBASE_SERVICE_ACCOUNT` it's a no-op.

## Deploy (Vercel)

1. Push to GitHub and import into Vercel.
2. Set `GITHUB_TOKENS`: one or more **no-scope** classic tokens, comma separated. Each adds 5k req/hour, and a cold graveyard costs 2–4 requests.
3. Set `NEXT_PUBLIC_SITE_URL` once you have a domain. It's printed on every share card, so pick something short.
4. Set the Firebase web config (`API_KEYS`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`, `MEASUREMENT_ID`) for Analytics, and `FIREBASE_SERVICE_ACCOUNT` (the service account JSON, on one line) for the dig counter.
5. Check a deployed graveyard URL in a link-preview checker, then post it in a private X draft to confirm the large card renders.
