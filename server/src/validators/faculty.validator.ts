import { z } from 'zod';

export const facultyIdSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
});

export const listFacultiesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).optional(),
  }),
});

export const createFacultySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(150),
    code: z.string().trim().min(1).max(50),
  }),
});

export const updateFacultySchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    name: z.string().trim().min(1).max(150).optional(),
    code: z.string().trim().min(1).max(50).optional(),
  }),
});
