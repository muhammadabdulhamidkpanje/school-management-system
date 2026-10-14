import * as OfferingRepo from '../repositories/course-offering.repositories.js';
import type { AssignTeacherDTO } from '../types/course-offering.types.js';
import { BadRequestError, ConflictError, NotFoundError } from '../errors/errors.js';

export const listOfferings = async (page: number, limit: number) => {
  const [offerings, total, assigned, unassigned] = await OfferingRepo.listOfferings((page - 1) * limit, limit);
  return {
    offerings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    stats: { total, assigned, unassigned },
  };
};

export const createOffering = async (
  input: { courseId: string; classroomId: string; semesterId: string },
  actorId: string,
  ipAddress?: string,
) => {
  const [course, classroom, semester] = await Promise.all([
    OfferingRepo.findCourseById(input.courseId),
    OfferingRepo.findClassroomById(input.classroomId),
    OfferingRepo.findSemesterById(input.semesterId),
  ]);
  if (!course) throw new NotFoundError('Course');
  if (!classroom) throw new NotFoundError('Classroom');
  if (!semester) throw new NotFoundError('Semester');
  if (await OfferingRepo.findOfferingByPlacement(input.courseId, input.classroomId, input.semesterId)) {
    throw new ConflictError('This course already has an offering for the selected class and semester');
  }

  const offering = await OfferingRepo.createOffering(input);
  await OfferingRepo.createAuditLog({
    action: 'COURSE_OFFERING_CREATED',
    userId: actorId,
    recordId: offering.id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return offering;
};

export const assignTeacher = async (
  id: string,
  dto: AssignTeacherDTO,
  actorId: string,
  ipAddress?: string,
) => {
  const offering = await OfferingRepo.findOfferingById(id);
  if (!offering) throw new NotFoundError('Course offering');

  if (dto.teacherId !== null) {
    const staff = await OfferingRepo.findStaffById(dto.teacherId);
    if (!staff) throw new NotFoundError('Staff');
    if (!staff.isActive) throw new BadRequestError('Cannot assign an inactive staff member');
  }

  const updated = await OfferingRepo.updateTeacher(id, dto.teacherId);
  await OfferingRepo.createAuditLog({
    action: dto.teacherId === null ? 'COURSE_TEACHER_UNASSIGNED' : 'COURSE_TEACHER_ASSIGNED',
    userId: actorId,
    recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return updated;
};
