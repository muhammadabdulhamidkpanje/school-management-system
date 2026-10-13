import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const userInclude = {
  role: true,
  profile: true,
} satisfies Prisma.UserInclude;

export const listUsers = (skip: number, take: number) =>
  Promise.all([
    prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: userInclude,
    }),
    prisma.user.count(),
  ]);

export const findUserById = (id: string) =>
  prisma.user.findUnique({ where: { id }, include: userInclude });

export const findUserByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email } });

export const findRoleByName = (name: string) =>
  prisma.role.findUnique({ where: { name } });

export const createUser = (data: Prisma.UserCreateInput) =>
  prisma.user.create({ data, include: userInclude });

export const updateUser = (id: string, data: Prisma.UserUpdateInput) =>
  prisma.user.update({ where: { id }, data, include: userInclude });

export const deleteUser = (id: string) =>
  prisma.user.delete({ where: { id } });

export const updateProfile = (
  userId: string,
  data: Prisma.UserProfileUpdateInput,
) => prisma.userProfile.update({ where: { userId }, data });

export const createAuditLog = (data: {
  action: string;
  userId: string;
  recordId?: string;
  ipAddress?: string;
}) => prisma.auditLog.create({ data });
