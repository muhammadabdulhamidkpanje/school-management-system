import type { Request, Response } from 'express';
import * as OfferingService from '../services/course-offering.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendCreated, sendSuccess } from '../utils/response.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  sendSuccess(res, await OfferingService.listOfferings(page, limit), 'Course offerings fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const offering = await OfferingService.createOffering(req.body, req.user!.sub, req.ip);
  sendCreated(res, offering, 'Course offering created');
});

export const assignTeacher = asyncHandler(async (req: Request, res: Response) => {
  const offeringId = req.params.id as string;
  const offering = await OfferingService.assignTeacher(
    offeringId, req.body, req.user!.sub, req.ip,
  );
  sendSuccess(res, offering, 'Course teacher assignment updated');
});
