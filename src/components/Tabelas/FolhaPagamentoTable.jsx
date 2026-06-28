"use client";

import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { HiEllipsisVertical } from "react-icons/hi2";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  CardFooter,
  IconButton,
  Tooltip,
  Popover,
  PopoverHandler,
  PopoverContent,
  Checkbox,
  Chip,
  List,
  ListItem,
  ListItemPrefix
} from "@material-tailwind/react";
import useFolhaPagamentoAberta from "@/hooks/useFolhaPagamentoAberta";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ListaTipoRemuneracao from "@/data/ListaTipoRemuneracao";
import * as XLSX from 'xlsx';
import { BreadcrumbsDefault } from "../Breadcrumbs/BreadcrumbsDefault";

const TABLE_HEAD = [
  "Nome",
  "CPF",
  "Tipo de Remuneração",
  "Valor Fixo",
  "Taxa Hora",
  "Horas Proporcionais",
  "Apontamentos",
  "Valor Pagamento",
  "Ações"
];

const EXCEL_HEADERS = [
  "Nome do Colaborador",
  "CPF",
  "Tipo de Remuneração",
  "Valor Fixo",
  "Taxa por Hora",
  "Horas Proporcionais",
  "Total de Horas",
  "Valor do Pagamento"
];

const getFirstDayOfMonth = () => {
  const date = new Date();
  date.setDate(1);
  return date.toLocaleDateString('en-CA'); // ISO format (YYYY-MM-DD)
};

const getCurrentDate = () => {
  const date = new Date();
  return date.toLocaleDateString('en-CA'); // ISO format (YYYY-MM-DD)
};

const calculateTotal = (rows) => {
  return rows.reduce((acc, row) => acc + (row.valor_pagamento || 0), 0);
};

