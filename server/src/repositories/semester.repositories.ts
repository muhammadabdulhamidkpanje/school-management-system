import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const semesterInclude = {
  session: true,
  _count: { select: { enrollments: true, courseOfferings: true } },
} satisfies Prisma.SemesterInclude;

export const listSemesters = (skip: number, take: number, sessionId?: string, search?: string, isCurrent?: boolean) =>
  Promise.all([
    prisma.semester.findMany({
      skip,
      take,
      orderBy: { startDate: 'asc' },
      where: { ...(sessionId !== undefined && { sessionId }), ...(isCurrent !== undefined && { isCurrent }), ...(search !== undefined && { name: { contains: search, mode: 'insensitive' } }) },
      include: semesterInclude,
    }),
    prisma.semester.count({ where: { ...(sessionId !== undefined && { sessionId }), ...(isCurrent !== undefined && { isCurrent }), ...(search !== undefined && { name: { contains: search, mode: 'insensitive' } }) } }),
  ]);

export const findSemesterById = (id: string) =>
  prisma.semester.findUnique({ where: { id }, include: semesterInclude });

export const findSemesterByName = (sessionId: string, name: string) =>
  prisma.semester.findUnique({ where: { sessionId_name: { sessionId, name } } });

export const findSessionById = (id: string) =>
  prisma.session.findUnique({ where: { id } });

export const createSemester = (data: Prisma.SemesterCreateInput) =>
  prisma.semester.create({ data, include: semesterInclude });

export const updateSemester = (id: string, data: Prisma.SemesterUpdateInput) =>
  prisma.semester.update({ where: { id }, data, include: semesterInclude });

export const clearCurrentSemesters = (sessionId: string, exceptId?: string) =>
  prisma.semester.updateMany({
    where: { sessionId, isCurrent: true, ...(exceptId !== undefined && { id: { not: exceptId } }) },
    data: { isCurrent: false },
  });

export const deleteSemester = (id: string) =>
  prisma.semester.delete({ where: { id } });

export const createAuditLog = (data: {
  action: string;
  userId: string;
  recordId?: string;
  ipAddress?: string;
}) => prisma.auditLog.create({ data });
