import React from "react";
import clsx from "clsx";

// Tailwind only generates classes it can see as complete strings, so the old
// `bg-${bg}` template never reliably worked. Variants are spelled out instead.
const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 lg:px-4";

const variants = {
  primary: "bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-blue-500",
  secondary:
    "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

/**
 * Drop-in replacement: same props as before (width, height, type, onClick,
 * className, children) plus `variant` and any native button prop, so
 * `disabled`, `form`, `aria-*` etc. now actually reach the <button>.
 * The old `color`, `bg` and `hoverBg` props are accepted and ignored.
 */
export default function PrimaryButton({
  variant = "primary",
  width = "auto",
  height = "auto",
  type = "button",
  className = "",
  style,
  children,
  // eslint-disable-next-line no-unused-vars
  color,
  // eslint-disable-next-line no-unused-vars
  bg,
  // eslint-disable-next-line no-unused-vars
  hoverBg,
  ...rest
}) {
  return (
    <button
      type={type}
      className={clsx(base, variants[variant] ?? variants.primary, className)}
      style={{ width, height, ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function SecondaryButton(props) {
  return <PrimaryButton variant="secondary" {...props} />;
}

export function DangerButton(props) {
  return <PrimaryButton variant="danger" {...props} />;
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

export function IconButton({
  icon,
  onClick,
  ariaLabel = "icon button",
  className = "",
}) {
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
