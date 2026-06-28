import { Input } from "@material-tailwind/react";
import { useState, useEffect } from "react";

export default function InputCPF({
  label = "CPF",
  placeholder = "Digite seu CPF...",
  name,
  value = "",
  onChange,
  required = false, // Novo parâmetro para obrigatoriedade
  ...props
}) {
  const [localValue, setLocalValue] = useState(value || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const formatCPF = (cpf) => {
    return cpf
      .replace(/\D/g, "") // Remove caracteres não numéricos
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14); // Limita o tamanho ao formato de CPF
  };

  const validateCPF = (cpf) => {
    const cleanCPF = cpf.replace(/\D/g, "");
    if (cleanCPF.length !== 11) return false;
    let sum = 0;
    let remainder;

    // Validação do primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

    sum = 0;

    // Validação do segundo dígito verificador
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

    return true;
  };

  const handleChange = (e) => {
    const formattedCPF = formatCPF(e.target.value);
    setLocalValue(formattedCPF);

    // Validação do CPF e obrigatoriedade
    if (required && !formattedCPF) {
      setError("Este campo é obrigatório.");
    } else if (!validateCPF(formattedCPF) && formattedCPF.length === 14) {
      setError("CPF inválido.");
    } else {
      setError("");
    }

    // Chama a função onChange do pai, se existir
    if (onChange) {
      onChange({
        target: {
          name,
          value: formattedCPF,
        },
      });
    }
  };

  return (
    <div className="w-full">
      <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Input
        className={`!border ${error ? "!border-red-500" : "!border-gray-300"} 
          bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent 
          placeholder:text-gray-500 placeholder:opacity-100 
          focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10`}
        placeholder={placeholder}
        value={localValue}
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
