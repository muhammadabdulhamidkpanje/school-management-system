import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const recordInclude = {
  student: { include: { user: { select: { id: true, email: true } } } },
  attendanceSession: true,
} satisfies Prisma.AttendanceRecordInclude;

export const listRecords = (skip: number, take: number, where: Prisma.AttendanceRecordWhereInput) =>
  Promise.all([
    prisma.attendanceRecord.findMany({ skip, take, where, orderBy: { createdAt: 'desc' }, include: recordInclude }),
    prisma.attendanceRecord.count({ where }),
  ]);

export const findRecordById = (id: string) =>
  prisma.attendanceRecord.findUnique({ where: { id }, include: recordInclude });

export const findDuplicate = (attendanceSessionId: string, studentId: string) =>
  prisma.attendanceRecord.findUnique({
    where: { attendanceSessionId_studentId: { attendanceSessionId, studentId } },
  });

export const findExistingRecords = (sessionId: string, studentIds: string[]) =>
  prisma.attendanceRecord.findMany({
    where: {
      attendanceSessionId: sessionId,
      studentId: { in: studentIds },
    },
    select: { id: true, studentId: true, present: true },
  });

export const findSession = (id: string) =>
  prisma.attendanceSession.findUnique({ where: { id } });

export const findStudent = (id: string) =>
  prisma.student.findUnique({ where: { id } });

export const findClassroom = (id: string) =>
  prisma.classroom.findUnique({ where: { id } });

export const findCourseOffering = (id: string) =>
  prisma.courseOffering.findUnique({ where: { id }, include: { classroom: true } });

export const createRecord = (data: Prisma.AttendanceRecordCreateInput) =>
  prisma.attendanceRecord.create({ data, include: recordInclude });

export const updateRecord = (id: string, data: Prisma.AttendanceRecordUpdateInput) =>
  prisma.attendanceRecord.update({ where: { id }, data, include: recordInclude });

export const deleteRecord = (id: string) =>
  prisma.attendanceRecord.delete({ where: { id } });

export const createMultipleRecords = (data: Prisma.AttendanceRecordCreateManyInput[]) =>
  prisma.attendanceRecord.createMany({ data, skipDuplicates: true });

export const updateMultipleRecords = (updates: Array<{ id: string; data: Prisma.AttendanceRecordUpdateInput }>) =>
  Promise.all(
    updates.map(({ id, data }) => prisma.attendanceRecord.update({ where: { id }, data, include: recordInclude }))
  );

export const getSessionRecords = (sessionId: string, skip: number, take: number) =>
  Promise.all([
    prisma.attendanceRecord.findMany({
      where: { attendanceSessionId: sessionId },
      skip,
      take,
      include: recordInclude,
      orderBy: [{ student: { admissionNo: 'asc' } }],
    }),
    prisma.attendanceRecord.count({ where: { attendanceSessionId: sessionId } }),
  ]);

export const deleteSessionRecords = (sessionId: string) =>
  prisma.attendanceRecord.deleteMany({ where: { attendanceSessionId: sessionId } });

export const createAuditLog = (data: { action: string; userId: string; recordId?: string; ipAddress?: string }) =>
  prisma.auditLog.create({ data });

export const getAttendanceSummary = async (studentId: string, where: Prisma.AttendanceRecordWhereInput) => {
  const records = await prisma.attendanceRecord.findMany({ where, select: { present: true } });
  const totalRecords = records.length;
  const presentCount = records.filter(r => r.present).length;
  const absentCount = totalRecords - presentCount;
  const attendancePercentage = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

  return {
    studentId,
    totalSessions: totalRecords,
    presentCount,
    absentCount,
    attendancePercentage: Math.round(attendancePercentage * 100) / 100,
  };
};

export const getClassroomAttendanceSummary = (classroomId: string, sessionId?: string) => {
  const where: Prisma.AttendanceRecordWhereInput = { attendanceSession: { classroomId } };
  if (sessionId) where.attendanceSessionId = sessionId;
  return prisma.attendanceRecord.groupBy({
    by: ['present'],
    where,
    _count: { id: true },
  });
};

export const getCourseOfferingAttendanceSummary = (courseOfferingId: string, sessionId?: string) => {
  const where: Prisma.AttendanceRecordWhereInput = { attendanceSession: { courseOfferingId } };
  if (sessionId) where.attendanceSessionId = sessionId;
  return prisma.attendanceRecord.groupBy({
    by: ['present'],
    where,
    _count: { id: true },
  });
};

