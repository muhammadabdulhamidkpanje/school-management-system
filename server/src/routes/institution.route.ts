import { Router } from 'express';
import * as InstitutionController from '../controllers/institution.controller.js';
import { authenticate, authorizePermission, authorizeRole } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import { updateInstitutionProfileSchema } from '../validators/institution.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];

router.get(
  '/',
  ...adminOnly,
  authorizePermission(permissions.institutionRead),
  InstitutionController.get,
);
router.put(
  '/',
  ...adminOnly,
  authorizePermission(permissions.institutionWrite),
  validate(updateInstitutionProfileSchema),
  InstitutionController.update,
);

export default router;
