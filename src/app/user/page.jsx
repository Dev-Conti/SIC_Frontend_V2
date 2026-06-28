'use client';

import Head from "next/head";
import UserLayout from "./layout";
import withAuth from "@/hoc/withAuth";
import routePermissions from "@/data/routePermissions";
import { useAuth } from "@/context/AuthContext";

function Home() {
  const { user } = useAuth();
  return (
    <UserLayout>
      <Head>
        <title>Home</title>
      </Head>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">
          Bem-vindo, {user.displayName}, ao sistema de gestão do RH ConTI Consultoria!
        </h1>
        {/* Adicione mais conteúdo ou componentes aqui */}
      </div>
    </UserLayout>
  );
}

export default withAuth(Home, routePermissions);