import assert from 'node:assert/strict';
import { createDecipheriv } from 'node:crypto';
import { test } from 'node:test';
import {
  createStaffSchema,
  staffOnboardingSchema,
  updateStaffSchema,
} from '../src/validators/staff.validator.js';
import { encryptStaffBankDetails } from '../src/utils/staff-private-data.js';

const validPayload = {
  bioData: {
    name: 'Ada Okafor',
    email: 'Ada.Okafor@example.com',
    dob: '1990-04-12',
    phone: '+2348000000000',
    address: '12 Example Road',
  },
  academics: [
    {
      level: 'Tertiary',
      institution: 'Example University',
      qualification: 'B.Sc Mathematics',
      year: 2012,
      documentIndex: 0,
    },
  ],
  departmentData: {
    departmentId: 'cm8nc5s8n0000m8f7u0s3t4p5',
    facultyId: 'cm8nc5s8n0000m8f7u0s3t4p6',
    position: 'Lecturer',
    employmentType: 'Full-time',
    employmentDate: '2026-10-08',
  },
  accountData: {
    bankName: 'Example Bank',
    accountNumber: '0123456789',
    bvn: '12345678901',
  },
  loginData: {
    email: 'ada.okafor@example.com',
    password: 'SecurePass1!',
  },
};

test('staff onboarding validates and normalizes the complete Add Staff payload', () => {
  const parsed = staffOnboardingSchema.parse(validPayload);
  assert.equal(parsed.bioData.email, 'ada.okafor@example.com');
  assert.equal(parsed.loginData.email, 'ada.okafor@example.com');
  assert.equal(parsed.academics[0]?.documentIndex, 0);
});

test('staff onboarding rejects client-only confirmation passwords and other unknown top-level fields', () => {
  assert.throws(() => staffOnboardingSchema.parse({
    ...validPayload,
    loginData: { ...validPayload.loginData, confirmPassword: 'SecurePass1!' },
  }));
  assert.throws(() => staffOnboardingSchema.parse({ ...validPayload, userId: 'attacker-selected-id' }));
});

test('staff creation keeps accepting the existing simple JSON payload', () => {
  const parsed = createStaffSchema.parse({
    body: { employeeNo: 'STF-001', firstName: 'Ada', lastName: 'Okafor' },
  });
  assert.equal('employeeNo' in parsed.body, true);
});

test('staff updates accept department, employment type, and active-state changes', () => {
  const parsed = updateStaffSchema.parse({
    params: { id: 'cm8nc5s8n0000m8f7u0s3t4p5' },
    body: {
      departmentId: 'cm8nc5s8n0000m8f7u0s3t4p6',
      employmentType: 'Full-time',
      isActive: false,
    },
  });

  assert.equal(parsed.body.departmentId, 'cm8nc5s8n0000m8f7u0s3t4p6');
  assert.equal(parsed.body.employmentType, 'Full-time');
  assert.equal(parsed.body.isActive, false);
});

test('staff onboarding rejects mismatched emails, future dates, and duplicate document indexes', () => {
  assert.throws(() => staffOnboardingSchema.parse({
    ...validPayload,
    loginData: { ...validPayload.loginData, email: 'different@example.com' },
  }));
  assert.throws(() => staffOnboardingSchema.parse({
    ...validPayload,
    bioData: { ...validPayload.bioData, dob: '2099-01-01' },
  }));
  assert.throws(() => staffOnboardingSchema.parse({
    ...validPayload,
    bioData: { ...validPayload.bioData, dob: '1990-02-30' },
  }));
  assert.throws(() => staffOnboardingSchema.parse({
    ...validPayload,
    academics: [
      validPayload.academics[0],
      { ...validPayload.academics[0], institution: 'Another University' },
    ],
  }));
});

test('bank details are encrypted with authenticated encryption and a fresh nonce', () => {
  const keyHex = Buffer.alloc(32, 7).toString('hex');
  const details = {
    bankName: 'Example Bank',
    accountNumber: '0123456789',
    bvn: '12345678901',
  };
  const encrypted = encryptStaffBankDetails(details, keyHex);
  const secondEncrypted = encryptStaffBankDetails(details, keyHex);
  assert.notEqual(encrypted, secondEncrypted);
  assert.equal(encrypted.includes(details.accountNumber), false);
  assert.equal(encrypted.includes(details.bvn), false);

  const [version, ivEncoded, tagEncoded, cipherEncoded] = encrypted.split('.');
  assert.equal(version, 'v1');
  const decipher = createDecipheriv(
    'aes-256-gcm',
    Buffer.from(keyHex, 'hex'),
    Buffer.from(ivEncoded!, 'base64url'),
  );
  decipher.setAAD(Buffer.from('staff-private-data:v1'));
  decipher.setAuthTag(Buffer.from(tagEncoded!, 'base64url'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(cipherEncoded!, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
  assert.deepEqual(JSON.parse(decrypted), details);
});

test('bank detail encryption rejects an invalid key length', () => {
  assert.throws(() => encryptStaffBankDetails(validPayload.accountData, 'abcd'));
});
