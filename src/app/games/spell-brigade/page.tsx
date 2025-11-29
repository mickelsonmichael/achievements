import SpellBrigade from "@/games/spell-brigade/SpellBrigade";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Spell Brigade",
};

const SpellBrigadePage = () => (
    <div>
        <SpellBrigade />
    </div>
);

export default SpellBrigadePage;
