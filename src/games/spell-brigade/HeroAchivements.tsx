"use client";

import Icon from "@/components/Icon";
import UserAchievement from "@/models/UserAchievement";

interface HeroAchievementsProps {
  hero: string;
  achievements: UserAchievement[];
}

const HeroAchievements = ({ hero, achievements }: HeroAchievementsProps) => {
  const isFinished = achievements.every((a) => a.unlockedTimestamp != null);

  return (
    <div className="p-2 m-2 bg-white/10 rounded">
      {isFinished ? (
        <div className="text-lg flex items-center">
          {hero}
          <Icon name="check" size={2} className="ml-4" />
        </div>
      ) : (
        <div>
          <div className="text-lg">{hero}</div>

          <ul className="grid gap-1">
            {achievements.map((a) => (
              <li
                key={a.name}
                className="bg-stone-100/20 px-2 py-3 rounded flex items-center"
              >
                <Icon
                  name={a.unlockedTimestamp ? "check" : "lock"}
                  className="inline mx-3"
                  size={2}
                />
                <div>
                  <div>{a.name}</div>
                  <div className="text-sm">{a.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HeroAchievements;
