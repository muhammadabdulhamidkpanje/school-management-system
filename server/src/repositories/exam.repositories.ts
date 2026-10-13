import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const examInclude = {
  courseOffering: true,
} satisfies Prisma.ExamInclude;

export const listExams = (skip: number, take: number, where: Prisma.ExamWhereInput) =>
  Promise.all([
    prisma.exam.findMany({ skip, take, where, orderBy: { date: 'asc' }, include: examInclude }),
    prisma.exam.count({ where }),
  ]);

export const findExamById = (id: string) =>
  prisma.exam.findUnique({ where: { id }, include: examInclude });

export const findOfferingById = (id: string) =>
  prisma.courseOffering.findUnique({ where: { id } });

export const findExamByTitle = (courseOfferingId: string, title: string) =>
  prisma.exam.findUnique({ where: { courseOfferingId_title: { courseOfferingId, title } } });

export const createExam = (data: Prisma.ExamCreateInput) =>
  prisma.exam.create({ data, include: examInclude });

export const updateExam = (id: string, data: Prisma.ExamUpdateInput) =>
  prisma.exam.update({ where: { id }, data, include: examInclude });

export const deleteExam = (id: string) =>
  prisma.exam.delete({ where: { id } });

export const createAuditLog = (data: {
  action: string;
  userId: string;
  recordId?: string;
  ipAddress?: string;
}) => prisma.auditLog.create({ data });
