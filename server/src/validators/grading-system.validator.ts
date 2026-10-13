import { z } from 'zod';

export const gradingSystemIdSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
});

const gradesSchema = z.array(z.object({
  grade: z.string().trim().min(1).max(10),
  minScore: z.number().min(0).max(100),
  maxScore: z.number().min(0).max(100),
  remark: z.string().trim().max(100).optional(),
})).min(1).max(30).refine(
  grades => grades.every(grade => grade.minScore <= grade.maxScore),
  'Each grade minimum score must be less than or equal to its maximum score',
);

export const createGradingSystemSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(100),
    grades: gradesSchema,
  }),
});

export const updateGradingSystemSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    name: z.string().trim().min(1).max(100).optional(),
    grades: gradesSchema.optional(),
  }),
});
