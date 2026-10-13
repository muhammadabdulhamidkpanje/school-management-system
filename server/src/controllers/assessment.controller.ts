import type { Request, Response } from 'express';
import * as AssessmentService from '../services/assessment.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

const assessmentId = (req: Request) => req.params.id as string;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const courseOfferingId = typeof req.query.courseOfferingId === 'string' ? req.query.courseOfferingId : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  sendSuccess(res, await AssessmentService.listAssessments({
    page,
    limit,
    ...(courseOfferingId !== undefined && { courseOfferingId }),
    ...(search !== undefined && { search }),
  }), 'Assessments fetched');
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await AssessmentService.getAssessmentById(assessmentId(req)), 'Assessment fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const assessment = await AssessmentService.createAssessment(req.body, req.user!.sub, req.ip);
  sendCreated(res, assessment, 'Assessment created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const assessment = await AssessmentService.updateAssessment(assessmentId(req), req.body, req.user!.sub, req.ip);
  sendSuccess(res, assessment, 'Assessment updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await AssessmentService.deleteAssessment(assessmentId(req), req.user!.sub, req.ip);
  sendSuccess(res, null, 'Assessment deleted');
});

export const publish = asyncHandler(async (req: Request, res: Response) => {
  const assessment = await AssessmentService.setAssessmentPublication(
    assessmentId(req), req.body.published, req.user!.sub, req.ip,
  );
  sendSuccess(res, assessment, req.body.published ? 'Assessment published' : 'Assessment unpublished');
});
