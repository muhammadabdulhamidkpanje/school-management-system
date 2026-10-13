import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';
import type { AdmissionInformationRequestInput, AdmissionSubmissionInput } from '../types/admission.types.js';

const admissionDetailInclude = {
  session: true,
  requestedClass: true,
  approvedClass: true,
  student: true,
  results: { orderBy: { subject: 'asc' } },
  uploadedDocuments: { orderBy: { createdAt: 'asc' } },
  informationRequests: { orderBy: { createdAt: 'asc' } },
  statusHistory: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.AdmissionInclude;

export const findSessionForAdmission = (id: string) =>
  prisma.session.findUnique({ where: { id } });

export const listPublicAdmissionSessions = () =>
  prisma.session.findMany({
    where: { admissionsOpen: true },
    orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      isCurrent: true,
      requiredAdmissionSubjects: true,
    },
  });

export const listPublicAdmissionClassrooms = (sessionId: string) =>
  prisma.classroom.findMany({
    where: {
      isActive: true,
      availableInSessions: { some: { sessionId } },
    },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, level: true },
  });

export const findClassroomForSession = (classroomId: string, sessionId: string) =>
  prisma.classroom.findFirst({
    where: {
      id: classroomId,
      isActive: true,
      availableInSessions: { some: { sessionId } },
    },
  });

export const createSubmittedAdmission = (input: {
  data: Prisma.AdmissionCreateInput;
  results: AdmissionSubmissionInput['results'];
  documents: AdmissionSubmissionInput['documents'];
}) => prisma.admission.create({
  data: {
    ...input.data,
    results: { create: input.results },
    uploadedDocuments: {
      create: input.documents.map(document => ({
        documentType: document.documentType,
        fileName: document.fileName,
        fileUrl: document.fileUrl,
        mimeType: document.mimeType,
        fileSize: document.fileSize,
        ...(document.publicId !== undefined && { publicId: document.publicId }),
        ...(document.resourceType !== undefined && { resourceType: document.resourceType }),
      })),
    },
    statusHistory: { create: { oldStatus: null, newStatus: 'PENDING', reason: 'Application submitted' } },
  },
  include: admissionDetailInclude,
  omit: { applicantTokenHash: true },
});

export const listAdmissions = (skip: number, take: number, status?: Prisma.AdmissionWhereInput['status']) =>
  Promise.all([
    prisma.admission.findMany({
      skip,
      take,
      ...(status ? { where: { status } } : {}),
      orderBy: { applicationDate: 'desc' },
      include: admissionDetailInclude,
      omit: { applicantTokenHash: true },
    }),
    status ? prisma.admission.count({ where: { status } }) : prisma.admission.count(),
  ]);

export const findAdmissionById = (id: string) =>
  prisma.admission.findUnique({
    where: { id },
    include: admissionDetailInclude,
    omit: { applicantTokenHash: true },
  });

export const findAdmissionTokenHash = (id: string) =>
  prisma.admission.findUnique({ where: { id }, select: { applicantTokenHash: true } });

export const moveToReview = (id: string, changedBy: string) =>
  prisma.$transaction(async transaction => {
    const result = await transaction.admission.updateMany({
      where: { id, status: 'PENDING' },
      data: { status: 'UNDER_REVIEW', reviewedById: changedBy, reviewedAt: new Date() },
    });
    if (result.count !== 1) return null;
    await transaction.admissionStatusHistory.create({
      data: { admissionId: id, oldStatus: 'PENDING', newStatus: 'UNDER_REVIEW', changedBy },
    });
    return transaction.admission.findUnique({
      where: { id },
      include: admissionDetailInclude,
      omit: { applicantTokenHash: true },
    });
  });

export const requestAdmissionInformation = (
  id: string,
  requestedById: string,
  message: string,
  items: AdmissionInformationRequestInput[],
) => prisma.$transaction(async transaction => {
  const result = await transaction.admission.updateMany({
    where: { id, status: 'UNDER_REVIEW' },
    data: { status: 'MORE_INFORMATION_REQUIRED', remarks: message },
  });
  if (result.count !== 1) return null;
  await transaction.admissionInformationRequest.createMany({
    data: items.map(item => ({
      admissionId: id,
      requestedById,
      type: item.type,
      ...(item.field !== undefined && { field: item.field }),
      ...(item.documentType !== undefined && { documentType: item.documentType }),
      message: item.message,
    })),
  });
  await transaction.admissionStatusHistory.create({
    data: {
      admissionId: id,
      oldStatus: 'UNDER_REVIEW',
      newStatus: 'MORE_INFORMATION_REQUIRED',
      reason: message,
      changedBy: requestedById,
    },
  });
  return transaction.admission.findUnique({
    where: { id },
    include: admissionDetailInclude,
    omit: { applicantTokenHash: true },
  });
});

