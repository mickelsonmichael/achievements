# Halo Collectibles — Agent Guide

Achievement/collectible tracker for NotNotMike (single-maintainer hobby site). Users log in with Steam or Xbox and track achievements across games (Halo: MCC, The Spell Brigade, Battlefield 6) plus Halo collectibles (skulls, terminals, data pads).

Deeper detail lives in `docs/ARCHITECTURE.md`. Task recipes live in `.claude/skills/` (`run-app`, `add-game`, `collectible-data`).

## Stack & commands

- Next.js 15 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS v4.
- `npm run dev` — dev server on http://localhost:3000 (`/` permanently redirects to `/achievements`).
- `npm run build` — production build; this is CI's only check (no tests exist in this repo).
- `npm run lint` — ESLint (next/core-web-vitals + next/typescript).
- Verification for any change = `npm run lint && npm run build`, then exercise the page in dev mode.
- Deploy: push to `master` → GitHub Actions builds the Dockerfile and pushes to GHCR. PRs only run `npm run build`.
- Commit style: conventional-ish `feat:`/`fix:` one-liners (see `git log`).

## Path aliases (tsconfig.json)

- `@/*` → `src/*`
- `@data/*` → `public/data/*` (static collectible JSON, imported directly into client components)
- `@hooks/*` → `src/hooks/*`, `@games/*` → `src/games/*`

## Architecture in one paragraph

Route files under `src/app/` are thin server components that only set `metadata` and render a feature component from `src/games/<game-slug>/`. All real UI is client components (`"use client"`). Static collectible definitions come from `public/data/*.json` via `@data` imports; the logged-in user's unlock state comes from `/api/achievements` (Steam or Xbox web APIs) and the two are joined **by achievement name string matching** on the client. Feature folders follow a Context pattern: `XContext.tsx` (provider owns data + filters), `XFilters.tsx`, `XTable.tsx`, `XTableRow.tsx`, `index.ts` barrel.

## Critical conventions & gotchas

- **Achievement matching is by name.** e.g. skulls match the achievement `"Skulltaker {game}: {skullName}"` and `Game.Halo1` must be renamed to `"Halo: CE"` first (`SkullsContext.tsx`). Case-insensitive compare in `AchievementsContext.tsx`. Renaming anything in the JSON data silently breaks unlock detection — no error is thrown.
- **Auth state is cookies read client-side** (`js-cookie` in `src/hooks/LoginContext.tsx`): `STEAM_USER_ID`, `XUID` + `APP_KEY` (Xbox). Cookies are *not* httpOnly by design — the client needs to read them. Xbox login wins over Steam in `/api/achievements`.
- **Xbox auth only works for Halo: MCC** (title ID hardcoded to `1144039928`). Other games require Steam; their pages guard with `if (!isLoggedIn || isLoggedInWithXbox)` and render an `<Info>` prompt.
- **Steam app IDs are hardcoded per game**: Halo MCC `976730` (default in the API route), The Spell Brigade `2904000`, Battlefield 6 `2807960`. Pass to `useAchievements(steamId, gameId)`.
- The `openid` library is callback-based; API routes wrap it with the `waitFor` polling helper (`src/utilities/delay.ts`). Follow that pattern if touching auth routes.
- **Icons**: `<Icon name="..." />` renders feather icons from the sprite at `public/icons.svg` (`<use href="/icons.svg#name">`). Valid names are typed in `src/components/Icon/IconName.ts`. `"steam"` and `"xbox"` are special-cased to standalone SVGs in `public/`. The webpack CopyPlugin in `next.config.ts` copies the sprite to `src/public/` — that path is vestigial; the served file is `public/icons.svg`.
- **`public/data/<game>/` subfolders are legacy source data.** The app only reads the combined root files (`achievements.json`, `skulls.json`, `terminals.json`, `datapads.json`). `scripts/combine.py` was the one-time merge; edit the root files directly now (see the `collectible-data` skill).
- Client-side state persistence uses `localStorage` (e.g. `ACHIEVEMENT_FILTERS` in `AchievementsContext.tsx`).
- Don't export `metadata` from `"use client"` files — set it in the `src/app/` route file (there is one existing violation in `Battlefield6.tsx`; Next ignores it because it's not a route file, but don't copy the pattern).

## Environment variables

Local `.env` (gitignored): `STEAM_API_KEY` (Steam Web API key), `PUBLIC_URL` (defaults to `http://localhost:3000`), `XBL_API_KEY` (xbl.io app key, only needed for Xbox login). Defaults live in `src/utilities/variables.ts`. Never print `.env` contents.

## Styling

Tailwind v4 utility classes only, dark theme on zinc palette (`bg-zinc-800`/`bg-zinc-900` cards, `text-zinc-300` muted). No CSS modules; the only standalone CSS is `globals.css` and `Icon/icon.css`. Match existing spacing/rounding idioms (`rounded p-4 m-2`).
