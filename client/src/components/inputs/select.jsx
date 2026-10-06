import React from "react";
import clsx from "clsx";

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  allowEmpty = false,
  compact = false,
  className = "",
  error,
  rules,
  register,
  disabled = false,
}) {
  const message = typeof error === "string" ? error : error?.message;

  return (
    <div className={clsx("w-full", !compact && "mb-4", className)}>
      {label && (
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-bold text-blue-500 uppercase"
        >
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        {...(value !== undefined ? { value } : {})}
        {...(register ? register(name, rules) : {})}
        {...(onChange ? { onChange } : {})}
        disabled={disabled}
        aria-invalid={message ? true : undefined}
        className={clsx(
          "w-full rounded-md border bg-white p-2 text-gray-700 transition-all focus:ring-1 focus:outline-none",
          message
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
        )}
      >
        <option value="" disabled={!allowEmpty} hidden={!allowEmpty}>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {message && <p className="mt-1 text-sm text-red-500">{message}</p>}
    </div>
  );
}
