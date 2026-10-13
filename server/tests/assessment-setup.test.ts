import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createAssessmentSchema } from '../src/validators/assessment.validator.js';
import { createExamSchema } from '../src/validators/exam.validator.js';
import { createScoreSchema } from '../src/validators/score.validator.js';
import { calculateGrade } from '../src/utils/grade.js';
import { publicationSchema as assessmentPublicationSchema } from '../src/validators/assessment.validator.js';
import { buildReportSummary } from '../src/utils/report-card.js';
import { assertResultEditable } from '../src/utils/result-lock.js';
import {
  createFeeSchema,
  createPaymentSchema,
  createPaystackPaymentSchema,
  verifyPaystackPaymentSchema,
} from '../src/validators/finance.validator.js';

test('assessment validator accepts valid assessment payload', () => {
  const parsed = createAssessmentSchema.parse({
    body: {
      courseOfferingId: 'cm8nc5s8n0000m8f7u0s3t4p5',
      title: 'Mid-semester test',
      type: 'TEST',
      weight: 20,
      maxMarks: 100,
      dueDate: '2026-10-15T00:00:00.000Z',
    },
  });

  assert.equal(parsed.body.title, 'Mid-semester test');
  assert.equal(parsed.body.type, 'TEST');
  assert.equal(parsed.body.weight, 20);
});

test('exam validator accepts valid exam payload', () => {
  const parsed = createExamSchema.parse({
    body: {
      courseOfferingId: 'cm8nc5s8n0000m8f7u0s3t4p5',
      title: 'Final exam',
      examType: 'FINAL',
      date: '2026-12-15T09:00:00.000Z',
      durationMinutes: 120,
      totalMarks: 100,
    },
  });

  assert.equal(parsed.body.title, 'Final exam');
  assert.equal(parsed.body.examType, 'FINAL');
  assert.equal(parsed.body.durationMinutes, 120);
});

test('score validator accepts a score for an assessment', () => {
  const parsed = createScoreSchema.parse({
    body: {
      studentId: 'cm8nc5s8n0000m8f7u0s3t4p5',
      assessmentId: 'cm8nc5s8n0000m8f7u0s3t4p6',
      marks: 78,
    },
  });

  assert.equal(parsed.body.marks, 78);
  assert.equal(parsed.body.assessmentId, 'cm8nc5s8n0000m8f7u0s3t4p6');
});

test('score validator rejects a score targeting both an assessment and an exam', () => {
  assert.throws(() => createScoreSchema.parse({
    body: {
      studentId: 'cm8nc5s8n0000m8f7u0s3t4p5',
      assessmentId: 'cm8nc5s8n0000m8f7u0s3t4p6',
      examId: 'cm8nc5s8n0000m8f7u0s3t4p7',
      marks: 78,
    },
  }));
});

test('grade calculation returns percentage and letter grade', () => {
  assert.deepEqual(calculateGrade(78, 100), { percentage: 78, letter: 'A' });
  assert.deepEqual(calculateGrade(39, 100), { percentage: 39, letter: 'F' });
});

test('publication validator requires an explicit published state', () => {
  const parsed = assessmentPublicationSchema.parse({
    params: { id: 'cm8nc5s8n0000m8f7u0s3t4p6' },
    body: { published: true },
  });

  assert.equal(parsed.body.published, true);
});

test('report summary aggregates published scores', () => {
  assert.deepEqual(buildReportSummary([
    { marks: 80, maxMarks: 100 },
    { marks: 30, maxMarks: 50 },
  ]), {
    totalMarks: 110,
    maxMarks: 150,
    percentage: 73.33,
    letter: 'A',
  });
});

test('published results are locked from mutation', () => {
  assert.doesNotThrow(() => assertResultEditable(false));
  assert.throws(() => assertResultEditable(true), /published result is locked/i);
});

test('finance validators accept a fee and payment payload', () => {
  const fee = createFeeSchema.parse({ body: { name: 'Tuition', code: 'TUITION', amount: '125000.00', currency: 'NGN' } });
  const payment = createPaymentSchema.parse({ body: {
    invoiceId: 'cm8nc5s8n0000m8f7u0s3t4p6', amount: '25000.00', method: 'BANK_TRANSFER',
  } });

  assert.equal(fee.body.amount, 125000);
  assert.equal(payment.body.amount, 25000);
});

test('Paystack payment validators require an invoice and transaction reference', () => {
  assert.equal(createPaystackPaymentSchema.parse({ body: {
    invoiceId: 'cm8nc5s8n0000m8f7u0s3t4p6', email: 'student@example.com',
  } }).body.email, 'student@example.com');
  assert.equal(verifyPaystackPaymentSchema.parse({ params: { reference: 'paystack-ref-123' } }).params.reference, 'paystack-ref-123');
});
