"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { useLogin } from "@/hooks/LoginContext";
import useAchievements from "@/hooks/useAchievements";
import useToggle from "@/hooks/useToggle";
import type UserAchievement from "@/models/UserAchievement";
import CategoryData from "./achievements.json";
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
  policy: PlaythroughPick | null;
  policyCompleted: boolean;
  victory: PlaythroughPick | null;
  victoryCompleted: boolean;
  scenario: PlaythroughPick | null;
  bonusObjectives: PlaythroughBonusPick[];
}

// Categories with their own dedicated slot above — everything else (map,
// difficulty, wonder, religion, espionage, diplomacy, trade, gameplay) is
// fair game for a bonus objective.
const BONUS_OBJECTIVE_EXCLUDED_CATEGORIES = new Set([
  "leader",
  "civ-unique",
  "policy",
  "victory",
  "scenario",
]);
const BONUS_OBJECTIVE_COUNT = 3;

function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

function pickRandomN<T>(items: T[], count: number): T[] {
  const pool = [...items];
  const picks: T[] = [];
  while (pool.length > 0 && picks.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(index, 1)[0]);
  }
  return picks;
}

// Builds a random Civilization V playthrough goal: a civilization, a policy
// focus, and a victory type are always suggested (falling back to a fully
// random pick, flagged as "completed", once every achievement in that
// category is already unlocked), while a scenario is only suggested "if any"
// scenario achievement is still locked.
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
  const civilization: PlaythroughCivilizationPick | null = chosenCivName
    ? {
        name: chosenCivName,
        completed: civilizationCompleted,
        achievements: lockedCivAchievements
          .filter((a) => a.civilization === chosenCivName)
          .map((a) => ({
            name: a.name,
            description: a.description,
            wikiUrl: a.wikiUrl,
            category: a.category!,
          })),
      }
    : null;

  const lockedPolicy = locked.filter((a) => a.category === "policy");
  const policyCompleted = lockedPolicy.length === 0;
  const policyPool = policyCompleted
    ? joined.filter((a) => a.category === "policy")
    : lockedPolicy;
  const policyPick = pickRandom(policyPool);
  const policy: PlaythroughPick | null = policyPick
    ? {
        name: policyPick.name,
        description: policyPick.description,
        wikiUrl: policyPick.wikiUrl,
      }
    : null;

  // Victory/scenario achievements tied to a civilization other than the one
  // just chosen are never eligible — only civ-agnostic ones and ones for
  // this specific civilization are.
  const isForChosenCiv = (a: JoinedAchievement) =>
    !a.civilization || a.civilization === chosenCivName;

  const lockedVictory = locked.filter(
    (a) => a.category === "victory" && isForChosenCiv(a)
  );
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

  // Bonus objectives are civilization-agnostic flavor goals — anything tied
  // to the chosen civilization is already listed in full under its own slot
  // above, and anything tied to a *different* civilization is never eligible
  // here.
  const genericBonusPool = locked.filter(
    (a) =>
      !a.civilization &&
      a.category &&
      !BONUS_OBJECTIVE_EXCLUDED_CATEGORIES.has(a.category)
  );
  const bonusObjectives: PlaythroughBonusPick[] = pickRandomN(
    genericBonusPool,
    BONUS_OBJECTIVE_COUNT
  ).map((a) => ({
    name: a.name,
    description: a.description,
    wikiUrl: a.wikiUrl,
    category: a.category!,
  }));

  return {
    civilization,
    policy,
    policyCompleted,
    victory,
    victoryCompleted,
    scenario,
    bonusObjectives,
  };
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

