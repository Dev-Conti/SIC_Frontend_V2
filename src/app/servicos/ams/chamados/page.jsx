import React from "react";
import { ChamadosAmsTable } from "@/components/Tabelas/ChamadosAmsTable";

const AmsPage = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chamados AMS</h1>
      <ChamadosAmsTable />
    </div>
  );
};

export default AmsPage;
