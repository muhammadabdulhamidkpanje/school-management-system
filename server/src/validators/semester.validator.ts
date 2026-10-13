import { z } from 'zod';

export const semesterIdSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
});

export const listSemestersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sessionId: z.string().cuid().optional(),
    search: z.string().trim().min(1).optional(),
    isCurrent: z.coerce.boolean().optional(),
  }),
});

const semesterDate = z.coerce.date();

export const createSemesterSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(50),
    sessionId: z.string().cuid(),
    startDate: semesterDate,
    endDate: semesterDate,
    isCurrent: z.boolean().optional(),
  }),
});

export const updateSemesterSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    name: z.string().trim().min(1).max(50).optional(),
    sessionId: z.string().cuid().optional(),
    startDate: semesterDate.optional(),
    endDate: semesterDate.optional(),
    isCurrent: z.boolean().optional(),
  }),
});
