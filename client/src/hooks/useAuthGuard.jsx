import React, { useState, useEffect } from "react";
import { Navigate } from "react-router";
import pb from "../lib/pocketbase";

const useAuthGuard = (allowedRoles = []) => {
  const [user, setUser] = useState(pb.authStore.record);
  const [isValid, setIsValid] = useState(pb.authStore.isValid);

  useEffect(() => {
    // Subscribe to PocketBase auth changes
    const unsubscribe = pb.authStore.onChange(() => {
      setUser(pb.authStore.record);
      setIsValid(pb.authStore.isValid);

      // Force reload when auth or user changes
      window.location.reload();
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // If no valid auth → redirect to login
  if (!isValid) {
    return <Navigate to="/auth/login" replace />;
  }

  // If user exists but role not allowed → redirect unauthorized
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Allowed → continue rendering
  return null;
};

export default useAuthGuard;
