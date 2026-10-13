import { z } from 'zod';

export const permissionIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const listPermissionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const createPermissionSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(150),
    description: z.string().trim().max(500).optional(),
  }),
});

export const updatePermissionSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(500).nullable().optional(),
  }),
});

export const assignPermissionsSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    permissionIds: z.array(z.string().uuid()),
  }),
});
