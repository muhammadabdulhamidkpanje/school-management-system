import api from "../../lib/api";

export async function listSessions(params = {}) {
  const { data } = await api.get("/sessions", { params });
  return data.data;
}

export async function createSession(payload) {
  const { data } = await api.post("/sessions", payload);
  return data.data;
}

export async function updateSession(id, payload) {
  const { data } = await api.patch(`/sessions/${id}`, payload);
  return data.data;
}

export async function deleteSession(id) {
  const { data } = await api.delete(`/sessions/${id}`);
  return data;
}

export async function listSemesters(params = {}) {
  const { data } = await api.get("/semesters", { params });
  return data.data;
}

export async function createSemester(payload) {
  const { data } = await api.post("/semesters", payload);
  return data.data;
}

export async function updateSemester(id, payload) {
  const { data } = await api.patch(`/semesters/${id}`, payload);
  return data.data;
}

export async function deleteSemester(id) {
  const { data } = await api.delete(`/semesters/${id}`);
  return data;
}

export async function getInstitutionProfile() {
  const { data } = await api.get("/institution-profile");
  return data.data;
}

export async function updateInstitutionProfile(payload) {
  const { data } = await api.put("/institution-profile", payload);
  return data.data;
}

export async function listGradingSystems() {
  const { data } = await api.get("/grading-systems");
  return data.data;
}

export async function createGradingSystem(payload) {
  const { data } = await api.post("/grading-systems", payload);
  return data.data;
}

export async function updateGradingSystem(id, payload) {
  const { data } = await api.patch(`/grading-systems/${id}`, payload);
  return data.data;
}

export async function deleteGradingSystem(id) {
  const { data } = await api.delete(`/grading-systems/${id}`);
  return data;
}

export async function listAcademicCalendars(params = {}) {
  const { data } = await api.get("/academic-calendars", { params });
  return data.data;
}

export async function createAcademicCalendar(payload) {
  const { data } = await api.post("/academic-calendars", payload);
  return data.data;
}

export async function updateAcademicCalendar(id, payload) {
  const { data } = await api.patch(`/academic-calendars/${id}`, payload);
  return data.data;
}

export async function deleteAcademicCalendar(id) {
  const { data } = await api.delete(`/academic-calendars/${id}`);
  return data;
}
