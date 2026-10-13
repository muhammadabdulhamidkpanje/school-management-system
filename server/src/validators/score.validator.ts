import { z } from 'zod';

const scoreTarget = z.object({
  studentId: z.string().cuid(),
  assessmentId: z.string().cuid().optional(),
  examId: z.string().cuid().optional(),
  marks: z.coerce.number().finite().min(0),
  remarks: z.string().trim().max(500).optional().nullable(),
}).refine((value) => Boolean(value.assessmentId) !== Boolean(value.examId), {
  message: 'Provide exactly one of assessmentId or examId',
  path: ['assessmentId'],
});

export const scoreIdSchema = z.object({ params: z.object({ id: z.string().cuid() }) });
export const reportCardSchema = z.object({ params: z.object({ studentId: z.string().cuid() }) });
export const listScoresSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    studentId: z.string().cuid().optional(),
    assessmentId: z.string().cuid().optional(),
    examId: z.string().cuid().optional(),
  }),
});
export const createScoreSchema = z.object({ body: scoreTarget });
export const updateScoreSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    marks: z.coerce.number().finite().min(0).optional(),
    remarks: z.string().trim().max(500).optional().nullable(),
  }),
});