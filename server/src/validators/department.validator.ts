import { z } from 'zod';

export const departmentIdSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
});

export const listDepartmentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).optional(),
    facultyId: z.string().cuid().optional(),
  }),
});

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(150),
    code: z.string().trim().min(1).max(50),
    facultyId: z.string().cuid().nullable().optional(),
  }),
});

export const updateDepartmentSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    name: z.string().trim().min(1).max(150).optional(),
    code: z.string().trim().min(1).max(50).optional(),
    facultyId: z.string().cuid().nullable().optional(),
  }),
});
