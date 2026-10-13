import { Router } from 'express';
import * as AttendanceController from '../controllers/attendance-session.controller.js';
import { authenticate, authorizeRole, authorizePermission } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import {
  attendanceSessionIdSchema,
  listAttendanceSessionsSchema,
  createAttendanceSessionSchema,
  updateAttendanceSessionSchema,
} from '../validators/attendance-session.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canRead = [...adminOnly, authorizePermission(permissions.attendanceRead)];
const canWrite = [...adminOnly, authorizePermission(permissions.attendanceWrite)];

router.get('/', ...canRead, validate(listAttendanceSessionsSchema), AttendanceController.list);
router.post('/', ...canWrite, validate(createAttendanceSessionSchema), AttendanceController.create);
router.get('/:id', ...canRead, validate(attendanceSessionIdSchema), AttendanceController.get);
router.patch('/:id', ...canWrite, validate(updateAttendanceSessionSchema), AttendanceController.update);

export default router;
