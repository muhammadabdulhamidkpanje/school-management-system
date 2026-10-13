import type { Request, Response } from 'express';
import * as CourseService from '../services/course.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

const courseId = (req: Request) => req.params.id as string;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const departmentId = typeof req.query.departmentId === 'string' ? req.query.departmentId : undefined;
  sendSuccess(res, await CourseService.listCourses({ page, limit, search, departmentId }), 'Courses fetched');
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await CourseService.getCourseById(courseId(req)), 'Course fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const course = await CourseService.createCourse(req.body, req.user!.sub, req.ip);
  sendCreated(res, course, 'Course created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const course = await CourseService.updateCourse(courseId(req), req.body, req.user!.sub, req.ip);
  sendSuccess(res, course, 'Course updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await CourseService.deleteCourse(courseId(req), req.user!.sub, req.ip);
  sendSuccess(res, null, 'Course deleted');
});

export const assign = asyncHandler(async (req: Request, res: Response) => {
  const course = await CourseService.assignCourse(
    courseId(req), req.body.departmentId, req.body.facultyId, req.user!.sub, req.ip,
  );
  sendSuccess(res, course, 'Course assignment updated');
});
