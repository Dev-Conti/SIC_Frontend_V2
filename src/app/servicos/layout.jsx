"use client";

import Sidebar from "@/components/Layout/Sidebar";
import { useState, createContext, useContext } from "react";
import withAuth from "@/hoc/withAuth";
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
import useConfigGroups from "@/hooks/useConfigGroups";
import useMembers from "@/hooks/useMembers";
import { useRouter } from "next/navigation";

const baseRoute = "/servicos";

const DataContext = createContext();

function UserLayout({ children, emails, members }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

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
    <DataContext.Provider value={{ emails, members }}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
          className="transition-all duration-300"
          sections={sections}
        />
        {/* Conteúdo Principal */}
        <div className={`flex flex-col w-full min-w-0 transition-all duration-300 ${isSidebarCollapsed ? "ml-16" : "ml-64"}`}>
          <NavbarDefault/>
          <div className="flex-1 p-4">
            {children}
          </div>
        </div>
      </div>
    </DataContext.Provider>
  );
}

const withEmails = (Component) => (props) => {
  const router = useRouter();
  const config = useConfigGroups(baseRoute);
  const { emails, members, loading, error } = useMembers(config.group_id, config.channel_id);

  if (loading) {
    return <p>Verificando Permissões...</p>;
  }

  if (error) {
    router.push("/");
    return null;
  }

  return <Component {...props} emails={emails} members={members} />;
};

export const useDataContext = () => useContext(DataContext);

export default withEmails(withAuth(UserLayout));
