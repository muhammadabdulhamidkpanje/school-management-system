import type { Request, Response } from 'express';
import * as StudentService from '../services/student.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

const id = (req: Request) => req.params.id as string;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const classroomId = typeof req.query.classroomId === 'string' ? req.query.classroomId : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  sendSuccess(res, await StudentService.listStudents(page, limit, search, classroomId, status), 'Students fetched');
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await StudentService.getStudentById(id(req)), 'Student fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const student = await StudentService.createStudent(req.body, req.user!.sub, req.ip);
  sendCreated(res, student, 'Student created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const student = await StudentService.updateStudent(id(req), req.body, req.user!.sub, req.ip);
  sendSuccess(res, student, 'Student updated');
});

export const exportCsv = asyncHandler(async (req: Request, res: Response) => {
  const csv = await StudentService.exportStudents();
  res.type('text/csv').attachment('students.csv').send(csv);
});

export const importCsv = asyncHandler(async (req: Request, res: Response) => {
  const result = await StudentService.importStudents(req.body.csv, req.user!.sub, req.ip);
  sendSuccess(res, result, 'Students imported');
});
