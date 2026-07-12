import React from "react";
import { AiOutlineCheck } from "react-icons/ai";

const CampoLink = ({
  label,
  name,
  placeholder = "https://example.com",
  obrigatorio = true,
  valor,
  aoAlterado,
  readOnly = false,
  disabled = false,
  display = true,
}) => {
  if (!display) return null;

  const urlPattern =
    "https?://(?:www\\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s]{2,}|www\\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s]{2,}|https?://(?:www\\.|(?!www))[a-zA-Z0-9]+\\.[^\\s]{2,}|www\\.[a-zA-Z0-9]+\\.[^\\s]{2,}";

  const preenchido = valor?.trim() !== "";

  return (
    <div className="mb-4">
      <label className="flex items-center text-sm font-medium text-gray-700">
        {label}
        {obrigatorio && !preenchido && (
          <span className="ml-1 text-red-500">*</span>
        )}
        {preenchido && (
          <AiOutlineCheck className="ml-2 text-green-500" aria-label="Preenchido" />
        )}
      </label>
      <input
        type="url"
        name={name}
        placeholder={placeholder}
        required={obrigatorio}
        value={valor}
        onChange={(e) => aoAlterado(e.target.value)}
        pattern={urlPattern}
        className={`w-full border rounded-md p-2
                    focus:outline-none focus:ring-0 focus:border-gray-500
                    ${preenchido ? "border-gray-500" : "border-gray-300"}
                    ${disabled ? "cursor-not-allowed" : ""}`}
        readOnly={readOnly}
        disabled={disabled}
      />
      <small className="text-gray-500">
        Insira um link válido, começando com "http://" ou "https://".
      </small>
    </div>
  );
};

export default CampoLink;
