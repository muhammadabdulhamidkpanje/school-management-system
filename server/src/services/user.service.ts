import * as UserRepo from '../repositories/user.repositories.js';
import * as AuthUtils from '../utils/hash.js';
import type { CreateUserDTO, UpdateUserDTO } from '../types/user.types.js';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/errors.js';

const sanitizeUser = (user: Record<string, unknown>) => {
  const safe = { ...user };
  delete safe.passwordHash;
  delete safe.refreshTokens;
  delete safe.passwordResets;
  return safe;
};

const getRole = async (roleName: string) => {
  const role = await UserRepo.findRoleByName(roleName);
  if (!role) throw new NotFoundError(`Role '${roleName}'`);
  return role;
};

export const listUsers = async (page: number, limit: number) => {
  const [users, total] = await UserRepo.listUsers((page - 1) * limit, limit);
  return {
    users: users.map(user => sanitizeUser(user)),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getUser = async (id: string) => {
  const user = await UserRepo.findUserById(id);
  if (!user) throw new NotFoundError('User');
  return sanitizeUser(user);
};

export const createUser = async (
  dto: CreateUserDTO,
  actorId: string,
  ipAddress?: string,
) => {
  if (await UserRepo.findUserByEmail(dto.email)) {
    throw new ConflictError('Email already registered');
  }
  const role = await getRole(dto.roleName);
  const passwordHash = await AuthUtils.hashPassword(dto.password);

  const user = await UserRepo.createUser({
    email: dto.email,
    passwordHash,
    role: { connect: { id: role.id } },
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

  await UserRepo.createAuditLog({
    action: 'ADMIN_USER_CREATED', userId: actorId, recordId: user.id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return sanitizeUser(user);
};

export const updateUser = async (
  id: string,
  dto: UpdateUserDTO,
  actorId: string,
  ipAddress?: string,
) => {
  const existing = await UserRepo.findUserById(id);
  if (!existing) throw new NotFoundError('User');

  if (dto.email && dto.email !== existing.email && await UserRepo.findUserByEmail(dto.email)) {
    throw new ConflictError('Email already registered');
  }
  const role = dto.roleName ? await getRole(dto.roleName) : undefined;

  await UserRepo.updateUser(id, {
    ...(dto.email !== undefined && { email: dto.email }),
    ...(role && { role: { connect: { id: role.id } } }),
    ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    ...(dto.isVerified !== undefined && { isVerified: dto.isVerified }),
  });

  const profileData = {
    ...(dto.firstName !== undefined && { firstName: dto.firstName }),
    ...(dto.middleName !== undefined && { middleName: dto.middleName }),
    ...(dto.lastName !== undefined && { lastName: dto.lastName }),
    ...(dto.gender !== undefined && { gender: dto.gender }),
    ...(dto.phone !== undefined && { phone: dto.phone }),
    ...(dto.profileImage !== undefined && { profileImage: dto.profileImage }),
  };
  if (Object.keys(profileData).length > 0) {
    if (existing.profile) await UserRepo.updateProfile(id, profileData);
    else throw new BadRequestError('User profile is missing');
  }

  await UserRepo.createAuditLog({
    action: 'ADMIN_USER_UPDATED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return getUser(id);
};

export const deleteUser = async (id: string, actorId: string, ipAddress?: string) => {
  if (id === actorId) throw new BadRequestError('Administrators cannot delete themselves');
  const existing = await UserRepo.findUserById(id);
  if (!existing) throw new NotFoundError('User');

  await UserRepo.deleteUser(id);
  await UserRepo.createAuditLog({
    action: 'ADMIN_USER_DELETED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
};

export const setUserActive = async (
  id: string,
  isActive: boolean,
  actorId: string,
  ipAddress?: string,
) => {
  if (!isActive && id === actorId) {
    throw new BadRequestError('Administrators cannot deactivate themselves');
  }

  const existing = await UserRepo.findUserById(id);
  if (!existing) throw new NotFoundError('User');

  if (existing.isActive !== isActive) {
    await UserRepo.updateUser(id, { isActive });
  }

  await UserRepo.createAuditLog({
    action: isActive ? 'ADMIN_USER_ACTIVATED' : 'ADMIN_USER_DEACTIVATED',
    userId: actorId,
    recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });

  return getUser(id);
};
