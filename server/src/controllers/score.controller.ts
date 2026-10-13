import type { Request, Response } from 'express';
import * as ScoreService from '../services/score.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendCreated, sendSuccess } from '../utils/response.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, studentId, assessmentId, examId } = req.query as Record<string, string | undefined>;
  sendSuccess(res, await ScoreService.listScores({
    page: Number(page ?? 1), limit: Number(limit ?? 20),
    ...(studentId !== undefined && { studentId }),
    ...(assessmentId !== undefined && { assessmentId }),
    ...(examId !== undefined && { examId }),
  }), 'Scores fetched');
});

export const reportCard = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await ScoreService.getStudentReportCard(req.params.studentId as string), 'Report card fetched');
});

export const get = asyncHandler(async (req: Request, res: Response) => sendSuccess(res, await ScoreService.getScoreById(req.params.id as string), 'Score fetched'));
export const create = asyncHandler(async (req: Request, res: Response) => sendCreated(res, await ScoreService.createScore(req.body, req.user!.sub, req.ip), 'Score recorded'));
export const update = asyncHandler(async (req: Request, res: Response) => sendSuccess(res, await ScoreService.updateScore(req.params.id as string, req.body, req.user!.sub, req.ip), 'Score updated'));
export const remove = asyncHandler(async (req: Request, res: Response) => { await ScoreService.deleteScore(req.params.id as string, req.user!.sub, req.ip); sendSuccess(res, null, 'Score deleted'); });
