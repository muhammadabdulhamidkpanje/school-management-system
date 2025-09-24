import React from "react";
import { useNavigate } from "react-router-dom";

export default function UnAuthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500">403</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-800">
          You are not authorized to access this page.
        </h2>
        <p className="mt-2 text-gray-600">
          Please contact your administrator if you believe this is a mistake.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
}
