import type { Request, Response } from 'express';
import * as EnrollmentService from '../services/enrollment.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

const enrollmentId = (req: Request) => req.params.id as string;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const filters = {
    studentId: typeof req.query.studentId === 'string' ? req.query.studentId : undefined,
    classroomId: typeof req.query.classroomId === 'string' ? req.query.classroomId : undefined,
    sessionId: typeof req.query.sessionId === 'string' ? req.query.sessionId : undefined,
    semesterId: typeof req.query.semesterId === 'string' ? req.query.semesterId : undefined,
    status: typeof req.query.status === 'string' ? req.query.status : undefined,
  };
  sendSuccess(res, await EnrollmentService.listEnrollments(page, limit, filters), 'Enrollments fetched');
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await EnrollmentService.getEnrollmentById(enrollmentId(req)), 'Enrollment fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const enrollment = await EnrollmentService.createEnrollment(req.body, req.user!.sub, req.ip);
  sendCreated(res, enrollment, 'Enrollment created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const enrollment = await EnrollmentService.updateEnrollment(enrollmentId(req), req.body, req.user!.sub, req.ip);
  sendSuccess(res, enrollment, 'Enrollment updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await EnrollmentService.deleteEnrollment(enrollmentId(req), req.user!.sub, req.ip);
  sendSuccess(res, null, 'Enrollment deleted');
});
