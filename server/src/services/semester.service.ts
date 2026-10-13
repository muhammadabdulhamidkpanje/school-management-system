import * as SemesterRepo from '../repositories/semester.repositories.js';
import type { CreateSemesterDTO, UpdateSemesterDTO } from '../types/semester.types.js';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/errors.js';
import type { AcademicListQuery } from '../types/academic.types.js';

const getSemester = async (id: string) => {
  const semester = await SemesterRepo.findSemesterById(id);
  if (!semester) throw new NotFoundError('Semester');
  return semester;
};

const validateDates = (startDate: string | undefined, endDate: string | undefined, sessionStart: Date, sessionEnd: Date, currentStart?: Date, currentEnd?: Date) => {
  const start = startDate ? new Date(startDate) : currentStart!;
  const end = endDate ? new Date(endDate) : currentEnd!;
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
    throw new BadRequestError('Semester start date must be before end date');
  }
  if (start < sessionStart || end > sessionEnd) {
    throw new BadRequestError('Semester dates must fall within the academic session');
  }
  return { start, end };
};

export const listSemesters = async ({ page, limit, sessionId, search, isCurrent }: AcademicListQuery) => {
  const [semesters, total] = await SemesterRepo.listSemesters((page - 1) * limit, limit, sessionId, search, isCurrent);
  return { semesters, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getSemesterById = (id: string) => getSemester(id);

export const createSemester = async (dto: CreateSemesterDTO, actorId: string, ipAddress?: string) => {
  const session = await SemesterRepo.findSessionById(dto.sessionId);
  if (!session) throw new NotFoundError('Academic session');
  if (await SemesterRepo.findSemesterByName(dto.sessionId, dto.name)) throw new ConflictError('Semester name already exists in this session');
  const { start, end } = validateDates(dto.startDate, dto.endDate, session.startDate, session.endDate);
  if (dto.isCurrent) await SemesterRepo.clearCurrentSemesters(dto.sessionId);

  const semester = await SemesterRepo.createSemester({
    name: dto.name,
    startDate: start,
    endDate: end,
    ...(dto.isCurrent !== undefined && { isCurrent: dto.isCurrent }),
    session: { connect: { id: dto.sessionId } },
  });
  await SemesterRepo.createAuditLog({
    action: 'SEMESTER_CREATED', userId: actorId, recordId: semester.id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return semester;
};

export const updateSemester = async (id: string, dto: UpdateSemesterDTO, actorId: string, ipAddress?: string) => {
  const existing = await getSemester(id);
  const sessionId = dto.sessionId ?? existing.sessionId;
  const session = await SemesterRepo.findSessionById(sessionId);
  if (!session) throw new NotFoundError('Academic session');
  if (dto.name) {
    const duplicate = await SemesterRepo.findSemesterByName(sessionId, dto.name);
    if (duplicate && duplicate.id !== id) throw new ConflictError('Semester name already exists in this session');
  }
  const { start, end } = validateDates(dto.startDate, dto.endDate, session.startDate, session.endDate, existing.startDate, existing.endDate);
  if (dto.isCurrent) await SemesterRepo.clearCurrentSemesters(sessionId, id);

  const semester = await SemesterRepo.updateSemester(id, {
    ...(dto.name !== undefined && { name: dto.name }),
    startDate: start,
    endDate: end,
    ...(dto.sessionId !== undefined && { session: { connect: { id: dto.sessionId } } }),
    ...(dto.isCurrent !== undefined && { isCurrent: dto.isCurrent }),
  });
  await SemesterRepo.createAuditLog({
    action: 'SEMESTER_UPDATED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return semester;
};

export const deleteSemester = async (id: string, actorId: string, ipAddress?: string) => {
  const semester = await getSemester(id);
  if (semester._count.enrollments > 0 || semester._count.courseOfferings > 0) {
    throw new BadRequestError('Cannot delete a semester with enrollments or course offerings');
  }
  await SemesterRepo.deleteSemester(id);
  await SemesterRepo.createAuditLog({
    action: 'SEMESTER_DELETED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
};
