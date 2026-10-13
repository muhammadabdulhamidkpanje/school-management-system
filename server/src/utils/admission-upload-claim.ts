import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';

interface ClaimableUpload {
  publicId: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
}

const claimPayload = (upload: ClaimableUpload) =>
  JSON.stringify([upload.publicId, upload.fileUrl, upload.mimeType, upload.fileSize]);

const signature = (payload: string) => {
  const secret = env.CLOUDINARY_API_SECRET;
  if (!secret) throw new Error('CLOUDINARY_API_SECRET is not configured');
  return createHmac('sha256', secret).update(payload).digest();
};

export const createAdmissionUploadClaim = (upload: ClaimableUpload) => {
  const issuedAt = Date.now();
  const payload = Buffer.from(claimPayload(upload)).toString('base64url');
  const signedValue = `${issuedAt}.${payload}`;
  return `${signedValue}.${signature(signedValue).toString('base64url')}`;
};

export const verifyAdmissionUploadClaim = (upload: ClaimableUpload, claim: string) => {
  const [issuedAt, payload, suppliedSignature, ...extra] = claim.split('.');
  if (!issuedAt || !payload || !suppliedSignature || extra.length > 0) return false;
  const timestamp = Number(issuedAt);
  if (!Number.isSafeInteger(timestamp) || timestamp > Date.now() + 60_000 || Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
    return false;
  }
  const signedValue = `${issuedAt}.${payload}`;
  const supplied = Buffer.from(suppliedSignature, 'base64url');
  const expected = signature(signedValue);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return false;
  return Buffer.from(payload, 'base64url').toString('utf8') === claimPayload(upload);
};
