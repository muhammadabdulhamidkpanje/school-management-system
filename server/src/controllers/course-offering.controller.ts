import type { Request, Response } from 'express';
import * as OfferingService from '../services/course-offering.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const assignTeacher = asyncHandler(async (req: Request, res: Response) => {
  const offeringId = req.params.id as string;
  const offering = await OfferingService.assignTeacher(
    offeringId, req.body, req.user!.sub, req.ip,
  );
  sendSuccess(res, offering, 'Course teacher assignment updated');
});
