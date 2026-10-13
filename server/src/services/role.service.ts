import * as RoleRepo from '../repositories/role.repositories.js';
import type { CreateRoleDTO, UpdateRoleDTO } from '../types/role.types.js';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/errors.js';

const getRole = async (id: string) => {
  const role = await RoleRepo.findRoleById(id);
  if (!role) throw new NotFoundError('Role');
  return role;
};

export const listRoles = async (page: number, limit: number) => {
  const [roles, total] = await RoleRepo.listRoles((page - 1) * limit, limit);
  return {
    roles,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getRoleById = (id: string) => getRole(id);

export const createRole = async (
  dto: CreateRoleDTO,
  actorId: string,
  ipAddress?: string,
) => {
  if (await RoleRepo.findRoleByName(dto.name)) {
    throw new ConflictError('Role name already exists');
  }

  const role = await RoleRepo.createRole({
    name: dto.name,
    ...(dto.description !== undefined && { description: dto.description }),
  });
  await RoleRepo.createAuditLog({
    action: 'ROLE_CREATED', userId: actorId, recordId: role.id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return role;
};

export const updateRole = async (
  id: string,
  dto: UpdateRoleDTO,
  actorId: string,
  ipAddress?: string,
) => {
  await getRole(id);
  if (dto.name && await RoleRepo.findRoleByName(dto.name)) {
    const duplicate = await RoleRepo.findRoleByName(dto.name);
    if (duplicate?.id !== id) throw new ConflictError('Role name already exists');
  }

  const role = await RoleRepo.updateRole(id, {
    ...(dto.name !== undefined && { name: dto.name }),
    ...(dto.description !== undefined && { description: dto.description }),
  });
  await RoleRepo.createAuditLog({
    action: 'ROLE_UPDATED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return role;
};

export const deleteRole = async (id: string, actorId: string, ipAddress?: string) => {
  await getRole(id);
  if (await RoleRepo.countRoleUsers(id) > 0) {
    throw new BadRequestError('Cannot delete a role assigned to users');
  }

  await RoleRepo.deleteRole(id);
  await RoleRepo.createAuditLog({
    action: 'ROLE_DELETED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
};
