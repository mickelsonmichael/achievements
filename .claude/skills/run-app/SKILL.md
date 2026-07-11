---
name: run-app
description: Launch the Halo Collectibles site locally and verify a change end-to-end, including how to get into a logged-in state without a real Steam browser login.
---

# Running and verifying the app

## Launch

```
npm run dev
```

Serves on http://localhost:3000. `/` permanently redirects to `/achievements` (the game grid). If the port is taken, Next picks the next free one — read the actual URL from the startup output.

A production-fidelity check is `npm run build` (this is exactly what CI runs) followed by `npm run start`.

## Prerequisites

- `.env` at the repo root must define `STEAM_API_KEY` for any logged-in behavior; `PUBLIC_URL` defaults to `http://localhost:3000` so it can be omitted locally. `XBL_API_KEY` is only needed for Xbox login. Never print `.env` contents.
- If `node_modules` is missing: `npm ci`.

## Key routes to exercise

| Route | What it shows |
|---|---|
| `/achievements` | Game grid (landing page) |
| `/games/halo-mcc` | MCC achievements table with game/collection filters |
| `/games/halo-mcc/skulls`, `/terminals`, `/data-pads` | Collectible tables |
| `/games/spell-brigade`, `/games/battlefield-6` | Steam-only card grids |
| `/error?message=...` | Error page used by auth redirects |

## Getting logged in without a browser OpenID flow

The app is cookie-based, so you have two non-interactive options:

1. **Manual SteamID endpoint** — `POST /api/auth` with form field `steamId=<64-bit SteamID>`. It validates the ID against the Steam API (profile must be public) and sets the `STEAM_USER_ID` cookie on the redirect response.
2. **Set the cookie directly** — in the browser devtools console or via an HTTP client, set cookie `STEAM_USER_ID=<steamId>`. `LoginContext` reads it on mount; no server session exists.

Logged-out state is also meaningful to verify: MCC pages show full unfiltered data, and Spell Brigade / Battlefield 6 show the "log in with Steam" `<Info>` banner (also shown when logged in with Xbox).

## What "verified" means here

There are no automated tests. A change is verified when:

1. `npm run lint` passes.
2. `npm run build` passes (the only CI gate).
3. The affected route renders in dev mode without console errors, in both logged-out and (when relevant) logged-in states.
