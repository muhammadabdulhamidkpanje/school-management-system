import api from "../../lib/api";

// Matches faculty.route.ts / faculty.controller.ts on the backend.
// Every response is { success, message, data }, so we unwrap `.data.data`.

// GET /faculties?page&limit&search
//   -> { faculties: [{ id, name, code, _count: { departments } }],
//        pagination: { page, limit, total, totalPages } }
// `limit` max is 100. `search` must be omitted when empty: the backend
// validator rejects an empty string (min(1)), and axios drops undefined params.
export async function listFaculties({ page = 1, limit = 10, search } = {}) {
  const { data } = await api.get("/faculties", {
    params: { page, limit, search: search || undefined },
  });
  return data.data;
}

// POST /faculties  { name, code }   (409 if name or code already exists)
export async function createFaculty(payload) {
  const { data } = await api.post("/faculties", payload);
  return data.data;
}

// PATCH /faculties/:id  { name?, code? }
export async function updateFaculty(id, payload) {
  const { data } = await api.patch(`/faculties/${id}`, payload);
  return data.data;
}

// DELETE /faculties/:id  (400 if the faculty still has departments)
export async function deleteFaculty(id) {
  const { data } = await api.delete(`/faculties/${id}`);
  return data;
}
