import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const assessmentInclude = {
  courseOffering: true,
} satisfies Prisma.AssessmentInclude;

export const listAssessments = (skip: number, take: number, where: Prisma.AssessmentWhereInput) =>
  Promise.all([
    prisma.assessment.findMany({ skip, take, where, orderBy: { createdAt: 'desc' }, include: assessmentInclude }),
    prisma.assessment.count({ where }),
  ]);

export const findAssessmentById = (id: string) =>
  prisma.assessment.findUnique({ where: { id }, include: assessmentInclude });

export const findOfferingById = (id: string) =>
  prisma.courseOffering.findUnique({ where: { id } });

export const findAssessmentByTitle = (courseOfferingId: string, title: string) =>
  prisma.assessment.findUnique({ where: { courseOfferingId_title: { courseOfferingId, title } } });

export const createAssessment = (data: Prisma.AssessmentCreateInput) =>
  prisma.assessment.create({ data, include: assessmentInclude });

export const updateAssessment = (id: string, data: Prisma.AssessmentUpdateInput) =>
  prisma.assessment.update({ where: { id }, data, include: assessmentInclude });

export const deleteAssessment = (id: string) =>
  prisma.assessment.delete({ where: { id } });

export const createAuditLog = (data: {
  action: string;
  userId: string;
  recordId?: string;
  ipAddress?: string;
}) => prisma.auditLog.create({ data });
