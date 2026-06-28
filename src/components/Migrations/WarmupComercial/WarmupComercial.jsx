import { useState, useEffect } from "react";
import { FaEllipsisH } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ModalDetalhesWarmup from "../ModalDetalhesWarmup/ModalDetalhesWarmup";
import { useAuth } from "../Auth/AuthContext/AuthContext";
import { format, isWeekend, eachDayOfInterval } from "date-fns";

const WarmupComercial = () => {
    const { userData, isLoadingUserData } = useAuth();
    const USER_EMAIL = userData?.user?.email; // Obtém o email do usuário logado
    const USER_NAME = userData?.user?.displayName; // Obtém o nome do usuário logado
    const [dadosWarmup, setDadosWarmup] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [negociacaoSelecionada, setNegociacaoSelecionada] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showLoadingModal, setShowLoadingModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const navigate = useNavigate();

    const [projetoFilter, setProjetoFilter] = useState("");
    const [reponsavelFilter, setreponsavelFilter] = useState("");
    const [etapaFilter, setEtapaFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [filtroResponsavel, setFiltroResponsavel] = useState(true); // Estado do checkbox

    const API_URL = process.env.REACT_APP_API_URL;
    const BASE_URL = process.env.REACT_APP_FRONT_URL;

    const isResponsavel = (item) =>
        item?.responsaveis?.responsavel_comercial?.nome === USER_NAME || USER_NAME === "TI";

    async function listarWarmup() {
        try {
            const response = await fetch(`${API_URL}/api/listar_warmup?etapa=Warmup Comercial`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error(`Erro: ${response.status}`);
            }

            const data = await response.json();
            setDadosWarmup(data.data);
            setFilteredData(data.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const aplicarFiltros = () => {
        let filtered = dadosWarmup;

        // Filtro pelo responsável comercial (checkbox)
        if (filtroResponsavel) {
            filtered = filtered.filter(
                (item) => item?.responsaveis?.responsavel_comercial?.nome === USER_NAME
            );
        }

        setFilteredData(filtered);
    };

    const calcularDiasUteis = (inicio) => {
        console.log("Início do cálculo de dias úteis:", inicio);
        const startDate = new Date(inicio);
        const endDate = new Date();
        console.log("Data de início:", startDate);
        console.log("Data de fim:", endDate);
        const allDays = eachDayOfInterval({ start: startDate, end: endDate });
        console.log("Todos os dias no intervalo:", allDays);
        const businessDays = allDays.filter(day => !isWeekend(day));
        console.log("Dias úteis no intervalo:", businessDays);
        return businessDays.length;
    };

    const redirecionarFormulario = (id) => {
        navigate(`/forms-warmup-comercial/${id}`);
        setActiveMenu(null);
    };

    const handleAvancarEtapa = (item) => {
        setCurrentItem(item);
        setShowConfirmModal(true);
        setActiveMenu(null);
    };

    const confirmarAvancarEtapa = async () => {
        setShowConfirmModal(false);
        setShowLoadingModal(true);

        try {
            const url = `${API_URL}/api/warmup/alterar_etapa/${currentItem._id}`;
            let payload;

            // Verifica se existe um gerente de projeto atribuído
            if (currentItem.capa_projeto.gerente_projeto && currentItem.capa_projeto.gerente_projeto.email) {
                console.log("Gerente de projeto atribuído:", currentItem.capa_projeto.gerente_projeto);
                payload = {
                    etapa: "Warmup Financeiro",
                    status: "Revisado",
                };
            } else {
                payload = {
                    etapa: "Warmup Projetos",
                    status: "Aguardando",
                };
            }

            const response = await fetch(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ao atualizar etapa: ${response.statusText} - ${errorText}`);
            }

            listarWarmup();

            // Envia email de notificação
            if (currentItem.capa_projeto.gerente_projeto && currentItem.capa_projeto.gerente_projeto.email) {
                await enviarEmailNotificacaoFinanceiro(currentItem);
            } else {
                await enviarEmailNotificacaoSocio(currentItem);
            }

            setShowSuccessModal(true);
        } catch (error) {
            console.error("Erro ao avançar etapa:", error.message);
        } finally {
            setShowLoadingModal(false);
            setCurrentItem(null);
        }
    };

    const enviarEmailNotificacaoSocio = async (item) => {
        const socioResponsavel = item?.capa_projeto?.socio_responsavel;
        const warmupUrl = `${BASE_URL}/projetos/warmup`;

        console.log("Gerente do Projeto:", socioResponsavel);
        console.log("Warmup URL:", warmupUrl);

        if (!socioResponsavel || !socioResponsavel.email) {
            console.error("Gerente do projeto não encontrado ou sem email.");
            return;
        }

        const emailBody = `
            <p>Olá ${socioResponsavel.nome},</p>
            <p>Você foi atribuído como responsável pelo projeto <strong>${item.capa_projeto.codigo}</strong></p>
            <p><a href="${warmupUrl}" target="_blank">Clique aqui para acessar os processos e atribuir um Gerente para o projeto</a></p>
            <p>Atenciosamente,<br>Equipe ConTI Consultoria</p>
        `;

        try {
            const emailResponse = await fetch(`${API_URL}/api/enviar-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sender_email: "warmup@conticonsultoria.com.br",
                    recipient_email: socioResponsavel.email,
                    subject: `Você foi atribuído como Responsável do Projeto ${item.capa_projeto.codigo}`,
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

    const enviarEmailNotificacaoFinanceiro = async (item) => {
        const warmupUrl = `${window.location.origin}/forms-warmup-financeiro/${item._id}`;

        const emailBody = `
            <p>Olá,</p>
            <p>Há um novo warmup disponível para análise do financeiro.</p>
            <p>O formulário do Warmup está disponível para acompanhamento no Portal do SIC.</p>
            <p>Ou <a href="${warmupUrl}" target="_blank">Clique aqui para acessar o formulário</a></p>
            <p>Atenciosamente,<br>Equipe ConTI Consultoria</p>
        `;

        try {
            const emailResponse = await fetch(`${API_URL}/api/enviar-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sender_email: "warmup@conticonsultoria.com.br",
                    recipient_email: "junia.mendes@conticonsultoria.com.br",
                    subject: `Novo Warmup disponível para análise do financeiro`,
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".menu-dropdown")) {
                setActiveMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        listarWarmup();
    }, []);

    useEffect(() => {
        if (!loading && dadosWarmup.length > 0) {
            aplicarFiltros();
        }
    }, [dadosWarmup, projetoFilter, reponsavelFilter, etapaFilter, statusFilter, filtroResponsavel]);

    const abrirModal = (negociacao) => {
        setNegociacaoSelecionada(negociacao);
        setActiveMenu(null);
    };

    const fecharModal = () => {
        setNegociacaoSelecionada(null);
    };

    const toggleMenu = (id) => {
        setActiveMenu(activeMenu === id ? null : id);
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

            {/* Filtro por responsável comercial */}
            <div className="mb-4">
                <label className="inline-flex items-center">
                    <input
                        type="checkbox"
                        checked={filtroResponsavel}
                        onChange={(e) => setFiltroResponsavel(e.target.checked)}
                        className="form-checkbox"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Mostrar apenas meus projetos</span>
                </label>
            </div>
            {loading && <p className="text-sm font-medium text-gray-600">Carregando...</p>}
            {error && <p className="text-sm font-medium text-red-500">Erro: {error}</p>}
            {!loading && !error && dadosWarmup.length === 0 && (
                <p className="text-sm font-medium text-gray-600">Nenhum processo em andamento.</p>
            )}

            {!loading && !error && filteredData.length > 0 && (
                <div className="max-w bg-white rounded-lg shadow-md">
                    <table className="table-auto w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-2 py-1 font-semibold text-gray-600">Responsável Comercial</th>
                                <th className="px-2 py-1 font-semibold text-gray-600">Código do Projeto</th>
                                <th className="px-2 py-1 font-semibold text-gray-600">Centro de Resultados</th>
                                <th className="px-2 py-1 font-semibold text-gray-600">Valor</th>
                                <th className="px-2 py-1 text-center font-semibold text-gray-600">Status</th>
                                <th className="px-2 py-1 text-center font-semibold text-gray-600">Etapa</th>
                                <th className="px-2 py-1 text-center font-semibold text-gray-600">Tempo Aberto</th>
                                <th className="px-2 py-1 text-center font-semibold text-gray-600">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50">
                                    <td className="px-2 py-1 text-gray-700">{item?.responsaveis?.responsavel_comercial?.nome || "N/A"}</td>
                                    <td className="px-2 py-1 text-gray-700">{item?.capa_projeto?.codigo}</td>
                                    <td className="px-2 py-1 text-gray-700">{item?.capa_projeto?.centro_resultado?.NOME || "N/A"}</td>
                                    <td className="px-2 py-1 text-gray-700">
                                        {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(item.formacao_preco.valor || "N/A")}
                                    </td>                
                                    <td className="px-2 py-1 text-center ">
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
                                    <td className="px-2 py-1 text-gray-700 text-center ">{item.etapa || "N/A"}</td>
                                    <td className="px-2 py-1 text-gray-700 text-center">
                                        {calcularDiasUteis(item.inicio_warmup)} Dias
                                    </td>
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
                                                    onClick={() => redirecionarFormulario(item._id)}
                                                    className={`text-gray-700 px-4 py-2 hover:bg-gray-100 w-full text-center ${!isResponsavel(item) ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    disabled={!isResponsavel(item)}
                                                >
                                                    Abrir Formulário
                                                </button>
                                                <button
                                                    onClick={() => handleAvancarEtapa(item)}
                                                    className={`text-sky-700 px-4 py-2 hover:bg-sky-100 w-full text-center ${!isResponsavel(item) ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    disabled={!isResponsavel(item)}
                                                >
                                                    Avançar Etapa
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

            <ModalDetalhesWarmup negociacao={negociacaoSelecionada} onClose={fecharModal} />

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Confirmar Avançar Etapa</h2>
                        <p className="mb-6">
                            {currentItem?.capa_projeto?.gerente_projeto?.email
                                ? 'Tem certeza de que deseja avançar a etapa para "Warmup Financeiro"?'
                                : 'Tem certeza de que deseja avançar a etapa para "Warmup Projetos"?'}
                        </p>
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

            {showLoadingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
                    <div className="bg-white p-6 rounded shadow-lg flex flex-col items-center">
                        <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin mb-4"></div>
                        <p className="text-lg font-medium text-gray-700">Processando...</p>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Sucesso!</h2>
                        <p className="mb-6">A etapa foi avançada e um email foi enviado ao responsável</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarmupComercial;
