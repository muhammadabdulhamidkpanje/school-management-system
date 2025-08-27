import React from "react";
import { Outlet } from "react-router";

import Main from "../../UI/Main";
import DashboardNav from "../../components/navBar/DashboardNav/dashboardnav";
import Footer from "../../components/footer/footer";
import SideNav from "../../components/navBar/DashboardNav/sideNav";
import { Home, CalendarClock, Users, GraduationCap, Book, Settings, BookMarked } from "lucide-react";



export default function AdminDashboard({ children }) {
  let items = [
    {
      path: "/",
      name: "Dashboard",
      icon: <Home size={26} />,
    },
    {
      path: "/institution-settings",
      name: "Institution Settings",
      icon: <BookMarked size={26} />,
    },
    {
      path: "/timetable-and-schedules",
      name: "Timetable and Schedules",
      icon: <CalendarClock size={26} />,
    },
    {
      path: "/Staff-Management",
      name: "Staff Management",
      icon: <Users size={26} />,
    },
    {
      path: "/Student-management",
      name: "Student Management",
      icon: <GraduationCap size={26} />,
    },
    {
      path: "/Course-Management",
      name: "Course Management",
      icon: <Book size={26} />,
    },
    {
      path: "/user-management",
      name: "User Management",
      icon: <Settings size={26} />,
    },
  ];
  
    items = items.map((item) => (
       { path: `admin-dashboard${item.path}`,
        name: item.name,
        icon: item.icon
    }
    ))
    return (
      <div className="flex h-full">
        <SideNav items={items} className="max-h-full" />
        <div className="flex h-full w-full flex-auto flex-col">
          <DashboardNav />
          <Main className="h-lvh overflow-y-auto">
            <Outlet />
          </Main>
          <Footer />
        </div>
      </div>
    );
}


