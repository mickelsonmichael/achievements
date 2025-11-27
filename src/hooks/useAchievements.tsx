"use client";

import { useState, useEffect } from "react";
import type UserAchievement from "@/models/UserAchievement";

const useAchievements = (userId?: string | null, gameId?: string) => {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId == null) {
      setAchievements([]);
      return;
    }

    setIsLoading(true);
    fetch(`/api/achievements?gameId=${gameId}`)
      .then((res) => res.json())
      .then((data) => {
        setAchievements(data.achievements);
        setIsLoading(false);
      });
  }, [userId]);

  return {
    isLoading,
    achievements,
  };
};

export default useAchievements;
