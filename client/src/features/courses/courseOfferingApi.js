import api from "../../lib/api";

export async function listCourseOfferings({ page = 1, limit = 20 } = {}) {
  const { data } = await api.get("/course-offerings", {
    params: { page, limit },
  });
  return data.data;
}

export async function assignTeacher(offeringId, teacherId) {
  const { data } = await api.put(`/course-offerings/${offeringId}/teacher`, {
    teacherId,
  });
  return data.data;
}

export async function createCourseOffering(payload) {
  const { data } = await api.post("/course-offerings", payload);
  return data.data;
}

export async function listOfferingOptions() {
  const [coursesResponse, classroomsResponse, semestersResponse] = await Promise.all([
    api.get("/courses", { params: { page: 1, limit: 100 } }),
    api.get("/classrooms", { params: { page: 1, limit: 100 } }),
    api.get("/semesters", { params: { page: 1, limit: 100 } }),
  ]);
  const courses = coursesResponse.data?.data?.courses;
  const classrooms = classroomsResponse.data?.data?.classrooms;
  const semesters = semestersResponse.data?.data?.semesters;
  if (!Array.isArray(courses) || !Array.isArray(classrooms) || !Array.isArray(semesters)) {
    throw new Error("Course offering options response was not valid.");
  }
  return { courses, classrooms, semesters };
}
