import * as PermissionRepo from '../repositories/permission.repositories.js';
import * as RoleRepo from '../repositories/role.repositories.js';
import type { CreatePermissionDTO, UpdatePermissionDTO } from '../types/permission.types.js';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/errors.js';

const getPermission = async (id: string) => {
  const permission = await PermissionRepo.findPermissionById(id);
  if (!permission) throw new NotFoundError('Permission');
  return permission;
};

export const listPermissions = async (page: number, limit: number) => {
  const [permissions, total] = await PermissionRepo.listPermissions((page - 1) * limit, limit);
  return {
    permissions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getPermissionById = (id: string) => getPermission(id);

export const createPermission = async (
  dto: CreatePermissionDTO,
  actorId: string,
  ipAddress?: string,
) => {
  if (await PermissionRepo.findPermissionByName(dto.name)) {
    throw new ConflictError('Permission name already exists');
  }
  const permission = await PermissionRepo.createPermission({
    name: dto.name,
    ...(dto.description !== undefined && { description: dto.description }),
  });
  await PermissionRepo.createAuditLog({
    action: 'PERMISSION_CREATED', userId: actorId, recordId: permission.id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return permission;
};

export const updatePermission = async (
  id: string,
  dto: UpdatePermissionDTO,
  actorId: string,
  ipAddress?: string,
) => {
  await getPermission(id);
  if (dto.name) {
    const duplicate = await PermissionRepo.findPermissionByName(dto.name);
    if (duplicate && duplicate.id !== id) throw new ConflictError('Permission name already exists');
  }
  const permission = await PermissionRepo.updatePermission(id, {
    ...(dto.name !== undefined && { name: dto.name }),
    ...(dto.description !== undefined && { description: dto.description }),
  });
  await PermissionRepo.createAuditLog({
    action: 'PERMISSION_UPDATED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return permission;
};

export const deletePermission = async (id: string, actorId: string, ipAddress?: string) => {
  await getPermission(id);
  await PermissionRepo.deletePermission(id);
  await PermissionRepo.createAuditLog({
    action: 'PERMISSION_DELETED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
};

export const assignPermissions = async (
  roleId: string,
  permissionIds: string[],
  actorId: string,
  ipAddress?: string,
) => {
  if (!await RoleRepo.findRoleById(roleId)) throw new NotFoundError('Role');
  const permissions = await PermissionRepo.findPermissionsByIds(permissionIds);
  if (permissions.length !== new Set(permissionIds).size) {
    throw new BadRequestError('One or more permissions were not found');
  }
  const role = await PermissionRepo.replaceRolePermissions(roleId, permissionIds);
  if (!role) throw new NotFoundError('Role');
  await PermissionRepo.createAuditLog({
    action: 'ROLE_PERMISSIONS_UPDATED', userId: actorId, recordId: roleId,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return role;
};
