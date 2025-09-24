import React from "react";
import { Link } from "react-router";

export default function Avatar({ src = "/avater.jpeg", alt = "User Avatar", user, role }) {
const [hover, setHover] = React.useState(false);
  console.log(user);
  return (
    <div className="flex gap-2 items-center justify-center px-4">
      <img className="w-10 h-10 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500" src={`/${user.avatar}` || src} alt={alt} />
      <div className="flex flex-col justify-center items-start mt-2 capitalize">
      <p className="text-sm ">{user.name.split(" ")[0]}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
     </div>
     <span 
     onClick={() => setHover(!hover)}
     className="text-gray-500">▼</span>
      {hover && (
     <div className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg">
       <ul className="py-1">
         <li>
           <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
             Profile
           </Link>
         </li>
         <li>
           <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
             Settings
           </Link>
         </li>
         <li>
           <Link to="/logout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
             Logout
           </Link>
         </li>
       </ul>
     
     </div>
     )}
    </div>
  );
}
Avatar.defaultProps = {
  src: "/avater.jpeg",
  alt: "User Avatar",
};