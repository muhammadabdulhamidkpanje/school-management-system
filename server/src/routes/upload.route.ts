import { Router } from 'express';
import multer, { MulterError } from 'multer';
import { rateLimit } from 'express-rate-limit';
import * as UploadController from '../controllers/upload.controller.js';
import { authenticate, authorizePermission, authorizeRole } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { BadRequestError } from '../errors/errors.js';
import type { RequestHandler } from 'express';

const router = Router();
const maxFileSize = 20 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSize, files: 1, fields: 5, parts: 6 },
});

const receiveSingleFile: RequestHandler = (req, res, next) => {
  upload.single('file')(req, res, error => {
    if (error instanceof MulterError) {
      next(new BadRequestError(
        error.code === 'LIMIT_FILE_SIZE'
          ? 'File exceeds the 20 MB upload limit'
          : 'Invalid multipart upload',
      ));
      return;
    }
    next(error);
  });
};

const admissionUploadLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many admission file uploads; try again later' },
});

const adminOnly = [authenticate, authorizeRole('admin')];
const canUploadPrivateFiles = [...adminOnly, authorizePermission(permissions.uploadsWrite)];

router.post('/admission', admissionUploadLimit, receiveSingleFile, UploadController.uploadAdmissionFile);
router.post('/', ...canUploadPrivateFiles, receiveSingleFile, UploadController.uploadPrivateFile);

export default router;
