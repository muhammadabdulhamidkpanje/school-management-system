import assert from 'node:assert/strict';
import { test } from 'node:test';
import { uploadFile } from '../src/services/upload.service.js';

test('upload service rejects content without a supported file signature', async () => {
  await assert.rejects(
    uploadFile({
      buffer: Buffer.from('not a file'),
      originalname: 'unknown.bin',
      size: 10,
    }, 'admission'),
    /Unsupported file type/,
  );
});

test('upload service rejects empty files before contacting Cloudinary', async () => {
  await assert.rejects(
    uploadFile({
      buffer: Buffer.alloc(0),
      originalname: 'empty.pdf',
      size: 0,
    }, 'authenticated'),
    /File must be between 1 byte and 20 MB/,
  );
});
