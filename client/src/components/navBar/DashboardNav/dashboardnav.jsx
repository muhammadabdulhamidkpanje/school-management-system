import React, { useEffect } from "react";
import NavHeaderContainer from "../../../UI/navHeader";
import Avatar from "../../Avater/avater";
import SearchInput from "../../search";
import { Bell, Mail, Search } from "lucide-react";
import { useLocation } from "react-router"; 

export default function DashboardNav({ nav }) {
  const [showSearch, setShowSearch] = React.useState(false);
  const searchRef = React.useRef();
  const location = useLocation();
  const toggleSearch = () => setShowSearch((prev) => !prev);

  useEffect(() => {
    if (showSearch) {
      clearTimeout(searchRef.current);
      searchRef.current = setTimeout(() => {
        setShowSearch(false);
      }, 30000);
    }
    return () => clearTimeout(searchRef.current);
  }, [showSearch]);

  const getPageTitle = () => {
    const segments = location.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] || "dashboard";
    return last
      .replace(/-/g, " ") // change hyphens to spaces
      .replace(/\b\w/g, (l) => l.toUpperCase()); // capitalize
  };

  return (
    <NavHeaderContainer className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
      {/* Left: Dynamic Page Title */}
      <div className="w-1/4">
        <h1 className="text-xl font-bold capitalize sm:text-2xl">
          {getPageTitle()}
        </h1>
      </div>

      {/* Middle: Search Toggle for small screens */}
      <div className="flex w-1/3 justify-center md:hidden">
        {showSearch ? (
          <SearchInput onBlur={toggleSearch} autoFocus />
        ) : (
          <Search
            ref={searchRef}
            className="cursor-pointer text-gray-600 hover:text-gray-800"
            onClick={toggleSearch}
          />
        )}
      </div>

      {/* Middle: Search bar for desktop */}
      <div className="hidden w-1/3 justify-center md:flex">
        <SearchInput onBlur={toggleSearch} autoFocus />
      </div>

      {/* Right: Notifications and Avatar */}
      <div className="flex w-1/3 items-center justify-end space-x-4">
        <Bell className="cursor-pointer text-gray-600 hover:text-gray-800" />
        <Mail className="cursor-pointer text-gray-600 hover:text-gray-800" />
        <Avatar
          src="/avater.jpeg"
          user={{
            name: "Ibrahim Musa",
            email: "admin@example.com",
            role: "admin",
          }}
        />
      </div>
    </NavHeaderContainer>
  );
}
