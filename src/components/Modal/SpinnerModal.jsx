import React from 'react';
import { Typography } from "@material-tailwind/react";
import { Spinner } from "@material-tailwind/react";

const SpinnerModal = ({ open }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-50 z-50">
      <div className="flex flex-col items-center justify-center">
        <Spinner className="h-12 w-12 mb-4 text-gray-300" color="blue" />
        <Typography variant="small" className="text-gray-300">
          Carregando...
        </Typography>
      </div>
    </div>
  );
};

export default SpinnerModal;
