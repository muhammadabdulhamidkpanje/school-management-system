import { Router } from 'express';
import * as AssessmentController from '../controllers/assessment.controller.js';
import { authenticate, authorizeRole, authorizePermission } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import {
  assessmentIdSchema,
  listAssessmentsSchema,
  createAssessmentSchema,
  updateAssessmentSchema,
  publicationSchema,
} from '../validators/assessment.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canRead = [...adminOnly, authorizePermission(permissions.assessmentsRead)];
const canWrite = [...adminOnly, authorizePermission(permissions.assessmentsWrite)];
const canPublish = [...adminOnly, authorizePermission(permissions.resultsPublish)];

router.get('/', ...canRead, validate(listAssessmentsSchema), AssessmentController.list);
router.post('/', ...canWrite, validate(createAssessmentSchema), AssessmentController.create);
router.get('/:id', ...canRead, validate(assessmentIdSchema), AssessmentController.get);
router.patch('/:id', ...canWrite, validate(updateAssessmentSchema), AssessmentController.update);
router.patch('/:id/publication', ...canPublish, validate(publicationSchema), AssessmentController.publish);
router.delete('/:id', ...canWrite, validate(assessmentIdSchema), AssessmentController.remove);

export default router;
