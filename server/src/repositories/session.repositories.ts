import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const sessionInclude = {
  _count: { select: { semesters: true, admissions: true, enrollments: true } },
} satisfies Prisma.SessionInclude;

export const listSessions = (skip: number, take: number, search?: string, isCurrent?: boolean) =>
  Promise.all([
    prisma.session.findMany({ skip, take, orderBy: { startDate: 'desc' }, where: { ...(isCurrent !== undefined && { isCurrent }), ...(search !== undefined && { name: { contains: search, mode: 'insensitive' } }) }, include: sessionInclude }),
    prisma.session.count({ where: { ...(isCurrent !== undefined && { isCurrent }), ...(search !== undefined && { name: { contains: search, mode: 'insensitive' } }) } }),
  ]);

export const findSessionById = (id: string) =>
  prisma.session.findUnique({ where: { id }, include: sessionInclude });

export const findSessionByName = (name: string) =>
  prisma.session.findUnique({ where: { name } });

export const createSession = (data: Prisma.SessionCreateInput) =>
  prisma.session.create({ data, include: sessionInclude });

export const createSessionWithClassrooms = (data: Prisma.SessionCreateInput, classroomIds: string[]) =>
  prisma.session.create({
    data: {
      ...data,
      ...(classroomIds.length > 0 && {
        availableClassrooms: {
          create: classroomIds.map(classroomId => ({ classroom: { connect: { id: classroomId } } })),
        },
      }),
    },
    include: sessionInclude,
  });

export const updateSession = (id: string, data: Prisma.SessionUpdateInput) =>
  prisma.session.update({ where: { id }, data, include: sessionInclude });

export const updateSessionWithClassrooms = (
  id: string,
  data: Prisma.SessionUpdateInput,
  classroomIds?: string[],
) => prisma.$transaction(async transaction => {
  const session = await transaction.session.update({ where: { id }, data, include: sessionInclude });
  if (classroomIds !== undefined) {
    await transaction.sessionClassroom.deleteMany({ where: { sessionId: id } });
    if (classroomIds.length > 0) {
      await transaction.sessionClassroom.createMany({
        data: classroomIds.map(classroomId => ({ sessionId: id, classroomId })),
      });
    }
  }
  return session;
});

export const findActiveClassroomsByIds = (ids: string[]) =>
  prisma.classroom.findMany({ where: { id: { in: ids }, isActive: true }, select: { id: true } });

export const clearCurrentSessions = (exceptId?: string) =>
  prisma.session.updateMany({
    where: { isCurrent: true, ...(exceptId !== undefined && { id: { not: exceptId } }) },
    data: { isCurrent: false },
  });

export const deleteSession = (id: string) =>
  prisma.session.delete({ where: { id } });

export const createAuditLog = (data: {
  action: string;
  userId: string;
  recordId?: string;
  ipAddress?: string;
}) => prisma.auditLog.create({ data });
