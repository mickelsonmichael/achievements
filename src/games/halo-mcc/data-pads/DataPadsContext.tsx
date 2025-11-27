"use client";

import { createContext, ReactNode, useContext, useState } from "react";

import DataPads from "@data/datapads.json";
import DataPad from "@/models/DataPad";
import { useLogin } from "@/hooks/LoginContext";
import UserAchievement from "@/models/UserAchievement";

const DataPadsContext = createContext({
  dataPads: [] as DataPad[],
  allDataPads: [] as DataPad[],
  lockedOnly: true,
  toggleLockedOnly: () => {},
});

const lockedDataPadsOnly =
  (achievements: UserAchievement[]) => (dataPad: DataPad) => {
    return (
      achievements.find(
        (a) => a.unlockedTimestamp != null && a.name == dataPad.achievement
      ) == null
    );
  };

const DataPadsProvider = ({ children }: { children: ReactNode }) => {
  const { achievements } = useLogin();
  const [lockedOnly, setLockedOnly] = useState(true);
  const toggleLockedOnly = () => setLockedOnly((b) => !b);

  const filteredDataPads = (DataPads as DataPad[])
    .filter(lockedOnly ? lockedDataPadsOnly(achievements) : () => true)
    .sort((a, b) => a.id - b.id);

  const value = {
    allDataPads: DataPads as DataPad[],
    dataPads: filteredDataPads,
    lockedOnly,
    toggleLockedOnly,
  };

  return (
    <DataPadsContext.Provider value={value}>
      {children}
    </DataPadsContext.Provider>
  );
};

const useDataPads = () => useContext(DataPadsContext);

export { DataPadsProvider, useDataPads };
