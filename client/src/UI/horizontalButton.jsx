import React from "react";
import PrimaryButton from "../components/button/button";

const HorizontalButton = ({ tab, setTab, data }) => {
  return (
    <div className="flex h-12 items-center !justify-evenly gap-2 rounded-lg shadow-sm">
      {data.map(({ label, value }) => (
        <PrimaryButton
          type="button"
          variant="secondary"
          size="sm"
          color="black"
          key={value}
          onClick={() => setTab ? setTab(value) : null}
          className={`px-4 py-1 ${
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
