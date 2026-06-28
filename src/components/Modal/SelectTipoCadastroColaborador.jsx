import React, { useState } from "react";
import {
  Button,
  Dialog,
  IconButton,
  Typography,
  DialogBody,
  DialogHeader,
  DialogFooter,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export function SelectTipoCadastroColaborador() {
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("exclusivo");

  const handleOpen = () => setOpen(!open);

  const handleSelectionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleStart = () => {
    if (selectedOption === "exclusivo") {
      window.location.href = "/user/cadastro/colaborador-exclusivo";
    } else if (selectedOption === "express") {
      window.location.href = "/cadastro/parceiro-individual";
    }
  };

  return (
    <>
      <Button onClick={handleOpen} variant="gradient">
        Cadastro
      </Button>
      <Dialog size="sm" open={open} handler={handleOpen} className="p-4">
        <DialogHeader className="relative m-0 block">
          <Typography variant="h4" color="blue-gray">
            Tipo de Colaborador
          </Typography>
          <Typography className="mt-1 font-normal text-gray-600">
            Selecione o tipo de colaborador a ser cadastrado
          </Typography>
          <IconButton
            size="sm"
            variant="text"
            className="!absolute right-3.5 top-3.5"
            onClick={handleOpen}
          >
            <XMarkIcon className="h-4 w-4 stroke-2" />
          </IconButton>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div>
              <input
                type="radio"
                id="exclusivo"
                name="hosting"
                value="exclusivo"
                className="peer hidden"
                required
                onChange={handleSelectionChange}
                checked={selectedOption === "exclusivo"}
              />
              <label
                htmlFor="exclusivo"
                className="block w-full cursor-pointer rounded-lg border border-gray-300 p-4 text-gray-900 ring-1 ring-transparent peer-checked:border-gray-900 peer-checked:ring-gray-900"
              >
                <div className="block">
                  <Typography className="font-semibold">
                    Colaborador Exclusivo
                  </Typography>
                  <Typography className="font-normal text-gray-600">
                    Colaborador Exclusivo Conti.
                  </Typography>
                </div>
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="express"
                name="hosting"
                value="express"
                className="peer hidden"
                required
                onChange={handleSelectionChange}
                checked={selectedOption === "express"}
              />
              <label
                htmlFor="express"
                className="block w-full cursor-pointer rounded-lg border border-gray-300 p-4 text-gray-900 ring-1 ring-transparent peer-checked:border-gray-900 peer-checked:ring-gray-900"
              >
                <div className="block">
                  <Typography className="font-semibold">
                    Parceiro Individual
                  </Typography>
                  <Typography className="font-normal text-gray-600">
                    Parceiro individual Pessoa Física
                  </Typography>
                </div>
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="store"
                name="hosting"
                value="store"
                className="peer hidden"
                required
                onChange={handleSelectionChange}
                checked={selectedOption === "store"}
              />
              <label
                htmlFor="store"
                className="block w-full cursor-pointer rounded-lg border border-gray-300 p-4 text-gray-900 ring-1 ring-transparent peer-checked:border-gray-900 peer-checked:ring-gray-900"
              >
                <div className="block">
                  <Typography className="font-semibold">
                    Parceiro Corporativo
                  </Typography>
                  <Typography className="font-normal text-gray-600">
                    Parceiro Corporativo Pessoa Jurídica
                  </Typography>
                </div>
              </label>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            className="ml-auto"
            onClick={handleStart}
            disabled={selectedOption === "store"}
          >
            Iniciar Cadastro
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
