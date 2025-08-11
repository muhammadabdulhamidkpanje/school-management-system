import React, { createContext, useContext } from "react";

// Create context
const TableContext = createContext();

export default function Table({ children, data, className = "" }) {
  return (
    <TableContext.Provider value={{ data }}>
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table
          className={`w-full min-w-[600px] text-sm text-gray-700 ${className}`}
        >
          {children}
        </table>
      </div>
    </TableContext.Provider>
  );
}

// Header
function Header({ columns }) {
  return (
    <thead className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900">
      <tr>
        {columns.map((col) => (
          <th
            key={col}
            className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase"
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

// Body with zebra striping
function Body({ renderRow }) {
  const { data } = useContext(TableContext);

  return (
    <tbody>
      {data.map((item, index) => (
        <tr
          key={index}
          className={`${
            index % 2 === 0 ? "bg-white" : "bg-gray-50"
          } transition-colors duration-150 hover:bg-blue-50`}
        >
          {renderRow(item)}
        </tr>
      ))}
    </tbody>
  );
}

// Attach subcomponents
Table.Header = Header;
Table.Body = Body;
