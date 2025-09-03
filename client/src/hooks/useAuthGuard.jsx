import React from "react";
import { Navigate, Outlet, Route, Routes  } from "react-router";
import pb from "../lib/pocketbase";
import Login from "../features/auth/logIn";


const useAuthGuard = (allowedRoles = []) => {
  const user = pb.authStore.record;

  if (!pb.authStore.isValid) {
    return (
      <Navigate to="/auth/login" />
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.roles)) {
    return (
      <Navigate to="/unauthorized" />
    );
  }

  return  <Outlet /> && null; // ✅ means "allowed"
};

export default useAuthGuard;
