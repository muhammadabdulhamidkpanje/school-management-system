import * as ClassroomRepo from '../repositories/classroom.repositories.js';
import type { CreateClassroomDTO, UpdateClassroomDTO } from '../types/classroom.types.js';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/errors.js';
import type { AcademicListQuery } from '../types/academic.types.js';

const getClassroom = async (id: string) => {
  const classroom = await ClassroomRepo.findClassroomById(id);
  if (!classroom) throw new NotFoundError('Classroom');
  return classroom;
};

const validateDepartment = async (departmentId: string | null | undefined) => {
  if (departmentId !== undefined && departmentId !== null && !await ClassroomRepo.findDepartmentById(departmentId)) {
    throw new NotFoundError('Department');
  }
};

export const listClassrooms = async ({ page, limit, search, departmentId, level }: AcademicListQuery) => {
  const [classrooms, total] = await ClassroomRepo.listClassrooms((page - 1) * limit, limit, search, departmentId, level);
  return {
    classrooms,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getClassroomById = (id: string) => getClassroom(id);

export const createClassroom = async (dto: CreateClassroomDTO, actorId: string, ipAddress?: string) => {
  if (await ClassroomRepo.findClassroomByName(dto.name)) throw new ConflictError('Classroom name already exists');
  await validateDepartment(dto.departmentId);
  const classroom = await ClassroomRepo.createClassroom({
    name: dto.name,
    level: dto.level,
    ...(dto.capacity !== undefined && { capacity: dto.capacity }),
    ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    ...(dto.departmentId !== undefined && dto.departmentId !== null
      ? { department: { connect: { id: dto.departmentId } } }
      : {}),
  });
  await ClassroomRepo.createAuditLog({
    action: 'CLASSROOM_CREATED', userId: actorId, recordId: classroom.id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return classroom;
};

export const updateClassroom = async (
  id: string,
  dto: UpdateClassroomDTO,
  actorId: string,
  ipAddress?: string,
) => {
  await getClassroom(id);
  if (dto.name) {
    const duplicate = await ClassroomRepo.findClassroomByName(dto.name);
    if (duplicate && duplicate.id !== id) throw new ConflictError('Classroom name already exists');
  }
  await validateDepartment(dto.departmentId);
  const classroom = await ClassroomRepo.updateClassroom(id, {
    ...(dto.name !== undefined && { name: dto.name }),
    ...(dto.level !== undefined && { level: dto.level }),
    ...(dto.capacity !== undefined && { capacity: dto.capacity }),
    ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    ...(dto.departmentId !== undefined && (dto.departmentId === null
      ? { department: { disconnect: true } }
      : { department: { connect: { id: dto.departmentId } } })),
  });
  await ClassroomRepo.createAuditLog({
    action: 'CLASSROOM_UPDATED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return classroom;
};

export const deleteClassroom = async (id: string, actorId: string, ipAddress?: string) => {
  const classroom = await getClassroom(id);
  if (classroom._count.enrollments > 0 || classroom._count.courseOfferings > 0) {
    throw new BadRequestError('Cannot delete a classroom with enrollments or course offerings');
  }
  await ClassroomRepo.deleteClassroom(id);
  await ClassroomRepo.createAuditLog({
    action: 'CLASSROOM_DELETED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
};
