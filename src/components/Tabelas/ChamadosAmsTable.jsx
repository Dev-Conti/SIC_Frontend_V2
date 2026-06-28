"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Input,
  Checkbox,
  CardHeader,
  Typography,
  Tooltip,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import { MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import useChamadosAms from "@/hooks/useChamadosAms";
import SpinnerModal from "../Modal/SpinnerModal";
import { RefreshDataButton } from "../Buttons/RefreshData";
import DetalhesChamadoAmsModal from "../Modal/DetalhesChamadoAmsModal";

const TABLE_HEAD = [
  { head: "Assunto", align: "left" },
  { head: "Data Criação", align: "left" },
  { head: "Status", align: "left" },
  { head: "Prioridade", align: "left" },
  { head: "Operador", align: "left" },
  { head: "Grupo", align: "left" },
  { head: "Ações", align: "center" },
];

export function ChamadosAmsTable() {
  const { chamados, loading, error, refresh } = useChamadosAms();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState([]);
  const [selectedChamado, setSelectedChamado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (chamado) => {
    setSelectedChamado(chamado);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedChamado(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      const headerHeight = 200;
      const rowHeight = 50;
      const availableHeight = height - headerHeight;
      const rows = Math.floor(availableHeight / rowHeight);
      setRowsPerPage(rows);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectAll = () => {
    const filteredIds = filteredRows.map(row => row.Chave);
    if (selectedRows.length === filteredIds.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredIds);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(row => row !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleStatusFilterChange = (status) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const sortedRows = [...chamados].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredRows = sortedRows.filter(row =>
    row.Assunto && row.Assunto.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter.length === 0 || statusFilter.includes(row.NomeStatus))
  );

  const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  if (error) return <div>Error: {error.message}</div>;

  const uniqueStatuses = [...new Set(chamados.map(chamado => chamado.NomeStatus))];

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Card className="h-full w-full">
      <SpinnerModal open={loading} onClose={() => {}} />
      <DetalhesChamadoAmsModal
        open={isModalOpen}
        onClose={handleCloseModal}
        chamado={selectedChamado}
      />
      <CardHeader floated={false} shadow={false} className="mb-2 rounded-none p-2">
        <div className="flex justify-between items-center w-full">
          <Input
            label="Buscar Assunto"
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            value={searchTerm}
            onChange={handleSearch}
            className="flex-grow"
          />
          <RefreshDataButton className="ml-4" onClick={refresh} />
        </div>
        <div className="flex justify-between items-center w-full mt-2">
          <Typography variant="small">
            {selectedRows.length > 0 ? `Selecionados: ${selectedRows.length}` : `Total de Chamados: ${filteredRows.length}`}
          </Typography>
          <Menu>
            <MenuHandler>
              <Button variant="text">Filtrar por Status</Button>
            </MenuHandler>
            <MenuList className="max-h-48 overflow-y-auto">
              {uniqueStatuses.map(status => (
                <MenuItem key={status} className="flex items-center gap-2">
                  <Checkbox
                    checked={statusFilter.includes(status)}
                    onChange={() => handleStatusFilterChange(status)}
                  />
                  <Typography variant="small">{status}</Typography>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {TABLE_HEAD.map(({ head, align }) => (
                <th key={head} className={`px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${align === "center" ? "text-center" : ""}`}>
                  <div className={`flex items-center gap-1 ${align === "center" ? "justify-center" : ""}`}>
                    {head === "Assunto" ? (
                      <Checkbox
                        checked={selectedRows.length === filteredRows.length}
                        onChange={handleSelectAll}
                      />
                    ) : null}
                    {head}
                    {head === "Data Criação" || head === "Prioridade" ? (
                      <button onClick={() => handleSort(head === "Data Criação" ? "DataCriacao" : "NomePrioridade")}>
                        {sortConfig.key === (head === "Data Criação" ? "DataCriacao" : "NomePrioridade") && sortConfig.direction === 'asc' ? (
                          <ChevronUpIcon className="h-4 w-4 text-gray-800" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4 text-gray-800" />
                        )}
                      </button>
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedRows.map(
              ({ Chave, Assunto, DataCriacao, NomeStatus, NomePrioridade, NomeOperador, NomeGrupo, Descricao, DataInicio, DataFim }) => (
                <tr key={Chave}>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Checkbox
                        checked={selectedRows.includes(Chave)}
                        onChange={() => handleSelectRow(Chave)}
                      />
                      <Typography variant="small" className="font-bold truncate">
                        {Assunto}
                      </Typography>
                    </div>
                  </td>
                  <td className="px-6 whitespace-nowrap">
                    <Typography variant="small" className="truncate">
                      {formatDate(DataCriacao)}
                    </Typography>
                  </td>
                  <td className="px-6 whitespace-nowrap">
                    <Typography variant="small" className="truncate">
                      {NomeStatus}
                    </Typography>
                  </td>
                  <td className="px-6 whitespace-nowrap">
                    <Typography variant="small" className="truncate">
                      {NomePrioridade}
                    </Typography>
                  </td>
                  <td className="px-6 whitespace-nowrap">
                    <Typography variant="small" className="truncate">
                      {NomeOperador}
                    </Typography>
                  </td>
                  <td className="px-6 whitespace-nowrap">
                    <Typography variant="small" className="truncate">
                      {NomeGrupo}
                    </Typography>
                  </td>
                  <td className="px-6 whitespace-nowrap text-center">
                    <Button variant="text" size="sm" onClick={() => handleOpenModal({ Chave, Assunto, DataCriacao, NomeStatus, NomePrioridade, NomeOperador, NomeGrupo, Descricao, DataInicio, DataFim })}>
                      Ver Detalhes
                    </Button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
        <div className="flex justify-between items-center p-4">
          <Button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Anterior
          </Button>
          <Typography variant="small">
            Página {currentPage} de {totalPages}
          </Typography>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>
    </Card>
  );
}
