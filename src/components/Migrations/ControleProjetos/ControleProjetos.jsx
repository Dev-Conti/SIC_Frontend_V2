"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  IconButton,
} from "@material-tailwind/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { HiDotsHorizontal } from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
import useGroupMembers from "@/hooks/useGroupMembers";
import ModalDetalhesWarmup from "../ModalDetalhesWarmup/ModalDetalhesWarmup";

const SOCIOS_GROUP_ID = "718b8873-3ca9-4bd1-bd3d-6b657fe2cf80";

const ETAPA_OPTIONS = [
  "Warmup Comercial",
  "Warmup Projetos",
  "Warmup Financeiro",
  "Projeto Liberado",
  "Encerramento Financeiro",
  "Projeto Encerrado",
];

const STATUS_OPTIONS = ["Revisar", "Preenchendo", "Liberado", "Encerrado"];

const STATUS_COLORS = {
  Revisar: "text-amber-500",
  Preenchendo: "text-blue-400",
  Liberado: "text-green-400",
  Encerrado: "text-red-500",
};

const TABLE_HEAD = [
  "Gerente do Projeto",
  "Código do Projeto",
  "Centro de Resultados",
  "Valor",
  "Status",
  "Etapa",
  "Última Atualização",
  "Ações",
];

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateHora = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${formatDate(dateString)} ${hours}:${minutes}`;
};

const getStatusHistorico = (item) => {
  const historico = item?.status_historico;
  if (Array.isArray(historico) && historico.length > 0) {
    return [...historico].sort(
      (a, b) => new Date(b.alterado_em) - new Date(a.alterado_em)
    );
  }
  if (item?.inicio_warmup) {
    return [
      { status: item?.status, etapa: item?.etapa, alterado_em: item.inicio_warmup },
    ];
  }
  return [];
};

const formatCurrency = (rawValue) => {
  const value =
    rawValue && typeof rawValue === "object"
      ? Number(rawValue.$numberInt ?? rawValue.$numberDouble ?? 0)
      : Number(rawValue || 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const getStatusDisplay = (status) => {
  if (STATUS_COLORS[status]) {
    return { label: status, colorClass: STATUS_COLORS[status] };
  }
  return { label: "N/A", colorClass: "text-gray-500" };
};

const parseLocalDate = (yyyyMmDd) => new Date(`${yyyyMmDd}T00:00:00`);

const ControleProjetos = () => {
  const { user } = useAuth();
  const USER_NAME = user?.displayName;
  const { members: socios, loading: sociosLoading } = useGroupMembers(SOCIOS_GROUP_ID);

  const [dadosProjetos, setDadosProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroGerente, setFiltroGerente] = useState("");
  const [filtroCentroResultado, setFiltroCentroResultado] = useState("");
  const [filtroEtapa, setFiltroEtapa] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroDataDe, setFiltroDataDe] = useState("");
  const [filtroDataAte, setFiltroDataAte] = useState("");

  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  const [itemEncerramento, setItemEncerramento] = useState(null);
  const [itemHistorico, setItemHistorico] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

  const isSocio = useMemo(
    () => (socios || []).some((m) => m.displayName === USER_NAME || USER_NAME === "Desenvolvimento ConTI"),
    [socios, USER_NAME]
  );

  async function carregarProjetos() {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/warmup/listar`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }

      const data = await response.json();
      setDadosProjetos(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarProjetos();
  }, []);

  const linhasFiltradas = useMemo(() => {
    return dadosProjetos.filter((item) => {
      if (item?.etapa == null || item?.etapa === "Arquivado") {
        return false;
      }
      if (!isSocio && item?.capa_projeto?.gerente_projeto?.nome !== USER_NAME) {
        return false;
      }
      if (
        filtroCodigo &&
        !(item?.capa_projeto?.codigo || "")
          .toLowerCase()
          .includes(filtroCodigo.toLowerCase())
      ) {
        return false;
      }
      if (
        isSocio &&
        filtroGerente &&
        !(item?.capa_projeto?.gerente_projeto?.nome || "")
          .toLowerCase()
          .includes(filtroGerente.toLowerCase())
      ) {
        return false;
      }
      if (
        filtroCentroResultado &&
        !(item?.capa_projeto?.centro_resultado?.NOME || "")
          .toLowerCase()
          .includes(filtroCentroResultado.toLowerCase())
      ) {
        return false;
      }
      if (filtroEtapa && item?.etapa !== filtroEtapa) {
        return false;
      }
      if (filtroStatus && item?.status !== filtroStatus) {
        return false;
      }
      if (filtroDataDe || filtroDataAte) {
        if (!item?.inicio_warmup) return false;
        const d = new Date(item.inicio_warmup);
        const itemLocal = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        if (filtroDataDe && itemLocal < parseLocalDate(filtroDataDe)) return false;
        if (filtroDataAte && itemLocal > parseLocalDate(filtroDataAte)) return false;
      }
      return true;
    });
  }, [
    dadosProjetos,
    isSocio,
    USER_NAME,
    filtroCodigo,
    filtroGerente,
    filtroCentroResultado,
    filtroEtapa,
    filtroStatus,
    filtroDataDe,
    filtroDataAte,
  ]);

  const handleLimparFiltros = () => {
    setFiltroCodigo("");
    setFiltroGerente("");
    setFiltroCentroResultado("");
    setFiltroEtapa("");
    setFiltroStatus("");
    setFiltroDataDe("");
    setFiltroDataAte("");
  };

  const abrirDetalhes = (item) => setProjetoSelecionado(item);
  const fecharDetalhes = () => setProjetoSelecionado(null);

  const abrirConfirmEncerramento = (item) => setItemEncerramento(item);
  const cancelarConfirmEncerramento = () => setItemEncerramento(null);

  const abrirHistorico = (item) => setItemHistorico(item);
  const fecharHistorico = () => setItemHistorico(null);

  const enviarEmailNotificacaoEncerramento = async (item) => {
    // TODO: implementar via v2 backend
    const warmupUrl = `${window.location.origin}/financeiro/projetos`;
    const emailBody = `
      <p>Olá,</p>
      <p>Há uma solicitação de encerramento financeiro para o projeto <strong>${item?.capa_projeto?.codigo}</strong>.</p>
      <p>O formulário do Warmup está disponível para acompanhamento no Portal do SIC.</p>
      <p>Ou <a href="${warmupUrl}" target="_blank">Clique aqui para acessar</a></p>
      <p>Atenciosamente,<br>Equipe ConTI Consultoria</p>
    `;

    const emailResponse = await fetch(`${API_URL}/api/enviar-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_email: "warmup@conticonsultoria.com.br",
        recipient_email: "junia.mendes@conticonsultoria.com.br",
        subject: `Solicitação de Encerramento - Projeto ${item?.capa_projeto?.codigo}`,
        body_content: emailBody,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Erro ao enviar email: ${emailResponse.status} - ${errorText}`);
    }
  };

  const confirmarSolicitarEncerramento = async () => {
    try {
      const response = await fetch(
        `${API_URL}/warmup/atualizar/${itemEncerramento.negocio_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            etapa: "Encerramento Financeiro",
            status: "Aguardando",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao solicitar encerramento: ${response.statusText}`);
      }

      const itemConfirmado = itemEncerramento;
      await carregarProjetos();
      alert("Encerramento solicitado com sucesso!");
      try {
        await enviarEmailNotificacaoEncerramento(itemConfirmado);
      } catch (e) {
        console.error("Erro ao enviar email:", e);
      }
    } catch (err) {
      alert(`Erro ao solicitar encerramento: ${err.message}`);
    } finally {
      setItemEncerramento(null);
    }
  };

  const mostrarCarregando = loading || sociosLoading;

  return (
    <Card className="h-full w-full min-w-0">
      <CardHeader floated={false} shadow={false} className="mb-2 rounded-none p-4">
        <Typography variant="h4" className="pb-4">
          Controle de Projetos
        </Typography>
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-full sm:w-56">
            <Input
              label="Buscar Código"
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={filtroCodigo}
              onChange={(e) => setFiltroCodigo(e.target.value)}
            />
          </div>
          {isSocio && (
            <div className="w-full sm:w-56">
              <Input
                label="Gerente do Projeto"
                value={filtroGerente}
                onChange={(e) => setFiltroGerente(e.target.value)}
              />
            </div>
          )}
          <div className="w-full sm:w-56">
            <Input
              label="Centro de Resultado"
              value={filtroCentroResultado}
              onChange={(e) => setFiltroCentroResultado(e.target.value)}
            />
          </div>
          <select
            value={filtroEtapa}
            onChange={(e) => setFiltroEtapa(e.target.value)}
            className="p-2 border border-gray-300 rounded h-10 text-sm text-gray-700"
          >
            <option value="">Todas as Etapas</option>
            {ETAPA_OPTIONS.map((etapa) => (
              <option key={etapa} value={etapa}>
                {etapa}
              </option>
            ))}
          </select>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="p-2 border border-gray-300 rounded h-10 text-sm text-gray-700"
          >
            <option value="">Todos os Status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <div className="w-full sm:w-56">
            <Input
              type="date"
              label="Início Warmup De"
              value={filtroDataDe}
              onChange={(e) => setFiltroDataDe(e.target.value)}
              containerProps={{ className: "!min-w-0" }}
            />
          </div>
          <div className="w-full sm:w-56">
            <Input
              type="date"
              label="Início Warmup Até"
              value={filtroDataAte}
              onChange={(e) => setFiltroDataAte(e.target.value)}
              containerProps={{ className: "!min-w-0" }}
            />
          </div>
          <Button variant="text" color="gray" onClick={handleLimparFiltros}>
            Limpar Filtros
          </Button>
        </div>
      </CardHeader>

      {mostrarCarregando && (
        <p className="px-4 pb-4 text-sm font-medium text-gray-600">Carregando...</p>
      )}
      {!mostrarCarregando && error && (
        <p className="px-4 pb-4 text-sm font-medium text-red-500">Erro: {error}</p>
      )}
      {!mostrarCarregando && !error && linhasFiltradas.length === 0 && (
        <p className="px-4 pb-4 text-sm font-medium text-gray-600">
          Nenhum projeto retornado.
        </p>
      )}

      {!mostrarCarregando && !error && linhasFiltradas.length > 0 && (
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {linhasFiltradas.map((item) => {
                const statusDisplay = getStatusDisplay(item.status);
                const podeSolicitarEncerramento = item.etapa === "Projeto Liberado";
                const statusHistorico = getStatusHistorico(item);
                const ultimaAtualizacao = statusHistorico[0];

                return (
                  <tr key={item._id}>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Typography variant="small" className="truncate">
                        {item?.capa_projeto?.gerente_projeto?.nome || "N/A"}
                      </Typography>
                    </td>
                    <td className="px-3 py-3 max-w-[9rem]">
                      <Typography variant="small" className="font-bold truncate" title={item?.capa_projeto?.codigo}>
                        {item?.capa_projeto?.codigo}
                      </Typography>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Typography variant="small" className="truncate">
                        {item?.capa_projeto?.centro_resultado?.NOME || "N/A"}
                      </Typography>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Typography variant="small" className="truncate">
                        {formatCurrency(item?.formacao_preco?.valor)}
                      </Typography>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`font-semibold ${statusDisplay.colorClass}`}>
                        {statusDisplay.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Typography variant="small" className="truncate">
                        {item?.etapa}
                      </Typography>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Typography variant="small" className="truncate">
                        {ultimaAtualizacao ? formatDateHora(ultimaAtualizacao.alterado_em) : "-"}
                      </Typography>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <Menu placement="bottom-end">
                        <MenuHandler>
                          <IconButton variant="text" size="sm">
                            <HiDotsHorizontal className="h-5 w-5 text-gray-900" />
                          </IconButton>
                        </MenuHandler>
                        <MenuList>
                          <MenuItem
                            className="flex items-center gap-2"
                            onClick={() => abrirDetalhes(item)}
                          >
                            Ver Detalhes
                          </MenuItem>
                          <MenuItem
                            className="flex items-center gap-2"
                            onClick={() => abrirHistorico(item)}
                          >
                            Ver Histórico
                          </MenuItem>
                          {podeSolicitarEncerramento && (
                            <MenuItem
                              className="flex items-center gap-2"
                              onClick={() => abrirConfirmEncerramento(item)}
                            >
                              Solicitar Encerramento
                            </MenuItem>
                          )}
                        </MenuList>
                      </Menu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {projetoSelecionado && (
        <ModalDetalhesWarmup negociacao={projetoSelecionado} onClose={fecharDetalhes} />
      )}

      {itemEncerramento && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Confirmar Avançar Etapa</h2>
            <p className="mb-6">
              Tem certeza de que deseja solicitar o encerramento do projeto{" "}
              <strong>{itemEncerramento?.capa_projeto?.codigo}</strong>? A etapa será
              avançada para &quot;Encerramento Financeiro&quot;.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelarConfirmEncerramento}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded shadow hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarSolicitarEncerramento}
                className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {itemHistorico && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full max-h-[80vh] flex flex-col">
            <h2 className="text-lg font-semibold mb-4">
              Histórico de Status — {itemHistorico?.capa_projeto?.codigo}
            </h2>
            <ul className="space-y-2 overflow-y-auto mb-6">
              {getStatusHistorico(itemHistorico).map((entry, idx) => (
                <li key={idx} className="text-sm border-b border-gray-100 pb-2">
                  <span className="font-semibold">{entry?.status || "N/A"}</span>
                  {entry?.etapa && (
                    <>
                      {" — "}
                      <span>{entry.etapa}</span>
                    </>
                  )}
                  <div className="text-xs text-gray-500">{formatDateHora(entry?.alterado_em)}</div>
                </li>
              ))}
            </ul>
            <div className="flex justify-end">
              <button
                onClick={fecharHistorico}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded shadow hover:bg-gray-400 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ControleProjetos;
