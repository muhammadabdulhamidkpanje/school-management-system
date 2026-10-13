import { Router } from 'express';
import * as EnrollmentController from '../controllers/enrollment.controller.js';
import { authenticate, authorizeRole, authorizePermission } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import { enrollmentIdSchema, listEnrollmentsSchema, createEnrollmentSchema, updateEnrollmentSchema } from '../validators/enrollment.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canRead = [...adminOnly, authorizePermission(permissions.enrollmentsRead)];
const canWrite = [...adminOnly, authorizePermission(permissions.enrollmentsWrite)];

router.get('/', ...canRead, validate(listEnrollmentsSchema), EnrollmentController.list);
router.post('/', ...canWrite, validate(createEnrollmentSchema), EnrollmentController.create);
router.get('/:id', ...canRead, validate(enrollmentIdSchema), EnrollmentController.get);
router.patch('/:id', ...canWrite, validate(updateEnrollmentSchema), EnrollmentController.update);
router.delete('/:id', ...canWrite, validate(enrollmentIdSchema), EnrollmentController.remove);

export default router;
