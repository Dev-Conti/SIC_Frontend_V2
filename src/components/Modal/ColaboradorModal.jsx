import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
  Card,
  CardBody,
  Chip,
  Tooltip,
  IconButton,
} from "@material-tailwind/react";
import { FaLinkedin } from "react-icons/fa";
import { HiPlus, HiOutlineInformationCircle } from "react-icons/hi";
import { FiEdit3 } from "react-icons/fi";

export default function ColaboradorModal({ open, handleClose, colaborador }) {
  if (!colaborador) return null;

  const {
    informacoes_basicas,
    contato,
    endereco,
    dados_profissionais,
    dados_contrato,
    dados_bancarios,
    tipo_colaborador,
    ativo,
  } = colaborador;

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date.$date?.$numberLong || date).toLocaleDateString();
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return null;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatCpfCnpj = (value) => {
    if (!value) return null;
    const cleanedValue = value.replace(/\D/g, '');
    if (cleanedValue.length === 11) {
      return cleanedValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cleanedValue.length === 14) {
      return cleanedValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  };

  const getCpfCnpjLabel = (value) => {
    if (!value) return "CPF/CNPJ";
    const cleanedValue = value.replace(/\D/g, '');
    if (cleanedValue.length === 11) {
      return "CPF";
    } else if (cleanedValue.length === 14) {
      return "CNPJ";
    }
    return "CPF/CNPJ";
  };

  return (
    <Dialog
      open={open}
      handler={handleClose}
      size="lg"
      className="w-full max-w-screen-lg max-h-screen mx-auto my-auto"
    >
      <div className="flex">
      <DialogHeader className="ml-2">Ficha do Colaborador</DialogHeader>
      <div className="flex justify-center items-center w-max">
        <Chip
          variant="ghost"
          size="sm"
          value={ativo === null ? "Admissão" : ativo ? "Ativo" : "Inativo"}
          color={ativo === null ? "amber" : ativo ? "green" : "blue-gray"}
        />
      </div>
      </div>
      <DialogBody divider className="overflow-y-auto h-[80vh]">
        <div className="flex flex-col gap-4 mx-2">
          <div className="flex items-center gap-6">
            <img
              src={informacoes_basicas?.foto || "/useravatar.png"}
              alt="Foto do Colaborador"
              className="w-24 h-24 rounded-full ml-2"
            />
            <div className="w-full">
              <Typography variant="h5">Informações Básicas</Typography>
              <div className="flex justify-around">
                <div className="w-full">
                  {informacoes_basicas?.nome && <Typography>Nome: {informacoes_basicas.nome}</Typography>}
                  {informacoes_basicas?.cpf && (
                    <Typography>
                      {getCpfCnpjLabel(informacoes_basicas.cpf)}: {formatCpfCnpj(informacoes_basicas.cpf)}
                    </Typography>
                  )}
                  {informacoes_basicas?.data_nascimento && <Typography>Data de Nascimento: {formatDate(informacoes_basicas.data_nascimento)}</Typography>}
                  {informacoes_basicas?.sexo && <Typography>Sexo: {informacoes_basicas.sexo}</Typography>}
                </div>
                <div className="flex flex-col w-full gap-3">
                  <div>
                    {informacoes_basicas?.nome_mae && <Typography>Nome da Mãe: {informacoes_basicas.nome_mae}</Typography>}
                    {informacoes_basicas?.nome_pai && <Typography>Nome do Pai: {informacoes_basicas.nome_pai}</Typography>}
                  </div>
                  <div className="flex items-center">
                    {contato?.url_linkedin && (
                      <a href={contato.url_linkedin} target="_blank" rel="noopener noreferrer">
                        <FaLinkedin color="#0e76a8" size={32} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {contato && (
            <Card>
              <Chip
                color="blue"
                className="mb-2 w-full py-2"
                value={
                  <div className="flex items-center justify-between gap-2">
                    <span>Contato</span>
                    <div>
                      <Tooltip content="Alterar">
                        <IconButton
                          variant="text"
                          onClick={() => {}}
                          className="h-6 w-6 p-0"
                        >
                          <FiEdit3 className="h-4 w-4 text-white" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content="Infos">
                        <IconButton
                          variant="text"
                          onClick={() => {}}
                          className="h-6 w-6 p-0"
                        >
                          <HiOutlineInformationCircle className="h-4 w-4 text-white" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                }
              />
              <CardBody>
                <div className="flex gap-3 items-center">
                  <div className="">
                    {contato.email_pessoal && <Typography>Email: {contato.email_pessoal}</Typography>}
                    {contato.telefone_celular && <Typography>Telefone: {contato.telefone_celular}</Typography>}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
          {endereco && (
            <Card>
              <Chip
                color="blue"
                className="mb-2 w-full py-2"
                value={
                  <div className="flex items-center justify-between gap-2">
                    <span>Endereço</span>
                    <div>
                      <Tooltip content="Alterar">
                        <IconButton
                          variant="text"
                          onClick={() => {}}
                          className="h-6 w-6 p-0"
                        >
                          <HiPlus className="h-4 w-4 text-white" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content="Infos">
                        <IconButton
                          variant="text"
                          onClick={() => {}}
                          className="h-6 w-6 p-0"
                        >
                          <HiOutlineInformationCircle className="h-4 w-4 text-white" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                }
              />
              <CardBody>
                {endereco.logradouro && <Typography>Logradouro: {endereco.logradouro}</Typography>}
                {endereco.numero && <Typography>Número: {endereco.numero}</Typography>}
                {endereco.bairro && <Typography>Bairro: {endereco.bairro}</Typography>}
                {endereco.cidade && <Typography>Cidade: {endereco.cidade}</Typography>}
                {endereco.estado && <Typography>Estado: {endereco.estado}</Typography>}
                {endereco.cep && <Typography>CEP: {endereco.cep}</Typography>}
              </CardBody>
            </Card>
          )}
          {dados_profissionais && (
            <Card>
              <Chip
                color="blue"
                className="mb-2 w-full py-2"
                value={
                  <div className="flex items-center justify-between gap-2">
                    <span>Dados Profissionais</span>
                    <div>
                      <Tooltip content="Alterar">
                        <IconButton
                          variant="text"
                          onClick={() => {}}
                          className="h-6 w-6 p-0"
                        >
                          <HiPlus className="h-4 w-4 text-white" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content="Infos">
                        <IconButton
                          variant="text"
                          onClick={() => {}}
                          className="h-6 w-6 p-0"
                        >
                          <HiOutlineInformationCircle className="h-4 w-4 text-white" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                }
              />
              <CardBody>
                {dados_profissionais.funcao && <Typography>Função: {dados_profissionais.funcao}</Typography>}
                {dados_profissionais.gerente && <Typography>Gerente: {dados_profissionais.gerente}</Typography>}
                {dados_profissionais.area && <Typography>Área: {dados_profissionais.area}</Typography>}
              </CardBody>
            </Card>
          )}
          {dados_contrato && (
            <Card>
              <Chip
                color="blue"
                className="mb-2 w-full py-2"
                value={
                  <div className="flex items-center justify-between gap-2">
                    <span>Dados do Contrato</span>
                    <div>
                      <Tooltip content="Alterar">
                        <IconButton
                          variant="text"
                          onClick={() => {}}
                          className="h-6 w-6 p-0"
                        >
                          <HiPlus className="h-4 w-4 text-white" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content="Infos">
                        <IconButton
                          variant="text"
                          onClick={() => {}}
                          className="h-6 w-6 p-0"
                        >
                          <HiOutlineInformationCircle className="h-4 w-4 text-white" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                }
              />
              <CardBody>
                {dados_contrato.data_inicio && <Typography>Data de Início: {formatDate(dados_contrato.data_inicio)}</Typography>}
                {dados_contrato.tipo_remuneracao && <Typography>Tipo de Remuneração: {dados_contrato.tipo_remuneracao}</Typography>}
                {dados_contrato.valor_fixo && <Typography>Valor Fixo: {formatCurrency(dados_contrato.valor_fixo)}</Typography>}
                {dados_contrato.taxa_hora && <Typography>Taxa Hora: {formatCurrency(dados_contrato.taxa_hora)}</Typography>}
                {dados_contrato.numero_horas && <Typography>Numero de Horas: {dados_contrato.numero_horas}</Typography>}
                {dados_contrato.comissao_vendas && <Typography>Comissão de Vendas: {dados_contrato.comissao_vendas}%</Typography>}
                {dados_contrato.valor_loader && <Typography>Valor Loader: {dados_contrato.valor_loader}</Typography>}
                {dados_contrato.ausencia_remunerada && <Typography>Ausência Remunerada: {dados_contrato.ausencia_remunerada}</Typography>}
              </CardBody>
            </Card>
          )}
          {dados_bancarios && (
            <Card>
              <Chip
                color="blue"
                className="mb-2 w-full py-2"
                value={
                  <div className="flex items-center justify-between gap-2">
                    <span>Dados Bancários</span>
                    <div>
                      <Tooltip content="Alterar">
                        <IconButton
                          variant="text"
                          onClick={() => {}}
                          className="h-6 w-6 p-0"
                        >
                          <HiPlus className="h-4 w-4 text-white" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content="Infos">
                        <IconButton
                          variant="text"
                          onClick={() => {}}
                          className="h-6 w-6 p-0"
                        >
                          <HiOutlineInformationCircle className="h-4 w-4 text-white" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                }
              />
              <CardBody>
                {dados_bancarios.banco && <Typography>Banco: {dados_bancarios.banco}</Typography>}
                {dados_bancarios.agencia && <Typography>Agência: {dados_bancarios.agencia}</Typography>}
                {dados_bancarios.conta && <Typography>Conta: {dados_bancarios.conta}</Typography>}
                {dados_bancarios.tipo_conta && <Typography>Tipo de Conta: {dados_bancarios.tipo_conta}</Typography>}
                {dados_bancarios.chave_pix && <Typography>Chave Pix: {dados_bancarios.chave_pix}</Typography>}
              </CardBody>
            </Card>
          )}
          <Card>
            <Chip
              color="blue"
              className="mb-2 w-full py-2"
              value={
                <div className="flex items-center justify-between gap-2">
                  <span>Outras Informações</span>
                  <div>
                    <Tooltip content="Alterar">
                      <IconButton
                        variant="text"
                        onClick={() => {}}
                        className="h-6 w-6 p-0"
                      >
                        <HiPlus className="h-4 w-4 text-white" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content="Infos">
                      <IconButton
                        variant="text"
                        onClick={() => {}}
                        className="h-6 w-6 p-0"
                      >
                        <HiOutlineInformationCircle className="h-4 w-4 text-white" />
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>
              }
            />
            <CardBody>
              {tipo_colaborador && <Typography>Tipo de Colaborador: {tipo_colaborador}</Typography>}
              <Typography>Status: {ativo === null ? "Em Admissão" : ativo ? "Ativo" : "Inativo"}</Typography>
            </CardBody>
          </Card>
        </div>
      </DialogBody>
      <DialogFooter className="flex justify-between items-center gap-4">
        <div className="flex justify-end w-full gap-2">
          <Button variant="text" color="red" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}