export interface CreateSubjectDTO {
  name: string;
  code: string;
  departmentId?: string | null;
}

export interface UpdateSubjectDTO {
  name?: string;
  code?: string;
  departmentId?: string | null;
}
