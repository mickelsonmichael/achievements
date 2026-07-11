---
name: collectible-data
description: Edit or add Halo collectible data (achievements, skulls, terminals, data pads) in public/data JSON files without breaking name-based unlock matching.
---

# Editing collectible data

## Which files are live

Only the **root** files in `public/data/` are read by the app (imported via the `@data/*` alias):

- `achievements.json` — MCC achievements
- `skulls.json`, `terminals.json`, `datapads.json` — collectibles

The `public/data/<game>/` subfolders are legacy pre-merge sources; editing them does nothing. (`scripts/combine.py` was the one-time merge script.)

## Schemas

`game` must be one of the `Game` enum display strings in `src/models/Game.ts`: `"General"`, `"Halo 1"`, `"Halo 2"`, `"Halo 3"`, `"Halo 4"`, `"Halo: ODST"`, `"Halo: Reach"`. Adding a new game value requires updating that enum too.

- **Achievement** (`src/models/Achievement.ts`): `{ name, score, description, collection, game, url }` — `collection` is the achievement category shown in filters; `url` is a Halopedia link.
- **Skull** (`src/models/Skull.ts`): `{ name, level, difficulty ("Legendary"|"Heroic"|"Normal"|"Easy"|"Any"), location, video, game }`.
- **Terminal** (`src/models/Terminal.ts`): `{ id, level, location, video, game, achievement }` — `achievement` is the exact name of the unlocking achievement.
- **DataPad** (`src/models/DataPad.ts`): same as Terminal plus `isLegendary`.

`video` fields are **YouTube video IDs**, not full URLs.

## The name-matching invariant (do not break)

Unlock detection joins static data to the user's live achievements **by name string**:

- MCC achievements: case-insensitive `name` equality (`AchievementsContext.tsx`).
- Skulls: the achievement name is *derived* as `"Skulltaker {game}: {skullName}"`, where `Game.Halo1` is first rewritten to `"Halo: CE"` (`SkullsContext.tsx`) — so a skull's `name` must match the achievement suffix exactly.
- Terminals and data pads carry the unlocking achievement's exact name in their `achievement` field.

So `name` values must match what the Steam/Xbox APIs return, including punctuation and Unicode (some names use `…` not `...`). Renaming an entry silently breaks its unlock detection — nothing errors. If you must normalize a name, verify against a real API response first.

## Adding Halopedia URLs

`scripts/get_wiki_links.py` (plain Python 3, stdlib only) probes `halopedia.org` for each achievement missing a `url` and writes them back — but only if *every* lookup succeeds. Names that don't slugify cleanly go in its `manual_replacements` dict.

## Verify

`npm run build` catches JSON syntax and (via `resolveJsonModule`) shape errors against the model types where the JSON is imported with a cast. Then load the affected page in dev — with the "locked only" toggle default-on, a broken name shows up as an item that never disappears for a user who has it.
