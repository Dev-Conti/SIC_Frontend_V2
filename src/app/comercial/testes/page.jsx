"use client";
import WarmupForms from "@/components/Forms/WarmupForms/WarmupForms";
import React, { useEffect, useState } from "react";

const ChildComponent = () => {
  const negociacaoId = "67505c6ee9a467001db31094";

  return (
    <div className="flex justify-center h-full p-4">
      <WarmupForms negocio_id={negociacaoId}/>
    </div>
  );
};

export default ChildComponent;