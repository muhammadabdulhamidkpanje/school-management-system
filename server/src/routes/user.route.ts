import { Router } from 'express';
import * as UserController from '../controllers/user.controller.js';
import { authenticate, authorizeRole, authorizePermission } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import {
  listUsersSchema,
  userIdSchema,
  createUserSchema,
  updateUserSchema,
} from '../validators/user.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canReadUsers = [...adminOnly, authorizePermission(permissions.usersRead)];
const canWriteUsers = [...adminOnly, authorizePermission(permissions.usersWrite)];

router.get('/', ...canReadUsers, validate(listUsersSchema), UserController.list);
router.post('/', ...canWriteUsers, validate(createUserSchema), UserController.create);
router.post('/:id/activate', ...canWriteUsers, validate(userIdSchema), UserController.activate);
router.post('/:id/deactivate', ...canWriteUsers, validate(userIdSchema), UserController.deactivate);
router.get('/:id', ...canReadUsers, validate(userIdSchema), UserController.get);
router.patch('/:id', ...canWriteUsers, validate(updateUserSchema), UserController.update);
router.delete('/:id', ...canWriteUsers, validate(userIdSchema), UserController.remove);

export default router;
