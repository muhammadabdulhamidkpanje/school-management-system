import { Router } from 'express';
import * as GradingSystemController from '../controllers/grading-system.controller.js';
import { authenticate, authorizePermission, authorizeRole } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import {
  createGradingSystemSchema,
  gradingSystemIdSchema,
  updateGradingSystemSchema,
} from '../validators/grading-system.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];

router.get(
  '/',
  ...adminOnly,
  authorizePermission(permissions.gradingSystemsRead),
  GradingSystemController.list,
);
router.post(
  '/',
  ...adminOnly,
  authorizePermission(permissions.gradingSystemsWrite),
  validate(createGradingSystemSchema),
  GradingSystemController.create,
);
router.patch(
  '/:id',
  ...adminOnly,
  authorizePermission(permissions.gradingSystemsWrite),
  validate(updateGradingSystemSchema),
  GradingSystemController.update,
);
router.delete(
  '/:id',
  ...adminOnly,
  authorizePermission(permissions.gradingSystemsWrite),
  validate(gradingSystemIdSchema),
  GradingSystemController.remove,
);

export default router;
