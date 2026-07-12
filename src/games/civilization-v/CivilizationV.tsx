"use client";

import { useState } from "react";
import Image from "next/image";

import { useLogin } from "@/hooks/LoginContext";
import useAchievements from "@/hooks/useAchievements";
import useToggle from "@/hooks/useToggle";
import type UserAchievement from "@/models/UserAchievement";
import CategoryData from "./achievements.json";
import FilterDropdown from "./FilterDropdown";
import Icon from "@/components/Icon";
import Info from "@/components/Info";
import Modal from "@/components/Modal";
import type IconName from "@/components/Icon/IconName";

const CATEGORY_LABEL = new Map<string, string>([
  ["leader", "Leader"],
  ["difficulty", "Difficulty"],
  ["map", "Map"],
  ["victory", "Victory"],
  ["policy", "Policy"],
  ["wonder", "Wonder"],
  ["religion", "Religion"],
  ["espionage", "Espionage"],
  ["diplomacy", "Diplomacy"],
  ["trade", "Trade"],
  ["civ-unique", "Civ Unique"],
  ["scenario", "Scenario"],
  ["gameplay", "General"],
]);

const CATEGORY_ICON = new Map<string, IconName>([
  ["leader", "award"],
  ["difficulty", "shield"],
  ["map", "map"],
  ["victory", "star"],
  ["policy", "book"],
  ["wonder", "hexagon"],
  ["religion", "sun"],
  ["espionage", "eye"],
  ["diplomacy", "flag"],
  ["trade", "globe"],
  ["civ-unique", "users"],
  ["scenario", "compass"],
  ["gameplay", "zap"],
]);

const CATEGORY_COLOR = new Map<string, string>([
  ["leader", "text-yellow-500"],
  ["difficulty", "text-red-500"],
  ["map", "text-emerald-500"],
  ["victory", "text-amber-400"],
  ["policy", "text-indigo-400"],
  ["wonder", "text-sky-400"],
  ["religion", "text-pink-400"],
  ["espionage", "text-slate-400"],
  ["diplomacy", "text-teal-400"],
  ["trade", "text-orange-400"],
  ["civ-unique", "text-lime-400"],
  ["scenario", "text-purple-400"],
  ["gameplay", "text-cyan-400"],
]);

const CATEGORY_ORDER = [...CATEGORY_LABEL.keys()];

const CIVILIZATIONS = [
  ...new Set(
    CategoryData.map((d) => d.civilization).filter((c): c is string => !!c)
  ),
].sort();

const DLC_PACKS = [
  ...new Set(
    CategoryData.map((d) => d.dlc).filter((d): d is string => !!d)
  ),
].sort();

type JoinedAchievement = UserAchievement & {
  category?: string;
  civilization?: string;
  dlc?: string;
  wikiUrl?: string;
};

interface PlaythroughPick {
  name: string;
  description?: string;
  wikiUrl?: string;
}

interface PlaythroughBonusPick extends PlaythroughPick {
  category: string;
}

interface PlaythroughCivilizationPick {
  name: string;
  achievements: PlaythroughBonusPick[];
  completed: boolean;
}

interface Playthrough {
  civilization: PlaythroughCivilizationPick | null;
  victory: PlaythroughPick | null;
  victoryCompleted: boolean;
  scenario: PlaythroughPick | null;
  map: PlaythroughPick | null;
  bonusObjectives: PlaythroughBonusPick[];
  bonusObjectivesCompleted: boolean;
}

// The pool "bonus objectives" are drawn from. Policy no longer gets its own
// dedicated slot — it's just one more category in the shared pool. Map,
// victory and scenario get their own slots above, and leader/civ-unique are
// always civilization-specific, so none of those belong here.
const BONUS_OBJECTIVE_CATEGORIES = new Set([
  "policy",
  "wonder",
  "religion",
  "espionage",
  "diplomacy",
  "trade",
]);
const BONUS_OBJECTIVE_COUNT = 2;

function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

