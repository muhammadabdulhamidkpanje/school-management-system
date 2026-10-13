import type { Request, Response } from 'express';
import * as PermissionService from '../services/permission.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

const permissionId = (req: Request) => req.params.id as string;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  sendSuccess(res, await PermissionService.listPermissions(page, limit), 'Permissions fetched');
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await PermissionService.getPermissionById(permissionId(req)), 'Permission fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const permission = await PermissionService.createPermission(req.body, req.user!.sub, req.ip);
  sendCreated(res, permission, 'Permission created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const permission = await PermissionService.updatePermission(permissionId(req), req.body, req.user!.sub, req.ip);
  sendSuccess(res, permission, 'Permission updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await PermissionService.deletePermission(permissionId(req), req.user!.sub, req.ip);
  sendSuccess(res, null, 'Permission deleted');
});
