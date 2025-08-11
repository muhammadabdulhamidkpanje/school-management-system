import React, { useState, useEffect } from "react";

const SearchBar = ({ placeholder = "Search...", onSearch, delay = 300, onBlur }) => {
  const [input, setInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");

  // Debounce the input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInput(input);
    }, delay);

    return () => clearTimeout(handler);
  }, [input, delay]);

  // Trigger search on debounced input change
  useEffect(() => {
    if (onSearch) onSearch(debouncedInput.trim());
  }, [debouncedInput, onSearch]);

  return (
    <div className="w-full">
      <label htmlFor="search-input" className="sr-only">
        Search
      </label>
      <div className="relative">
        <input
          id="search-input"
          type="text"
          className="w-full rounded border-2 border-gray-300 py-1 pl-4 transition focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={onBlur}
          aria-label="Search"
        />
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg
            className="h-5 w-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
