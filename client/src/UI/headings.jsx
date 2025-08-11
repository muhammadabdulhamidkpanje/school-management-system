import React from "react";

export default function Headings({ children, className }) {
  return (
    <div className={`text-center text-2xl font-bold ${className}`}>
      {children}
    </div>
  );
}