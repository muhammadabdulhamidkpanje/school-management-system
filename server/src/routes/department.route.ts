import { Router } from 'express';
import * as DepartmentController from '../controllers/department.controller.js';
import { authenticate, authorizeRole, authorizePermission } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import {
  departmentIdSchema,
  listDepartmentsSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
} from '../validators/department.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canRead = [...adminOnly, authorizePermission(permissions.departmentsRead)];
const canWrite = [...adminOnly, authorizePermission(permissions.departmentsWrite)];

router.get('/', ...canRead, validate(listDepartmentsSchema), DepartmentController.list);
router.post('/', ...canWrite, validate(createDepartmentSchema), DepartmentController.create);
router.get('/:id', ...canRead, validate(departmentIdSchema), DepartmentController.get);
router.patch('/:id', ...canWrite, validate(updateDepartmentSchema), DepartmentController.update);
router.delete('/:id', ...canWrite, validate(departmentIdSchema), DepartmentController.remove);

export default router;
