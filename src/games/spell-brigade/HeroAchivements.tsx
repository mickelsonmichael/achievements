"use client";

import Image from "next/image";

import Icon from "@/components/Icon";
import UserAchievement from "@/models/UserAchievement";

interface HeroAchievementsProps {
  hero: string;
  achievements: UserAchievement[];
}

const HeroAchievements = ({ hero, achievements }: HeroAchievementsProps) => (
  <div className="p-2 m-2 bg-white/10 rounded md:grid md:grid-cols-4 justify-stretch">
    <div className="flex flex-col items-stretch justify-center mb-2 md:mb-auto md:mr-2">
      <Image
        src={`/img/spell-brigade/${hero
          .toLowerCase()
          .replaceAll(" ", "-")}.png`}
        alt={hero}
        width={200}
        height={200}
      />
      <div className="text-lg text-center bg-zinc-900 px-2 py-1 my-1 md:mt-1 md:mb-auto rounded text-nowrap">
        {hero}
      </div>
    </div>

    <div className="col-span-3">
      <ul className="h-full grid gap-1 grid-rows-3 ">
        {achievements.map((a) => (
          <li
            key={a.name}
            className={`px-2 py-3 rounded flex items-center ${
              a.unlockedTimestamp != null ? "bg-zinc-900" : "bg-slate-700"
            }`}
          >
            <Icon
              name={a.unlockedTimestamp ? "check" : "lock"}
              className="inline mx-3"
              size={2}
            />
            <div className="col-span-4">
              <div>{a.name}</div>
              <div className="text-xs">{a.description}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default HeroAchievements;
