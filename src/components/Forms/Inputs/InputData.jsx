import { Input } from "@material-tailwind/react";
import { useState, useEffect } from "react";

export default function InputData({
  label = "Selecione a data",
  name,
  value = "",
  onChange,
  required = false,
  ...props
}) {
  const [localValue, setLocalValue] = useState(value);
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
        type="date"
        name={name}
        value={localValue}
        onChange={handleChange}
        className={`!border ${error ? "!border-red-500" : "!border-gray-300"} bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:text-gray-500 placeholder:opacity-100 focus:!border-gray-900 focus:ring-gray-900/10`}
        {...props}
        labelProps={{
          className: "hidden",
        }}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}