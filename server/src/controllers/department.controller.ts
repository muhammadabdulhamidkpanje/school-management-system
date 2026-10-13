import type { Request, Response } from 'express';
import * as DepartmentService from '../services/department.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

const departmentId = (req: Request) => req.params.id as string;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const facultyId = typeof req.query.facultyId === 'string' ? req.query.facultyId : undefined;
  sendSuccess(res, await DepartmentService.listDepartments({ page, limit, search, facultyId }), 'Departments fetched');
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await DepartmentService.getDepartmentById(departmentId(req)), 'Department fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const department = await DepartmentService.createDepartment(req.body, req.user!.sub, req.ip);
  sendCreated(res, department, 'Department created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const department = await DepartmentService.updateDepartment(departmentId(req), req.body, req.user!.sub, req.ip);
  sendSuccess(res, department, 'Department updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await DepartmentService.deleteDepartment(departmentId(req), req.user!.sub, req.ip);
  sendSuccess(res, null, 'Department deleted');
});
