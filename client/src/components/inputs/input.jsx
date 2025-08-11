import React from "react";

const Input = ({
  type = "text",
  name,
  label,
  placeholder,
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
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
        value={value}
        onChange={onChange}
        className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );
};


export default Input;