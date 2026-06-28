"use client";

import Sidebar from "@/components/Layout/Sidebar";
import { useState } from "react";
import withAuth from "@/hoc/withAuth";
import routePermissions from "@/data/routePermissions";
import { NavbarDefault } from "@/components/Layout/NavbarDefault";
import {
  FiHome,
  FiSettings,
  FiFileText,
  FiFolder,
  FiBarChart2,
} from "react-icons/fi";
import { GrProjects } from "react-icons/gr";
import { GrTestDesktop } from "react-icons/gr";
import { GrUserManager } from "react-icons/gr";

function UserLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const baseRoute = "/servicos"; // Define a rota base
  const sections = [
    {
      label: "página inicial",
      items: [
        {
          label: "Dashboard",
          icon: FiHome,
          link: `${baseRoute}/dashboard`,
        },
      ],
    },
    {
      label: "Serviços",
      items: [
        {
          label: "Projetos",
          icon: GrProjects,
          link: `${baseRoute}/projetos`,
        },
        {
          label: "Warmup",
          icon: FiFileText,
          link: `${baseRoute}/warmup`,
        },
        {
          label: "AMS",
          icon: GrUserManager,
          subItems: [
            { label: "Projetos", link: `${baseRoute}/ams/projetos` },
            { label: "Chamados", link: `${baseRoute}/ams/chamados` },
            { label: "Apontamentos", link: `${baseRoute}/ams/apontamentos` },
          ],
        },
      ],
    },
    {
      label: "Configurações",
      items: [
        {
          label: "Ajustes",
          icon: FiSettings,
          link: `${baseRoute}/ajustes`,
        },
        {
          label: "Testes",
          icon: GrTestDesktop,
          link: `${baseRoute}/testes`,
        },
      ],
    },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        className="transition-all duration-300"
        sections={sections}
      />
      {/* Conteúdo Principal */}
      <div className={`flex flex-col w-full transition-all duration-300 ${isSidebarCollapsed ? "ml-16" : "ml-64"}`}>
        <NavbarDefault/>
        <div className="flex-1 p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default withAuth(UserLayout, routePermissions);
