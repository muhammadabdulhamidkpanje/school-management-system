import * as StaffRepo from '../repositories/staff.repositories.js';
import type { CreateStaffDTO, CreateStaffOnboardingDTO, UpdateStaffDTO } from '../types/staff.types.js';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/errors.js';
import { parseCsv, toCsv } from '../utils/csv.js';
import { randomBytes } from 'node:crypto';
import { env } from '../config/env.js';
import { AppError } from '../errors/appError.js';
import { hashPassword } from '../utils/hash.js';
import { encryptStaffBankDetails } from '../utils/staff-private-data.js';
import * as UploadService from './upload.service.js';
import * as EmailService from './email.service.js';
import type { IncomingUpload } from './upload.service.js';

const getStaff = async (id: string) => {
  const staff = await StaffRepo.findStaffById(id);
  if (!staff) throw new NotFoundError('Staff');
  return staff;
};

const parseDate = (value: string | null) => value === null ? null : new Date(value);

export const listStaff = async (page: number, limit: number, search?: string, isActive?: boolean) => {
  const where = {
    ...(isActive !== undefined && { isActive }),
    ...(search && { OR: [
      { employeeNo: { contains: search, mode: 'insensitive' as const } },
      { firstName: { contains: search, mode: 'insensitive' as const } },
      { lastName: { contains: search, mode: 'insensitive' as const } },
      { email: { contains: search, mode: 'insensitive' as const } },
    ] }),
  };
  const [staff, total] = await StaffRepo.listStaff((page - 1) * limit, limit, where);
  return { staff, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getStaffById = (id: string) => getStaff(id);

export const createStaff = async (dto: CreateStaffDTO, actorId: string, ipAddress?: string) => {
  if (await StaffRepo.findStaffByEmployeeNo(dto.employeeNo)) throw new ConflictError('Employee number already exists');
  if (dto.email && await StaffRepo.findStaffByEmail(dto.email)) throw new ConflictError('Staff email already exists');
  const staff = await StaffRepo.createStaff({
    employeeNo: dto.employeeNo,
    firstName: dto.firstName,
    lastName: dto.lastName,
    ...(dto.email !== undefined && { email: dto.email }),
    ...(dto.phone !== undefined && { phone: dto.phone }),
    ...(dto.designation !== undefined && { designation: dto.designation }),
    ...(dto.employmentDate !== undefined && { employmentDate: parseDate(dto.employmentDate) }),
  });
  await StaffRepo.createAuditLog({ action: 'STAFF_CREATED', userId: actorId, recordId: staff.id, ...(ipAddress !== undefined && { ipAddress }) });
  return staff;
};

export const createStaffOnboarding = async (
  dto: CreateStaffOnboardingDTO,
  files: IncomingUpload[],
  actorId: string,
  ipAddress?: string,
) => {
  const email = dto.bioData.email.trim().toLowerCase();
  const [existingUser, existingStaff, department, role] = await Promise.all([
    StaffRepo.findUserByEmail(email),
    StaffRepo.findStaffByEmail(email),
    StaffRepo.findDepartment(dto.departmentData.departmentId),
    StaffRepo.findStaffRole(),
  ]);
  if (existingUser || existingStaff) throw new ConflictError('Email already registered');
  if (!department) throw new NotFoundError('Department');
  if (dto.departmentData.facultyId && department.facultyId !== dto.departmentData.facultyId) {
    throw new BadRequestError('Department does not belong to the selected faculty');
  }
  if (!role) throw new NotFoundError("Role 'staff'");
  const encryptionKey = env.STAFF_DATA_ENCRYPTION_KEY;
  let privateDataEncrypted: string | undefined;
  if (dto.accountData) {
    if (!encryptionKey) throw new AppError('Bank details storage is not configured', 503);
    privateDataEncrypted = encryptStaffBankDetails(dto.accountData, encryptionKey);
  }

  const referencedIndexes = dto.academics.flatMap(item =>
    item.documentIndex === undefined ? [] : [item.documentIndex],
  );
  if (files.length !== referencedIndexes.length
    || files.some((_file, index) => !referencedIndexes.includes(index))) {
    throw new BadRequestError('Attach each certificate using a matching academic documentIndex');
  }

  const nameParts = dto.bioData.name.trim().split(/\s+/);
  const firstName = nameParts[0]!;
  const lastName = nameParts.slice(1).join(' ');
  const passwordHash = await hashPassword(dto.loginData.password);
  const uploadedFiles: Array<{
    publicId: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    resourceType: string;
  }> = [];

  let staff: Awaited<ReturnType<typeof StaffRepo.createStaffOnboarding>>;
  try {
    for (const file of files) {
      const uploaded = await UploadService.uploadFile(file, 'staff-qualification');
      uploadedFiles.push({
        publicId: uploaded.publicId,
        fileName: uploaded.fileName,
        mimeType: uploaded.mimeType,
        fileSize: uploaded.fileSize,
        resourceType: uploaded.resourceType,
      });
    }

    const qualifications = dto.academics.map(item => {
      const uploaded = item.documentIndex === undefined ? undefined : uploadedFiles[item.documentIndex];
      return {
        level: item.level,
        institution: item.institution,
        qualification: item.qualification,
        year: item.year,
        ...(uploaded && {
          documentPublicId: uploaded.publicId,
          documentFileName: uploaded.fileName,
          documentMimeType: uploaded.mimeType,
          documentFileSize: uploaded.fileSize,
          documentResourceType: uploaded.resourceType,
        }),
      };
    });

    staff = await StaffRepo.createStaffOnboarding({
      actorId,
      ...(ipAddress !== undefined && { ipAddress }),
      roleId: role.id,
      email,
      passwordHash,
      firstName,
      lastName,
      dateOfBirth: new Date(`${dto.bioData.dob}T00:00:00.000Z`),
      address: dto.bioData.address,
      phone: dto.bioData.phone,
      departmentId: department.id,
      position: dto.departmentData.position,
      employmentType: dto.departmentData.employmentType,
      employmentDate: new Date(`${dto.departmentData.employmentDate}T00:00:00.000Z`),
      employeeNo: `STF-${new Date().getFullYear()}-${randomBytes(6).toString('hex').toUpperCase()}`,
      ...(privateDataEncrypted !== undefined && { privateDataEncrypted }),
      qualifications,
    });
  } catch (error) {
    if (uploadedFiles.length > 0) {
      try {
        await UploadService.deleteStaffQualificationFiles(uploadedFiles.map(({ publicId, resourceType }) => ({
          publicId,
          resourceType,
        })));
      } catch (cleanupError) {
        console.error('Staff creation failed and qualification upload cleanup also failed', cleanupError);
        throw new AppError('Staff creation failed; uploaded documents could not be cleaned up', 502);
      }
    }
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      throw new ConflictError('Email or staff number already registered');
    }
    throw error;
  }

  let verificationEmailSent = false;
  try {
    const delivery = await EmailService.sendVerificationEmail({
      id: staff.userId,
      email,
      firstName,
    });
    verificationEmailSent = delivery.emailSent;
  } catch (error) {
    console.error('Staff was created, but its verification email could not be prepared', error);
  }

  return {
    id: staff.id,
    staffNumber: staff.employeeNo,
    name: `${staff.firstName} ${staff.lastName}`,
    email: staff.email,
    department: department.name,
    position: staff.designation,
    employmentType: staff.employmentType,
    verificationEmailSent,
  };
};

export const updateStaff = async (id: string, dto: UpdateStaffDTO, actorId: string, ipAddress?: string) => {
  await getStaff(id);
  if (dto.departmentId) {
    const department = await StaffRepo.findDepartment(dto.departmentId);
    if (!department) throw new NotFoundError('Department');
  }
  if (dto.employeeNo) {
    const duplicate = await StaffRepo.findStaffByEmployeeNo(dto.employeeNo);
    if (duplicate && duplicate.id !== id) throw new ConflictError('Employee number already exists');
  }
  if (dto.email) {
    const duplicate = await StaffRepo.findStaffByEmail(dto.email);
    if (duplicate && duplicate.id !== id) throw new ConflictError('Staff email already exists');
  }
  const staff = await StaffRepo.updateStaff(id, {
    ...(dto.employeeNo !== undefined && { employeeNo: dto.employeeNo }),
    ...(dto.firstName !== undefined && { firstName: dto.firstName }),
    ...(dto.lastName !== undefined && { lastName: dto.lastName }),
    ...(dto.email !== undefined && { email: dto.email }),
    ...(dto.phone !== undefined && { phone: dto.phone }),
    ...(dto.designation !== undefined && { designation: dto.designation }),
    ...(dto.employmentType !== undefined && { employmentType: dto.employmentType }),
    ...(dto.employmentDate !== undefined && { employmentDate: parseDate(dto.employmentDate) }),
    ...(dto.departmentId !== undefined && {
      department: dto.departmentId ? { connect: { id: dto.departmentId } } : { disconnect: true },
    }),
    ...(dto.isActive !== undefined && { isActive: dto.isActive }),
  });
  await StaffRepo.createAuditLog({ action: 'STAFF_UPDATED', userId: actorId, recordId: id, ...(ipAddress !== undefined && { ipAddress }) });
  return staff;
};

export const deleteStaff = async (id: string, actorId: string, ipAddress?: string) => {
  const staff = await getStaff(id);
  if (staff._count.courseOfferings > 0) throw new BadRequestError('Cannot delete staff assigned to course offerings');
  const qualificationFiles = await StaffRepo.findStaffQualificationFiles(id);
  await StaffRepo.deleteStaff(id);
  await StaffRepo.createAuditLog({ action: 'STAFF_DELETED', userId: actorId, recordId: id, ...(ipAddress !== undefined && { ipAddress }) });
  const managedFiles = qualificationFiles.flatMap(file =>
    file.documentPublicId && file.documentResourceType
      ? [{ publicId: file.documentPublicId, resourceType: file.documentResourceType }]
      : [],
  );
  if (managedFiles.length > 0) await UploadService.deleteStaffQualificationFiles(managedFiles);
};

export const exportStaff = async () => {
  const staff = await StaffRepo.exportStaff();
  return toCsv(staff, ['employeeNo', 'firstName', 'lastName', 'email', 'phone', 'designation', 'employmentDate', 'isActive']);
};

export const importStaff = async (csv: string, actorId: string, ipAddress?: string) => {
  const rows = parseCsv(csv);
  const required = ['employeeNo', 'firstName', 'lastName'];
  if (rows.some(row => required.some(field => !row[field]))) throw new BadRequestError(`CSV requires columns: ${required.join(', ')}`);
  const imported = [];
  for (const row of rows) {
    const employeeNo = row.employeeNo;
    const firstName = row.firstName;
    const lastName = row.lastName;
    if (!employeeNo || !firstName || !lastName) {
      throw new BadRequestError(`CSV requires columns: ${required.join(', ')}`);
    }
    imported.push(await createStaff({
      employeeNo,
      firstName,
      lastName,
      ...(row.email && { email: row.email }),
      ...(row.phone && { phone: row.phone }),
      ...(row.designation && { designation: row.designation }),
      ...(row.employmentDate && { employmentDate: row.employmentDate }),
    }, actorId, ipAddress));
  }
  return { imported: imported.length };
};
