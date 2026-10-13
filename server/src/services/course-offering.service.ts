import * as OfferingRepo from '../repositories/course-offering.repositories.js';
import type { AssignTeacherDTO } from '../types/course-offering.types.js';
import { BadRequestError, NotFoundError } from '../errors/errors.js';

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
