import api from "../../lib/api";

// Matches department.route.ts / department.controller.ts on the backend.
// Every response is { success, message, data }, so we unwrap `.data.data`.

// GET /departments?page&limit&search&facultyId
//   -> { departments: [{ id, name, code, facultyId,
//                        faculty: { id, name, code } | null,
//                        _count: { subjects, classrooms } }],
//        pagination: { page, limit, total, totalPages } }
// `limit` max is 100. Empty `search` / `facultyId` must be omitted: the backend
// rejects "" (search min(1), facultyId must be a cuid). axios drops undefined.
export async function listDepartments({
  page = 1,
  limit = 10,
  search,
  facultyId,
} = {}) {
  const { data } = await api.get("/departments", {
    params: {
      page,
      limit,
      search: search || undefined,
      facultyId: facultyId || undefined,
    },
  });
  return data.data;
}

// POST /departments  { name, code, facultyId? }
//   facultyId: a faculty id, or null/omitted for "no faculty". NOT "" (400).
//   409 if the code or name already exists, 404 if the faculty doesn't exist.
export async function createDepartment(payload) {
  const { data } = await api.post("/departments", payload);
  return data.data;
}

// PATCH /departments/:id  { name?, code?, facultyId? }
//   facultyId: null detaches the faculty; omitting it leaves it unchanged.
export async function updateDepartment(id, payload) {
  const { data } = await api.patch(`/departments/${id}`, payload);
  return data.data;
}

// DELETE /departments/:id
export async function deleteDepartment(id) {
  const { data } = await api.delete(`/departments/${id}`);
  return data;
}
