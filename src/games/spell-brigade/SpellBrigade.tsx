"use client";

import { useLogin } from "@/hooks/LoginContext";
import useAchievements from "@/hooks/useAchievements";
import Info from "@/components/Info";
import HeroAchievements from "./HeroAchivements";
import SpellBrigadeAchievementList from "./SpellBrigadeAchievementList";

const getHeroName = (description?: string) => {
  if (!description || !description.startsWith("As ")) return null;

  const baseName = description.substring(
    description.indexOf("As ") + 3,
    description.indexOf(",")
  );

  return baseName
    .substring(baseName.startsWith("the") ? baseName.indexOf("the ") + 4 : 0)
    .trim();
};

const SpellBrigade = () => {
  const { steamId, isLoggedInWithXbox, isLoggedIn } = useLogin();
  const { achievements } = useAchievements(steamId, "2904000");

  const heroes = achievements
    .map((a) => ({ hero: getHeroName(a.description), ...a }))
    .filter((a) => a.hero != null)
    .reduce(
      (acc, a) => ({
        ...acc,
        [a.hero!]: [...(acc[a.hero!] || []), a],
      }),
      {} as Record<string, typeof achievements>
    );

  const sortedAchievements = achievements.sort((a, b) => {
    const aUnlocked = a.unlockedTimestamp != null ? 1 : 0;
    const bUnlocked = b.unlockedTimestamp != null ? 1 : 0;
    if (aUnlocked !== bUnlocked) return aUnlocked - bUnlocked;
    return a.name.localeCompare(b.name);
  });

  if (!isLoggedIn || isLoggedInWithXbox) {
    return (
      <Info icon="alert-circle">
        You must be logged in with Steam to track <em>The Spell Brigade</em>{" "}
        achievements.
      </Info>
    );
  }

  return (
    <div>
      <div className="grid md:grid-cols-2">
        {Object.keys(heroes).map((hero) => (
          <HeroAchievements
            key={hero}
            hero={hero}
            achievements={heroes[hero]}
          />
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <SpellBrigadeAchievementList achievements={sortedAchievements} />
      </div>
    </div>
  );
};

export default SpellBrigade;
