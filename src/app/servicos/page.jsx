'use client';

import withAuth from "@/hoc/withAuth";
import routePermissions from "@/data/routePermissions";
import { useAuth } from "@/context/AuthContext";

function Home() {
  const { user } = useAuth();
  return (
    <div>
      Serviços
    </div>
  );
}

export default withAuth(Home, routePermissions);