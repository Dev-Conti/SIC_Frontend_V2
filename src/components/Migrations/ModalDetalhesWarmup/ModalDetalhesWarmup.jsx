import { useEffect } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const ModalDetalhesWarmup = ({ negociacao, onClose }) => {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);
    if (!negociacao) return null;

    const renderField = (label, value) => {
        if (!value || value === "-") return null;
        if (label === "Propsta Atual" || label === "Formação de Preço Atual" || label === "Link para o Pedido de Compra" || label === "Arquivo de MS Project" || label === "Ficha Cadastral") {
            return (
                <div className="text-sm text-gray-700">
                    <span className="font-semibold">{label}:</span>{" "}
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                        Acessar
                    </a>
                </div>
            );
        }
        return (
            <div className="text-sm text-gray-700">
                <span className="font-semibold">{label}:</span> {value}
            </div>
        );
    };

    const renderObservacoes = () => {
        if (!negociacao?.observacoes_gerais?.length) {
            return <p className="text-sm text-gray-600">Nenhuma observação registrada.</p>;
        }

        return (
            <div className="space-y-2 max-h-40 overflow-y-auto">
                {negociacao.observacoes_gerais
                    .slice()
                    .reverse()
                    .map((obs, index) => (
                        <div
                            key={index}
                            className="flex flex-col border-b pb-2 mb-2 last:border-none last:pb-0 last:mb-0"
                        >
                            <p className="text-xs text-gray-500">
                                <strong>{obs.usuario}</strong> - {obs.data}
                            </p>
                            <p className="text-sm text-gray-700">{obs.texto}</p>
                        </div>
                    ))}
            </div>
        );
    };

    const formatarData = (dataISO) => {
        if (!dataISO) return '-';
        const [ano, mes, dia] = dataISO.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const renderOutrosAnexos = () => {
        if (!negociacao?.capa_projeto?.outros_anexos?.length) return null;

        return (
            <div className="space-y-2">
                {negociacao.capa_projeto.outros_anexos.map((anexo, index) => (
                    <div key={index} className="text-sm text-gray-700">
                        <span className="font-semibold">{anexo.nome}:</span>{" "}
                        <a href={anexo.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                            Acesse
                        </a>
                    </div>
                ))}
            </div>
        );
    };

    const sections = [
        {
            title: "Identificação",
            data: [
                ["Negociação ID", negociacao?.negocio_id || "-"],
                ["Etapa", negociacao?.etapa || "-"],
                ["Status", negociacao?.status || "-"],
                [
                    "Início do Warm-up",
                    new Date(
                        negociacao?.inicio_warmup?.$date?.$numberLong || negociacao?.inicio_warmup
                    ).toLocaleString() || "-",
                ],
                ["Cliente", negociacao?.cliente?.nome || "-"],
            ],
        },
        {
            title: 'Capa do Projeto',
            data: [
                ['Código', negociacao?.capa_projeto?.codigo || '-'],
                ['Nome', negociacao?.capa_projeto?.nome || '-'],
                ['Vendedor', negociacao?.capa_projeto?.nome_vendedor || '-'],
                ['Objetivo', negociacao?.capa_projeto?.objetivo_projeto || '-'],
                ['Propsta Atual', negociacao?.capa_projeto?.proposta_atual || '-'],
                ['Detalhes Negociação', negociacao?.capa_projeto?.detalhes_negociacao || '-'],
                ['Pedido de Compra', negociacao?.capa_projeto?.pedido_compra || '-'],
                ['Link para o Pedido de Compra', negociacao?.capa_projeto?.pedido_compra_atual || '-'],
                ['Formação de Preço Atual', negociacao?.capa_projeto?.formacao_preco_atual || '-'],
                ['Centro de Resultado', negociacao?.capa_projeto?.centro_resultado?.NOME || '-'],
                ['Sócio Responsável', negociacao?.capa_projeto?.socio_responsavel?.nome || '-'],
                ['Gerente do Projeto', negociacao?.capa_projeto?.gerente_projeto?.nome || '-'],
            ],
        },
        {
            title: 'Formação de Preço',
            data: [
                [
                    'Valor do Projeto',
                    negociacao?.formacao_preco?.valor
                        ? `R$ ${parseFloat(
                            negociacao?.formacao_preco?.valor?.$numberInt || negociacao?.formacao_preco?.valor
                        ).toLocaleString('pt-BR')}`
                        : '-',
                ],
                ['Tipo', negociacao?.formacao_preco?.tipo || '-'],
                ['Faturamento Projeto Aberto', negociacao?.formacao_preco?.faturamento_projeto_aberto || '-'],
                ['Existe limite de Horas ?', negociacao?.formacao_preco?.existe_limite_horas || '-'],
                ['Limite Total de Horas', negociacao?.formacao_preco?.limite_total_horas || '-'],
                ['Empresa de Faturamento', negociacao?.formacao_preco?.empresa_faturamento || '-'],
                ['Recorrente', negociacao?.formacao_preco?.recorrente || '-'],
                ['Aniversário projeto', formatarData(negociacao?.formacao_preco?.aniversario_projeto)],
                ['Primeiro Faturamento', formatarData(negociacao?.formacao_preco?.primeiro_faturamento)],
                ['Comissionado', negociacao?.formacao_preco?.comissionado || '-'],
                ['Reajuste Anual', negociacao?.formacao_preco?.reajuste_anual || '-'],
                ['Tem Serviço de Parceiros', negociacao?.formacao_preco?.tem_servico_parceiros || '-'],
                ['Nome do Parceiro', negociacao?.formacao_preco?.nome_parceiro || '-'],
                [
                    'Valor do Parceiro',
                    negociacao?.formacao_preco?.valor_parceiro
                        ? `R$ ${parseFloat(
                            negociacao?.formacao_preco?.valor_parceiro?.$numberInt || negociacao?.formacao_preco?.valor_parceiro
                        ).toLocaleString('pt-BR')}`
                        : '-',
                ],
                ['Condições de Pagamento ao Parceiro', negociacao?.formacao_preco?.condicao_pagamento_parceiro || '-'],
                ['Possuí despesas?', negociacao?.formacao_preco?.possui_despesa || '-'],
                ...(
                    negociacao?.formacao_preco?.despesas_detalhes?.length
                        ? negociacao.formacao_preco.despesas_detalhes.map(
                            (despesa, index) => [
                                `Despesa ${index + 1}`,
                                `Nome: ${despesa.nome}, Valor: R$ ${parseFloat(despesa.valor).toLocaleString('pt-BR')}, Cobrar Cliente: ${despesa.cobrarCliente ? 'Sim' : 'Não'}`
                            ]
                        )
                        : [['Despesa', '-']]
                ),
                [
                    'Limite total das despesas que deve ser cobrado?',
                    negociacao?.formacao_preco?.limite_despesas
                        ? `R$ ${parseFloat(
                            negociacao?.formacao_preco?.limite_despesas?.$numberInt || negociacao?.formacao_preco?.limite_despesas
                        ).toLocaleString('pt-BR')}`
                        : '-',
                ],
                ['Será cobrada do cliente?', negociacao?.formacao_preco?.despesa_cobrada_cliente || '-'],
                ['Como será cobrado?', negociacao?.formacao_preco?.como_cobrar_despesas || '-'],
                ['Possuí Horas Extras?', negociacao?.formacao_preco?.possui_horas_extras || '-'],
                ['Regras de Horas Extras', negociacao?.formacao_preco?.regras_horas_extras || '-'],
                ['Tem horas de deslocamento ?', negociacao?.formacao_preco?.possui_horas_deslocamento || '-'],
                ['Horas de deslocamento', negociacao?.formacao_preco?.horas_deslocamento || '-'],
                ['Regras de deslocamento', negociacao?.formacao_preco?.regras_horas_deslocamento || '-'],            
            ],
        },
        {
            title: 'Cronograma de Execução',
            data: [
                ['Aprovação de Primeiro Nível', negociacao?.cronograma_execucao?.aprovacao_primeiro_nivel || '-'],
                ['Aprovador', negociacao?.cronograma_execucao?.aprovador || '-'],
                ['Previsão de Início', formatarData(negociacao?.cronograma_execucao?.previsao_inicio)],
                ['Previsão de Término', formatarData(negociacao?.cronograma_execucao?.previsao_termino)],
                ['Cronograma Físico', negociacao?.cronograma_execucao?.cronograma_fisico || '-'],
                ['Atividades Informadas', negociacao?.cronograma_execucao?.informar_atividades || '-'],
                ['Arquivo de MS Project', negociacao?.cronograma_execucao?.caminho_project || '-'],
                [
                    'Profissionais Selecionados',
                    (negociacao?.cronograma_execucao?.horas_alocadas || [])
                        .map((h) => `${h.profissional}: ${h.horas}h`)
                        .join(', ') || '-',
                ],
                ...(
                    negociacao?.cronograma_execucao?.atividades?.length
                        ? negociacao.cronograma_execucao.atividades.map(
                            (atividade, index) => [
                                `Atividade ${index + 1}`,
                                `Nome: ${atividade.nome}, Recurso: ${atividade.recurso}, ${negociacao?.formacao_preco?.tipo === "Aberto" ? `Taxa Hora: ${atividade.valor}` : `Limite de Horas: ${atividade.valor}`}`
                            ]
                        )
                        : [['Atividade', '-']]
                ),
            ],
        },
        {
            title: 'Faturamento',
            data: [
                ['Cliente Novo', negociacao?.faturamento?.cliente_novo || '-'],
                ['Ficha Cadastral', negociacao?.faturamento?.ficha_cadastral || '-'],
                ['Contato Cliente', negociacao?.faturamento?.contato_cliente || '-'],
                ['Email para envio de Faturamento', negociacao?.faturamento?.email_envio_faturamento || '-'],
                ['Possui Marco de Faturamento', negociacao?.faturamento?.possui_marco_faturamento || '-'],
                ['Regras de Cadastro de Marcos/Faturamento', negociacao?.faturamento?.regras_cadastro_faturamento || '-'],
                ['Faturado no Aceite', negociacao?.faturamento?.faturado_no_aceite || '-'],
                ['Marco de Aceite', negociacao?.faturamento?.marco_de_aceite || '-'],
                ['Forma de Pagamento', negociacao?.faturamento?.forma_pagamento || '-'],
                ['Imposto Incluso', negociacao?.faturamento?.imposto_incluso || '-'],
            ],
        },
        {
            title: 'Outros Anexos',
            data: negociacao?.capa_projeto?.outros_anexos?.map((anexo) => [
                anexo.nome,
                anexo.link
            ]) || [["-", "-"]],
        },
        {
            title: "Observações Gerais",
            data: negociacao?.observacoes_gerais?.map((obs) => [
                `Usuário: ${obs.usuario}`,
                `${obs.data} - ${obs.texto}`,
            ]) || [["-", "-"]],
        },
    ];

    const generatePDF = async () => {
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const logoPath = "/imagens/ConTI_original.jpg";
    
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 30; // Margem superior ajustada
        const bottomMargin = 40; // Margem inferior adicionada
        const maxWidth = pageWidth - margin * 2;
        const lineHeight = 14;
        let currentY = margin;
    
        // Carregar logo
        const imgData = await fetch(logoPath)
            .then((res) => res.blob())
            .then((blob) => new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            }));
    
        doc.addImage(imgData, "JPEG", margin, currentY, 100, 40);
        currentY += 60;
    
        // Título
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Resumo do Warm-up", pageWidth / 2, currentY, { align: "center" });
        currentY += 20;
    
        sections.forEach((section) => {
            const visibleData = section.data.filter(([_, value]) => value && value !== "-");
    
            if (visibleData.length) {
                // Verifica espaço antes de adicionar título da seção
                if (currentY + 30 > pageHeight - bottomMargin) {
                    doc.addPage();
                    currentY = margin;
                }
    
                // Título da seção
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text(section.title, margin, currentY);
                currentY += 16;
    
                doc.setDrawColor(200, 200, 200);
                doc.line(margin, currentY, pageWidth - margin, currentY);
                currentY += 10;
    
                // Dados da seção
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
    
                // Renderiza "Observações Gerais" em ordem inversa
                const dataToRender = section.title === "Observações Gerais" ? visibleData.slice().reverse() : visibleData;
    
                dataToRender.forEach(([label, value]) => {
                    // Verifica se precisa de uma nova página antes de adicionar mais conteúdo
                    if (currentY + lineHeight > pageHeight - bottomMargin) {
                        doc.addPage();
                        currentY = margin;
                    }
    
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const match = value.match(urlRegex);
    
                    if (match) {
                        // Se houver um link
                        const link = match[0];
    
                        // Label
                        doc.setFont("helvetica", "bold");
                        doc.text(label, margin, currentY);
                        currentY += lineHeight;
    
                        // Link
                        doc.setFont("helvetica", "normal");
                        doc.setTextColor(0, 0, 255);
                        doc.textWithLink("Clique aqui", margin, currentY, { url: link });
                        doc.setTextColor(0, 0, 0);
                        currentY += lineHeight;
                    } else {
                        // Se o label for menor que 20 caracteres, mantém na mesma linha
                        const labelWidth = doc.getTextWidth(label + ": ");
                        const valueWidth = doc.getTextWidth(value);
    
                        if (label.length < 20 && labelWidth + valueWidth <= maxWidth) {
                            doc.setFont("helvetica", "bold");
                            doc.text(label + ": ", margin, currentY);
                            doc.setFont("helvetica", "normal");
                            doc.text(value, margin + labelWidth + 5, currentY);
                            currentY += lineHeight;
                        } else {
                            // Caso contrário, quebra a linha
                            const splitLabel = doc.splitTextToSize(`${label}:`, maxWidth);
                            splitLabel.forEach((line, index) => {
                                if (currentY + lineHeight > pageHeight - bottomMargin) {
                                    doc.addPage();
                                    currentY = margin;
                                }
                                doc.setFont("helvetica", index === 0 ? "bold" : "normal");
                                doc.text(line, margin, currentY);
                                currentY += lineHeight;
                            });
    
                            const splitValue = doc.splitTextToSize(value, maxWidth);
                            splitValue.forEach((line) => {
                                if (currentY + lineHeight > pageHeight - bottomMargin) {
                                    doc.addPage();
                                    currentY = margin;
                                }
                                doc.setFont("helvetica", "normal");
                                doc.text(line, margin, currentY);
                                currentY += lineHeight;
                            });
                        }
                    }
    
                    currentY += 3; // Espaçamento entre os itens
                });
    
                currentY += 20; // Espaçamento entre seções
            }
        });
    
        // Garantir margem inferior
        if (currentY + bottomMargin > pageHeight) {
            doc.addPage();
        }
    
        doc.save("resumo-warmup.pdf");
    };
    
    
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-hidden">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl h-[80vh] flex flex-col">
                <div className="flex items-center justify-between bg-gray-100 px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Detalhes do Warm-up</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 text-2xl focus:outline-none"
                    >
                        &times;
                    </button>
                </div>
                <div className="p-6 space-y-6 overflow-auto flex-1">
                    {sections.map((section) => {
                        const visibleData = section.data.filter(([_, value]) => value && value !== "-");
                        if (!visibleData.length) return null;
                        return (
                            <section key={section.title}>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {section.title}
                                </h3>
                                {section.title === "Observações Gerais"
                                    ? renderObservacoes()
                                    : section.title === "Outros Anexos"
                                    ? renderOutrosAnexos()
                                    : visibleData.map(([label, value]) => renderField(label, value))}
                            </section>
                        );
                    })}
                </div>
                <div className="flex justify-between bg-gray-100 px-6 py-4 border-t">
                    <button
                        onClick={generatePDF}
                        className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 focus:outline-none transition"
                    >
                        Gerar PDF
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 focus:outline-none transition"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalDetalhesWarmup;
