import { Router } from 'express';
import * as SessionController from '../controllers/session.controller.js';
import { authenticate, authorizeRole, authorizePermission } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import {
  sessionIdSchema,
  listSessionsSchema,
  createSessionSchema,
  updateSessionSchema,
} from '../validators/session.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canRead = [...adminOnly, authorizePermission(permissions.sessionsRead)];
const canWrite = [...adminOnly, authorizePermission(permissions.sessionsWrite)];

router.get('/', ...canRead, validate(listSessionsSchema), SessionController.list);
router.post('/', ...canWrite, validate(createSessionSchema), SessionController.create);
router.get('/:id', ...canRead, validate(sessionIdSchema), SessionController.get);
router.patch('/:id', ...canWrite, validate(updateSessionSchema), SessionController.update);
router.delete('/:id', ...canWrite, validate(sessionIdSchema), SessionController.remove);

export default router;
