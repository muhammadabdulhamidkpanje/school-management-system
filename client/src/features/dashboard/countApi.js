import api from "../../lib/api";

// There is no /stats endpoint on the backend. Every list endpoint already
// returns `pagination.total` for the current filter, so asking for one row
// (limit=1) is the cheapest way to get a count.
const COUNTABLE = new Set([
  "students",
  "staff",
  "faculties",
  "departments",
  "courses",
  "classrooms",
  "subjects",
  "sessions",
  "semesters",
  "enrollments",
]);

/**
 * getCount("students")                        -> all students
 * getCount("students", { status: "ACTIVE" })  -> only active ones
 * getCount("staff", { isActive: "true" })     -> note: staff filter is a string
 *
 * `params` must be filters the backend's list schema accepts, otherwise the
 * request is a 400 (e.g. students: status | classroomId | search).
 */
export async function getCount(resource, params = {}) {
  if (!COUNTABLE.has(resource)) {
    throw new Error(`getCount: "${resource}" is not a countable resource`);
  }
  const { data } = await api.get(`/${resource}`, {
    params: { ...params, page: 1, limit: 1 },
  });
  return data.data.pagination.total;
}
