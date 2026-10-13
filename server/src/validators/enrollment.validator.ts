import { z } from 'zod';

const id = z.string().cuid();
const status = z.enum(['ACTIVE', 'COMPLETED', 'WITHDRAWN']);

export const enrollmentIdSchema = z.object({ params: z.object({ id }) });

export const listEnrollmentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    studentId: id.optional(),
    classroomId: id.optional(),
    sessionId: id.optional(),
    semesterId: id.optional(),
    status: status.optional(),
  }),
});

export const createEnrollmentSchema = z.object({
  body: z.object({
    studentId: id,
    classroomId: id,
    sessionId: id,
    semesterId: id.nullable().optional(),
    status: status.optional(),
  }),
});

export const updateEnrollmentSchema = z.object({
  params: z.object({ id }),
  body: z.object({
    classroomId: id.optional(),
    semesterId: id.nullable().optional(),
    status: status.optional(),
  }),
});
