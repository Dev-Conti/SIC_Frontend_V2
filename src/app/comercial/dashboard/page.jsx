"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HomeDashboard from "@/components/Dashboard/HomeDashboard";
import { SpeedDialAdd } from "@/components/SpeedDial/SpeedDialAdd";

export default function DashboardPage() {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push("/"); // Redireciona para login se não estiver autenticado
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <p>Carregando...</p>; // Exibe uma mensagem de carregamento enquanto aguarda o estado de autenticação
  }

  return (
    <div>
      <HomeDashboard />
      <div className="fixed bottom-5 right-5">
        <SpeedDialAdd />
      </div>
    </div>
  );
  
  
}