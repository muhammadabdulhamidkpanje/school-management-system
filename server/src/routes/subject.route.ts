import { Router } from 'express';
import * as SubjectController from '../controllers/subject.controller.js';
import { authenticate, authorizeRole, authorizePermission } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import {
  subjectIdSchema,
  listSubjectsSchema,
  createSubjectSchema,
  updateSubjectSchema,
  assignSubjectSchema,
} from '../validators/subject.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canRead = [...adminOnly, authorizePermission(permissions.subjectsRead)];
const canWrite = [...adminOnly, authorizePermission(permissions.subjectsWrite)];

router.get('/', ...canRead, validate(listSubjectsSchema), SubjectController.list);
router.post('/', ...canWrite, validate(createSubjectSchema), SubjectController.create);
router.get('/:id', ...canRead, validate(subjectIdSchema), SubjectController.get);
router.patch('/:id', ...canWrite, validate(updateSubjectSchema), SubjectController.update);
router.put('/:id/department', ...canWrite, validate(assignSubjectSchema), SubjectController.assign);
router.delete('/:id', ...canWrite, validate(subjectIdSchema), SubjectController.remove);

export default router;
