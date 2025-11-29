"use client";

import { useState } from "react";
import { Metadata } from "next";

import { useLogin } from "@/hooks/LoginContext";
import useAchievements from "@/hooks/useAchievements";
import SecretAchievements from "./secret-achievements.json";
import Icon from "@/components/Icon";
import Info from "@/components/Info";

export const metadata: Metadata = {
  title: "Battlefield 6",
};

const Battlefield6 = () => {
  const { steamId, isLoggedIn, isLoggedInWithXbox } = useLogin();
  const { achievements } = useAchievements(steamId, "2807960");
  const [search, setSearch] = useState("");

  if (!isLoggedIn || isLoggedInWithXbox) {
    return (
      <Info icon="alert-circle">
        You must be logged in with Steam to track <em>The Spell Brigade</em>{" "}
        achievements.
      </Info>
    );
  }

  const modifiedAchievements = achievements
    .map((a) => {
      const secretDetails = SecretAchievements.find((s) => s.name === a.name);
      return secretDetails
        ? { ...a, secret: true, description: secretDetails.description }
        : { ...a, secret: false };
    })
    .filter(
      (a) =>
        search === "" ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.description?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aUnlocked = a.unlockedTimestamp != null ? 1 : 0;
      const bUnlocked = b.unlockedTimestamp != null ? 1 : 0;
      if (aUnlocked !== bUnlocked) return aUnlocked - bUnlocked;
      return a.name.localeCompare(b.name) || 0;
    });

  return (
    <div>
      <div className="m-2 flex items-center">
        <div className="bg-zinc-700 flex rounded items-center flex-grow-1">
          <Icon name="search" className="mx-2 text-zinc-300" />
          <input
            type="text"
            onChange={(e) => setSearch(e.target.value)}
            className="py-2 flex-grow-1 block focus:outline-0"
            placeholder="Search"
          />
        </div>
      </div>

      <ul className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {modifiedAchievements.map((a) => (
          <li
            key={a.name}
            className={`${
              a.unlockedTimestamp == null ? "bg-zinc-800" : "bg-zinc-900"
            } rounded p-4 m-2 flex items-center`}
          >
            <Icon
              name={a.unlockedTimestamp == null ? "lock" : "check"}
              size={2}
              className="mr-4"
            />
            <div className="mr-auto">
              <div>{a.name}</div>
              <div className="text-sm">{a.description}</div>
            </div>
            <div>
              {a.secret && (
                <Icon name="help-circle" className="text-black/30" />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Battlefield6;
