"use client";

import DropdownText from "@/components/Buttons/DropdownText";

export default function Home() {
  return (
    <div className=" FLEX  justify-center itens-center w-9/10">
      <DropdownText
        options={['Comercial', "Serviços", 'Financeiro', 'Admin']}
      />
    </div>
  );
}
