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



export function SecondaryButton({}){
  return (
    <button className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition duration-300 ease-in-out hover:bg-gray-100">
      {children}
    </button>
  );
}



export function DeleteButton({ children, onClick }) {
  return (
    <button
      className="flex items-center justify-center rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-700 transition duration-300 ease-in-out hover:bg-red-100"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function EditButton({ children, onClick }) {
  return (
    <button
      className="flex items-center justify-center rounded-md border border-blue-300 bg-white px-3 py-2 text-sm text-blue-700 transition duration-300 ease-in-out hover:bg-blue-100"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function ViewButton({ children, onClick }) {
  return (
    <button
      className="flex items-center justify-center rounded-md border border-green-300 bg-white px-3 py-2 text-sm text-green-700 transition duration-300 ease-in-out hover:bg-green-100"
      onClick={onClick}
    >
      {children}
    </button>
  );
}


export function IconButton({ icon, onClick, ariaLabel = "icon button", className = "" }) {
  return (
    <button
      className={`flex items-center justify-center rounded-md p-2 text-sm transition duration-300 ease-in-out ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  );
}
