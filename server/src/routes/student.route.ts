import { Router } from 'express';
import * as StudentController from '../controllers/student.controller.js';
import { authenticate, authorizeRole, authorizePermission } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import * as ProfileController from '../controllers/student-profile.controller.js';
import { studentProfileIdSchema, updateStudentProfileSchema } from '../validators/student-profile.validator.js';
import {
  studentIdSchema,
  listStudentsSchema,
  createStudentSchema,
  updateStudentSchema,
  importStudentsSchema,
} from '../validators/student.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canRead = [...adminOnly, authorizePermission(permissions.studentsRead)];
const canWrite = [...adminOnly, authorizePermission(permissions.studentsWrite)];

router.get('/', ...canRead, validate(listStudentsSchema), StudentController.list);
router.post('/', ...canWrite, validate(createStudentSchema), StudentController.create);
router.get('/export.csv', ...canRead, StudentController.exportCsv);
router.post('/import', ...canWrite, validate(importStudentsSchema), StudentController.importCsv);

const canReadProfiles = [...adminOnly, authorizePermission(permissions.studentProfilesRead)];
const canWriteProfiles = [...adminOnly, authorizePermission(permissions.studentProfilesWrite)];
router.get('/:studentId/academic-profile', ...canReadProfiles, validate(studentProfileIdSchema), ProfileController.get);
router.put('/:studentId/academic-profile', ...canWriteProfiles, validate(updateStudentProfileSchema), ProfileController.update);

router.get('/:id', ...canRead, validate(studentIdSchema), StudentController.get);
router.patch('/:id', ...canWrite, validate(updateStudentSchema), StudentController.update);

export default router;
