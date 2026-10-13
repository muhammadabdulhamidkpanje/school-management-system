import * as SubjectRepo from '../repositories/subject.repositories.js';
import type { CreateSubjectDTO, UpdateSubjectDTO } from '../types/subject.types.js';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/errors.js';
import type { AcademicListQuery } from '../types/academic.types.js';

const getSubject = async (id: string) => {
  const subject = await SubjectRepo.findSubjectById(id);
  if (!subject) throw new NotFoundError('Subject');
  return subject;
};

const validateDepartment = async (departmentId: string | null | undefined) => {
  if (departmentId !== undefined && departmentId !== null && !await SubjectRepo.findDepartmentById(departmentId)) {
    throw new NotFoundError('Department');
  }
};

export const listSubjects = async ({ page, limit, search, departmentId }: AcademicListQuery) => {
  const [subjects, total] = await SubjectRepo.listSubjects((page - 1) * limit, limit, search, departmentId);
  return {
    subjects,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getSubjectById = (id: string) => getSubject(id);

export const createSubject = async (dto: CreateSubjectDTO, actorId: string, ipAddress?: string) => {
  if (await SubjectRepo.findSubjectByCode(dto.code)) throw new ConflictError('Subject code already exists');
  if (await SubjectRepo.findSubjectByName(dto.name)) throw new ConflictError('Subject name already exists');
  await validateDepartment(dto.departmentId);

  const subject = await SubjectRepo.createSubject({
    name: dto.name,
    code: dto.code,
    ...(dto.departmentId !== undefined && dto.departmentId !== null
      ? { department: { connect: { id: dto.departmentId } } }
      : {}),
  });
  await SubjectRepo.createAuditLog({
    action: 'SUBJECT_CREATED', userId: actorId, recordId: subject.id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return subject;
};

export const updateSubject = async (
  id: string,
  dto: UpdateSubjectDTO,
  actorId: string,
  ipAddress?: string,
) => {
  await getSubject(id);
  if (dto.code) {
    const duplicate = await SubjectRepo.findSubjectByCode(dto.code);
    if (duplicate && duplicate.id !== id) throw new ConflictError('Subject code already exists');
  }
  if (dto.name) {
    const duplicate = await SubjectRepo.findSubjectByName(dto.name);
    if (duplicate && duplicate.id !== id) throw new ConflictError('Subject name already exists');
  }
  await validateDepartment(dto.departmentId);

  const subject = await SubjectRepo.updateSubject(id, {
    ...(dto.name !== undefined && { name: dto.name }),
    ...(dto.code !== undefined && { code: dto.code }),
    ...(dto.departmentId !== undefined && (dto.departmentId === null
      ? { department: { disconnect: true } }
      : { department: { connect: { id: dto.departmentId } } })),
  });
  await SubjectRepo.createAuditLog({
    action: 'SUBJECT_UPDATED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return subject;
};

export const deleteSubject = async (id: string, actorId: string, ipAddress?: string) => {
  const subject = await getSubject(id);
  if (subject._count.courseOfferings > 0) {
    throw new BadRequestError('Cannot delete a subject with course offerings');
  }
  await SubjectRepo.deleteSubject(id);
  await SubjectRepo.createAuditLog({
    action: 'SUBJECT_DELETED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
};

export const assignSubject = async (
  id: string,
  departmentId: string | null,
  facultyId: string | undefined,
  actorId: string,
  ipAddress?: string,
) => {
  await getSubject(id);
  if (departmentId === null && facultyId !== undefined) {
    throw new BadRequestError('A faculty can only be specified with a department');
  }
  const department = departmentId === null ? null : await SubjectRepo.findDepartmentById(departmentId);
  if (departmentId !== null && !department) throw new NotFoundError('Department');
  if (facultyId !== undefined && department?.faculty?.id !== facultyId) {
    throw new BadRequestError('Department does not belong to the specified faculty');
  }

  const subject = await SubjectRepo.updateSubjectDepartment(id, departmentId);
  await SubjectRepo.createAuditLog({
    action: 'SUBJECT_DEPARTMENT_ASSIGNED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return subject;
};
