import React from "react";

export default function Avatar({ src = "/avater.jpeg", alt = "User Avatar", user, role }) {
  return (
    <div className="flex gap-2">
      <img className="w-10 h-10 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500" src={src} alt={alt} />
      <div className="flex flex-col justify-center mt-2 capitalize">
      <p className="text-sm ">{user.name}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
     </div>
    </div>
  );
}
Avatar.defaultProps = {
  src: "/avater.jpeg",
  alt: "User Avatar",
};