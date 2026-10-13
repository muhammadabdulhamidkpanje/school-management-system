import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const facultyInclude = {
  _count: { select: { departments: true } },
} satisfies Prisma.FacultyInclude;

export const listFaculties = (skip: number, take: number, search?: string) =>
  Promise.all([
    prisma.faculty.findMany({ skip, take, orderBy: { name: 'asc' }, where: search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }] } : undefined, include: facultyInclude }),
    prisma.faculty.count({ where: search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }] } : undefined }),
  ]);

export const findFacultyById = (id: string) =>
  prisma.faculty.findUnique({ where: { id }, include: facultyInclude });

export const findFacultyByCode = (code: string) =>
  prisma.faculty.findUnique({ where: { code } });

export const findFacultyByName = (name: string) =>
  prisma.faculty.findFirst({ where: { name } });

export const createFaculty = (data: Prisma.FacultyCreateInput) =>
  prisma.faculty.create({ data, include: facultyInclude });

export const updateFaculty = (id: string, data: Prisma.FacultyUpdateInput) =>
  prisma.faculty.update({ where: { id }, data, include: facultyInclude });

export const deleteFaculty = (id: string) =>
  prisma.faculty.delete({ where: { id } });

export const createAuditLog = (data: {
  action: string;
  userId: string;
  recordId?: string;
  ipAddress?: string;
}) => prisma.auditLog.create({ data });
