export interface AttendanceRecordDto {
  id?: string;
  attendanceSessionId: string;
  studentId: string;
  present: boolean;
  note?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AttendanceSessionDto {
  id?: string;
  classroomId: string;
  courseOfferingId?: string | null;
  sessionDate: Date;
  topic?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Keep legacy interface for backwards compatibility
export interface AttendanceDto {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
