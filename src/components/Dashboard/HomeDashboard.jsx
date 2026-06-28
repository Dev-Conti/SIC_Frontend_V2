"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import BarChart from "@/components/Charts/BarChart";
import LineChart from "@/components/Charts/LineChart";
import LineChart2 from "@/components/Charts/LineChart2";
import PieChart from "@/components/Charts/PieChart";
import { BreadcrumbsDefault } from "../Breadcrumbs/BreadcrumbsDefault";

export default function HomeDashboard() {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const breadcrumbItems = [
    { name: "Home", path: "/user" },
  ];

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push("/"); // Redireciona para login se não estiver autenticado
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <p>Carregando...</p>; // Exibe uma mensagem de carregamento enquanto aguarda o estado de autenticação
  }

  return (

    <div className=" FLEX  justify-center itens-center w-8/10">
      <div className="flex flex-col gap-10 m-5">
        <BreadcrumbsDefault items={breadcrumbItems} />
        <BarChart />
        <div className="flex gap-10">
          <div className="w-full">
            <LineChart />
          </div>
          <div className="w-full">
            <LineChart />
          </div>
        </div>
      </div>
      <LineChart2 />
      <div className="h-10"></div>
    </div>
  );
}