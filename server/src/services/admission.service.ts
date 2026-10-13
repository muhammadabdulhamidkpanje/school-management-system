import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import * as AdmissionRepo from '../repositories/admission.repositories.js';
import type {
  AdmissionInformationRequestBatchInput,
  AdmissionSubmissionInput,
} from '../types/admission.types.js';
import { getMissingAdmissionSubjects } from '../utils/admission-results.js';
import { verifyAdmissionUploadClaim } from '../utils/admission-upload-claim.js';
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '../errors/errors.js';
import * as UploadService from './upload.service.js';

const tokenHash = (token: string) => createHash('sha256').update(token).digest();

const requireAdmission = async (id: string) => {
  const admission = await AdmissionRepo.findAdmissionById(id);
  if (!admission) throw new NotFoundError('Admission');
  return admission;
};

const requireApplicantToken = async (id: string, token?: string) => {
  if (!token) throw new UnauthorizedError('Admission access token is required');
  const saved = await AdmissionRepo.findAdmissionTokenHash(id);
  if (!saved?.applicantTokenHash) throw new NotFoundError('Admission');
  const expected = Buffer.from(saved.applicantTokenHash, 'hex');
  const provided = tokenHash(token);
  if (!timingSafeEqual(expected, provided)) throw new UnauthorizedError('Invalid admission access token');
};

const requireSuccessfulTransition = <T>(result: T | null, message: string): T => {
  if (!result) throw new ConflictError(message);
  return result;
};

const audit = (action: string, id: string, actorId: string, ipAddress?: string) =>
  AdmissionRepo.createAuditLog({
    action,
    userId: actorId,
    recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });

const validateAdmissionUploads = (documents: AdmissionSubmissionInput['documents']) => {
  for (const document of documents) {
    if (!document.publicId && !document.claimToken && !document.resourceType) continue;
    if (!document.publicId || !document.claimToken || !document.resourceType) {
      throw new BadRequestError('Uploaded admission documents must include publicId, resourceType, and claimToken');
    }
    if (!document.publicId.startsWith('school-management/admissions/pending/')) {
      throw new BadRequestError('Admission uploads must come from the admission upload endpoint');
    }
    if (!verifyAdmissionUploadClaim({
      publicId: document.publicId,
      fileUrl: document.fileUrl,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
    }, document.claimToken)) {
      throw new BadRequestError('Admission upload claim is invalid or expired');
    }
  }
};

export const submitAdmission = async (input: AdmissionSubmissionInput) => {
  validateAdmissionUploads(input.documents);
  const session = await AdmissionRepo.findSessionForAdmission(input.academicSessionId);
  if (!session) throw new BadRequestError('Validation failed', { academicSessionId: 'Academic session does not exist.' });
  if (!session.admissionsOpen) {
    throw new BadRequestError('Validation failed', { academicSessionId: 'Academic session is not open for admission.' });
  }
  const missingSubjects = getMissingAdmissionSubjects(
    session.requiredAdmissionSubjects,
    input.results.map(result => result.subject),
  );
  if (missingSubjects.length > 0) {
    throw new BadRequestError('Validation failed', {
      results: `Required results are missing: ${missingSubjects.join(', ')}`,
    });
  }
  if (!await AdmissionRepo.findClassroomForSession(input.classId, input.academicSessionId)) {
    throw new BadRequestError('Validation failed', { classId: 'Selected class does not exist or is unavailable for this academic session.' });
  }

  const applicantToken = randomBytes(32).toString('base64url');
  const applicationNumber = `ADM-${new Date().getUTCFullYear()}-${randomBytes(8).toString('hex').toUpperCase()}`;
  const admission = await AdmissionRepo.createSubmittedAdmission({
    data: {
      applicantFirstName: input.firstName,
      ...(input.middleName !== undefined && { applicantMiddleName: input.middleName }),
      applicantLastName: input.lastName,
      email: input.email,
      dateOfBirth: new Date(`${input.dateOfBirth}T00:00:00.000Z`),
      gender: input.gender,
      nationality: input.nationality,
      state: input.stateOfOrigin,
      lga: input.lga,
      ...(input.religion !== undefined && { religion: input.religion }),
      applicationNumber,
      applicantTokenHash: tokenHash(applicantToken).toString('hex'),
      session: { connect: { id: input.academicSessionId } },
      requestedClass: { connect: { id: input.classId } },
    },
    results: input.results,
    documents: input.documents,
  });
  return { admission, applicantToken };
};

