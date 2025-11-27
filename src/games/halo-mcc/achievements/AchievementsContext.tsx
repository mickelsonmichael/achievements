"use client";

import Achievements from "@data/achievements.json";
import type Achievement from "@/models/Achievement";
import {
  useState,
  useContext,
  createContext,
  ReactNode,
  useEffect,
} from "react";
import Game from "@/models/Game";
import type UserAchievement from "@/models/UserAchievement";
import { useLogin } from "@/hooks/LoginContext";
import AchievementWithProgress from "@/models/AchievementWithProgress";

interface CollectionState {
  name: string;
  enabled: boolean;
}

interface FiltersState {
  collections: CollectionState[];
  games: Game[];
  lockedOnly: boolean;
}

type AchievementsContextState = FiltersState & {
  unfilteredAchievements: Achievement[];
  achievements: AchievementWithProgress[];
  search: string;
  userAchievements: UserAchievement[];
  lockedOnly: boolean;
  setSearch: (search: string) => unknown;
  toggleGame: (game: Game) => unknown;
  enableAllGames: () => unknown;
  disableAllGames: () => unknown;
  focusGame: (game: Game) => unknown;
  toggleCollection: (collection: string) => unknown;
  enableAllCollections: () => unknown;
  disableAllCollections: () => unknown;
  focusCollection: (collection: string) => unknown;
  toggleLockedOnly: () => unknown;
};

const AchievementsContext = createContext<AchievementsContextState>({
  achievements: Achievements as AchievementWithProgress[],
  unfilteredAchievements: Achievements as Achievement[],
  userAchievements: [],
  collections: [],
  games: Object.values(Game),
  search: "",
  lockedOnly: true,
  setSearch: console.debug,
  toggleGame: console.debug,
  enableAllGames: console.debug,
  disableAllGames: console.debug,
  focusGame: console.debug,
  toggleCollection: console.debug,
  enableAllCollections: console.debug,
  disableAllCollections: console.debug,
  focusCollection: console.debug,
  toggleLockedOnly: console.debug,
});

const getUniqueCollections = (
  achievements: Achievement[],
  defaultEnabled = true
): CollectionState[] =>
  [...new Set(achievements.map((g) => g.collection))].map((c) => ({
    name: c,
    enabled: defaultEnabled,
  }));

const AchievementsProvider = ({ children }: { children: ReactNode }) => {
  const { achievements: userAchievements } = useLogin();
  const allAchievements = Achievements as Achievement[];

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    games: Object.values(Game),
    collections: [] as CollectionState[],
    lockedOnly: true,
  });

  useEffect(() => {
    const cachedValue = localStorage.getItem("ACHIEVEMENT_FILTERS");

    if (cachedValue) {
      setFilters(JSON.parse(cachedValue));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ACHIEVEMENT_FILTERS", JSON.stringify(filters));
  }, [filters]);

  const toggleLockedOnly = () =>
    setFilters((f) => ({ ...f, lockedOnly: !f.lockedOnly }));

  const toggleGame = (game: Game) =>
    setFilters(({ games: g, ...s }) => {
      const updatedGames = g.includes(game)
        ? g.filter((x) => x !== game)
        : [...g, game];

      const updatedCollections =
        updatedGames.length !== 1
          ? []
          : [
              ...new Set(
                Achievements.filter((g) => g.game === updatedGames[0]).map(
                  (g) => g.collection
                )
              ),
            ].map((c) => ({ name: c, enabled: true }));

      return { ...s, games: updatedGames, collections: updatedCollections };
    });

  const enableAllGames = () =>
    setFilters((f) => ({ ...f, games: Object.values(Game), collections: [] }));

  const disableAllGames = () =>
    setFilters((f) => ({ ...f, games: [], collections: [] }));

  const focusGame = (game: Game) =>
    setFilters((f) => ({
      ...f,
      games: [game],
      collections: getUniqueCollections(
        allAchievements.filter((g) => g.game === game)
      ),
    }));

  const toggleCollection = (collection: string) =>
    filters.collections.length > 0
      ? setFilters(({ collections: c, ...f }) => ({
          ...f,
          collections: c.map((x) =>
            x.name === collection ? { ...x, enabled: !x.enabled } : x
          ),
        }))
      : null;

  const enableAllCollections = () =>
    setFilters(({ collections, ...f }) => ({
      ...f,
      collections: collections.map((c) => ({ ...c, enabled: true })),
    }));

  const disableAllCollections = () =>
    setFilters(({ collections, ...f }) => ({
      ...f,
      collections: collections.map((c) => ({ ...c, enabled: false })),
    }));

  const focusCollection = (collection: string) =>
    setFilters(({ collections, ...f }) => ({
      ...f,
      collections: collections.map((c) => ({
        ...c,
        enabled: c.name === collection,
      })),
    }));

  const filteredAchievements = (Achievements as Achievement[])
    .filter((a) => filters.games.includes(a.game)) // Remove games not included
    .filter((a) =>
      filters.collections.length > 0
        ? filters.collections.find((c) => c.name === a.collection)?.enabled
        : true
    ) // Remove collections not included
    .filter(
      (a) =>
        !filters.lockedOnly ||
        userAchievements.find(
          (b) => b.name.toLowerCase() === a.name.toLowerCase()
        )?.unlockedTimestamp == null
    ) // Remove unlocked achievements
    .filter((a) =>
      JSON.stringify(a).toLowerCase().includes(search.toLowerCase())
    ) // Filter by search string
    .map((a) => ({
      ...a,
      progress:
        userAchievements.find(
          (b) => b.name.toLowerCase() === a.name.toLowerCase()
        )?.progress ?? null,
    }));

  const value = {
    ...filters,
    achievements: filteredAchievements,
    unfilteredAchievements: allAchievements,
    search,
    userAchievements,
    setSearch,
    toggleGame,
    enableAllGames,
    disableAllGames,
    focusGame,
    toggleCollection,
    enableAllCollections,
    disableAllCollections,
    focusCollection,
    toggleLockedOnly,
  };

  return (
    <AchievementsContext.Provider value={value}>
      {children}
    </AchievementsContext.Provider>
  );
};

const useAchievements = () => useContext(AchievementsContext);

export { AchievementsProvider, useAchievements };
