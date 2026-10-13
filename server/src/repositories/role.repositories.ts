import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const roleInclude = {
  rolePermissions: { include: { permission: true } },
} satisfies Prisma.RoleInclude;

export const listRoles = (skip: number, take: number) =>
  Promise.all([
    prisma.role.findMany({ skip, take, orderBy: { name: 'asc' }, include: roleInclude }),
    prisma.role.count(),
  ]);

export const findRoleById = (id: string) =>
  prisma.role.findUnique({ where: { id }, include: roleInclude });

export const findRoleByName = (name: string) =>
  prisma.role.findUnique({ where: { name } });

export const createRole = (data: Prisma.RoleCreateInput) =>
  prisma.role.create({ data, include: roleInclude });

export const updateRole = (id: string, data: Prisma.RoleUpdateInput) =>
  prisma.role.update({ where: { id }, data, include: roleInclude });

export const countRoleUsers = (roleId: string) =>
  prisma.user.count({ where: { roleId } });

export const deleteRole = (id: string) =>
  prisma.role.delete({ where: { id } });

export const createAuditLog = (data: {
  action: string;
  userId: string;
  recordId?: string;
  ipAddress?: string;
}) => prisma.auditLog.create({ data });
