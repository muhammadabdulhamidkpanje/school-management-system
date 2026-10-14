import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const studentInclude = {
  classroom: { select: { id: true, name: true, level: true } },
  user: {
    select: {
      email: true,
      profile: {
        select: {
          firstName: true,
          middleName: true,
          lastName: true,
          phone: true,
          address: true,
          dateOfBirth: true,
          profileImage: true,
        },
      },
    },
  },
} satisfies Prisma.StudentInclude;

export const listStudents = (skip: number, take: number, where: Prisma.StudentWhereInput) =>
  Promise.all([
    prisma.student.findMany({ skip, take, where, orderBy: { lastName: 'asc' }, include: studentInclude }),
    prisma.student.count({ where }),
  ]);
export const exportStudents = () => prisma.student.findMany({ orderBy: { lastName: 'asc' } });
export const findStudentById = (id: string) => prisma.student.findUnique({
  where: { id },
  include: {
    ...studentInclude,
    academicProfile: true,
    guardians: {
      select: {
        relationship: true,
        isPrimary: true,
        guardian: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            address: true,
          },
        },
      },
    },
    enrollments: {
      select: {
        id: true,
        status: true,
        classroom: { select: { name: true, level: true } },
        session: { select: { name: true } },
        semester: { select: { name: true } },
        enrolledAt: true,
      },
      orderBy: { enrolledAt: 'desc' },
    },
    _count: {
      select: {
        attendanceRecords: true,
        scores: true,
        invoices: true,
      },
    },
  },
});
export const findStudentByAdmissionNo = (admissionNo: string) => prisma.student.findUnique({ where: { admissionNo } });
export const findClassroomById = (id: string) => prisma.classroom.findUnique({ where: { id } });
export const createStudent = (data: Prisma.StudentCreateInput) => prisma.student.create({ data, include: studentInclude });
export const updateStudent = (id: string, data: Prisma.StudentUpdateInput) => prisma.student.update({ where: { id }, data, include: studentInclude });


export const createAuditLog = (data: { action: string; userId: string; recordId?: string; ipAddress?: string }) => prisma.auditLog.create({ data });
