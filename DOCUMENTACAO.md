# Documentação Técnica — SIC Frontend V2

> **Gerado em:** 2026-06-09
> **Propósito:** Comparação com SIC Frontend V1 para decisão de base de desenvolvimento

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Autenticação e Autorização](#4-autenticação-e-autorização)
5. [Módulos e Páginas](#5-módulos-e-páginas)
6. [Hooks Customizados](#6-hooks-customizados)
7. [Componentes Principais](#7-componentes-principais)
8. [Integrações com API](#8-integrações-com-api)
9. [Dados Estáticos](#9-dados-estáticos)
10. [Utilitários e Convenções](#10-utilitários-e-convenções)
11. [Infraestrutura](#11-infraestrutura)
12. [Status de Implementação](#12-status-de-implementação)

---

## 1. Visão Geral

O **SIC Frontend V2** (Sistema Integrado Conti) é a segunda versão do painel web da Conti Consultoria. Foi construído como uma reescrita completa sobre **Next.js 15 com App Router**, substituindo a versão anterior baseada em Create React App + React Router.

**Objetivo declarado no codebase:** gestão integrada de RH, módulo comercial (ganhos, warmup, propostas), serviços (AMS, projetos), financeiro e administração.

**Autenticação:** OAuth via Microsoft 365 (gerenciado pelo backend). Permissões de rotas dinâmicas baseadas nos membros dos canais do Teams.

**API Backend:** `https://api.conticonsultoria.cloud/` (configurável via variável de ambiente)

---

## 2. Stack Tecnológica

| Categoria | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 15.1.3 |
| UI Library | React | 19.0.0 |
| CSS Framework | Tailwind CSS | 3.4.1 |
| Componentes UI | Material Tailwind | 2.1.10 |
| HTTP Client | Axios | 1.7.9 |
| Notificações | React Toastify | 11.0.2 |
| Gráficos | ApexCharts + react-apexcharts | 4.3.0 / 1.7.0 |
| PDF | jsPDF + jspdf-autotable | 3.0.0 / 5.0.2 |
| Screenshot | html2canvas | 1.4.1 |
| Excel | xlsx | 0.18.5 |
| Datas | dayjs + luxon | 1.11.13 / 3.5.0 |
| Ícones | react-icons + lucide-react | 5.4.0 / 0.475.0 |
| Markdown | react-markdown + remark-gfm | 9.0.3 / 4.0.1 |
| Linting | ESLint | 9 |
| Containerização | Docker / Docker Compose | — |
| Roteamento legado | react-router-dom | 7.2.0 (presente, não principal) |

**Variável de ambiente obrigatória:**
```
NEXT_PUBLIC_BASE_API_URL=https://api.conticonsultoria.cloud/
```

**Scripts disponíveis:**
```bash
npm run dev      # Dev com Turbopack
npm run build    # Build production
npm start        # Serve production
npm run lint     # ESLint
```

---

## 3. Estrutura de Pastas

```
sic-frontend-v2/
├── src/
│   ├── app/                    # Páginas (Next.js App Router)
│   │   ├── layout.js           # Layout raiz (AuthProvider)
│   │   ├── page.jsx            # Home / Login
│   │   ├── auth/redirect/      # Callback OAuth
│   │   ├── comercial/          # Módulo Comercial
│   │   ├── servicos/           # Módulo Serviços
│   │   ├── admin/              # Módulo Admin
│   │   ├── user/               # Módulo Usuário
│   │   ├── documentacao/       # Página de docs interna
│   │   ├── folha_pagamento/    # Stub
│   │   ├── folha_ponto/        # Stub
│   │   ├── unauthorized/       # Página acesso negado
│   │   └── testes/             # Sandbox dev
│   ├── components/             # Componentes reutilizáveis
│   │   ├── inputs/             # Inputs customizados
│   │   ├── modals/             # Modais
│   │   ├── charts/             # Gráficos ApexCharts
│   │   ├── tables/             # Tabelas de dados
│   │   ├── buttons/            # Botões
│   │   ├── layout/             # Sidebar, Navbar
│   │   └── forms/              # Formulários multi-seção
│   ├── context/                # React Contexts
│   ├── hooks/                  # Custom hooks de dados
│   ├── utils/                  # Funções utilitárias
│   ├── data/                   # Dados estáticos e JSON
│   └── docs/                   # Documentação interna (Markdown)
├── public/                     # Assets estáticos (imagens, favicons)
├── package.json
├── next.config.mjs             # Suporte MDX, webpack custom
├── tailwind.config.mjs         # Cores de sidebar via CSS vars
├── docker-compose.yml
└── dockerfile
```

---

## 4. Autenticação e Autorização

### Fluxo OAuth (Microsoft 365)

```
1. Usuário clica "Entrar com Microsoft" → LoginButton
2. Redireciona para: {API}/auth/login
3. Backend executa OAuth com Microsoft
4. Backend redireciona para: /auth/redirect?token=ABC123
5. Frontend chama login(token) → AuthContext
6. Busca perfil: GET {API}/m365/profile (Bearer token)
7. Armazena token + user_data no localStorage
8. Redireciona para /comercial/ganhos
```

### AuthContext

```js
{
  user: { displayName, mail, userPrincipalName, ... },
  loading: boolean,
  login: (token) => void,
  logout: () => void,    // Remove localStorage + redireciona para /
  isAuthenticated: () => boolean
}
```

Persistência: `token` e `user_data` no `localStorage`.

### Controle de Acesso por Rota

Cada layout de módulo carrega `useMembers(groupId, channelId)` que busca os membros do canal Teams correspondente. O HOC `withAuth(Component, emails)` compara o email do usuário autenticado com a lista retornada. Se não autorizado, renderiza `<Unauthorized />`.

Mapeamento de rotas para canais Teams (`useConfigGroups`):

| Rota | Channel ID (Teams) |
|---|---|
| `/comercial` | `19:b3da72357c7b499094aa6313bc5b37a5@thread.tacv2` |
| `/servicos` | `19:f826e90af9f741319cf021cf04aa19a4@thread.tacv2` |
| `/financeiro` | `19:6322f957e1884aa595b0e10e6a5b11c8@thread.tacv2` |
| `/admin` | `19:ac5914cd3b194829b862274136015e89@thread.tacv2` |

Group ID fixo: `df5919f9-37fd-4725-9aab-8ecc154789a8`

### Permissões Hardcoded (routePermissions.jsx)

Lista de emails com acesso admin/irrestrito:
- `ti@conticonsultoria.com.br`
- `evandro.silva@conticonsultoria.com.br`
- `leandro.lucas@conticonsultoria.com.br`
- `andressa.oliveira@conticonsultoria.com.br`

---

## 5. Módulos e Páginas

### Legenda
- **IMPLEMENTADO** — funcional com dados reais da API
- **STUB** — página existe mas sem funcionalidade
- **PARCIAL** — funcional mas com partes faltando

---

### Módulo Comercial (`/comercial`)

**Layout:** Sidebar com seções Vendas, Configurações. Carrega membros do canal comercial do Teams.

| Página | Status | Descrição |
|---|---|---|
| `/comercial` | STUB | Mensagem de boas-vindas |
| `/comercial/dashboard` | IMPLEMENTADO | 4 gráficos (Bar, Line, Pie) via ApexCharts |
| `/comercial/ganhos` | IMPLEMENTADO | Tabela de negociações com filtros, paginação dinâmica, seleção múltipla, ações em massa |
| `/comercial/colaboradores` | IMPLEMENTADO | Tabela com abas (Todos/Exclusivos/Individual/Corporativo), filtros de status |
| `/comercial/warmup` | IMPLEMENTADO | Tabela de projetos em etapa Warmup Comercial, modal de edição |
| `/comercial/cadastro/colaborador-exclusivo` | IMPLEMENTADO | Formulário multi-seção para cadastro |
| `/comercial/propostas/formacao-preco` | STUB | Mensagem "Bem-vindo à Formação de Preço" |
| `/comercial/testes` | SANDBOX | Página de testes dev |

---

### Módulo Serviços (`/servicos`)

**Layout:** Sidebar com seções Projetos, AMS. Carrega membros do canal serviços do Teams.

| Página | Status | Descrição |
|---|---|---|
| `/servicos` | STUB | Mensagem de boas-vindas |
| `/servicos/ams/chamados` | IMPLEMENTADO | Tabela de chamados Desk Manager, filtros, modal detalhes |
| `/servicos/ams/projetos` | IMPLEMENTADO | Tabela de projetos AMS |
| `/servicos/ajustes/atribuir-cliente-ams` | PARCIAL | Página de ajustes AMS |
| `/servicos/warmup` | IMPLEMENTADO | Tabela Warmup Serviços |

---

### Módulo Admin (`/admin`)

| Página | Status | Descrição |
|---|---|---|
| `/admin` | STUB | Mensagem de boas-vindas |
| `/admin/testes` | SANDBOX | Página de testes |

---

### Módulo Usuário (`/user`)

| Página | Status | Descrição |
|---|---|---|
| `/user` | IMPLEMENTADO | Saudação com nome do usuário autenticado |
| `/user/colaboradores` | IMPLEMENTADO | Reutiliza ColaboradoresTabela |
| `/user/cadastro/colaborador-exclusivo` | IMPLEMENTADO | Formulário de cadastro |

---

### Páginas Globais

| Página | Status | Descrição |
|---|---|---|
| `/` | IMPLEMENTADO | Home com botão Login Microsoft |
| `/auth/redirect` | IMPLEMENTADO | Callback OAuth, processa token |
| `/documentacao` | IMPLEMENTADO | Renderiza src/docs/index.md via react-markdown |
| `/unauthorized` | IMPLEMENTADO | Página acesso negado (animação Framer Motion) |
| `/folha_pagamento` | STUB | Folha de pagamento (apenas rota) |
| `/folha_ponto` | STUB | Folha de ponto (apenas rota) |
| `/about` | STUB | Sobre |

---

## 6. Hooks Customizados

Todos os hooks seguem o padrão `{ data, loading, error }` e encapsulam chamadas à API.

### `useAuth()`
Expõe o `AuthContext`: `{ user, login, logout, isAuthenticated, loading }`.

### `useMembers(groupId, channelId)`
```
GET {API}/m365/channel_members?group_id=X&channel_id=Y
Retorna: { emails: string[], members: object[], loading, error }
```

### `useConfigGroups(baseRoute)`
Busca em array estático o `group_id` e `channel_id` correspondente à rota. Não faz chamada de API.

### `useBacklogGanhos()`
```
GET {API}/comercial/ganhos
GET {API}/comercial/atualizar-negociacoes  (ao chamar updateBacklog)
Retorna: { ganhos, loading, error, refresh, updateBacklog, updating, fetchGanhos }
```

### `useColaboradores()`
```
GET {API}/colaboradores
Retorna: { colaboradores, loading, error, setParams, refresh }
```

### `useWarmup()`
```
GET  {API}/warmup/listar?etapa=X
GET  {API}/warmup/listar/{id}
POST {API}/warmup/processar_dados
PUT  {API}/warmup/atualizar/{negocio_id}
Retorna: { data, loading, error, fetchWarmupData, fetchWarmupById, processWarmupData, updateWarmupData }
```

### `useChamadosAms()`
```
GET {API}/deskmanager/chamados-suporte
Retorna: { chamados, loading, error, refresh }
```

### `useProjetos(ams: boolean)`
```
GET {API}/psoffice/projetos?ams=true|false
Retorna: { projetos, loading, error }
```

### `useFolhaPagamentoAberta(initialParams)`
```
GET {API}/folha/folha-pagamento?data_inicial=X&data_final=Y
Retorna: { folha, loading, error, setParams, refresh }
```

### `useGroups()` / `useChannels(groupId)`
```
GET {API}/m365/groups
GET {API}/m365/group_channels?group_id=X
Usados para seleção de canais em páginas admin.
```

### `useAuthorizedEmails()`
Retorna array estático de emails autorizados (sem chamada de API).

---

## 7. Componentes Principais

### Layout

**`Sidebar.jsx`**
- Menu colapsável com subitems por seção
- Dropdown para trocar de módulo (Comercial, Serviços, Financeiro, Admin)
- Avatar do usuário autenticado, logout, botão de suporte
- Cores via CSS variables: `--sidebar-bg: #48599E`

**`NavbarDefault.jsx`**
- Navbar topo com Material Tailwind
- Menu items com ícones Heroicons

---

### Tabelas de Dados

**`BacklogGanhos.jsx`**
- Colunas: Projeto, Vendedor, Data Fechamento, Valor, Ações
- Filtros: busca texto, seleção por vendedor
- Paginação dinâmica (calcula rows por altura da janela)
- Seleção múltipla via checkbox
- Ações em massa: iniciar / arquivar
- Menu contextual com 3 pontos

**`ColaboradoresTabela.jsx`**
- Abas: Todos / Exclusivos / Individual / Corporativo
- Filtros: busca texto, switches de status (Ativo / Em admissão / Inativo)
- Status como Chip colorido (green/amber/blue-gray)
- Modal de detalhes com 6 abas de informação

**`ChamadosAmsTable.jsx`**
- Colunas: Assunto, Data, Status, Prioridade, Operador, Grupo
- Filtro por status
- Modal `DetalhesChamadoAmsModal`

**`ConfigProjetosAmsTable.jsx`**
- Colunas: Nome, Data Início, Data Fim, Status
- Usa `useProjetos(true)`

**`WarmupComercialTable.jsx`**
- Suporta query param `?negociacaoId=X` para abrir modal diretamente
- Modal de detalhes + formulário de edição inline

---

### Formulários

**`WarmupForms.jsx`** — Formulário principal de warmup
- 4 abas: Capa Projeto, Formação de Preço, Faturamento, Observações
- Upload de anexos (array `outros_anexos`)
- PUT para `/warmup/atualizar/{negocio_id}`

**`FormularioCompleto.jsx`** — Formulário de colaborador
- Multi-seções com navegação por abas
- Campos condicionais

**Inputs Customizados (src/components/inputs/):**

| Componente | Função |
|---|---|
| `InputTexto` | Input simples |
| `InputSelect` | Dropdown com portal |
| `InputMonetario` | Formatação BRL automática |
| `InputPercentual` | Formatação % automática |
| `InputCpf` | Validação + formatação CPF |
| `InputData` | Date picker nativo |
| `InputCheckbox` | Checkbox Material Tailwind |
| `InputTextarea` | Textarea customizado |
| `InputLink` | Input para URLs |
| `InputAnexo` | Upload de arquivos |
| `InputNumeroFixo` | Input numérico |
| `InputRadioButton` | Radio buttons |
| `InputSwitch` | Toggle switch |
| `InputWhispering` | Autocomplete/suggestions |

---

### Gráficos

Todos usam ApexCharts com dados **hardcoded** (sem API real):

| Componente | Tipo |
|---|---|
| `BarChart.jsx` | Barras — Colaboradores Ativos (9 meses) |
| `LineChart.jsx` | Linha |
| `LineChart2.jsx` | Linha (variação) |
| `PieChart.jsx` | Pizza |

---

### Modais

| Componente | Função |
|---|---|
| `ConfirmationModal` | Confirmar/cancelar ação |
| `SpinnerModal` | Loading overlay |
| `ColaboradorModal` | Dados completos do colaborador (6 abas) |
| `DetalhesChamadoAmsModal` | Detalhes de chamado AMS |
| `DetalhesWarmupModal` | Detalhes de warmup |
| `CustomWarmupModal` | Warmup customizado |
| `SelectTipoCadastroColaborador` | Escolha de tipo (Exclusivo/Individual/Corporativo) |
| `SuportModal` | Contato de suporte |

---

## 8. Integrações com API

**Base URL:** `process.env.NEXT_PUBLIC_BASE_API_URL` (default: `https://api.conticonsultoria.cloud/`)

**Header padrão:** `Authorization: Bearer {token}`

### Endpoints mapeados

| Domínio | Método | Endpoint | Usado em |
|---|---|---|---|
| Auth | — | `/auth/login` | LoginButton |
| Auth | GET | `/m365/profile` | AuthContext |
| M365 | GET | `/m365/groups` | useGroups |
| M365 | GET | `/m365/group_channels?group_id=X` | useChannels |
| M365 | GET | `/m365/channel_members?group_id=X&channel_id=Y` | useMembers |
| Comercial | GET | `/comercial/ganhos` | useBacklogGanhos |
| Comercial | GET | `/comercial/atualizar-negociacoes` | useBacklogGanhos |
| Colaboradores | GET | `/colaboradores` | useColaboradores |
| Warmup | GET | `/warmup/listar?etapa=X` | useWarmup |
| Warmup | GET | `/warmup/listar/{id}` | useWarmup |
| Warmup | POST | `/warmup/processar_dados` | useWarmup |
| Warmup | PUT | `/warmup/atualizar/{negocio_id}` | useWarmup / WarmupForms |
| Desk Manager | GET | `/deskmanager/chamados-suporte` | useChamadosAms |
| PSOffice | GET | `/psoffice/projetos?ams=true\|false` | useProjetos |
| Folha | GET | `/folha/folha-pagamento?data_inicial=X&data_final=Y` | useFolhaPagamentoAberta |

---

## 9. Dados Estáticos

**`src/data/routePermissions.jsx`** — 4 emails de admin

**Listas de seleção:**
- `ListaAreas.jsx` — Áreas da empresa (RH, Financeiro, TI, etc.)
- `ListaFuncoes.jsx` — Funções/cargos
- `ListaTipoContratacao.jsx` — `["Sócio", "Cooperativa", "Folha ConTI", "Terceros"]`
- `ListaTipoRemuneracao.jsx` — `["Fixo", "Fixo + Horas", "Fixo + Comissão", ...]`
- `ListaColaboradores.jsx` — Mock de colaboradores para dev

**Schemas de formulário (JSON):**
- `colaborador_exclusivo.json` — Estrutura de campos para colaborador exclusivo
- `parceiro_corporativo.json` — Estrutura para parceiro PJ
- `parceiro_individual.json` — Estrutura para parceiro PF

---

## 10. Utilitários e Convenções

### `src/utils/formatCurrency.js`
```js
export const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
```

### Padrões de State Management
- **AuthContext** para sessão do usuário
- **Custom hooks** para dados de cada domínio
- **useState local** para estado de UI (modais, filtros, paginação)
- **localStorage** para persistência de token e perfil

### Estrutura de resposta da API
```js
{ data: T[] | T }  // Dados sempre aninhados em .data
```

### Paginação Dinâmica
Calcula `rowsPerPage` com base em `window.innerHeight`. Adiciona `resize` listener. Reinicia para página 1 ao mudar filtros.

### Convenções de nomenclatura
- Componentes: `PascalCase.jsx`
- Hooks: `useCamelCase.js`
- Utils: `camelCase.js`
- Contextos: `NomeContext.jsx`

---

## 11. Infraestrutura

### Docker

```yaml
# docker-compose.yml
services:
  frontend-sic:
    image: frontend-sic
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
```

**Dockerfile:** Build Next.js production, expõe porta 3000.

### Configurações Next.js (next.config.mjs)
- Suporte a MDX (Markdown com componentes React)
- Extensões de página: `.js`, `.jsx`, `.md`, `.mdx`
- `reactStrictMode: true`
- Webpack customizado para importar `.md` como texto

### CSS / Tema
Sidebar usa variáveis CSS globais definidas em `globals.css`:
```css
--sidebar-bg: #48599E;        /* Azul/roxo Conti */
--sidebar-text: #ffffff;
--sidebar-hover-bg: #6b7dbb;
```

---

## 12. Status de Implementação

### Resumo por módulo

| Módulo | Status | Cobertura |
|---|---|---|
| Login / Auth | Completo | 100% |
| Comercial — Ganhos | Completo | ~90% |
| Comercial — Colaboradores | Completo | ~85% |
| Comercial — Warmup | Completo | ~80% |
| Comercial — Cadastro | Completo | ~80% |
| Comercial — Dashboard | Parcial | ~40% (gráficos sem dados reais) |
| Comercial — Propostas | Stub | ~5% |
| Serviços — Chamados AMS | Completo | ~85% |
| Serviços — Projetos AMS | Completo | ~80% |
| Serviços — Warmup | Completo | ~80% |
| Admin | Stub | ~5% |
| Financeiro | Não iniciado | 0% |
| Folha de Pagamento | Stub | ~5% |
| Folha de Ponto | Stub | ~5% |

### Contextos implementados mas não utilizados
- `PermissionsContext.jsx` — criado, não usado em componentes
- `ThemeContext.jsx` — criado, não usado em componentes

### Dependências presentes mas desnecessárias
- `react-router-dom` — Next.js App Router já gerencia routing
- `@emotion/react` / `@emotion/styled` — CSS-in-JS duplicado com Tailwind

### Código de referência (Migrations/)
A pasta `src/app/Migrations/` (ou similar) contém componentes portados da V1 como referência de implementação — não são páginas ativas.

---

*Documentação gerada automaticamente com base na inspeção do código-fonte em 2026-06-09.*
