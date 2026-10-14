
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff } from "lucide-react";
import LoadingButton from "../../components/button/loadingButton";

import { authLogin } from "./authSlice";
import { login as loginRequest } from "./authApi";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function determineRedirectUrl(roleName) {
    switch (roleName) {
      case "admin":
        return "/admin-dashboard";
      case "staff":
        return "/staff-dashboard";
      case "student":
        return "/student-dashboard";
      default:
        return "/";
    }
  }

  const onSubmit = async (formData) => {
    setError("");

    try {
      const result = await loginRequest(
        formData.email.trim(),
        formData.password
      );

      if (!result?.accessToken || !result?.user) {
        throw new Error(
          "Invalid login response from the server."
        );
      }

      dispatch(authLogin(result));
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  if (isAuthenticated && user) {
    return (
      <Navigate
        to={determineRedirectUrl(user.role?.name)}
        replace
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left Side Image */}
      <div className="hidden h-screen md:block md:w-1/2">
        <img
          src="/login-jpg.jpg"
          alt="Login Illustration"
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Right Side Form */}
      <div className="flex w-full items-center justify-center p-6 md:w-1/2">
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="w-full max-w-md space-y-6"
        >
          {/* Heading */}
          <div>
            <h2 className="text-3xl font-bold uppercase text-blue-500">
              Welcome back!
            </h2>

            <p className="text-xl text-gray-600">
              Please enter your email and password to login.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="rounded-md bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="Enter your email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? "email-error" : undefined
              }
              disabled={isSubmitting}
              {...register("email", {
                required: "Email is required.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address.",
                },
              })}
              className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />

            {errors.email && (
              <p
                id="email-error"
                className="mt-1 text-sm text-red-500"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password
                    ? "password-error"
                    : undefined
                }
                disabled={isSubmitting}
                {...register("password", {
                  required: "Password is required.",
                })}
                className="w-full rounded-md border border-gray-300 p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {errors.password && (
              <p
                id="password-error"
                className="mt-1 text-sm text-red-500"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <LoadingButton
            type="submit"
            isLoading={isSubmitting}
            loadingText="Logging in..."
            className={`w-full rounded-md px-4 py-2 text-white transition duration-200 ${
              isSubmitting
                ? "cursor-not-allowed bg-blue-300"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Login
          </LoadingButton>

          {/* Sign Up */}
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <span className="cursor-pointer text-blue-600 hover:underline">
              Sign up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
