# Architecture

This document explains how the pieces of the site fit together. For quick agent-facing rules see `CLAUDE.md` at the repo root.

## Overview

The site is a Next.js 15 App Router app that renders almost entirely on the client. There is no database: static collectible definitions are checked-in JSON, and per-user unlock state is fetched live from the Steam / Xbox web APIs, keyed by identity cookies. Nothing user-specific is stored server-side.

```
public/data/*.json ──(build-time import via @data)──┐
                                                    ├─→ client Context providers ─→ tables/cards
/api/achievements ──(fetch on login, joined by name)┘
```

## Directory layout

| Path | Purpose |
|---|---|
| `src/app/` | App Router routes. Pages are thin: set `metadata`, render a feature component. |
| `src/app/api/` | Route handlers: auth flows and the achievements proxy. |
| `src/games/<slug>/` | Feature components per game (all `"use client"`). |
| `src/components/` | Shared UI: `Icon`, `Info`, `Modal`, `Navigation`, `NavLink`, `GameGrid`, `ProgressBar`, `ToggleButton`, `SquareButton`, `LoginButton`. |
| `src/hooks/` | `LoginContext` (auth + MCC achievements), `useAchievements` (per-game fetch), `useToggle`, `useCached`, `useCachedToggle`. |
| `src/models/` | TypeScript interfaces for data files and API responses. |
| `src/utilities/` | `auth.ts` (OpenID client), `variables.ts` (env), `delay.ts` (`waitFor` polling helper). |
| `public/data/` | Collectible JSON. Root files are live; per-game subfolders are legacy sources. |
| `scripts/` | One-off Python data tooling (`combine.py`, `get_wiki_links.py`). |

## Authentication

Three login paths, all ending in cookies with a 3-month expiry that the client reads with `js-cookie`:

1. **Steam OpenID** — `GET /api/auth` redirects to Steam; `GET /api/auth/callback` verifies the assertion, parses the SteamID from the claimed identifier, and sets `STEAM_USER_ID`.
2. **Manual SteamID** — `POST /api/auth` with a `steamId` form field. It's validated by making a real GetPlayerAchievements call; failures redirect to `/error?message=...`.
3. **Xbox via xbl.io** — `GET /api/auth/xbox` redirects to xbl.io's hosted auth using `XBL_API_KEY`; `GET /api/auth/callback/xbox` sets `XUID` and `APP_KEY`.

`LoginProvider` (in the root layout) reads the cookies on mount, exposes `isLoggedIn` / `isLoggedInWithXbox` / `steamId`, and eagerly fetches `/api/achievements` (no `gameId`, so Halo: MCC) into context. `logout()` just deletes the cookies. The `openid` package is callback-based, so the auth routes busy-wait with `waitFor()` until the callback assigns a response.

## Achievement data flow

`GET /api/achievements?gameId=<steamAppId>`:

- If `XUID` + `APP_KEY` cookies exist → xbl.io achievements for Halo MCC only (title `1144039928`), mapped through `fromXboxAchievement` (includes progress `{current, target}` for partially-complete achievements).
- Else if `STEAM_USER_ID` exists → Steam GetPlayerAchievements for `gameId` (default `976730` = MCC), mapped through `toUserAchievement`.
- Else → `{ achievements: [] }`.

Both paths normalize to `UserAchievement { name, description?, unlockedTimestamp, progress }`. Responses use `next: { revalidate: 2 }` caching. Failures log a warning and return an empty list rather than an error status.

**Joining:** static definitions and user unlocks are matched by achievement `name` (case-insensitive for MCC achievements; exact template `"Skulltaker {game}: {name}"` for skulls, with `Halo 1` → `Halo: CE`). This is the most fragile invariant in the codebase — data edits that change names break unlock detection silently.

## Halo MCC collectibles

Each collectible type (skulls, terminals, data pads) follows the same shape under `src/games/halo-mcc/<type>/`:

- `<Type>Context.tsx` — provider imports the `@data` JSON, pulls `achievements` from `useLogin()`, computes a `lockedOnly` filter (default **on**: show only uncollected items), exposes toggles.
- `<Type>Filters.tsx`, `<Type>Table.tsx`, `<Type>TableRow.tsx` — presentational.
- `index.ts` — barrel that composes provider + page component.

Rows typically link a YouTube video ID (`video` field) and Halopedia URL. The MCC achievements page adds game/collection checkbox filters persisted to `localStorage` under `ACHIEVEMENT_FILTERS`.

## Other games

Non-MCC games (Spell Brigade, Battlefield 6) are Steam-only. They call `useAchievements(steamId, "<steamAppId>")` directly and render card grids, guarding with:

```tsx
if (!isLoggedIn || isLoggedInWithXbox) return <Info icon="alert-circle">…log in with Steam…</Info>;
```

Battlefield 6 augments the Steam data with `src/games/battlefield-6/extra-achievement-data.json` (secret flags, hidden descriptions, category tags) — again matched by name.

## Build & deploy

- `next.config.ts`: `output: "standalone"` (for Docker), a webpack `CopyPlugin` that copies the feather-icons sprite (the checked-in `public/icons.svg` is what's actually served), and a permanent redirect `/` → `/achievements`.
- `Dockerfile`: multi-stage node:20-slim build, runs the standalone `server.js` as user `nextjs` on port 3000.
- `.github/workflows/build.yml`: `npm ci && npm run build` on PRs — the only CI gate.
- `.github/workflows/containerize.yml`: on push to master, builds and pushes `ghcr.io/<owner>/halo-collectibles:latest`.

## Data tooling (scripts/)

- `combine.py` — one-time migration that flattened `public/data/<game>/*.json` into the combined root files, adding `game`/`collection` fields. Kept for reference; the root files are the source of truth now.
- `get_wiki_links.py` — enriches `achievements.json` with Halopedia `url` fields by probing `https://www.halopedia.org/<Name_With_Underscores>`; has a `manual_replacements` map for names that don't slugify cleanly. Refuses to write if any lookup 404s.
