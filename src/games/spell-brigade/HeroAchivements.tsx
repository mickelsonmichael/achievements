"use client";

import Image from "next/image";

import Icon from "@/components/Icon";
import UserAchievement from "@/models/UserAchievement";

interface HeroAchievementsProps {
  hero: string;
  achievements: UserAchievement[];
}

const HeroAchievements = ({ hero, achievements }: HeroAchievementsProps) => {
  const isFinished = achievements.every((a) => a.unlockedTimestamp != null);

  return (
    <div className="p-2 m-2 bg-white/10 rounded flex">
      <div className="flex flex-col items-center justify-center mr-2">
        <Image
          src={`/img/spell-brigade/${hero
            .toLowerCase()
            .replaceAll(" ", "-")}.png`}
          alt={hero}
          width={133}
          height={200}
        />
        <div className="text-lg">{hero}</div>
      </div>

      {isFinished ? (
        <div className="text-lg flex justify-center items-center flex-grow-1">
          <Icon name="check" size={6} className="ml-4" />
        </div>
      ) : (
        <div className="flex-grow-1">
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
                  {a.unlockedTimestamp ? null : (
                    <div className="text-sm">{a.description}</div>
                  )}
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
