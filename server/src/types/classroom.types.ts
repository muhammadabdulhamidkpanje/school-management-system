export interface CreateClassroomDTO {
  name: string;
  level: string;
  capacity?: number | null;
  departmentId?: string | null;
  isActive?: boolean;
}

export interface UpdateClassroomDTO {
  name?: string;
  level?: string;
  capacity?: number | null;
  departmentId?: string | null;
  isActive?: boolean;
}
