import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import InputTexto from "../Inputs/InputTexto";
import InputSelect from "../Inputs/InputSelect";
import InputCheckbox from "../Inputs/InputCheckbox";

export default function FormularioCompleto() {
  const { register, handleSubmit, control, formState: { errors } } = useForm();
  const [currentSection, setCurrentSection] = useState(0);

  // Monitoramos o campo que determina se as informações adicionais devem ser exibidas
  const mostrarInformacoesAdicionais = useWatch({
    control,
    name: "informacoesProfissionais.preencherAdicionais",
    defaultValue: false,
  });

  const secoes = [
    {
      titulo: "Informações Pessoais",
      componente: (
        <div className="space-y-4">
          <InputTexto
            label="Nome Completo"
            name="informacoesPessoais.nome"
            placeholder="Digite seu nome completo"
            control={control}
            errors={errors}
            required
          />
          <InputTexto
            label="Email"
            name="informacoesPessoais.email"
            placeholder="Digite seu email"
            control={control}
            errors={errors}
            required
          />
          <InputSelect
            label="Gênero"
            name="informacoesPessoais.genero"
            placeholder="Selecione seu gênero"
            options={["Masculino", "Feminino", "Outro"]}
            control={control}
            errors={errors}
            required
          />
        </div>
      ),
    },
    {
      titulo: "Endereço",
      componente: (
        <div className="space-y-4">
          <InputTexto
            label="Endereço"
            name="endereco.rua"
            placeholder="Digite seu endereço"
            control={control}
            errors={errors}
            required
          />
          <InputTexto
            label="Cidade"
            name="endereco.cidade"
            placeholder="Digite sua cidade"
            control={control}
            errors={errors}
            required
          />
          <InputTexto
            label="Estado"
            name="endereco.estado"
            placeholder="Digite seu estado"
            control={control}
            errors={errors}
            required
          />
          <InputTexto
            label="CEP"
            name="endereco.cep"
            placeholder="Digite seu CEP"
            control={control}
            errors={errors}
            required
          />
        </div>
      ),
    },
    {
      titulo: "Informações Profissionais",
      componente: (
        <div className="space-y-4">
          <InputTexto
            label="Profissão"
            name="informacoesProfissionais.profissao"
            placeholder="Digite sua profissão"
            control={control}
            errors={errors}
            required
          />
          <InputCheckbox
            label="Deseja preencher informações adicionais?"
            name="informacoesProfissionais.preencherAdicionais"
            register={register}
            errors={errors}
          />
          {mostrarInformacoesAdicionais && (
            <div className="space-y-4">
              <InputTexto
                label="LinkedIn"
                name="informacoesProfissionais.linkedin"
                placeholder="Digite seu perfil do LinkedIn"
                control={control}
                errors={errors}
              />
              <InputTexto
                label="GitHub"
                name="informacoesProfissionais.github"
                placeholder="Digite seu perfil do GitHub"
                control={control}
                errors={errors}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      titulo: "Termos e Condições",
      componente: (
        <div className="space-y-4">
          <InputCheckbox
            label="Aceito os termos e condições"
            name="termosECondicoes.aceito"
            register={register}
            errors={errors}
            required
          />
        </div>
      ),
    },
  ];

  const onSubmit = (data) => {
    console.log("Payload Aninhado:", data);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Navegação Superior */}
      <div className="flex space-x-4 mb-8 border-b border-gray-300 pb-2">
        {secoes.map((secao, index) => (
          <button
            key={index}
            type="button"
            className={`px-4 py-2 text-sm font-medium ${
              currentSection === index ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500"
            }`}
            onClick={() => setCurrentSection(index)}
          >
            {secao.titulo}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Renderiza dinamicamente o componente da seção atual */}
        {secoes[currentSection].componente}

        {/* Botões de navegação e envio */}
        <div className="flex justify-between mt-8">
          {currentSection > 0 && (
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => setCurrentSection((prev) => prev - 1)}
            >
              Anterior
            </button>
          )}
          {currentSection < secoes.length - 1 ? (
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => setCurrentSection((prev) => prev + 1)}
            >
              Próximo
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Enviar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
