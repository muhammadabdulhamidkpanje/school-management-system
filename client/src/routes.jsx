import React, { Suspense } from "react";
import { Routes, Route } from "react-router";

import PagesLayout from "./layouts/pagesLayout/pageslayout";

import Home from "./pages";
import AuthPage from "./pages/auth";
import Login from "./features/auth/logIn";
import Admission from "./pages/admission";


import StudentDashboardLayout from "./layouts/studentDashboard/studentDashboard";
import StudentDashboard from "./pages/studentDashboard/index";
import StudentCourse from "./pages/studentDashboard/course";

import StaffDashboardLayout from "./layouts/staffDashboard/staffDashboard";

import AdminDashboardLayout from "./layouts/adminDashboard/adminDashboard";
import AdminDashboard from "./pages/adminDashboard/index";
import StaffManagement from "./pages/adminDashboard/staffmanagement/staffManagement";
import StudentManagement from "./pages/adminDashboard/studentManagement/studentManagement";
import CourseManagement from "./pages/adminDashboard/courseManagement/courseManagement";
import TimeTableAndSchedules from "./pages/adminDashboard/timeTable and schedules/timeTableAndSchedules";
import InstitutionSettings from "./pages/adminDashboard/Institution Settings/insInstitutionSettings";
import AddStaff from "./features/addstaff/addStaff";


import LoadingSpinner from "./UI/spinner";
import ContactUS from "./pages/contact";
import UnAuthorized from "./pages/unAuthorised";

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Pages */}
        <Route element={<PagesLayout />}>
          <Route index element={<Home />} />
          <Route path="/admission" element={<Admission />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="*" element={<h1>Page Not Found</h1>} />
          <Route path="/contact-us" element={<ContactUS />} />
          <Route path="/unauthorized" element ={<UnAuthorized/>} />
        </Route>

        {/* Student Dashboard */}
        <Route element={<StudentDashboardLayout />}>
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/student-courses" element={<StudentCourse />} />
          <Route
            path="/student-attendances"
            element={<h1>Attendances Page</h1>}
          />
          <Route path="/student-payments" element={<h1>Payments Page</h1>} />
          <Route path="/student-result" element={<h1>Result Page</h1>} />
          <Route path="/student-profile" element={<h1>Profile Page</h1>} />
        </Route>

        {/* Staff Dashboard*/}

        <Route element = {<StaffDashboardLayout />}>
          <Route path="/staff-dashboard" element={<h1>welcome</h1>} />
        </Route>

        {/* Admin Dashboard */}
        <Route element={<AdminDashboardLayout />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route
            path="/admin-dashboard/timetable-and-schedules"
            element={<TimeTableAndSchedules />}
          />
          <Route
            path="/admin-dashboard/course-Management"
            element={<CourseManagement />}
          />
          <Route
            path="/admin-dashboard/Staff-Management"
            element={<StaffManagement />}
          />
          <Route
            path="/admin-dashboard/Student-Management"
            element={<StudentManagement />}
          />
          <Route
            path="/admin-dashboard/Institution-Settings"
            element={<InstitutionSettings />}
          />
          <Route path="/admin-dashboard/addStaff" element={<AddStaff />} />
        </Route>
      </Routes>
    </Suspense>
  );
};


export default AppRoutes;
