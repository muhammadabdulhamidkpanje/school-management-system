import crypto from 'crypto';
import * as AuthRepo from '../repositories/auth.repositories.js';
import * as EmailService from './email.service.js';
import * as AuthUtils from '../utils/hash.js';
import * as JwtUtils from '../utils/jwt.js';
import type {
  RegisterDTO, LoginDTO,
  ForgotPasswordDTO, ResetPasswordDTO,
  ChangePasswordDTO, UpdateProfileDTO,
} from '../types/auth.types.js';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
} from '../errors/errors.js';

const MAX_FAILED_LOGINS = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;
const failedLogins = new Map<string, { attempts: number; lockedUntil?: number }>();

const loginKey = (email: string) => email.trim().toLowerCase();

const assertLoginNotLocked = (email: string) => {
  const key = loginKey(email);
  const record = failedLogins.get(key);
  if (record?.lockedUntil && record.lockedUntil > Date.now()) {
    throw new TooManyRequestsError('Account temporarily locked. Please try again later');
  }
  if (record?.lockedUntil) failedLogins.delete(key);
};

const recordFailedLogin = (email: string) => {
  const key = loginKey(email);
  const record = failedLogins.get(key) ?? { attempts: 0 };
  record.attempts += 1;
  if (record.attempts >= MAX_FAILED_LOGINS) record.lockedUntil = Date.now() + LOGIN_LOCKOUT_MS;
  failedLogins.set(key, record);
};

const clearFailedLogins = (email: string) => failedLogins.delete(loginKey(email));

