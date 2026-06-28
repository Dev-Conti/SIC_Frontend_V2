"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RedirectPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [hasLoggedIn, setHasLoggedIn] = useState(false); // Estado de controle

  useEffect(() => {
    if (hasLoggedIn) return; // Evita chamar login mais de uma vez

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token"); // Token da API interna

    if (token) {
      login(token); // Chama a função login com o token — o redirect é feito pelo AuthContext
      setHasLoggedIn(true); // Marca como logado para evitar reexecução
    } else {
      router.replace("/login");
    }
  }, [hasLoggedIn, login, router]);

  return <p>Redirecionando...</p>;
}