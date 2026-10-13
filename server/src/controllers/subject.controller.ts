import type { Request, Response } from 'express';
import * as SubjectService from '../services/subject.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

const subjectId = (req: Request) => req.params.id as string;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const departmentId = typeof req.query.departmentId === 'string' ? req.query.departmentId : undefined;
  sendSuccess(res, await SubjectService.listSubjects({ page, limit, search, departmentId }), 'Subjects fetched');
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await SubjectService.getSubjectById(subjectId(req)), 'Subject fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const subject = await SubjectService.createSubject(req.body, req.user!.sub, req.ip);
  sendCreated(res, subject, 'Subject created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const subject = await SubjectService.updateSubject(subjectId(req), req.body, req.user!.sub, req.ip);
  sendSuccess(res, subject, 'Subject updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await SubjectService.deleteSubject(subjectId(req), req.user!.sub, req.ip);
  sendSuccess(res, null, 'Subject deleted');
});

export const assign = asyncHandler(async (req: Request, res: Response) => {
  const subject = await SubjectService.assignSubject(
    subjectId(req), req.body.departmentId, req.body.facultyId, req.user!.sub, req.ip,
  );
  sendSuccess(res, subject, 'Subject assignment updated');
});
