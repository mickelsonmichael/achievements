"use client";

import Link from "next/link";

import useToggle from "@/hooks/useToggle";
import NavLink from "@/components/NavLink";
import GameGrid from "@/components/GameGrid";
import Icon from "@/components/Icon";
import LoginButton from "@/components/LoginButton";
import { useLogin } from "@/hooks/LoginContext";

const Navigation = () => {
  const { isOn: appDrawerOpen, toggle: toggleAppDrawer } = useToggle();
  const { isOn: menuOpen, toggle: toggleMenu } = useToggle();
  const { isLoading } = useLogin();

  return (
    <div className="mb-4 relative">
      <div className="flex flex-col px-2 md:flex-row py-4 bg-white/5">
        <header className="flex items-center">
          <div
            className={`mx-3 p-1 flex items-center cursor-pointer rounded hover:bg-black/20 ${
              appDrawerOpen ? "bg-white/10" : ""
            }`}
            onClick={toggleAppDrawer}
          >
            <Icon name="grid" size={2} />
          </div>

          <Link href="/">
            <h1 className="text-xl">NotNotMike&apos;s Achievement Tracker</h1>
          </Link>

          <div className="ml-auto md:hidden">
            <button
              onClick={toggleMenu}
              className={`
                rounded-sm
                border-1
                border-white/30
                px-1
                ${menuOpen ? "bg-white/10" : ""}
            `}
            >
              <Icon name="menu" />
            </button>
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
          <ul className="flex flex-col gap-1 items-center md:flex-row md:ml-auto">
            <LoginButton />

            <NavLink
              to="https://github.com/mickelsonmichael/halo-collectibles"
              title="GitHub"
              newWindow
            >
              <Icon name="github" />
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
