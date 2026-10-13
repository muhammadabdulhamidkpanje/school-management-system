import api from "../../lib/api";

export async function listStaff({ page = 1, limit = 20, search, isActive } = {}) {
  const { data } = await api.get("/staff", {
    params: {
      page,
      limit,
      search: search || undefined,
      isActive: isActive || undefined,
    },
  });
  return data.data;
}

export async function getStaff(id) {
  const { data } = await api.get(`/staff/${id}`);
  return data.data;
}

export async function updateStaff(id, payload) {
  const { data } = await api.patch(`/staff/${id}`, payload);
  return data.data;
}

export async function deleteStaff(id) {
  const { data } = await api.delete(`/staff/${id}`);
  return data;
}

export async function exportStaff() {
  const { data } = await api.get("/staff/export.csv", { responseType: "blob" });
  return data;
}

export async function importStaff(csv) {
  const { data } = await api.post("/staff/import", { csv });
  return data.data;
}
