import React from "react";
import { NavLink } from "react-router";


const shouldUseEnd = (path) => {
  const segments = path.split("/").filter(Boolean);
  return segments.length <= 2;
};

export default function List({ items, onToggle, className,}) {
  return (
    <>
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={shouldUseEnd(item.path)}
          className={({ isActive }) =>
            `flex items-center gap-1 rounded-md w-full px-2 transition-colors duration-200 ${className} ${
              isActive
                ? "border-l-4 border-blue-500 bg-blue-100 font-semibold text-blue-900 shadow-sm"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`
          }
        >
          {/* Render icon based on its type */}
          {item.icon && (
            <>
              {typeof item.icon === "string" ? (
                <img
                  src={item.icon}
                  alt={item.name}
                  className="h-5 w-5 rounded-sm"
                />
              ) : React.isValidElement(item.icon) ? (
                item.icon
              ) : typeof item.icon === "function" ? (
                <item.icon className="h-5 w-5" />
              ) : null}
            </>
          )}
          {onToggle ? item.name : null}
        </NavLink>
      ))}
    </>
  );
}
