import { Router } from 'express';
import * as RoleController from '../controllers/role.controller.js';
import { authenticate, authorizeRole, authorizePermission } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import { assignPermissionsSchema } from '../validators/permission.validator.js';
import {
  roleIdSchema,
  listRolesSchema,
  createRoleSchema,
  updateRoleSchema,
} from '../validators/role.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canReadRoles = [...adminOnly, authorizePermission(permissions.rolesRead)];
const canWriteRoles = [...adminOnly, authorizePermission(permissions.rolesWrite)];
const canAssignPermissions = [...adminOnly, authorizePermission(permissions.permissionsWrite)];

router.get('/', ...canReadRoles, validate(listRolesSchema), RoleController.list);
router.post('/', ...canWriteRoles, validate(createRoleSchema), RoleController.create);
router.get('/:id', ...canReadRoles, validate(roleIdSchema), RoleController.get);
router.patch('/:id', ...canWriteRoles, validate(updateRoleSchema), RoleController.update);
router.put('/:id/permissions', ...canAssignPermissions, validate(assignPermissionsSchema), RoleController.assignPermissions);
router.delete('/:id', ...canWriteRoles, validate(roleIdSchema), RoleController.remove);

export default router;
