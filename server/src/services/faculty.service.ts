import * as FacultyRepo from '../repositories/faculty.repositories.js';
import type { CreateFacultyDTO, UpdateFacultyDTO } from '../types/faculty.types.js';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/errors.js';
import type { AcademicListQuery } from '../types/academic.types.js';

const getFaculty = async (id: string) => {
  const faculty = await FacultyRepo.findFacultyById(id);
  if (!faculty) throw new NotFoundError('Faculty');
  return faculty;
};

export const listFaculties = async ({ page, limit, search }: AcademicListQuery) => {
  const [faculties, total] = await FacultyRepo.listFaculties((page - 1) * limit, limit, search);
  return {
    faculties,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getFacultyById = (id: string) => getFaculty(id);

export const createFaculty = async (dto: CreateFacultyDTO, actorId: string, ipAddress?: string) => {
  if (await FacultyRepo.findFacultyByCode(dto.code)) throw new ConflictError('Faculty code already exists');
  if (await FacultyRepo.findFacultyByName(dto.name)) throw new ConflictError('Faculty name already exists');

  const faculty = await FacultyRepo.createFaculty(dto);
  await FacultyRepo.createAuditLog({
    action: 'FACULTY_CREATED', userId: actorId, recordId: faculty.id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return faculty;
};

export const updateFaculty = async (
  id: string,
  dto: UpdateFacultyDTO,
  actorId: string,
  ipAddress?: string,
) => {
  await getFaculty(id);
  if (dto.code) {
    const duplicate = await FacultyRepo.findFacultyByCode(dto.code);
    if (duplicate && duplicate.id !== id) throw new ConflictError('Faculty code already exists');
  }
  if (dto.name) {
    const duplicate = await FacultyRepo.findFacultyByName(dto.name);
    if (duplicate && duplicate.id !== id) throw new ConflictError('Faculty name already exists');
  }

  const faculty = await FacultyRepo.updateFaculty(id, {
    ...(dto.name !== undefined && { name: dto.name }),
    ...(dto.code !== undefined && { code: dto.code }),
  });
  await FacultyRepo.createAuditLog({
    action: 'FACULTY_UPDATED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return faculty;
};

export const deleteFaculty = async (id: string, actorId: string, ipAddress?: string) => {
  const faculty = await getFaculty(id);
  if (faculty._count.departments > 0) {
    throw new BadRequestError('Cannot delete a faculty with departments');
  }
  await FacultyRepo.deleteFaculty(id);
  await FacultyRepo.createAuditLog({
    action: 'FACULTY_DELETED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
};
