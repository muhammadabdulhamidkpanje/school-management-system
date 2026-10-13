import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const enrollmentInclude = {
  student: true,
  classroom: true,
  session: true,
  semester: true,
} satisfies Prisma.EnrollmentInclude;

export const listEnrollments = (skip: number, take: number, where: Prisma.EnrollmentWhereInput) =>
  Promise.all([
    prisma.enrollment.findMany({ skip, take, where, orderBy: { enrolledAt: 'desc' }, include: enrollmentInclude }),
    prisma.enrollment.count({ where }),
  ]);

export const findEnrollmentById = (id: string) => prisma.enrollment.findUnique({ where: { id }, include: enrollmentInclude });
export const findEnrollment = (studentId: string, sessionId: string, classroomId: string) =>
  prisma.enrollment.findUnique({ where: { studentId_sessionId_classroomId: { studentId, sessionId, classroomId } } });
export const findStudentById = (id: string) => prisma.student.findUnique({ where: { id } });
export const findClassroomById = (id: string) => prisma.classroom.findUnique({ where: { id } });
export const findSessionById = (id: string) => prisma.session.findUnique({ where: { id } });
export const findSemesterById = (id: string) => prisma.semester.findUnique({ where: { id } });
export const createEnrollment = (data: Prisma.EnrollmentCreateInput) => prisma.enrollment.create({ data, include: enrollmentInclude });
export const updateEnrollment = (id: string, data: Prisma.EnrollmentUpdateInput) => prisma.enrollment.update({ where: { id }, data, include: enrollmentInclude });
export const deleteEnrollment = (id: string) => prisma.enrollment.delete({ where: { id } });
export const createAuditLog = (data: { action: string; userId: string; recordId?: string; ipAddress?: string }) => prisma.auditLog.create({ data });
