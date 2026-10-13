export interface CreateCourseDTO {
  name: string;
  code: string;
  departmentId?: string | null;
}

export interface UpdateCourseDTO {
  name?: string;
  code?: string;
  departmentId?: string | null;
}
