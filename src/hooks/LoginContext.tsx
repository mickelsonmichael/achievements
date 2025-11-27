"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Cookies from "js-cookie";
import UserAchievement from "@/models/UserAchievement";

const LoginContext = createContext({
  isLoading: false,
  isLoggedIn: false,
  isLoggedInWithXbox: false,
  steamId: null as string | null,
  achievements: [] as UserAchievement[],
  logout: () => {},
});

interface LoginProviderProps {
  children: ReactNode;
}

const STEAM_COOKIE_NAME = "STEAM_USER_ID";
const XBOX_COOKIE_NAME = "XUID";

const LoginProvider = ({ children }: LoginProviderProps) => {
  const [steamId, setSteamId] = useState<string | null>(null);
  const [xuid, setXuid] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isLoggedInWithXbox = useMemo(() => xuid != null, [xuid]);

  const isLoggedIn = useMemo(
    () => steamId != null || isLoggedInWithXbox,
    [steamId, isLoggedInWithXbox]
  );

  useEffect(() => {
    const storedSteamId = Cookies.get(STEAM_COOKIE_NAME);
    const storedXuid = Cookies.get(XBOX_COOKIE_NAME);

    setSteamId(storedSteamId ?? null);
    setXuid(storedXuid ?? null);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setAchievements([]);
      return;
    }

    setIsLoading(true);
    fetch("/api/achievements")
      .then((res) => res.json())
      .then((data) => {
        setAchievements(data.achievements);
        setIsLoading(false);
      });
  }, [isLoggedIn]);

  const logout = () => {
    Cookies.remove(STEAM_COOKIE_NAME);
    Cookies.remove(XBOX_COOKIE_NAME);
    setSteamId(null);
    setXuid(null);
  };

  return (
    <LoginContext.Provider value={{ isLoggedIn, isLoggedInWithXbox, isLoading, logout, achievements, steamId }}>
      {children}
    </LoginContext.Provider>
  );
};

const useLogin = () => useContext(LoginContext);

export { LoginProvider, useLogin };
