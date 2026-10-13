import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const profileInclude = { student: { include: { classroom: true } } } satisfies Prisma.StudentAcademicProfileInclude;

export const findStudent = (id: string) => prisma.student.findUnique({ where: { id } });
export const findProfile = (studentId: string) => prisma.studentAcademicProfile.findUnique({ where: { studentId }, include: profileInclude });
export const upsertProfile = (studentId: string, data: Prisma.StudentAcademicProfileUpdateInput) =>
  prisma.studentAcademicProfile.upsert({
    where: { studentId },
    create: { student: { connect: { id: studentId } }, ...data },
    update: data,
    include: profileInclude,
  });
export const createAuditLog = (data: { action: string; userId: string; recordId?: string; ipAddress?: string }) => prisma.auditLog.create({ data });
