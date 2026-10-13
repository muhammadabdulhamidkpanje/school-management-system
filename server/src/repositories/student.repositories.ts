import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const studentInclude = { classroom: true, user: true } satisfies Prisma.StudentInclude;

export const listStudents = (skip: number, take: number, where: Prisma.StudentWhereInput) =>
  Promise.all([
    prisma.student.findMany({ skip, take, where, orderBy: { lastName: 'asc' }, include: studentInclude }),
    prisma.student.count({ where }),
  ]);
export const exportStudents = () => prisma.student.findMany({ orderBy: { lastName: 'asc' } });
export const findStudentById = (id: string) => prisma.student.findUnique({ where: { id }, include: studentInclude });
export const findStudentByAdmissionNo = (admissionNo: string) => prisma.student.findUnique({ where: { admissionNo } });
export const findClassroomById = (id: string) => prisma.classroom.findUnique({ where: { id } });
export const createStudent = (data: Prisma.StudentCreateInput) => prisma.student.create({ data, include: studentInclude });
export const updateStudent = (id: string, data: Prisma.StudentUpdateInput) => prisma.student.update({ where: { id }, data, include: studentInclude });


export const createAuditLog = (data: { action: string; userId: string; recordId?: string; ipAddress?: string }) => prisma.auditLog.create({ data });
