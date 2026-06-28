import { Input } from "@material-tailwind/react";
import { useState, useEffect } from "react";

export default function InputNumeroFixo({
  label = "Número",
  placeholder = "Digite um número...",
  name,
  value = "",
  onChange,
  decimals = 2, // Quantidade de casas decimais permitidas
  required = false,
  ...props
}) {
  const [localValue, setLocalValue] = useState(value || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleChange = (e) => {
    const rawValue = e.target.value;

    // Remove caracteres inválidos (apenas números e ponto são permitidos)
    const numericValue = rawValue.replace(/[^0-9.]/g, "");

    // Verifica se há mais de um ponto no valor
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      setError("Formato inválido");
      return;
    }

    // Limita o número de casas decimais
    const [integerPart, decimalPart] = parts;
    const fixedDecimalValue =
      decimalPart && decimalPart.length > decimals
        ? `${integerPart}.${decimalPart.slice(0, decimals)}`
        : numericValue;

    setLocalValue(fixedDecimalValue);

    // Validação de campo obrigatório
    if (required && !fixedDecimalValue) {
      setError("Este campo é obrigatório.");
    } else {
      setError("");
    }

    // Envia o valor para o `onChange`
    if (onChange) {
      onChange({
        target: {
          name,
          value: parseFloat(fixedDecimalValue) || 0, // Envia como número fixo
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
        type="text"
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
