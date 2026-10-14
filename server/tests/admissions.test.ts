import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  admissionClassOptionsSchema,
  admissionSubmissionSchema,
  informationRequestSchema,
  informationResponseSchema,
  approveAdmissionSchema,
} from '../src/validators/admission.validator.js';
import { getMissingAdmissionSubjects } from '../src/utils/admission-results.js';

const sessionId = 'cm8nc5s8n0000m8f7u0s3t4p5';
const classId = 'cm8nc5s8n0000m8f7u0s3t4p6';

const documents = [
  { documentType: 'PASSPORT', fileName: 'passport.jpg', fileUrl: 'https://files.example.com/passport.jpg', mimeType: 'image/jpeg', fileSize: 245000 },
  { documentType: 'BIRTH_CERTIFICATE', fileName: 'birth-cert.pdf', fileUrl: 'https://files.example.com/birth-cert.pdf', mimeType: 'application/pdf', fileSize: 320000 },
  { documentType: 'SCHOOL_RESULT', fileName: 'result.pdf', fileUrl: 'https://files.example.com/result.pdf', mimeType: 'application/pdf', fileSize: 510000 },
  { documentType: 'MEDICAL_REPORT', fileName: 'medical.pdf', fileUrl: 'https://files.example.com/medical.pdf', mimeType: 'application/pdf', fileSize: 430000 },
];

const validSubmission = {
  firstName: 'Ada',
  middleName: 'Ehi',
  lastName: 'Okafor',
  email: 'ada.okafor@example.com',
  phone: '+234 801 234 5678',
  dateOfBirth: '2008-06-14',
  gender: 'Female',
  nationality: 'Nigerian',
  stateOfOrigin: 'Lagos',
  lga: 'Ikeja',
  religion: 'Christianity',
  academicSessionId: sessionId,
  classId,
  results: [
    { subject: 'English', grade: 'A1' },
    { subject: 'Mathematics', grade: 'B2' },
    { subject: 'Biology', grade: 'A1' },
  ],
  documents,
};

test('public admission class options require a CUID session ID', () => {
  assert.equal(
    admissionClassOptionsSchema.parse({ query: { academicSessionId: sessionId } }).query.academicSessionId,
    sessionId,
  );
  assert.throws(() => admissionClassOptionsSchema.parse({ query: { academicSessionId: 'D1233' } }));
});

test('admission schema accepts canonical payload with additional document types', () => {
  const parsed = admissionSubmissionSchema.parse({
    body: {
      ...validSubmission,
      documents: [
        ...documents,
        { documentType: 'TRANSFER_CERTIFICATE', fileName: 'transfer.pdf', fileUrl: 'https://files.example.com/transfer.pdf', mimeType: 'application/pdf', fileSize: 290000 },
        { documentType: 'CUSTOM_SUPPORTING_DOCUMENT', fileName: 'award.pdf', fileUrl: 'https://files.example.com/award.pdf', mimeType: 'application/pdf', fileSize: 100000 },
      ],
    },
  });

  assert.equal(parsed.body.firstName, 'Ada');
  assert.equal(parsed.body.academicSessionId, sessionId);
  assert.equal(parsed.body.results[2]?.subject, 'Biology');
  assert.equal(parsed.body.documents[5]?.documentType, 'CUSTOM_SUPPORTING_DOCUMENT');
});

test('admission schema normalizes legacy snake_case submission fields', () => {
  const parsed = admissionSubmissionSchema.parse({
    body: {
      first_name: 'Ada',
      middle_name: 'Ehi',
      last_name: 'Okafor',
      email: 'ada.okafor@example.com',
      phone: '+234 801 234 5678',
      date_of_birth: '2008-06-14',
      gender: 'Female',
      nationality: 'Nigerian',
      state: 'Lagos',
      lga: 'Ikeja',
      academicSessionId: sessionId,
      classroomId: classId,
      english: 'A1',
      math: 'B2',
      other_courses: [{ course: 'Biology', grade: 'A1' }],
      documents: {
        passport: { name: 'passport.jpg', url: 'https://files.example.com/passport.jpg', mime_type: 'image/jpeg', size: 245000 },
        birth_certificate: { name: 'birth.pdf', url: 'https://files.example.com/birth.pdf', mime_type: 'application/pdf', size: 100000 },
        school_result: { name: 'result.pdf', url: 'https://files.example.com/result.pdf', mime_type: 'application/pdf', size: 100000 },
        medical_report: { name: 'medical.pdf', url: 'https://files.example.com/medical.pdf', mime_type: 'application/pdf', size: 100000 },
      },
    },
  });

  assert.equal(parsed.body.firstName, 'Ada');
  assert.equal(parsed.body.stateOfOrigin, 'Lagos');
  assert.equal(parsed.body.results.length, 3);
  assert.equal(parsed.body.documents[0]?.documentType, 'PASSPORT');
});

test('admission schema rejects duplicate subjects and client-supplied status', () => {
  assert.throws(() => admissionSubmissionSchema.parse({
    body: { ...validSubmission, results: [{ subject: 'English', grade: 'A1' }, { subject: 'English', grade: 'B2' }] },
  }));
  assert.throws(() => admissionSubmissionSchema.parse({ body: { ...validSubmission, status: 'PENDING' } }));
});

test('configured required admission subjects are matched case-insensitively', () => {
  assert.deepEqual(
    getMissingAdmissionSubjects(['English', 'Mathematics'], ['ENGLISH', 'mathematics', 'Biology']),
    [],
  );
  assert.deepEqual(
    getMissingAdmissionSubjects(['English', 'Mathematics'], ['English']),
    ['Mathematics'],
  );
});

test('admission schema rejects malformed ISO dates and oversized or insecure documents', () => {
  assert.throws(() => admissionSubmissionSchema.parse({ body: { ...validSubmission, dateOfBirth: '2008-02-30' } }));
  assert.throws(() => admissionSubmissionSchema.parse({
    body: { ...validSubmission, documents: [{ ...documents[0], fileUrl: 'http://files.example.com/passport.jpg' }, ...documents.slice(1)] },
  }));
  assert.throws(() => admissionSubmissionSchema.parse({
    body: { ...validSubmission, documents: [{ ...documents[0], fileSize: 21 * 1024 * 1024 }, ...documents.slice(1)] },
  }));
});

test('information request and response validators accept valid request data', () => {
  const request = informationRequestSchema.parse({
    body: {
      message: 'Please provide a clearer document.',
      items: [{ type: 'DOCUMENT', documentType: 'BIRTH_CERTIFICATE', message: 'The copy is not readable.' }],
    },
  });
  const response = informationResponseSchema.parse({
    body: {
      response: 'I have uploaded a clearer copy.',
      document: {
        documentType: 'BIRTH_CERTIFICATE',
        fileName: 'birth-certificate-new.pdf',
        fileUrl: 'https://files.example.com/birth-new.pdf',
        mimeType: 'application/pdf',
        fileSize: 450000,
      },
    },
  });
  assert.equal(request.body.items[0]?.type, 'DOCUMENT');
  assert.equal(response.body.document?.documentType, 'BIRTH_CERTIFICATE');
});

test('approve validator requires a final placement and rejects client status', () => {
  assert.equal(approveAdmissionSchema.parse({ body: { classId } }).body.classId, classId);
  assert.throws(() => approveAdmissionSchema.parse({ body: { classId, status: 'APPROVED' } }));
});
