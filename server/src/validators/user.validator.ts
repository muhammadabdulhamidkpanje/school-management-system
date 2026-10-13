import { z } from 'zod';

const passwordRule = z
  .string()
  .min(8, 'Minimum 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[0-9]/, 'Must contain a number')
  .regex(/[!@#$%]/, 'Must contain special character');

const profileFields = {
  firstName: z.string().min(2).optional(),
  middleName: z.string().min(2).nullable().optional(),
  lastName: z.string().min(2).optional(),
  gender: z.enum(['male', 'female', 'other']).nullable().optional(),
  phone: z.coerce.string().nullable().optional(),
  profileImage: z.string().url().nullable().optional(),
};

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const userIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: passwordRule,
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    middleName: z.string().min(2).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    phone: z.coerce.string().optional(),
    roleName: z.string().min(1),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    email: z.string().email().optional(),
    ...profileFields,
    roleName: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
    isVerified: z.boolean().optional(),
  }),
});
