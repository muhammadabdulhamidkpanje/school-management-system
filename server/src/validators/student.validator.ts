import { z } from 'zod';

const id = z.string().cuid();
const gender = z.enum(['male', 'female', 'other']);

export const studentIdSchema = z.object({ params: z.object({ id }) });
export const admissionIdSchema = z.object({ params: z.object({ id }) });

export const listStudentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().optional(),
    classroomId: id.optional(),
    status: z.enum(['ACTIVE', 'GRADUATED', 'WITHDRAWN', 'SUSPENDED']).optional(),
  }),
});

export const createStudentSchema = z.object({
  body: z.object({
    admissionNo: z.string().trim().min(1).max(50),
    firstName: z.string().trim().min(2).max(100),
    lastName: z.string().trim().min(2).max(100),
    middleName: z.string().trim().min(2).optional(),
    dob: z.coerce.date(),
    gender,
    classroomId: id.nullable().optional(),
  }),
});

export const updateStudentSchema = z.object({
  params: z.object({ id }),
  body: z.object({
    firstName: z.string().trim().min(2).max(100).optional(),
    lastName: z.string().trim().min(2).max(100).optional(),
    middleName: z.string().trim().min(2).nullable().optional(),
    dob: z.coerce.date().optional(),
    gender: gender.optional(),
    classroomId: id.nullable().optional(),
    status: z.enum(['ACTIVE', 'GRADUATED', 'WITHDRAWN', 'SUSPENDED']).optional(),
  }),
});

export const importStudentsSchema = z.object({
  body: z.object({ csv: z.string().min(1) }),
});
