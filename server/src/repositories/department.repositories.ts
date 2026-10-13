import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const departmentInclude = {
  faculty: true,
  _count: { select: { subjects: true, classrooms: true } },
} satisfies Prisma.DepartmentInclude;

export const listDepartments = (skip: number, take: number, search?: string, facultyId?: string) =>
  Promise.all([
    prisma.department.findMany({ skip, take, orderBy: { name: 'asc' }, where: {
      ...(facultyId !== undefined && { facultyId }),
      ...(search !== undefined && { OR: [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }] }),
    }, include: departmentInclude }),
    prisma.department.count({ where: {
      ...(facultyId !== undefined && { facultyId }),
      ...(search !== undefined && { OR: [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }] }),
    } }),
  ]);

export const findDepartmentById = (id: string) =>
  prisma.department.findUnique({ where: { id }, include: departmentInclude });

export const findDepartmentByCode = (code: string) =>
  prisma.department.findUnique({ where: { code } });

export const findDepartmentByName = (name: string) =>
  prisma.department.findFirst({ where: { name } });

export const findFacultyById = (id: string) =>
  prisma.faculty.findUnique({ where: { id } });

export const createDepartment = (data: Prisma.DepartmentCreateInput) =>
  prisma.department.create({ data, include: departmentInclude });

export const updateDepartment = (id: string, data: Prisma.DepartmentUpdateInput) =>
  prisma.department.update({ where: { id }, data, include: departmentInclude });

export const deleteDepartment = (id: string) =>
  prisma.department.delete({ where: { id } });

export const createAuditLog = (data: {
  action: string;
  userId: string;
  recordId?: string;
  ipAddress?: string;
}) => prisma.auditLog.create({ data });