export const listPublicAdmissionSessions = () =>
  AdmissionRepo.listPublicAdmissionSessions();

export const listPublicAdmissionClassrooms = async (sessionId: string) => {
  const session = await AdmissionRepo.findSessionForAdmission(sessionId);
  if (!session || !session.admissionsOpen) {
    throw new BadRequestError('Academic session is not open for admission');
  }
  return AdmissionRepo.listPublicAdmissionClassrooms(sessionId);
};

export const listAdmissions = async (page: number, limit: number, status?: string) => {
  const admissionStatus = status as
    | 'PENDING'
    | 'UNDER_REVIEW'
    | 'MORE_INFORMATION_REQUIRED'
    | 'APPROVED'
    | 'REJECTED'
    | 'WITHDRAWN'
    | 'ENROLLED'
    | undefined;
  const [admissions, total] = await AdmissionRepo.listAdmissions((page - 1) * limit, limit, admissionStatus);
  return { admissions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getAdmissionForAdmin = (id: string) => requireAdmission(id);

export const getAdmissionForApplicant = async (id: string, token?: string) => {
  await requireApplicantToken(id, token);
  const admission = await requireAdmission(id);
  return {
    id: admission.id,
    applicationNumber: admission.applicationNumber,
    status: admission.status,
    academicSessionId: admission.sessionId,
    requestedClassId: admission.requestedClassId,
    createdAt: admission.createdAt,
  };
};

export const getApplicantInformationRequests = async (id: string, token?: string) => {
  await requireApplicantToken(id, token);
  const admission = await requireAdmission(id);
  return admission.informationRequests.map(({ id: requestId, type, field, documentType, message, status, response, createdAt, resolvedAt }) => ({
    id: requestId, type, field, documentType, message, status, response, createdAt, resolvedAt,
  }));
};

export const reviewAdmission = async (id: string, actorId: string, ipAddress?: string) => {
  const result = requireSuccessfulTransition(
    await AdmissionRepo.moveToReview(id, actorId),
    'Only pending applications can be moved into review',
  );
  await audit('ADMISSION_MOVED_TO_REVIEW', id, actorId, ipAddress);
  return result;
};

export const requestInformation = async (
  id: string,
  actorId: string,
  input: AdmissionInformationRequestBatchInput,
  ipAddress?: string,
) => {
  const result = requireSuccessfulTransition(
    await AdmissionRepo.requestAdmissionInformation(id, actorId, input.message, input.items),
    'Only applications under review can be asked for more information',
  );
  await audit('ADMISSION_INFORMATION_REQUESTED', id, actorId, ipAddress);
  return result;
};

export const respondToInformationRequest = async (
  id: string,
  requestId: string,
  token: string | undefined,
  response: string,
  document?: AdmissionSubmissionInput['documents'][number],
) => {
  await requireApplicantToken(id, token);
  const admission = await requireAdmission(id);
  if (admission.status !== 'MORE_INFORMATION_REQUIRED') {
    throw new ConflictError('Admission is not waiting for applicant information');
  }
  const request = admission.informationRequests.find(item => item.id === requestId);
  if (!request || request.status !== 'OPEN') {
    throw new ConflictError('Information request is not open or does not belong to this admission');
  }
  if (request.type === 'DOCUMENT' && !document) {
    throw new BadRequestError('A document is required for this information request');
  }
  if (document && request.documentType && document.documentType !== request.documentType) {
    throw new BadRequestError('Submitted document type does not match the requested document type');
  }
  if (document) validateAdmissionUploads([document]);
  const result = await AdmissionRepo.submitInformationResponse(id, requestId, response, document);
  return requireSuccessfulTransition(result, 'Information request is not open or does not belong to this admission');
};

export const resolveInformationRequest = async (
  id: string,
  requestId: string,
  actorId: string,
  message?: string,
  ipAddress?: string,
) => {
  await requireAdmission(id);
  const result = await AdmissionRepo.resolveInformationRequest(id, requestId, message);
  if (result.count !== 1) throw new ConflictError('Only submitted information requests can be resolved');
  await audit('ADMISSION_INFORMATION_REQUEST_RESOLVED', id, actorId, ipAddress);
  return { id: requestId, status: 'RESOLVED' as const };
};

export const approveAdmission = async (id: string, classId: string, actorId: string, ipAddress?: string) => {
  const admission = await requireAdmission(id);
  if (admission.status === 'APPROVED') {
    await UploadService.retainAdmissionFiles(admission.uploadedDocuments);
    return admission;
  }
  if (admission.status !== 'UNDER_REVIEW') throw new ConflictError('Only applications under review can be approved');
  if (!admission.sessionId) throw new BadRequestError('Admission is missing an academic session');
  if (!await AdmissionRepo.findClassroomForSession(classId, admission.sessionId)) {
    throw new BadRequestError('Validation failed', { classId: 'Selected final class is not available for this academic session.' });
  }
  if (admission.informationRequests.some(request => request.status === 'OPEN' || request.status === 'SUBMITTED')) {
    throw new BadRequestError('All information requests must be resolved before approval');
  }

  const missingSubjects = getMissingAdmissionSubjects(
    admission.session?.requiredAdmissionSubjects ?? [],
    admission.results.map(result => result.subject),
  );
  if (missingSubjects.length > 0) {
    throw new BadRequestError(`Required academic results are missing: ${missingSubjects.join(', ')}`);
  }
  const documentTypes = admission.uploadedDocuments.map(document => document.documentType);
  for (const required of ['PASSPORT', 'BIRTH_CERTIFICATE', 'SCHOOL_RESULT', 'MEDICAL_REPORT']) {
    if (!documentTypes.includes(required)) throw new BadRequestError(`Required document is missing: ${required}`);
  }
  if (await AdmissionRepo.listSubmittedRequests(id).then(requests => requests.length > 0)) {
    throw new BadRequestError('All submitted information requests must be resolved before approval');
  }

  const result = requireSuccessfulTransition(
    await AdmissionRepo.approveAdmission(id, classId, actorId),
    'Application status changed before it could be approved',
  );
  await audit('ADMISSION_APPROVED', id, actorId, ipAddress);
  await UploadService.retainAdmissionFiles(result.uploadedDocuments);
  return result;
};

export const rejectAdmission = async (id: string, reason: string, actorId: string, ipAddress?: string) => {
  const existing = await requireAdmission(id);
  if (existing.status === 'REJECTED') {
    await UploadService.deleteRejectedAdmissionFiles(existing.uploadedDocuments);
    return existing;
  }
  const result = requireSuccessfulTransition(
    await AdmissionRepo.rejectAdmission(id, reason, actorId),
    'Only applications under review can be rejected',
  );
  await audit('ADMISSION_REJECTED', id, actorId, ipAddress);
  await UploadService.deleteRejectedAdmissionFiles(result.uploadedDocuments);
  return result;
};

export const enrollAdmission = async (id: string, actorId: string, ipAddress?: string) => {
  const admission = await requireAdmission(id);
  if (admission.status !== 'APPROVED') throw new ConflictError('Only approved applications can be enrolled');
  if (!admission.sessionId || !admission.approvedClassId || !admission.dateOfBirth || !admission.gender) {
    throw new BadRequestError('Approved admission is missing required enrollment details');
  }
  if (!await AdmissionRepo.findClassroomForSession(admission.approvedClassId, admission.sessionId)) {
    throw new BadRequestError('Final class is no longer active or available for this academic session');
  }

  const year = new Date().getUTCFullYear();
  const studentNumber = `STU-${year}-${randomBytes(8).toString('hex').toUpperCase()}`;
  const result = requireSuccessfulTransition(await AdmissionRepo.enrollAdmission({
    id,
    student: {
      admissionNo: studentNumber,
      firstName: admission.applicantFirstName,
      ...(admission.applicantMiddleName !== null && { middleName: admission.applicantMiddleName }),
      lastName: admission.applicantLastName,
      dob: admission.dateOfBirth,
      gender: admission.gender,
      classroom: { connect: { id: admission.approvedClassId } },
    },
    classId: admission.approvedClassId,
    sessionId: admission.sessionId,
    changedBy: actorId,
  }), 'Application changed before enrollment could be completed');
  await audit('ADMISSION_ENROLLED', id, actorId, ipAddress);
  return result;
};
