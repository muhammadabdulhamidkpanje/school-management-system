import type { Request, Response } from 'express';
import * as RoleService from '../services/role.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import * as PermissionService from '../services/permission.service.js';

const roleId = (req: Request) => req.params.id as string;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  sendSuccess(res, await RoleService.listRoles(page, limit), 'Roles fetched');
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await RoleService.getRoleById(roleId(req)), 'Role fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const role = await RoleService.createRole(req.body, req.user!.sub, req.ip);
  sendCreated(res, role, 'Role created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const role = await RoleService.updateRole(roleId(req), req.body, req.user!.sub, req.ip);
  sendSuccess(res, role, 'Role updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await RoleService.deleteRole(roleId(req), req.user!.sub, req.ip);
  sendSuccess(res, null, 'Role deleted');
});

export const assignPermissions = asyncHandler(async (req: Request, res: Response) => {
  const role = await PermissionService.assignPermissions(
    roleId(req), req.body.permissionIds, req.user!.sub, req.ip,
  );
  sendSuccess(res, role, 'Role permissions updated');
});
