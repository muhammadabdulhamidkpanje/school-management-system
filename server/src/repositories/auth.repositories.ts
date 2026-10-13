import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

// ── User ────────────────────────────────────────
export const findUserByEmail = (email: string) =>
  prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
      role: {
        include: { rolePermissions: { include: { permission: true } } },
      },
    },
  });

export const findUserById = (id: string) =>
  prisma.user.findUnique({
    where: { id },
    include: {
      role: {
        include: { rolePermissions: { include: { permission: true } } },
      },
      profile: true,
    },
  });

export const createUser = (data: Prisma.UserCreateInput) =>
  prisma.user.create({
    data,
    include: { role: true, profile: true },
  });

export const updateUser = (id: string, data: Prisma.UserUpdateInput) =>
  prisma.user.update({ where: { id }, data });

export const updateUserProfile = (
  userId: string,
  data: Prisma.UserProfileUpdateInput,
) => prisma.userProfile.update({ where: { userId }, data });

export const updateLastLogin = (id: string) =>
  prisma.user.update({
    where: { id },
    data:  { lastLogin: new Date() },
  });

// ── Role ────────────────────────────────────────
export const findRoleByName = (name: string) =>
  prisma.role.findUnique({ where: { name } });

// ── Refresh Token ────────────────────────────────
export const createRefreshToken = (data: {
  token:     string;
  userId:    string;
  expiresAt: Date;
}) => prisma.refreshToken.create({ data });

export const findRefreshToken = (token: string) =>
  prisma.refreshToken.findFirst({
    where: { token, revoked: false },
    include: { user: {
      include: {
        role: {
          include: { rolePermissions: { include: { permission: true } } },
        },
      },
    }},
  });

export const revokeRefreshToken = (id: string) =>
  prisma.refreshToken.update({
    where: { id },
    data:  { revoked: true },
  });

export const revokeAllUserTokens = (userId: string) =>
  prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data:  { revoked: true },
  });

// ── Password Reset ───────────────────────────────
export const createPasswordReset = (data: {
  token:     string;
  userId:    string;
  expiresAt: Date;
}) => prisma.passwordReset.create({ data });

export const claimPasswordReset = async (token: string, now = new Date()) => {
  const reset = await prisma.passwordReset.findFirst({
    where: { token, used: false, expiresAt: { gt: now } },
  });

  if (!reset) return null;

  const claimed = await prisma.passwordReset.updateMany({
    where: { id: reset.id, used: false, expiresAt: { gt: now } },
    data:  { used: true },
  });

  return claimed.count === 1 ? reset : null;
};

// ── Audit Log ────────────────────────────────────
export const createAuditLog = (data: {
  action:    string;
  userId:    string;
  tableName?: string;
  recordId?:  string;
  ipAddress?: string;
}) => prisma.auditLog.create({ data });