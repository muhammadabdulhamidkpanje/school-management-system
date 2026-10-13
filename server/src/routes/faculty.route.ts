import { Router } from 'express';
import * as FacultyController from '../controllers/faculty.controller.js';
import { authenticate, authorizeRole, authorizePermission } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import {
  facultyIdSchema,
  listFacultiesSchema,
  createFacultySchema,
  updateFacultySchema,
} from '../validators/faculty.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canRead = [...adminOnly, authorizePermission(permissions.facultiesRead)];
const canWrite = [...adminOnly, authorizePermission(permissions.facultiesWrite)];

router.get('/', ...canRead, validate(listFacultiesSchema), FacultyController.list);
router.post('/', ...canWrite, validate(createFacultySchema), FacultyController.create);
router.get('/:id', ...canRead, validate(facultyIdSchema), FacultyController.get);
router.patch('/:id', ...canWrite, validate(updateFacultySchema), FacultyController.update);
router.delete('/:id', ...canWrite, validate(facultyIdSchema), FacultyController.remove);

export default router;
