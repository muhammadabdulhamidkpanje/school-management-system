import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { authLogin } from "./authSlice";
import { login as loginRequest } from "./authApi";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [disabled, setDisabled] = useState(false);
  const dispatch = useDispatch();

  // redux-persist already rehydrates this from storage, so if a valid
  // session exists we redirect without hitting the network.
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const { handleSubmit } = useForm();

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

  const onSubmit = async () => {
    setError("");
    setDisabled(true);
    try {
      // { accessToken, user } — see authApi.login() / auth.controller.ts login()
      const result = await loginRequest(email, password);
      dispatch(authLogin(result));
    } catch (err) {
      // Backend error shape: { success: false, message, errors } (utils/response.ts)
      setError(err.response?.data?.message ?? "Something went wrong. Please try again.");
      setDisabled(false);
    }
  };

  if (isAuthenticated && user) {
    return <Navigate to={determineRedirectUrl(user.role?.name)} />;
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
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-blue-500 uppercase">
              Welcome back!
            </h2>
            <p className="text-xl text-gray-600">
              Please enter your email and password to login.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

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
              name="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password Input with toggle */}
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
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-md border border-gray-300 p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`w-full rounded-md px-4 py-2 text-white transition duration-200 ${
              disabled
                ? "cursor-not-allowed bg-blue-300"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={!email || !password || disabled}
          >
            {disabled ? "Logging in..." : "Login"}
          </button>

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