// Picking two achievements from the same category is the easiest way for
// "bonus objectives" to end up nudging a playthrough in two directions at
// once (e.g. two Trade goals competing for the same caravan routes).
// Spreading picks across distinct categories whenever the pool allows it is
// a cheap, data-agnostic way to keep the pair from working against itself.
function pickDiverseN<T extends { category?: string }>(
  items: T[],
  count: number
): T[] {
  const pool = [...items];
  const picks: T[] = [];
  while (pool.length > 0 && picks.length < count) {
    const usedCategories = new Set(picks.map((p) => p.category));
    const candidates = pool.filter((p) => !usedCategories.has(p.category));
    const source = candidates.length > 0 ? candidates : pool;
    const chosen = source[Math.floor(Math.random() * source.length)];
    picks.push(chosen);
    pool.splice(pool.indexOf(chosen), 1);
  }
  return picks;
}

// Bonus objectives are always civilization-agnostic — anything tied to a
// civilization already lives under that civilization's own slot, so pulling
// it in here too would just duplicate an objective under two names. `exclude`
// additionally keeps a reroll from handing back the exact same pair.
function pickBonusObjectives(
  joined: JoinedAchievement[],
  exclude: Set<string> = new Set()
): { picks: PlaythroughBonusPick[]; completed: boolean } {
  const eligible = (a: JoinedAchievement) =>
    !!a.category &&
    BONUS_OBJECTIVE_CATEGORIES.has(a.category) &&
    !a.civilization &&
    !exclude.has(a.name);

  const lockedPool = joined.filter(
    (a) => a.unlockedTimestamp == null && eligible(a)
  );
  const completed = lockedPool.length === 0;
  const pool = completed ? joined.filter(eligible) : lockedPool;

  return {
    completed,
    picks: pickDiverseN(pool, BONUS_OBJECTIVE_COUNT).map((a) => ({
      name: a.name,
      description: a.description,
      wikiUrl: a.wikiUrl,
      category: a.category!,
    })),
  };
}

// Builds a random Civilization V playthrough goal. A civilization is chosen
// first, then its victory condition — preferring an achievement tied to that
// civilization and only falling back to the shared pool once the civ has
// nothing left to offer, and never reaching into another civilization's
// achievements. Map and scenario are only suggested while something in that
// category is still locked; bonus objectives are always civ-agnostic and
// picked last so they never re-list something already promised above.
const generatePlaythrough = (joined: JoinedAchievement[]): Playthrough => {
  const locked = joined.filter((a) => a.unlockedTimestamp == null);

  // Every category can carry a civilization tag now (leader, civ-unique,
  // wonder, trade, religion, diplomacy, espionage, scenario), so "does this
  // civ still have something to chase" considers all of them, not just the
  // leader/civ-unique achievements.
  const lockedCivAchievements = locked.filter((a) => a.civilization);
  const openCivilizations = [
    ...new Set(lockedCivAchievements.map((a) => a.civilization!)),
  ];
  const civilizationCompleted = openCivilizations.length === 0;
  const chosenCivName = pickRandom(
    civilizationCompleted ? CIVILIZATIONS : openCivilizations
  );

  const isForChosenCiv = (a: JoinedAchievement) =>
    !a.civilization || a.civilization === chosenCivName;

  // Victory: civ-specific achievements go first, the shared/civ-agnostic
  // pool is the fallback, and anything tied to a different civilization is
  // never a candidate at either step.
  const lockedVictoryForCiv = locked.filter(
    (a) => a.category === "victory" && a.civilization === chosenCivName
  );
  const lockedVictoryShared = locked.filter(
    (a) => a.category === "victory" && !a.civilization
  );
  const lockedVictory =
    lockedVictoryForCiv.length > 0 ? lockedVictoryForCiv : lockedVictoryShared;
  const victoryCompleted = lockedVictory.length === 0;
  const victoryPool = victoryCompleted
    ? joined.filter((a) => a.category === "victory" && isForChosenCiv(a))
    : lockedVictory;
  const victoryPick = pickRandom(victoryPool);
  const victory: PlaythroughPick | null = victoryPick
    ? {
        name: victoryPick.name,
        description: victoryPick.description,
        wikiUrl: victoryPick.wikiUrl,
      }
    : null;

  const lockedScenario = locked.filter(
    (a) => a.category === "scenario" && isForChosenCiv(a)
  );
  const scenarioPick = pickRandom(lockedScenario);
  const scenario: PlaythroughPick | null = scenarioPick
    ? {
        name: scenarioPick.name,
        description: scenarioPick.description,
        wikiUrl: scenarioPick.wikiUrl,
      }
    : null;

  // Map achievements carry no civilization tag at all — only suggest one
  // while at least one is still locked, otherwise leave the slot off the
  // card entirely rather than pad it with an already-unlocked achievement.
  const lockedMap = locked.filter((a) => a.category === "map");
  const mapPick = pickRandom(lockedMap);
  const map: PlaythroughPick | null = mapPick
    ? {
        name: mapPick.name,
        description: mapPick.description,
        wikiUrl: mapPick.wikiUrl,
      }
    : null;

  // A civ-specific victory or scenario achievement is drawn from the same
  // pool that feeds the civilization card below it — drop it there so it
  // isn't listed twice under two different headings.
  const usedNames = new Set(
    [victoryPick?.name, scenarioPick?.name].filter(
      (n): n is string => n != null
    )
  );
  const civilization: PlaythroughCivilizationPick | null = chosenCivName
    ? {
        name: chosenCivName,
        completed: civilizationCompleted,
        achievements: lockedCivAchievements
          .filter(
            (a) => a.civilization === chosenCivName && !usedNames.has(a.name)
          )
          .map((a) => ({
            name: a.name,
            description: a.description,
            wikiUrl: a.wikiUrl,
            category: a.category!,
          })),
      }
    : null;

  const { picks: bonusObjectives, completed: bonusObjectivesCompleted } =
    pickBonusObjectives(joined);

  return {
    civilization,
    victory,
    victoryCompleted,
    scenario,
    map,
    bonusObjectives,
    bonusObjectivesCompleted,
  };
};

