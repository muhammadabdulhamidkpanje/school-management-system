import api from "../../lib/api";

// GET /students?page&limit&search&status&classroomId
export async function listStudents({
  page = 1,
  limit = 10,
  search,
  status,
  classroomId,
} = {}) {
  const { data } = await api.get("/students", {
    params: {
      page,
      limit,
      search: search || undefined,
      status: status || undefined,
      classroomId: classroomId || undefined,
    },
  });
  return data.data;
}

export async function getStudent(id) {
  const { data } = await api.get(`/students/${id}`);
  return data.data;
}

export async function createStudent(payload) {
  const { data } = await api.post("/students", payload);
  return data.data;
}

export async function updateStudent(id, payload) {
  const { data } = await api.patch(`/students/${id}`, payload);
  return data.data;
}

export async function getAcademicProfile(studentId) {
  const { data } = await api.get(`/students/${studentId}/academic-profile`);
  return data.data;
}

export async function updateAcademicProfile(studentId, payload) {
  const { data } = await api.put(`/students/${studentId}/academic-profile`, payload);
  return data.data;
}

export async function exportStudents() {
  const { data } = await api.get("/students/export.csv", { responseType: "blob" });
  return data;
}

export async function importStudents(csv) {
  const { data } = await api.post("/students/import", { csv });
  return data.data;
}

export async function listClassrooms({ page = 1, limit = 100 } = {}) {
  const { data } = await api.get("/classrooms", { params: { page, limit } });
  return data.data.classrooms;
}
