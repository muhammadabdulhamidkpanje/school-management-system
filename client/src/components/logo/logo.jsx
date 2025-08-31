import { School, School2Icon } from "lucide-react";
import React, { Fragment } from "react";

export default function Logo({title, image}){
return (
  <div className="flex flex-col items-center text-blue-500 justify-center px-4  text-center">
    {image !== undefined ? (
      <img src={image} alt={title} className="mb-2" />
    ) : (
      title && (
        <h1 className="text-xl font-bold flex break-words whitespace-normal">
         <School /> {title}
        </h1>
      )
    )}
  </div>
);

}