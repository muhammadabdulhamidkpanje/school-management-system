import type { Request, Response } from 'express';
import * as StaffService from '../services/staff.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import type { CreateStaffOnboardingDTO } from '../types/staff.types.js';
import type { IncomingUpload } from '../services/upload.service.js';
import { BadRequestError } from '../errors/errors.js';

const staffId = (req: Request) => req.params.id as string;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const activeValue = typeof req.query.isActive === 'string' ? req.query.isActive : undefined;
  const isActive = activeValue === undefined ? undefined : activeValue === 'true';
  sendSuccess(res, await StaffService.listStaff(page, limit, search, isActive), 'Staff fetched');
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await StaffService.getStaffById(staffId(req)), 'Staff fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  if ('bioData' in req.body) {
    const files = Array.isArray(req.files) ? req.files as IncomingUpload[] : [];
    const staff = await StaffService.createStaffOnboarding(
      req.body as CreateStaffOnboardingDTO,
      files,
      req.user!.sub,
      req.ip,
    );
    sendCreated(res, { staff }, 'Staff member added successfully');
    return;
  }
  if (Array.isArray(req.files) && req.files.length > 0) {
    throw new BadRequestError('Qualification documents can only be uploaded with the Add Staff payload');
  }
  const staff = await StaffService.createStaff(req.body, req.user!.sub, req.ip);
  sendCreated(res, staff, 'Staff created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const staff = await StaffService.updateStaff(staffId(req), req.body, req.user!.sub, req.ip);
  sendSuccess(res, staff, 'Staff updated');
});

export const exportCsv = asyncHandler(async (_req: Request, res: Response) => {
  const csv = await StaffService.exportStaff();
  res.type('text/csv').attachment('staff.csv').send(csv);
});

export const importCsv = asyncHandler(async (req: Request, res: Response) => {
  const result = await StaffService.importStaff(req.body.csv, req.user!.sub, req.ip);
  sendSuccess(res, result, 'Staff imported');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await StaffService.deleteStaff(staffId(req), req.user!.sub, req.ip);
  sendSuccess(res, null, 'Staff deleted');
});
