import { Router } from 'express';
import * as ExamController from '../controllers/exam.controller.js';
import { authenticate, authorizeRole, authorizePermission } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import {
  examIdSchema,
  listExamsSchema,
  createExamSchema,
  updateExamSchema,
  publicationSchema,
} from '../validators/exam.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canRead = [...adminOnly, authorizePermission(permissions.examsRead)];
const canWrite = [...adminOnly, authorizePermission(permissions.examsWrite)];
const canPublish = [...adminOnly, authorizePermission(permissions.resultsPublish)];

router.get('/', ...canRead, validate(listExamsSchema), ExamController.list);
router.post('/', ...canWrite, validate(createExamSchema), ExamController.create);
router.get('/:id', ...canRead, validate(examIdSchema), ExamController.get);
router.patch('/:id', ...canWrite, validate(updateExamSchema), ExamController.update);
router.patch('/:id/publication', ...canPublish, validate(publicationSchema), ExamController.publish);
router.delete('/:id', ...canWrite, validate(examIdSchema), ExamController.remove);

export default router;