export default function FolhaPagamentoTabela() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dataInicial, setDataInicial] = useState(getFirstDayOfMonth());
  const [dataFinal, setDataFinal] = useState(getCurrentDate());
  const [periodo, setPeriodo] = useState({ data_inicial: getFirstDayOfMonth(), data_final: getCurrentDate() });
  const [tipoRemuneracao, setTipoRemuneracao] = useState([]);
  const rowsPerPage = 5;

  const { folha, loading, error, setParams, refresh } = useFolhaPagamentoAberta();
  
  const breadcrumbItems = [
    { name: "Home", path: "/user/dashboard" },
    { name: "Folha", path: "#" },
  ];

  useEffect(() => {
    handleFilter();
  }, []);

  const handleFilter = () => {
    setParams({ data_inicial: dataInicial, data_final: dataFinal, tipo_remuneracao: tipoRemuneracao });
    setPeriodo({ data_inicial: dataInicial, data_final: dataFinal });
  };

  const handleSelectAll = () => {
    if (tipoRemuneracao.length === ListaTipoRemuneracao.length) {
      setTipoRemuneracao([]);
    } else {
      setTipoRemuneracao(ListaTipoRemuneracao);
    }
  };

  const handleTipoRemuneracaoChange = (tipo) => {
    setTipoRemuneracao((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  };

  const formatCurrency = (value) => {
    return value ? `R$ ${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}` : '-';
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
  };

  const filteredRows = folha.filter((row) => {
    const matchesSearch = row.nome.toLowerCase().includes(search.toLowerCase());
    const matchesTipoRemuneracao = tipoRemuneracao.length ? tipoRemuneracao.includes(row.tipo_remuneracao) : true;
    return matchesSearch && matchesTipoRemuneracao;
  });

  const totalFolha = calculateTotal(folha);
  const subtotalFolha = calculateTotal(filteredRows);
  const isFiltered = search || tipoRemuneracao.length > 0 || dataInicial !== getFirstDayOfMonth() || dataFinal !== getCurrentDate();

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setDataInicial(getFirstDayOfMonth());
    setDataFinal(getCurrentDate());
    setTipoRemuneracao([]);
    setParams({ data_inicial: getFirstDayOfMonth(), data_final: getCurrentDate(), tipo_remuneracao: [] });
    setPeriodo({ data_inicial: getFirstDayOfMonth(), data_final: getCurrentDate() });
  };

  const exportToExcel = () => {
    const data = filteredRows.map(row => ({
      "Nome do Colaborador": row.nome,
      "CPF": row.cpf,
      "Tipo de Remuneração": row.tipo_remuneracao,
      "Valor Fixo": row.valor_fixo,
      "Taxa por Hora": row.taxa_hora,
      "Horas Proporcionais": row.horas_proporcionais,
      "Total de Horas": row.total_horas,
      "Valor do Pagamento": row.valor_pagamento
    }));

    const worksheet = XLSX.utils.json_to_sheet(data, { header: EXCEL_HEADERS });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Folha de Pagamento");
    XLSX.writeFile(workbook, "Folha_de_Pagamento.xlsx");
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar folha de pagamento: {error.message}</div>;

  return (
    <div className="h-full w-full p-6">
      <BreadcrumbsDefault items={breadcrumbItems} />
      <Card className="h-full w-full shadow-lg">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-8 flex items-center justify-between gap-8">
            <div>
              <Typography variant="h5" color="blue-gray">
                Folha de Pagamento {formatDate(periodo.data_inicial)} a {formatDate(periodo.data_final)}
              </Typography>
              <Typography color="gray" className="mt-1 font-normal">
                Informações detalhadas sobre a folha de pagamento
              </Typography>
            </div>
            <div className="flex gap-3 w-fulls">
              <Popover placement="bottom-start">
                <PopoverHandler>
                  <Button variant="outlined" className="w-38">
                    Tipo de Remuneração
                  </Button>
                </PopoverHandler>
                <PopoverContent className="max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <div className="flex items-center">
                      <Checkbox
                        checked={tipoRemuneracao.length === ListaTipoRemuneracao.length}
                        onChange={handleSelectAll}
                        className="mr-2 h-4 w-4"
                      />
                      <label>Marcar todos</label>
                    </div>
                    {ListaTipoRemuneracao.map((tipo) => (
                      <div key={tipo} className="flex items-center">
                        <Checkbox
                          checked={tipoRemuneracao.includes(tipo)}
                          onChange={() => handleTipoRemuneracaoChange(tipo)}
                          className="mr-2 h-4 w-4"
                        />
                        <label>{tipo}</label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Button variant="outlined" onClick={exportToExcel} className="flex-shrink-0 flex items-center gap-2">
                <i className="fas fa-file-excel"></i> Exportar Excel
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="w-full md:w-72">
              <Input
                label="Pesquisar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
            <div className="flex gap-4">
              <Input
                type="date"
                label="Data Inicial"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
              />
              <Input
                type="date"
                label="Data Final"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
              />
              <Button onClick={handleFilter} className="flex-shrink-0">Gerar</Button>
              <Button variant="text" onClick={handleClearFilters} className="flex-shrink-0">Limpar Filtros</Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-4">
          <div>
            <Chip
              variant="ghost"
              size="sm"
              value={folha.fechado ? "Fechado" : "Em Aberto"}
              color={folha.fechado ? "blue-gray" : "green"}
            />
          </div>
          <table className="mt-4 w-full table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal leading-none opacity-70"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((item, index) => {
                const isLast = index === paginatedRows.length - 1;
                const classes = isLast
                  ? "p-2"
                  : "p-2 border-b border-blue-gray-50";

                return (
                  <tr key={item.cpf}>
                    <td className={classes}>{item.nome}</td>
                    <td className={classes}>{item.cpf}</td>
                    <td className={classes}>{item.tipo_remuneracao}</td>
                    <td className={classes}>{formatCurrency(item.valor_fixo)}</td>
                    <td className={classes}>{formatCurrency(item.taxa_hora)}</td>
                    <td className={classes}>{item.horas_proporcionais || '-'}</td>
                    <td className={classes}>{item.total_horas || '-'}</td>
                    <td className={classes}>{formatCurrency(item.valor_pagamento)}</td>
                    <td className={classes}>
                      <Tooltip content="Ações">
                        <IconButton variant="text" color="blue-gray">
                          <HiEllipsisVertical className="h-5 w-5" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={TABLE_HEAD.length - 1} className="p-4 text-right font-bold">
                  {isFiltered ? `Subtotal: ${formatCurrency(subtotalFolha)}` : `Total da Folha: ${formatCurrency(totalFolha)}`}
                </td>
              </tr>
            </tfoot>
          </table>
        </CardBody>
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <Typography variant="small" color="blue-gray" className="font-normal">
            Página {currentPage} de {totalPages}
          </Typography>
          <div className="flex gap-2">
            <Button
              variant="outlined"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outlined"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Próximo
            </Button>
          </div>
        </CardFooter>
      </Card>
      <ToastContainer />
    </div>
  );
}