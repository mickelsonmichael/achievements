import { createContext, ReactNode, useContext, useMemo, useState } from "react";

import Skulls from "@data/skulls.json";
import Skull from "@/models/Skull";
import { useLogin } from "@/hooks/LoginContext";
import Game from "@/models/Game";
import UserAchievement from "@/models/UserAchievement";

const SkullsContext = createContext({
  skulls: [] as Skull[],
  allSkulls: [] as Skull[],
  lockedOnly: true,
  toggleLockedOnly: () => {},
});

const lockedSkullsOnly =
  (achievements: UserAchievement[]) => (skull: Skull) => {
    const gameName = skull.game === Game.Halo1 ? "Halo: CE" : skull.game;
    const achievementName = `Skulltaker ${gameName}: ${skull.name}`;

    return (
      achievements.find(
        (a) => a.unlockedTimestamp != null && a.name === achievementName
      ) == null
    );
  };

const SkullsProvider = ({ children }: { children: ReactNode }) => {
  const { achievements } = useLogin();
  const [lockedOnly, setLockedOnly] = useState(true);
  const toggleLockedOnly = () => setLockedOnly((b) => !b);

  const skullAchievements = useMemo(
    () => achievements.filter((a) => a.name.startsWith("Skulltaker")),
    [achievements]
  );

  const filteredSkulls = (Skulls as Skull[]).filter(
    lockedOnly ? lockedSkullsOnly(skullAchievements) : () => true
  );

  const value = {
    allSkulls: Skulls as Skull[],
    skulls: filteredSkulls,
    lockedOnly,
    toggleLockedOnly,
  };

  return (
    <SkullsContext.Provider value={value}>{children}</SkullsContext.Provider>
  );
};

const useSkulls = () => useContext(SkullsContext);

export { SkullsProvider, useSkulls };
