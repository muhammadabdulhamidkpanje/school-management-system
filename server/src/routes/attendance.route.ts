import { Router } from 'express';
import * as AttendanceController from '../controllers/attendance.controller.js';
import { authenticate, authorizeRole, authorizePermission } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import {
  listAttendanceRecordsSchema,
  getSessionAttendanceSchema,
  createAttendanceRecordSchema,
  updateAttendanceRecordSchema,
  markMultipleAttendanceSchema,
  deleteAttendanceRecordSchema,
  checkDuplicatesSchema,
  studentAttendanceHistorySchema,
  studentAttendanceSummarySchema,
  classroomAttendanceSummarySchema,
  courseOfferingAttendanceSummarySchema,
  advancedFilterSchema,
  attendanceStatisticsSchema,
} from '../validators/attendance.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canRead = [...adminOnly, authorizePermission(permissions.attendanceRead)];
const canWrite = [...adminOnly, authorizePermission(permissions.attendanceWrite)];

// List all attendance records with optional filters
router.get('/', ...canRead, validate(listAttendanceRecordsSchema), AttendanceController.listRecords);

// Get all attendance records for a specific session
router.get('/session/:sessionId', ...canRead, validate(getSessionAttendanceSchema), AttendanceController.getSessionAttendance);

// Create a single attendance record
router.post('/:sessionId', ...canWrite, validate(createAttendanceRecordSchema), AttendanceController.create);

// Mark multiple students' attendance in a session (bulk operation)
router.post('/:sessionId/mark-multiple', ...canWrite, validate(markMultipleAttendanceSchema), AttendanceController.markMultiple);

// Check for duplicate attendance records before marking
router.post('/:sessionId/check-duplicates', ...canRead, validate(checkDuplicatesSchema), AttendanceController.checkDuplicates);

// Get a specific attendance record
router.get('/:sessionId/:recordId', ...canRead, AttendanceController.getRecord);

// Update a specific attendance record
router.patch('/:sessionId/:recordId', ...canWrite, validate(updateAttendanceRecordSchema), AttendanceController.update);

// Delete a specific attendance record
router.delete('/:sessionId/:recordId', ...canWrite, validate(deleteAttendanceRecordSchema), AttendanceController.delete_record);

// Student attendance history and summary
router.get('/student/:studentId/history', ...canRead, validate(studentAttendanceHistorySchema), AttendanceController.getStudentHistory);
router.get('/student/:studentId/summary', ...canRead, validate(studentAttendanceSummarySchema), AttendanceController.getStudentSummary);

// Classroom and course offering attendance summaries
router.get('/classroom/:classroomId/summary', ...canRead, validate(classroomAttendanceSummarySchema), AttendanceController.getClassroomSummary);
router.get('/course-offering/:courseOfferingId/summary', ...canRead, validate(courseOfferingAttendanceSummarySchema), AttendanceController.getCourseOfferingsSummary);

// Advanced filtering and reporting
router.get('/reports/filtered', ...canRead, validate(advancedFilterSchema), AttendanceController.getAdvancedFilteredReport);
router.get('/reports/statistics', ...canRead, validate(attendanceStatisticsSchema), AttendanceController.getStatisticsReport);

export default router;
