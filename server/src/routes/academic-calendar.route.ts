import { Router } from 'express';
import * as AcademicCalendarController from '../controllers/academic-calendar.controller.js';
import { authenticate, authorizePermission, authorizeRole } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import {
  academicCalendarIdSchema,
  createAcademicCalendarSchema,
  listAcademicCalendarsSchema,
  updateAcademicCalendarSchema,
} from '../validators/academic-calendar.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canRead = [...adminOnly, authorizePermission(permissions.academicCalendarsRead)];
const canWrite = [...adminOnly, authorizePermission(permissions.academicCalendarsWrite)];

router.get('/', ...canRead, validate(listAcademicCalendarsSchema), AcademicCalendarController.list);
router.post('/', ...canWrite, validate(createAcademicCalendarSchema), AcademicCalendarController.create);
router.patch('/:id', ...canWrite, validate(updateAcademicCalendarSchema), AcademicCalendarController.update);
router.delete('/:id', ...canWrite, validate(academicCalendarIdSchema), AcademicCalendarController.remove);

export default router;
