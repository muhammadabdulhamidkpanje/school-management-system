import { z } from 'zod';

const passwordRule = z
  .string()
  .min(8,           'Minimum 8 characters')
  .regex(/[A-Z]/,   'Must contain uppercase letter')
  .regex(/[0-9]/,   'Must contain a number')
  .regex(/[!@#$%]/, 'Must contain special character');

export const registerSchema = z.object({
  body: z.object({
    email:       z.string().email('Invalid email'),
    password:    passwordRule,
    firstName:   z.string().min(2),
    lastName:    z.string().min(2),
    middleName:  z.string().optional(),
    gender:      z.enum(['male', 'female', 'other']).optional(),
    phone:       z.coerce.string().optional(),
    roleName:    z.string().min(1, 'Role is required'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email:    z.string().email(),
    password: z.string().min(1),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token:    z.string().min(1),
    password: passwordRule,
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword:     passwordRule,
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    firstName:    z.string().min(2).optional(),
    middleName:   z.string().min(2).nullable().optional(),
    lastName:     z.string().min(2).optional(),
    gender:       z.enum(['male', 'female', 'other']).nullable().optional(),
    phone:        z.coerce.string().nullable().optional(),
    profileImage: z.string().url().nullable().optional(),
  }).refine(body => Object.keys(body).length > 0, {
    message: 'At least one profile field is required',
  }),
});