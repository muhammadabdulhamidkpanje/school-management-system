export interface CreateEnrollmentDTO {
  studentId: string;
  classroomId: string;
  sessionId: string;
  semesterId?: string | null;
  status?: 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN';
}

export interface UpdateEnrollmentDTO {
  classroomId?: string;
  semesterId?: string | null;
  status?: 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN';
}
