import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const permissionInclude = {
  rolePermissions: { include: { role: true } },
} satisfies Prisma.PermissionInclude;

export const listPermissions = (skip: number, take: number) =>
  Promise.all([
    prisma.permission.findMany({ skip, take, orderBy: { name: 'asc' }, include: permissionInclude }),
    prisma.permission.count(),
  ]);

export const findPermissionById = (id: string) =>
  prisma.permission.findUnique({ where: { id }, include: permissionInclude });

export const findPermissionByName = (name: string) =>
  prisma.permission.findUnique({ where: { name } });

export const createPermission = (data: Prisma.PermissionCreateInput) =>
  prisma.permission.create({ data, include: permissionInclude });

export const updatePermission = (id: string, data: Prisma.PermissionUpdateInput) =>
  prisma.permission.update({ where: { id }, data, include: permissionInclude });

export const deletePermission = (id: string) =>
  prisma.permission.delete({ where: { id } });

export const findPermissionsByIds = (ids: string[]) =>
  prisma.permission.findMany({ where: { id: { in: ids } } });

export const replaceRolePermissions = (roleId: string, permissionIds: string[]) =>
  prisma.$transaction(async transaction => {
    await transaction.rolePermission.deleteMany({ where: { roleId } });
    if (permissionIds.length > 0) {
      await transaction.rolePermission.createMany({
        data: permissionIds.map(permissionId => ({ roleId, permissionId })),
      });
    }
    return transaction.role.findUnique({
      where: { id: roleId },
      include: { rolePermissions: { include: { permission: true } } },
    });
  });

export const createAuditLog = (data: {
  action: string;
  userId: string;
  recordId?: string;
  ipAddress?: string;
}) => prisma.auditLog.create({ data });
