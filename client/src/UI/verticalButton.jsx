import React from "react";
import PrimaryButton from "../components/button/button";

export default function VerticalButton({ data, onClick, tab, setTab, className }) {
  return (
    <div className={`flex p-4 flex-col items-center w-full sm:w-[25%] gap-2 rounded-lg shadow-sm ${className}`}>
      {data.map(({ label, value }) => (
        <PrimaryButton
          type="button"
          variant="secondary"
          size="sm"
          color="black"
          key={value}
          onClick={() => (setTab ? setTab(value) : null)}
          className={`px-4 py-1 !w-full ${
            tab === value
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {label}
        </PrimaryButton>
      ))}
    </div>
  );
}
