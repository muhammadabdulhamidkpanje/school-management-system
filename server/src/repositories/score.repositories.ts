import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const scoreInclude = {
  student: true,
  assessment: true,
  exam: true,
} satisfies Prisma.StudentScoreInclude;

export const listScores = (skip: number, take: number, where: Prisma.StudentScoreWhereInput) =>
  Promise.all([
    prisma.studentScore.findMany({ skip, take, where, orderBy: { createdAt: 'desc' }, include: scoreInclude }),
    prisma.studentScore.count({ where }),
  ]);

export const findById = (id: string) => prisma.studentScore.findUnique({ where: { id }, include: scoreInclude });
export const findPublishedStudentReport = (studentId: string) => prisma.student.findUnique({
  where: { id: studentId },
  select: {
    id: true,
    admissionNo: true,
    firstName: true,
    lastName: true,
    scores: {
      where: { OR: [{ assessment: { isPublished: true } }, { exam: { isPublished: true } }] },
      orderBy: { createdAt: 'asc' },
      include: scoreInclude,
    },
  },
});
export const findStudent = (id: string) => prisma.student.findUnique({ where: { id }, select: { id: true } });
export const findAssessment = (id: string) => prisma.assessment.findUnique({ where: { id }, select: { id: true, maxMarks: true, isPublished: true } });
export const findExam = (id: string) => prisma.exam.findUnique({ where: { id }, select: { id: true, totalMarks: true, isPublished: true } });

export const findExisting = (studentId: string, assessmentId?: string, examId?: string) =>
  prisma.studentScore.findFirst({ where: { studentId, ...(assessmentId !== undefined && { assessmentId }), ...(examId !== undefined && { examId }) } });

export const create = (data: Prisma.StudentScoreCreateInput) => prisma.studentScore.create({ data, include: scoreInclude });
export const update = (id: string, data: Prisma.StudentScoreUpdateInput) => prisma.studentScore.update({ where: { id }, data, include: scoreInclude });
export const remove = (id: string) => prisma.studentScore.delete({ where: { id } });
export const createAuditLog = (data: {
  action: string;
  userId: string;
  recordId?: string;
  ipAddress?: string;
}) => prisma.auditLog.create({ data });
