import React from "react";

const Section = ({ children, className }) => {
  return (
    <section className={`p-4 ${className}`}>
      {children}
    </section>
  );
};

export default Section;
