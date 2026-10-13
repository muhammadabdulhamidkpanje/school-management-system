import { z } from 'zod';

const examTypeEnum = z.enum(['QUIZ', 'MIDTERM', 'FINAL', 'PRACTICAL', 'ORAL', 'OTHER']);

export const examIdSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
});

export const listExamsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    courseOfferingId: z.string().cuid().optional(),
    search: z.string().trim().min(1).optional(),
  }),
});

export const createExamSchema = z.object({
  body: z.object({
    courseOfferingId: z.string().cuid(),
    title: z.string().trim().min(1).max(150),
    examType: examTypeEnum.default('FINAL'),
    date: z.coerce.date(),
    durationMinutes: z.coerce.number().int().min(1).max(600).default(60),
    totalMarks: z.coerce.number().min(1).max(1000).default(100),
    venue: z.string().trim().min(1).max(150).optional().nullable(),
    isPublished: z.boolean().optional(),
  }),
});

export const publicationSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({ published: z.boolean() }),
});

export const updateExamSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    courseOfferingId: z.string().cuid().optional(),
    title: z.string().trim().min(1).max(150).optional(),
    examType: examTypeEnum.optional(),
    date: z.coerce.date().optional(),
    durationMinutes: z.coerce.number().int().min(1).max(600).optional(),
    totalMarks: z.coerce.number().min(1).max(1000).optional(),
    venue: z.string().trim().min(1).max(150).optional().nullable(),
  }),
});
