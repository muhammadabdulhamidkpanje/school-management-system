import React from "react";
import List from "../../list/list";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import Logo from "../../logo/logo";

export default function SideNav({ items, className ,onToggleMenu, onSeToggleMenu }) {
  const [toggleMenu, setToggleMenu] = React.useState(false);

  return (
    <nav
      className={clsx(
        "flex h-screen shadow-md border-r-2 border-gray-400 flex-col gap-2 items-center rounded-md bg-gray-200 py-4 text-white transition-all duration-300",
        toggleMenu ? "w-48" : "w-14",
        className,
      )}
    >
      <div className=" shadow-sm w-full flex h-12 items-center justify-center border-b-2 px-4">
        <Logo title={ toggleMenu ? "SMS" : "   " }/>
        <button
          className={clsx(
            "relative flex h-10 w-3 items-center justify-center  bg-blue-600 text-white hover:bg-blue-700 focus:outline-none",
            toggleMenu ? "left-11" : "right-0", toggleMenu ? "rounded-l-md" : "rounded-r-md",
          )}
          onClick={() => setToggleMenu((prev) => !prev)}
        >
          {toggleMenu ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>
    <ul className="flex flex-col gap-6" >

      <List
        items={items}
        onToggle={toggleMenu}
        className="flex gap-4  w-full items-center capitalize "
        />
    </ul>
    </nav>
  );
}
