import React from "react";
import { Button, Typography } from "@material-tailwind/react";

const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg w-1/3">
        <Typography variant="h5">Confirmar Ação</Typography>
        <Typography variant="body2" className="py-4 mt-2">
          {message}
        </Typography>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="text" onClick={onCancel}>Cancelar</Button>
          <Button variant="filled" color="red" onClick={onConfirm}>Confirmar</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
