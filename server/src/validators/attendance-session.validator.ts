import { z } from 'zod';

const id = z.string().cuid();
export const attendanceSessionIdSchema = z.object({ params: z.object({ id }) });

export const listAttendanceSessionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    classroomId: id.optional(),
    courseOfferingId: id.optional(),
  }),
});

export const createAttendanceSessionSchema = z.object({
  body: z.object({
    classroomId: id,
    courseOfferingId: id.nullable().optional(),
    sessionDate: z.coerce.date(),
    topic: z.string().trim().max(200).nullable().optional(),
  }),
});

export const updateAttendanceSessionSchema = z.object({
  params: z.object({ id }),
  body: z.object({
    sessionDate: z.coerce.date().optional(),
    topic: z.string().trim().max(200).nullable().optional(),
  }),
});
