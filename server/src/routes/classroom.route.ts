import { Router } from 'express';
import * as ClassroomController from '../controllers/classroom.controller.js';
import { authenticate, authorizeRole, authorizePermission } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import {
  classroomIdSchema,
  listClassroomsSchema,
  createClassroomSchema,
  updateClassroomSchema,
} from '../validators/classroom.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canRead = [...adminOnly, authorizePermission(permissions.classroomsRead)];
const canWrite = [...adminOnly, authorizePermission(permissions.classroomsWrite)];

router.get('/', ...canRead, validate(listClassroomsSchema), ClassroomController.list);
router.post('/', ...canWrite, validate(createClassroomSchema), ClassroomController.create);
router.get('/:id', ...canRead, validate(classroomIdSchema), ClassroomController.get);
router.patch('/:id', ...canWrite, validate(updateClassroomSchema), ClassroomController.update);
router.delete('/:id', ...canWrite, validate(classroomIdSchema), ClassroomController.remove);

export default router;