const CivilizationDropdown = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="bg-zinc-800 border-1 border-amber-800/30 rounded flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer min-w-40"
      >
        {value ? (
          <span className={CIV_ICON_WRAP_CLASS}>
            <Image src={civIconSrc(value)} alt={value} width={20} height={20} />
          </span>
        ) : (
          <Icon name="globe" size={1} className="text-zinc-400 shrink-0" />
        )}
        <span className="mr-auto truncate">{value || "All Civilizations"}</span>
        <Icon
          name="chevron-down"
          size={1}
          className={`text-zinc-400 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul className="absolute z-10 mt-1 max-h-72 w-56 overflow-y-auto rounded border-1 border-amber-800/40 bg-zinc-900 py-1">
          <li>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-zinc-800 ${
                value === "" ? "text-amber-400" : ""
              }`}
            >
              <Icon name="globe" size={1} className="shrink-0" />
              All Civilizations
            </button>
          </li>
          {CIVILIZATIONS.map((c) => (
            <li key={c}>
              <button
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className={`w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-zinc-800 ${
                  value === c ? "text-amber-400" : ""
                }`}
              >
                <span className={CIV_ICON_WRAP_CLASS}>
                  <Image src={civIconSrc(c)} alt="" width={20} height={20} />
                </span>
                {c}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const DlcDropdown = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="bg-zinc-800 border-1 border-amber-800/30 rounded flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer min-w-40"
      >
        <Icon name="package" size={1} className="text-zinc-400 shrink-0" />
        <span className="mr-auto truncate">{value || "All DLC"}</span>
        <Icon
          name="chevron-down"
          size={1}
          className={`text-zinc-400 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul className="absolute z-10 mt-1 max-h-72 w-56 overflow-y-auto rounded border-1 border-amber-800/40 bg-zinc-900 py-1">
          <li>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-zinc-800 ${
                value === "" ? "text-amber-400" : ""
              }`}
            >
              <Icon name="package" size={1} className="shrink-0" />
              All DLC
            </button>
          </li>
          {DLC_PACKS.map((d) => (
            <li key={d}>
              <button
                type="button"
                onClick={() => {
                  onChange(d);
                  setOpen(false);
                }}
                className={`w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-zinc-800 ${
                  value === d ? "text-amber-400" : ""
                }`}
              >
                {d}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

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
  children,
}: {
  label: string;
  icon: IconName;
  colorClass: string;
  children: React.ReactNode;
}) => (
  <div className="rounded p-3 flex flex-col gap-1.5 border-1 bg-zinc-900 border-amber-700/40 min-w-0">
    <div
      className={`flex items-center gap-1.5 text-xs uppercase tracking-wide font-semibold ${colorClass}`}
    >
      <Icon name={icon} style={{ width: 12, height: 12 }} />
      {label}
    </div>
    {children}
  </div>
);

const PlaythroughCard = ({ suggestion }: { suggestion: Playthrough }) => (
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
      label="Policy Focus"
      icon={CATEGORY_ICON.get("policy")!}
      colorClass={CATEGORY_COLOR.get("policy")!}
    >
      {suggestion.policy ? (
        <>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{suggestion.policy.name}</span>
            {suggestion.policy.wikiUrl && (
              <WikiLink url={suggestion.policy.wikiUrl} />
            )}
          </div>
          {suggestion.policy.description && (
            <p className="text-xs text-zinc-400 line-clamp-3">
              {suggestion.policy.description}
            </p>
          )}
          {suggestion.policyCompleted && (
            <p className="text-xs text-zinc-500 italic">
              Already unlocked — picked at random.
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-zinc-500 italic">No policy data found.</p>
      )}
    </PlaythroughSlot>

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

    {suggestion.bonusObjectives.length > 0 && (
      <PlaythroughSlot label="Bonus Objectives" icon="gift" colorClass="text-zinc-300">
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

      <div className="m-2 flex items-center gap-2">
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

      <Modal
        isOpen={isPlaythroughModalOpen}
        onToggle={closePlaythroughModal}
        title="Playthrough Suggestion"
      >
        {playthrough && (
          <div className="flex flex-col gap-2">
            <PlaythroughCard suggestion={playthrough} />
            <button
              type="button"
              onClick={() =>
                setPlaythrough(generatePlaythrough(joinedAchievements))
              }
              className="self-start bg-zinc-800 border-1 border-amber-800/30 hover:border-amber-600/70 rounded flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer"
            >
              <Icon name="shuffle" size={1} className="text-amber-500" />
              Reroll
            </button>
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
        <CivilizationDropdown value={civilization} onChange={setCivilization} />
        <DlcDropdown value={dlc} onChange={setDlc} />
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
