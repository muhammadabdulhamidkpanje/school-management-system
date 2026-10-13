import type { Request, Response } from 'express';
import * as SessionService from '../services/session.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

const sessionId = (req: Request) => req.params.id as string;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const isCurrent = req.query.isCurrent === undefined ? undefined : req.query.isCurrent === 'true';
  sendSuccess(res, await SessionService.listSessions({ page, limit, search, isCurrent }), 'Academic sessions fetched');
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await SessionService.getSessionById(sessionId(req)), 'Academic session fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const session = await SessionService.createSession(req.body, req.user!.sub, req.ip);
  sendCreated(res, session, 'Academic session created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const session = await SessionService.updateSession(sessionId(req), req.body, req.user!.sub, req.ip);
  sendSuccess(res, session, 'Academic session updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await SessionService.deleteSession(sessionId(req), req.user!.sub, req.ip);
  sendSuccess(res, null, 'Academic session deleted');
});
