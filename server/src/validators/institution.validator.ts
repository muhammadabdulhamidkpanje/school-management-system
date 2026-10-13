import { z } from 'zod';

const nullableText = (max: number) =>
  z.union([z.string().trim().max(max), z.literal(''), z.null()]).optional();

export const updateInstitutionProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(150),
    email: z.union([z.string().trim().email().max(254), z.literal(''), z.null()]).optional(),
    address: nullableText(500),
    phone: nullableText(50),
    logoUrl: z.union([z.string().url().max(2048), z.literal(''), z.null()]).optional(),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
  }),
});
