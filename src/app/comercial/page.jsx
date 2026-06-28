'use client';

import Head from "next/head";
import UserLayout from "./layout";
import withAuth from "@/hoc/withAuth";
import routePermissions from "@/data/routePermissions";
import { useAuth } from "@/context/AuthContext";

function Home() {
  const { user } = useAuth();
  return (
    <div>
      Bem vindo
    </div>
  );
}

export default withAuth(Home, routePermissions);