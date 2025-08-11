import React from "react";

export default function Overlay({
  children,
  width,
  height,
  bg = "bg-black bg-opacity-50",
  onClickOutside,
}) {
  return (
    <div
      className={`bg-opacity-50 bg-transparent z-50 fixed inset-0 flex items-center justify-center ${bg}`}
    >
      <div className="absolute inset-0" onClick={onClickOutside}></div>
      <div className={` z-10 ${width} ${height}`}>{children}</div>
    </div>
  );
}
