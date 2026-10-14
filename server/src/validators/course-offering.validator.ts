import { z } from 'zod';

export const listCourseOfferingsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const createCourseOfferingSchema = z.object({
  body: z.object({
    courseId: z.string().cuid(),
    classroomId: z.string().cuid(),
    semesterId: z.string().cuid(),
  }).strict(),
});

export const assignTeacherSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    teacherId: z.string().cuid().nullable(),
  }),
});
