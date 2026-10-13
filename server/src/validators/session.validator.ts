import { z } from 'zod';

export const sessionIdSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
});

export const listSessionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).optional(),
    isCurrent: z.coerce.boolean().optional(),
  }),
});

const sessionFields = {
  name: z.string().trim().min(1).max(50),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isCurrent: z.boolean(),
};

const requiredAdmissionSubjects = z.array(z.string().trim().min(1).max(100))
  .min(1)
  .max(20)
  .refine(
    subjects => new Set(subjects.map(subject => subject.toLocaleLowerCase())).size === subjects.length,
    'Required admission subjects must be unique',
  );

export const createSessionSchema = z.object({
  body: z.object({
    name: sessionFields.name,
    startDate: sessionFields.startDate,
    endDate: sessionFields.endDate,
    isCurrent: sessionFields.isCurrent.optional(),
    admissionsOpen: z.boolean().optional(),
    availableClassroomIds: z.array(z.string().cuid()).max(100).optional(),
    requiredAdmissionSubjects: requiredAdmissionSubjects.optional(),
  }),
});

export const updateSessionSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    name: sessionFields.name.optional(),
    startDate: sessionFields.startDate.optional(),
    endDate: sessionFields.endDate.optional(),
    isCurrent: sessionFields.isCurrent.optional(),
    admissionsOpen: z.boolean().optional(),
    availableClassroomIds: z.array(z.string().cuid()).max(100).optional(),
    requiredAdmissionSubjects: requiredAdmissionSubjects.optional(),
  }),
});
