import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Typography } from "@material-tailwind/react";
import InputSelect from "../Forms/Inputs/InputSelect"; // Import the InputSelect component
import { formatCurrency } from "../../utils/formatCurrency"; // Import the formatCurrency utility

export default function CustomWarmupModal({ members, selectedMember, onSelectMember, onConfirm, onCancel, selectedRowData }) {
  const handleSelectChange = (e) => {
    const selected = members.find(member => member.email === e.target.value);
    onSelectMember(selected);
  };

  return (
    <Dialog open={true} handler={onCancel} size="sm">
      <DialogHeader>
        <Typography variant="h5">Iniciar Warmup</Typography>
      </DialogHeader>
      <DialogBody>
        <Typography variant="body2" className="mx-3">
          Informe o Responsável pelo preenchimento do Warmup na Etapa Comercial
        </Typography>
        <div className="m-3">
          <InputSelect
            name="responsavel"
            value={selectedMember?.email || ""}
            onChange={handleSelectChange}
            options={members}
            optionLabel={(member) => `${member.displayName} (${member.email})`}
            optionValue={(member) => member.email}
            required={true}
          />
        </div>
        {selectedRowData && (
          <div className="m-3">
            <Typography variant="body2"><strong>Projeto:</strong> {selectedRowData.name}</Typography>
            <Typography variant="body2"><strong>Vendedor:</strong> {selectedRowData.user?.name}</Typography>
            <Typography variant="body2"><strong>Valor:</strong> {formatCurrency(selectedRowData.amount_total)}</Typography>
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={onCancel} className="mr-2">
          Cancelar
        </Button>
        <Button variant="gradient" color="green" onClick={onConfirm}>
          Confirmar
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
