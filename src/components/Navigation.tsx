"use client";

import Link from "next/link";

import useToggle from "@/hooks/useToggle";
import NavLink from "@/components/NavLink";
import GameGrid from "@/components/GameGrid";
import Icon from "@/components/Icon";
import LoginButton from "@/components/LoginButton";
import { useLogin } from "@/hooks/LoginContext";
import SquareButton from "./SquareButton";

const Navigation = () => {
  const { isOn: appDrawerOpen, toggle: toggleAppDrawer } = useToggle();
  const { isOn: menuOpen, toggle: toggleMenu } = useToggle();
  const { isLoading } = useLogin();

  return (
    <div className="mb-4 relative">
      <div className="flex flex-col px-2 md:flex-row py-4 bg-white/5">
        <header className="flex items-center">
          <div className="mr-2">
            <SquareButton
              name="grid"
              onClick={toggleAppDrawer}
              isActive={appDrawerOpen}
              size={2}
            />
          </div>

          <Link href="/" className="mr-auto">
            <h1 className="text-xl">NotNotMike&apos;s Achievement Tracker</h1>
          </Link>

          <div className="ml-2 md:hidden">
            <SquareButton
              name="menu"
              onClick={toggleMenu}
              isActive={menuOpen}
              size={2}
            />
          </div>
        </header>

        <nav
          className={`
            flex-grow-1
            flex-col
            gap-1
            mt-3
            md:flex
            md:flex-row
            md:mt-0
            ${menuOpen ? "flex" : "hidden"}
        `}
        >
          <ul className="flex flex-col gap-1 mt-2 md:items-center md:flex-row md:ml-auto md:mt-auto">
            <LoginButton />

            <NavLink
              to="https://github.com/mickelsonmichael/halo-collectibles"
              title="GitHub"
              newWindow
            >
              <Icon name="github" />
              <span className="ml-2 md:hidden md:ml-auto">GitHub</span>
            </NavLink>
          </ul>
        </nav>
      </div>

      {isLoading && (
        <div className="bg-cyan-800 py-4 px-8">
          <Icon name="loader" className="mr-4 animate-spin" />
          Loading achievements
        </div>
      )}

      <div
        className={`absolute ${
          appDrawerOpen ? "flex" : "hidden"
        } content-center top-[120%] left-5 right-5`}
      >
        <div className="bg-black/95 p-3 w-full rounded">
          <GameGrid />
        </div>
      </div>
    </div>
  );
};

export default Navigation;
