import { Switch } from "@material-tailwind/react";
import { useState, useEffect } from "react";

export default function InputSwitch({
  label = "Switch",
  name,
  value = false,
  onChange,
  required = false,
  ...props
}) {
  const [localValue, setLocalValue] = useState(value);
  const [error, setError] = useState("");

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.checked;
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
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Switch
        id={name}
        checked={localValue}
        onChange={handleChange}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
