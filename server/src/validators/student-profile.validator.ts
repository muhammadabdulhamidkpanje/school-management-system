import { z } from 'zod';

export const studentProfileIdSchema = z.object({
  params: z.object({ studentId: z.string().cuid() }),
});

export const updateStudentProfileSchema = z.object({
  params: z.object({ studentId: z.string().cuid() }),
  body: z.object({
    currentLevel: z.string().trim().min(1).max(50).nullable().optional(),
    admissionYear: z.coerce.number().int().min(1900).max(2200).nullable().optional(),
    previousSchool: z.string().trim().max(200).nullable().optional(),
    notes: z.string().trim().max(2000).nullable().optional(),
  }),
});
