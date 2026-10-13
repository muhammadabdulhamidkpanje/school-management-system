import type { Request, Response } from 'express';
import * as GradingSystemService from '../services/grading-system.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendCreated, sendSuccess } from '../utils/response.js';

const gradingSystemId = (req: Request) => req.params.id as string;

export const list = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await GradingSystemService.listGradingSystems(), 'Grading systems fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const gradingSystem = await GradingSystemService.createGradingSystem(
    req.body,
    req.user!.sub,
    req.ip,
  );
  sendCreated(res, gradingSystem, 'Grading system created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const gradingSystem = await GradingSystemService.updateGradingSystem(
    gradingSystemId(req),
    req.body,
    req.user!.sub,
    req.ip,
  );
  sendSuccess(res, gradingSystem, 'Grading system updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await GradingSystemService.deleteGradingSystem(gradingSystemId(req), req.user!.sub, req.ip);
  sendSuccess(res, null, 'Grading system deleted');
});
