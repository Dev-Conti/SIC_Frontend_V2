"use client";

import Sidebar from "@/components/Layout/Sidebar";
import { useState } from "react";
import withAuth from "@/hoc/withAuth";
import { NavbarDefault } from "@/components/Layout/NavbarDefault";
import {
  FiHome,
  FiSettings,
  FiFileText,
  FiFolder,
  FiBarChart2,
} from "react-icons/fi";
import { GrTestDesktop } from "react-icons/gr";
import useConfigGroups from "@/hooks/useConfigGroups";
import useMembers from "@/hooks/useMembers";

const baseRoute = "/admin";

function UserLayout({ children, emails }) {
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
          link: `${baseRoute}/#`,
        },
      ],
    },
    {
      label: "Vendas",
      items: [
        {
          label: "Propostas",
          icon: FiFolder,
          subItems: [
            { label: "Formação de preço", link: `${baseRoute}/propostas/formacao-preco` },
            { label: "Orçamento Simples", link: `#` },
            { label: "Proposta Comercial", link: `#` },
          ],
        },
        {
          label: "Ganhos",
          icon: FiBarChart2,
          link: `${baseRoute}/ganhos`,
        },
        {
          label: "Warmup",
          icon: FiFileText,
          link: `${baseRoute}/warmup`,
        },
      ],
    },
    {
      label: "Configurações",
      items: [
        {
          label: "Ajustes",
          icon: FiSettings,
          link: `#`,
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

const withEmails = (Component) => (props) => {
  const config = useConfigGroups(baseRoute);
  const { emails, loading, error } = useMembers(config.group_id, config.channel_id);

  if (loading) {
    return <p>Verificando Permissões...</p>;
  }

  if (error) {
    return <p>Erro ao carregar emails: {error.message}</p>;
  }

  return <Component {...props} emails={emails} />;
};

export default withEmails(withAuth(UserLayout));