// Regenerates only the bonus objectives, leaving the civilization, victory,
// scenario and map choices untouched. Excluding the current pair biases the
// reroll toward a genuinely different pair instead of just shuffling in
// place.
const rerollBonusObjectives = (
  current: Playthrough,
  joined: JoinedAchievement[]
): Playthrough => {
  const exclude = new Set(current.bonusObjectives.map((b) => b.name));
  const { picks, completed } = pickBonusObjectives(joined, exclude);
  return { ...current, bonusObjectives: picks, bonusObjectivesCompleted: completed };
};

// In-game civilization emblems, sourced from the Civ Fandom wiki
// (https://civilization.fandom.com/wiki/Civilizations_(Civ5)).
const civIconSrc = (name: string) =>
  `/img/civilization-v/civs/${name.toLowerCase().replace(/\s+/g, "-")}.png`;

// Small badge shared by category and civilization tags, both fixed to the
// same height so they line up evenly wherever they appear together.
const BADGE_CLASS =
  "inline-flex items-center gap-1 h-5 px-1.5 rounded-sm border-1 border-zinc-700 bg-zinc-800 text-[10px] uppercase tracking-wide font-medium shrink-0";
const CIV_ICON_WRAP_CLASS =
  "shrink-0 h-5 w-5 flex items-center justify-center rounded-full border-1 border-zinc-700 bg-zinc-800 overflow-hidden";

const WikiLink = ({ url }: { url: string }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    title="View achievement guide"
    className="text-zinc-500 hover:text-amber-400 shrink-0"
  >
    <Icon name="external-link" style={{ width: 12, height: 12 }} />
  </a>
);

