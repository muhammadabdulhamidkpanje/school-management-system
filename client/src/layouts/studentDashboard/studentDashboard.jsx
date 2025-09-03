import React from "react";

import Main from "../../UI/Main";
import DashboardNav from "../../components/navBar/DashboardNav/dashboardnav";
import Footer from "../../components/footer/footer";
import SideNav from "../../components/navBar/DashboardNav/sideNav";
import { Outlet } from "react-router";
import Table from "../../components/table/table";
import useAuthGuard from "../../hooks/useAuthGuard";


export default function StudentDashboard({ children }) {
  const authGuard = useAuthGuard(["student"]);
  if (authGuard) return authGuard;

    const items = [
      { path: "/dashboard", name: "Dashboard", icon: "icon" },
      { path: "/Attendances", name: "Atendances", icon: "/icons" },
      { path: "/Profile", name: "Profile", icon: "/icons" },
      { path: "/student-result", name: "Payments", icon: "/icons" },
    ];
    return (
      <div className="flex h-full ">
        <SideNav items={items} className="max-h-full" />
        <div className="flex flex-col flex-auto h-full w-full "> 
        <DashboardNav />
        <Main>
          
          <Outlet />
        
        </Main>
        <Footer />
        </div>
      </div>
    );
}


