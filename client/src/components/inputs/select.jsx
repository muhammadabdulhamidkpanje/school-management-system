import React from "react";

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  className = "",
  error = "",
  disabled = false,
}) {
  return (
    <div className={`mb-4 w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full rounded-md border bg-white p-2 text-gray-700 transition-all focus:ring-1 focus:outline-none ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"} `}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
