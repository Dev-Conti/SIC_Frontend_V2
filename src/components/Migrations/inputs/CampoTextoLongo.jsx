import React from "react";
import { AiOutlineCheck } from "react-icons/ai";

const CampoTextoLongo = ({
    label,
    name,
    placeholder,
    valor,
    aoAlterado,
    readOnly,
    disabled,
    display = true,
    obrigatorio = true
}) => {
    if (!display) return null;

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
            <textarea
                name={name}
                placeholder={placeholder}
                value={valor}
                onChange={(e) => aoAlterado(e.target.value)}
                required={obrigatorio}
                className={`w-full border rounded-md p-2
                    focus:outline-none focus:ring-0 focus:border-gray-500
                    ${preenchido ? "border-gray-500" : "border-gray-300"}
                    ${disabled ? "cursor-not-allowed" : ""}`}
                readOnly={readOnly}
                disabled={disabled}
            />
        </div>
    );
};

export default CampoTextoLongo;
