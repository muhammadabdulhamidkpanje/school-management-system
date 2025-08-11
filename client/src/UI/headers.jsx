import React from "react";

export default function Header({children}) {
    return(
    <header className=" uppercase underline py-4  flex justify-between items-center">
       {children}
    </header>
  )
}