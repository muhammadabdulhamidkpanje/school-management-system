import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const subjectInclude = {
  department: true,
  _count: { select: { courseOfferings: true } },
} satisfies Prisma.SubjectInclude;

export const listSubjects = (skip: number, take: number, search?: string, departmentId?: string) =>
  Promise.all([
    prisma.subject.findMany({ skip, take, orderBy: { name: 'asc' }, where: { ...(departmentId !== undefined && { departmentId }), ...(search !== undefined && { OR: [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }] }) }, include: subjectInclude }),
    prisma.subject.count({ where: { ...(departmentId !== undefined && { departmentId }), ...(search !== undefined && { OR: [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }] }) } }),
  ]);

export const findSubjectById = (id: string) =>
  prisma.subject.findUnique({ where: { id }, include: subjectInclude });

export const findSubjectByCode = (code: string) =>
  prisma.subject.findUnique({ where: { code } });

export const findSubjectByName = (name: string) =>
  prisma.subject.findFirst({ where: { name } });

export const findDepartmentById = (id: string) =>
  prisma.department.findUnique({ where: { id }, include: { faculty: true } });

export const updateSubjectDepartment = (id: string, departmentId: string | null) =>
  prisma.subject.update({
    where: { id },
    data: departmentId === null
      ? { department: { disconnect: true } }
      : { department: { connect: { id: departmentId } } },
    include: subjectInclude,
  });

export const createSubject = (data: Prisma.SubjectCreateInput) =>
  prisma.subject.create({ data, include: subjectInclude });

export const updateSubject = (id: string, data: Prisma.SubjectUpdateInput) =>
  prisma.subject.update({ where: { id }, data, include: subjectInclude });

export const deleteSubject = (id: string) =>
  prisma.subject.delete({ where: { id } });

export const createAuditLog = (data: {
  action: string;
  userId: string;
  recordId?: string;
  ipAddress?: string;
}) => prisma.auditLog.create({ data });
