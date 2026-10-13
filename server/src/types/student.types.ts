export interface CreateStudentDTO {
  admissionNo: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dob: string;
  gender: string;
  classroomId?: string | null;
}

export interface UpdateStudentDTO {
  firstName?: string;
  lastName?: string;
  middleName?: string | null;
  dob?: string;
  gender?: string;
  classroomId?: string | null;
  status?: 'ACTIVE' | 'GRADUATED' | 'WITHDRAWN' | 'SUSPENDED';
}
