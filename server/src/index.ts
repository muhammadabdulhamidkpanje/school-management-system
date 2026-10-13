import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
// cors does not currently provide TypeScript declarations in this project.
// @ts-expect-error The package is used as an untyped middleware dependency.
import cors from "cors";
import { env } from "./config/env.js";

import authRoutes from "./routes/auth.route.js";
import { globalErrorHandler } from "./errors/globalErrorHandler.js";
import emailRoutes from "./routes/email.routes.js";
import userRoutes from './routes/user.route.js';
import roleRoutes from './routes/role.route.js';
import permissionRoutes from './routes/permission.route.js';
import departmentRoutes from './routes/department.route.js';
import facultyRoutes from './routes/faculty.route.js';
import classroomRoutes from './routes/classroom.route.js';
import courseRoutes from './routes/course.route.js';
import subjectRoutes from './routes/subject.route.js';
import sessionRoutes from './routes/session.route.js';
import semesterRoutes from './routes/semester.route.js';
import institutionRoutes from './routes/institution.route.js';
import gradingSystemRoutes from './routes/grading-system.route.js';
import academicCalendarRoutes from './routes/academic-calendar.route.js';
import studentRoutes from './routes/student.route.js';
import admissionRoutes from './routes/admission.route.js';
import uploadRoutes from './routes/upload.route.js';
import staffRoutes from './routes/staff.route.js';
import enrollmentRoutes from './routes/enrollment.route.js';
import attendanceSessionRoutes from './routes/attendance-session.route.js';
import attendanceRoutes from './routes/attendance.route.js';
import courseOfferingRoutes from './routes/course-offering.route.js';
import assessmentRoutes from './routes/assessment.route.js';
import examRoutes from './routes/exam.route.js';
import scoreRoutes from './routes/score.route.js';
import financeRoutes from './routes/finance.route.js';
import prisma from './config/prisma.js';


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(morgan("dev"));

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      message: "Service is healthy",
      data: {
        status: "ok",
        database: "up",
      },
    });
  } catch {
    res.status(503).json({
      success: false,
      message: "Database is unavailable",
      data: {
        status: "degraded",
        database: "down",
      },
    });
  }
});

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "School management system backend is running" });
});

app.use("/auth", authRoutes);
app.use('/users', userRoutes);
app.use('/roles', roleRoutes);
app.use('/permissions', permissionRoutes);
app.use('/departments', departmentRoutes);
app.use('/faculties', facultyRoutes);
app.use('/classrooms', classroomRoutes);
app.use('/courses', courseRoutes);
app.use('/subjects', subjectRoutes);
app.use('/sessions', sessionRoutes);
app.use('/semesters', semesterRoutes);
app.use('/institution-profile', institutionRoutes);
app.use('/grading-systems', gradingSystemRoutes);
app.use('/academic-calendars', academicCalendarRoutes);
app.use('/students', studentRoutes);
app.use('/admissions', admissionRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/staff', staffRoutes);
app.use('/enrollments', enrollmentRoutes);
app.use('/attendance/sessions', attendanceSessionRoutes);
app.use('/attendance/records', attendanceRoutes);
app.use('/course-offerings', courseOfferingRoutes);
app.use('/assessments', assessmentRoutes);
app.use('/exams', examRoutes);
app.use('/scores', scoreRoutes);
app.use('/finance', financeRoutes);
app.use('/api/email', emailRoutes);
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(globalErrorHandler);

export default app;