export const getDetailedClassroomAttendance = async (classroomId: string, sessionId?: string) => {
  const where: Prisma.AttendanceRecordWhereInput = { attendanceSession: { classroomId } };
  if (sessionId) where.attendanceSessionId = sessionId;

  const records = await prisma.attendanceRecord.findMany({
    where,
    include: { student: { select: { admissionNo: true, firstName: true, lastName: true } } },
    orderBy: [{ student: { admissionNo: 'asc' } }],
  });

  const totalRecords = records.length;
  const presentCount = records.filter(r => r.present).length;
  const absentCount = totalRecords - presentCount;
  const attendancePercentage = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

  return {
    classroomId,
    sessionId,
    totalStudents: totalRecords,
    presentCount,
    absentCount,
    attendancePercentage: Math.round(attendancePercentage * 100) / 100,
    records: records.map(r => ({
      studentId: r.studentId,
      admissionNo: r.student.admissionNo,
      studentName: `${r.student.firstName} ${r.student.lastName}`,
      present: r.present,
      note: r.note,
    })),
  };
};

export const getDetailedCourseOfferingAttendance = async (courseOfferingId: string, sessionId?: string) => {
  const where: Prisma.AttendanceRecordWhereInput = { attendanceSession: { courseOfferingId } };
  if (sessionId) where.attendanceSessionId = sessionId;

  const records = await prisma.attendanceRecord.findMany({
    where,
    include: { student: { select: { admissionNo: true, firstName: true, lastName: true } } },
    orderBy: [{ student: { admissionNo: 'asc' } }],
  });

  const totalRecords = records.length;
  const presentCount = records.filter(r => r.present).length;
  const absentCount = totalRecords - presentCount;
  const attendancePercentage = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

  return {
    courseOfferingId,
    sessionId,
    totalStudents: totalRecords,
    presentCount,
    absentCount,
    attendancePercentage: Math.round(attendancePercentage * 100) / 100,
    records: records.map(r => ({
      studentId: r.studentId,
      admissionNo: r.student.admissionNo,
      studentName: `${r.student.firstName} ${r.student.lastName}`,
      present: r.present,
      note: r.note,
    })),
  };
};

export const getAdvancedFilteredRecords = async (
  skip: number,
  take: number,
  where: Prisma.AttendanceRecordWhereInput,
  sortBy: string,
  sortOrder: 'asc' | 'desc'
) => {
  const orderBy: Prisma.AttendanceRecordOrderByWithRelationInput = {};
  if (sortBy === 'date') orderBy.attendanceSession = { sessionDate: sortOrder };
  else if (sortBy === 'student') orderBy.student = { admissionNo: sortOrder };
  else if (sortBy === 'attendance') orderBy.present = sortOrder;
  else orderBy.createdAt = sortOrder;

  return Promise.all([
    prisma.attendanceRecord.findMany({ skip, take, where, orderBy, include: recordInclude }),
    prisma.attendanceRecord.count({ where }),
  ]);
};

export const getAttendanceStatistics = async (where: Prisma.AttendanceRecordWhereInput) => {
  const records = await prisma.attendanceRecord.findMany({
    where,
    select: { present: true, studentId: true, attendanceSessionId: true },
  });

  const totalRecords = records.length;
  const presentCount = records.filter(r => r.present).length;
  const absentCount = totalRecords - presentCount;

  // Group by student
  const studentStats: Record<string, { total: number; present: number; absent: number }> = {};
  records.forEach(r => {
    if (!studentStats[r.studentId]) {
      studentStats[r.studentId] = { total: 0, present: 0, absent: 0 };
    }
    const stat = studentStats[r.studentId];
    if (stat) {
      stat.total++;
      if (r.present) stat.present++;
      else stat.absent++;
    }
  });

  const studentStatistics = Object.entries(studentStats).map(([studentId, stats]) => ({
    studentId,
    totalSessions: stats.total,
    presentCount: stats.present,
    absentCount: stats.absent,
    attendancePercentage: Math.round((stats.present / stats.total) * 100 * 100) / 100,
  }));

  return {
    totalRecords,
    presentCount,
    absentCount,
    overallAttendancePercentage: totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100 * 100) / 100 : 0,
    studentCount: Object.keys(studentStats).length,
    sessionCount: new Set(records.map(r => r.attendanceSessionId)).size,
    studentStatistics,
  };
};
