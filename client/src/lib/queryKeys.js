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

// Dashboard / stat-card totals (GET /<resource>?limit=1 -> pagination.total).
// Any create or delete of a counted resource should invalidate `countKeys.all`.
export const countKeys = {
  all: ["counts"],
  one: (resource, params) => ["counts", resource, params],
};
