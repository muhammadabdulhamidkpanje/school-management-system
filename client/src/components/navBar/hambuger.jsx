import React from "react"; // React library for building user interfaces
import { X } from "lucide-react"; // lucide icons for a modern look
import { Link, useLocation } from "react-router";
import Logo from "../logo/logo";




const HamburgerMenu = ({
  menuItems,
  isOpen,
  toggleMenu,
}) => {
  const location = useLocation();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-transparent opacity-5 bg-opacity-40 z-40"
          onClick={toggleMenu}
        />
      )}

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-[70%] bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-lg`}
      >
        <div className="p-4 flex justify-between items-center border-b text-black">
          <Logo title={"SMS"} />
          <button onClick={toggleMenu} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>
        <ul className="flex flex-col p-4 space-y-4 capitalize">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`block px-4 py-2 rounded transition-all ${
                  location.pathname === item.path
                    ? "bg-blue-100 text-blue-600 font-semibold"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
                onClick={toggleMenu}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default HamburgerMenu;
