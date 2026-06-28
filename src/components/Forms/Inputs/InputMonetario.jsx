import { Input } from "@material-tailwind/react";
import { useState, useEffect } from "react";

export default function InputMonetario({
  label = "Valor",
  placeholder = "Digite o valor...",
  name,
  value = "",
  onChange,
  required = false,
  ...props
}) {
  const [localValue, setLocalValue] = useState(value || "");
  const [error, setError] = useState("");

  // Formata o valor em real
  const formatToCurrency = (value) => {
    if (!value) return "";
    const numericValue = value.replace(/[^\d]/g, ""); // Remove caracteres não numéricos
    const formattedValue = (Number(numericValue) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return formattedValue;
  };

  // Retorna o valor em decimal para o payload
  const toDecimal = (value) => {
    if (!value) return 0;
    const numericValue = value.replace(/[^\d]/g, ""); // Remove caracteres não numéricos
    return (Number(numericValue) / 100).toFixed(2);
  };

  useEffect(() => {
    if (value) {
      setLocalValue(formatToCurrency(value));
    }
  }, [value]);

  const handleChange = (e) => {
    const rawValue = e.target.value;

    // Atualiza o estado local com o valor formatado
    const formattedValue = formatToCurrency(rawValue);
    setLocalValue(formattedValue);

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

  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Input
        className={`!border ${error ? "!border-red-500" : "!border-gray-300"} 
          bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent 
          placeholder:text-gray-500 placeholder:opacity-100 
          focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10`}
        placeholder={placeholder}
        value={localValue}
        name={name}
        onChange={handleChange}
        labelProps={{
          className: "hidden",
        }}
        containerProps={{ className: "min-w-[100px]" }}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
