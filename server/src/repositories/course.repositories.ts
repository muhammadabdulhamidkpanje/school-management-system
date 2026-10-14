import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const courseInclude = {
  department: true,
  _count: { select: { courseOfferings: true } },
} satisfies Prisma.CourseInclude;

export const listCourses = (skip: number, take: number, search?: string, departmentId?: string) =>
  Promise.all([
    prisma.course.findMany({ skip, take, orderBy: { name: 'asc' }, where: { ...(departmentId !== undefined && { departmentId }), ...(search !== undefined && { OR: [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }] }) }, include: courseInclude }),
    prisma.course.count({ where: { ...(departmentId !== undefined && { departmentId }), ...(search !== undefined && { OR: [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }] }) } }),
  ]);

export const findCourseById = (id: string) =>
  prisma.course.findUnique({ where: { id }, include: courseInclude });

export const findCourseByCode = (code: string) =>
  prisma.course.findUnique({ where: { code } });

export const findCourseByName = (name: string) =>
  prisma.course.findFirst({ where: { name } });

export const findDepartmentById = (id: string) =>
  prisma.department.findUnique({ where: { id }, include: { faculty: true } });

export const updateCourseDepartment = (id: string, departmentId: string | null) =>
  prisma.course.update({
    where: { id },
    data: departmentId === null
      ? { department: { disconnect: true } }
      : { department: { connect: { id: departmentId } } },
    include: courseInclude,
  });

export const createCourse = (data: Prisma.CourseCreateInput) =>
  prisma.course.create({ data, include: courseInclude });

export const updateCourse = (id: string, data: Prisma.CourseUpdateInput) =>
  prisma.course.update({ where: { id }, data, include: courseInclude });

export const deleteCourse = (id: string) =>
  prisma.course.delete({ where: { id } });

export const createAuditLog = (data: {
  action: string;
  userId: string;
  recordId?: string;
  ipAddress?: string;
}) => prisma.auditLog.create({ data });
