import React from "react";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, Link } from "react-router";

import HamburgerMenu from "./hambuger";
import PrimaryButton from "../button/button";
import Logo from "../logo/logo";
import NavHeaderContainer from "../../UI/navHeader";


const menuItems = [
  { name: "Home", path: "/" },
  { name: "About us", path: "/about-us" },
  { name: "Contact us", path: "/contact-us" },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <NavHeaderContainer className="h-18 items-center justify-around">
      <div className="hidden items-center text-xl font-bold text-blue-500 uppercase lg:flex">
        <Logo title={"SMS"} />
      </div>

      {/* Desktop Nav */}
      <nav className="hidden justify-around gap-10 capitalize lg:flex">
        {menuItems.map((item) => (
          <NavLink
            style={({ isActive }) => ({
              color: isActive ? "blue" : "",
              underline: isActive ? "underline" : "none",
              fontWeight: isActive ? "bold" : "normal",
            })}
            key={item.path}
            to={item.path}
            className={`flex px-6 text-gray-700 transition hover:text-black`}
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Hamburger Button for Mobile */}
      <button
        className="p-2 text-gray-700 hover:text-black lg:hidden"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
      <div className="items-center text-xl font-bold text-black uppercase sm:flex lg:hidden">
        <Logo title="SMS" />
      </div>
      {/* Mobile Menu */}
      <HamburgerMenu
        menuItems={menuItems}
        isOpen={isOpen}
        s
        toggleMenu={toggleMenu}
      />
      <div className="flex items-center justify-around gap-4">
        <PrimaryButton color="white" height="10" width="32" bg="blue-500">
          <Link to="/auth/login">
            <span className="text-white">log in</span>
          </Link>
        </PrimaryButton>
        <PrimaryButton color="white" height="" width="" bg="blue-500">
          <Link
          className="text-white"
          to="/admission">Admission</Link>
        </PrimaryButton>
      </div>
    </NavHeaderContainer>
  );
}

export default Navbar;
