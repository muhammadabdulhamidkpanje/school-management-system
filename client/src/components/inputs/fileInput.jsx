import React from "react";

export default function FileInput({ label, name, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">{label}</label>
      <input
        type="file"
        name={name}
        onChange={onChange}
        className="rounded border border-gray-300 p-2"
      />
    </div>
  );
}
