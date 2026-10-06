import React from "react";
import { Plus } from "lucide-react";

export default function CardListFlex({ cards = [] }) {
  return (
    <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 p-4">
      {cards.map((card, index) => (
        <div
          key={card.id ?? index}
          className="relative rounded-lg border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300"
        >
          {/* Action Icon */}
          {(card.action || card.modalComponent) && (
            <button
              type="button"
              onClick={card.action}
              className="absolute top-1 right-1 z-10 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label={`Action for ${
                card.description || card.title || "card"
              }`}
            >
              <Plus size={17} />
            </button>
          )}

          {/* Card Content */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
              {card.description}
            </p>

            {card.icon && (
              <span className="text-gray-400">
                {card.icon}
              </span>
            )}
          </div>

          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {card.value ?? card.title}
          </p>
        </div>
      ))}
    </div>
  );
}
