"use client";

import Filters from "@/games/halo-mcc/achievements/Filters";
import { AchievementsProvider } from "./AchievementsContext";
import AchievementsTable from "@/games/halo-mcc/achievements/AchievementsTable";
import Search from "@/games/halo-mcc/achievements/Search";
import Unmatched from "@/games/halo-mcc/Unmatched";

const Achievements = () => (
  <AchievementsProvider>
    {process.env.NODE_ENV === "development" && <Unmatched />}
    <Filters />
    <Search />
    <AchievementsTable />
  </AchievementsProvider>
);

export default Achievements;
