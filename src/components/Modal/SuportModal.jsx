import React, { useState } from 'react';
import { Dialog, DialogBody, DialogHeader, DialogFooter, Button, Typography } from '@material-tailwind/react';
import InputSelect from '../Forms/Inputs/InputSelect';
import InputTextarea from '../Forms/Inputs/InputTextarea';
import CustomPopup from '../Popup/CustomPopup';
import axios from 'axios'; // Import axios
import { DateTime } from 'luxon'; // Import luxon
const baseURL = process.env.REACT_APP_BASE_URL; // Import base URL from environment variables

const SuportModal = ({ isOpen, onRequestClose, userId, userName, userMail, userPhone  }) => { // Add userId as a prop
  const [supportType, setSupportType] = useState('');
  const [formData, setFormData] = useState({});
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [popupOpen, setPopupOpen] = useState(false);

  const handleSupportTypeChange = (event) => {
    setSupportType(event.target.value);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {

    const dataLocal = DateTime.now().setZone('America/Sao_Paulo').toISO();
    console.log(dataLocal);

    event.preventDefault();
    const selectedOption = options.find(option => option.value === supportType);
    const payload = {
      tipo: supportType,
      descricao: formData[`descricao${supportType.charAt(0).toUpperCase() + supportType.slice(1)}`],
      userId: userId,
      userName: userName,
      userMail: userMail,
      userPhone: userPhone,
      status: 'aberto', 
      dataAbertura: dataLocal
    }
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/suporte/criar`, payload); // Send data to backend
      setConfirmationMessage(`Pedido de Suporte enviado com sucesso`);
    } catch (error) {
      setConfirmationMessage(`Erro ao enviar pedido de suporte`);
    }
    setPopupOpen(true);
    handleClose(); 
  };

  const handleClose = () => {
    setSupportType('');
    setFormData({});
    onRequestClose();
  };

  const options = [
    { value: 'problema', label: 'Relatar um problema' },
    { value: 'ajuda', label: 'Pedir ajuda' },
    { value: 'sugestao', label: 'Dar uma sugestão' }
  ];

  const renderForm = () => {
    switch (supportType) {
      case 'problema':
        return (
          <InputTextarea
            label="Descreva o problema"
            name="descricaoProblema"
            onChange={handleInputChange}
            required
          />
        );
      case 'ajuda':
        return (
          <InputTextarea
            label="Com o que você precisa de ajuda?"
            name="descricaoAjuda"
            onChange={handleInputChange}
            required
          />
        );
      case 'sugestao':
        return (
          <InputTextarea
            label="Digite sua sugestão"
            name="descricaoSugestao"
            onChange={handleInputChange}
            required
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} handler={handleClose} size="sm" className='p-2'>
        <DialogHeader className="text-lg font-bold">
          <Typography variant='h5'>Suporte</Typography> 
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="flex flex-col gap-4">
              <InputSelect
                value={supportType}
                onChange={handleSupportTypeChange}
                label="Selecione uma opção"
                options={options}
                optionLabel={(option) => option.label}
                optionValue={(option) => option.value}
                required
              />
              {renderForm()}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="text" color="red" onClick={handleClose} className="mr-2">
              Cancelar
            </Button>
            <Button type="submit" variant="gradient" color="green">
              Enviar
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
      <CustomPopup
        open={popupOpen}
        message={confirmationMessage}
        severity="success"
        onClose={() => setPopupOpen(false)}
      />
    </>
  );
};

export default SuportModal;
