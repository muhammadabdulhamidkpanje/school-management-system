import { Router } from 'express';
import * as OfferingController from '../controllers/course-offering.controller.js';
import { authenticate, authorizeRole, authorizePermission } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import {
  assignTeacherSchema,
  createCourseOfferingSchema,
  listCourseOfferingsSchema,
} from '../validators/course-offering.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];

router.get(
  '/',
  ...adminOnly,
  authorizePermission(permissions.coursesRead),
  validate(listCourseOfferingsSchema),
  OfferingController.list,
);

router.post(
  '/',
  ...adminOnly,
  authorizePermission(permissions.coursesWrite),
  validate(createCourseOfferingSchema),
  OfferingController.create,
);

router.put(
  '/:id/teacher',
  authenticate,
  authorizeRole('admin'),
  authorizePermission(permissions.coursesWrite),
  validate(assignTeacherSchema),
  OfferingController.assignTeacher,
);

export default router;
