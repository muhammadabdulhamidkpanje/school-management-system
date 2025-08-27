import { Search } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

export default function Filter({
  data = [],
  options = [],
  filterKey,
  onFilter,
  setFilterKey
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);

  // Handle search input changes
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };
  
    const filteredData = data.filter((item) =>
      String(item[filterKey] || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  // Filter data and send to parent
  useEffect(() => {
    onFilter(filteredData);
  }, [searchTerm, data, filterKey, ]);

  

  return (
    <div className="flex gap-2 my-2">
      <select
        value={filterKey}
        onChange={(e) => setFilterKey(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none sm:w-1/4"
      >
        <option value="">All</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder={`Filter by ${filterKey || "..."}`}
        value={searchTerm}
        onChange={handleSearch}
        className="w-full max-w-xs rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
