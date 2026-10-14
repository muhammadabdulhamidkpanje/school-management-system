import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  assignTeacherSchema,
  createCourseOfferingSchema,
  listCourseOfferingsSchema,
} from '../src/validators/course-offering.validator.js';

const offeringId = 'cm8nc5s8n0000m8f7u0s3t4p5';
const staffId = 'cm8nc5s8n0000m8f7u0s3t4p6';
const classroomId = 'cm8nc5s8n0000m8f7u0s3t4p7';
const semesterId = 'cm8nc5s8n0000m8f7u0s3t4p8';

test('course-offering list applies pagination defaults and bounds', () => {
  assert.deepEqual(
    listCourseOfferingsSchema.parse({ query: {} }).query,
    { page: 1, limit: 20 },
  );
  assert.deepEqual(
    listCourseOfferingsSchema.parse({ query: { page: '2', limit: '50' } }).query,
    { page: 2, limit: 50 },
  );
  assert.throws(() =>
    listCourseOfferingsSchema.parse({ query: { page: '0' } }),
  );
  assert.throws(() =>
    listCourseOfferingsSchema.parse({ query: { limit: '101' } }),
  );
});

test('course-offering teacher assignment accepts a staff ID or null', () => {
  assert.equal(
    assignTeacherSchema.parse({
      params: { id: offeringId },
      body: { teacherId: staffId },
    }).body.teacherId,
    staffId,
  );
  assert.equal(
    assignTeacherSchema.parse({
      params: { id: offeringId },
      body: { teacherId: null },
    }).body.teacherId,
    null,
  );
  assert.throws(() =>
    assignTeacherSchema.parse({
      params: { id: offeringId },
      body: { teacherId: '' },
    }),
  );
});

test('course offering creation requires a catalog course, class, and semester', () => {
  assert.deepEqual(
    createCourseOfferingSchema.parse({
      body: { courseId: staffId, classroomId, semesterId },
    }).body,
    { courseId: staffId, classroomId, semesterId },
  );
  assert.throws(() =>
    createCourseOfferingSchema.parse({
      body: { courseId: staffId, classroomId, semesterId: '', extra: true },
    }),
  );
  assert.throws(() =>
    createCourseOfferingSchema.parse({
      body: { subjectId: staffId, classroomId, semesterId },
    }),
  );
});
