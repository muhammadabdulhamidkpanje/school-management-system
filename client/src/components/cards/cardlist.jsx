import React from "react";
import { motion } from "framer-motion";
import Card from "./cards";

export default function CardListFlex({ cards = [] }) {
  return (
    <div className="p-4 w-full flex justify-center">
        {cards.map((card, index) => (
           <div key={index} className="mb-4 h-25 w-full center px-2 sm:w-1/2 lg:w-1/3">
            <Card cardDetails={card} className="w-full h-full border-b-2 border-blue-200 bg-white shadow-md">
              {/* <Card.Image /> */}
              <Card.Body>
                <div className="flex text-center w-full flex-col items-center justify-center">
                  <h3 className="text-3xl font-bold text-gray-800">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600">{card.description}</p>
                </div>
              </Card.Body>
              {/* <Card.Footer>
                <button
                  onClick={() => setModalName?.(card.description)} // optional chaining
                  className="w-full bg-blue-500 py-2 text-sm text-white hover:bg-blue-600"
                >
                  Add {card.description}
                </button>
              </Card.Footer> */}
            </Card>
          </div>
        ))}
      </div>
  );
}
