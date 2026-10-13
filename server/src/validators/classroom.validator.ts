import { z } from 'zod';

export const classroomIdSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
});

export const listClassroomsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).optional(),
    departmentId: z.string().cuid().optional(),
    level: z.string().trim().min(1).optional(),
  }),
});

const classroomFields = {
  name: z.string().trim().min(1).max(100),
  level: z.string().trim().min(1).max(50),
  capacity: z.coerce.number().int().positive().nullable(),
  departmentId: z.string().cuid().nullable(),
};

export const createClassroomSchema = z.object({
  body: z.object({
    name: classroomFields.name,
    level: classroomFields.level,
    capacity: classroomFields.capacity.optional(),
    departmentId: classroomFields.departmentId.optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateClassroomSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    name: classroomFields.name.optional(),
    level: classroomFields.level.optional(),
    capacity: classroomFields.capacity.optional(),
    departmentId: classroomFields.departmentId.optional(),
    isActive: z.boolean().optional(),
  }),
});
