import Achievements from "@/games/halo-mcc/achievements";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Halo: The Master Chief Collection",
};

const AchievementsPage = () => (
    <Achievements />
);

export default AchievementsPage;
