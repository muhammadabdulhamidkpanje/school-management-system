import type { Request, Response } from 'express';
import * as AttendanceService from '../services/attendance.service.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

const getSessionId = (req: Request) => req.params.sessionId as string;
const getRecordId = (req: Request) => req.params.recordId as string;

export const listRecords = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const attendanceSessionId = typeof req.query.attendanceSessionId === 'string' ? req.query.attendanceSessionId : undefined;
  const studentId = typeof req.query.studentId === 'string' ? req.query.studentId : undefined;
  const present = typeof req.query.present === 'string' ? req.query.present === 'true' : undefined;

  if (!attendanceSessionId) {
    return sendSuccess(res, { message: 'attendanceSessionId query parameter is required' }, 'Please provide attendanceSessionId');
  }

  sendSuccess(res, await AttendanceService.listRecords(page, limit, attendanceSessionId, studentId, present), 'Attendance records fetched');
});

export const getSessionAttendance = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const sessionId = getSessionId(req);
  sendSuccess(res, await AttendanceService.getSessionAttendance(sessionId, page, limit), 'Session attendance fetched');
});

export const getRecord = asyncHandler(async (req: Request, res: Response) => {
  const id = getRecordId(req);
  sendSuccess(res, await AttendanceService.getRecordById(id), 'Attendance record fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const record = await AttendanceService.createRecord(
    { attendanceSessionId: sessionId, ...req.body },
    req.user!.sub,
    req.ip
  );
  sendCreated(res, record, 'Attendance record created');
});

export const markMultiple = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const records = await AttendanceService.markAttendanceInSession(
    sessionId,
    { attendanceSessionId: sessionId, ...req.body },
    req.user!.sub,
    req.ip
  );
  sendSuccess(res, { records, count: records.length }, 'Attendance marked successfully');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const recordId = getRecordId(req);
  const record = await AttendanceService.updateRecord(
    recordId,
    req.body,
    req.user!.sub,
    req.ip
  );
  sendSuccess(res, record, 'Attendance record updated');
});

export const delete_record = asyncHandler(async (req: Request, res: Response) => {
  const recordId = getRecordId(req);
  const result = await AttendanceService.deleteRecord(
    recordId,
    req.user!.sub,
    req.ip
  );
  sendSuccess(res, result, 'Attendance record deleted');
});

export const checkDuplicates = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const duplicateCheck = await AttendanceService.checkForDuplicates(sessionId, req.body.studentIds);
  sendSuccess(res, duplicateCheck, 'Duplicate check completed');
});

export const getStudentHistory = asyncHandler(async (req: Request, res: Response) => {
  const studentId = req.params.studentId as string;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const classroomId = typeof req.query.classroomId === 'string' ? req.query.classroomId : undefined;
  const courseOfferingId = typeof req.query.courseOfferingId === 'string' ? req.query.courseOfferingId : undefined;
  const startDate = typeof req.query.startDate === 'string' ? new Date(req.query.startDate) : undefined;
  const endDate = typeof req.query.endDate === 'string' ? new Date(req.query.endDate) : undefined;

  sendSuccess(
    res,
    await AttendanceService.getStudentAttendanceHistory(studentId, page, limit, classroomId, courseOfferingId, startDate, endDate),
    'Student attendance history fetched'
  );
});

export const getStudentSummary = asyncHandler(async (req: Request, res: Response) => {
  const studentId = req.params.studentId as string;
  const classroomId = typeof req.query.classroomId === 'string' ? req.query.classroomId : undefined;
  const courseOfferingId = typeof req.query.courseOfferingId === 'string' ? req.query.courseOfferingId : undefined;
  const startDate = typeof req.query.startDate === 'string' ? new Date(req.query.startDate) : undefined;
  const endDate = typeof req.query.endDate === 'string' ? new Date(req.query.endDate) : undefined;

  sendSuccess(
    res,
    await AttendanceService.getStudentAttendanceSummary(studentId, classroomId, courseOfferingId, startDate, endDate),
    'Student attendance summary fetched'
  );
});

export const getClassroomSummary = asyncHandler(async (req: Request, res: Response) => {
  const classroomId = req.params.classroomId as string;
  const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId : undefined;

  sendSuccess(
    res,
    await AttendanceService.getClassroomAttendanceSummary(classroomId, sessionId),
    'Classroom attendance summary fetched'
  );
});

export const getCourseOfferingsSummary = asyncHandler(async (req: Request, res: Response) => {
  const courseOfferingId = req.params.courseOfferingId as string;
  const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId : undefined;

  sendSuccess(
    res,
    await AttendanceService.getCourseOfferingAttendanceSummary(courseOfferingId, sessionId),
    'Course offering attendance summary fetched'
  );
});

export const getAdvancedFilteredReport = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 100);
  const classroomId = typeof req.query.classroomId === 'string' ? req.query.classroomId : undefined;
  const courseOfferingId = typeof req.query.courseOfferingId === 'string' ? req.query.courseOfferingId : undefined;
  const studentId = typeof req.query.studentId === 'string' ? req.query.studentId : undefined;
  const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId : undefined;
  const present = typeof req.query.present === 'string' ? req.query.present === 'true' : undefined;
  const startDate = typeof req.query.startDate === 'string' ? new Date(req.query.startDate) : undefined;
  const endDate = typeof req.query.endDate === 'string' ? new Date(req.query.endDate) : undefined;
  const sortBy = (typeof req.query.sortBy === 'string' ? req.query.sortBy : 'date') as string;
  const sortOrder = (typeof req.query.sortOrder === 'string' ? req.query.sortOrder : 'desc') as 'asc' | 'desc';

  sendSuccess(
    res,
    await AttendanceService.getAdvancedFilteredAttendance(
      page,
      limit,
      classroomId,
      courseOfferingId,
      studentId,
      sessionId,
      present,
      startDate,
      endDate,
      sortBy,
      sortOrder
    ),
    'Filtered attendance report fetched'
  );
});

export const getStatisticsReport = asyncHandler(async (req: Request, res: Response) => {
  const classroomId = typeof req.query.classroomId === 'string' ? req.query.classroomId : undefined;
  const courseOfferingId = typeof req.query.courseOfferingId === 'string' ? req.query.courseOfferingId : undefined;
  const studentId = typeof req.query.studentId === 'string' ? req.query.studentId : undefined;
  const startDate = typeof req.query.startDate === 'string' ? new Date(req.query.startDate) : undefined;
  const endDate = typeof req.query.endDate === 'string' ? new Date(req.query.endDate) : undefined;

  sendSuccess(
    res,
    await AttendanceService.getAttendanceStatisticsReport(classroomId, courseOfferingId, studentId, startDate, endDate),
    'Attendance statistics report fetched'
  );
});
