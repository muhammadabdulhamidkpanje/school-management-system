import * as SessionRepo from '../repositories/session.repositories.js';
import type { CreateSessionDTO, UpdateSessionDTO } from '../types/session.types.js';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/errors.js';
import type { AcademicListQuery } from '../types/academic.types.js';

const getSession = async (id: string) => {
  const session = await SessionRepo.findSessionById(id);
  if (!session) throw new NotFoundError('Academic session');
  return session;
};

const parseDateRange = (startDate: string | undefined, endDate: string | undefined, currentStart: Date, currentEnd: Date) => {
  const start = startDate ? new Date(startDate) : currentStart;
  const end = endDate ? new Date(endDate) : currentEnd;
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
    throw new BadRequestError('Session start date must be before end date');
  }
  return { start, end };
};

export const listSessions = async ({ page, limit, search, isCurrent }: AcademicListQuery) => {
  const [sessions, total] = await SessionRepo.listSessions((page - 1) * limit, limit, search, isCurrent);
  return { sessions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getSessionById = (id: string) => getSession(id);

export const createSession = async (dto: CreateSessionDTO, actorId: string, ipAddress?: string) => {
  if (await SessionRepo.findSessionByName(dto.name)) throw new ConflictError('Session name already exists');
  const classroomIds = dto.availableClassroomIds ?? [];
  if (new Set(classroomIds).size !== classroomIds.length) throw new BadRequestError('Classrooms must be unique');
  if ((await SessionRepo.findActiveClassroomsByIds(classroomIds)).length !== classroomIds.length) {
    throw new NotFoundError('One or more active classrooms');
  }
  const { start, end } = parseDateRange(dto.startDate, dto.endDate, new Date(), new Date());
  if (dto.isCurrent) await SessionRepo.clearCurrentSessions();
  const session = await SessionRepo.createSessionWithClassrooms({
    name: dto.name,
    startDate: start,
    endDate: end,
    ...(dto.isCurrent !== undefined && { isCurrent: dto.isCurrent }),
    ...(dto.admissionsOpen !== undefined && { admissionsOpen: dto.admissionsOpen }),
    ...(dto.requiredAdmissionSubjects !== undefined && { requiredAdmissionSubjects: dto.requiredAdmissionSubjects }),
  }, classroomIds);
  await SessionRepo.createAuditLog({
    action: 'SESSION_CREATED', userId: actorId, recordId: session.id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return session;
};

export const updateSession = async (id: string, dto: UpdateSessionDTO, actorId: string, ipAddress?: string) => {
  const existing = await getSession(id);
  const classroomIds = dto.availableClassroomIds;
  if (classroomIds && new Set(classroomIds).size !== classroomIds.length) {
    throw new BadRequestError('Classrooms must be unique');
  }
  if (classroomIds && (await SessionRepo.findActiveClassroomsByIds(classroomIds)).length !== classroomIds.length) {
    throw new NotFoundError('One or more active classrooms');
  }
  if (dto.name) {
    const duplicate = await SessionRepo.findSessionByName(dto.name);
    if (duplicate && duplicate.id !== id) throw new ConflictError('Session name already exists');
  }
  const { start, end } = parseDateRange(dto.startDate, dto.endDate, existing.startDate, existing.endDate);
  if (dto.isCurrent) await SessionRepo.clearCurrentSessions(id);
  const session = await SessionRepo.updateSessionWithClassrooms(id, {
    ...(dto.name !== undefined && { name: dto.name }),
    startDate: start,
    endDate: end,
    ...(dto.isCurrent !== undefined && { isCurrent: dto.isCurrent }),
    ...(dto.admissionsOpen !== undefined && { admissionsOpen: dto.admissionsOpen }),
    ...(dto.requiredAdmissionSubjects !== undefined && { requiredAdmissionSubjects: dto.requiredAdmissionSubjects }),
  }, classroomIds);
  await SessionRepo.createAuditLog({
    action: 'SESSION_UPDATED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return session;
};

export const deleteSession = async (id: string, actorId: string, ipAddress?: string) => {
  const session = await getSession(id);
  if (session._count.semesters > 0 || session._count.admissions > 0 || session._count.enrollments > 0) {
    throw new BadRequestError('Cannot delete a session with related academic records');
  }
  await SessionRepo.deleteSession(id);
  await SessionRepo.createAuditLog({
    action: 'SESSION_DELETED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
};
