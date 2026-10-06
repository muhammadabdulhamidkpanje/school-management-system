import React from "react";
import { NavLink } from "react-router";

const shouldUseEnd = (path) => {
  const segments = path.split("/").filter(Boolean);
  return segments.length <= 2;
};

export default function List({ items, onToggle, className }) {
  return (
    <>
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={shouldUseEnd(item.path)}
          className={({ isActive }) =>
            `group relative flex items-center ${
              onToggle ? "gap-3 px-3" : "justify-center px-2"
            } w-full rounded-md py-2 text-[13px] font-medium transition-colors duration-150 ${className} ${
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`
          }
        >
          {/* Active indicator: inset shadow instead of a real border so it
              never shifts layout width, even in the collapsed icon rail. */}
          {onToggle && (
            <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-blue-600 opacity-0 transition-opacity duration-150 group-aria-[current=page]:opacity-100" />
          )}

          {/* Icon */}
          {item.icon && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-[18px] [&>svg]:w-[18px]">
              {typeof item.icon === "string" ? (
                <img
                  src={item.icon}
                  alt={item.name}
                  className="h-[18px] w-[18px] rounded-sm"
                />
              ) : React.isValidElement(item.icon) ? (
                item.icon
              ) : typeof item.icon === "function" ? (
                <item.icon className="h-[18px] w-[18px]" />
              ) : null}
            </span>
          )}

          {/* Label, expanded only */}
          {onToggle && <span className="truncate">{item.name}</span>}

          {/* Tooltip, collapsed only */}
          {!onToggle && (
            <span className="pointer-events-none absolute left-full z-10 ml-2 hidden rounded-md bg-slate-800 px-2 py-1 text-md whitespace-nowrap text-white group-hover:block">
              {item.name}
            </span>
          )}
        </NavLink>
      ))}
    </>
  );
}