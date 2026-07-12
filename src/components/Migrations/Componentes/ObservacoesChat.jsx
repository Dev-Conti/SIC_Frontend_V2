import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const ObservacoesChat = ({ observacoes = [], aoAdicionarObservacao, aoRemoverObservacao }) => {
    const [novaObservacao, setNovaObservacao] = useState("");
    const { user } = useAuth();

    const handleAdicionar = () => {
        if (!novaObservacao.trim()) return;

        aoAdicionarObservacao({
            usuario: user?.displayName || "Usuário Anônimo",
            data: new Date().toLocaleString("pt-BR"),
            texto: novaObservacao,
            novo: true,
        });

        setNovaObservacao("");
    };

    return (
        <div>
            <div className="space-y-4 mb-4">
                {observacoes.map((obs, index) => (
                    <div
                        key={index}
                        className="bg-gray-100 p-4 rounded shadow flex justify-between items-center"
                    >
                        <div>
                            <p className="text-sm text-gray-600">
                                <strong>{obs.usuario}</strong> - {obs.data}
                            </p>
                            <p className="whitespace-pre-line">{obs.texto}</p>
                        </div>
                        {obs.novo && (
                            <button
                                type="button"
                                onClick={() => aoRemoverObservacao(index)}
                                className="ml-4 text-red-500 hover:text-red-700 transition"
                            >
                                Remover
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex items-center space-x-2">
                <textarea
                    rows={4}
                    placeholder="Digite sua observação..."
                    value={novaObservacao}
                    onChange={(e) => setNovaObservacao(e.target.value)}
                    className="flex-1 border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
                <button
                    type="button"
                    onClick={handleAdicionar}
                    className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
                >
                    Adicionar
                </button>
            </div>
        </div>
    );
};

export default ObservacoesChat;
