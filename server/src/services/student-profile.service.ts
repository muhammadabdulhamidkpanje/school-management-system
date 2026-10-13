import * as ProfileRepo from '../repositories/student-profile.repositories.js';
import type { UpdateStudentAcademicProfileDTO } from '../types/student-profile.types.js';
import { NotFoundError } from '../errors/errors.js';

export const getProfile = async (studentId: string) => {
  if (!await ProfileRepo.findStudent(studentId)) throw new NotFoundError('Student');
  return ProfileRepo.findProfile(studentId);
};

export const updateProfile = async (
  studentId: string,
  dto: UpdateStudentAcademicProfileDTO,
  actorId: string,
  ipAddress?: string,
) => {
  if (!await ProfileRepo.findStudent(studentId)) throw new NotFoundError('Student');
  const profile = await ProfileRepo.upsertProfile(studentId, {
    ...(dto.currentLevel !== undefined && { currentLevel: dto.currentLevel }),
    ...(dto.admissionYear !== undefined && { admissionYear: dto.admissionYear }),
    ...(dto.previousSchool !== undefined && { previousSchool: dto.previousSchool }),
    ...(dto.notes !== undefined && { notes: dto.notes }),
  });
  await ProfileRepo.createAuditLog({
    action: 'STUDENT_ACADEMIC_PROFILE_UPDATED', userId: actorId, recordId: studentId,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return profile;
};
