import type { Request, Response } from 'express';
import * as ExamService from '../services/exam.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

const examId = (req: Request) => req.params.id as string;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const courseOfferingId = typeof req.query.courseOfferingId === 'string' ? req.query.courseOfferingId : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  sendSuccess(res, await ExamService.listExams({
    page,
    limit,
    ...(courseOfferingId !== undefined && { courseOfferingId }),
    ...(search !== undefined && { search }),
  }), 'Exams fetched');
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await ExamService.getExamById(examId(req)), 'Exam fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const exam = await ExamService.createExam(req.body, req.user!.sub, req.ip);
  sendCreated(res, exam, 'Exam created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const exam = await ExamService.updateExam(examId(req), req.body, req.user!.sub, req.ip);
  sendSuccess(res, exam, 'Exam updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await ExamService.deleteExam(examId(req), req.user!.sub, req.ip);
  sendSuccess(res, null, 'Exam deleted');
});

export const publish = asyncHandler(async (req: Request, res: Response) => {
  const exam = await ExamService.setExamPublication(examId(req), req.body.published, req.user!.sub, req.ip);
  sendSuccess(res, exam, req.body.published ? 'Exam published' : 'Exam unpublished');
});
