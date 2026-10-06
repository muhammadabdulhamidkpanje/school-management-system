import React from "react";
import List from "../../list/list";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import Logo from "../../logo/logo";

// Groups items by their optional `group` field, preserving first-seen order.
// Items with no `group` are collected under a `null` key so dashboards that
// don't use groups (staff, student) render exactly as before: one list, no headers.
function groupItems(items) {
  const order = [];
  const groups = new Map();
  for (const item of items) {
    const key = item.group ?? null;
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key).push(item);
  }
  return order.map((key) => ({ label: key, items: groups.get(key) }));
}

export default function SideNav({
  items,
  className,
  onToggleMenu,
  onSeToggleMenu,
  sidebarOpen,
  setSidebarOpen,
}) {
  const [toggleMenu, setToggleMenu] = React.useState(true);
  const sections = React.useMemo(() => groupItems(items), [items]);

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
      <ul className="mt-6 flex flex-col gap-4 px-2">
        {sections.map((section) => (
          <li key={section.label ?? "ungrouped"} className="flex flex-col gap-1">
            {/* Group header: shown only when the sidebar is expanded and the
                group has a name, so collapsed mode and ungrouped dashboards
                (staff, student) are unaffected. */}
            {toggleMenu && section.label && (
              <p className="px-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {section.label}
              </p>
            )}
            <div className="flex flex-col gap-1">
              <List
                items={section.items}
                onToggle={toggleMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium 
                 text-gray-700 transition hover:bg-gray-300 hover:text-gray-900"
              />
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
}
