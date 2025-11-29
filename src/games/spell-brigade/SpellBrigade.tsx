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

      <div className="mt-4 mx-2">
        <SpellBrigadeAchievementList achievements={achievements} />
      </div>
    </div>
  );
};

export default SpellBrigade;
