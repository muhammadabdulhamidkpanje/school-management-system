import * as CourseRepo from '../repositories/course.repositories.js';
import type { CreateCourseDTO, UpdateCourseDTO } from '../types/course.types.js';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/errors.js';
import type { AcademicListQuery } from '../types/academic.types.js';

const getCourse = async (id: string) => {
  const course = await CourseRepo.findCourseById(id);
  if (!course) throw new NotFoundError('Course');
  return course;
};

const validateDepartment = async (departmentId: string | null | undefined) => {
  if (departmentId !== undefined && departmentId !== null && !await CourseRepo.findDepartmentById(departmentId)) {
    throw new NotFoundError('Department');
  }
};

export const listCourses = async ({ page, limit, search, departmentId }: AcademicListQuery) => {
  const [courses, total] = await CourseRepo.listCourses((page - 1) * limit, limit, search, departmentId);
  return {
    courses,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getCourseById = (id: string) => getCourse(id);

export const createCourse = async (dto: CreateCourseDTO, actorId: string, ipAddress?: string) => {
  if (await CourseRepo.findCourseByCode(dto.code)) throw new ConflictError('Course code already exists');
  if (await CourseRepo.findCourseByName(dto.name)) throw new ConflictError('Course name already exists');
  await validateDepartment(dto.departmentId);

  const course = await CourseRepo.createCourse({
    name: dto.name,
    code: dto.code,
    ...(dto.departmentId !== undefined && dto.departmentId !== null
      ? { department: { connect: { id: dto.departmentId } } }
      : {}),
  });
  await CourseRepo.createAuditLog({
    action: 'COURSE_CREATED', userId: actorId, recordId: course.id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return course;
};

export const updateCourse = async (
  id: string,
  dto: UpdateCourseDTO,
  actorId: string,
  ipAddress?: string,
) => {
  await getCourse(id);
  if (dto.code) {
    const duplicate = await CourseRepo.findCourseByCode(dto.code);
    if (duplicate && duplicate.id !== id) throw new ConflictError('Course code already exists');
  }
  if (dto.name) {
    const duplicate = await CourseRepo.findCourseByName(dto.name);
    if (duplicate && duplicate.id !== id) throw new ConflictError('Course name already exists');
  }
  await validateDepartment(dto.departmentId);

  const course = await CourseRepo.updateCourse(id, {
    ...(dto.name !== undefined && { name: dto.name }),
    ...(dto.code !== undefined && { code: dto.code }),
    ...(dto.departmentId !== undefined && (dto.departmentId === null
      ? { department: { disconnect: true } }
      : { department: { connect: { id: dto.departmentId } } })),
  });
  await CourseRepo.createAuditLog({
    action: 'COURSE_UPDATED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return course;
};

export const deleteCourse = async (id: string, actorId: string, ipAddress?: string) => {
  await getCourse(id);
  await CourseRepo.deleteCourse(id);
  await CourseRepo.createAuditLog({
    action: 'COURSE_DELETED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
};

export const assignCourse = async (
  id: string,
  departmentId: string | null,
  facultyId: string | undefined,
  actorId: string,
  ipAddress?: string,
) => {
  await getCourse(id);
  if (departmentId === null && facultyId !== undefined) {
    throw new BadRequestError('A faculty can only be specified with a department');
  }
  const department = departmentId === null ? null : await CourseRepo.findDepartmentById(departmentId);
  if (departmentId !== null && !department) throw new NotFoundError('Department');
  if (facultyId !== undefined && department?.faculty?.id !== facultyId) {
    throw new BadRequestError('Department does not belong to the specified faculty');
  }

  const course = await CourseRepo.updateCourseDepartment(id, departmentId);
  await CourseRepo.createAuditLog({
    action: 'COURSE_DEPARTMENT_ASSIGNED', userId: actorId, recordId: id,
    ...(ipAddress !== undefined && { ipAddress }),
  });
  return course;
};
