import { Router } from 'express';
import * as SemesterController from '../controllers/semester.controller.js';
import { authenticate, authorizeRole, authorizePermission } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import {
  semesterIdSchema,
  listSemestersSchema,
  createSemesterSchema,
  updateSemesterSchema,
} from '../validators/semester.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canRead = [...adminOnly, authorizePermission(permissions.semestersRead)];
const canWrite = [...adminOnly, authorizePermission(permissions.semestersWrite)];

router.get('/', ...canRead, validate(listSemestersSchema), SemesterController.list);
router.post('/', ...canWrite, validate(createSemesterSchema), SemesterController.create);
router.get('/:id', ...canRead, validate(semesterIdSchema), SemesterController.get);
router.patch('/:id', ...canWrite, validate(updateSemesterSchema), SemesterController.update);
router.delete('/:id', ...canWrite, validate(semesterIdSchema), SemesterController.remove);

export default router;
