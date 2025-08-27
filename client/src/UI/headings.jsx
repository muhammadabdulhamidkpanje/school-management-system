import React from "react";

export default function Headings({ children, className }) {
  return <h1 className={`py-2 text-3xl text-blue-600 uppercase ${className}`}>{children}</h1>;
}