const PlaythroughSlot = ({
  label,
  icon,
  colorClass,
  action,
  children,
}: {
  label: string;
  icon: IconName;
  colorClass: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="rounded p-3 flex flex-col gap-1.5 border-1 bg-zinc-900 border-amber-700/40 min-w-0">
    <div className="flex items-center gap-1.5">
      <div
        className={`flex items-center gap-1.5 text-xs uppercase tracking-wide font-semibold ${colorClass}`}
      >
        <Icon name={icon} style={{ width: 12, height: 12 }} />
        {label}
      </div>
      {action && <div className="ml-auto">{action}</div>}
    </div>
    {children}
  </div>
);

const PlaythroughCard = ({
  suggestion,
  onRerollBonusObjectives,
}: {
  suggestion: Playthrough;
  onRerollBonusObjectives: () => void;
}) => (
  <div className="flex flex-col gap-1.5">
    {suggestion.civilization && (
      <PlaythroughSlot
        label="Civilization"
        icon="users"
        colorClass={CATEGORY_COLOR.get("civ-unique")!}
      >
        <div className="flex items-center gap-2">
          <span className={CIV_ICON_WRAP_CLASS}>
            <Image
              src={civIconSrc(suggestion.civilization.name)}
              alt={suggestion.civilization.name}
              width={20}
              height={20}
            />
          </span>
          <span className="text-sm">{suggestion.civilization.name}</span>
        </div>
        {suggestion.civilization.completed ? (
          <p className="text-xs text-zinc-500 italic">
            Every civilization achievement is already unlocked — picked at
            random.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {suggestion.civilization.achievements.map((a) => (
              <li key={a.name} className="flex items-start gap-2">
                <Icon
                  name={CATEGORY_ICON.get(a.category)!}
                  style={{ width: 12, height: 12, marginTop: 3 }}
                  className={`shrink-0 ${CATEGORY_COLOR.get(a.category)}`}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{a.name}</span>
                    {a.wikiUrl && <WikiLink url={a.wikiUrl} />}
                  </div>
                  {a.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {a.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </PlaythroughSlot>
    )}

    <PlaythroughSlot
      label="Victory Condition"
      icon={CATEGORY_ICON.get("victory")!}
      colorClass={CATEGORY_COLOR.get("victory")!}
    >
      {suggestion.victory ? (
        <>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{suggestion.victory.name}</span>
            {suggestion.victory.wikiUrl && (
              <WikiLink url={suggestion.victory.wikiUrl} />
            )}
          </div>
          {suggestion.victory.description && (
            <p className="text-xs text-zinc-400 line-clamp-3">
              {suggestion.victory.description}
            </p>
          )}
          {suggestion.victoryCompleted && (
            <p className="text-xs text-zinc-500 italic">
              Already unlocked — picked at random.
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-zinc-500 italic">No victory data found.</p>
      )}
    </PlaythroughSlot>

    {suggestion.scenario && (
      <PlaythroughSlot
        label="Scenario"
        icon={CATEGORY_ICON.get("scenario")!}
        colorClass={CATEGORY_COLOR.get("scenario")!}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{suggestion.scenario.name}</span>
          {suggestion.scenario.wikiUrl && (
            <WikiLink url={suggestion.scenario.wikiUrl} />
          )}
        </div>
        {suggestion.scenario.description && (
          <p className="text-xs text-zinc-400 line-clamp-3">
            {suggestion.scenario.description}
          </p>
        )}
      </PlaythroughSlot>
    )}

    {suggestion.map && (
      <PlaythroughSlot
        label="Map"
        icon={CATEGORY_ICON.get("map")!}
        colorClass={CATEGORY_COLOR.get("map")!}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{suggestion.map.name}</span>
          {suggestion.map.wikiUrl && <WikiLink url={suggestion.map.wikiUrl} />}
        </div>
        {suggestion.map.description && (
          <p className="text-xs text-zinc-400 line-clamp-3">
            {suggestion.map.description}
          </p>
        )}
      </PlaythroughSlot>
    )}

    {suggestion.bonusObjectives.length > 0 && (
      <PlaythroughSlot
        label="Bonus Objectives"
        icon="gift"
        colorClass="text-zinc-300"
        action={
          <button
            type="button"
            onClick={onRerollBonusObjectives}
            title="Reroll bonus objectives"
            className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-zinc-500 hover:text-amber-400 cursor-pointer"
          >
            <Icon name="shuffle" style={{ width: 11, height: 11 }} />
            Reroll
          </button>
        }
      >
        {suggestion.bonusObjectivesCompleted && (
          <p className="text-xs text-zinc-500 italic">
            Every eligible achievement is already unlocked — picked at
            random.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {suggestion.bonusObjectives.map((a) => (
            <li key={a.name} className="flex items-start gap-2">
              <Icon
                name={CATEGORY_ICON.get(a.category)!}
                style={{ width: 12, height: 12, marginTop: 3 }}
                className={`shrink-0 ${CATEGORY_COLOR.get(a.category)}`}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{a.name}</span>
                  {a.wikiUrl && <WikiLink url={a.wikiUrl} />}
                </div>
                {a.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {a.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </PlaythroughSlot>
    )}
  </div>
);

const CivilizationV = () => {
  const { steamId, isLoggedIn, isLoggedInWithXbox } = useLogin();
  const { achievements } = useAchievements(steamId, "8930");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [civilization, setCivilization] = useState("");
  const [dlc, setDlc] = useState("");
  const [playthrough, setPlaythrough] = useState<Playthrough | null>(null);
  const {
    isOn: isPlaythroughModalOpen,
    on: openPlaythroughModal,
    off: closePlaythroughModal,
  } = useToggle(false);

  if (!isLoggedIn || isLoggedInWithXbox) {
    return (
      <Info icon="alert-circle">
        You must be logged in with Steam to track <em>Civilization V</em>{" "}
        achievements.
      </Info>
    );
  }

  const joinedAchievements: JoinedAchievement[] = achievements.map((a) => {
    const details = CategoryData.find((c) => c.name === a.name);
    return {
      ...a,
      category: details?.category,
      civilization: details?.civilization,
      dlc: details?.dlc,
      wikiUrl: details?.wikiUrl,
    };
  });

  const searchAndCivFiltered = joinedAchievements
    .filter(
      (a) =>
        search === "" ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.description?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((a) => civilization === "" || a.civilization === civilization)
    .filter((a) => dlc === "" || a.dlc === dlc);

  const lockedCountByCategory = new Map<string, number>();
  let totalLockedCount = 0;
  for (const a of searchAndCivFiltered) {
    if (a.unlockedTimestamp != null) continue;
    totalLockedCount++;
    if (a.category) {
      lockedCountByCategory.set(
        a.category,
        (lockedCountByCategory.get(a.category) ?? 0) + 1
      );
    }
  }

  const modifiedAchievements = searchAndCivFiltered
    .filter((a) => category == null || a.category === category)
    .sort((a, b) => {
      const aUnlocked = a.unlockedTimestamp != null ? 1 : 0;
      const bUnlocked = b.unlockedTimestamp != null ? 1 : 0;
      if (aUnlocked !== bUnlocked) return aUnlocked - bUnlocked;
      return a.name.localeCompare(b.name) || 0;
    });

  return (
    <div>
      <div className="flex items-center gap-2 mx-2 mb-2 pb-2 border-b-1 border-amber-700/40">
        <span className="uppercase text-xs tracking-widest text-amber-500 font-semibold">
          Sid Meier&apos;s Civilization V
        </span>
        <span className="ml-auto text-sm text-zinc-400">
          {
            modifiedAchievements.filter((a) => a.unlockedTimestamp == null)
              .length
          }{" "}
          of {modifiedAchievements.length} achievement(s) remaining
        </span>
      </div>

      <Modal
        isOpen={isPlaythroughModalOpen}
        onToggle={closePlaythroughModal}
        title="Playthrough Suggestion"
      >
        {playthrough && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() =>
                setPlaythrough(generatePlaythrough(joinedAchievements))
              }
              className="self-end bg-zinc-800 border-1 border-amber-800/30 hover:border-amber-600/70 rounded flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer"
            >
              <Icon name="shuffle" size={1} className="text-amber-500" />
              Reroll
            </button>
            <PlaythroughCard
              suggestion={playthrough}
              onRerollBonusObjectives={() =>
                setPlaythrough((current) =>
                  current
                    ? rerollBonusObjectives(current, joinedAchievements)
                    : current
                )
              }
            />
          </div>
        )}
      </Modal>

      <div className="m-2 flex items-center gap-2">
        <div className="bg-zinc-800 border-1 border-amber-800/30 focus-within:border-amber-600/70 flex rounded items-center flex-grow-1">
          <Icon name="search" className="mx-2 text-zinc-400" />
          <input
            type="text"
            onChange={(e) => setSearch(e.target.value)}
            className="py-1.5 flex-grow-1 block focus:outline-0 text-sm"
            placeholder="Search"
          />
        </div>
        <FilterDropdown
          value={civilization}
          onChange={setCivilization}
          options={CIVILIZATIONS}
          placeholder="All Civilizations"
          icon="globe"
          renderOptionIcon={(name) => (
            <span className={CIV_ICON_WRAP_CLASS}>
              <Image src={civIconSrc(name)} alt="" width={20} height={20} />
            </span>
          )}
        />
        <FilterDropdown
          value={dlc}
          onChange={setDlc}
          options={DLC_PACKS}
          placeholder="All DLC"
          icon="package"
        />
        <button
          type="button"
          onClick={() => {
            setPlaythrough(generatePlaythrough(joinedAchievements));
            openPlaythroughModal();
          }}
          className="bg-zinc-800 border-1 border-amber-800/30 hover:border-amber-600/70 rounded flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer shrink-0"
        >
          <Icon name="shuffle" size={1} className="text-amber-500" />
          Generate Playthrough
        </button>
      </div>

      <div className="mx-2 mb-2 flex flex-wrap gap-1">
        <button
          onClick={() => setCategory(null)}
          className={`${BADGE_CLASS} cursor-pointer ${
            category == null ? "border-amber-500 text-amber-400" : ""
          }`}
        >
          All
          <span className="text-zinc-500">{totalLockedCount}</span>
        </button>
        {CATEGORY_ORDER.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`${BADGE_CLASS} cursor-pointer ${CATEGORY_COLOR.get(
              c
            )} ${category === c ? "border-current" : ""}`}
          >
            <Icon
              name={CATEGORY_ICON.get(c)!}
              style={{ width: 12, height: 12 }}
            />
            {CATEGORY_LABEL.get(c)}
            <span className="text-zinc-500">
              {lockedCountByCategory.get(c) ?? 0}
            </span>
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-1.5 mx-2">
        {modifiedAchievements.map((a) => {
          return (
            <li
              key={a.name}
              className={`rounded p-2 flex flex-col gap-1 border-1 ${
                a.unlockedTimestamp == null
                  ? "bg-zinc-800 border-zinc-700/60"
                  : "bg-zinc-900 border-amber-700/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon
                  name={a.unlockedTimestamp == null ? "lock" : "check"}
                  size={1.25}
                  className={`shrink-0 ${
                    a.unlockedTimestamp == null ? "" : "text-amber-500"
                  }`}
                />
                <span className="text-sm min-w-0">{a.name}</span>
                {a.wikiUrl && <WikiLink url={a.wikiUrl} />}
              </div>
              <div className="text-xs text-zinc-400 line-clamp-2">
                {a.description}
              </div>
              {(a.civilization || a.category || a.dlc) && (
                <div className="flex items-center gap-1 flex-wrap mt-auto pt-1">
                  {a.civilization && (
                    <span
                      className={CIV_ICON_WRAP_CLASS}
                      title={a.civilization}
                    >
                      <Image
                        src={civIconSrc(a.civilization)}
                        alt={a.civilization}
                        width={20}
                        height={20}
                      />
                    </span>
                  )}
                  {a.category && (
                    <span className={`${BADGE_CLASS} ${CATEGORY_COLOR.get(a.category)}`}>
                      <Icon
                        name={CATEGORY_ICON.get(a.category)!}
                        style={{ width: 12, height: 12 }}
                      />
                      {CATEGORY_LABEL.get(a.category)}
                    </span>
                  )}
                  {a.dlc && (
                    <span className={BADGE_CLASS}>
                      <Icon name="package" style={{ width: 12, height: 12 }} />
                      {a.dlc}
                    </span>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CivilizationV;
