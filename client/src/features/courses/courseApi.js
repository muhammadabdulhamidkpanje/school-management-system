import api from "../../lib/api";

export async function listCourses({ page = 1, limit = 10, search, departmentId } = {}) {
  const { data } = await api.get("/courses", {
    params: {
      page,
      limit,
      search: search || undefined,
      departmentId: departmentId || undefined,
    },
  });
  return data.data;
}

export async function createCourse(payload) {
  const { data } = await api.post("/courses", payload);
  return data.data;
}

export async function updateCourse(id, payload) {
  const { data } = await api.patch(`/courses/${id}`, payload);
  return data.data;
}

export async function deleteCourse(id) {
  const { data } = await api.delete(`/courses/${id}`);
  return data;
}
