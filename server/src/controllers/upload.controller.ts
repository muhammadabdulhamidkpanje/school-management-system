import type { Request, Response } from 'express';
import { asyncHandler } from '../errors/asyncHandler.js';
import { BadRequestError } from '../errors/errors.js';
import { sendCreated } from '../utils/response.js';
import * as UploadService from '../services/upload.service.js';

export const uploadAdmissionFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new BadRequestError('Multipart field "file" is required');
  sendCreated(res, await UploadService.uploadFile(req.file, 'admission'), 'Admission file uploaded');
});

export const uploadPrivateFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new BadRequestError('Multipart field "file" is required');
  sendCreated(res, await UploadService.uploadFile(req.file, 'authenticated'), 'File uploaded');
});
