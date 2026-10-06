import React from "react";

const Tab = ({
  label,
  value,
  active,
  onClick,
  className = ""
}) => {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => onClick(value)}
      className={`
        relative px-4 py-2 capitalize text-sm font-medium transition-colors
        ${
          active
            ? "text-blue-600"
            : "text-gray-500 hover:text-gray-700"
        }
        ${className}
      `}
    >
      {label}

      {/* underline indicator */}
      <span
        className={`
          absolute left-0 -bottom-[1px] h-0.5 w-full transition-all
          ${
            active
              ? "bg-blue-600"
              : "bg-transparent"
          }
        `}
      />
    </button>
  );
};

export default Tab;
