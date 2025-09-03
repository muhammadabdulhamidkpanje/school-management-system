import React from "react";
import PrimaryButton from "../components/button/button";

const HorizontalButton = ({ tab, setTab, data, className }) => {
  return (
    <div className="flex flex-wrap items-center p-4 sm:justify-evenly sm:py-4 gap-2 rounded-lg shadow-sm">
      {data.map(({ label, value }) => (
        <PrimaryButton
          type="button"
          variant="secondary"
          size="sm"
          color="black"
          key={value}
          onClick={() => setTab ? setTab(value) : null}
          className={`px-4 sm:my-2 w-[45%] sm:w-[24%] ${className} ${
            tab === value
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {label}
        </PrimaryButton>
      ))}
    </div>
  );
};

export default HorizontalButton;
