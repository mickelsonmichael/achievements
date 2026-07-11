---
name: add-game
description: Add a new tracked game to the site (route page, feature component, game grid tile, Steam app ID wiring). Use when asked to add support for a new game's achievements.
---

# Adding a new game

Reference implementations: `src/games/battlefield-6/` (simplest, most recent) and `src/games/spell-brigade/` (grouping example). Follow Battlefield 6 unless the game needs something fancier.

## Steps

1. **Find the Steam app ID** — from the store URL `store.steampowered.com/app/<APP_ID>/`. Existing IDs: Halo MCC `976730`, Spell Brigade `2904000`, Battlefield 6 `2807960`.

2. **Feature component** — `src/games/<kebab-slug>/<PascalName>.tsx`, `"use client"`. Skeleton:

   ```tsx
   "use client";
   import { useLogin } from "@/hooks/LoginContext";
   import useAchievements from "@/hooks/useAchievements";
   import Info from "@/components/Info";

   const GameName = () => {
     const { steamId, isLoggedIn, isLoggedInWithXbox } = useLogin();
     const { achievements } = useAchievements(steamId, "<APP_ID>");

     if (!isLoggedIn || isLoggedInWithXbox) {
       return (
         <Info icon="alert-circle">
           You must be logged in with Steam to track <em>Game Name</em> achievements.
         </Info>
       );
     }
     // card grid: ul.grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4,
     // li with bg-zinc-800 (locked) / bg-zinc-900 (unlocked), Icon "lock"/"check"
   };
   export default GameName;
   ```

   The Xbox guard is required — Xbox auth only works for Halo MCC. Get the guard's game name right (Battlefield 6 shipped with a copy-pasted "The Spell Brigade" message; don't repeat that).

3. **Route page** — `src/app/games/<kebab-slug>/page.tsx`, a thin server component:

   ```tsx
   import { Metadata } from "next";
   import GameName from "@/games/<kebab-slug>/<PascalName>";

   export const metadata: Metadata = { title: "Game Name" };
   const Page = () => <GameName />;
   export default Page;
   ```

   `metadata` belongs here, never in the `"use client"` feature file.

4. **Cover image** — `public/img/<kebab-slug>/<kebab-slug>.jpg` (or `.png`). Square-ish; it renders at up to 300×300.

5. **Game grid tile** — add an entry to the `games` array in `src/components/GameGrid.tsx` (`src`, `alt`, `href: "/games/<kebab-slug>"`).

6. **Optional: extra achievement metadata** — if Steam hides descriptions or you want secret/category badges, add `src/games/<kebab-slug>/extra-achievement-data.json` (array of `{ name, secret?, description?, category? }`) and merge it by achievement `name` like `Battlefield6.tsx` does. Names must match the Steam API's returned names exactly.

7. **Verify** — `npm run lint && npm run build`, then load `/games/<kebab-slug>` logged out (Info banner) and logged in (cards render). See the `run-app` skill for the login shortcut.

8. **Commit** as `feat: Add <Game Name>` (matches history).
