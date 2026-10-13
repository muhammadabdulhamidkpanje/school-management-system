import type { Request, Response } from 'express';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as InstitutionService from '../services/institution.service.js';

export const get = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await InstitutionService.getInstitutionProfile(), 'Institution profile fetched');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const profile = await InstitutionService.updateInstitutionProfile(
    req.body,
    req.user!.sub,
    req.ip,
  );
  sendSuccess(res, profile, 'Institution profile updated');
});
