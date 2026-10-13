import { z } from 'zod';

const id = z.string().cuid();
const booleanStr = z.union([z.boolean(), z.enum(['true', 'false']).transform(v => v === 'true')]);

export const attendanceRecordIdSchema = z.object({
  params: z.object({ id }),
});

export const listAttendanceRecordsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    attendanceSessionId: id,
    studentId: id.optional(),
    present: booleanStr.optional(),
  }),
});

export const getSessionAttendanceSchema = z.object({
  params: z.object({ sessionId: id }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const createAttendanceRecordSchema = z.object({
  params: z.object({ sessionId: id }),
  body: z.object({
    studentId: id,
    present: z.boolean(),
    note: z.string().trim().max(500).nullable().optional(),
  }),
});

export const updateAttendanceRecordSchema = z.object({
  params: z.object({ sessionId: id, recordId: id }),
  body: z.object({
    present: z.boolean().optional(),
    note: z.string().trim().max(500).nullable().optional(),
  }),
});

export const markMultipleAttendanceSchema = z.object({
  params: z.object({ sessionId: id }),
  body: z.object({
    records: z.array(
      z.object({
        studentId: id,
        present: z.boolean(),
        note: z.string().trim().max(500).nullable().optional(),
      })
    ).min(1).max(500),
  }),
});

export const deleteAttendanceRecordSchema = z.object({
  params: z.object({ sessionId: id, recordId: id }),
});

export const checkDuplicatesSchema = z.object({
  params: z.object({ sessionId: id }),
  body: z.object({
    studentIds: z.array(id).min(1).max(500),
  }),
});

export const studentAttendanceHistorySchema = z.object({
  params: z.object({ studentId: id }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    classroomId: id.optional(),
    courseOfferingId: id.optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }),
});

export const studentAttendanceSummarySchema = z.object({
  params: z.object({ studentId: id }),
  query: z.object({
    classroomId: id.optional(),
    courseOfferingId: id.optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }),
});

export const classroomAttendanceSummarySchema = z.object({
  params: z.object({ classroomId: id }),
  query: z.object({
    sessionId: id.optional(),
  }),
});

export const courseOfferingAttendanceSummarySchema = z.object({
  params: z.object({ courseOfferingId: id }),
  query: z.object({
    sessionId: id.optional(),
  }),
});

// Advanced reporting and filtering
export const attendanceReportSchema = z.object({
  query: z.object({
    reportType: z.enum(['classroom', 'course', 'student', 'summary']).default('summary'),
    classroomId: id.optional(),
    courseOfferingId: id.optional(),
    studentId: id.optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    present: booleanStr.optional(),
    sortBy: z.enum(['date', 'student', 'attendance']).default('date'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(500).default(100),
  }),
});

export const attendanceStatisticsSchema = z.object({
  query: z.object({
    classroomId: id.optional(),
    courseOfferingId: id.optional(),
    studentId: id.optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }),
});

export const advancedFilterSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    classroomId: id.optional(),
    courseOfferingId: id.optional(),
    studentId: id.optional(),
    sessionId: id.optional(),
    present: booleanStr.optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    minAttendancePercentage: z.coerce.number().min(0).max(100).optional(),
    maxAttendancePercentage: z.coerce.number().min(0).max(100).optional(),
  }),
});
