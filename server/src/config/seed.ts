import prisma from './prisma.js';

const defaultRoles = [
  {
    name: 'admin',
    description: 'System administrator with full access',
  },
  {
    name: 'staff',
    description: 'Staff user with administrative privileges',
  },
  {
    name: 'student',
    description: 'Student user with standard access',
  },
];

const defaultPermissions = [
  { name: 'users:read', description: 'View users' },
  { name: 'users:write', description: 'Create, update, activate, and delete users' },
  { name: 'roles:read', description: 'View roles' },
  { name: 'roles:write', description: 'Create, update, and delete roles' },
  { name: 'permissions:read', description: 'View permissions' },
  { name: 'permissions:write', description: 'Create, update, delete, and assign permissions' },
  { name: 'departments:read', description: 'View departments' },
  { name: 'departments:write', description: 'Create, update, and delete departments' },
  { name: 'faculties:read', description: 'View faculties' },
  { name: 'faculties:write', description: 'Create, update, and delete faculties' },
    { name: 'classrooms:read', description: 'View classrooms' },
    { name: 'classrooms:write', description: 'Create, update, and delete classrooms' },
    { name: 'courses:read', description: 'View courses' },
    { name: 'courses:write', description: 'Create, update, and delete courses' },
    { name: 'subjects:read', description: 'View subjects' },
    { name: 'subjects:write', description: 'Create, update, and delete subjects' },
    { name: 'sessions:read', description: 'View academic sessions' },
    { name: 'sessions:write', description: 'Create, update, and delete academic sessions' },
    { name: 'semesters:read', description: 'View semesters' },
    { name: 'semesters:write', description: 'Create, update, and delete semesters' },
    { name: 'institution:read', description: 'View institution profile settings' },
    { name: 'institution:write', description: 'Update institution profile settings' },
    { name: 'grading-systems:read', description: 'View grading systems' },
    { name: 'grading-systems:write', description: 'Manage grading systems' },
    { name: 'academic-calendars:read', description: 'View academic calendar events' },
    { name: 'academic-calendars:write', description: 'Manage academic calendar events' },
    { name: 'students:read', description: 'View students and admissions' },
    { name: 'students:write', description: 'Manage students and admissions' },
    { name: 'student-profiles:read', description: 'View student academic profiles' },
    { name: 'student-profiles:write', description: 'Update student academic profiles' },
    { name: 'staff:read', description: 'View staff records' },
    { name: 'staff:write', description: 'Manage staff records and employment details' },
    { name: 'enrollments:read', description: 'View student enrollments' },
    { name: 'enrollments:write', description: 'Manage student enrollments' },
    { name: 'attendance:read', description: 'View attendance sessions and records' },
    { name: 'attendance:write', description: 'Manage attendance sessions and records' },
    { name: 'results:publish', description: 'Publish and unpublish assessment and exam results' },
    { name: 'finance:read', description: 'View fees, invoices, and payments' },
    { name: 'finance:write', description: 'Manage fees, invoices, and payments' },
    { name: 'uploads:write', description: 'Upload private files to managed storage' },
];

export const ensureDefaultRoles = async () => {
  for (const role of defaultRoles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  const admin = await prisma.role.findUniqueOrThrow({ where: { name: 'admin' } });
  for (const permission of defaultPermissions) {
    const created = await prisma.permission.upsert({
      where: { name: permission.name },
      update: { description: permission.description },
      create: permission,
    });
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: admin.id, permissionId: created.id } },
      update: {},
      create: { roleId: admin.id, permissionId: created.id },
    });
  }
};
