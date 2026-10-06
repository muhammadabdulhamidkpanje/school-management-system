import React from "react";
import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

/**
 * Wrap a set of <Route> children with this to require auth (and,
 * optionally, a specific role). Usage in routes.jsx:
 *
 *   <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
 *     <Route element={<AdminDashboardLayout />}>
 *       ...admin routes...
 *     </Route>
 *   </Route>
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  const roleName = user?.role?.name;
  if (allowedRoles && !allowedRoles.includes(roleName)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}