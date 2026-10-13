import api from "../../lib/api";

// GET /students?page&limit&search
// Returns { students, pagination: { page, limit, total, totalPages } }.
export async function listStudents({ page = 1, limit = 10, search } = {}) {
  const { data } = await api.get("/students", {
    params: { page, limit, search: search || undefined },
  });
  return data.data;
}
