import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import {
  Card,
  Input,
  Checkbox,
  CardHeader,
  IconButton,
  Typography,
  Tooltip,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import useBacklogGanhos from "@/hooks/useBacklogGanhos";
import SpinnerModal from "../Modal/SpinnerModal";
import { RefreshDataButton } from "../Buttons/RefreshData";
import { HiDotsHorizontal } from "react-icons/hi";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationModal from "../Modal/ConfirmationModal";
import CustomPopup from "../Popup/CustomPopup";
import InfoButton from "../Buttons/InfoButton";
import { useDataContext } from "@/app/comercial/layout"; // Import the useDataContext hook
import CustomWarmupModal from "../Modal/CustomWarmupModal"; // Import the new CustomWarmupModal

const DicaCheckbox = () => (
  <div>
    <strong>Dica:</strong>
    <p>Você pode utilizar a busca de projetos ou o filtro de vendedores, selecionar vários itens e iniciar ou arquivar em massa.</p>
  </div>
);

const TABLE_HEAD = [
  {
    head: "PROJETO",
    icon: <Checkbox />,
    align: "left",
    width: "auto",
  },
  {
    head: "VENDEDOR",
    align: "left",
    width: "300px",
  },
  {
    head: "DATA FECHAMENTO",
    align: "left",
    width: "300px",
  },
  {
    head: "VALOR DO PROJETO",
    align: "left",
    width: "200px",
  },
  {
    head: "AÇÕES",
    align: "center",
    width: "100px",
  },
];

export function BacklogGanhos({ baseRoute }) {
  const { members } = useDataContext(); // Use the useDataContext hook to get members
  const { ganhos, loading, error, refresh, updateBacklog, updating, fetchGanhos } = useBacklogGanhos();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [negociacaoToDelete, setNegociacaoToDelete] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupSeverity, setPopupSeverity] = useState("");
  const [showBulkActionMenu, setShowBulkActionMenu] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [showWarmupModal, setShowWarmupModal] = useState(false);
  const [warmupMembers, setWarmupMembers] = useState([]);
  const [selectedWarmupMember, setSelectedWarmupMember] = useState(null); // Update state to store member object
  const [selectedRowData, setSelectedRowData] = useState(null); // Add state to store selected row data

  const totalGains = ganhos.length;

  const uniqueSellers = [...new Set(ganhos.map(gain => gain.user.name))];

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

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectAll = () => {
    const filteredIds = filteredRows.map(row => row._id);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedRows = [...ganhos].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSellerFilterChange = (event) => {
    setSelectedSeller(event.target.value);
  };

  const filteredRows = sortedRows.filter(row => {
    const matchesSearchTerm = row.name && row.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeller = selectedSeller === "" || row.user.name === selectedSeller;
    return matchesSearchTerm && matchesSeller;
  });

  const totalFilteredGains = filteredRows.length;

  const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  const handleDeleteClick = (id) => {
    setNegociacaoToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteModal(false); // Close the modal
    const idsToDelete = negociacaoToDelete ? [negociacaoToDelete] : selectedRows;
    const updatedGanhos = ganhos.filter(gain => !idsToDelete.includes(gain._id));
    setGanhos(updatedGanhos); // Update the ganhos state directly
    setSelectedRows([]);
    setNegociacaoToDelete(null);
    setPopupMessage("Documento(s) removido(s) com sucesso.");
    setPopupSeverity("success");
  };

  const handleWarmupStart = (id) => {
    console.log("Members in handleWarmupStart:", members); // Add this line to log members in the function
    const selectedRow = ganhos.find(gain => gain._id === id); // Get the selected row data
    setSelectedRowData(selectedRow); // Store the selected row data
    if (members && members.length > 0) {
      setShowWarmupModal(true);
    } else {
      setPopupMessage("Nenhum membro disponível para iniciar warmup.");
      setPopupSeverity("error");
    }
  };

  const handleWarmupConfirm = async () => {
    console.log("Warmup iniciado por:", selectedWarmupMember);
    setShowWarmupModal(false);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/comercial/iniciar-warmup`, {
        responsavel: selectedWarmupMember.displayName,
        email_responsavel: selectedWarmupMember.email,

        negocio_id: selectedRowData.id,
        codigo_projeto: selectedRowData.name,
        valor: selectedRowData.amount_total,
        cliente_nome: selectedRowData.organization?.name || 'N/A',
        cliente_id: selectedRowData.organization?.id || 'N/A',
        nome_vendedor: selectedRowData.user?.name || 'N/A',
        email_vendedor: selectedRowData.user?.email || 'N/A',
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setPopupMessage("Warmup iniciado com sucesso.");
        setPopupSeverity("success");
        refresh(); // Recarregar os dados
      } else {
        setPopupMessage("Erro ao iniciar warmup.");
        setPopupSeverity("error");
      }
    } catch (error) {
      console.error("Erro ao iniciar warmup:", error);
      setPopupMessage("Erro ao iniciar warmup.");
      setPopupSeverity("error");
    } finally {
      setSelectedRowData(null); // Clear the selected row data
      setSelectedWarmupMember(null); // Clear the selected warmup member
    }
  };

  const handleWarmupCancel = () => {
    setShowWarmupModal(false);
    setSelectedRowData(null); // Clear the selected row data
    setSelectedWarmupMember(null); // Clear the selected warmup member
  };

  const handleArchiveClick = (id) => {
    setNegociacaoToDelete(id);
    setShowArchiveModal(true);
  };

  const handleArchiveConfirm = async () => {
    setIsArchiving(true);
    setShowArchiveModal(false); // Close the modal
    try {
      const token = localStorage.getItem('token');
      const idsToArchive = negociacaoToDelete ? [negociacaoToDelete] : selectedRows;
      for (const id of idsToArchive) {
        const document = ganhos.find(gain => gain._id === id);
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/comercial/arquivar`, document, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.status === 200) {
          setPopupMessage("Negociação arquivada com sucesso.");
          setPopupSeverity("success");
        }
      }
      setSelectedRows([]);
      refresh(); // Recarregar os dados
    } catch (error) {
      console.error("Erro ao arquivar negociação:", error);
      setPopupMessage("Erro ao arquivar negociação.");
      setPopupSeverity("error");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (action === "warmup") {
      selectedRows.forEach(id => handleWarmupStart(id));
    } else if (action === "delete") {
      setShowDeleteModal(true);
    } else if (action === "archive") {
      setShowArchiveModal(true);
    }
  };

  const handleRefresh = () => {
    fetchGanhos();
  };

  if (error) {
    return (
      <div>
        Error: {error.response ? error.response.data.error : error.message}
      </div>
    );
  }

  return (
    <Card className="h-full w-full">
      <SpinnerModal open={loading || updating || isDeleting || isArchiving} onClose={() => { }} />
      <CardHeader
        floated={false}
        shadow={false}
        className="mb-2 rounded-none p-2"
      >
        <Typography variant="h4" className="pb-6">Backlog de Ganhos</Typography>
        <div className="flex justify-between items-center w-full">
          <Input
            label="Buscar Projeto"
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            value={searchTerm}
            onChange={handleSearch}
            className="flex-grow"
          />
          <RefreshDataButton className="ml-4" onClick={handleRefresh} />
        </div>
        <div className="flex justify-between items-center w-full mt-2">
          <Typography variant="small">
            {selectedRows.length > 0 ? `Selecionados: ${selectedRows.length}` : `Total de Ganhos: ${totalFilteredGains}`}
          </Typography>
          <div className="flex">
            <select value={selectedSeller} onChange={handleSellerFilterChange} className="ml-4 p-2 border rounded">
              <option value="">Todos os Vendedores</option>
              {uniqueSellers.map(seller => (
                <option key={seller} value={seller}>{seller}</option>
              ))}
            </select>
            {selectedRows.length > 0 && (
              <Menu>
                <MenuHandler>
                  <Button className="ml-4">Ações</Button>
                </MenuHandler>
                <MenuList>
                  <MenuItem className="hover:bg-amber-500 hover:text-white flex items-center gap-2" onClick={() => handleBulkAction("delete")}>Voltar Etapa</MenuItem>
                  <MenuItem className="hover:bg-red-500  hover:text-white flex items-center gap-2" onClick={() => handleBulkAction("archive")}>Arquivar</MenuItem>
                </MenuList>
              </Menu>
            )}
          </div>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {TABLE_HEAD.map(({ head, icon, align, width }) => (
                <th
                  key={head}
                  className={`px-6 text-left text-xs font-medium text-gray-500 tracking-wider ${align === "center" ? "text-center" : ""}`}
                  style={{ width }}
                >
                  <div className={`flex items-center gap-1 ${align === "center" ? "justify-center" : ""}`}>
                    {head === "PROJETO" ? (
                      <>
                        <Checkbox
                          checked={selectedRows.length === filteredRows.length}
                          onChange={handleSelectAll}
                        />
                      </>
                    ) : (
                      icon
                    )}
                    {head}
                    {head === "PROJETO" && (
                      <InfoButton
                        content={<DicaCheckbox />}
                        width="250"
                        maxHeight="250"
                        hoverToOpen={true}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 430px)' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRows.map(
                ({ _id, name, amount_total, closed_at, user }) => (
                  <tr key={_id} className={selectedRows.includes(_id) ? "bg-gray-100" : ""}>
                    <td className="px-6 py-2 whitespace-nowrap" style={{ width: TABLE_HEAD[0].width }}>
                      <div className="flex items-center gap-1">
                        <Checkbox
                          checked={selectedRows.includes(_id)}
                          onChange={() => handleSelectRow(_id)}
                        />
                        <Typography variant="small" className="font-bold truncate">
                          {name}
                        </Typography>
                      </div>
                    </td>
                    <td className="px-6 whitespace-nowrap" style={{ width: TABLE_HEAD[1].width }}>
                      <Tooltip content={user.name}>
                        <Typography variant="small" className="truncate">
                          {user.name}
                        </Typography>
                      </Tooltip>
                    </td>
                    <td className=" px-10 whitespace-nowrap" style={{ width: TABLE_HEAD[2].width }}>
                      <Typography variant="small" className="truncate">
                        {new Date(closed_at).toLocaleDateString()}
                      </Typography>
                    </td>
                    <td className="px-10 " style={{ width: TABLE_HEAD[3].width }}>
                      <Typography variant="small" className="truncate">
                        {formatCurrency(amount_total)}
                      </Typography>
                    </td>
                    <td className="px-6 whitespace-nowrap text-center" style={{ width: TABLE_HEAD[4].width }}>
                      <div className="flex items-center justify-center gap-2">
                        <Menu>
                          <MenuHandler>
                            <IconButton variant="text" size="sm" disabled={selectedRows.length > 0}>
                              <HiDotsHorizontal className="h-6 w-6 text-gray-900" />
                            </IconButton>
                          </MenuHandler>
                          <MenuList>
                            <MenuItem className="hover:bg-gray-200" onClick={() => handleWarmupStart(_id)}>Iniciar Warmup</MenuItem>
                            <MenuItem className="hover:bg-red-500  hover:text-white flex items-center gap-2" onClick={() => handleArchiveClick(_id)}>Arquivar</MenuItem>
                          </MenuList>
                        </Menu>
                      </div>
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
      </div>

      {showDeleteModal && (
        <ConfirmationModal
          message={`Tem certeza de que deseja voltar ${selectedRows.length > 1 ? `${selectedRows.length} negociações` : 'a negociação'} para correções? O processo será listado novamente na próxima atualização, portanto, certifique-se de que todas as atualizações no CRM estejam concluídas.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={isDeleting}
        />
      )}

      {showArchiveModal && (
        <ConfirmationModal
          message={`Tem certeza de que deseja arquivar ${selectedRows.length > 1 ? `${selectedRows.length} negociações` : 'a negociação'} do Backlog?`}
          onConfirm={handleArchiveConfirm}
          onCancel={() => setShowArchiveModal(false)}
          isDeleting={isArchiving}
        />
      )}

      {showWarmupModal && (
        <CustomWarmupModal
          members={members}
          selectedMember={selectedWarmupMember}
          onSelectMember={setSelectedWarmupMember}
          onConfirm={handleWarmupConfirm}
          onCancel={handleWarmupCancel}
          selectedRowData={selectedRowData} // Pass the selected row data to the modal
        />
      )}

      <CustomPopup
        open={!!popupMessage}
        message={popupMessage}
        severity={popupSeverity}
        onClose={() => setPopupMessage("")}
      />
    </Card>
  );
}