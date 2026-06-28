import { Input } from "@material-tailwind/react";
import { useState, useEffect } from "react";

export default function InputPercentual({
  label = "Percentual",
  placeholder = "Digite o percentual...",
  name,
  value = "",
  onChange,
  required = false,
  decimals = 2, // Quantidade de casas decimais
  ...props
}) {
  const [localValue, setLocalValue] = useState(value || "");
  const [error, setError] = useState("");

  // Formata o valor como percentual
  const formatToPercentage = (value) => {
    if (!value) return "";
    const numericValue = value.replace(/[^\d]/g, ""); // Remove caracteres não numéricos
    return (Number(numericValue) / 100).toFixed(decimals) + "%"; // Divide por 100 e adiciona o símbolo de percentual
  };

  // Retorna o valor em decimal para o payload
  const toDecimal = (value) => {
    if (!value) return 0;
    const numericValue = value.replace(/[^\d]/g, ""); // Remove caracteres não numéricos
    return (Number(numericValue) / 100).toFixed(decimals);
  };

  useEffect(() => {
    if (value) {
      setLocalValue(formatToPercentage(value));
    }
  }, [value]);

  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/%/g, ""); // Remove o símbolo de percentual para edição

    // Atualiza o estado local sem formatar
    setLocalValue(rawValue);

    // Validação de campo obrigatório
    if (required && !rawValue) {
      setError("Este campo é obrigatório.");
    } else {
      setError("");
    }

    // Envia o valor decimal no formato correto ao `onChange`
    if (onChange) {
      onChange({
        target: {
          name,
          value: toDecimal(rawValue), // Valor decimal
        },
      });
    }
  };

  const handleBlur = () => {
    // Formata o valor com o símbolo de `%` ao perder o foco
    if (localValue) {
      setLocalValue(formatToPercentage(localValue));
    }
  };

  const handleFocus = () => {
    // Remove o símbolo de `%` ao focar para facilitar a edição
    if (localValue) {
      setLocalValue(localValue.replace("%", ""));
    }
  };

  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Input
        className={`!border ${error ? "!border-red-500" : "!border-gray-300"} 
          bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent 
          placeholder:text-gray-500 placeholder:opacity-100 
          focus:!border-gray-900 focus:ring-gray-900/10`}
        placeholder={placeholder}
        value={localValue}
        name={name}
        onChange={handleChange}
        onBlur={handleBlur} // Adiciona o símbolo de "%" ao perder o foco
        onFocus={handleFocus} // Remove o símbolo de "%" ao focar
        labelProps={{
            className: "hidden",
          }}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
