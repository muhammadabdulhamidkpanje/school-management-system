import { z } from 'zod';

export const assignTeacherSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    teacherId: z.string().cuid().nullable(),
  }),
});
