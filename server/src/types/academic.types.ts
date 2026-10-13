export interface AcademicListQuery {
  page: number;
  limit: number;
  search?: string;
  facultyId?: string;
  departmentId?: string;
  sessionId?: string;
  isCurrent?: boolean;
  level?: string;
}
