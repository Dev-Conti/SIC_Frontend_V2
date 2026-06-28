import { Input } from "@material-tailwind/react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function InputSelect({
  label,
  placeholder = "Escolha...",
  name,
  value = "",
  onChange,
  options = [],
  optionLabel = (option) => option,
  optionValue = (option) => option,
  required = true,
}) {
  const [selectedValue, setSelectedValue] = useState(value || "");
  const [selectedLabel, setSelectedLabel] = useState(""); // Novo estado para armazenar a label selecionada
  const [showOptions, setShowOptions] = useState(false);
  const [interacted, setInteracted] = useState(false); // Marca interação com o componente
  const ref = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (value) {
      setSelectedValue(value);
      const selectedOption = options.find(option => optionValue(option) === value);
      setSelectedLabel(selectedOption ? optionLabel(selectedOption) : "");
    }
  }, [value, options, optionLabel, optionValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        (!menuRef.current || !menuRef.current.contains(event.target))
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

  const toggleOptions = () => {
    setShowOptions((prev) => !prev);
    setInteracted(true); // Marca como interagido quando a lista é aberta
  };

  const handleOptionClick = (option) => {
    const value = optionValue(option);
    const label = optionLabel(option);
    setSelectedValue(value);
    setSelectedLabel(label); // Define a label selecionada
    setInteracted(true); // Marca como interagido ao selecionar uma opção
    setShowOptions(false);
    if (onChange) {
      onChange({ target: { value, name } });
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedValue("");
    setSelectedLabel(""); // Limpa a label selecionada
    setInteracted(true); // Marca como interagido ao limpar a seleção
    if (onChange) {
      onChange({ target: { value: "", name } });
    }
  };

  const calculateMenuPosition = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      return {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      };
    }
    return { top: 0, left: 0, width: "auto" };
  };

  return (
    <div className="w-full relative" ref={ref}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {/* Campo oculto para validação nativa */}
      <input
        type="hidden"
        name={name}
        value={selectedValue}
        required={required}
      />
      <div
        className={`relative`}
        onClick={toggleOptions}
      >
        <Input
          className={`!border ${
            !selectedValue && interacted && required ? "!border-red-500" : "!border-gray-300"
          } bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent 
          placeholder:text-gray-500 placeholder:opacity-100 
          focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10`}
          placeholder={selectedLabel || placeholder} // Mostra a label selecionada
          readOnly
          labelProps={{
            className: "hidden",
          }}
        />
        {selectedValue && (
          <button
            type="button"
            className="absolute top-2 right-3 text-gray-400 hover:text-gray-700"
            onClick={handleClear}
          >
            ✕
          </button>
        )}
      </div>
      {showOptions &&
        createPortal(
          <ul
            ref={menuRef}
            className="absolute bg-white border border-gray-300 rounded-md shadow-lg z-[9999] max-h-48 overflow-y-auto"
            style={calculateMenuPosition()}
          >
            {options.map((option, index) => (
              <li
                key={index}
                className="px-4 py-2 text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleOptionClick(option)}
              >
                {typeof option === 'object' ? optionLabel(option) : option}
              </li>
            ))}
          </ul>,
          document.body
        )}
      {!selectedValue && interacted && required && (
        <p className="text-red-500 text-xs mt-1">Este campo é obrigatório.</p>
      )}
    </div>
  );
}