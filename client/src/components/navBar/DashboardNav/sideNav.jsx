import React from "react";
import List from "../../list/list";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import Logo from "../../logo/logo";

export default function SideNav({
  items,
  className,
  onToggleMenu,
  onSeToggleMenu,
  sidebarOpen,
  setSidebarOpen,
}) {
  const [toggleMenu, setToggleMenu] = React.useState(true);

  return (
    <nav
      className={clsx(
        "fixed h-screen flex-col items-center gap-2 border-r bg-gradient-to-b from-gray-100 via-gray-200 to-gray-100 text-gray-800 shadow-lg transition-all duration-300",
        "sm:static sm:flex sm:h-auto",
        toggleMenu ? "w-56" : "w-16",
        className,
      )}
    >
      {/* Logo + Collapse Button */}
      <div className="relative flex h-14 w-full items-center justify-between border-b border-white/20 px-4">
        <Logo title={toggleMenu ? "SMS" : ""} />

        <button
          className={clsx(
            "relative flex h-10 w-3 items-center justify-center bg-blue-600 text-white hover:bg-blue-700 focus:outline-none",
            toggleMenu ? "sm:left-9" : "sm:left-0",
            toggleMenu ? "rounded-l-md" : "rounded-r-md",
          )}
          onClick={() => setToggleMenu((prev) => !prev)}
        >
          {toggleMenu ? <ChevronLeft /> : <ChevronRight />}
        </button>

        {/* Close on mobile */}
        <button
          className="absolute top-4 right-4 flex items-center rounded-md p-2 text-white/70 hover:bg-white/20 hover:text-white sm:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          ✕
        </button>
      </div>

      {/* Menu Items */}
      <ul className="mt-6 flex flex-col gap-2 px-2">
        <List
          items={items}
          onToggle={toggleMenu}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium 
             text-gray-700 transition hover:bg-gray-300 hover:text-gray-900"

        />
      </ul>
    </nav>
  );
}
