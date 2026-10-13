import type { RequestHandler } from 'express';
import { z } from 'zod';
import { BadRequestError } from '../errors/errors.js';

const dateOnly = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a valid ISO date (YYYY-MM-DD)')
  .refine(value => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Must be a valid ISO date (YYYY-MM-DD)');

const resultSchema = z.object({
  subject: z.string().trim().min(1).max(100),
  grade: z.string().trim().min(1).max(20),
}).strict();

export const admissionDocumentSchema = z.object({
  documentType: z.string().trim().min(1).max(60).regex(/^[A-Z][A-Z0-9_]*$/),
  fileName: z.string().trim().min(1).max(255),
  fileUrl: z.string().url().refine(value => value.startsWith('https://'), 'File URL must use HTTPS'),
  mimeType: z.string().trim().min(1).max(150),
  fileSize: z.number().int().positive().max(20 * 1024 * 1024),
  publicId: z.string().trim().min(1).max(500).optional(),
  resourceType: z.enum(['image', 'raw', 'video']).optional(),
  claimToken: z.string().min(1).max(500).optional(),
}).strict();

const requestType = z.enum([
  'DOCUMENT',
  'PERSONAL_INFORMATION',
  'ACADEMIC_INFORMATION',
  'ACADEMIC_RESULT',
  'CORRECTION',
  'OTHER',
]);

const admissionSubmissionBodySchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  middleName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  dateOfBirth: dateOnly,
  gender: z.string().trim().min(1).max(30),
  nationality: z.string().trim().min(1).max(100),
  stateOfOrigin: z.string().trim().min(1).max(100),
  lga: z.string().trim().min(1).max(100),
  religion: z.string().trim().max(100).optional(),
  academicSessionId: z.string().cuid(),
  classId: z.string().cuid(),
  results: z.array(resultSchema).min(1).max(20)
    .superRefine((results, ctx) => {
      const subjects = results.map(result => result.subject.toLocaleLowerCase());
      if (new Set(subjects).size !== subjects.length) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['results'], message: 'Duplicate subjects are not allowed' });
      }
    }),
  documents: z.array(admissionDocumentSchema).min(1).max(20)
    .superRefine((documents, ctx) => {
      const types = documents.map(document => document.documentType);
      if (new Set(types).size !== types.length) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['documents'], message: 'Duplicate document types are not allowed' });
      }
      for (const required of ['PASSPORT', 'BIRTH_CERTIFICATE', 'SCHOOL_RESULT', 'MEDICAL_REPORT']) {
        if (!types.includes(required)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['documents'], message: `${required} document is required` });
        }
      }
    }),
}).strict();

const documentTypes: Record<string, string> = {
  passport: 'PASSPORT',
  birth_certificate: 'BIRTH_CERTIFICATE',
  school_result: 'SCHOOL_RESULT',
  medical_report: 'MEDICAL_REPORT',
  indigene_certificate: 'INDIGENE_CERTIFICATE',
  transfer_certificate: 'TRANSFER_CERTIFICATE',
};

const normalizeSubmission = (input: unknown): unknown => {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return input;
  const normalized = { ...input } as Record<string, unknown>;
  const aliases: Record<string, string> = {
    first_name: 'firstName',
    middle_name: 'middleName',
    last_name: 'lastName',
    date_of_birth: 'dateOfBirth',
    state: 'stateOfOrigin',
    sessionId: 'academicSessionId',
    classroomId: 'classId',
  };
  for (const [alias, canonical] of Object.entries(aliases)) {
    if (normalized[canonical] === undefined && normalized[alias] !== undefined) {
      normalized[canonical] = normalized[alias];
    }
    delete normalized[alias];
  }

  if (Array.isArray(normalized.documents) === false && typeof normalized.documents === 'object' && normalized.documents !== null) {
    normalized.documents = Object.entries(normalized.documents).map(([key, value]) => {
      if (typeof value !== 'object' || value === null) return value;
      const file = value as Record<string, unknown>;
      return {
        documentType: documentTypes[key] ?? key.toUpperCase(),
        fileName: file.fileName ?? file.name,
        fileUrl: file.fileUrl ?? file.url,
        mimeType: file.mimeType ?? file.mime_type,
        fileSize: file.fileSize ?? file.size,
        publicId: file.publicId,
        resourceType: file.resourceType,
        claimToken: file.claimToken,
      };
    });
  }

  if (!Array.isArray(normalized.results)) {
    const results: { subject: string; grade: unknown }[] = [];
    if (typeof normalized.english === 'string') results.push({ subject: 'English', grade: normalized.english });
    if (typeof normalized.math === 'string') results.push({ subject: 'Mathematics', grade: normalized.math });
    if (Array.isArray(normalized.other_courses)) {
      for (const item of normalized.other_courses) {
        if (typeof item === 'object' && item !== null) {
          const course = item as Record<string, unknown>;
          results.push({ subject: String(course.course ?? ''), grade: course.grade });
        }
      }
    }
    if (results.length > 0) normalized.results = results;
  }
  for (const key of ['english', 'math', 'other_courses', 'reg_number']) {
    delete normalized[key];
  }
  return normalized;
};

export const admissionSubmissionSchema = z.object({
  body: z.preprocess(normalizeSubmission, admissionSubmissionBodySchema),
});

export const informationRequestSchema = z.object({
  body: z.object({
    message: z.string().trim().min(1).max(2000),
    items: z.array(z.object({
      type: requestType,
      field: z.string().trim().min(1).max(100).optional(),
      documentType: z.string().trim().min(1).max(60).optional(),
      message: z.string().trim().min(1).max(1000),
    }).strict()).min(1).max(20).superRefine((items, ctx) => {
      items.forEach((item, index) => {
        if (item.type === 'DOCUMENT' && !item.documentType) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, 'documentType'],
            message: 'Document type is required for document requests',
          });
        }
      });
    }),
  }).strict(),
});

export const informationResponseSchema = z.object({
  body: z.object({
    response: z.string().trim().min(1).max(2000),
    document: admissionDocumentSchema.optional(),
  }).strict(),
});

export const resolveInformationRequestSchema = z.object({
  body: z.object({
    message: z.string().trim().max(1000).optional(),
  }).strict(),
});

export const approveAdmissionSchema = z.object({
  body: z.object({ classId: z.string().cuid() }).strict(),
});

export const rejectAdmissionSchema = z.object({
  body: z.object({ reason: z.string().trim().min(1).max(2000) }).strict(),
});

export const admissionListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum([
      'PENDING',
      'UNDER_REVIEW',
      'MORE_INFORMATION_REQUIRED',
      'APPROVED',
      'REJECTED',
      'WITHDRAWN',
      'ENROLLED',
    ]).optional(),
  }),
});

export const admissionIdSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
});

export const admissionClassOptionsSchema = z.object({
  query: z.object({ academicSessionId: z.string().cuid() }),
});

export const informationRequestIdSchema = z.object({
  params: z.object({ id: z.string().cuid(), requestId: z.string().cuid() }),
});

export const validateAdmissionSubmission: RequestHandler = async (req, _res, next) => {
  try {
    const parsed = await admissionSubmissionSchema.parseAsync({ body: req.body });
    req.body = parsed.body;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      for (const issue of error.issues) {
        const path = issue.path.filter(part => part !== 'body').join('.');
        if (path && errors[path] === undefined) errors[path] = issue.message;
      }
      next(new BadRequestError('Validation failed', errors));
      return;
    }
    next(error);
  }
};
