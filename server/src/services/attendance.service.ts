import * as AttendanceRepo from '../repositories/attendance.repositories.js';
import type { CreateAttendanceRecordDTO, UpdateAttendanceRecordDTO, MarkMultipleAttendanceDTO } from '../types/attendance.types.js';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/errors.js';

const getRecord = async (id: string) => {
  const record = await AttendanceRepo.findRecordById(id);
  if (!record) throw new NotFoundError('Attendance record');
  return record;
};

const getSession = async (id: string) => {
  const session = await AttendanceRepo.findSession(id);
  if (!session) throw new NotFoundError('Attendance session');
  return session;
};

const getStudent = async (id: string) => {
  const student = await AttendanceRepo.findStudent(id);
  if (!student) throw new NotFoundError('Student');
  return student;
};

export const listRecords = async (
  page: number,
  limit: number,
  attendanceSessionId: string,
  studentId?: string,
  present?: boolean
) => {
  await getSession(attendanceSessionId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { attendanceSessionId };
  if (studentId !== undefined) where.studentId = studentId;
  if (present !== undefined) where.present = present;

  const [records, total] = await AttendanceRepo.listRecords((page - 1) * limit, limit, where);
  return { records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getSessionAttendance = async (sessionId: string, page: number, limit: number) => {
  await getSession(sessionId);
  const [records, total] = await AttendanceRepo.getSessionRecords(sessionId, (page - 1) * limit, limit);
  return { records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const createRecord = async (
  dto: CreateAttendanceRecordDTO,
  actorId: string,
  ipAddress?: string
) => {
  await getSession(dto.attendanceSessionId);
  await getStudent(dto.studentId);

  if (await AttendanceRepo.findDuplicate(dto.attendanceSessionId, dto.studentId)) {
    throw new ConflictError('Attendance record already exists for this student in this session');
  }

  const record = await AttendanceRepo.createRecord({
    attendanceSession: { connect: { id: dto.attendanceSessionId } },
    student: { connect: { id: dto.studentId } },
    present: dto.present,
    ...(dto.note !== undefined && { note: dto.note }),
  });

  await AttendanceRepo.createAuditLog({
    action: 'ATTENDANCE_RECORD_CREATED',
    userId: actorId,
    recordId: record.id,
    ...(ipAddress !== undefined && { ipAddress }),
  });

  return record;
};

export const markAttendanceInSession = async (
  sessionId: string,
  dto: MarkMultipleAttendanceDTO,
  actorId: string,
  ipAddress?: string
) => {
  await getSession(sessionId);

  if (dto.attendanceSessionId !== sessionId) {
    throw new BadRequestError('Session ID in URL does not match session ID in request body');
  }

  // Validate all students exist and belong to the classroom
  const session = await AttendanceRepo.findSession(sessionId);
  if (!session) throw new NotFoundError('Attendance session');

  // Verify all students exist
  const studentIds = new Set(dto.records.map(r => r.studentId));
  for (const studentId of studentIds) {
    await getStudent(studentId);
  }

  // Create or update records (using upsert pattern)
  const createdRecords = [];
  for (const recordData of dto.records) {
    const existing = await AttendanceRepo.findDuplicate(sessionId, recordData.studentId);
    
    let record;
    if (existing) {
      record = await AttendanceRepo.updateRecord(existing.id, {
        present: recordData.present,
        ...(recordData.note !== undefined && { note: recordData.note }),
      });
    } else {
      record = await AttendanceRepo.createRecord({
        attendanceSession: { connect: { id: sessionId } },
        student: { connect: { id: recordData.studentId } },
        present: recordData.present,
        ...(recordData.note !== undefined && { note: recordData.note }),
      });
    }
    createdRecords.push(record);
  }

  await AttendanceRepo.createAuditLog({
    action: 'ATTENDANCE_MARKED_BULK',
    userId: actorId,
    recordId: sessionId,
    ...(ipAddress !== undefined && { ipAddress }),
  });

  return createdRecords;
};

export const updateRecord = async (
  id: string,
  dto: UpdateAttendanceRecordDTO,
  actorId: string,
  ipAddress?: string
) => {
  await getRecord(id);

  const updated = await AttendanceRepo.updateRecord(id, {
    ...(dto.present !== undefined && { present: dto.present }),
    ...(dto.note !== undefined && { note: dto.note }),
  });

  await AttendanceRepo.createAuditLog({
    action: 'ATTENDANCE_RECORD_UPDATED',
    userId: actorId,
    recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });

  return updated;
};

export const deleteRecord = async (
  id: string,
  actorId: string,
  ipAddress?: string
) => {
  await getRecord(id);

  await AttendanceRepo.deleteRecord(id);

  await AttendanceRepo.createAuditLog({
    action: 'ATTENDANCE_RECORD_DELETED',
    userId: actorId,
    recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });

  return { message: 'Attendance record deleted' };
};

export const getRecordById = (id: string) => getRecord(id);

export const checkForDuplicates = async (sessionId: string, studentIds: string[]) => {
  await getSession(sessionId);

  if (studentIds.length === 0) {
    throw new BadRequestError('At least one student ID must be provided');
  }

  const existing = await AttendanceRepo.findExistingRecords(sessionId, studentIds);
  const uniqueStudentIds = new Set(studentIds);
  const existingStudentIds = new Set(existing.map(r => r.studentId));
  const duplicateStudentIds = Array.from(uniqueStudentIds).filter(id => existingStudentIds.has(id));
  const newStudentIds = Array.from(uniqueStudentIds).filter(id => !existingStudentIds.has(id));

  return {
    sessionId,
    totalRequested: uniqueStudentIds.size,
    existingCount: existing.length,
    newStudentIds,
    existingRecords: existing.map(r => ({
      id: r.id,
      studentId: r.studentId,
      present: r.present,
    })),
    duplicateStudentIds,
    hasDuplicates: duplicateStudentIds.length > 0,
  };
};

export const getStudentAttendanceHistory = async (
  studentId: string,
  page: number,
  limit: number,
  classroomId?: string,
  courseOfferingId?: string,
  startDate?: Date,
  endDate?: Date
) => {
  await getStudent(studentId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { studentId };
  const sessionWhere: Record<string, unknown> = {};
  
  if (classroomId !== undefined) sessionWhere.classroomId = classroomId;
  if (courseOfferingId !== undefined) sessionWhere.courseOfferingId = courseOfferingId;
  if (startDate !== undefined || endDate !== undefined) {
    const dateWhere: Record<string, unknown> = {};
    if (startDate !== undefined) dateWhere.gte = startDate;
    if (endDate !== undefined) dateWhere.lte = endDate;
    sessionWhere.sessionDate = dateWhere;
  }
  
  if (Object.keys(sessionWhere).length > 0) {
    where.attendanceSession = sessionWhere;
  }

  const [records, total] = await AttendanceRepo.listRecords((page - 1) * limit, limit, where);
  return { records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getStudentAttendanceSummary = async (
  studentId: string,
  classroomId?: string,
  courseOfferingId?: string,
  startDate?: Date,
  endDate?: Date
) => {
  await getStudent(studentId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { studentId };
  const sessionWhere: Record<string, unknown> = {};
  
  if (classroomId !== undefined) sessionWhere.classroomId = classroomId;
  if (courseOfferingId !== undefined) sessionWhere.courseOfferingId = courseOfferingId;
  if (startDate !== undefined || endDate !== undefined) {
    const dateWhere: Record<string, unknown> = {};
    if (startDate !== undefined) dateWhere.gte = startDate;
    if (endDate !== undefined) dateWhere.lte = endDate;
    sessionWhere.sessionDate = dateWhere;
  }
  
  if (Object.keys(sessionWhere).length > 0) {
    where.attendanceSession = sessionWhere;
  }

  const summary = await AttendanceRepo.getAttendanceSummary(studentId, where);
  return summary;
};

export const getClassroomAttendanceSummary = async (classroomId: string, sessionId?: string) => {
  const classroom = await AttendanceRepo.findClassroom(classroomId);
  if (!classroom) throw new NotFoundError('Classroom');

  const summary = await AttendanceRepo.getDetailedClassroomAttendance(classroomId, sessionId);
  return summary;
};

export const getCourseOfferingAttendanceSummary = async (courseOfferingId: string, sessionId?: string) => {
  const courseOffering = await AttendanceRepo.findCourseOffering(courseOfferingId);
  if (!courseOffering) throw new NotFoundError('Course offering');

  const summary = await AttendanceRepo.getDetailedCourseOfferingAttendance(courseOfferingId, sessionId);
  return summary;
};

export const getAdvancedFilteredAttendance = async (
  page: number,
  limit: number,
  classroomId?: string,
  courseOfferingId?: string,
  studentId?: string,
  sessionId?: string,
  present?: boolean,
  startDate?: Date,
  endDate?: Date,
  sortBy: string = 'date',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (studentId !== undefined) where.studentId = studentId;
  if (sessionId !== undefined) where.attendanceSessionId = sessionId;
  if (present !== undefined) where.present = present;

  if (classroomId !== undefined || courseOfferingId !== undefined || startDate !== undefined || endDate !== undefined) {
    const sessionWhere: Record<string, unknown> = {};
    if (classroomId !== undefined) sessionWhere.classroomId = classroomId;
    if (courseOfferingId !== undefined) sessionWhere.courseOfferingId = courseOfferingId;
    if (startDate !== undefined || endDate !== undefined) {
      const dateWhere: Record<string, unknown> = {};
      if (startDate !== undefined) dateWhere.gte = startDate;
      if (endDate !== undefined) dateWhere.lte = endDate;
      sessionWhere.sessionDate = dateWhere;
    }
    where.attendanceSession = sessionWhere;
  }

  const [records, total] = await AttendanceRepo.getAdvancedFilteredRecords(
    (page - 1) * limit,
    limit,
    where,
    sortBy,
    sortOrder
  );

  return { records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getAttendanceStatisticsReport = async (
  classroomId?: string,
  courseOfferingId?: string,
  studentId?: string,
  startDate?: Date,
  endDate?: Date
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (studentId !== undefined) where.studentId = studentId;

  if (classroomId !== undefined || courseOfferingId !== undefined || startDate !== undefined || endDate !== undefined) {
    const sessionWhere: Record<string, unknown> = {};
    if (classroomId !== undefined) sessionWhere.classroomId = classroomId;
    if (courseOfferingId !== undefined) sessionWhere.courseOfferingId = courseOfferingId;
    if (startDate !== undefined || endDate !== undefined) {
      const dateWhere: Record<string, unknown> = {};
      if (startDate !== undefined) dateWhere.gte = startDate;
      if (endDate !== undefined) dateWhere.lte = endDate;
      sessionWhere.sessionDate = dateWhere;
    }
    where.attendanceSession = sessionWhere;
  }

  const statistics = await AttendanceRepo.getAttendanceStatistics(where);
  return statistics;
};
