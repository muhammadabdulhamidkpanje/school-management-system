import React from "react";
import clsx from "clsx";

function PrimaryButton({
  color = "white",
  height = "auto",
  width = "auto",
  bg = "blue-500",
  hoverBg = "blue-600",
  children,
  onClick,
  type = "button",
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(
        `flex items-center justify-center rounded-md px-3 py-2 text-sm transition duration-300 ease-in-out lg:px-4 lg:py-2`,
        `text-${color}`,
        `bg-${bg}`,
        `hover:bg-${hoverBg}`,
        className,
      )}
      style={{ width, height }}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
