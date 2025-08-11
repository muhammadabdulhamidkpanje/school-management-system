import React, {createContext} from 'react';

//const PrimaryCard = createContext()
export default function PrimaryCard({title, description, image, className}) {
    return(
        <div className={`flex flex-col rounded-sm ${className}`}>
            <h2 className="text-sm text-gray-300">{title}</h2>
            <div className="flex flex-row-reverse justify-between items-center">
            <img src={image} alt={title} className="" />
                <p className="text-md font-bold">{description}</p>
            </div>
        </div>
    )
}