import { useState, useEffect } from "react";
import {
  Card,
  Input,
  CardHeader,
  Typography,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  IconButton,
} from "@material-tailwind/react";
import { MagnifyingGlassIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import useWarmup from "@/hooks/useWarmup";
import SpinnerModal from "../Modal/SpinnerModal";
import DetalhesWarmupModal from "../Modal/DetalhesWarmupModal";
import { RefreshDataButton } from "../Buttons/RefreshData";
import { HiDotsHorizontal, HiOutlineEye, HiOutlineFolder, HiOutlineArrowRight, HiOutlineArrowLeft } from "react-icons/hi";

const TABLE_HEAD = [
  { head: "Código", align: "left" },
  { head: "Cliente", align: "left" },
  { head: "Valor", align: "left" },
  { head: "Status", align: "left" },
  { head: "Responsável Comercial", align: "left" },
  { head: "Data Início", align: "left" },
  { head: "Ações", align: "center" },
];

export function WarmupServicosTable() {
  const { data: warmupData, loading, error, fetchWarmupData } = useWarmup();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChamado, setSelectedChamado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedResponsavel, setSelectedResponsavel] = useState("");

  useEffect(() => {
    fetchWarmupData("Warmup Projetos");
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      const headerHeight = 200; // Altura aproximada do cabeçalho e outros elementos
      const rowHeight = 50; // Altura aproximada de cada linha da tabela
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

  const handleOpenModal = (chamado) => {
    setSelectedChamado(chamado);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedChamado(null);
    setIsModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleResponsavelChange = (event) => {
    setSelectedResponsavel(event.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("");
    setSelectedResponsavel("");
  };

  const uniqueStatuses = [...new Set(warmupData.map(row => row.status))];
  const uniqueResponsaveis = [...new Set(warmupData.map(row => row.responsaveis.responsavel_comercial.nome))];

  const filteredRows = warmupData.filter(row =>
    row.capa_projeto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedStatus === "" || row.status === selectedStatus) &&
    (selectedResponsavel === "" || row.responsaveis.responsavel_comercial.nome === selectedResponsavel)
  );

  const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (error) return <div>Error: {error.message}</div>;

  return (
    <Card className="h-full w-full">
      <SpinnerModal open={loading} onClose={() => { }} />
      <DetalhesWarmupModal
        open={isModalOpen}
        onClose={handleCloseModal}
        warmup={selectedChamado}
      />
      <CardHeader floated={false} shadow={false} className="mb-2 rounded-none p-2">
        <Typography variant="h4" className="pb-6">Warmup Serviços</Typography>
        <div className="flex justify-between items-center w-full">
          <Input
            label="Buscar Código"
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            value={searchTerm}
            onChange={handleSearch}
            className="flex-grow"

          />
          <select value={selectedStatus} onChange={handleStatusChange} className="ml-4 p-2 border rounded">
            <option value="">Todos os Status</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select value={selectedResponsavel} onChange={handleResponsavelChange} className="ml-4 p-2 border rounded">
            <option value="">Todos os Responsáveis</option>
            {uniqueResponsaveis.map(responsavel => (
              <option key={responsavel} value={responsavel}>{responsavel}</option>
            ))}
          </select>

        </div>
        <div className="flex justify-between items-center w-full mt-4">
          <Typography variant="small">
            Total de Processos: {filteredRows.length}
          </Typography>
          <Button variant="text" color="gray" onClick={handleClearFilters}>
            Limpar Filtros
          </Button>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {TABLE_HEAD.map(({ head, align }) => (
                <th key={head} className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${align === "center" ? "text-center" : ""}`}>
                  <div className={`flex items-center gap-1 ${align === "center" ? "justify-center" : ""}`}>
                    {head}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedRows.map(
              ({ _id, capa_projeto, cliente, formacao_preco, status, responsaveis, inicio_warmup }) => (
                <tr key={_id}>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <Typography variant="small" className="font-bold truncate">
                      {capa_projeto.codigo}
                    </Typography>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <Typography variant="small" className="truncate">
                      {cliente.nome}
                    </Typography>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <Typography variant="small" className="truncate">
                      {formacao_preco.valor}
                    </Typography>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <Typography variant="small" className="truncate">
                      {status}
                    </Typography>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <Typography variant="small" className="truncate">
                      {responsaveis.responsavel_comercial.nome}
                    </Typography>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <Typography variant="small" className="truncate">
                      {formatDate(inicio_warmup)}
                    </Typography>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-center">
                    <Menu placement="bottom-end">
                      <MenuHandler>
                        <IconButton variant="text" size="sm">
                          <HiDotsHorizontal className="h-6 w-6 text-gray-900" />
                        </IconButton>
                      </MenuHandler>
                      <MenuList>
                        <MenuItem className="hover:bg-gray-200 flex items-center gap-2 transition-transform transform hover:scale-105 active:scale-95" onClick={() => handleOpenModal({ _id, capa_projeto, cliente, formacao_preco, status, responsaveis, inicio_warmup })}>
                          <HiOutlineEye /> Ver detalhes
                        </MenuItem>
                        <MenuItem className="hover:bg-gray-200 flex items-center gap-2 transition-transform transform hover:scale-105 active:scale-95">
                          <HiOutlineFolder /> Abrir Formulário
                        </MenuItem>
                        <MenuItem className="hover:bg-gray-200 flex items-center gap-2 transition-transform transform hover:scale-105 active:scale-95">
                          <HiOutlineArrowRight /> Avançar Etapa
                        </MenuItem>
                        <MenuItem className="hover:bg-gray-200 flex items-center gap-2 transition-transform transform hover:scale-105 active:scale-95">
                          <HiOutlineArrowLeft /> Voltar Etapa
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
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
    </Card>
  );
}

export default WarmupServicosTable;
