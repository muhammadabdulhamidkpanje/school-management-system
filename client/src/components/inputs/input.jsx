import React from "react";

const Input = ({
  type = "text",
  name,
  label,
  placeholder,
  value,
  onChange,
  register, // 👈 register from RHF
  rules = {}, // 👈 validation rules (e.g., { required: "This field is required" })
  error, // 👈 error from RHF's formState.errors[name]
  className = "",
}) => {
  return (
    <div className={`mb-2 flex flex-col ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="mb-2 text-sm font-bold text-blue-500 uppercase"
        >
          {label}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        {...(register ? register(name, rules) : {})}
        {...(value !== undefined ? { value } : {})}
        {...(onChange ? { onChange } : {})}
        className={`w-full rounded-md border p-2 focus:ring-2 focus:outline-none
          ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}
        `}
      />

      {error && (
        <span className="mt-1 text-sm text-red-500">{error.message}</span>
      )}
    </div>
  );
};

export default Input;
