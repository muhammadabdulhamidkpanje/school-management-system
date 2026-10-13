import type { Request, Response } from 'express';
import * as ProfileService from '../services/student-profile.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

const studentId = (req: Request) => req.params.studentId as string;

export const get = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await ProfileService.getProfile(studentId(req)), 'Academic profile fetched');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const profile = await ProfileService.updateProfile(studentId(req), req.body, req.user!.sub, req.ip);
  sendSuccess(res, profile, 'Academic profile updated');
});
