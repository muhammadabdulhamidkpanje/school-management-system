import React from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  CircleSlashedIcon,
  FileText,
  User,
} from "lucide-react";


import Main from "../../UI/Main";
import DashboardNav from "../../components/navBar/DashboardNav/dashboardnav";
import Footer from "../../components/footer/footer";
import SideNav from "../../components/navBar/DashboardNav/sideNav";
import { Outlet } from "react-router";
import Table from "../../components/table/table";
import useAuthGuard from "../../hooks/useAuthGuard";

const items = [
  { path: "/student-dashboard", name: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { path: "/student-courses", name: "Courses", icon: <CreditCard size={20} /> },
  { path: "/student-attendances", name: "Attendances", icon: <CalendarCheck size={20} /> },
  { path: "/student-payments", name: "Payments", icon: <CreditCard size={20} /> },
  { path: "/student-result", name: "Result", icon: <FileText size={20} /> },
  { path: "/student-profile", name: "Profile", icon: <User size={20} /> },
];


export default function StudentDashboard({ children }) {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const authGuard = useAuthGuard(["student"]);
  if (authGuard) return authGuard;

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
