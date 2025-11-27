"use client";

import Modal from "@/components/Modal";
import useToggle from "@/hooks/useToggle";
import Link from "next/link";
import { useLogin } from "@/hooks/LoginContext";
import Icon from "./Icon";

const LoginButton = () => {
  const { isLoggedIn, logout } = useLogin();
  const { isOn: isLoginOpen, toggle: toggleLogin } = useToggle(false);

  return (
    <>
      <li className="px-3">
        {isLoggedIn ? (
          <button className="cursor-pointer" onClick={logout}>
            <Icon name="log-out" className="mr-2" />
            Logout
          </button>
        ) : (
          <button className="cursor-pointer" onClick={toggleLogin}>
            <Icon name="log-in" className="mr-2" />
            Login
          </button>
        )}
        <Modal isOpen={isLoginOpen} onToggle={toggleLogin} title="Login">
          <div className="flex flex-col">
            <p className="text-sm text-white/60">
              You can login using your SteamID to filter out completed
              achievements.
              <br />
              Or you can click the &quot;Sign in through Steam&quot; button
              below to login.
            </p>
            <form
              action="/api/auth"
              className="flex flex-col my-4"
              method="POST"
            >
              <div className="flex flex-col md:flex-row">
                <input
                  type="text"
                  name="steamId"
                  id="steamId"
                  required
                  className="block bg-gray-500/90 rounded-sm py-1 px-2 mb-3 md:py-2 md:mb-0 md:mr-2 md:flex-grow-1"
                  placeholder="Steam ID"
                />
                <button
                  type="submit"
                  className={`
                py-1
                px-2
                bg-indigo-500
                rounded-sm
                cursor-pointer
                hover:bg-indigo-600 
              `}
                  onClick={() => console.debug("login")}
                >
                  Login
                </button>
              </div>
              <a
                href="https://help.steampowered.com/en/faqs/view/2816-BE67-5B69-0FEC"
                target="_blank"
                className="text-xs text-blue-600 mt-2 text-center md:text-right"
              >
                How do I find my Steam ID?
              </a>
            </form>

            <div className="grid grid-cols-1 gap-2 border-t-1 pt-4 mt-2 md:grid-cols-2">
              <Link
                href="/api/auth/xbox"
                className="flex flex-row items-center bg-green-800 rounded-sm py-2 px-2 justify-center"
              >
                <Icon name="xbox" className="mr-2" size={2} />
                Sign in with Xbox
              </Link>
              <Link
                href="/api/auth"
                className="flex flex-row items-center bg-slate-950 rounded-sm py-2 px-2 justify-center"
              >
                <Icon name="steam" className="mr-2" size={2} />
                Sign in with Steam
              </Link>
            </div>
          </div>
        </Modal>
      </li>
    </>
  );
};

export default LoginButton;
