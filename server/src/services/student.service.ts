import * as StudentRepo from '../repositories/student.repositories.js';
import type { CreateStudentDTO, UpdateStudentDTO } from '../types/student.types.js';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/errors.js';
import { parseCsv, toCsv } from '../utils/csv.js';

const getStudent = async (id: string) => {
  const student = await StudentRepo.findStudentById(id);
  if (!student) throw new NotFoundError('Student');
  return student;
};

const validateClassroom = async (classroomId: string | null | undefined) => {
  if (classroomId !== undefined && classroomId !== null && !await StudentRepo.findClassroomById(classroomId)) {
    throw new NotFoundError('Classroom');
  }
};

export const listStudents = async (page: number, limit: number, search?: string, classroomId?: string, status?: string) => {
  const where = {
    ...(classroomId && { classroomId }),
    ...(status && { status: status as 'ACTIVE' | 'GRADUATED' | 'WITHDRAWN' | 'SUSPENDED' }),
    ...(search && { OR: [
      { admissionNo: { contains: search, mode: 'insensitive' as const } },
      { firstName: { contains: search, mode: 'insensitive' as const } },
      { lastName: { contains: search, mode: 'insensitive' as const } },
      { user: { is: { email: { contains: search, mode: 'insensitive' as const } } } },
    ] }),
  };
  const [students, total] = await StudentRepo.listStudents((page - 1) * limit, limit, where);
  return { students, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getStudentById = (id: string) => getStudent(id);

export const createStudent = async (dto: CreateStudentDTO, actorId: string, ipAddress?: string) => {
  if (await StudentRepo.findStudentByAdmissionNo(dto.admissionNo)) throw new ConflictError('Admission number already exists');
  await validateClassroom(dto.classroomId);
  const student = await StudentRepo.createStudent({
    admissionNo: dto.admissionNo,
    firstName: dto.firstName,
    lastName: dto.lastName,
    ...(dto.middleName !== undefined && { middleName: dto.middleName }),
    dob: new Date(dto.dob),
    gender: dto.gender,
    ...(dto.classroomId !== undefined && dto.classroomId !== null
      ? { classroom: { connect: { id: dto.classroomId } } } : {}),
  });
  await StudentRepo.createAuditLog({ action: 'STUDENT_CREATED', userId: actorId, recordId: student.id, ...(ipAddress !== undefined && { ipAddress }) });
  return student;
};

export const updateStudent = async (id: string, dto: UpdateStudentDTO, actorId: string, ipAddress?: string) => {
  await getStudent(id);
  await validateClassroom(dto.classroomId);
  const student = await StudentRepo.updateStudent(id, {
    ...(dto.firstName !== undefined && { firstName: dto.firstName }),
    ...(dto.lastName !== undefined && { lastName: dto.lastName }),
    ...(dto.middleName !== undefined && { middleName: dto.middleName }),
    ...(dto.dob !== undefined && { dob: new Date(dto.dob) }),
    ...(dto.gender !== undefined && { gender: dto.gender }),
    ...(dto.status !== undefined && { status: dto.status }),
    ...(dto.classroomId !== undefined && (dto.classroomId === null ? { classroom: { disconnect: true } } : { classroom: { connect: { id: dto.classroomId } } })),
  });
  await StudentRepo.createAuditLog({ action: 'STUDENT_UPDATED', userId: actorId, recordId: id, ...(ipAddress !== undefined && { ipAddress }) });
  return student;
};

export const exportStudents = async () => {
  const students = await StudentRepo.exportStudents();
  return toCsv(students, ['admissionNo', 'firstName', 'middleName', 'lastName', 'dob', 'gender', 'classroomId', 'status']);
};

export const importStudents = async (csv: string, actorId: string, ipAddress?: string) => {
  const rows = parseCsv(csv);
  const required = ['admissionNo', 'firstName', 'lastName', 'dob', 'gender'];
  const students = [];
  for (const [index, row] of rows.entries()) {
    const admissionNo = row.admissionNo;
    const firstName = row.firstName;
    const lastName = row.lastName;
    const dob = row.dob;
    const gender = row.gender;
    if (!admissionNo || !firstName || !lastName || !dob || !gender) {
      throw new BadRequestError(
        `CSV row ${index + 2} requires columns: ${required.join(', ')}`,
      );
    }
    const parsedDate = new Date(dob);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestError(`CSV row ${index + 2} has an invalid date of birth`);
    }
    if (!['male', 'female', 'other'].includes(gender)) {
      throw new BadRequestError(`CSV row ${index + 2} has an invalid gender`);
    }
    const middleName = row.middleName?.trim();
    if (middleName && middleName.length < 2) {
      throw new BadRequestError(`CSV row ${index + 2} has an invalid middle name`);
    }
    students.push(await createStudent({
      admissionNo,
      firstName,
      lastName,
      ...(middleName && { middleName }),
      dob: parsedDate.toISOString(),
      gender,
      ...(row.classroomId && { classroomId: row.classroomId }),
    }, actorId, ipAddress));
  }
  return { imported: students.length };
};
