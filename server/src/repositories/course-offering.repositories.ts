import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const offeringInclude = {
  course: { select: { id: true, name: true, code: true } },
  subject: { select: { id: true, name: true, code: true } },
  classroom: { select: { id: true, name: true, level: true } },
  semester: { select: { id: true, name: true, session: { select: { name: true } } } },
  teacher: {
    select: {
      id: true,
      employeeNo: true,
      firstName: true,
      lastName: true,
      designation: true,
      isActive: true,
    },
  },
} satisfies Prisma.CourseOfferingInclude;

export const listOfferings = (skip: number, take: number) =>
  Promise.all([
    prisma.courseOffering.findMany({
      skip,
      take,
      orderBy: [
        { semester: { session: { startDate: 'desc' } } },
        { semester: { name: 'asc' } },
        { classroom: { name: 'asc' } },
        { course: { name: 'asc' } },
        { subject: { name: 'asc' } },
      ],
      include: offeringInclude,
    }),
    prisma.courseOffering.count(),
    prisma.courseOffering.count({ where: { teacherId: { not: null } } }),
    prisma.courseOffering.count({ where: { teacherId: null } }),
  ]);

export const findOfferingByPlacement = (courseId: string, classroomId: string, semesterId: string) =>
  prisma.courseOffering.findFirst({ where: { courseId, classroomId, semesterId } });

export const findCourseById = (id: string) =>
  prisma.course.findUnique({ where: { id } });

export const findClassroomById = (id: string) =>
  prisma.classroom.findUnique({ where: { id } });

export const findSemesterById = (id: string) =>
  prisma.semester.findUnique({ where: { id } });

export const createOffering = (input: {
  courseId: string;
  classroomId: string;
  semesterId: string;
}) => prisma.courseOffering.create({
  data: {
    course: { connect: { id: input.courseId } },
    classroom: { connect: { id: input.classroomId } },
    semester: { connect: { id: input.semesterId } },
  },
  include: offeringInclude,
});

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
