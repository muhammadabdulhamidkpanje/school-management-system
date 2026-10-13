import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const offeringInclude = {
  subject: true,
  classroom: true,
  semester: true,
  teacher: true,
} satisfies Prisma.CourseOfferingInclude;

export const findOfferingById = (id: string) =>
  prisma.courseOffering.findUnique({ where: { id }, include: offeringInclude });

export const findStaffById = (id: string) =>
  prisma.staff.findUnique({ where: { id } });

export const updateTeacher = (id: string, teacherId: string | null) =>
  prisma.courseOffering.update({
    where: { id },
    data: teacherId === null
      ? { teacher: { disconnect: true } }
      : { teacher: { connect: { id: teacherId } } },
    include: offeringInclude,
  });

export const createAuditLog = (data: {
  action: string;
  userId: string;
  recordId?: string;
  ipAddress?: string;
}) => prisma.auditLog.create({ data });
