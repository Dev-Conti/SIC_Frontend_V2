"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ColaboradoresTabela from "@/components/Tabelas/ColaboradoresTabela";
import withAuth from "@/hoc/withAuth"; // Ajuste o caminho conforme necessário

function ColaboradoresPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const successMessage = searchParams.get('successMessage');

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage); // Exibe a mensagem de sucesso como um toast
    }
  }, [successMessage]);

  return (
    <div>
      <ColaboradoresTabela />
      <ToastContainer />
    </div>
  );
}

export default withAuth(ColaboradoresPage);
