import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const classroomInclude = {
  department: true,
  _count: { select: { students: true, enrollments: true, courseOfferings: true } },
} satisfies Prisma.ClassroomInclude;

export const listClassrooms = (skip: number, take: number, search?: string, departmentId?: string, level?: string) =>
  Promise.all([
    prisma.classroom.findMany({ skip, take, orderBy: { name: 'asc' }, where: { ...(departmentId !== undefined && { departmentId }), ...(level !== undefined && { level }), ...(search !== undefined && { OR: [{ name: { contains: search, mode: 'insensitive' } }, { level: { contains: search, mode: 'insensitive' } }] }) }, include: classroomInclude }),
    prisma.classroom.count({ where: { ...(departmentId !== undefined && { departmentId }), ...(level !== undefined && { level }), ...(search !== undefined && { OR: [{ name: { contains: search, mode: 'insensitive' } }, { level: { contains: search, mode: 'insensitive' } }] }) } }),
  ]);

export const findClassroomById = (id: string) =>
  prisma.classroom.findUnique({ where: { id }, include: classroomInclude });

export const findClassroomByName = (name: string) =>
  prisma.classroom.findUnique({ where: { name } });

export const findDepartmentById = (id: string) =>
  prisma.department.findUnique({ where: { id } });

export const createClassroom = (data: Prisma.ClassroomCreateInput) =>
  prisma.classroom.create({ data, include: classroomInclude });

export const updateClassroom = (id: string, data: Prisma.ClassroomUpdateInput) =>
  prisma.classroom.update({ where: { id }, data, include: classroomInclude });

export const deleteClassroom = (id: string) =>
  prisma.classroom.delete({ where: { id } });

export const createAuditLog = (data: {
  action: string;
  userId: string;
  recordId?: string;
  ipAddress?: string;
}) => prisma.auditLog.create({ data });
