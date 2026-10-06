import React, { useState } from "react";
import { Link } from "react-router"; // ✅ should be react-router-dom
import { useDispatch } from "react-redux";
import { authLogout } from "../../features/auth/authSlice";
import { logout as logoutRequest } from "../../features/auth/authApi";
import queryClient from "../../lib/queryClient";



export default function Avatar({ src = "/avatar.jpeg", alt = "User Avatar", user }) {
  const [hover, setHover] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = async () => {
  try {
    await logoutRequest(); // revokes the refresh token, clears the cookie
  } catch {
    // Offline or session already dead: still sign out locally.
  } finally {
    queryClient.clear(); // don't leave one user's cached data for the next
    dispatch(authLogout());
  }
};

  return (
    <div className="relative flex gap-2 items-center justify-center px-4">
      <img
        className="w-10 h-10 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500"
        src={user?.avatar ? `${user.avatar}` : src}
        alt={alt}
      />

      {/* User Info */}
      <div className="flex flex-col justify-center items-start mt-2 capitalize">
        <p className="text-sm">{user?.name?.split(" ")[0]}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.role}</p>
      </div>

      <span
        onClick={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="text-gray-500 cursor-pointer"
      >
        ▼

      {/* Dropdown Menu */}
      {hover && (
        <div className="absolute right-0 top-8 z-10 mt-2 w-48 rounded-md bg-white shadow-lg">
          <ul className="py-1">
            <li>
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Settings
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
      </span>
    </div>
  );
}

Avatar.defaultProps = {
  src: "/avatar.jpeg",
  alt: "User Avatar",
};
