// One place for query keys so features can invalidate each other's data
// without importing each other (no circular imports).
//
// Why they need to: the faculty list shows each faculty's department COUNT and
// the department list shows each department's faculty NAME, so a change on
// either side makes the other list stale.

export const facultyKeys = {
  all: ["faculties"],
  list: (params) => ["faculties", "list", params],
};

export const departmentKeys = {
  all: ["departments"],
  list: (params) => ["departments", "list", params],
};

export const sessionKeys = {
  all: ["sessions"],
  list: (params) => ["sessions", "list", params],
};

export const semesterKeys = {
  all: ["semesters"],
  list: (params) => ["semesters", "list", params],
};

export const institutionProfileKeys = {
  all: ["institution-profile"],
};

export const gradingSystemKeys = {
  all: ["grading-systems"],
};

export const academicCalendarKeys = {
  all: ["academic-calendars"],
  list: (params) => ["academic-calendars", "list", params],
};

export const courseKeys = {
  all: ["courses"],
  list: (params) => ["courses", "list", params],
  detail: (id) => ["courses", "detail", id],
};

export const courseOfferingKeys = {
  all: ["course-offerings"],
  list: (params) => ["course-offerings", "list", params],
};

export const studentKeys = {
  all: ["students"],
  list: (params) => ["students", "list", params],
  detail: (id) => ["students", "detail", id],
  academicProfile: (id) => ["students", "academic-profile", id],
  classrooms: ["classrooms", "student-options"],
};

export const staffKeys = {
  all: ["staff"],
  list: (params) => ["staff", "list", params],
  detail: (id) => ["staff", "detail", id],
};

// Dashboard / stat-card totals (GET /<resource>?limit=1 -> pagination.total).
// Any create or delete of a counted resource should invalidate `countKeys.all`.
export const countKeys = {
  all: ["counts"],
  one: (resource, params) => ["counts", resource, params],
};
