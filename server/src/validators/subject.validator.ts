import { z } from 'zod';

export const subjectIdSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
});

export const listSubjectsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).optional(),
    departmentId: z.string().cuid().optional(),
  }),
});

export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(150),
    code: z.string().trim().min(1).max(50),
    departmentId: z.string().cuid().nullable().optional(),
  }),
});

export const updateSubjectSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    name: z.string().trim().min(1).max(150).optional(),
    code: z.string().trim().min(1).max(50).optional(),
    departmentId: z.string().cuid().nullable().optional(),
  }),
});

export const assignSubjectSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    departmentId: z.string().cuid().nullable(),
    facultyId: z.string().cuid().optional(),
  }),
});
