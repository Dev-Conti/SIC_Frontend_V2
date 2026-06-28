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



// Componentes Reutilizáveis
const CampoMonetario = ({ label, name, obrigatorio, valor, aoAlterado, readOnly, disabled, display = true }) => {
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
const DateInput = ({ label, name, value, onChange, required = false, min, max, readOnly, disabled, display = true }) => {
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
                onChange={onChange}
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
const ListaComCheckbox = ({ label, itens, aoAlterarPayload, valoresIniciais = [], disabled = false }) => {
    const [selecionados, setSelecionados] = React.useState(valoresIniciais);

    useEffect(() => {
        setSelecionados(valoresIniciais); // Sincronizar com valores iniciais
    }, [valoresIniciais]);

    const aoSelecionar = (item) => {
        if (disabled) return; // Impede a alteração se estiver desabilitado
        const novosSelecionados = selecionados.includes(item)
            ? selecionados.filter((i) => i !== item)
            : [...selecionados, item];
        setSelecionados(novosSelecionados);
        aoAlterarPayload(novosSelecionados); // Atualiza o estado no componente pai
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
                            disabled={disabled} // Propagando a propriedade disabled
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


// Formulário Principal
const FormsWarmupFinanceiro = () => {
    const { userData } = useAuth(); // Obtém os dados do usuário logado
    const nomeUsuario = userData?.user?.displayName || ""; // Nome do usuário logado
    const { id } = useParams();
    const navigate = useNavigate();
    const [dadosNegociacao, setDadosNegociacao] = useState({
        observacoes: [],
        capa_projeto: {
            codigo: "",
            nome: "",
            objetivo_projeto: "",
            centro_resultado: null,
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


    const tabs = [
        "Capa do Projeto",
        "Formação de Preço",
        "Cronograma e Execução",
        "Adicionais do Projeto",
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
    const handleGerenteSelecionado = (valor) => {
        const gerente = ListaGerentesProjeto.find((g) => g.nome === valor);
        if (gerente) {
            setDadosNegociacao((prev) => ({
                ...prev,
                capa_projeto: {
                    ...prev.capa_projeto,
                    gerente_projeto: { nome: gerente.nome, email: gerente.email },
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
    
        // Construção do payload com os dados ajustados
        const respostas = {
            status: "Preenchendo",
            capa_projeto: {
                codigo: dadosNegociacao?.capa_projeto?.codigo || "",
                nome: dadosNegociacao?.capa_projeto?.nome || "",
                objetivo_projeto: dadosNegociacao?.capa_projeto?.objetivo_projeto || "",
                centro_resultado: dadosNegociacao?.capa_projeto?.centro_resultado || "",
                gerente_projeto: dadosNegociacao?.capa_projeto?.gerente_projeto || "",
            },
            formacao_preco: {
                valor: dadosNegociacao?.formacao_preco?.valor || "",
                tipo: dadosNegociacao?.formacao_preco?.tipo || "",
                faturamento_projeto_aberto: dadosNegociacao?.formacao_preco?.faturamento_projeto_aberto || "",
                existe_limite_horas: dadosNegociacao?.formacao_preco?.existe_limite_horas || "",
                limite_total_horas: dadosNegociacao?.formacao_preco?.limite_total_horas || "",
                empresa_faturamento: dadosNegociacao?.formacao_preco?.empresa_faturamento || "",
                recorrente: dadosNegociacao?.formacao_preco?.recorrente || "",
                aniversario_projeto: dadosNegociacao?.formacao_preco?.aniversario_projeto || "",
                primeiro_faturamento: dadosNegociacao?.formacao_preco?.primeiro_faturamento || "",
                formacao_atividade: dadosNegociacao?.formacao_preco?.formacao_atividade || "",
                comissionado: dadosNegociacao?.formacao_preco?.comissionado || "",
                reajuste_anual: dadosNegociacao?.formacao_preco?.reajuste_anual || "",
                tem_servico_parceiros: dadosNegociacao?.formacao_preco?.tem_servico_parceiros || "",
                nome_parceiro: dadosNegociacao?.formacao_preco?.nome_parceiro || "",
                valor_parceiro: dadosNegociacao?.formacao_preco?.valor_parceiro || "",
                condicao_pagamento_parceiro: dadosNegociacao?.formacao_preco?.condicao_pagamento_parceiro || "",
                possui_despesa: dadosNegociacao?.formacao_preco?.possui_despesa || "",
                despesas_detalhes: dadosNegociacao?.formacao_preco?.despesas_detalhes || [],
                limite_despesas: dadosNegociacao?.formacao_preco?.limite_despesas || "",
                despesa_cobrada_cliente: dadosNegociacao?.formacao_preco?.despesa_cobrada_cliente || "",
                como_cobrar_despesas: dadosNegociacao?.formacao_preco?.como_cobrar_despesas || "",
                possui_horas_extras: dadosNegociacao?.formacao_preco?.possui_horas_extras || "",
                regras_horas_extras: dadosNegociacao?.formacao_preco?.regras_horas_extras || "",
                possui_horas_deslocamento: dadosNegociacao?.formacao_preco?.possui_horas_deslocamento || "",
            },
            cronograma_execucao: {
                aprovacao_primeiro_nivel: dadosNegociacao?.cronograma_execucao?.aprovacao_primeiro_nivel || "",
                aprovador: dadosNegociacao?.cronograma_execucao?.aprovador || "",
                previsao_inicio: dadosNegociacao?.cronograma_execucao?.previsao_inicio || "",
                previsao_termino: dadosNegociacao?.cronograma_execucao?.previsao_termino || "",
                cronograma_fisico: dadosNegociacao?.cronograma_execucao?.cronograma_fisico || "",
                informar_atividades: dadosNegociacao?.cronograma_execucao?.informar_atividades || "",
                selecionados: profissionaisSelecionados,
                horas_alocadas: horasProfissionais,
            },
            adicionais_projeto: {
                pedido_compra: dadosNegociacao?.adicionais_projeto?.pedido_compra || "",
            },
            faturamento: {
                cliente_novo: dadosNegociacao?.faturamento?.cliente_novo || "",
                possui_marco_faturamento: dadosNegociacao?.faturamento?.possui_marco_faturamento || "",
                regras_cadastro_faturamento: dadosNegociacao?.faturamento?.regras_cadastro_faturamento || "",
                faturado_no_aceite: dadosNegociacao?.faturamento?.faturado_no_aceite || "",
                marco_de_aceite: dadosNegociacao?.faturamento?.marco_de_aceite || "",
                forma_pagamento: dadosNegociacao?.faturamento?.forma_pagamento || "",
                imposto_incluso: dadosNegociacao?.faturamento?.imposto_incluso || "",
                email_envio_faturamento: dadosNegociacao?.faturamento?.email_envio_faturamento || "",
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
                navigate("/financeiro/warmup", { replace: true });
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
            <form onSubmit={aoSalvar} className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-5">
                <div className="flex flex-col text-center justify-start max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold">Formulário Warmup - Etapa Financeiro</h1>
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
                            <CampoTextoLongo
                                label="Objetivo do Projeto"
                                name="objetivo_projeto"
                                placeholder="Descreva o objetivo do projeto..."
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
                                disabled={true}
                            />
                            <ListaSuspensa
                                label="Centro de Resultados"
                                name="centro_resultado"
                                itens={centrosResultados.map(cr => ({ value: cr.CR_ID, label: cr.NOME }))} // Opções do dropdown
                                obrigatorio
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
                                disabled={true}
                            />
                            <ListaSuspensa
                                label="Gerente do Projeto"
                                name="gerente_projeto"
                                itens={ListaGerentesProjeto.map((gerente) => ({
                                    label: gerente.nome,
                                    value: gerente.nome,
                                }))}
                                obrigatorio
                                valor={dadosNegociacao?.capa_projeto?.gerente_projeto?.nome || ""}
                                aoAlterado={handleGerenteSelecionado}
                                disabled={true}
                            />
                            <CampoTexto
                                label="Nome do Gerente"
                                name="nome_gerente"
                                readOnly
                                valor={dadosNegociacao?.capa_projeto?.gerente_projeto?.nome || ""}
                                display={false}
                                disabled={true}
                            />
                            <CampoTexto
                                label="E-mail do Gerente"
                                name="email_gerente"
                                readOnly
                                valor={dadosNegociacao?.capa_projeto?.gerente_projeto?.email || ""}
                                display={false}
                                disabled={true}
                            />
                        </section>
                    )}

                    {/* Formação de Preço */}
                    {activeTab === 1 && (
                        <section>
                            <h2 className="text-xl pb-2 font-semibold">Formação de Preço</h2>
                            <CampoMonetario
                                label="Valor do Projeto"
                                name="valor"
                                obrigatorio
                                valor={dadosNegociacao?.formacao_preco.valor || ""}
                                aoAlterado={setValorProjeto}
                                disabled={true}
                            />
                            <ListaSuspensa
                                label="Tipo de Projeto"
                                name="tipo_projeto"
                                itens={tipoDeProjeto}
                                obrigatorio
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
                                disabled={true}
                            />
                            <CampoTextoLongo
                                label="Qual é o valor, e hora para faturamento de cada um dos agrupamentos"
                                name="faturamento_projeto_aberto"
                                placeholder="Descreva o objetivo do projeto..."
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
                                disabled={true}
                            />
                            <ListaSuspensa
                                label="Limite de Horas ?"
                                name="existe_limite_horas"
                                itens={yorn}
                                obrigatorio
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
                                disabled={true}
                            />
                            <CampoTexto
                                label="Informe o Limite de Horas"
                                name="limite_total_horas"
                                placeholder="Digite o código do projeto"
                                obrigatorio
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
                                disabled={true}
                            />
                            <ListaSuspensa
                                label="Empresa Faturamento"
                                name="empresa_faturamento"
                                itens={empresaFaturamento}
                                obrigatorio
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
                                disabled={true}
                            />
                            <ListaSuspensa
                                label="Recorrente?"
                                name="recorrente"
                                itens={yorn}
                                obrigatorio
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
                                disabled={true}
                            />
                            <DateInput
                                label="Aniversário do Projeto"
                                name="aniversario_projeto"
                                valor={dadosNegociacao?.formacao_preco?.aniversario_projeto || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            aniversario_projeto: valor,
                                        },
                                    }))
                                }
                                display={campoRecorencia}
                                disabled={true}
                            />
                            <DateInput
                                label="Primeiro Faturamento"
                                name="primeiro_faturamento"
                                valor={dadosNegociacao?.formacao_preco?.primeiro_faturamento || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            primeiro_faturamento: valor,
                                        },
                                    }))
                                }
                                display={campoRecorencia}
                                disabled={true}
                            />
                            <CampoTextoLongo
                                label="Formação de Atividade"
                                name="formacao_atividade"
                                placeholder="Descreva a formação de atividades..."
                                valor={dadosNegociacao?.formacao_preco?.formacao_atividade || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            formacao_atividade: valor,
                                        },
                                    }))
                                }
                                disabled={true}
                            />
                            <ListaSuspensa
                                label="Comissionado"
                                name="comissionado"
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
                                disabled={true}
                            />
                            <ListaSuspensa
                                label="Tem reajuste Anual?"
                                name="reajuste_anual"
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
                                disabled={true}
                            />
                            <ListaSuspensa
                                label="Tem Serviço de Parceiros ?"
                                name="tem_servico_parceiros"
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
                                disabled={true}
                            />
                            <CampoTexto
                                label="Nome do Parceiro"
                                name="nome_parceiro"
                                placeholder="Digite o código do projeto"
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
                                disabled={true}
                            />
                            <CampoMonetario
                                label="Valor a Ser Pago"
                                name="valor_parceiro"
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
                                disabled={true}
                            />
                            <CampoTextoLongo
                                label="Informe as condições de Pagamento ao Parceiro"
                                name="condicao_pagamento_parceiro"
                                placeholder="Descreva o objetivo do projeto..."
                                valor={dadosNegociacao?.formacao_preco?.condicao_pagamento_parceiro || ""}
                                aoAlterado={(valor) => {
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            condicao_pagamento_parceiro: campoProjetoAberto ? valor : "",
                                        },
                                    }));
                                }}
                                display={campoServicoParceiros} />
                            <CampoTextoLongo
                                label="Formação de Atividade"
                                name="formacao_atividade"
                                placeholder="Descreva a formação de atividades..."
                                valor={dadosNegociacao?.formacao_preco?.formacao_atividade || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            formacao_atividade: valor,
                                        },
                                    }))
                                }
                                disabled={true}
                            />
                            {/* Possuí despesas? */}
                            <ListaSuspensa
                                label="Possuí despesas?"
                                name="possui_despesa"
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
                                disabled={true}
                            />

                            {/* Se possui despesas, exibir detalhes */}
                            {campoPossuiDespesa && (
                                <div className="space-y-4">
                                    {/* Quais despesas? */}
                                    <ListaComCheckbox
                                        label="Quais despesas devem ser consideradas?"
                                        itens={[
                                            "Alimentação",
                                            "KM",
                                            "Estacionamento",
                                            "Transporte",
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
                                        disabled={true} // Controla habilitação com base na lógica
                                    />
                                    {/* Limite total de despesas */}
                                    <CampoMonetario
                                        label="Qual é o limite total das despesas que deve ser cobrado?"
                                        name="limite_despesas"
                                        valor={dadosNegociacao?.formacao_preco?.limite_despesas || ""}
                                        aoAlterado={(valor) =>
                                            setDadosNegociacao((prev) => ({
                                                ...prev,
                                                formacao_preco: {
                                                    ...prev.formacao_preco,
                                                    limite_despesas: valor,
                                                },
                                            }))
                                        }
                                        disabled={true}
                                    />

                                    {/* Será cobrado do cliente? */}
                                    <ListaSuspensa
                                        label="Será cobrada do cliente?"
                                        name="despesa_cobrada_cliente"
                                        itens={yorn} // ["Sim", "Não"]
                                        valor={dadosNegociacao?.formacao_preco?.despesa_cobrada_cliente || ""}
                                        aoAlterado={(valor) => {
                                            setDadosNegociacao((prev) => ({
                                                ...prev,
                                                formacao_preco: {
                                                    ...prev.formacao_preco,
                                                    despesa_cobrada_cliente: valor,
                                                },
                                            }));
                                            setcampoCobrancaDespesa(valor === "Sim"); // Atualiza exibição condicional
                                        }}
                                        disabled={true}
                                    />

                                    {/* Detalhes de como será cobrado se for "Sim" */}
                                    {campoCobrancaDespesa && (
                                        <CampoTextoLongo
                                            label="Como será cobrado?"
                                            name="como_cobrar_despesas"
                                            placeholder="Descreva como as despesas serão cobradas do cliente..."
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
                                            disabled={true}
                                        />
                                    )}
                                    
                                </div>
                            )}

                            {/* Possuí Horas Extras? */}
                            <ListaSuspensa
                                label="Possuí Horas Extras?"
                                name="possui_horas_extras"
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
                                disabled={true}
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
                                        disabled={true}
                                    />
                                )}
                            </div>

                            <ListaSuspensa
                                label="Tem horas de deslocamento ?"
                                name="possui_horas_deslocamento"
                                itens={yorn}
                                valor={dadosNegociacao?.formacao_preco?.possui_horas_deslocamento || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        formacao_preco: {
                                            ...prev.formacao_preco,
                                            possui_horas_deslocamento: valor,
                                        },
                                    }))
                                }
                                disabled={true}
                            />
                        </section>
                    )}

                    {/* Cronograma e Execução */}
                    {activeTab === 2 && (
                        <section>
                            <h2 className="text-xl pb-2 font-semibold">Cronograma e Execução</h2>

                            {/* Haverá aprovação em primeiro nível? */}
                            <ListaSuspensa
                                label="Haverá Aprovação em Primeiro Nível?"
                                name="aprovacao_primeiro_nivel"
                                itens={yorn}
                                valor={dadosNegociacao?.cronograma_execucao?.aprovacao_primeiro_nivel || ""}
                                aoAlterado={(valor) => {
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        cronograma_execucao: {
                                            ...prev.cronograma_execucao,
                                            aprovacao_primeiro_nivel: valor,
                                        },
                                    }));
                                    setCampoAprovador(valor === "Sim"); // Mostra o campo "Quem será o aprovador?" se "Sim"
                                }}
                            />

                            {/* Quem será o aprovador? */}
                            {campoAprovador && (
                                <CampoTexto
                                    label="Quem será o aprovador?"
                                    name="aprovador"
                                    placeholder="Informe o nome do aprovador"
                                    valor={dadosNegociacao?.cronograma_execucao?.aprovador || ""}
                                    aoAlterado={(valor) =>
                                        setDadosNegociacao((prev) => ({
                                            ...prev,
                                            cronograma_execucao: {
                                                ...prev.cronograma_execucao,
                                                aprovador: valor,
                                            },
                                        }))
                                    }
                                />
                            )}

                            {/* Previsão de Início */}
                            <DateInput
                                label="Previsão de Início"
                                name="previsao_inicio"
                                value={dadosNegociacao?.cronograma_execucao?.previsao_inicio || ""}
                                onChange={(e) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        cronograma_execucao: {
                                            ...prev.cronograma_execucao,
                                            previsao_inicio: e.target.value,
                                        },
                                    }))
                                }
                            />
                            {/* Previsão de Término */}
                            <DateInput
                                label="Previsão de Término"
                                name="previsao_termino"
                                value={dadosNegociacao?.cronograma_execucao?.previsao_termino || ""}
                                onChange={(e) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        cronograma_execucao: {
                                            ...prev.cronograma_execucao,
                                            previsao_termino: e.target.value,
                                        },
                                    }))
                                }
                            />

                            {/* Cronograma Físico */}
                            <ListaSuspensa
                                label="Cronograma Físico"
                                name="cronograma_fisico"
                                itens={["Cadastro de Atividades", "Project"]}
                                valor={dadosNegociacao?.cronograma_execucao?.cronograma_fisico || ""}
                                aoAlterado={(valor) => {
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        cronograma_execucao: {
                                            ...prev.cronograma_execucao,
                                            cronograma_fisico: valor,
                                        },
                                    }));
                                    setCampoInformarAtividades(valor === "Cadastro de Atividades"); // Mostra "Informar Atividades" se "Cadastro de Atividades"
                                }}
                            />

                            {/* Informar Atividades */}
                            {campoInformarAtividades && (
                                <CampoTextoLongo
                                    label="Informar Atividades"
                                    name="informar_atividades"
                                    placeholder="Descreva as atividades..."
                                    valor={dadosNegociacao?.cronograma_execucao?.informar_atividades || ""}
                                    aoAlterado={(valor) =>
                                        setDadosNegociacao((prev) => ({
                                            ...prev,
                                            cronograma_execucao: {
                                                ...prev.cronograma_execucao,
                                                informar_atividades: valor,
                                            },
                                        }))
                                    }
                                />
                            )}

                            {/* Seleção de Profissionais */}
                            <h2 className="text-xl pb-2 font-semibold">Seleção de Profissionais</h2>
                            <ListaComCheckbox
                                label="Selecione os profissionais que serão alocados:"
                                itens={opProfissionaisAlocados}
                                valoresIniciais={profissionaisSelecionados}
                                aoAlterarPayload={(selecionados) => {
                                    setProfissionaisSelecionados(selecionados);

                                    const novasHoras = selecionados.map((profissional) => {
                                        const existente = horasProfissionais.find(
                                            (item) => item.profissional === profissional
                                        );
                                        return existente || { profissional, horas: "" };
                                    });
                                    setHorasProfissionais(novasHoras);

                                    // Atualiza o estado principal
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        cronograma_execucao: {
                                            ...prev.cronograma_execucao,
                                            selecionados,
                                            horas_alocadas: novasHoras,
                                        },
                                    }));
                                }}
                            />


                            {/* Tabela de Horas */}
                            {horasProfissionais.length > 0 ? (
                                <table className="pb-2 min-w-full bg-white border border-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 border-b">Profissional</th>
                                            <th className="px-4 py-2 border-b">Horas</th>
                                            <th className="px-4 py-2 border-b">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {horasProfissionais.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2 border-b">{item.profissional}</td>
                                                <td className="px-4 py-2 border-b">
                                                    <input
                                                        type="number"
                                                        value={item.horas}
                                                        onChange={(e) =>
                                                            handleAlterarHoras(index, e.target.value)
                                                        }
                                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 border-b text-center">
                                                    <button
                                                        onClick={() => handleRemoverProfissional(index)}
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
                                <p className="text-gray-500">Nenhum profissional selecionado.</p>
                            )}
                        </section>
                    )}

                    {/* Adicionais do Projeto */}
                    {activeTab === 3 && (
                        <section>
                            <ListaSuspensa
                                label="Obrigatório Informar pedido de Compra ?"
                                name="pedido_compra"
                                itens={yorn}
                                valor={dadosNegociacao?.adicionais_projeto?.pedido_compra || ""}
                                aoAlterado={(valor) => {
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        adicionais_projeto: {
                                            ...prev.adicionais_projeto,
                                            pedido_compra: valor,
                                        },
                                    }));
                                }}
                            />
                        </section>
                    )}

                    {/*Informações sobre Faturamento*/}
                    {activeTab === 4 && (
                        <section>
                            <h2 className="text-xl pb-2 font-semibold">Informações sobre Faturamento</h2>
                            <ListaSuspensa
                                label="Cliente Novo ?"
                                name="cliente_novo"
                                itens={yorn}
                                obrigatorio
                                valor={dadosNegociacao?.faturamento?.cliente_novo || ""}
                                aoAlterado={(valor) =>
                                    setDadosNegociacao((prev) => ({
                                        ...prev,
                                        faturamento: {
                                            ...prev.faturamento,
                                            cliente_novo: valor,
                                        },
                                    }))
                                }
                                disabled={true}
                            />
                            <CampoTextoLongo
                                label="Email para envio de Faturamento"
                                name="email_envio_faturamento"
                                placeholder="Informe para qual email deve ser direcionado os faturamentos ..."
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
                                disabled={true}
                            />
                            <ListaSuspensa
                                label="O Projeto possuí Marco/Etapas de Faturamento ?"
                                name="possui_marco_faturamento"
                                itens={yorn}
                                obrigatorio
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
                                disabled={true}
                            />
                            <CampoTextoLongo
                                label="Descreva as regras para faturamento"
                                name="regras_cadastro_faturamento"
                                placeholder="Descreva as regras para cadastro dos Faturamentos..."
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
                                disabled={true}
                            />
                            {/* Será Faturado no Aceite? */}
                            <ListaSuspensa
                                label="Será Faturado no Aceite?"
                                name="faturado_no_aceite"
                                itens={yorn}
                                obrigatorio
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
                                disabled={true}
                            />

                            {/* Criar marco de aceite para aprovação? */}
                            {dadosNegociacao?.faturamento?.faturado_no_aceite === "Sim" && (
                                <ListaSuspensa
                                    label="Criar marco de aceite para aprovação?"
                                    name="marco_de_aceite"
                                    itens={["Sim","Não (Faturar imediatamente)"]}
                                    obrigatorio
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
                                    disabled={true}
                                />
                            )}
                            <CampoTextoLongo
                                label="Forma de Pagamento"
                                name="forma_pagamento"
                                placeholder="Descreva de forma organizada as formas de pagamento ..."
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
                                disabled={true}
                            />
                            <ListaSuspensa
                                label="Os Impostos estão inclusos no valor do projeto ?"
                                name="imposto_incluso"
                                itens={yorn}
                                obrigatorio
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
                                disabled={true}
                            />
                        </section>
                    )}

                    {/*Observações Gerais*/}
                    {activeTab === 5 && (
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
                        onClick={() => navigate("/financeiro/warmup")}
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

export default FormsWarmupFinanceiro;