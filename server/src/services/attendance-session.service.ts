import * as AttendanceRepo from '../repositories/attendance-session.repositories.js';
import type { CreateAttendanceSessionDTO, UpdateAttendanceSessionDTO } from '../types/attendance-session.types.js';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/errors.js';

const getSession = async (id: string) => {
  const session = await AttendanceRepo.findSessionById(id);
  if (!session) throw new NotFoundError('Attendance session');
  return session;
};

const validateReferences = async (classroomId: string, courseOfferingId: string | null | undefined) => {
  if (!await AttendanceRepo.findClassroom(classroomId)) throw new NotFoundError('Classroom');
  if (courseOfferingId !== undefined && courseOfferingId !== null) {
    const offering = await AttendanceRepo.findCourseOffering(courseOfferingId);
    if (!offering) throw new NotFoundError('Course offering');
    if (offering.classroomId !== classroomId) {
      throw new BadRequestError('Course offering does not belong to the selected classroom');
    }
  }
};

export const listSessions = async (page: number, limit: number, classroomId?: string, courseOfferingId?: string) => {
  const where = {
    ...(classroomId !== undefined && { classroomId }),
    ...(courseOfferingId !== undefined && { courseOfferingId }),
  };
  const [sessions, total] = await AttendanceRepo.listSessions((page - 1) * limit, limit, where);
  return { sessions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const createSession = async (dto: CreateAttendanceSessionDTO, actorId: string, ipAddress?: string) => {
  await validateReferences(dto.classroomId, dto.courseOfferingId);
  const sessionDate = new Date(dto.sessionDate);
  if (Number.isNaN(sessionDate.getTime())) throw new BadRequestError('Invalid attendance date');
  const courseOfferingId = dto.courseOfferingId ?? null;
  if (await AttendanceRepo.findDuplicate(dto.classroomId, courseOfferingId, sessionDate)) {
    throw new ConflictError('An attendance session already exists for this class and date');
  }
  const session = await AttendanceRepo.createSession({
    classroom: { connect: { id: dto.classroomId } },
    ...(courseOfferingId !== null ? { courseOffering: { connect: { id: courseOfferingId } } } : {}),
    sessionDate,
    ...(dto.topic !== undefined && { topic: dto.topic }),
  });
  await AttendanceRepo.createAuditLog({ action: 'ATTENDANCE_SESSION_CREATED', userId: actorId, recordId: session.id, ...(ipAddress !== undefined && { ipAddress }) });
  return session;
};

export const updateSession = async (id: string, dto: UpdateAttendanceSessionDTO, actorId: string, ipAddress?: string) => {
  await getSession(id);
  const sessionDate = dto.sessionDate === undefined ? undefined : new Date(dto.sessionDate);
  if (sessionDate && Number.isNaN(sessionDate.getTime())) throw new BadRequestError('Invalid attendance date');
  const session = await AttendanceRepo.updateSession(id, {
    ...(sessionDate !== undefined && { sessionDate }),
    ...(dto.topic !== undefined && { topic: dto.topic }),
  });
  await AttendanceRepo.createAuditLog({ action: 'ATTENDANCE_SESSION_UPDATED', userId: actorId, recordId: id, ...(ipAddress !== undefined && { ipAddress }) });
  return session;
};

export const getSessionById = (id: string) => getSession(id);