// ── REGISTER ────────────────────────────────────
export const register = async (dto: RegisterDTO, ipAddress?: string) => {
  // Check duplicate email
  const existing = await AuthRepo.findUserByEmail(dto.email);
  if (existing) throw new ConflictError('Email already registered');

  // Validate role exists
  const role = await AuthRepo.findRoleByName(dto.roleName);
  if (!role) throw new NotFoundError(`Role '${dto.roleName}'`);

  // Hash password
  const passwordHash = await AuthUtils.hashPassword(dto.password);

  // Create user + profile atomically
  const user = await AuthRepo.createUser({
    email:        dto.email,
    passwordHash,
    role:         { connect: { id: role.id } },
    profile: {
      create: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        ...(dto.middleName !== undefined && { middleName: dto.middleName }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
    },
  });

  await EmailService.sendVerificationEmail({
    id: user.id,
    email: user.email,
    firstName: user.profile?.firstName ?? user.email.split('@')[0] ?? user.email,
  });

  // Audit log
  await AuthRepo.createAuditLog({
    action:    'USER_REGISTERED',
    userId:    user.id,
    tableName: 'User',
    recordId:  user.id,
    ...(ipAddress && { ipAddress }),
  });

  return sanitizeUser(user);
};

// ── LOGIN ────────────────────────────────────────
export const login = async (dto: LoginDTO, ipAddress?: string) => {
  assertLoginNotLocked(dto.email);

  // Find user with role + permissions
  const user = await AuthRepo.findUserByEmail(dto.email);
  if (!user) {
    recordFailedLogin(dto.email);
    throw new UnauthorizedError('Invalid email or password');
  }

  // Check active
  if (!user.isActive) throw new UnauthorizedError('Account is deactivated');
  if (!user.isVerified) throw new UnauthorizedError('Email address is not verified');

  // Verify password
  const valid = await AuthUtils.comparePassword(dto.password, user.passwordHash);
  if (!valid) {
    recordFailedLogin(dto.email);
    throw new UnauthorizedError('Invalid email or password');
  }

  clearFailedLogins(dto.email);

  // Extract permissions
  const permissions = user.role.rolePermissions.map(rp => rp.permission.name);

  // Generate tokens
  const payload = { sub: user.id, email: user.email, role: user.role.name, permissions };
  const { accessToken, refreshToken, refreshExpiry } = JwtUtils.generateTokens(payload);

  // Save refresh token
  await AuthRepo.createRefreshToken({
    token:     refreshToken,
    userId:    user.id,
    expiresAt: refreshExpiry,
  });

  // Update last login
  await AuthRepo.updateLastLogin(user.id);

  // Audit log
  await AuthRepo.createAuditLog({
    action: 'USER_LOGIN',
    userId: user.id,
    ...(ipAddress !== undefined && { ipAddress }),
  });

  return {
    accessToken,
    refreshToken,
    
    user: {
      id:         user.id,
      email:      user.email,
      isActive:   user.isActive,
      isVerified: user.isVerified,
      profile: user.profile ? {
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      phone: user.profile.phone,
    } : null,
      role: {
        id:   user.role.id,
        name: user.role.name,
      },
    },
    
  };
};

// ── REFRESH TOKEN ────────────────────────────────
export const refreshTokens = async (token: string) => {
  const stored = await AuthRepo.findRefreshToken(token);
  if (!stored)             throw new UnauthorizedError('Invalid refresh token');
  if (stored.expiresAt < new Date()) {
    await AuthRepo.revokeRefreshToken(stored.id);
    throw new UnauthorizedError('Refresh token expired');
  }

  const user        = stored.user;
  if (!user.isActive) throw new UnauthorizedError('Account is deactivated');
  if (!user.isVerified) throw new UnauthorizedError('Email address is not verified');
  const permissions = user.role.rolePermissions.map(rp => rp.permission.name);

  // Rotate — revoke old, issue new
  await AuthRepo.revokeRefreshToken(stored.id);

  const payload = { sub: user.id, email: user.email, role: user.role.name, permissions };
  const { accessToken, refreshToken: newRefreshToken, refreshExpiry } =
    JwtUtils.generateTokens(payload);

  await AuthRepo.createRefreshToken({
    token:     newRefreshToken,
    userId:    user.id,
    expiresAt: refreshExpiry,
  });

  return { accessToken, refreshToken: newRefreshToken };
};

// ── LOGOUT ───────────────────────────────────────
export const logout = async (token: string | undefined, userId: string, ipAddress?: string) => {
  if (token) {
    const stored = await AuthRepo.findRefreshToken(token);
    if (stored && stored.userId === userId) await AuthRepo.revokeRefreshToken(stored.id);
  }
  // ...audit log unchanged
  await AuthRepo.createAuditLog({
    action: 'USER_LOGOUT',
    userId,
    ...(ipAddress !== undefined && { ipAddress }),
  });
};

// ── LOGOUT ALL DEVICES ───────────────────────────
export const logoutAll = async (userId: string) => {
  await AuthRepo.revokeAllUserTokens(userId);
};

// ── CURRENT USER ────────────────────────────────
export const getCurrentUser = async (userId: string) => {
  const user = await AuthRepo.findUserById(userId);
  if (!user) throw new NotFoundError('User');

  return sanitizeUser(user);
};

export const updateProfile = async (
  userId: string,
  dto: UpdateProfileDTO,
  ipAddress?: string,
) => {
  const user = await AuthRepo.findUserById(userId);
  if (!user) throw new NotFoundError('User');

  await AuthRepo.updateUserProfile(userId, {
    ...(dto.firstName !== undefined && { firstName: dto.firstName }),
    ...(dto.middleName !== undefined && { middleName: dto.middleName }),
    ...(dto.lastName !== undefined && { lastName: dto.lastName }),
    ...(dto.gender !== undefined && { gender: dto.gender }),
    ...(dto.phone !== undefined && { phone: dto.phone }),
    ...(dto.profileImage !== undefined && { profileImage: dto.profileImage }),
  });

  await AuthRepo.createAuditLog({
    action: 'USER_PROFILE_UPDATED',
    userId,
    ...(ipAddress !== undefined && { ipAddress }),
  });

  return getCurrentUser(userId);
};

// ── FORGOT PASSWORD ──────────────────────────────
export const forgotPassword = async (dto: ForgotPasswordDTO) => {
  const user = await AuthRepo.findUserByEmail(dto.email);

  // Always return success — don't leak whether email exists
  if (!user) return { message: 'If this email exists, a reset link has been sent' };

  const token     = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await AuthRepo.createPasswordReset({ token, userId: user.id, expiresAt });

  await EmailService.sendPasswordResetEmail(
    { id: user.id, email: user.email, firstName: user.profile?.firstName ?? user.email.split('@')[0] ?? user.email },
    token,
  );

  return { message: 'If this email exists, a reset link has been sent' };
};

// ── RESET PASSWORD ───────────────────────────────
export const resetPassword = async (dto: ResetPasswordDTO, ipAddress?: string) => {
  const passwordHash = await AuthUtils.hashPassword(dto.password);
  const reset = await AuthRepo.claimPasswordReset(dto.token);

  if (!reset)              throw new BadRequestError('Invalid or expired reset token');

  await AuthRepo.updateUser(reset.userId, { passwordHash });

  const user = await AuthRepo.findUserById(reset.userId);
  if (!user) throw new NotFoundError('User');

  // Revoke all refresh tokens for security
  await AuthRepo.revokeAllUserTokens(reset.userId);
  await EmailService.sendWelcomeEmail({
    id: user.id,
    email: user.email,
    firstName: user.profile?.firstName ?? user.email.split('@')[0] ?? user.email,
  });

  await AuthRepo.createAuditLog({
    action:    'PASSWORD_RESET',
    userId:    reset.userId,
    ...(ipAddress && { ipAddress }),
  });

  return { message: 'Password reset successful' };
};

// ── CHANGE PASSWORD ──────────────────────────────
export const changePassword = async (
  userId: string,
  dto:    ChangePasswordDTO,
  ipAddress?: string
) => {
  const user = await AuthRepo.findUserById(userId);
  if (!user) throw new NotFoundError('User');

  const valid = await AuthUtils.comparePassword(dto.currentPassword, user.passwordHash);
  if (!valid) throw new BadRequestError('Current password is incorrect');

  const passwordHash = await AuthUtils.hashPassword(dto.newPassword);
  await AuthRepo.updateUser(userId, { passwordHash });

  // Revoke all other refresh tokens
  await AuthRepo.revokeAllUserTokens(userId);

  await AuthRepo.createAuditLog({
    action: 'PASSWORD_CHANGED',
    userId,
    ...(ipAddress !== undefined && { ipAddress }),
  });

  return { message: 'Password changed successfully' };
};

// ── HELPER ───────────────────────────────────────
const sanitizeUser = (user: Record<string, unknown>) => {
  const safe = { ...user };
  delete safe.passwordHash;
  delete safe.refreshTokens;
  return safe;
};
