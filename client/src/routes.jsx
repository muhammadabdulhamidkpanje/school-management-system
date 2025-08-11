import React, { Suspense } from "react";
import { Routes, Route } from "react-router";

import PagesLayout from "./layouts/pagesLayout/pageslayout";

import Home from "./pages";
import AuthPage from "./pages/auth";
import Login from "./features/auth/logIn";

import StudentDashboardLayout from "./layouts/studentDashboard/studentDashboard";
import StudentDashboard from "./pages/studentDashboard/index";

import AdminDashboardLayout from "./layouts/adminDashboard/adminDashboard";
import AdminDashboard from "./pages/adminDashboard/index";
import StaffManagement from "./pages/adminDashboard/staffmanagement/staffManagement";
import StudentManagement from "./pages/adminDashboard/studentManagement/studentManagement";
import AddStaff from "./features/addstaff/addStaff";
import Admission from "./pages/admission";

import LoadingSpinner from "./UI/spinner";

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
        </Route>

        {/* Student Dashboard */}
        <Route element={<StudentDashboardLayout />}>
          <Route path="/student-dashboard" element={<StudentDashboard />} />
        </Route>

        {/* Admin Dashboard */}
        <Route element={<AdminDashboardLayout />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route
            path="/admin-dashboard/Staff-Management"
            element={<StaffManagement />}
          />
          <Route
            path="/admin-dashboard/Student-Management"
            element={<StudentManagement />}
          />
          <Route path="/admin-dashboard/addStaff" element={<AddStaff />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
