import type { Request, Response } from 'express';
import * as UserService from '../services/user.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

const userId = (req: Request) => req.params.id as string;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  sendSuccess(res, await UserService.listUsers(page, limit), 'Users fetched');
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await UserService.getUser(userId(req)), 'User fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.createUser(req.body, req.user!.sub, req.ip);
  sendCreated(res, user, 'User created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.updateUser(userId(req), req.body, req.user!.sub, req.ip);
  sendSuccess(res, user, 'User updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await UserService.deleteUser(userId(req), req.user!.sub, req.ip);
  sendSuccess(res, null, 'User deleted');
});

export const activate = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.setUserActive(userId(req), true, req.user!.sub, req.ip);
  sendSuccess(res, user, 'User activated');
});

export const deactivate = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.setUserActive(userId(req), false, req.user!.sub, req.ip);
  sendSuccess(res, user, 'User deactivated');
});
