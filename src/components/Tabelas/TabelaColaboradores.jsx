"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { HiEllipsisVertical } from "react-icons/hi2";
import { RiInfoCardLine } from "react-icons/ri";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { FaUserLargeSlash, FaUserPen, FaUserCheck } from "react-icons/fa6";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Tabs,
  TabsHeader,
  Tab,
  Avatar,
  IconButton,
  Tooltip,
  Switch,
  List,
  ListItem,
  ListItemPrefix,
} from "@material-tailwind/react";
import { SelectTipoCadastroColaborador } from "../Modal/SelectTipoCadastroColaborador";
import { BreadcrumbsDefault } from "../Breadcrumbs/BreadcrumbsDefault";
import { SpeedDialAdd } from "../SpeedDial/SpeedDialAdd";
import useColaboradores from "@/hooks/useColaboradores";
import BadgeButton from "../Buttons/BadgeButton";
import ColaboradorModal from "../Modal/ColaboradorModal";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const TABS = [
  { label: "Todos", value: "todos" },
  { label: "Exclusivos", value: "exclusivo" },
  { label: "Individual", value: "individual" },
  { label: "Corporativo", value: "corporativo" },
];

const TABLE_HEAD = ["Colaborador", "Função", "Status", "Tipo", "Data Admissão", ""];

