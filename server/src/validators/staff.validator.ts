import { z } from 'zod';

const staffId = z.string().cuid();
const isoDate = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date')
  .refine(value => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, 'Enter a valid date');
const staffFields = {
  employeeNo: z.string().trim().min(1).max(50),
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().min(2).max(100),
  email: z.string().email().nullable(),
  phone: z.string().trim().max(30).nullable(),
  designation: z.string().trim().max(100).nullable(),
  employmentDate: z.coerce.date().nullable(),
};

const onboardingBodySchema = z.object({
  bioData: z.object({
    name: z.string().trim().min(3).max(200),
    email: z.string().trim().email().transform(value => value.toLowerCase()),
    dob: isoDate,
    phone: z.string().trim().min(3).max(30),
    address: z.string().trim().min(3).max(500),
  }),
  academics: z.array(z.object({
    level: z.string().trim().min(2).max(50),
    institution: z.string().trim().min(2).max(150),
    qualification: z.string().trim().min(2).max(150),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    documentIndex: z.number().int().min(0).max(4).optional(),
  })).min(1).max(5),
  departmentData: z.object({
    departmentId: z.string().cuid(),
    facultyId: z.string().cuid().optional(),
    position: z.string().trim().min(2).max(100),
    employmentType: z.string().trim().min(2).max(50),
    employmentDate: isoDate,
  }),
  accountData: z.object({
    bankName: z.string().trim().min(2).max(100),
    accountNumber: z.string().trim().min(5).max(34),
    bvn: z.string().trim().regex(/^\d{11}$/, 'BVN must contain 11 digits'),
  }).optional(),
  loginData: z.object({
    email: z.string().trim().email().transform(value => value.toLowerCase()),
    password: z.string()
      .min(8, 'Minimum 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[!@#$%]/, 'Must contain a special character'),
  }).strict(),
}).strict().refine(data => data.bioData.email === data.loginData.email, {
  message: 'Biodata and login email addresses must match',
  path: ['loginData', 'email'],
}).refine(data => data.bioData.dob <= new Date().toISOString().slice(0, 10), {
  message: 'Date of birth cannot be in the future',
  path: ['bioData', 'dob'],
}).refine(data => {
  const names = data.bioData.name.split(/\s+/);
  return names.length >= 2 && names.every(name => name.length > 0);
}, {
  message: 'Enter at least a first and last name',
  path: ['bioData', 'name'],
}).refine(data => {
  const indexes = data.academics.flatMap(item => item.documentIndex === undefined ? [] : [item.documentIndex]);
  return new Set(indexes).size === indexes.length;
}, {
  message: 'Each academic document index can only be used once',
  path: ['academics'],
});

export const staffIdSchema = z.object({ params: z.object({ id: staffId }) });
export const listStaffSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().optional(),
    isActive: z.enum(['true', 'false']).optional(),
  }),
});
export const createStaffSchema = z.object({
  body: z.union([z.object({
    employeeNo: staffFields.employeeNo,
    firstName: staffFields.firstName,
    lastName: staffFields.lastName,
    email: staffFields.email.optional(),
    phone: staffFields.phone.optional(),
    designation: staffFields.designation.optional(),
    employmentDate: staffFields.employmentDate.optional(),
  }), onboardingBodySchema]),
});
export const staffOnboardingSchema = onboardingBodySchema;
export const updateStaffSchema = z.object({
  params: z.object({ id: staffId }),
  body: z.object({
    employeeNo: staffFields.employeeNo.optional(),
    firstName: staffFields.firstName.optional(),
    lastName: staffFields.lastName.optional(),
    email: staffFields.email.optional(),
    phone: staffFields.phone.optional(),
    designation: staffFields.designation.optional(),
    employmentType: z.string().trim().max(50).nullable().optional(),
    employmentDate: staffFields.employmentDate.optional(),
    departmentId: staffId.nullable().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const importStaffSchema = z.object({
  body: z.object({ csv: z.string().min(1) }),
});
