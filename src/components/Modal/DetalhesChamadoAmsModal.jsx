import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Typography } from "@material-tailwind/react";

const DetalhesChamadoAmsModal = ({ open, onClose, chamado }) => {
  if (!chamado) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader>Detalhes do Chamado</ModalHeader>
      <ModalBody>
        <Typography variant="h6">Assunto: {chamado.Assunto}</Typography>
        <Typography>Data Criação: {new Date(chamado.DataCriacao).toLocaleDateString()}</Typography>
        <Typography>Status: {chamado.NomeStatus}</Typography>
        <Typography>Prioridade: {chamado.NomePrioridade}</Typography>
        <Typography>Operador: {chamado.NomeOperador}</Typography>
        <Typography>Descrição: {chamado.Descricao}</Typography>
        <Typography>Data de Início: {new Date(chamado.DataInicio).toLocaleDateString()}</Typography>
        <Typography>Data de Fim: {new Date(chamado.DataFim).toLocaleDateString()}</Typography>
      </ModalBody>
      <ModalFooter>
        <Button variant="text" onClick={onClose}>Fechar</Button>
      </ModalFooter>
    </Modal>
  );
};

export default DetalhesChamadoAmsModal;
