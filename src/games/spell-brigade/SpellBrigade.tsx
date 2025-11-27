"use client";

import AchivementsLayout from "@/app/games/halo-mcc/layout";
import { useLogin } from "@/hooks/LoginContext";
import useAchievements from "@/hooks/useAchievements";
import HeroAchievements from "./HeroAchivements";
import Icon from "@/components/Icon";

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
  const { steamId } = useLogin();
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

  return (
    <div>
      <div className="grid grid-cols-2">
        {Object.keys(heroes).map((hero) => (
          <HeroAchievements hero={hero} achievements={heroes[hero]} />
        ))}
      </div>

      <div className="table">
        {sortedAchievements.map((a) => (
          <div key={a.name} className="table-row">
            <div className="table-cell py-1 px-2">
              <Icon
                name={a.unlockedTimestamp ? "check" : "lock"}
                className="inline mr-2"
              />
            </div>
            <div className="table-cell py-1 px-2">{a.name}</div>
            <div className="table-cell py-1 px-2">{a.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpellBrigade;
