import React from "react";
import { useCount } from "./useCount";

/**
 * Drop-in for a hardcoded number on a stat card.
 *
 *   { value: <Count resource="faculties" />, description: "Faculties" }
 *   { value: <Count resource="students" params={{ status: "ACTIVE" }} />, ... }
 *
 * Loading shows a pulse, an error shows a dash you can click to retry
 * (e.g. the admin role lacks that resource's read permission -> 403).
 */
export default function Count({ resource, params }) {
  const { data, isLoading, isError, refetch } = useCount(resource, params);

  if (isLoading) {
    return (
      <span
        role="status"
        aria-label="Loading"
        className="inline-block h-9 w-16 animate-pulse rounded bg-gray-200 align-middle"
      />
    );
  }

  if (isError) {
    return (
      <button
        type="button"
        onClick={() => refetch()}
        title="Couldn't load this number. Click to retry."
        className="text-gray-400 transition hover:text-blue-500"
      >
        —
      </button>
    );
  }

  return <span>{data.toLocaleString()}</span>;
}
