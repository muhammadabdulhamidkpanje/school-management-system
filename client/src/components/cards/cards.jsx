import React, { createContext, useContext } from "react";

const CardContext = createContext();

export default function Card({ children, cardDetails, className = "" }) {
  return (
    <CardContext.Provider value={{ cardDetails }}>
      <div
        className={`flex w-full justify-center   flex-wrap shadow-md ${className}`}
      >
        {children}
      </div>
    </CardContext.Provider>
  );
}


export  function Image({ height = "100%", width = "100%", children }) {
  const { cardDetails } = useContext(CardContext);
  const { image } = cardDetails;

  return (
    <div style={{ width, height }} className="overflow-hidden w-[30%] h-[80%]">
      {image ? (
        <img {...image} className="h-full w-full object-contain" />
      ) : (
        children
      )}
    </div>
  );
}


function Body({children}){
    return(
        <div className=" flex h-[80%] w-[70%] ">
            {children}
        </div>
    );
}

function Footer({children}) {
  return (
    <div className=" w-full">
      {children}
    </div>
  );
}

Card.Image = Image;
Card.Footer = Footer;
Card.Body = Body;