export const submitInformationResponse = (
  admissionId: string,
  requestId: string,
  response: string,
  document?: AdmissionSubmissionInput['documents'][number],
) => prisma.$transaction(async transaction => {
  const result = await transaction.admissionInformationRequest.updateMany({
    where: { id: requestId, admissionId, status: 'OPEN' },
    data: { status: 'SUBMITTED', response },
  });
  if (result.count !== 1) return null;
  if (document) {
    await transaction.admissionDocument.create({
      data: {
        admissionId,
        informationRequestId: requestId,
        documentType: document.documentType,
        fileName: document.fileName,
        fileUrl: document.fileUrl,
        mimeType: document.mimeType,
        fileSize: document.fileSize,
        ...(document.publicId !== undefined && { publicId: document.publicId }),
        ...(document.resourceType !== undefined && { resourceType: document.resourceType }),
      },
    });
  }
  const openRequests = await transaction.admissionInformationRequest.count({
    where: { admissionId, status: 'OPEN' },
  });
  if (openRequests === 0) {
    const changed = await transaction.admission.updateMany({
      where: { id: admissionId, status: 'MORE_INFORMATION_REQUIRED' },
      data: { status: 'UNDER_REVIEW' },
    });
    if (changed.count === 1) {
      await transaction.admissionStatusHistory.create({
        data: {
          admissionId,
          oldStatus: 'MORE_INFORMATION_REQUIRED',
          newStatus: 'UNDER_REVIEW',
          reason: 'Applicant responded to all open information requests',
        },
      });
    }
  }
  return transaction.admissionInformationRequest.findUnique({ where: { id: requestId } });
});

export const resolveInformationRequest = (admissionId: string, requestId: string, message?: string) =>
  prisma.admissionInformationRequest.updateMany({
    where: { id: requestId, admissionId, status: 'SUBMITTED' },
    data: { status: 'RESOLVED', ...(message !== undefined && { response: message }), resolvedAt: new Date() },
  });

export const listSubmittedRequests = (admissionId: string) =>
  prisma.admissionInformationRequest.findMany({
    where: { admissionId, status: 'SUBMITTED' },
    select: { id: true },
  });

export const approveAdmission = (id: string, classId: string, changedBy: string) =>
  prisma.$transaction(async transaction => {
    const result = await transaction.admission.updateMany({
      where: { id, status: 'UNDER_REVIEW' },
      data: { status: 'APPROVED', approvedClassId: classId, reviewedById: changedBy, reviewedAt: new Date() },
    });
    if (result.count !== 1) return null;
    await transaction.admissionStatusHistory.create({
      data: { admissionId: id, oldStatus: 'UNDER_REVIEW', newStatus: 'APPROVED', changedBy },
    });
    return transaction.admission.findUnique({
      where: { id },
      include: admissionDetailInclude,
      omit: { applicantTokenHash: true },
    });
  });

export const rejectAdmission = (id: string, reason: string, changedBy: string) =>
  prisma.$transaction(async transaction => {
    const result = await transaction.admission.updateMany({
      where: { id, status: 'UNDER_REVIEW' },
      data: { status: 'REJECTED', remarks: reason, reviewedById: changedBy, reviewedAt: new Date() },
    });
    if (result.count !== 1) return null;
    await transaction.admissionStatusHistory.create({
      data: { admissionId: id, oldStatus: 'UNDER_REVIEW', newStatus: 'REJECTED', reason, changedBy },
    });
    return transaction.admission.findUnique({
      where: { id },
      include: admissionDetailInclude,
      omit: { applicantTokenHash: true },
    });
  });

export const enrollAdmission = (input: {
  id: string;
  student: Prisma.StudentCreateInput;
  classId: string;
  sessionId: string;
  changedBy: string;
}) => prisma.$transaction(async transaction => {
  const admission = await transaction.admission.findFirst({
    where: { id: input.id, status: 'APPROVED', studentId: null, sessionId: input.sessionId },
  });
  if (!admission) return null;
  const student = await transaction.student.create({ data: input.student });
  const enrollment = await transaction.enrollment.create({
    data: {
      admission: { connect: { id: input.id } },
      student: { connect: { id: student.id } },
      classroom: { connect: { id: input.classId } },
      session: { connect: { id: input.sessionId } },
    },
  });
  const updated = await transaction.admission.update({
    where: { id: input.id },
    data: { status: 'ENROLLED', student: { connect: { id: student.id } } },
    omit: { applicantTokenHash: true },
  });
  await transaction.admissionStatusHistory.create({
    data: { admissionId: input.id, oldStatus: 'APPROVED', newStatus: 'ENROLLED', changedBy: input.changedBy },
  });
  return { admission: updated, student, enrollment };
});

export const createAuditLog = (data: {
  action: string;
  userId: string;
  recordId?: string;
  ipAddress?: string;
}) => prisma.auditLog.create({ data });
