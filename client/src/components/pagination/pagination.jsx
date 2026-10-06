import React from "react";

const btn =
  "rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Feed it the `pagination` object the backend returns:
 *   { page, limit, total, totalPages }
 */
export default function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  className = "",
}) {
  if (!total) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-col items-center justify-between gap-3 py-3 text-sm text-gray-600 sm:flex-row ${className}`}
    >
      <p>
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={btn}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </button>
        <span aria-live="polite">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className={btn}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
