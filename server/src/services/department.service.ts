import * as DepartmentRepo from '../repositories/department.repositories.js';
import type { CreateDepartmentDTO, UpdateDepartmentDTO } from '../types/department.types.js';
import { ConflictError, NotFoundError } from '../errors/errors.js';
import type { AcademicListQuery } from '../types/academic.types.js';

const getDepartment = async (id: string) => {
  const department = await DepartmentRepo.findDepartmentById(id);
  if (!department) throw new NotFoundError('Department');
  return department;
};

const validateFaculty = async (facultyId: string | null | undefined) => {
  if (facultyId !== undefined && facultyId !== null && !await DepartmentRepo.findFacultyById(facultyId)) {
    throw new NotFoundError('Faculty');
  }
};

export const listDepartments = async ({ page, limit, search, facultyId }: AcademicListQuery) => {
  const [departments, total] = await DepartmentRepo.listDepartments((page - 1) * limit, limit, search, facultyId);
  return {
    departments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getDepartmentById = (id: string) => getDepartment(id);

export const createDepartment = async (
  dto: CreateDepartmentDTO,
  actorId: string,
  ipAddress?: string,
) => {
  if (await DepartmentRepo.findDepartmentByCode(dto.code)) throw new ConflictError('Department code already exists');
  if (await DepartmentRepo.findDepartmentByName(dto.name)) throw new ConflictError('Department name already exists');
  await validateFaculty(dto.facultyId);

  const department = await DepartmentRepo.createDepartment({
    name: dto.name,
    code: dto.code,
    ...(dto.facultyId !== undefined && dto.facultyId !== null
      ? { faculty: { connect: { id: dto.facultyId } } }
      : {}),
  });
  await DepartmentRepo.createAuditLog({
    action: 'DEPARTMENT_CREATED', userId: actorId, recordId: department.id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return department;
};

export const updateDepartment = async (
  id: string,
  dto: UpdateDepartmentDTO,
  actorId: string,
  ipAddress?: string,
) => {
  await getDepartment(id);
  if (dto.code) {
    const duplicate = await DepartmentRepo.findDepartmentByCode(dto.code);
    if (duplicate && duplicate.id !== id) throw new ConflictError('Department code already exists');
  }
  if (dto.name) {
    const duplicate = await DepartmentRepo.findDepartmentByName(dto.name);
    if (duplicate && duplicate.id !== id) throw new ConflictError('Department name already exists');
  }
  await validateFaculty(dto.facultyId);

  const department = await DepartmentRepo.updateDepartment(id, {
    ...(dto.name !== undefined && { name: dto.name }),
    ...(dto.code !== undefined && { code: dto.code }),
    ...(dto.facultyId !== undefined && (dto.facultyId === null
      ? { faculty: { disconnect: true } }
      : { faculty: { connect: { id: dto.facultyId } } })),
  });
  await DepartmentRepo.createAuditLog({
    action: 'DEPARTMENT_UPDATED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return department;
};

export const deleteDepartment = async (id: string, actorId: string, ipAddress?: string) => {
  await getDepartment(id);
  await DepartmentRepo.deleteDepartment(id);
  await DepartmentRepo.createAuditLog({
    action: 'DEPARTMENT_DELETED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
};
