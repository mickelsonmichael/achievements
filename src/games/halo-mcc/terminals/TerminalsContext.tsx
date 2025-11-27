"use client";

import { createContext, ReactNode, useContext, useState } from "react";

import Terminals from "@data/terminals.json";
import Terminal from "@/models/Terminal";
import { useLogin } from "@/hooks/LoginContext";
import UserAchievement from "@/models/UserAchievement";

const TerminalsContext = createContext({
  terminals: [] as Terminal[],
  allTerminals: [] as Terminal[],
  lockedOnly: true,
  toggleLockedOnly: () => {},
});

const lockedTerminalsOnly =
  (achievements: UserAchievement[]) => (terminal: Terminal) => {
    return (
      achievements.find(
        (a) => a.unlockedTimestamp != null && a.name == terminal.achievement
      ) == null
    );
  };

const TerminalsProvider = ({ children }: { children: ReactNode }) => {
  const { achievements } = useLogin();
  const [lockedOnly, setLockedOnly] = useState(true);
  const toggleLockedOnly = () => setLockedOnly((b) => !b);

  const filteredTerminals = (Terminals as Terminal[]).filter(
    lockedOnly ? lockedTerminalsOnly(achievements) : () => true
  );

  const value = {
    allTerminals: Terminals as Terminal[],
    terminals: filteredTerminals,
    lockedOnly,
    toggleLockedOnly,
  };

  return (
    <TerminalsContext.Provider value={value}>
      {children}
    </TerminalsContext.Provider>
  );
};

const useTerminals = () => useContext(TerminalsContext);

export { TerminalsProvider, useTerminals };
