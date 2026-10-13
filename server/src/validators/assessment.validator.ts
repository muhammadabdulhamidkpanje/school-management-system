import { z } from 'zod';

const assessmentTypeEnum = z.enum(['TEST', 'QUIZ', 'ASSIGNMENT', 'PROJECT', 'EXAM', 'PRESENTATION', 'OTHER']);

export const assessmentIdSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
});

export const listAssessmentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    courseOfferingId: z.string().cuid().optional(),
    search: z.string().trim().min(1).optional(),
  }),
});

export const createAssessmentSchema = z.object({
  body: z.object({
    courseOfferingId: z.string().cuid(),
    title: z.string().trim().min(1).max(150),
    type: assessmentTypeEnum.default('TEST'),
    weight: z.coerce.number().min(0).max(100).default(0),
    maxMarks: z.coerce.number().min(1).max(1000).default(100),
    dueDate: z.coerce.date().optional().nullable(),
  }),
});

export const updateAssessmentSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    courseOfferingId: z.string().cuid().optional(),
    title: z.string().trim().min(1).max(150).optional(),
    type: assessmentTypeEnum.optional(),
    weight: z.coerce.number().min(0).max(100).optional(),
    maxMarks: z.coerce.number().min(1).max(1000).optional(),
    dueDate: z.coerce.date().optional().nullable(),
    isPublished: z.boolean().optional(),
  }),
});

export const publicationSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({ published: z.boolean() }),
});
