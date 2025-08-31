import React, { useState, useEffect } from "react";
import { Navigate } from "react-router";
import Input from "../../components/inputs/input";
import { useDispatch } from "react-redux";
import { authLogin } from "./authSlice";
import PocketBase from 'pocketbase';


export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const dispatch = useDispatch();
  const pb = new PocketBase('http://127.0.0.1:8090');
  

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setRedirect(true);
  }, []);

  // const onSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setDisabled(true);
  //   try {
  //     const res = await fetch("http://localhost:3000/api/v1/auth/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.detail || "Login failed");
  //     console.log(data);
  //     localStorage.setItem("token", JSON.stringify(data));
  //     dispatch(authLogin(JSON.parse(localStorage.getItem("token"))));

  //     setRedirect(true);
  //   } catch (err) {
  //     setError(err.message);
  //     setDisabled(false);
  //   }
  // };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDisabled(true);
    try {
      const authData =  await pb.collection('users').authWithPassword( email, password,);
      setRedirect(true);
      dispatch(authLogin(authData));
      localStorage.setItem("token", JSON.stringify(authData));
    } catch (error) {
      setError(error.message);
      setDisabled(false);
    }
  };
  if (redirect) return <Navigate to="/admin-dashboard" />;

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
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-blue-500 uppercase">
              Welcome back!
            </h2>
            <p className="text-xl text-gray-600">
              Please enter your email and password to login.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Input
            type="email"
            name="email"
            label="Email"
            floating={true}
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            label="Password"
            floating={true}
            showToggle={true}
            onTogglePassword={() => setShowPassword(!showPassword)}
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
          />

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
            Don’t have an account?{" "}
            <span className="cursor-pointer text-blue-600 hover:underline">
              Sign up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
