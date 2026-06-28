import { useEffect } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button } from "@material-tailwind/react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";


const DetalhesWarmupModal = ({ open, onClose, warmup }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open]);

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
    if (!warmup?.observacoes_gerais?.length) {
      return <p className="text-sm text-gray-600">Nenhuma observação registrada.</p>;
    }

    return (
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {warmup.observacoes_gerais
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

  const renderOutrosAnexos = () => {
    if (!warmup?.capa_projeto?.outros_anexos?.length) return null;

    return (
      <div className="">
        {warmup.capa_projeto.outros_anexos.map((anexo, index) => (
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

  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  };

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

    const codigo = warmup?.capa_projeto?.codigo || "resumo-warmup";
    doc.save(`${codigo}.pdf`);
  };

  const sections = [
    {
      title: "Identificação",
      data: [
        ["Negociação ID", warmup?.negocio_id || "-"],
        ["Etapa", warmup?.etapa || "-"],
        ["Status", warmup?.status || "-"],
        [
          "Início do Warm-up",
          new Date(
            warmup?.inicio_warmup?.$date?.$numberLong || warmup?.inicio_warmup
          ).toLocaleString() || "-",
        ],
        ["Cliente", warmup?.cliente?.nome || "-"],
      ],
    },
    {
      title: 'Capa do Projeto',
      data: [
        ['Código', warmup?.capa_projeto?.codigo || '-'],
        ['Nome', warmup?.capa_projeto?.nome || '-'],
        ['Vendedor', warmup?.capa_projeto?.nome_vendedor || '-'],
        ['Objetivo', warmup?.capa_projeto?.objetivo_projeto || '-'],
        ['Propsta Atual', warmup?.capa_projeto?.proposta_atual || '-'],
        ['Detalhes Negociação', warmup?.capa_projeto?.detalhes_warmup || '-'],
        ['Pedido de Compra', warmup?.capa_projeto?.pedido_compra || '-'],
        ['Link para o Pedido de Compra', warmup?.capa_projeto?.pedido_compra_atual || '-'],
        ['Formação de Preço Atual', warmup?.capa_projeto?.formacao_preco_atual || '-'],
        ['Centro de Resultado', warmup?.capa_projeto?.centro_resultado?.NOME || '-'],
        ['Sócio Responsável', warmup?.capa_projeto?.socio_responsavel?.nome || '-'],
        ['Gerente do Projeto', warmup?.capa_projeto?.gerente_projeto?.nome || '-'],
      ],
    },
    {
      title: 'Formação de Preço',
      data: [
        [
          'Valor do Projeto',
          warmup?.formacao_preco?.valor
            ? `R$ ${parseFloat(
              warmup?.formacao_preco?.valor?.$numberInt || warmup?.formacao_preco?.valor
            ).toLocaleString('pt-BR')}`
            : '-',
        ],
        ['Tipo', warmup?.formacao_preco?.tipo || '-'],
        ['Faturamento Projeto Aberto', warmup?.formacao_preco?.faturamento_projeto_aberto || '-'],
        ['Existe limite de Horas ?', warmup?.formacao_preco?.existe_limite_horas || '-'],
        ['Limite Total de Horas', warmup?.formacao_preco?.limite_total_horas || '-'],
        ['Empresa de Faturamento', warmup?.formacao_preco?.empresa_faturamento || '-'],
        ['Recorrente', warmup?.formacao_preco?.recorrente || '-'],
        ['Aniversário projeto', formatarData(warmup?.formacao_preco?.aniversario_projeto)],
        ['Primeiro Faturamento', formatarData(warmup?.formacao_preco?.primeiro_faturamento)],
        ['Comissionado', warmup?.formacao_preco?.comissionado || '-'],
        ['Reajuste Anual', warmup?.formacao_preco?.reajuste_anual || '-'],
        ['Tem Serviço de Parceiros', warmup?.formacao_preco?.tem_servico_parceiros || '-'],
        ['Nome do Parceiro', warmup?.formacao_preco?.nome_parceiro || '-'],
        [
          'Valor do Parceiro',
          warmup?.formacao_preco?.valor_parceiro
            ? `R$ ${parseFloat(
              warmup?.formacao_preco?.valor_parceiro?.$numberInt || warmup?.formacao_preco?.valor_parceiro
            ).toLocaleString('pt-BR')}`
            : '-',
        ],
        ['Condições de Pagamento ao Parceiro', warmup?.formacao_preco?.condicao_pagamento_parceiro || '-'],
        ['Possuí despesas?', warmup?.formacao_preco?.possui_despesa || '-'],
        ...(
          warmup?.formacao_preco?.despesas_detalhes?.length
            ? warmup.formacao_preco.despesas_detalhes.map(
              (despesa, index) => [
                `Despesa ${index + 1}`,
                `Nome: ${despesa.nome}, Valor: R$ ${parseFloat(despesa.valor).toLocaleString('pt-BR')}, Cobrar Cliente: ${despesa.cobrarCliente ? 'Sim' : 'Não'}`
              ]
            )
            : [['Despesa', '-']]
        ),
        [
          'Limite total das despesas que deve ser cobrado?',
          warmup?.formacao_preco?.limite_despesas
            ? `R$ ${parseFloat(
              warmup?.formacao_preco?.limite_despesas?.$numberInt || warmup?.formacao_preco?.limite_despesas
            ).toLocaleString('pt-BR')}`
            : '-',
        ],
        ['Será cobrada do cliente?', warmup?.formacao_preco?.despesa_cobrada_cliente || '-'],
        ['Como será cobrado?', warmup?.formacao_preco?.como_cobrar_despesas || '-'],
        ['Possuí Horas Extras?', warmup?.formacao_preco?.possui_horas_extras || '-'],
        ['Regras de Horas Extras', warmup?.formacao_preco?.regras_horas_extras || '-'],
        ['Tem horas de deslocamento ?', warmup?.formacao_preco?.possui_horas_deslocamento || '-'],
        ['Horas de deslocamento', warmup?.formacao_preco?.horas_deslocamento || '-'],
        ['Regras de deslocamento', warmup?.formacao_preco?.regras_horas_deslocamento || '-'],
      ],
    },
    {
      title: 'Cronograma de Execução',
      data: [
        ['Aprovação de Primeiro Nível', warmup?.cronograma_execucao?.aprovacao_primeiro_nivel || '-'],
        ['Aprovador', warmup?.cronograma_execucao?.aprovador || '-'],
        ['Previsão de Início', formatarData(warmup?.cronograma_execucao?.previsao_inicio)],
        ['Previsão de Término', formatarData(warmup?.cronograma_execucao?.previsao_termino)],
        ['Cronograma Físico', warmup?.cronograma_execucao?.cronograma_fisico || '-'],
        ['Atividades Informadas', warmup?.cronograma_execucao?.informar_atividades || '-'],
        ['Arquivo de MS Project', warmup?.cronograma_execucao?.caminho_project || '-'],
        [
          'Profissionais Selecionados',
          (warmup?.cronograma_execucao?.horas_alocadas || [])
            .map((h) => `${h.profissional}: ${h.horas}h`)
            .join(', ') || '-',
        ],
        ...(
          warmup?.cronograma_execucao?.atividades?.length
            ? warmup.cronograma_execucao.atividades.map(
              (atividade, index) => [
                `Atividade ${index + 1}`,
                `Nome: ${atividade.nome}, Recurso: ${atividade.recurso}, ${warmup?.formacao_preco?.tipo === "Aberto" ? `Taxa Hora: ${atividade.valor}` : `Limite de Horas: ${atividade.valor}`}`
              ]
            )
            : [['Atividade', '-']]
        ),
      ],
    },
    {
      title: 'Faturamento',
      data: [
        ['Cliente Novo', warmup?.faturamento?.cliente_novo || '-'],
        ['Ficha Cadastral', warmup?.faturamento?.ficha_cadastral || '-'],
        ['Contato Cliente', warmup?.faturamento?.contato_cliente || '-'],
        ['Email para envio de Faturamento', warmup?.faturamento?.email_envio_faturamento || '-'],
        ['Possui Marco de Faturamento', warmup?.faturamento?.possui_marco_faturamento || '-'],
        ['Regras de Cadastro de Marcos/Faturamento', warmup?.faturamento?.regras_cadastro_faturamento || '-'],
        ['Faturado no Aceite', warmup?.faturamento?.faturado_no_aceite || '-'],
        ['Marco de Aceite', warmup?.faturamento?.marco_de_aceite || '-'],
        ['Forma de Pagamento', warmup?.faturamento?.forma_pagamento || '-'],
        ['Imposto Incluso', warmup?.faturamento?.imposto_incluso || '-'],
      ],
    },
    {
      title: 'Outros Anexos',
      data: warmup?.capa_projeto?.outros_anexos?.map((anexo) => [
        anexo.nome,
        anexo.link
      ]) || [["-", "-"]],
    },
    {
      title: "Observações Gerais",
      data: warmup?.observacoes_gerais?.map((obs) => [
        `Usuário: ${obs.usuario}`,
        `${obs.data} - ${obs.texto}`,
      ]) || [["-", "-"]],
    },
  ];


  if (!warmup) return null;

  return (
    <Dialog open={open} handler={onClose} size="lg">
      <DialogHeader>Detalhes do Warm-up</DialogHeader>
      <DialogBody divider>
        <div className=" space-y-6 overflow-auto flex-1">
          {sections.map((section, sectionIndex) => {
            const visibleData = section.data.filter(([_, value]) => value && value !== "-");
            if (!visibleData.length) return null;
            return (
              <section key={sectionIndex}>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {section.title}
                </h3>
                {section.title === "Observações Gerais"
                  ? renderObservacoes()
                  : section.title === "Outros Anexos"
                    ? renderOutrosAnexos()
                    : visibleData.map(([label, value], dataIndex) => (
                      <div key={dataIndex}>
                        {renderField(label, value)}
                      </div>
                    ))}
              </section>
            );
          })}
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="blue" onClick={generatePDF}>
          Imprimir
        </Button>
        <Button variant="text" color="red" onClick={onClose}>
          Fechar
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DetalhesWarmupModal;
