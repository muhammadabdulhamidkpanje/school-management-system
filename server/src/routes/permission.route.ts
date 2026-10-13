import { Router } from 'express';
import * as PermissionController from '../controllers/permission.controller.js';
import { authenticate, authorizeRole, authorizePermission } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import {
  permissionIdSchema,
  listPermissionsSchema,
  createPermissionSchema,
  updatePermissionSchema,
} from '../validators/permission.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canReadPermissions = [...adminOnly, authorizePermission(permissions.permissionsRead)];
const canWritePermissions = [...adminOnly, authorizePermission(permissions.permissionsWrite)];

router.get('/', ...canReadPermissions, validate(listPermissionsSchema), PermissionController.list);
router.post('/', ...canWritePermissions, validate(createPermissionSchema), PermissionController.create);
router.get('/:id', ...canReadPermissions, validate(permissionIdSchema), PermissionController.get);
router.patch('/:id', ...canWritePermissions, validate(updatePermissionSchema), PermissionController.update);
router.delete('/:id', ...canWritePermissions, validate(permissionIdSchema), PermissionController.remove);

export default router;
