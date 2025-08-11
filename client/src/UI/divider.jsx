import React from "react";
import clsx from "clsx";

export default function Stack({
  children,
  direction = "col", // base direction
  sm,
  md,
  lg,
  xl, // responsive directions
  gap = "4", // base gap
  align = "start", // base alignment
  justify = "start", // base justify
  className = "",
}) {
  const base = `flex flex-${direction} gap-${gap} items-${align} justify-${justify}`;

  const responsive = clsx(
    sm && `sm:flex-${sm}`,
    md && `md:flex-${md}`,
    lg && `lg:flex-${lg}`,
    xl && `xl:flex-${xl}`,
  );

  return <div className={clsx(base, responsive, className)}>{children}</div>;
}
