import { createCipheriv, randomBytes } from 'node:crypto';

export interface StaffBankDetails {
  bankName: string;
  accountNumber: string;
  bvn: string;
}

export const encryptStaffBankDetails = (
  details: StaffBankDetails,
  keyHex: string,
) => {
  const key = Buffer.from(keyHex, 'hex');
  if (key.length !== 32) {
    throw new Error('Staff private-data key must be exactly 32 bytes');
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from('staff-private-data:v1'));
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(details), 'utf8'),
    cipher.final(),
  ]);

  return [
    'v1',
    iv.toString('base64url'),
    cipher.getAuthTag().toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.');
};
