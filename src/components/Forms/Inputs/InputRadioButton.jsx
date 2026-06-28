import { useState, useEffect } from "react";

export default function InputRadioButton({
  label = "Escolha uma opção",
  name,
  options = [],
  value = "",
  onChange,
  required = false,
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
      onChange({ target: { name, value: newValue } });
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-4">
        {options.map((option, index) => (
          <label key={index} className="flex items-center gap-2">
            <input
              type="radio"
              name={name}
              value={option}
              checked={localValue === option}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              {...props}
            />
            <span className="text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
