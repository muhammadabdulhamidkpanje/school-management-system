import { Router } from 'express';
import * as StaffController from '../controllers/staff.controller.js';
import { authenticate, authorizeRole, authorizePermission } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import { staffIdSchema, listStaffSchema, createStaffSchema, updateStaffSchema, importStaffSchema } from '../validators/staff.validator.js';
import multer, { MulterError } from 'multer';
import type { RequestHandler } from 'express';
import { BadRequestError } from '../errors/errors.js';

const router = Router();
const staffDocumentsUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5, fields: 1, parts: 6 },
});
const receiveCreatePayload: RequestHandler = (req, res, next) => {
  staffDocumentsUpload.array('documents', 5)(req, res, error => {
    if (error instanceof MulterError) {
      next(new BadRequestError(
        error.code === 'LIMIT_FILE_SIZE'
          ? 'Staff qualification documents cannot exceed 10 MB'
          : 'Invalid staff multipart upload',
      ));
      return;
    }
    if (error) {
      next(error);
      return;
    }
    if (req.is('multipart/form-data')) {
      if (typeof req.body.payload !== 'string') {
        next(new BadRequestError('Multipart field "payload" is required'));
        return;
      }
      try {
        req.body = JSON.parse(req.body.payload);
      } catch {
        next(new BadRequestError('Multipart field "payload" must contain valid JSON'));
        return;
      }
    }
    next();
  });
};

const adminOnly = [authenticate, authorizeRole('admin')];
const canRead = [...adminOnly, authorizePermission(permissions.staffRead)];
const canWrite = [...adminOnly, authorizePermission(permissions.staffWrite)];

router.get('/', ...canRead, validate(listStaffSchema), StaffController.list);
router.post('/', ...canWrite, receiveCreatePayload, validate(createStaffSchema), StaffController.create);
router.get('/export.csv', ...canRead, StaffController.exportCsv);
router.post('/import', ...canWrite, validate(importStaffSchema), StaffController.importCsv);
router.get('/:id', ...canRead, validate(staffIdSchema), StaffController.get);
router.patch('/:id', ...canWrite, validate(updateStaffSchema), StaffController.update);
router.delete('/:id', ...canWrite, validate(staffIdSchema), StaffController.remove);

export default router;
