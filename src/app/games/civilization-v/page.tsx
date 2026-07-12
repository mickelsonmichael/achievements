import CivilizationV from "@/games/civilization-v/CivilizationV";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Civilization V",
};

const CivilizationVPage = () => <CivilizationV />;

export default CivilizationVPage;
