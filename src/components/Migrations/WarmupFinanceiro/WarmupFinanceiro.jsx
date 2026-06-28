import { useState, useEffect } from 'react';
import { FaEllipsisH } from 'react-icons/fa';
import ModalNegociacao from '../ModalDetalhesWarmup/ModalDetalhesWarmup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../Auth/AuthContext/AuthContext";

const WarmupFinanceiro = () => {
    const { userData } = useAuth();
    const [dadosWarmup, setDadosWarmup] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [negociacaoSelecionada, setNegociacaoSelecionada] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const navigate = useNavigate();

    const [showVoltarModal, setShowVoltarModal] = useState(false);
    const [observacaoVoltar, setObservacaoVoltar] = useState("");
    const [currentItemVoltar, setCurrentItemVoltar] = useState(null);
    const [etapaVoltar, setEtapaVoltar] = useState("Comercial");

    const API_URL = process.env.REACT_APP_API_URL || 'https://sic-conti-backend.vercel.app';

    async function listarWarmup() {
        try {
            const response = await fetch(`${API_URL}/api/listar_warmup?etapa=Warmup Financeiro`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erro: ${response.status}`);
            }

            const data = await response.json();
            setDadosWarmup(data.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        listarWarmup();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.menu-dropdown')) {
                setActiveMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const abrirModal = (negociacao) => {
        setNegociacaoSelecionada(negociacao);
        setActiveMenu(null); // Fecha o menu ao abrir o modal
    };

    const fecharModal = () => {
        setNegociacaoSelecionada(null);
    };

    const toggleMenu = (id) => {
        setActiveMenu(activeMenu === id ? null : id);
    };

    const handleAvancarEtapa = (item) => {
        setCurrentItem(item);
        setShowConfirmModal(true);
        setActiveMenu(null);
    };

    const confirmarAvancarEtapa = async () => {
        try {
            const response = await fetch(`${API_URL}/api/warmup/alterar_etapa/${currentItem._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    etapa: 'Projeto Liberado',
                    status: 'Liberado'
                }),
            });

            if (!response.ok) {
                throw new Error(`Erro ao atualizar etapa: ${response.statusText}`);
            }

            listarWarmup();
            alert('Etapa atualizada com sucesso!');
        } catch (error) {
            alert(`Erro ao atualizar etapa: ${error.message}`);
        } finally {
            setShowConfirmModal(false);
            setCurrentItem(null);
        }
    };

    const enviarEmailNotificacaoGerente = async (item) => {
        const warmupUrl = `${window.location.origin}/projetos/warmup`;
        const gerenteEmail = item?.capa_projeto?.gerente_projeto?.email;

        if (!gerenteEmail) {
            console.error("Email do gerente não encontrado.");
            return;
        }

        const emailBody = `
            <p>Olá,</p>
            <p>Há um formulário pendente de correção no warmup de serviços.</p>
            <p>Por favor, verifique os comentários e faça as correções necessárias.</p>
            <p>O formulário do Warmup está disponível para acompanhamento no Portal do SIC.</p>
            <p>Ou <a href="${warmupUrl}" target="_blank">Clique aqui para acessar os formulários</a></p>
            <p>Atenciosamente,<br>Equipe ConTI Consultoria</p>
        `;

        try {
            const emailResponse = await fetch(`${API_URL}/api/enviar-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sender_email: "warmup@conticonsultoria.com.br",
                    recipient_email: gerenteEmail,
                    subject: `Formulário pendente de correção no Warmup Financeiro`,
                    body_content: emailBody,
                }),
            });

            if (!emailResponse.ok) {
                const errorText = await emailResponse.text();
                throw new Error(`Erro ao enviar email: ${emailResponse.status} - ${errorText}`);
            }
            console.log("Email enviado com sucesso!");
        } catch (err) {
            console.error("Erro ao enviar email:", err.message);
        }
    };

    const enviarEmailNotificacaoComercial = async (item) => {
        const warmupUrl = `${window.location.origin}/comercial/warmup`;
        const comercialEmail = item?.responsaveis?.responsavel_comercial?.email;

        if (!comercialEmail) {
            console.error("Email do REsponsável do COmercial não encontrado.");
            return;
        }

        const emailBody = `
            <p>Olá,</p>
            <p>Há um formulário pendente de correção no Warmup Comercial.</p>
            <p>Por favor, verifique os comentários e faça as correções necessárias.</p>
            <p>O formulário do Warmup está disponível para acompanhamento no Portal do SIC.</p>
            <p>Ou <a href="${warmupUrl}" target="_blank">Clique aqui para acessar os formulários</a></p>
            <p>Atenciosamente,<br>Equipe ConTI Consultoria</p>
        `;

        try {
            const emailResponse = await fetch(`${API_URL}/api/enviar-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sender_email: "warmup@conticonsultoria.com.br",
                    recipient_email: comercialEmail,
                    subject: `Formulário pendente de correção no Warmup Comercial`,
                    body_content: emailBody,
                }),
            });

            if (!emailResponse.ok) {
                const errorText = await emailResponse.text();
                throw new Error(`Erro ao enviar email: ${emailResponse.status} - ${errorText}`);
            }
            console.log("Email enviado com sucesso!");
        } catch (err) {
            console.error("Erro ao enviar email:", err.message);
        }
    };

    const handleVoltarEtapa = (item) => {
        setCurrentItemVoltar(item);
        setShowVoltarModal(true);
        setActiveMenu(null); // Fecha o menu ao abrir o modal
    };

    const confirmarVoltarEtapa = async () => {
        try {
            const usuario = userData?.user?.displayName || "Usuário Anônimo"; // Obtém o nome do usuário

            if (etapaVoltar === "Serviços") {
                const response = await fetch(`${API_URL}/api/warmup/alterar_etapa/${currentItemVoltar._id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        etapa: "Warmup Projetos", // Usa a etapa selecionada
                        status: "Revisar",
                        data: new Date().toLocaleString("pt-BR"),
                        observacao: observacaoVoltar,
                        usuario: usuario, // Envia o nome do usuário logado
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Erro ao atualizar etapa: ${response.statusText}`);
                }

                listarWarmup();
                alert('Etapa atualizada com sucesso!');
                await enviarEmailNotificacaoGerente(currentItemVoltar); // Envia email após a confirmação
            } else if (etapaVoltar === "Comercial") {
                const response = await fetch(`${API_URL}/api/warmup/alterar_etapa/${currentItemVoltar._id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        etapa: "Warmup Comercial", // Usa a etapa selecionada
                        status: "Revisar",
                        data: new Date().toLocaleString("pt-BR"),
                        observacao: observacaoVoltar,
                        usuario: usuario, // Envia o nome do usuário logado
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Erro ao atualizar etapa: ${response.statusText}`);
                }

                listarWarmup();
                alert('Etapa atualizada com sucesso!');
                await enviarEmailNotificacaoComercial(currentItemVoltar); // Envia email após a confirmação

            }
        } catch (error) {
            alert(`Erro ao atualizar etapa: ${error.message}`);
        } finally {
            setShowVoltarModal(false);
            setCurrentItemVoltar(null);
            setObservacaoVoltar("");
            setEtapaVoltar("Comercial"); // Reseta a etapa selecionada
        }
    };

    const redirecionarFormulario = (id) => {
        navigate(`/forms-warmup-financeiro/${id}`);
        setActiveMenu(null);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray bg-opacity-10 z-50">
                <div className="text-center">
                    <h2 className="text-lg font-medium text-gray-700">Carregando dados, por favor aguarde...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <h2 className="text-xl font-semibold text-red-500">Erro ao carregar os dados: {error}</h2>
            </div>
        );
    }

    return (
        <div className="flex flex-col p-4 min-h-screen w-full px-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Processos de Warm-up</h1>

            {loading && <p className="text-sm font-medium text-gray-600">Carregando...</p>}
            {error && <p className="text-sm font-medium text-red-500">Erro: {error}</p>}
            {!loading && !error && dadosWarmup.length === 0 && (
                <p className="text-sm font-medium text-gray-600">Nenhum processo em andamento.</p>
            )}

            {!loading && !error && dadosWarmup.length > 0 && (
                <div className="max-w bg-white rounded-lg shadow-md">
                    <table className="table-auto w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-2 py-1 font-semibold text-gray-600">Gerente do Projeto</th>
                                <th className="px-2 py-1 font-semibold text-gray-600">Código do Projeto</th>
                                <th className="px-2 py-1 font-semibold text-gray-600">Centro de Resultados</th>
                                <th className="px-2 py-1 font-semibold text-gray-600">Valor</th>
                                <th className="px-2 py-1 font-semibold text-gray-600">Status</th>
                                <th className="px-2 py-1 font-semibold text-gray-600">Etapa</th>
                                <th className="px-2 py-1 text-center font-semibold text-gray-600">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dadosWarmup.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50">
                                    <td className="px-2 py-1 text-gray-700">{item?.capa_projeto?.gerente_projeto?.nome || "N/A"}</td>
                                    <td className="px-2 py-1 text-gray-700">{item?.capa_projeto?.codigo || ""}</td>
                                    <td className="px-2 py-1 text-gray-700">{item?.capa_projeto?.centro_resultado?.NOME || "N/A"}</td>
                                    <td className="px-2 py-1 text-gray-700">
                                        {new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                        }).format(item?.formacao_preco?.valor || "")}
                                    </td>
                                    <td className="px-2 py-1">
                                        <span
                                            className={`font-semibold ${(() => {
                                                switch (item.status) {
                                                    case "Revisar":
                                                        return "text-amber-500";
                                                    case "Preenchendo":
                                                        return "text-blue-400";
                                                    case "Liberado":
                                                        return "text-green-400";
                                                    default:
                                                        return "text-gray-700";
                                                }
                                            })()}`}
                                        >
                                            {item.status || "N/A"}
                                        </span>
                                    </td>
                                    <td className="px-2 py-1 text-gray-700">{item.etapa}</td>
                                    <td className="px-2 py-1 relative text-center">
                                        <button
                                            onClick={() => toggleMenu(item._id)}
                                            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition"
                                        >
                                            <FaEllipsisH />
                                        </button>
                                        {activeMenu === item._id && (
                                            <div className="menu-dropdown absolute z-10 right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded transition-transform duration-150 transform text-center">
                                                <button
                                                    onClick={() => abrirModal(item)}
                                                    className="text-gray-700 px-4 py-2 hover:bg-gray-100 w-full text-center"
                                                >
                                                    Ver Detalhes
                                                </button>
                                                <button
                                                    onClick={() => handleAvancarEtapa(item)}
                                                    className="text-green-700 px-4 py-2 hover:bg-green-100 w-full text-center"
                                                >
                                                    Finalizar Warmup
                                                </button>
                                                <button
                                                    onClick={() => handleVoltarEtapa(item)}
                                                    className="text-amber-500 px-4 py-2 hover:bg-amber-50 w-full text-center"
                                                >
                                                    Voltar Etapa
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ModalNegociacao negociacao={negociacaoSelecionada} onClose={fecharModal} />

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Confirmar Avançar Etapa</h2>
                        <p className="mb-6">Tem certeza de que deseja avançar a etapa para "Projeto em Liberado"?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded shadow hover:bg-gray-400 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarAvancarEtapa}
                                className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showVoltarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
                    <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
                        <h2 className="text-lg font-semibold mb-4">Voltar Etapa</h2>
                        <label className="block mb-2 font-medium text-gray-700">Destino :</label>
                        <select
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none mb-4"
                            value={etapaVoltar}
                            onChange={(e) => setEtapaVoltar(e.target.value)}
                        >
                            <option value="Comercial">Comercial</option>
                            <option value="Serviços">Serviços</option>
                        </select>
                        <textarea
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none mb-4"
                            rows="4"
                            placeholder="Adicione uma observação antes de voltar a etapa..."
                            value={observacaoVoltar}
                            onChange={(e) => setObservacaoVoltar(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowVoltarModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded shadow hover:bg-gray-400 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarVoltarEtapa}
                                disabled={!observacaoVoltar.trim()} // Desabilita se o campo estiver vazio
                                className={`px-4 py-2 rounded shadow text-white transition ${observacaoVoltar.trim()
                                        ? 'bg-blue-500 hover:bg-blue-600'
                                        : 'bg-gray-300 cursor-not-allowed'
                                    }`}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default WarmupFinanceiro;