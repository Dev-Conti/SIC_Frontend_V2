"use client";

import { useState, createContext, useContext } from "react";
import Sidebar from "@/components/Layout/Sidebar";
import withAuth from "@/hoc/withAuth";
import { NavbarDefault } from "@/components/Layout/NavbarDefault";
import { FiFileText } from "react-icons/fi";
import { GrProjects } from "react-icons/gr";
import useConfigGroups from "@/hooks/useConfigGroups";
import useMembers from "@/hooks/useMembers";
import { useRouter } from "next/navigation";

const baseRoute = "/financeiro";

const DataContext = createContext();

function UserLayout({ children, emails, members }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const sections = [
    {
      label: "Financeiro",
      items: [
        {
          label: "Warmup",
          icon: FiFileText,
          link: `${baseRoute}/warmup`,
        },
        {
          label: "Projetos",
          icon: GrProjects,
          link: `${baseRoute}/projetos`,
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
          <div className="flex-1 min-h-0 p-4">
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
