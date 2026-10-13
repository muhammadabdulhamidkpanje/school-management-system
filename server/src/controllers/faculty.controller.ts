import type { Request, Response } from 'express';
import * as FacultyService from '../services/faculty.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

const facultyId = (req: Request) => req.params.id as string;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  sendSuccess(res, await FacultyService.listFaculties({ page, limit, search }), 'Faculties fetched');
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await FacultyService.getFacultyById(facultyId(req)), 'Faculty fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const faculty = await FacultyService.createFaculty(req.body, req.user!.sub, req.ip);
  sendCreated(res, faculty, 'Faculty created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const faculty = await FacultyService.updateFaculty(facultyId(req), req.body, req.user!.sub, req.ip);
  sendSuccess(res, faculty, 'Faculty updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await FacultyService.deleteFaculty(facultyId(req), req.user!.sub, req.ip);
  sendSuccess(res, null, 'Faculty deleted');
});
