export interface CreateDepartmentDTO {
  name: string;
  code: string;
  facultyId?: string | null;
}

export interface UpdateDepartmentDTO {
  name?: string;
  code?: string;
  facultyId?: string | null;
}
