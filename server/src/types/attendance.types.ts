export interface CreateAttendanceRecordDTO {
  attendanceSessionId: string;
  studentId: string;
  present: boolean;
  note?: string;
}

export interface UpdateAttendanceRecordDTO {
  present?: boolean;
  note?: string;
}

export interface MarkMultipleAttendanceDTO {
  attendanceSessionId: string;
  records: Array<{
    studentId: string;
    present: boolean;
    note?: string;
  }>;
}
