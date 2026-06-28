import { Input } from "@material-tailwind/react";
import { useState, useEffect } from "react";

export default function InputWhispering({
  label = "Texto",
  placeholder = "Digite aqui...",
  name,
  value = "",
  onChange,
  suggestions = [], // Lista de sugestões
  dictionary = {}, // Dicionário de sugestões
  required = false,
  ...props
}) {
  const [inputValue, setInputValue] = useState(value); // Local state for input value
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // Para navegação com teclado
  const [isValid, setIsValid] = useState(false); // Para indicar validade do campo
  const [selectedGroupId, setSelectedGroupId] = useState(null); // Store selected group ID

  useEffect(() => {
    validateInput(inputValue);
  }, [inputValue]);

  const validateInput = (newValue) => {
    const isSuggestionValid = suggestions.includes(newValue);
    setIsValid(isSuggestionValid);

    if (required && !newValue) {
      setError("Este campo é obrigatório.");
    } else {
      setError("");
    }

    if (newValue && !isSuggestionValid && filteredSuggestions.length === 0) {
      setWarning("A opção não existe.");
    } else {
      setWarning("");
    }

    if (!newValue) {
      setSelectedGroupId(null); // Clear selection if input is empty
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue); // Update local state

    const newSuggestions = suggestions.filter((s) =>
      s.toLowerCase().includes(newValue.toLowerCase())
    );
    setFilteredSuggestions(newSuggestions);
    setShowSuggestions(true);
    setHighlightedIndex(-1);

    validateInput(newValue);

    if (onChange) {
      onChange(e); // Chama o onChange externo diretamente
    }
  };

  const handleFocus = () => {
    setFilteredSuggestions(suggestions);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion); // Update local state with selected suggestion
    if (onChange) {
      onChange({ target: { value: suggestion, name } });
    }
    setSelectedGroupId(dictionary[suggestion] || null);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
    setWarning("");
    setIsValid(true);
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      const suggestion = filteredSuggestions[highlightedIndex];
      handleSuggestionClick(suggestion);
    }
  };

  return (
    <div className="w-full relative">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"
      >
        {label}
        {required && !isValid ? (
          <span className="text-red-500">*</span>
        ) : (
          isValid && <span className="text-green-500">✔</span>
        )}
      </label>
      <Input
        className={`!border ${error ? "!border-red-500" : "!border-gray-300"} 
          bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent 
          placeholder:text-gray-500 placeholder:opacity-100 
          focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10`}
        placeholder={placeholder}
        value={inputValue} // Use local state for input value
        name={name}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        labelProps={{
          className: "hidden",
        }}
        containerProps={{ className: "min-w-[100px]" }}
        {...props}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-1 w-full max-h-48 overflow-y-auto custom-scrollbar">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              className={`px-4 py-2 text-gray-700 cursor-pointer hover:bg-gray-100 ${
                highlightedIndex === index ? "bg-gray-200" : ""
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      {selectedGroupId && (
        <p className="text-gray-700 text-xs mt-1">ID do Grupo: {selectedGroupId}</p>
      )}
      {warning && <p className="text-orange-500 text-xs mt-1">{warning}</p>}
      {error && !isValid && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
