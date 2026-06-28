import React from "react";
import { useAuth } from "../Auth/AuthContext/AuthContext";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NumericFormat } from 'react-number-format';
import ListaGerentesProjeto from "./Dados/ListaGerentesProjeto";
import ObservacoesChat from "./Componentes/ObservacoesChat"
import ListaSuspensa from "./inputs/ListaSuspensa";
import CampoTexto from "./inputs/CampoTexto";
import CampoTextoLongo from "./inputs/CampoTextoLongo";
import CampoLink from "./inputs/CampoLink";
import useGroupMembers from "../../hooks/useGroupMembers";



// Componentes Reutilizáveis
const CampoMonetario = ({ label, name, obrigatorio = true, valor, aoAlterado, readOnly, disabled, display = true }) => {
    if (!display) return null; // Não renderiza nada se display for falso

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <NumericFormat
                name={name}
                value={valor}
                required={obrigatorio}
                onValueChange={({ value }) => aoAlterado(value)} // Retorna apenas o valor bruto
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                fixedDecimalScale={true} // Garante que duas casas decimais sejam exibidas
                decimalScale={2} // Define o número de casas decimais
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                readOnly={readOnly}
                disabled={disabled}
            />
        </div>
    );
};
const DateInput = ({ label, name, value, onChange, required = true, min, max, readOnly, disabled, display = true }) => {
    if (!display) return null; // Não renderiza nada se display for falso

    return (
        <div className="mb-4">
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    {label}
                </label>
            )}
            <input
                type="date"
                id={name}
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)} // Corrigido para chamar onChange com o valor correto
                required={required}
                min={min}
                max={max}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                readOnly={readOnly}
                disabled={disabled}
            />
        </div>
    );
};
const ListaComCheckbox = ({ label, itens, aoAlterarPayload, valoresIniciais = [], obrigatorio = true }) => {
    const [selecionados, setSelecionados] = React.useState(valoresIniciais);

    useEffect(() => {
        setSelecionados(valoresIniciais); // Sincronizar com valores iniciais
    }, [valoresIniciais]);

    const aoSelecionar = (item) => {
        const novosSelecionados = selecionados.includes(item)
            ? selecionados.filter((i) => i !== item)
            : [...selecionados, item];
        setSelecionados(novosSelecionados);
        aoAlterarPayload(novosSelecionados); // Atualizar o estado no componente pai
    };

    return (
        <div className="mb-4">
            {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
            <div className="border border-gray-300 rounded-md p-2">
                {itens.map((item, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            id={`item-${index}`}
                            checked={selecionados.includes(item)}
                            onChange={() => aoSelecionar(item)}
                            className="mr-2"
                        />
                        <label htmlFor={`item-${index}`} className="text-sm">
                            {item}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ListaComCheckboxComDetalhes = ({ label, itens, aoAlterarPayload, valoresIniciais = [], obrigatorio = true }) => {
    const [selecionados, setSelecionados] = React.useState(valoresIniciais);

    useEffect(() => {
        setSelecionados(valoresIniciais); // Sincronizar com valores iniciais
    }, [valoresIniciais]);

    const aoSelecionar = (item) => {
        const itemIndex = selecionados.findIndex((i) => i.nome === item);
        const novosSelecionados = itemIndex !== -1
            ? selecionados.filter((i) => i.nome !== item)
            : [...selecionados, { nome: item, valor: "", cobrarCliente: false }];
        setSelecionados(novosSelecionados);
        aoAlterarPayload(novosSelecionados); // Atualizar o estado no componente pai
    };

    const aoAlterarDetalhes = (item, campo, valor) => {
        const itemIndex = selecionados.findIndex((i) => i.nome === item);
        if (itemIndex !== -1) {
            const novosSelecionados = [...selecionados];
            novosSelecionados[itemIndex][campo] = valor;
            setSelecionados(novosSelecionados);
            aoAlterarPayload(novosSelecionados);
        }
    };

    const totalDespesas = selecionados.reduce((acc, item) => acc + parseFloat(item.valor || 0), 0);
    const totalDespesasCobradas = selecionados.reduce((acc, item) => item.cobrarCliente ? acc + parseFloat(item.valor || 0) : acc, 0);

    return (
        <div className="mb-4">
            {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
            <div className="border border-gray-300 rounded-md p-4 space-y-4">
                {itens.map((item, index) => {
                    const itemSelecionado = selecionados.find((i) => i.nome === item);
                    return (
                        <div key={index} className="flex items-center mb-2 space-x-4">
                            <input
                                type="checkbox"
                                id={`item-${index}`}
                                checked={!!itemSelecionado}
                                onChange={() => aoSelecionar(item)}
                                className="mr-2"
                            />
                            <label htmlFor={`item-${index}`} className="text-sm">
                                {item}
                            </label>
                            {itemSelecionado && (
                                <>
                                    <CampoMonetario
                                        label="Valor Total"
                                        name={`valor-${item}`}
                                        obrigatorio={true}
                                        valor={itemSelecionado.valor}
                                        aoAlterado={(valor) => aoAlterarDetalhes(item, "valor", valor)}
                                    />
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`cobrar-${item}`}
                                            checked={itemSelecionado.cobrarCliente}
                                            onChange={(e) => aoAlterarDetalhes(item, "cobrarCliente", e.target.checked)}
                                            className="mr-2"
                                        />
                                        <label htmlFor={`cobrar-${item}`} className="text-sm">
                                            Cobrar do Cliente
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Total de Despesas: R$ {totalDespesas.toFixed(2)}</p>
                <p className="text-sm font-medium text-gray-700">Total de Despesas a Serem Cobradas do Cliente: R$ {totalDespesasCobradas.toFixed(2)}</p>
            </div>
        </div>
    );
};

// Formulário Principal
const FormsWarmupComercial = () => {
    const { userData } = useAuth(); // Obtém os dados do usuário logado
    const nomeUsuario = userData?.user?.displayName || ""; // Nome do usuário logado
    const { id } = useParams();
    const navigate = useNavigate();
    const groupId = "df5919f9-37fd-4725-9aab-8ecc154789a8"; // ID do grupo
    const channelId = '19:f826e90af9f741319cf021cf04aa19a4@thread.tacv2'
    const { members } = useGroupMembers(groupId, channelId); // Para o grupo principal
    const { members: socios } = useGroupMembers('718b8873-3ca9-4bd1-bd3d-6b657fe2cf80'); // Para os sócios



    const [dadosNegociacao, setDadosNegociacao] = useState({
        observacoes: [],
        capa_projeto: {
            codigo: "",
            nome: "",
            objetivo_projeto: "",
            centro_resultado: null,
            socio_responsavel: null,
            gerente_projeto: null,
        },
        formacao_preco: {
            valor_projeto: "",
            tipo: "",
            faturamento_projeto_aberto: "",
            existe_limite_horas: "",
            limite_total_horas: "",
            empresa_faturamento: "",
            recorrente: "",
            aniversario_projeto: "",
            primeiro_faturamento: "",
            formacao_atividade: "",
            comissionado: "",
            reajuste_anual: "",
            tem_servico_parceiros: "",
            nome_parceiro: "",
            valor_parceiro: "",
            condicao_pagamento_parceiro: "",
            possui_despesa: "",
            limite_despesas: "",
            despesa_cobrada_cliente: "",
            como_cobrar_despesas: "",
            possui_horas_extras: "",
            regras_horas_extras: "",
            possui_horas_deslocamento: "",
        },
        cronograma_execucao: {
            aprovacao_primeiro_nivel: "",
            aprovador: "",
            previsao_inicio: "",
            previsao_termino: "",
            cronograma_fisico: "",
            informar_atividades: "",
            selecionados: [],
            horas_alocadas: [],
        },
        adicionais_projeto: {
            pedido_compra: "",
        },
        faturamento: {
            cliente_novo: "",
            possui_marco_faturamento: "",
            regras_cadastro_marcos: "",
            faturado_no_aceite: "",
            marco_de_aceite: "",
            forma_pagamento: "",
            imposto_incluso: "",
            email_envio_faturamento: "",
        },
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0); // Estado para rastrear a aba ativa
    const [profissionaisSelecionados, setProfissionaisSelecionados] = useState([]);
    const [horasProfissionais, setHorasProfissionais] = useState([]);
    const [centrosResultados, setCentrosResultados] = useState([]);
    const [clienteNovo, setclienteNovo] = useState("Não");

    // Estados para controle de visibilidade
    const [campoProjetoAberto, setcampoProjetoAberto] = useState(false);
    const [campoLimiteHoras, setcampoLimiteHoras] = useState(false);
    const [campoRecorencia, setcampoRecorencia] = useState(false);
    const [campoServicoParceiros, setcampoServicoParceiros] = useState(false);
    const [campoPossuiDespesa, setcampoPossuiDespesa] = useState(false);
    const [campoCobrancaDespesa, setcampoCobrancaDespesa] = useState(false);
    const [campoHorasExtras, setcampoHorasExtras] = useState(false);
    const [campoAprovador, setCampoAprovador] = useState(false);
    const [campoInformarAtividades, setCampoInformarAtividades] = useState(false);
    const [CampoProject, setCampoProject] = useState(false);
    const [campoHorasDeslocamento, setcampoHorasDeslocamento] = useState(false);
    const [campoClienteNovo, setcampoClienteNovo] = useState(false);
    const [outrosAnexos, setOutrosAnexos] = useState([]);

    const handleAdicionarAnexo = () => {
        const novoAnexo = {
            nome: "",
            link: "",
        };
        setOutrosAnexos((prev) => [...prev, novoAnexo]);
    };

    const handleAlterarAnexo = (index, campo, valor) => {
        const novosAnexos = [...outrosAnexos];
        novosAnexos[index][campo] = valor;
        setOutrosAnexos(novosAnexos);
    };

    const handleRemoverAnexo = (index) => {
        const novosAnexos = [...outrosAnexos];
        novosAnexos.splice(index, 1);
        setOutrosAnexos(novosAnexos);
    };

    const tabs = [
        "Capa do Projeto",
        "Formação de Preço",
        "Informações sobre Faturamento",
        "Observações Gerais",
    ];

    const tipoDeProjeto = ["Aberto", "Fechado"];
    const empresaFaturamento = ["ConTI Consultoria", "Conti Treinamento"];
    const yorn = ["Sim", "Não"];
    const opPedidoDeCompra = ["Sim", "Não", "Sim, mas aguardar o pedido"];
    const opReajusteAnual = ['Sem Reajuste', "IGPM", "IPCA", "INPC"];
    const opCronogramaFisico = ['Project', 'Cadastro de Atividades'];
    const opProfissionaisAlocados = [
        "Consultor Junior",
        "Consultor Pleno",
        "Consultor Senior",
        "Desenvolvedor Junior",
        "Desenvolvedor Pleno",
        "Desenvolvedor Sênior",
        "Consultor de Tecnologia",
        "Consultor de Processos",
        "Gerente de Projeto",
        "Terceiros/Parceiros",
        "Reserva ConTI"
    ];

    const [valorProjeto, setValorProjeto] = useState(""); // Valor bruto
    const [valorParceiro, setvalorParceiro] = useState(""); // Valor bruto

    const API_URL = process.env.REACT_APP_API_URL || 'https://sic-conti-backend.vercel.app';

    useEffect(() => {
        const fetchCentrosResultados = async () => {
            try {
                const response = await fetch(`${API_URL}/api/psoffice/centros-resultados`);
                if (!response.ok) {
                    throw new Error(`Erro na API: ${response.status}`);
                }
                const data = await response.json();
                setCentrosResultados(data); // Atualiza o estado com os centros de resultados
            } catch (err) {
                console.error("Erro ao carregar centros de resultados:", err.message);
            }
        };

        fetchCentrosResultados();
    }, []);
    useEffect(() => {
        const fetchDadosNegociacao = async () => {
            try {
                const response = await fetch(`${API_URL}/api/warmup/${id}`);
                if (!response.ok) {
                    throw new Error(`Erro na API: ${response.status}`);
                }
                const data = await response.json();
                if (data.status === "success") {
                    const negociacao = data.data;

                    // Verifica se a etapa é diferente de "Warmup Comercial"
                    if (negociacao.etapa !== "Warmup Comercial") {
                        alert("Formulário já enviado à etapa financeiro, não é possível editar.");
                        navigate("/projetos/warmup", { replace: true });
                        return;
                    }

                    // Atualiza os estados do formulário com os dados recebidos
                    setDadosNegociacao((prev) => ({
                        ...prev,
                        ...negociacao,
                        observacoes: negociacao.observacoes_gerais || [],
                    }));

                    // Atualiza os estados dependentes com base nos dados carregados
                    setcampoProjetoAberto(negociacao?.formacao_preco?.tipo === "Aberto");
                    setcampoLimiteHoras(negociacao?.formacao_preco?.existe_limite_horas === "Sim");
                    setcampoRecorencia(negociacao?.formacao_preco?.recorrente === "Sim");
                    setcampoServicoParceiros(negociacao?.formacao_preco?.tem_servico_parceiros === "Sim");
                    setcampoPossuiDespesa(negociacao?.formacao_preco?.possui_despesa === "Sim");
                    setcampoCobrancaDespesa(negociacao?.formacao_preco?.despesa_cobrada_cliente === "Sim");
                    setcampoHorasExtras(negociacao?.formacao_preco?.possui_horas_extras === "Sim");
                    setCampoAprovador(negociacao?.cronograma_execucao?.aprovacao_primeiro_nivel === "Sim");
                    setCampoInformarAtividades(negociacao?.cronograma_execucao?.cronograma_fisico === "Cadastro de Atividades");
                    setcampoHorasDeslocamento(negociacao?.formacao_preco?.possui_horas_deslocamento === "Sim");
                    setcampoClienteNovo(negociacao?.faturamento?.cliente_novo === "Sim");
                    setOutrosAnexos(negociacao.capa_projeto.outros_anexos || []); // Initialize outrosAnexos state


                    // Atualiza profissionais e horas
                    setProfissionaisSelecionados(negociacao?.cronograma_execucao?.selecionados || []);
                    setHorasProfissionais(negociacao?.cronograma_execucao?.horas_alocadas || []);
                } else {
                    throw new Error("Erro nos dados retornados.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDadosNegociacao();
    }, [id]);
    const handleSocioSelecionado = (valor) => {
        const socio = socios.find((m) => m.displayName === valor);
        if (socio) {
            setDadosNegociacao((prev) => ({
                ...prev,
                capa_projeto: {
                    ...prev.capa_projeto,
                    socio_responsavel: { nome: valor, email: socio.email },
                },
            }));
        }
    };
    const handleGerenteSelecionado = (valor) => {
        const gerente = members.find((m) => m.displayName === valor);
        if (gerente) {
            setDadosNegociacao((prev) => ({
                ...prev,
                capa_projeto: {
                    ...prev.capa_projeto,
                    gerente_projeto: { nome: valor, email: gerente.email },
                },
            }));
        }
    };
    const handleAdicionarProfissional = (profissional) => {
        if (!profissionaisSelecionados.includes(profissional)) {
            const novosProfissionais = [...profissionaisSelecionados, profissional];
            const novasHoras = [...horasProfissionais, { profissional, horas: "" }];

            setProfissionaisSelecionados(novosProfissionais);
            setHorasProfissionais(novasHoras);

            // Atualizar no objeto principal
            setDadosNegociacao((prev) => ({
                ...prev,
                profissionais: {
                    selecionados: novosProfissionais,
                    horas_alocadas: novasHoras,
                },
            }));
        }
    };
    const handleAlterarHoras = (index, valor) => {
        const novaLista = [...horasProfissionais];
        novaLista[index].horas = valor;
        setHorasProfissionais(novaLista);
    };
    const aoSalvar = async (evento) => {
        evento.preventDefault();

        const despesasDetalhes = dadosNegociacao?.formacao_preco?.despesas_detalhes || [];
        const totalDespesas = despesasDetalhes.reduce((acc, item) => acc + parseFloat(item.valor || 0), 0);
        const totalDespesasCobradas = despesasDetalhes.reduce((acc, item) => item.cobrarCliente ? acc + parseFloat(item.valor || 0) : acc, 0);

        // Construção do payload com os dados ajustados
        const respostas = {
            status: "Preenchendo",
            capa_projeto: {
                codigo: dadosNegociacao?.capa_projeto?.codigo || "",
                nome: dadosNegociacao?.capa_projeto?.nome || "",
                objetivo_projeto: dadosNegociacao?.capa_projeto?.objetivo_projeto || "",
                nome_vendedor: dadosNegociacao?.capa_projeto?.nome_vendedor || "",
                email_vendedor: dadosNegociacao?.capa_projeto?.email_vendedor || "",
                proposta_atual: dadosNegociacao?.capa_projeto?.proposta_atual || "",
                formacao_preco_atual: dadosNegociacao?.capa_projeto?.formacao_preco_atual || "",
                detalhes_negociacao: dadosNegociacao?.capa_projeto?.detalhes_negociacao || "",
                pedido_compra: dadosNegociacao?.capa_projeto?.pedido_compra || "",
                pedido_compra_atual: dadosNegociacao?.capa_projeto?.pedido_compra_atual || "",
                centro_resultado: dadosNegociacao?.capa_projeto?.centro_resultado || "",
                socio_responsavel: dadosNegociacao?.capa_projeto?.socio_responsavel || "",
                gerente_projeto: dadosNegociacao?.capa_projeto?.gerente_projeto || "",
                outros_anexos: outrosAnexos,
            },
            formacao_preco: {
                valor: dadosNegociacao?.formacao_preco?.valor || "",
                tipo: dadosNegociacao?.formacao_preco?.tipo || "",
                faturamento_projeto_aberto: dadosNegociacao?.formacao_preco?.faturamento_projeto_aberto || "",
                existe_limite_horas: dadosNegociacao?.formacao_preco?.existe_limite_horas || "",
                limite_total_horas: dadosNegociacao?.formacao_preco?.limite_total_horas || "",
                empresa_faturamento: dadosNegociacao?.formacao_preco?.empresa_faturamento || "",
                recorrente: dadosNegociacao?.formacao_preco?.recorrente || "",
                aniversario_projeto: dadosNegociacao?.formacao_preco?.aniversario_projeto || "", // Adicionado
                primeiro_faturamento: dadosNegociacao?.formacao_preco?.primeiro_faturamento || "", // Adicionado
                comissionado: dadosNegociacao?.formacao_preco?.comissionado || "",
                regras_comissao: dadosNegociacao?.formacao_preco?.regras_comissao || "",
                reajuste_anual: dadosNegociacao?.formacao_preco?.reajuste_anual || "",
                tem_servico_parceiros: dadosNegociacao?.formacao_preco?.tem_servico_parceiros || "",
                nome_parceiro: dadosNegociacao?.formacao_preco?.nome_parceiro || "",
                valor_parceiro: dadosNegociacao?.formacao_preco?.valor_parceiro || "",
                condicao_pagamento_parceiro: dadosNegociacao?.formacao_preco?.condicao_pagamento_parceiro || "",
                possui_despesa: dadosNegociacao?.formacao_preco?.possui_despesa || "",
                despesas_detalhes: despesasDetalhes.map((despesa) => ({
                    nome: despesa.nome,
                    valor: despesa.valor,
                    cobrarCliente: despesa.cobrarCliente,
                })) || [],
                limite_despesas: dadosNegociacao?.formacao_preco?.limite_despesas || "",
                despesa_cobrada_cliente: dadosNegociacao?.formacao_preco?.despesa_cobrada_cliente || "",
                como_cobrar_despesas: dadosNegociacao?.formacao_preco?.como_cobrar_despesas || "",
                possui_horas_extras: dadosNegociacao?.formacao_preco?.possui_horas_extras || "",
                regras_horas_extras: dadosNegociacao?.formacao_preco?.regras_horas_extras || "",
                possui_horas_deslocamento: dadosNegociacao?.formacao_preco?.possui_horas_deslocamento || "",
                horas_deslocamento: dadosNegociacao?.formacao_preco?.horas_deslocamento || "",
                total_despesas: totalDespesas,
                total_despesas_cobradas: totalDespesasCobradas,
                regras_horas_deslocamento: dadosNegociacao?.formacao_preco?.regras_horas_deslocamento || "",

            },
            faturamento: {
                cliente_novo: dadosNegociacao?.faturamento?.cliente_novo || "",
                ficha_cadastral: dadosNegociacao?.faturamento?.ficha_cadastral || "",
                possui_marco_faturamento: dadosNegociacao?.faturamento?.possui_marco_faturamento || "",
                regras_cadastro_faturamento: dadosNegociacao?.faturamento?.regras_cadastro_faturamento || "",
                faturado_no_aceite: dadosNegociacao?.faturamento?.faturado_no_aceite || "",
                marco_de_aceite: dadosNegociacao?.faturamento?.marco_de_aceite || "",
                forma_pagamento: dadosNegociacao?.faturamento?.forma_pagamento || "",
                imposto_incluso: dadosNegociacao?.faturamento?.imposto_incluso || "",
                email_envio_faturamento: dadosNegociacao?.faturamento?.email_envio_faturamento || "",
            },
            cronograma_execucao: {
                aprovacao_primeiro_nivel: dadosNegociacao?.cronograma_execucao?.aprovacao_primeiro_nivel || "",
                aprovador: dadosNegociacao?.cronograma_execucao?.aprovador || "",
                previsao_inicio: dadosNegociacao?.cronograma_execucao?.previsao_inicio || "",
                previsao_termino: dadosNegociacao?.cronograma_execucao?.previsao_termino || "",
                cronograma_fisico: dadosNegociacao?.cronograma_execucao?.cronograma_fisico || "",
                informar_atividades: dadosNegociacao?.cronograma_execucao?.informar_atividades || "",
                caminho_project: dadosNegociacao?.capa_projeto?.caminho_project,
                selecionados: profissionaisSelecionados,
                horas_alocadas: horasProfissionais,
            },
            adicionais_projeto: {
            },

            observacoes_gerais: dadosNegociacao.observacoes.map((obs) => {
                const { novo, ...resto } = obs; // Remove a flag "novo" antes de enviar
                return resto;
            }),
        };

        console.log("Payload enviado:", respostas); // Debug

        try {
            const response = await fetch(`${API_URL}/api/warmup/atualizar/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(respostas),
            });

            if (!response.ok) {
                throw new Error(`Erro ao enviar dados: ${response.statusText}`);
            }

            const result = await response.json();
            if (result.status === "success") {
                alert("Dados enviados com sucesso!");
                navigate("/comercial/warmup", { replace: true });
                window.location.reload();
            }
            else {
                throw new Error(result.message || "Erro ao processar os dados.");
            }
        } catch (err) {
            alert(`Erro: ${err.message}`);
        }
    };
    const handleRemoverProfissional = (index) => {
        const novosProfissionais = [...profissionaisSelecionados];
        novosProfissionais.splice(index, 1);

        const novasHoras = [...horasProfissionais];
        novasHoras.splice(index, 1);

        setProfissionaisSelecionados(novosProfissionais);
        setHorasProfissionais(novasHoras);

        // Atualizar no objeto principal
        setDadosNegociacao((prev) => ({
            ...prev,
            cronograma_execucao: {
                selecionados: novosProfissionais,
                horas_alocadas: novasHoras,
            },
        }));
    };

    if (loading) return <div className="text-center text-gray-500 p-4">Carregando...</div>;
    if (error) return <div className="text-center text-red-500 p-4">Erro: {error}</div>;

    return (
        <div className="flex flex-col py-5 items-start justify-center bg-gray-50">
            <form
                onSubmit={aoSalvar}
                className="w-[70%] mx-auto p-6 bg-white rounded-lg shadow-md space-y-5"
            >
                <div className="flex flex-col text-center justify-start max-w-5x1 mx-auto">
                    <h1 className="text-2xl font-bold">Formulário Warmup - Etapa Comercial</h1>
                    <h1>{dadosNegociacao?.capa_projeto?.codigo || ""}</h1>
                </div>

                <input type="hidden" name="negociacao_id" value={id} />

                {/* Navegação por Abas */}
                <div className="flex justify-between border-b border-gray-300">
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setActiveTab(index)}
                            className={`py-2 px-4 font-medium ${activeTab === index
                                ? "border-b-2 border-blue-500 text-blue-600"
                                : "text-gray-500 hover:text-gray-800"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Conteúdo da Aba Ativa */}
                <div>
                    {/* Capa do Projeto */}
                    {activeTab === 0 && (
                        <section>
                            <h2 className="text-xl pb-2 font-semibold">Capa do Projeto</h2>
                            <CampoTexto
                                label="Vendedor"
                                name="nome_vendedor"
                                obrigatorio={true}
                                valor={dadosNegociacao?.capa_projeto?.nome_vendedor || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        capa_projeto: {
                                            ...prev.capa_projeto,
                                            nome_vendedor: valor,
                                        },
                                    }))
                                }
                                disabled={true}
                            />
                            <CampoTextoLongo
                                label="Objetivo do Projeto"
                                name="objetivo_projeto"
                                placeholder="Descreva o objetivo do projeto..."
                                obrigatorio={true}
                                valor={dadosNegociacao?.capa_projeto?.objetivo_projeto || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        capa_projeto: {
                                            ...prev.capa_projeto,
                                            objetivo_projeto: valor,
                                        },
                                    }))
                                }
                            />
                            
                            <CampoLink
                                label="Proposta Comercial Atualizada"
                                name="proposta_atual"
                                obrigatorio={true}
                                valor={dadosNegociacao?.capa_projeto?.proposta_atual || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        capa_projeto: {
                                            ...prev.capa_projeto,
                                            proposta_atual: valor,
                                        },
                                    }))
                                }
                            />
                            <CampoLink
                                label="Formação de Preço Atualizada"
                                name="formacao_preco_atual"
                                obrigatorio={false}
                                valor={dadosNegociacao?.capa_projeto?.formacao_preco_atual || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        capa_projeto: {
                                            ...prev.capa_projeto,
                                            formacao_preco_atual: valor,
                                        },
                                    }))
                                }
                            />
                            <CampoTextoLongo
                                label="Detalhes da Negociação"
                                name="detalhes_negociacao"
                                placeholder="Descreva o objetivo do projeto..."
                                obrigatorio={false}
                                valor={dadosNegociacao?.capa_projeto?.detalhes_negociacao || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        capa_projeto: {
                                            ...prev.capa_projeto,
                                            detalhes_negociacao: valor,
                                        },
                                    }))
                                }
                            />
                            <div className="my-3">
                                <button
                                    type="button"
                                    onClick={handleAdicionarAnexo}
                                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition duration-200"
                                >
                                    Adicionar Anexo
                                </button>
                                {outrosAnexos.length > 0 ? (
                                    <table className="pb-2 min-w-full bg-white border border-gray-200">
                                        <thead>
                                            <tr className="flex">
                                                <th className="px-4 py-2 border-b flex-grow">Nome do Documento</th>
                                                <th className="px-4 py-2 border-b flex-grow">Link</th>
                                                <th className="px-4 py-2 border-b"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {outrosAnexos.map((anexo, index) => (
                                                <tr key={index} className="flex">
                                                    <td className="px-4 py-2 border-b flex-grow">
                                                        <input
                                                            type="text"
                                                            placeholder="Nome do Documento"
                                                            value={anexo.nome}
                                                            onChange={(e) => handleAlterarAnexo(index, "nome", e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 border-b flex-grow">
                                                        <input
                                                            type="text"
                                                            placeholder="Link"
                                                            value={anexo.link}
                                                            onChange={(e) => handleAlterarAnexo(index, "link", e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 border-b text-center">
                                                        <button
                                                            onClick={() => handleRemoverAnexo(index)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            Remover
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-gray-500">Nenhum anexo adicionado.</p>
                                )}
                            </div>
                            <ListaSuspensa
                                label="Obrigatório Informar pedido de Compra ?"
                                name="pedido_compra"
                                itens={["Sim", "Não", "Aguardar Pedido"]}
                                obrigatorio={true}
                                valor={dadosNegociacao?.capa_projeto?.pedido_compra || ""}
                                aoAlterado={(valor) => {
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        capa_projeto: {
                                            ...prev.capa_projeto,
                                            pedido_compra: valor,
                                        },
                                    }));
                                }}
                            />
                            {dadosNegociacao?.capa_projeto?.pedido_compra === "Sim" && (
                                <CampoLink
                                    label="Link para o Pedido de Compra Atualizado"
                                    name="pedido_compra_atual"
                                    obrigatorio={true}
                                    valor={dadosNegociacao?.capa_projeto?.pedido_compra_atual || ""}
                                    aoAlterado={(valor) =>
                                        setDadosNegociacao((prev) => ({
                                            ...prev,
                                            capa_projeto: {
                                                ...prev.capa_projeto,
                                                pedido_compra_atual: valor,
                                            },
                                        }))
                                    }
                                />
                            )}
                            <ListaSuspensa
                                label="Centro de Resultados"
                                name="centro_resultado"
                                itens={centrosResultados.map(cr => ({ value: cr.CR_ID, label: cr.NOME }))} // Opções do dropdown
                                obrigatorio={true}
                                valor={dadosNegociacao?.capa_projeto?.centro_resultado?.CR_ID || ""} // Usa CR_ID para identificar a seleção
                                aoAlterado={(valor) => {
                                    const centroSelecionado = centrosResultados.find(cr => cr.CR_ID === valor); // Busca o objeto pelo CR_ID
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        capa_projeto: {
                                            ...prev.capa_projeto,
                                            centro_resultado: centroSelecionado, // Salva o objeto completo no estado
                                        },
                                    }));
                                }}
                            />
                            <ListaSuspensa
                                label="Sócio Responsável"
                                name="socio_responsavel"
                                itens={socios.map((socio) => ({
                                    label: socio.displayName,
                                    value: socio.displayName,
                                }))} // Gera corretamente os itens do dropdown
                                obrigatorio={true}
                                valor={dadosNegociacao?.capa_projeto?.socio_responsavel?.nome || ""} // Sincroniza o valor corretamente
                                aoAlterado={handleSocioSelecionado}
                            />
                        </section>
                    )}

                    {/* Formação de Preço */}
                    {activeTab === 1 && (
                        <section>
                            <h2 className="text-xl pb-2 font-semibold">Formação de Preço</h2>

                            <ListaSuspensa
                                label="Tipo de Projeto"
                                name="tipo_projeto"
                                itens={tipoDeProjeto}
                                obrigatorio={true}
                                valor={dadosNegociacao?.formacao_preco?.tipo || ""}
                                aoAlterado={(valor) => {
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            tipo: valor,
                                        },
                                    }));

                                    // Atualiza o estado de visibilidade com base no valor selecionado
                                    setcampoProjetoAberto(valor === "Aberto");
                                }}
                            />
                            {dadosNegociacao?.formacao_preco?.tipo === "Fechado" && (
                                <CampoMonetario
                                    label="Valor do Projeto"
                                    name="valor"
                                    obrigatorio={true}
                                    valor={dadosNegociacao?.formacao_preco.valor || ""}
                                    aoAlterado={setValorProjeto}
                                    disabled={true}

                                />
                            )}
                            <CampoTextoLongo
                                label="Qual é o valor, e hora para faturamento de cada um dos agrupamentos"
                                name="faturamento_projeto_aberto"
                                placeholder="Descreva o objetivo do projeto..."
                                obrigatorio={true}
                                valor={
                                    campoProjetoAberto
                                        ? dadosNegociacao?.formacao_preco?.faturamento_projeto_aberto || ""
                                        : ""
                                }
                                aoAlterado={(valor) => {
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            faturamento_projeto_aberto: campoProjetoAberto ? valor : "",
                                        },
                                    }));
                                }}
                                display={campoProjetoAberto}
                            />
                            <ListaSuspensa
                                label="Limite de Horas ?"
                                name="existe_limite_horas"
                                itens={yorn}
                                obrigatorio={true}
                                valor={dadosNegociacao?.formacao_preco?.existe_limite_horas || ""}
                                aoAlterado={(valor) => {
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            existe_limite_horas: valor,
                                        },
                                    }));
                                    setcampoLimiteHoras(valor === "Sim");
                                }}
                                display={campoProjetoAberto}
                            />
                            <CampoTexto
                                label="Informe o Limite de Horas"
                                name="limite_total_horas"
                                placeholder="Digite o código do projeto"
                                obrigatorio={true}
                                valor={dadosNegociacao?.formacao_preco?.limite_total_horas || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            limite_total_horas: valor,
                                        },
                                    }))
                                }
                                display={campoLimiteHoras}
                            />
                            <ListaSuspensa
                                label="Empresa Faturamento"
                                name="empresa_faturamento"
                                itens={empresaFaturamento}
                                obrigatorio={true}
                                valor={dadosNegociacao?.formacao_preco?.empresa_faturamento || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            empresa_faturamento: valor,
                                        },
                                    }))
                                }
                            />
                            <ListaSuspensa
                                label="Recorrente?"
                                name="recorrente"
                                itens={yorn}
                                obrigatorio={true}
                                valor={dadosNegociacao?.formacao_preco?.recorrente || ""}
                                aoAlterado={(valor) => {
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco, // Corrigido para acessar o mesmo nível
                                            recorrente: valor,
                                        },
                                    }));
                                    setcampoRecorencia(valor === "Sim");
                                }}
                            />
                            <DateInput
                                label="Aniversário do Projeto"
                                name="aniversario_projeto"
                                obrigatorio={true}
                                value={dadosNegociacao?.formacao_preco?.aniversario_projeto || ""}
                                onChange={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            aniversario_projeto: valor,
                                        },
                                    }))
                                }
                                display={campoRecorencia}
                            />
                            <DateInput
                                label="Primeiro Faturamento"
                                name="primeiro_faturamento"
                                obrigatorio={true}
                                value={dadosNegociacao?.formacao_preco?.primeiro_faturamento || ""}
                                onChange={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            primeiro_faturamento: valor,
                                        },
                                    }))
                                }
                                display={campoRecorencia}
                            />
                            <ListaSuspensa
                                label="Comissionado"
                                name="comissionado"
                                obrigatorio={true}
                                itens={yorn}
                                valor={dadosNegociacao?.formacao_preco?.comissionado || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            comissionado: valor,
                                        },
                                    }))
                                }
                            />
                            {dadosNegociacao?.formacao_preco?.comissionado === "Sim" && (
                                <CampoTextoLongo
                                    label="Vendedor"
                                    name="regras_comissao"
                                    placeholder="Informe o nome do vendedor a ser Comissionado e descreva demais regras de Comissão..."
                                    obrigatorio={true}
                                    valor={dadosNegociacao?.formacao_preco?.regras_comissao || ""}
                                    aoAlterado={(valor) =>
                                        setDadosNegociacao((prev) => ({
                                            ...prev,
                                            formacao_preco: {
                                                ...prev.formacao_preco,
                                                regras_comissao: valor,
                                            },
                                        }))
                                    }
                                />
                            )}
                            <ListaSuspensa
                                label="Tem reajuste Anual?"
                                name="reajuste_anual"
                                obrigatorio={true}
                                itens={opReajusteAnual}
                                valor={dadosNegociacao?.formacao_preco?.reajuste_anual || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            reajuste_anual: valor,
                                        },
                                    }))
                                }
                            />
                            <ListaSuspensa
                                label="Tem Serviço de Parceiros ?"
                                name="tem_servico_parceiros"
                                obrigatorio={true}
                                itens={yorn}
                                valor={dadosNegociacao?.formacao_preco?.tem_servico_parceiros || ""}
                                aoAlterado={(valor) => {
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            tem_servico_parceiros: valor,
                                        },
                                    }));
                                    setcampoServicoParceiros(valor === "Sim")
                                }}
                            />
                            <CampoTexto
                                label="Nome do Parceiro"
                                name="nome_parceiro"
                                placeholder="Digite o código do projeto"
                                obrigatorio={true}
                                valor={dadosNegociacao?.formacao_preco?.nome_parceiro || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            nome_parceiro: valor,
                                        },
                                    }))
                                }
                                display={campoServicoParceiros}
                            />
                            <CampoMonetario
                                label="Valor a Ser Pago"
                                name="valor_parceiro"
                                obrigatorio={true}
                                valor={dadosNegociacao?.formacao_preco?.valor_parceiro || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            valor_parceiro: valor,
                                        },
                                    }))
                                }
                                display={campoServicoParceiros}
                            />
                            <CampoTextoLongo
                                label="Informe as condições de Pagamento ao Parceiro"
                                name="condicao_pagamento_parceiro"
                                placeholder="Descreva o objetivo do projeto..."
                                obrigatorio={true}
                                valor={dadosNegociacao?.formacao_preco?.condicao_pagamento_parceiro || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            condicao_pagamento_parceiro: valor,
                                        },
                                    }))
                                }
                                display={campoServicoParceiros}
                            />
                            {/* Possuí despesas? */}
                            <ListaSuspensa
                                label="Possuí despesas?"
                                name="possui_despesa"
                                obrigatorio={true}
                                itens={yorn} // ["Sim", "Não"]
                                valor={dadosNegociacao?.formacao_preco?.possui_despesa || ""}
                                aoAlterado={(valor) => {
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            possui_despesa: valor,
                                        },
                                    }));
                                    setcampoPossuiDespesa(valor === "Sim"); // Atualiza exibição condicional
                                }}
                            />

                            {/* Se possui despesas, exibir detalhes */}
                            {campoPossuiDespesa && (
                                <div className="space-y-4">
                                    {/* Quais despesas? */}
                                    <ListaComCheckboxComDetalhes
                                        label="Quais despesas devem ser consideradas?"
                                        obrigatorio={true}
                                        itens={[
                                            "Alimentação",
                                            "KM",
                                            "Estacionamento",
                                            "Transporte (Taxi, Uber, Onibus, Etc...)",
                                            "Passagens Aéreas",
                                            "Hospedagem",
                                            "Exames",
                                        ]}
                                        valoresIniciais={dadosNegociacao?.formacao_preco?.despesas_detalhes || []}
                                        aoAlterarPayload={(selecionados) => {
                                            setDadosNegociacao((prev) => ({
                                                ...prev,
                                                formacao_preco: {
                                                    ...prev.formacao_preco,
                                                    despesas_detalhes: selecionados,
                                                },
                                            }));
                                        }}
                                    />
                                    {/* Detalhes de como será cobrado se for "Sim" */}
                                    <CampoTextoLongo
                                        label="Como será cobrado?"
                                        name="como_cobrar_despesas"
                                        placeholder="(Opcional) Descreva como as despesas serão cobradas do cliente..."
                                        obrigatorio={false}
                                        valor={dadosNegociacao?.formacao_preco?.como_cobrar_despesas || ""}
                                        aoAlterado={(valor) =>
                                            setDadosNegociacao((prev) => ({
                                                ...prev,
                                                formacao_preco: {
                                                    ...prev.formacao_preco,
                                                    como_cobrar_despesas: valor,
                                                },
                                            }))
                                        }
                                    />
                                </div>
                            )}

                            {/* Possuí Horas Extras? */}
                            <ListaSuspensa
                                label="Possui Horas Extras?"
                                name="possui_horas_extras"
                                obrigatorio={true}
                                itens={yorn} // ["Sim", "Não"]
                                valor={dadosNegociacao?.formacao_preco?.possui_horas_extras || ""}
                                aoAlterado={(valor) => {
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            possui_horas_extras: valor,
                                        },
                                    }));
                                    setcampoHorasExtras(valor === "Sim"); // Controla exibição condicional
                                }}
                            />

                            {/* Regras de Horas Extras com Transição */}
                            <div
                                className={`transition-all duration-600 ease-in-out ${campoHorasExtras ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                                    }`}
                            >
                                {campoHorasExtras && (
                                    <CampoTextoLongo
                                        label="Regras de Horas Extras"
                                        name="regras_horas_extras"
                                        placeholder="Descreva as regras para cobrança de horas extras..."
                                        obrigatorio={true}
                                        valor={dadosNegociacao?.formacao_preco?.regras_horas_extras || ""}
                                        aoAlterado={(valor) =>
                                            setDadosNegociacao((prev) => ({
                                                ...prev,
                                                formacao_preco: {
                                                    ...prev.formacao_preco,
                                                    regras_horas_extras: valor,
                                                },
                                            }))
                                        }
                                    />
                                )}
                            </div>
                            <ListaSuspensa
                                label="Tem horas de deslocamento ?"
                                name="possui_horas_deslocamento"
                                obrigatorio={true}
                                itens={yorn}
                                valor={dadosNegociacao?.formacao_preco?.possui_horas_deslocamento || ""}
                                aoAlterado={(valor) => {
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            possui_horas_deslocamento: valor,
                                        },
                                    }));
                                    setcampoHorasDeslocamento(valor === "Sim");
                                }}
                            />
                            <CampoTexto
                                label="Informe as horas de Deslocamento"
                                name="horas_deslocamento"
                                placeholder="Digite o numero de horas a serem consideradas para deslocamento"
                                obrigatorio={true}
                                valor={dadosNegociacao?.formacao_preco?.horas_deslocamento || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            horas_deslocamento: valor,
                                        },
                                    }))
                                }
                                display={campoHorasDeslocamento}
                            />
                            <CampoTextoLongo
                                label="Regras de Deslocamento"
                                name="regras_horas_deslocamento"
                                placeholder="Descreva as regras para cobrança de horas de deslocamento,
                                Informar se está embutido no preço ? Informar se é cobrado do cliente, informar se é repassado ao consultor ..."
                                obrigatorio={true}
                                valor={dadosNegociacao?.formacao_preco?.regras_horas_deslocamento || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            regras_horas_deslocamento: valor,
                                        },
                                    }))
                                }
                                display={campoHorasDeslocamento}
                            />
                        </section>
                    )}

                    {/*Informações sobre Faturamento*/}
                    {activeTab === 2 && (
                        <section>
                            <h2 className="text-xl pb-2 font-semibold">Informações sobre Faturamento</h2>
                            <ListaSuspensa
                                label="Cliente Novo ?"
                                name="cliente_novo"
                                itens={yorn}
                                obrigatorio={true}
                                valor={dadosNegociacao?.faturamento?.cliente_novo || ""}
                                aoAlterado={(valor) => {
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        faturamento: {
                                            ...prev.faturamento,
                                            cliente_novo: valor,
                                        },
                                    }));
                                    setcampoClienteNovo(valor === "Sim");
                                }}
                            />
                            {dadosNegociacao?.faturamento?.cliente_novo === "Sim" && (
                                <CampoLink
                                    label="Ficha Cadastral"
                                    name="ficha_cadastral"
                                    obrigatorio={true}
                                    valor={dadosNegociacao?.faturamento?.ficha_cadastral || ""}
                                    aoAlterado={(valor) =>
                                        setDadosNegociacao((prev) => ({
                                            ...prev,
                                            faturamento: {
                                                ...prev.faturamento,
                                                ficha_cadastral: valor,
                                            },
                                        }))
                                    }
                                />
                            )}
                            <CampoTextoLongo
                                label="Email para envio de Faturamento"
                                name="email_envio_faturamento"
                                placeholder="Preencha -Seguir o Padrão- ou Informe para qual email deve ser direcionado os faturamentos ..."
                                obrigatorio={true}
                                valor={dadosNegociacao?.faturamento?.email_envio_faturamento || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        faturamento: {
                                            ...prev.faturamento,
                                            email_envio_faturamento: valor,
                                        },
                                    }))
                                }
                            />
                            {dadosNegociacao?.formacao_preco?.tipo === "Fechado" && (
                                <ListaSuspensa
                                    label="O Projeto possuí Marco/Etapas de Faturamento ?"
                                    name="possui_marco_faturamento"
                                    itens={yorn}
                                    obrigatorio={true}
                                    valor={dadosNegociacao?.faturamento?.possui_marco_faturamento || ""}
                                    aoAlterado={(valor) =>
                                        setDadosNegociacao((prev) => ({
                                            ...prev,
                                            faturamento: {
                                                ...prev.faturamento,
                                                possui_marco_faturamento: valor,
                                            },
                                        }))
                                    }
                                />

                            )}
                            <CampoTextoLongo
                                label="Descreva as regras para faturamento"
                                name="regras_cadastro_faturamento"
                                placeholder="Descreva as regras para cadastro dos Faturamentos..."
                                obrigatorio={true}
                                valor={dadosNegociacao?.faturamento?.regras_cadastro_faturamento || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        faturamento: {
                                            ...prev.faturamento,
                                            regras_cadastro_faturamento: valor,
                                        },
                                    }))
                                }
                            />
                            {/* Será Faturado no Aceite? */}
                            <ListaSuspensa
                                label="Será Faturado no Aceite?"
                                name="faturado_no_aceite"
                                itens={yorn}
                                obrigatorio={true}
                                valor={dadosNegociacao?.faturamento?.faturado_no_aceite || ""}
                                aoAlterado={(valor) => {
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        faturamento: {
                                            ...prev.faturamento,
                                            faturado_no_aceite: valor,
                                        },
                                    }));
                                }}
                            />

                            {/* Criar marco de aceite para aprovação? */}
                            {dadosNegociacao?.faturamento?.faturado_no_aceite === "Sim" && (
                                <ListaSuspensa
                                    label="Criar marco de aceite para aprovação?"
                                    name="marco_de_aceite"
                                    itens={["Sim", "Não (Faturar imediatamente)"]}
                                    obrigatorio={true}
                                    valor={dadosNegociacao?.faturamento?.marco_de_aceite || ""}
                                    aoAlterado={(valor) =>
                                        setDadosNegociacao((prev) => ({
                                            ...prev,
                                            faturamento: {
                                                ...prev.faturamento,
                                                marco_de_aceite: valor,
                                            },
                                        }))
                                    }
                                />
                            )}
                            <CampoTextoLongo
                                label="Forma de Pagamento"
                                name="forma_pagamento"
                                placeholder="Descreva de forma organizada as formas de pagamento ..."
                                obrigatorio={true}
                                valor={dadosNegociacao?.faturamento?.forma_pagamento || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        faturamento: {
                                            ...prev.faturamento,
                                            forma_pagamento: valor,
                                        },
                                    }))
                                }
                            />
                            <ListaSuspensa
                                label="Os Impostos estão inclusos no valor do projeto ?"
                                name="imposto_incluso"
                                itens={yorn}
                                obrigatorio={true}
                                valor={dadosNegociacao?.faturamento?.imposto_incluso || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        faturamento: {
                                            ...prev.faturamento,
                                            imposto_incluso: valor,
                                        },
                                    }))
                                }
                            />
                        </section>
                    )}

                    {/*Observações Gerais*/}
                    {activeTab === 3 && (
                        <section>
                            <h2 className="text-xl pb-2 font-semibold">Observações Gerais</h2>
                            <ObservacoesChat
                                observacoes={dadosNegociacao.observacoes || []} // Use o estado de observações
                                aoAdicionarObservacao={(novaObservacao) => {
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        observacoes: [...(prev?.observacoes || []), novaObservacao],
                                    }));
                                }}
                                aoRemoverObservacao={(index) => {
                                    setDadosNegociacao((prev) => {
                                        const novasObservacoes = [...(prev?.observacoes || [])];
                                        novasObservacoes.splice(index, 1);
                                        return { ...prev, observacoes: novasObservacoes };
                                    });
                                }}
                            />
                        </section>
                    )}
                </div>

                { }
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate("/comercial/warmup")}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded shadow hover:bg-gray-400 transition duration-200"
                    >
                        Voltar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition duration-200"
                    >
                        Salvar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormsWarmupComercial;