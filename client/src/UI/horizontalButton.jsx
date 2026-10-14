import React from "react";
import Tab from "../components/tabs/tabs";

const HorizontalButton = ({
  tab,
  setTab,
  data,
  className = "",
  nowrap = false,
  verticalOnLarge = false,
}) => {
  const layoutClasses = nowrap
    ? `w-full flex-nowrap justify-start overflow-x-auto ${
        verticalOnLarge
          ? "lg:w-1/4 lg:flex-col lg:items-stretch lg:overflow-visible"
          : ""
      }`
    : "flex-wrap sm:justify-evenly";

  return (
    <div
      className={`flex items-center gap-2 rounded-lg p-4 shadow-sm sm:py-4 ${layoutClasses} ${className}`}
    >
      {data.map(({ label, value }) => (
        <Tab
          type="button"
          variant="secondary"
          size="sm"
          color="black"
          label={label}
          value={value}
          active={tab === value}
          key={value}
          onClick={() => setTab ? setTab(value) : null}
          className={
            nowrap
              ? `shrink-0 ${verticalOnLarge ? "lg:w-full lg:text-left" : ""}`
              : ""
          }
          />
      ))}
    </div>
  );
};

export default HorizontalButton;
