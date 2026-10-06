import React, { createContext, useContext } from "react";

const TableContext = createContext({ data: [], hasRows: false });

/**
 * Same compound API as before (<Table data> + Table.Header + Table.Body), now
 * with loading / error / empty states so pages backed by an API don't render a
 * blank box while waiting.
 *
 *   <Table data={rows} isLoading={q.isLoading} isError={q.isError}
 *          onRetry={q.refetch} emptyMessage="No faculties yet.">
 *     <Table.Header columns={[...]} />
 *     <Table.Body renderRow={(row) => <>...</>} />
 *   </Table>
 */
export default function Table({
  children,
  data = [],
  isLoading = false,
  isError = false,
  errorMessage = "Something went wrong while loading this data.",
  onRetry,
  emptyMessage = "Nothing here yet.",
  className = "",
}) {
  const rows = data ?? [];
  const hasRows = !isLoading && !isError && rows.length > 0;

  return (
    <TableContext.Provider value={{ data: rows, hasRows }}>
      <div className="w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table
            className={`w-full min-w-[600px] text-sm text-gray-700 ${className}`}
          >
            {children}
          </table>
        </div>

        {isLoading && <SkeletonRows />}

        {isError && (
          <StateMessage
            action={
              onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry()}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Try again
                </button>
              )
            }
          >
            <span className="text-red-600">{errorMessage}</span>
          </StateMessage>
        )}

        {!isLoading && !isError && rows.length === 0 && (
          <StateMessage>{emptyMessage}</StateMessage>
        )}
      </div>
    </TableContext.Provider>
  );
}

function SkeletonRows({ count = 5 }) {
  return (
    <div role="status" className="divide-y divide-gray-100">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="px-4 py-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

function StateMessage({ children, action }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center text-sm text-gray-500">
      <p>{children}</p>
      {action}
    </div>
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
            className="px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase"
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

// Body with zebra striping. Rows are keyed by `id` when the data has one,
// so edits/deletes don't reshuffle React state between rows.
function Body({ renderRow }) {
  const { data, hasRows } = useContext(TableContext);
  if (!hasRows) return <tbody />;

  return (
    <tbody>
      {data.map((item, index) => (
        <tr
          key={item.id ?? index}
          className={`text-center ${
            index % 2 === 0 ? "bg-white" : "bg-gray-50"
          } transition-colors duration-150 hover:bg-blue-50`}
        >
          {renderRow(item)}
        </tr>
      ))}
    </tbody>
  );
}

Table.Header = Header;
Table.Body = Body;
