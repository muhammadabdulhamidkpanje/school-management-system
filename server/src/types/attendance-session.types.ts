export interface CreateAttendanceSessionDTO {
  classroomId: string;
  courseOfferingId?: string | null;
  sessionDate: string;
  topic?: string | null;
}

export interface UpdateAttendanceSessionDTO {
  sessionDate?: string;
  topic?: string | null;
}
