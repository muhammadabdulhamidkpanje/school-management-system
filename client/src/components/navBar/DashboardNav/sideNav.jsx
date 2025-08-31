import React from "react";
import List from "../../list/list";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import clsx from "clsx";
import Logo from "../../logo/logo";

export default function SideNav({ items, className ,onToggleMenu, onSeToggleMenu, sidebarOpen, setSidebarOpen}) {
  const [toggleMenu, setToggleMenu] = React.useState(true);

  return (
    <nav
  className={clsx(
    // Base styles (small screen)
    "fixed h-screen shadow-md border-r-2 border-gray-400 flex-col gap-2 items-center rounded-md bg-gray-200 py-4 text-white transition-all duration-300",

    // On bigger screens (sm and above) → flex + not fixed + auto height
    "sm:static sm:flex sm:h-auto",

    // Width toggle
    toggleMenu ? "w-48" : "w-14",

    className,
  )}
>

      <div className=" shadow-sm w-full sm:flex h-12 items-center justify-center border-b-2 px-4">
        <Logo title={ toggleMenu ? "SMS" : "   " }/>
        <button
          className={clsx(
            "flex relative  h-10 w-3 items-center justify-center  bg-blue-600 text-white hover:bg-blue-700 focus:outline-none",
            toggleMenu ? "sm:left-9" : "sm:left-0", toggleMenu ? "left-42" : "left-9", toggleMenu ? "rounded-l-md" : "rounded-r-md",
          )}
          onClick={() => setToggleMenu((prev) => !prev)}
        >
          {toggleMenu ? <ChevronLeft /> : <ChevronRight />}
        </button>
        <button className="sm:hidden absolute flex items-center top-4 right-4 p-2 rounded-md text-gray-600 hover:bg-gray-300 hover:text-gray-900 focus:outline-none"
        onClick={() => setSidebarOpen(false)}>X</button>
      </div>
    
    <ul className="flex flex-col gap-6" >

      <List
        items={items}
        onToggle={toggleMenu}
        className="flex gap-4  overflow-y-auto w-full items-center capitalize "
        />
    </ul>
    </nav>
  );
}
