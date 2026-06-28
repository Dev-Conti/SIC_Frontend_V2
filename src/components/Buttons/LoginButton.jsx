"use client";

import { Button } from "@material-tailwind/react";
import { AiOutlineWindows } from "react-icons/ai"; // Ícone do Windows (Microsoft)
import { useAuth } from "@/context/AuthContext";

export default function LoginButton() {
  const handleLogin = () => {
    // Redireciona para a rota de login do backend
    const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL || "https://api.conticonsultoria.cloud/";
    console.log("Base API URL:", baseUrl);
    window.location.href = `${baseUrl}/auth/login`;
  };

  return (
    <Button
      onClick={handleLogin}
      variant="gradient"
      size="lg"
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
    >
      <AiOutlineWindows size={24} />
      Entrar com Microsoft
    </Button>
  );
}
