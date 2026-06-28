import React, { useEffect, useState } from 'react';
import useWarmup from '@/hooks/useWarmup';
import { Card, CardBody, Button, Typography, CardHeader, CardFooter } from '@material-tailwind/react';
import InputTexto from '../Inputs/InputTexto';
import InputTextarea from '../Inputs/InputTextarea';
import InputLink from '../Inputs/InputLink';
import SpinnerModal from '@/components/Modal/SpinnerModal';
import InputAnexo from '../Inputs/InputAnexo';

const WarmupForms = ({ negocio_id, onClose, onFormSubmit }) => {
    const { data, fetchWarmupById, updateWarmupData } = useWarmup();
    const [activeTab, setActiveTab] = useState(0); // Estado para rastrear a aba ativa
    const [formData, setFormData] = useState({});
    const [isDataChanged, setIsDataChanged] = useState(false);
    const [loading, setLoading] = useState(true);
    const [outrosAnexos, setOutrosAnexos] = useState([]); // Estado para armazenar os anexos

    useEffect(() => {
        if (negocio_id) {
            fetchWarmupById(negocio_id).finally(() => setLoading(false));
        }
    }, [negocio_id, fetchWarmupById]);

    useEffect(() => {
        if (data) {
            setFormData(data);
            setOutrosAnexos(data.capa_projeto?.outros_anexos || []); // Load previously submitted attachments
            setIsDataChanged(false);
        }
    }, [data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        setFormData((prevData) => {
            let updatedData = { ...prevData };
            let tempData = updatedData;
            for (let i = 0; i < keys.length - 1; i++) {
                tempData[keys[i]] = tempData[keys[i]] || {};
                tempData = tempData[keys[i]];
            }
            tempData[keys[keys.length - 1]] = value;
            return updatedData;
        });
        setIsDataChanged(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...formData, capa_projeto: { ...formData.capa_projeto, outros_anexos: outrosAnexos } };
        delete payload._id;

        console.log('Payload Enviado:', payload);
        try {
            await updateWarmupData(negocio_id, payload);
            alert('Dados atualizados com sucesso!');
            setIsDataChanged(false);
            onClose();
            onFormSubmit(); // Call the onFormSubmit prop
        } catch (err) {
            alert('Erro ao atualizar os dados.');
        }
    };

    const handleAdicionarAnexo = () => {
        setOutrosAnexos([...outrosAnexos, { nome: '', link: '' }]);
    };

    const handleAlterarAnexo = (index, field, value) => {
        const updatedAnexos = [...outrosAnexos];
        updatedAnexos[index][field] = value;
        setOutrosAnexos(updatedAnexos);
    };

    const handleRemoverAnexo = (index, e) => {
        e.preventDefault(); // Prevent form submission
        const updatedAnexos = outrosAnexos.filter((_, i) => i !== index);
        setOutrosAnexos(updatedAnexos);
    };

    const tabs = [
        "Capa do Projeto",
        "Formação de Preço",
        "Informações sobre Faturamento",
        "Observações Gerais",
    ];

    return (
        <Card className='w-full'>
            <CardBody>
                {loading ? (
                    <SpinnerModal open={loading} onClose={() => { }} />
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Typography variant="h2" className="text-center">Formulário Warmup - Etapa Projetos</Typography>
                        <Typography variant="h5" className="text-center">{formData?.capa_projeto?.codigo || ''}</Typography>
                        <Typography variant="h5" className="text-center">Gerente do Projeto: {formData?.capa_projeto?.gerente_projeto?.nome || ''}</Typography>

                        {/*Cabeçalho da paginação*/}<div className="flex justify-between border-b py-4 border-gray-300">
                            {tabs.map((tab, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setActiveTab(index)}
                                    className={`py-2 px-4 font-medium ${activeTab === index
                                        ? "border-b-2 border-blue-500 text-blue-600"
                                        : "text-gray-500 hover:text-gray-800"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>


                        {/*Capa do Projeto*/} {activeTab === 0 && (
                            <section className='flex flex-col gap-3 my-3'>
                                <Typography variant="h3" className="">{tabs[activeTab]}</Typography>
                                <InputTexto label='ID Negocicação' name="negocio_id" value={formData.negocio_id || ''} onChange={handleChange} disabled />
                                <InputTexto label='Vendedor' name="nome_vendedor" value={formData?.capa_projeto?.nome_vendedor || ''} onChange={handleChange} disabled />
                                <InputTextarea label='Objetivo do Projeto' name="capa_projeto.objetivo_projeto" value={formData?.capa_projeto?.objetivo_projeto || ''} onChange={handleChange} />
                                <InputLink label='Proposta Comercial Atualizada' name="capa_projeto.proposta_atual" value={formData?.capa_projeto?.proposta_atual || ''} onChange={handleChange} />
                                <InputLink label='Formação de Preço Atualizada' name="capa_projeto.formacao_preco_atual" value={formData?.capa_projeto?.formacao_preco_atual || ''} onChange={handleChange} />
                                <InputTextarea label='Detalhes da Negociação' name="capa_projeto.detalhes_negociacao" value={formData?.capa_projeto?.detalhes_negociacao || ''} onChange={handleChange} />
                                <div className="my-3">
                                    
                                    {outrosAnexos.length > 0 ? (
                                        <table className="p-2 min-w-full bg-white border border-gray-200">
                                            <tbody>
                                                {outrosAnexos.map((anexo, index) => (
                                                    <tr key={index} className="flex">
                                                        <td className="px-4 py-2 border-b flex-grow">
                                                            <InputAnexo
                                                                nomeValue={anexo.nome}
                                                                linkValue={anexo.link}
                                                                onNomeChange={(e) => handleAlterarAnexo(index, "nome", e.target.value)}
                                                                onLinkChange={(e) => handleAlterarAnexo(index, "link", e.target.value)}
                                                                required
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 border-b text-center">
                                                            <button
                                                                onClick={(e) => handleRemoverAnexo(index, e)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                Remover
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-gray-500">Nenhum anexo adicionado.</p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleAdicionarAnexo}
                                        className="m-4 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition duration-200"
                                    >
                                        Adicionar Anexo
                                    </button>
                                </div>
                            </section>)}
                        {/*Formação de preço*/} {activeTab === 1 && (
                            <section className='flex flex-col gap-3 my-3'>
                                <Typography variant="h3" className="">{tabs[activeTab]}</Typography>
                            </section>)}

                        {/*Faturamento*/} {activeTab === 2 && (
                            <section className='flex flex-col gap-3 my-3'>
                                <Typography variant="h3" className="">{tabs[activeTab]}</Typography>
                            </section>)}

                        {/*Observações*/} {activeTab === 3 && (
                            <section className='flex flex-col gap-3 my-3'>
                                <Typography variant="h3" className="">{tabs[activeTab]}</Typography>
                            </section>)}
                        <div className='flex justify-end mx-4'>
                            <Button color="blue" type="submit" > Enviar </Button>
                        </div>

                    </form>
                )}
            </CardBody>
            <CardFooter>

            </CardFooter>
        </Card>
    );
};

export default WarmupForms;
