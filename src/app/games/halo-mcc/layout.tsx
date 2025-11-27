import NavLink from "@/components/NavLink";
import { ReactNode } from "react";

const AchivementsLayout = ({ children }: { children: ReactNode }) => (
    <div>
        <nav className="mb-4">
            <ul className="flex gap-1 flex-col md:flex-row">
                <NavLink icon="award" to="/games/halo-mcc">
                    Achievements
                </NavLink>
                <NavLink icon="dribbble" to="/games/halo-mcc/skulls">
                    Skulls
                </NavLink>
                <NavLink icon="monitor" to="/games/halo-mcc/terminals">
                    Terminals
                </NavLink>
                <NavLink icon="smartphone" to="/games/halo-mcc/data-pads">
                    Data Pads
                </NavLink>
            </ul>
        </nav>
        {children}
    </div>
);

export default AchivementsLayout;
