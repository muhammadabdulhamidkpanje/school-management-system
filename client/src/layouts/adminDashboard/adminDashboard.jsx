import React, {useState} from "react";
import { Outlet } from "react-router";

import Main from "../../UI/Main";
import DashboardNav from "../../components/navBar/DashboardNav/dashboardnav";
import Footer from "../../components/footer/footer";
import SideNav from "../../components/navBar/DashboardNav/sideNav";
import {
  Home,
  CalendarClock,
  Users,
  GraduationCap,
  Book,
  Settings,
  BookMarked,
  ClipboardList,
} from "lucide-react";



  const navigationItems = [
    {
      path: "/",
      name: "Dashboard",
      icon: <Home size={26} />,
    },
    {
      path: "/admissions",
      name: "Admissions",
      icon: <ClipboardList size={26} />,
      group: "People",
    },
    {
      path: "/Staff-Management",
      name: "Staff Management",
      icon: <Users size={26} />,
      group: "People",
    },
    {
      path: "/Student-management",
      name: "Student Management",
      icon: <GraduationCap size={26} />,
      group: "People",
    },
    {
      path: "/institution-settings",
      name: "Institution Settings",
      icon: <BookMarked size={26} />,
      group: "Academics",
    },
    {
      path: "/Course-Management",
      name: "Course Management",
      icon: <Book size={26} />,
      group: "Academics",
    },
    {
      path: "/timetable-and-schedules",
      name: "Timetable and Schedules",
      icon: <CalendarClock size={26} />,
      group: "Academics",
    },
    {
      path: "/user-management",
      name: "User Management",
      icon: <Settings size={26} />,
      group: "System",
    },
  ];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

    const items = navigationItems.map((item) => ({
      ...item,
      path: `/admin-dashboard${item.path}`,
    }));
    return (
      <div className="flex h-full">
        <SideNav setSidebarOpen={setSidebarOpen} items={items} className={`max-h-full ${sidebarOpen ? "block" : "hidden"}`} />
        <div className="flex h-full w-full flex-auto flex-col">
          <DashboardNav setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
          <Main className="h-lvh overflow-y-auto">
            <Outlet />
          </Main>
          <Footer />
        </div>
      </div>
    );
}

