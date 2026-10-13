import { Router } from 'express';
import * as CourseController from '../controllers/course.controller.js';
import { authenticate, authorizeRole, authorizePermission } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import {
  courseIdSchema,
  listCoursesSchema,
  createCourseSchema,
  updateCourseSchema,
  assignCourseSchema,
} from '../validators/course.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canRead = [...adminOnly, authorizePermission(permissions.coursesRead)];
const canWrite = [...adminOnly, authorizePermission(permissions.coursesWrite)];

router.get('/', ...canRead, validate(listCoursesSchema), CourseController.list);
router.post('/', ...canWrite, validate(createCourseSchema), CourseController.create);
router.get('/:id', ...canRead, validate(courseIdSchema), CourseController.get);
router.patch('/:id', ...canWrite, validate(updateCourseSchema), CourseController.update);
router.put('/:id/department', ...canWrite, validate(assignCourseSchema), CourseController.assign);
router.delete('/:id', ...canWrite, validate(courseIdSchema), CourseController.remove);

export default router;