export default function TabelaColaboradores() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [showOnlyActive, setShowOnlyActive] = useState(true); // Estado do toggle switch
  const [showOnlyAdmission, setShowOnlyAdmission] = useState(false); // Estado do toggle switch para "Em admissão"
  const [showOnlyInactive, setShowOnlyInactive] = useState(false); // Estado do toggle switch para "Inativos"
  const [openModal, setOpenModal] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null); // Mantém a referência do dropdown aberto
  const rowsPerPage = 5;

  const { colaboradores, loading, error, setParams, refresh } = useColaboradores();

  const breadcrumbItems = [
    { name: "Home", path: "/user" },
    { name: "Folha", path: "/user/colaboradores" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest(`#dropdown-${openDropdown}`)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const handleTabClick = (value) => {
    setActiveTab(value);
    setCurrentPage(1); // Reinicia a paginação ao mudar de aba
  };

  const handleActiveSwitch = (checked) => {
    setShowOnlyActive(checked);
    if (checked) {
      setShowOnlyAdmission(false);
      setShowOnlyInactive(false);
    }
  };

  const handleAdmissionSwitch = (checked) => {
    setShowOnlyAdmission(checked);
    if (checked) {
      setShowOnlyActive(false);
      setShowOnlyInactive(false);
    }
  };

  const handleInactiveSwitch = (checked) => {
    setShowOnlyInactive(checked);
    if (checked) {
      setShowOnlyActive(false);
      setShowOnlyAdmission(false);
    }
  };

  const handleOpenModal = (colaborador) => {
    setSelectedColaborador(colaborador);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedColaborador(null);
  };

  const handleDropdownToggle = (colaboradorId) => {
    setOpenDropdown(openDropdown === colaboradorId ? null : colaboradorId);
  };

  const efetivarColaborador = async (colaboradorId) => {
    console.log(`Efetivando colaborador com ID: ${colaboradorId}`);
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/colaboradores/${colaboradorId}`,
        { ativo: true }, // Payload da requisição
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Resposta da API:", response);

      if (response.status !== 200) {
        throw new Error(response.data.message || "Erro ao efetivar colaborador");
      }

      toast.success("Colaborador efetivado com sucesso!");
      refresh(); // Atualiza a lista de colaboradores
    } catch (error) {
      console.error("Erro ao efetivar colaborador:", error);
      toast.error(error.message || "Erro inesperado");
    }
  };

  const filteredRows = colaboradores.filter((row) => {
    const matchesCategory =
      activeTab === "todos" || row.tipo_colaborador === activeTab;
    const matchesSearch = row.informacoes_basicas.nome
      ? row.informacoes_basicas.nome.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesActive = !showOnlyActive || row.ativo;
    const matchesAdmission = !showOnlyAdmission || row.ativo === null;
    const matchesInactive = !showOnlyInactive || row.ativo === false;
    return matchesCategory && matchesSearch && matchesActive && matchesAdmission && matchesInactive;
  });

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

  const admissionCount = colaboradores.filter((row) => row.ativo === null).length;

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar colaboradores: {error.message}</div>;

  return (
    <div className="h-full w-full p-6">
      <div className="fixed bottom-5 right-5">
        <SpeedDialAdd />
      </div>
      <BreadcrumbsDefault items={breadcrumbItems} />
      <Card className="h-full w-full shadow-lg">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-8 flex items-center justify-between gap-8">
            <div>
              <Typography variant="h5" color="blue-gray">
                Lista de Colaboradores
              </Typography>
              <Typography color="gray" className="mt-1 font-normal">
                Informações detalhadas sobre os colaboradores
              </Typography>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <BadgeButton badgeContent={admissionCount} buttonText="Admissões" />
              <SelectTipoCadastroColaborador />
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Tabs value={activeTab} className="w-full md:w-max">
              <div className="flex gap-5">
                <TabsHeader
                  className="rounded-md bg-gray-100 p-1"
                  indicatorProps={{
                    className: "bg-gray-500",
                  }}
                >
                  {TABS.map(({ label, value }) => (
                    <Tab
                      key={value}
                      value={value}
                      onClick={() => handleTabClick(value)}
                      className={`rounded-md py-2 px-4 text-sm font-medium transition-colors duration-300 ${activeTab === value
                        ? "bg-gray-500 text-white"
                        : "bg-transparent text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {label}
                    </Tab>
                  ))}
                </TabsHeader>
                <div className="flex items-center gap-3">
                  <Switch
                    id="toggle-active"
                    label="Somente Ativos"
                    checked={showOnlyActive}
                    onChange={(e) => handleActiveSwitch(e.target.checked)}
                    className={`${showOnlyActive ? "bg-gray-500" : "bg-gray-300"
                      } inline-flex items-center rounded-full transition-colors duration-100`}
                  />
                  <Switch
                    id="toggle-admission"
                    label="Em Admissão"
                    checked={showOnlyAdmission}
                    onChange={(e) => handleAdmissionSwitch(e.target.checked)}
                    className={`${showOnlyAdmission ? "bg-gray-500" : "bg-gray-300"
                      } inline-flex items-center rounded-full transition-colors duration-100`}
                  />
                  <Switch
                    id="toggle-inactive"
                    label="Inativos"
                    checked={showOnlyInactive}
                    onChange={(e) => handleInactiveSwitch(e.target.checked)}
                    className={`${showOnlyInactive ? "bg-gray-500" : "bg-gray-300"
                      } inline-flex items-center rounded-full transition-colors duration-100`}
                  />
                </div>
              </div>
            </Tabs>

            <div className="w-full md:w-72">
              <Input
                label="Pesquisar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>

          </div>
        </CardHeader>
        <CardBody className="px-4">
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
              {paginatedRows.map(
                ({ _id, informacoes_basicas, contato, endereco, dados_profissionais, dados_contrato, dados_bancarios, tipo_colaborador, ativo }, index) => {
                  const isLast = index === paginatedRows.length - 1;
                  const classes = isLast
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-50";
                  const avatarUrl = informacoes_basicas.img || "/useravatar.png";
                  const dataInicio = dados_contrato.data_inicio;

                  return (
                    <tr key={_id}>
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <Avatar src={avatarUrl} alt={informacoes_basicas.nome} size="sm" />
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {informacoes_basicas.nome}
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal opacity-70"
                            >
                              {informacoes_basicas.email}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={classes}>
                        <div className="flex flex-col">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {dados_profissionais.funcao}
                          </Typography>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal opacity-70"
                          >
                            {dados_profissionais.area}
                          </Typography>
                        </div>
                      </td>
                      <td className={classes}>
                        <div className="w-max">
                          <Chip
                            variant="ghost"
                            size="sm"
                            value={ativo === null ? "Admissão" : ativo ? "Ativo" : "Inativo"}
                            color={ativo === null ? "amber" : ativo ? "green" : "blue-gray"}
                          />
                        </div>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {tipo_colaborador}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {dataInicio ? new Date(dataInicio).toLocaleDateString() : "N/A"}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <div className="relative flex justify-center" id={`dropdown-${_id}`}>
                          <Tooltip content="Ver Cadastro">
                            <IconButton variant="text" onClick={() => handleOpenModal({ informacoes_basicas, contato, endereco, dados_profissionais, dados_contrato, dados_bancarios, tipo_colaborador, ativo })}>
                              <RiInfoCardLine className="text-2xl" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip content="Mais ações">
                            <IconButton
                              variant="text"
                              onClick={() => handleDropdownToggle(_id)}
                              className="transition-transform duration-200 hover:scale-105"
                            >
                              <HiEllipsisVertical className="text-2xl" />
                            </IconButton>
                          </Tooltip>
                          {openDropdown === _id && (
                            <div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-md z-10">
                              <List>
                                <ListItem
                                  onClick={() => console.log("Editar")}
                                  className="hover:bg-gray-100"
                                >
                                  <ListItemPrefix>
                                    <FaUserPen className="h-5 w-5" />
                                  </ListItemPrefix>
                                  Editar Perfil
                                </ListItem>
                                {ativo === true && (
                                  <ListItem
                                    onClick={() => console.log("Novo Lançamento")}
                                    className="hover:bg-gray-100"
                                  >
                                    <ListItemPrefix>
                                      <MdOutlinePostAdd className="h-5 w-5" />
                                    </ListItemPrefix>
                                    Novo Lançamento
                                  </ListItem>
                                )}
                                {ativo === null && (
                                  <ListItem
                                    onClick={() => {
                                      console.log("Chamando efetivarColaborador com ID:", _id);
                                      efetivarColaborador(_id);
                                    }}
                                    className="hover:bg-gray-100"
                                  >
                                    <ListItemPrefix>
                                      <FaUserCheck className="h-5 w-5" />
                                    </ListItemPrefix>
                                    Efetivar
                                  </ListItem>
                                )}
                                <ListItem
                                  onClick={() => console.log("Excluir")}
                                  className="text-red-500 hover:bg-red-100"
                                >
                                  <ListItemPrefix>
                                    <FaUserLargeSlash className="h-5 w-5" />
                                  </ListItemPrefix>
                                  Desligar
                                </ListItem>
                              </List>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
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
      <ColaboradorModal
        open={openModal}
        handleClose={handleCloseModal}
        colaborador={selectedColaborador}
      />
      <ToastContainer />
    </div>
  );
}