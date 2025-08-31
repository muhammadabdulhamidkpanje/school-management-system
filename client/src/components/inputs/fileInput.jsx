import React from "react";

export default function FileInput({ label, name, onChange }) {
  return (
    <div className="flex flex-col">
      {label && (
        <label
          htmlFor={name}
          className="mb-2 text-sm font-bold text-blue-500 uppercase"
        >
          {label}
        </label>
      )}
      <input
        type="file"
        name={name}
        onChange={onChange}
        className="w-full rounded-md border mb-2 border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );
}
