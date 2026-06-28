"use client";

import Sidebar from "@/components/Layout/Sidebar";
import { ThemeProvider } from "@material-tailwind/react";
import { useState } from "react";
import withAuth from "@/hoc/withAuth";
import routePermissions from "@/data/routePermissions";

function UserLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        className="transition-all duration-300"
      />

      {/* Conteúdo Principal */}
      <div
        className={`flex-1 p-2 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-24" : "ml-64"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default withAuth(UserLayout, routePermissions);