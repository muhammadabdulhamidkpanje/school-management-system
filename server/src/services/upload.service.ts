import { fileTypeFromBuffer } from 'file-type';
import type { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { AppError } from '../errors/appError.js';
import { BadRequestError } from '../errors/errors.js';
import { getCloudinary } from '../config/cloudinary.js';
import { createAdmissionUploadClaim } from '../utils/admission-upload-claim.js';

const maxUploadBytes = 20 * 1024 * 1024;
const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

export interface IncomingUpload {
  buffer: Buffer;
  originalname: string;
  size: number;
}

export type UploadAudience = 'admission' | 'authenticated' | 'staff-qualification';

const uploadToCloudinary = (
  buffer: Buffer,
  options: UploadApiOptions,
): Promise<UploadApiResponse> => new Promise((resolve, reject) => {
  try {
    const cloudinary = getCloudinary();
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(new AppError('Cloudinary could not store the uploaded file', 502));
        return;
      }
      if (!result) {
        reject(new AppError('Cloudinary returned no upload result', 502));
        return;
      }
      resolve(result);
    });
    stream.end(buffer);
  } catch (error) {
    reject(error);
  }
});

const detectUploadType = async (file: IncomingUpload) => {
  if (file.size === 0 || file.size > maxUploadBytes) {
    throw new BadRequestError('File must be between 1 byte and 20 MB');
  }
  const detected = await fileTypeFromBuffer(file.buffer);
  if (!detected || !allowedMimeTypes.has(detected.mime)) {
    throw new BadRequestError('Unsupported file type; upload a JPEG, PNG, WEBP, GIF, or PDF');
  }
  return detected;
};

const safeOriginalName = (name: string) =>
  name.replace(/[^\w.\-() ]/g, '_').slice(-180) || 'upload';

const pendingAdmissionPrefix = 'school-management/admissions/pending/';
const staffQualificationPrefix = 'school-management/staff/qualifications/';

const withAdmissionPublicIds = async (
  documents: Array<{ publicId?: string | null; resourceType?: string | null }>,
  action: 'retain' | 'delete',
) => {
  const cloudinary = getCloudinary();
  for (const document of documents) {
    if (!document.publicId) continue;
    if (!document.publicId.startsWith(pendingAdmissionPrefix) || !document.resourceType) {
      throw new BadRequestError('Admission document is not a managed temporary upload');
    }
    try {
      if (action === 'retain') {
        await cloudinary.uploader.add_tag('admitted', [document.publicId], {
          resource_type: document.resourceType,
          type: 'upload',
        });
        await cloudinary.uploader.remove_tag('temporary', [document.publicId], {
          resource_type: document.resourceType,
          type: 'upload',
        });
      } else {
        await cloudinary.uploader.destroy(document.publicId, {
          resource_type: document.resourceType,
          type: 'upload',
          invalidate: true,
        });
      }
    } catch {
      throw new AppError(
        action === 'retain'
          ? 'Admission was approved, but uploaded file retention could not be updated'
          : 'Admission was rejected, but uploaded files could not be removed',
        502,
      );
    }
  }
};

export const retainAdmissionFiles = (documents: Array<{ publicId?: string | null; resourceType?: string | null }>) =>
  withAdmissionPublicIds(documents, 'retain');

export const deleteRejectedAdmissionFiles = (documents: Array<{ publicId?: string | null; resourceType?: string | null }>) =>
  withAdmissionPublicIds(documents, 'delete');

export const uploadFile = async (file: IncomingUpload, audience: UploadAudience) => {
  const detected = await detectUploadType(file);
  const isAdmissionUpload = audience === 'admission';
  const isStaffQualification = audience === 'staff-qualification';
  const folder = isAdmissionUpload
    ? 'school-management/admissions/pending'
    : isStaffQualification
      ? 'school-management/staff/qualifications'
      : 'school-management/private';
  const options: UploadApiOptions = {
    folder,
    resource_type: 'auto',
    filename_override: safeOriginalName(file.originalname),
    use_filename: false,
    unique_filename: true,
    overwrite: false,
    access_mode: isAdmissionUpload ? 'public' : 'authenticated',
    type: isAdmissionUpload ? 'upload' : 'authenticated',
    tags: isAdmissionUpload
      ? ['admission', 'temporary']
      : isStaffQualification
        ? ['staff-qualification']
        : ['private-upload'],
  };

  const result = await uploadToCloudinary(file.buffer, options);
  const cloudinary = getCloudinary();
  const fileUrl = isAdmissionUpload
    ? result.secure_url
    : cloudinary.url(result.public_id, {
      secure: true,
      resource_type: result.resource_type,
      type: 'authenticated',
      sign_url: true,
      format: result.format,
    });

  const uploadedFile = {
    publicId: result.public_id,
    fileName: safeOriginalName(file.originalname),
    fileUrl,
    mimeType: detected.mime,
    fileSize: result.bytes,
    resourceType: result.resource_type,
    access: isAdmissionUpload ? 'public' : 'authenticated',
  };
  return {
    ...uploadedFile,
    ...(isAdmissionUpload && {
      claimToken: createAdmissionUploadClaim({
        publicId: uploadedFile.publicId,
        fileUrl: uploadedFile.fileUrl,
        mimeType: uploadedFile.mimeType,
        fileSize: uploadedFile.fileSize,
      }),
    }),
  };
};

export const deleteStaffQualificationFiles = async (
  documents: Array<{ publicId: string; resourceType: string }>,
) => {
  const cloudinary = getCloudinary();
  for (const document of documents) {
    if (!document.publicId.startsWith(staffQualificationPrefix)) {
      throw new BadRequestError('Staff qualification document is not a managed upload');
    }
    try {
      const result = await cloudinary.uploader.destroy(document.publicId, {
        resource_type: document.resourceType,
        type: 'authenticated',
        invalidate: true,
      });
      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error(`Unexpected Cloudinary deletion result: ${result.result}`);
      }
    } catch {
      throw new AppError('Uploaded staff qualification documents could not be removed', 502);
    }
  }
};
