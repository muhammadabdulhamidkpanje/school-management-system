import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const sessionInclude = {
  classroom: true,
  courseOffering: { include: { subject: true, semester: true } },
  _count: { select: { records: true } },
} satisfies Prisma.AttendanceSessionInclude;

export const listSessions = (skip: number, take: number, where: Prisma.AttendanceSessionWhereInput) =>
  Promise.all([
    prisma.attendanceSession.findMany({ skip, take, where, orderBy: { sessionDate: 'desc' }, include: sessionInclude }),
    prisma.attendanceSession.count({ where }),
  ]);
export const findSessionById = (id: string) => prisma.attendanceSession.findUnique({ where: { id }, include: sessionInclude });
export const findDuplicate = (classroomId: string, courseOfferingId: string | null, sessionDate: Date) =>
  prisma.attendanceSession.findFirst({ where: { classroomId, courseOfferingId, sessionDate } });
export const findClassroom = (id: string) => prisma.classroom.findUnique({ where: { id } });
export const findCourseOffering = (id: string) => prisma.courseOffering.findUnique({ where: { id }, include: { classroom: true } });
export const createSession = (data: Prisma.AttendanceSessionCreateInput) => prisma.attendanceSession.create({ data, include: sessionInclude });
export const updateSession = (id: string, data: Prisma.AttendanceSessionUpdateInput) => prisma.attendanceSession.update({ where: { id }, data, include: sessionInclude });
export const createAuditLog = (data: { action: string; userId: string; recordId?: string; ipAddress?: string }) => prisma.auditLog.create({ data });
