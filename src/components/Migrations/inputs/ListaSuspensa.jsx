import React from "react";
import { AiOutlineCheck } from "react-icons/ai";

const ListaSuspensa = ({ label, name, itens, obrigatorio, valor, aoAlterado, readOnly, disabled, display = true }) => {
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
            <select
                name={name}
                required={obrigatorio}
                value={valor}
                onChange={(e) => aoAlterado(e.target.value)}
                className={`w-full border rounded-md p-2
                    focus:outline-none focus:ring-0 focus:border-gray-500
                    ${preenchido ? "border-gray-500" : "border-gray-300"}
                    ${disabled ? "cursor-not-allowed" : ""}`}
                readOnly={readOnly}
                disabled={disabled}
            >
                <option value="">Selecione</option>
                {itens.map((item, index) =>
                    typeof item === "object" ? (
                        <option key={index} value={item.value}>
                            {item.label}
                        </option>
                    ) : (
                        <option key={index} value={item}>
                            {item}
                        </option>
                    )
                )}
            </select>
        </div>
    );
};

export default ListaSuspensa;
