import { Input } from "@material-tailwind/react";
import { useState, useEffect } from "react";

export default function InputAnexo({
  labelNome = "Nome do Documento",
  labelLink = "Link",
  placeholderNome = "Digite o nome do documento...",
  placeholderLink = "Digite o link...",
  nomeValue = "",
  linkValue = "",
  onNomeChange,
  onLinkChange,
  required = false,
  onOutrosAnexosChange,
  ...props
}) {
  const [localNome, setLocalNome] = useState(nomeValue || "");
  const [localLink, setLocalLink] = useState(linkValue || "");
  const [errorNome, setErrorNome] = useState("");
  const [errorLink, setErrorLink] = useState("");

  useEffect(() => {
    setLocalNome(nomeValue || "");
  }, [nomeValue]);

  useEffect(() => {
    setLocalLink(linkValue || "");
  }, [linkValue]);

  const handleNomeChange = (e) => {
    const newValue = e.target.value;
    setLocalNome(newValue);

    if (required && !newValue) {
      setErrorNome("Este campo é obrigatório.");
    } else {
      setErrorNome("");
    }

    if (onNomeChange) {
      onNomeChange(e);
    }

    if (onOutrosAnexosChange) {
      onOutrosAnexosChange({ nome: newValue, link: localLink });
    }
  };

  const handleLinkChange = (e) => {
    const newValue = e.target.value;
    setLocalLink(newValue);

    if (required && !newValue) {
      setErrorLink("Este campo é obrigatório.");
    } else {
      setErrorLink("");
    }

    if (onLinkChange) {
      onLinkChange(e);
    }

    if (onOutrosAnexosChange) {
      onOutrosAnexosChange({ nome: localNome, link: newValue });
    }
  };

  return (
    <div className="w-full flex space-x-4">
      <div className="flex-1">
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
          {labelNome} {required && <span className="text-red-500">*</span>}
        </label>
        <Input
          className={`!border ${errorNome ? "!border-red-500" : "!border-gray-300"} 
            bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent 
            placeholder:text-gray-500 placeholder:opacity-100 
            focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10`}
          placeholder={placeholderNome}
          value={localNome}
          name="nome"
          onChange={handleNomeChange}
          labelProps={{
            className: "hidden",
          }}
          containerProps={{ className: "min-w-[100px]" }}
          {...props}
        />
        {errorNome && <p className="text-red-500 text-xs mt-1">{errorNome}</p>}
      </div>
      <div className="flex-1">
        <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
          {labelLink} {required && <span className="text-red-500">*</span>}
        </label>
        <Input
          className={`!border ${errorLink ? "!border-red-500" : "!border-gray-300"} 
            bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent 
            placeholder:text-gray-500 placeholder:opacity-100 
            focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10`}
          placeholder={placeholderLink}
          value={localLink}
          name="link"
          onChange={handleLinkChange}
          labelProps={{
            className: "hidden",
          }}
          containerProps={{ className: "min-w-[100px]" }}
          {...props}
        />
        {errorLink && <p className="text-red-500 text-xs mt-1">{errorLink}</p>}
      </div>
    </div>
  );
}