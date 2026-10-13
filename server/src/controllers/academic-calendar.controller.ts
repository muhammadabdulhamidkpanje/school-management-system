import type { Request, Response } from 'express';
import * as AcademicCalendarService from '../services/academic-calendar.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendCreated, sendSuccess } from '../utils/response.js';

const eventId = (req: Request) => req.params.id as string;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId : undefined;
  sendSuccess(
    res,
    await AcademicCalendarService.listAcademicCalendars(page, limit, sessionId),
    'Academic calendar events fetched',
  );
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const event = await AcademicCalendarService.createAcademicCalendar(
    req.body,
    req.user!.sub,
    req.ip,
  );
  sendCreated(res, event, 'Academic calendar event created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const event = await AcademicCalendarService.updateAcademicCalendar(
    eventId(req),
    req.body,
    req.user!.sub,
    req.ip,
  );
  sendSuccess(res, event, 'Academic calendar event updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await AcademicCalendarService.deleteAcademicCalendar(eventId(req), req.user!.sub, req.ip);
  sendSuccess(res, null, 'Academic calendar event deleted');
});
