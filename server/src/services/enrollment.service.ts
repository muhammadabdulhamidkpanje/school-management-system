import * as EnrollmentRepo from '../repositories/enrollment.repositories.js';
import type { CreateEnrollmentDTO, UpdateEnrollmentDTO } from '../types/enrollment.types.js';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/errors.js';

const getEnrollment = async (id: string) => {
  const enrollment = await EnrollmentRepo.findEnrollmentById(id);
  if (!enrollment) throw new NotFoundError('Enrollment');
  return enrollment;
};

const validateReferences = async (studentId: string, classroomId: string, sessionId: string, semesterId?: string | null) => {
  const [student, classroom, session] = await Promise.all([
    EnrollmentRepo.findStudentById(studentId),
    EnrollmentRepo.findClassroomById(classroomId),
    EnrollmentRepo.findSessionById(sessionId),
  ]);
  if (!student) throw new NotFoundError('Student');
  if (!classroom) throw new NotFoundError('Classroom');
  if (!session) throw new NotFoundError('Academic session');
  if (semesterId !== undefined && semesterId !== null) {
    const semester = await EnrollmentRepo.findSemesterById(semesterId);
    if (!semester) throw new NotFoundError('Semester');
    if (semester.sessionId !== sessionId) throw new BadRequestError('Semester does not belong to the selected session');
  }
};

export const listEnrollments = async (page: number, limit: number, filters: Record<string, string | undefined>) => {
  const where = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined));
  const [enrollments, total] = await EnrollmentRepo.listEnrollments((page - 1) * limit, limit, where);
  return { enrollments, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getEnrollmentById = (id: string) => getEnrollment(id);

export const createEnrollment = async (dto: CreateEnrollmentDTO, actorId: string, ipAddress?: string) => {
  await validateReferences(dto.studentId, dto.classroomId, dto.sessionId, dto.semesterId);
  if (await EnrollmentRepo.findEnrollment(dto.studentId, dto.sessionId, dto.classroomId)) {
    throw new ConflictError('Student is already enrolled in this classroom for the session');
  }
  const enrollment = await EnrollmentRepo.createEnrollment({
    student: { connect: { id: dto.studentId } },
    classroom: { connect: { id: dto.classroomId } },
    session: { connect: { id: dto.sessionId } },
    ...(dto.semesterId !== undefined && dto.semesterId !== null ? { semester: { connect: { id: dto.semesterId } } } : {}),
    ...(dto.status !== undefined && { status: dto.status }),
  });
  await EnrollmentRepo.createAuditLog({ action: 'ENROLLMENT_CREATED', userId: actorId, recordId: enrollment.id, ...(ipAddress !== undefined && { ipAddress }) });
  return enrollment;
};

export const updateEnrollment = async (id: string, dto: UpdateEnrollmentDTO, actorId: string, ipAddress?: string) => {
  const existing = await getEnrollment(id);
  const classroomId = dto.classroomId ?? existing.classroomId;
  const semesterId = dto.semesterId !== undefined ? dto.semesterId : existing.semesterId;
  await validateReferences(existing.studentId, classroomId, existing.sessionId, semesterId);
  if (classroomId !== existing.classroomId && await EnrollmentRepo.findEnrollment(existing.studentId, existing.sessionId, classroomId)) {
    throw new ConflictError('Student is already enrolled in this classroom for the session');
  }
  const enrollment = await EnrollmentRepo.updateEnrollment(id, {
    ...(dto.classroomId !== undefined && { classroom: { connect: { id: dto.classroomId } } }),
    ...(dto.semesterId !== undefined && (dto.semesterId === null ? { semester: { disconnect: true } } : { semester: { connect: { id: dto.semesterId } } })),
    ...(dto.status !== undefined && { status: dto.status }),
  });
  await EnrollmentRepo.createAuditLog({ action: 'ENROLLMENT_UPDATED', userId: actorId, recordId: id, ...(ipAddress !== undefined && { ipAddress }) });
  return enrollment;
};

export const deleteEnrollment = async (id: string, actorId: string, ipAddress?: string) => {
  await getEnrollment(id);
  await EnrollmentRepo.deleteEnrollment(id);
  await EnrollmentRepo.createAuditLog({ action: 'ENROLLMENT_DELETED', userId: actorId, recordId: id, ...(ipAddress !== undefined && { ipAddress }) });
};
