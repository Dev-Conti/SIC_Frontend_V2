import { Input } from "@material-tailwind/react";
import { useState, useEffect } from "react";

export default function InputTexto({
  label = "Texto",
  placeholder = "Digite aqui...",
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

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Validação de campo obrigatório
    if (required && !newValue) {
      setError("Este campo é obrigatório.");
    } else {
      setError("");
    }

    if (onChange) {
      onChange(e);
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
