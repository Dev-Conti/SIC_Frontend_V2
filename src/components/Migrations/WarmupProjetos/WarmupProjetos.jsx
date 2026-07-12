import { useState, useEffect } from 'react';
import { FaEllipsisH } from 'react-icons/fa';
import ModalNegociacao from '../ModalDetalhesWarmup/ModalDetalhesWarmup';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import useGroupMembers from "@/hooks/useGroupMembers";
import useConfigGroups from "@/hooks/useConfigGroups";

const WarmupProjetos = () => {
    const { user } = useAuth();
    const USER_NAME = user?.displayName;
    const [dadosWarmup, setDadosWarmup] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [negociacaoSelecionada, setNegociacaoSelecionada] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [showVoltarModal, setShowVoltarModal] = useState(false);
    const [observacaoVoltar, setObservacaoVoltar] = useState("");
    const [currentItemVoltar, setCurrentItemVoltar] = useState(null);
    const [filtroGerente, setFiltroGerente] = useState(true);
    const config = useConfigGroups('/servicos');
    const { members } = useGroupMembers(config?.group_id, config?.channel_id);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [currentAssignItem, setCurrentAssignItem] = useState(null);
    const [loadingAssign, setLoadingAssign] = useState(false);

    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

    const hasGerente = (item) => !!item?.capa_projeto?.gerente_projeto?.nome;
    const isSocioResponsavel = (item) => item?.capa_projeto?.socio_responsavel?.nome === USER_NAME || USER_NAME === "TI" || USER_NAME ==="Desenvolvimento ConTI";

    const getCamposObrigatoriosFaltantes = (item) => {
        const cronograma = item?.cronograma_execucao || {};
        const faltantes = [];
        if (!cronograma.Parametrizar_agile?.trim()) {
            faltantes.push('Parametrizar no Agile?');
        }
        if (cronograma.cronograma_fisico === 'Project' && !cronograma.caminho_project?.trim()) {
            faltantes.push('Caminho para o arquivo do Project');
        }
        return faltantes;
    };

    async function listarWarmup() {
        try {
            const response = await fetch(`${API_URL}/warmup/listar?etapa=Warmup Projetos`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Erro: ${response.status}`);
            }

            const data = await response.json();
            setDadosWarmup(data.data);
            setFilteredData(data.data); // Inicialmente, sem filtro
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const aplicarFiltros = () => {
        let filtered = dadosWarmup;

        // Filtro pelo gerente do projeto ou sócio responsável (checkbox)
        if (filtroGerente) {
            filtered = filtered.filter(
                (item) => item?.capa_projeto?.gerente_projeto?.nome === USER_NAME ||
                          item?.capa_projeto?.socio_responsavel?.nome === USER_NAME
            );
        }

        setFilteredData(filtered);
    };

    useEffect(() => {
        listarWarmup();
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [dadosWarmup, filtroGerente]);

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
        setActiveMenu(null); // Fecha o menu ao avançar etapa
    };

    const confirmarAvancarEtapa = async () => {
        try {
            const response = await fetch(`${API_URL}/warmup/atualizar/${currentItem.negocio_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    etapa: 'Warmup Financeiro',
                    status: 'Aguardando'
                }),
            });

            if (!response.ok) {
                throw new Error(`Erro ao atualizar etapa: ${response.statusText}`);
            }

            listarWarmup();
            alert('Etapa atualizada com sucesso!');
            try { await enviarEmailNotificacaoFinanceiro(currentItem); } catch (e) { console.error("Erro ao enviar email:", e); } // TODO: implementar via v2 backend
        } catch (error) {
            alert(`Erro ao atualizar etapa: ${error.message}`);
        } finally {
            setShowConfirmModal(false);
            setCurrentItem(null);
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

    const handleVoltarEtapa = (item) => {
        setCurrentItemVoltar(item);
        setShowVoltarModal(true);
        setActiveMenu(null); // Fecha o menu ao abrir o modal
    };

    const confirmarVoltarEtapa = async () => {
        try {
            const usuario = user?.displayName || "Usuário Anônimo";

            const response = await fetch(`${API_URL}/warmup/atualizar/${currentItemVoltar.negocio_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    etapa: 'Warmup Comercial',
                    status: "Revisar",
                    data: new Date().toLocaleString("pt-BR"),
                    observacao: observacaoVoltar,
                    usuario: usuario,
                }),
            });

            if (!response.ok) {
                throw new Error(`Erro ao atualizar etapa: ${response.statusText}`);
            }

            listarWarmup();
            alert('Etapa atualizada com sucesso!');
            try { await enviarEmailNotificacaoComercial(currentItemVoltar); } catch (e) { console.error("Erro ao enviar email:", e); } // TODO: implementar via v2 backend
        } catch (error) {
            alert(`Erro ao atualizar etapa: ${error.message}`);
        } finally {
            setShowVoltarModal(false);
            setCurrentItemVoltar(null);
            setObservacaoVoltar("");
        }
    };

    const enviarEmailNotificacaoComercial = async (item) => {
        const warmupUrl = `${window.location.origin}/comercial/warmup`;
        const comercialEmail = item?.responsaveis?.responsavel_comercial?.email;

        if (!comercialEmail) {
            console.error("Email do responsável comercial não encontrado.");
            return;
        }

        const emailBody = `
            <p>Olá,</p>
            <p>Há um formulário pendente de correção no warmup Comercial.</p>
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

    const redirecionarFormulario = (item) => {
        router.push(`/servicos/forms-warmup-projetos/${item.negocio_id}`);
        setActiveMenu(null);
    };

    const handleAssignGerente = (item) => {
        setCurrentAssignItem({ item, gerente: null });
        setShowAssignModal(true);
        setActiveMenu(null); // Fecha o menu ao abrir o modal
    };

    const confirmarAssignGerente = async () => {
        setLoadingAssign(true);
        const gerente = {
            nome: currentAssignItem.gerente.displayName,
            email: currentAssignItem.gerente.email
        };
        console.log("Gerente selecionado:", gerente);
        console.log("Current Assign Item:", currentAssignItem.item);
        try {
            const response = await fetch(`${API_URL}/warmup/atualizar/${currentAssignItem.item.negocio_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    "capa_projeto.gerente_projeto": gerente,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ao atribuir gerente: ${response.statusText} - ${errorText}`);
            }

            listarWarmup();
            alert('Gerente atribuído com sucesso!');
            try { await enviarEmailNotificacaoGerente(currentAssignItem.item, gerente); } catch (e) { console.error("Erro ao enviar email:", e); } // TODO: implementar via v2 backend
        } catch (error) {
            console.error("Erro ao atribuir gerente:", error.message);
            alert(`Erro ao atribuir gerente: ${error.message}`);
        } finally {
            setLoadingAssign(false);
            setShowAssignModal(false);
            setCurrentAssignItem(null);
        }
    };

    const enviarEmailNotificacaoGerente = async (item, gerente) => {
        console.log("Enviando email para o gerente:", gerente);
        const warmupUrl = `${window.location.origin}/forms-warmup-projetos/${item._id}`;

        const emailBody = `
            <p>Olá ${gerente.nome},</p>
            <p>Você foi atribuído como gerente do projeto <strong>${item.capa_projeto.codigo}</strong> para o cliente <strong>${item.cliente.nome}</strong>.</p>
            <p>O formulário do Warmup está disponível para preenchimento no Portal do SIC.</p>
            <p>Ou <a href="${warmupUrl}" target="_blank">Clique aqui para acessar o formulário</a></p>
            <p>Atenciosamente,<br>Equipe ConTI Consultoria</p>
        `;

        try {
            const emailResponse = await fetch(`${API_URL}/api/enviar-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sender_email: "warmup@conticonsultoria.com.br",
                    recipient_email: gerente.email,
                    subject: `Você foi atribuído como Gerente do Projeto ${item.capa_projeto.codigo}`,
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

            {/* Filtro por gerente do projeto */}
            <div className="mb-4">
                <label className="inline-flex items-center">
                    <input
                        type="checkbox"
                        checked={filtroGerente}
                        onChange={(e) => setFiltroGerente(e.target.checked)}
                        className="form-checkbox"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Mostrar apenas meus projetos</span>
                </label>
            </div>

            {loading && <p className="text-sm font-medium text-gray-600">Carregando...</p>}
            {error && <p className="text-sm font-medium text-red-500">Erro: {error}</p>}
            {!loading && !error && filteredData.length === 0 && (
                <p className="text-sm font-medium text-gray-600">Nenhum processo em andamento.</p>
            )}

            {!loading && !error && filteredData.length > 0 && (
                <div className="max-w bg-white rounded-lg shadow-md">
                    <table className="table-auto w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-2 py-1 font-semibold text-gray-600">Sócio Responsável</th>
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
                            {filteredData.map((item) => {
                                const camposFaltantes = getCamposObrigatoriosFaltantes(item);
                                const podeAvancarEtapa = hasGerente(item) && camposFaltantes.length === 0;
                                const pendenciasAvancarEtapa = [
                                    ...(!hasGerente(item) ? ['Atribuir um Gerente de Projeto'] : []),
                                    ...camposFaltantes.map((c) => `Preencher "${c}"`),
                                ];
                                return (
                                <tr key={item._id} className="hover:bg-gray-50">
                                    <td className="px-2 py-1 text-gray-700">{item?.capa_projeto?.socio_responsavel?.nome || "N/A"}</td>
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
                                                    onClick={() => redirecionarFormulario(item)}
                                                    className="text-gray-700 px-4 py-2 hover:bg-gray-100 w-full text-center"
                                                >
                                                    Abrir Formulário
                                                </button>
                                                <button
                                                    onClick={() => handleAvancarEtapa(item)}
                                                    disabled={!podeAvancarEtapa}
                                                    title={!podeAvancarEtapa ? `Pendências: ${pendenciasAvancarEtapa.join(', ')}` : undefined}
                                                    className={`text-sky-700 px-4 py-2 hover:bg-sky-100 w-full text-center ${!podeAvancarEtapa ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    Avançar Etapa
                                                </button>
                                                <button
                                                    onClick={() => handleVoltarEtapa(item)}
                                                    className={`text-amber-500 px-4 py-2 hover:bg-amber-50 w-full text-center ${!isSocioResponsavel(item) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    disabled={!isSocioResponsavel(item)}
                                                >
                                                    Voltar Etapa
                                                </button>
                                                {isSocioResponsavel(item) && (
                                                    <button
                                                        onClick={() => handleAssignGerente(item)}
                                                        className="text-green-500 px-4 py-2 hover:bg-green-50 w-full text-center"
                                                    >
                                                        {hasGerente(item) ? "Reatribuir Gerente" : "Atribuir Gerente"}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <ModalNegociacao negociacao={negociacaoSelecionada} onClose={fecharModal} />

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Confirmar Avançar Etapa</h2>
                        <p className="mb-6">Tem certeza de que deseja avançar a etapa para "Warmup Financeiro"?</p>
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

            {showAssignModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
                    <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
                        <h2 className="text-lg font-semibold mb-4">Atribuir Gerente</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o Gerente</label>
                            <select
                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none"
                                onChange={(e) => {
                                    const selectedGerente = (members || []).find(member => member.displayName === e.target.value);
                                    console.log("Gerente selecionado no modal:", selectedGerente);
                                    setCurrentAssignItem(prev => ({ ...prev, gerente: selectedGerente }));
                                }}
                            >
                                <option value="">Selecione</option>
                                {(members || []).map((member) => (
                                    <option key={member.id} value={member.displayName}>
                                        {member.displayName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded shadow hover:bg-gray-400 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarAssignGerente}
                                className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
                                disabled={loadingAssign}
                            >
                                {loadingAssign ? (
                                    <div className="loader border-t-4 border-white rounded-full w-4 h-4 animate-spin"></div>
                                ) : (
                                    "Confirmar"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default WarmupProjetos;
