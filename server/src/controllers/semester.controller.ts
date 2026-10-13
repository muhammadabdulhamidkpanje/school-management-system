import type { Request, Response } from 'express';
import * as SemesterService from '../services/semester.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

const semesterId = (req: Request) => req.params.id as string;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const isCurrent = req.query.isCurrent === undefined ? undefined : req.query.isCurrent === 'true';
  sendSuccess(res, await SemesterService.listSemesters({ page, limit, sessionId, search, isCurrent }), 'Semesters fetched');
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await SemesterService.getSemesterById(semesterId(req)), 'Semester fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const semester = await SemesterService.createSemester(req.body, req.user!.sub, req.ip);
  sendCreated(res, semester, 'Semester created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const semester = await SemesterService.updateSemester(semesterId(req), req.body, req.user!.sub, req.ip);
  sendSuccess(res, semester, 'Semester updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await SemesterService.deleteSemester(semesterId(req), req.user!.sub, req.ip);
  sendSuccess(res, null, 'Semester deleted');
});
