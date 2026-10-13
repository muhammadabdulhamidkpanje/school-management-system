import prisma from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';

const staffInclude = {
  _count: { select: { courseOfferings: true } },
  department: { select: { id: true, name: true } },
} satisfies Prisma.StaffInclude;

export const listStaff = (skip: number, take: number, where: Prisma.StaffWhereInput) =>
  Promise.all([
    prisma.staff.findMany({ skip, take, where, orderBy: { lastName: 'asc' }, include: staffInclude }),
    prisma.staff.count({ where }),
  ]);
export const exportStaff = () => prisma.staff.findMany({ orderBy: { lastName: 'asc' } });
export const findStaffById = (id: string) => prisma.staff.findUnique({
  where: { id },
  include: {
    ...staffInclude,
    user: {
      select: {
        profile: {
          select: {
            address: true,
            dateOfBirth: true,
          },
        },
      },
    },
    qualifications: {
      select: {
        id: true,
        level: true,
        institution: true,
        qualification: true,
        year: true,
        documentFileName: true,
      },
      orderBy: { year: 'desc' },
    },
    courseOfferings: {
      select: {
        id: true,
        subject: { select: { name: true, code: true } },
        classroom: { select: { name: true } },
        semester: { select: { name: true, session: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    },
  },
});
export const findStaffByEmployeeNo = (employeeNo: string) => prisma.staff.findUnique({ where: { employeeNo } });
export const findStaffByEmail = (email: string) => prisma.staff.findUnique({ where: { email } });
export const findUserByEmail = (email: string) => prisma.user.findUnique({ where: { email } });
export const findStaffRole = () => prisma.role.findUnique({ where: { name: 'staff' } });
export const findDepartment = (id: string) =>
  prisma.department.findUnique({ where: { id }, include: { faculty: true } });
export const findStaffQualificationFiles = (staffId: string) =>
  prisma.staffQualification.findMany({
    where: { staffId },
    select: { documentPublicId: true, documentResourceType: true },
  });
export const createStaff = (data: Prisma.StaffCreateInput) => prisma.staff.create({ data, include: staffInclude });
export const createStaffOnboarding = (data: {
  actorId: string;
  ipAddress?: string;
  roleId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  address: string;
  phone: string;
  departmentId: string;
  position: string;
  employmentType: string;
  employmentDate: Date;
  employeeNo: string;
  privateDataEncrypted?: string;
  qualifications: Array<{
    level: string;
    institution: string;
    qualification: string;
    year: number;
    documentPublicId?: string;
    documentFileName?: string;
    documentMimeType?: string;
    documentFileSize?: number;
    documentResourceType?: string;
  }>;
}) => prisma.$transaction(async transaction => {
  const user = await transaction.user.create({
    data: {
      email: data.email,
      passwordHash: data.passwordHash,
      isVerified: true,
      role: { connect: { id: data.roleId } },
      profile: {
        create: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          address: data.address,
          dateOfBirth: data.dateOfBirth,
        },
      },
    },
    select: { id: true },
  });

  const staff = await transaction.staff.create({
    data: {
      employeeNo: data.employeeNo,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      designation: data.position,
      employmentType: data.employmentType,
      employmentDate: data.employmentDate,
      user: { connect: { id: user.id } },
      department: { connect: { id: data.departmentId } },
      qualifications: { create: data.qualifications },
      ...(data.privateDataEncrypted && {
        privateData: { create: { encryptedBankDetails: data.privateDataEncrypted } },
      }),
    },
    select: {
      id: true,
      userId: true,
      employeeNo: true,
      firstName: true,
      lastName: true,
      email: true,
      designation: true,
      employmentType: true,
      department: { select: { name: true } },
    },
  });

  await transaction.auditLog.create({
    data: {
      action: 'STAFF_CREATED',
      tableName: 'Staff',
      userId: data.actorId,
      recordId: staff.id,
      ...(data.ipAddress !== undefined && { ipAddress: data.ipAddress }),
    },
  });

  return { ...staff, userId: user.id };
});
export const updateStaff = (id: string, data: Prisma.StaffUpdateInput) => prisma.staff.update({ where: { id }, data, include: staffInclude });
export const deleteStaff = (id: string) => prisma.staff.delete({ where: { id } });
export const createAuditLog = (data: { action: string; userId: string; recordId?: string; ipAddress?: string }) => prisma.auditLog.create({ data });
