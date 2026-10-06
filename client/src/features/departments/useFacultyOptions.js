import { useMemo } from "react";
import { useFaculties } from "../faculties";

// Same params as the Departments list's filter dropdown, so both share one
// cached request. (The backend caps `limit` at 100.)
export const FACULTY_OPTIONS_PARAMS = { page: 1, limit: 100 };

export function useFacultyOptions() {
  const query = useFaculties(FACULTY_OPTIONS_PARAMS);
  const options = useMemo(
    () =>
      (query.data?.faculties ?? []).map((f) => ({
        value: f.id,
        label: `${f.name} (${f.code})`,
      })),
    [query.data],
  );
  return { ...query, options };
}
