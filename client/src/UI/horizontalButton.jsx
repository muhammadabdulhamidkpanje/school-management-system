import React from "react";
import Tab from "../components/tabs/tabs";

const HorizontalButton = ({ tab, setTab, data, className }) => {
  return (
    <div className="flex flex-wrap items-center p-4 sm:justify-evenly sm:py-4 gap-2 rounded-lg shadow-sm">
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
          />
      ))}
    </div>
  );
};

export default HorizontalButton;
