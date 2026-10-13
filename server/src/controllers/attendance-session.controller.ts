import type { Request, Response } from 'express';
import * as AttendanceService from '../services/attendance-session.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

const sessionId = (req: Request) => req.params.id as string;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const classroomId = typeof req.query.classroomId === 'string' ? req.query.classroomId : undefined;
  const courseOfferingId = typeof req.query.courseOfferingId === 'string' ? req.query.courseOfferingId : undefined;
  sendSuccess(res, await AttendanceService.listSessions(page, limit, classroomId, courseOfferingId), 'Attendance sessions fetched');
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await AttendanceService.getSessionById(sessionId(req)), 'Attendance session fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const session = await AttendanceService.createSession(req.body, req.user!.sub, req.ip);
  sendCreated(res, session, 'Attendance session created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const session = await AttendanceService.updateSession(sessionId(req), req.body, req.user!.sub, req.ip);
  sendSuccess(res, session, 'Attendance session updated');
});
