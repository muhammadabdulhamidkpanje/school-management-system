import type { Request, Response } from 'express';
import * as ClassroomService from '../services/classroom.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

const classroomId = (req: Request) => req.params.id as string;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const departmentId = typeof req.query.departmentId === 'string' ? req.query.departmentId : undefined;
  const level = typeof req.query.level === 'string' ? req.query.level : undefined;
  sendSuccess(res, await ClassroomService.listClassrooms({ page, limit, search, departmentId, level }), 'Classrooms fetched');
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await ClassroomService.getClassroomById(classroomId(req)), 'Classroom fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const classroom = await ClassroomService.createClassroom(req.body, req.user!.sub, req.ip);
  sendCreated(res, classroom, 'Classroom created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const classroom = await ClassroomService.updateClassroom(classroomId(req), req.body, req.user!.sub, req.ip);
  sendSuccess(res, classroom, 'Classroom updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await ClassroomService.deleteClassroom(classroomId(req), req.user!.sub, req.ip);
  sendSuccess(res, null, 'Classroom deleted');
});
