# Frontend - Secretaria Online

Frontend da aplicação Secretaria Online, desenvolvido com React 19, TypeScript e Vite.

## 📋 Índice

- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Módulos Implementados](#módulos-implementados)
- [Testes](#testes)
- [Build para Produção](#build-para-produção)
- [Troubleshooting](#troubleshooting)

## 🚀 Instalação

### 1. Pré-requisitos

- Node.js 20.x LTS (mínimo 18.x)
- npm 10.x (mínimo 9.x)

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e preencha com os valores reais:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com a URL da API backend:

```bash
VITE_API_URL=http://localhost:3000/api/v1
```

## ⚙️ Configuração

### Estrutura de Configuração

- **src/config/queryClient.ts** - Configuração do TanStack Query
- **src/services/api.ts** - Cliente Axios com interceptors
- **src/router.tsx** - Configuração de rotas
- **tailwind.config.js** - Configuração do Tailwind CSS
- **vite.config.ts** - Configuração do Vite

## 🎬 Execução

### Modo Development (com Hot Module Replacement)

```bash
npm run dev
```

Aplicação rodará em `http://localhost:5173`

### Preview de Build de Produção

```bash
npm run preview
```

## 📁 Estrutura de Pastas

```
frontend/
├── src/
│   ├── assets/              # Imagens, fontes, ícones estáticos
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/              # Componentes básicos (Button, Input, Modal)
│   │   ├── forms/           # Formulários específicos
│   │   └── layout/          # Layout components (Header, Sidebar)
│   ├── pages/               # Páginas/Views
│   │   ├── admin/           # Páginas administrativas
│   │   ├── teacher/         # Páginas do professor
│   │   └── student/         # Páginas do aluno
│   ├── services/            # Comunicação com API (Axios)
│   │   ├── api.ts           # Cliente base
│   │   ├── student.service.ts  # Serviço de estudantes
│   │   ├── user.service.ts     # Serviço de usuários
│   │   └── ...
│   ├── hooks/               # Custom React Hooks (TanStack Query)
│   ├── contexts/            # React Context API (AuthContext)
│   ├── types/               # TypeScript types/interfaces
│   ├── utils/               # Funções utilitárias
│   ├── styles/              # Estilos globais
│   ├── App.tsx              # Componente raiz
│   ├── main.tsx             # Entry point
│   └── router.tsx           # Configuração de rotas
├── public/                  # Assets estáticos
├── .env.example             # Template de variáveis de ambiente
├── package.json             # Dependências do projeto
├── tsconfig.json            # Configuração TypeScript
├── vite.config.ts           # Configuração Vite
└── README.md               # Este arquivo
```

## 🔧 Módulos Implementados

### ✅ Autenticação
- Login com JWT
- Proteção de rotas por role (admin, teacher, student)
- Gerenciamento de sessão com AuthContext
- Interceptor Axios para renovação de token

### ✅ Dashboard Administrativo
- Visão geral com estatísticas do sistema
- Cards com total de alunos, professores, documentos e matrículas
- Acesso rápido às principais funcionalidades

### ✅ Gestão de Estudantes
- **Estrutura de Dados**: Estudantes são gerenciados em duas tabelas separadas:
  - `students`: Armazena dados completos (informações pessoais, acadêmicas, endereço)
  - `users`: Gerencia autenticação (login, senha) com referência opcional para `students`
- Listagem de estudantes
- Cadastro de novos estudantes
- Edição de dados de estudantes
- Criação de usuário de login para estudante existente

### ✅ Gestão de Professores
- **Estrutura de Dados**: Professores são gerenciados em duas tabelas separadas:
  - `teachers`: Armazena dados completos (informações pessoais, profissionais, endereço)
  - `users`: Gerencia autenticação (login, senha) com referência opcional para `teachers`
- Listagem de professores
- Cadastro de novos professores
- Edição de dados de professores
- Criação de usuário de login para professor existente
- Reset de senha provisória para professores com usuário

### ✅ Gestão de Cursos e Disciplinas
- CRUD de cursos
- CRUD de disciplinas
- Associação curso-disciplina por semestre

### ✅ Gestão de Turmas
- Cadastro de turmas
- Vinculação de professores
- Vinculação de alunos

### ✅ Upload e Validação de Documentos
- Upload de documentos por alunos
- Validação de tipos e tamanhos
- Aprovação/rejeição por administradores

### ✅ Gestão de Avaliações
- **Página dedicada**: `/admin/evaluations` e `/teacher/evaluations`
- **Funcionalidades**:
  - Listagem de todas as avaliações em tabela organizada
  - Colunas: Nome, Turma, Disciplina, Data, Tipo, Ações
  - Filtro por turma (dropdown)
  - Modal para criar nova avaliação
  - Modal para editar avaliação existente
  - Confirmação antes de deletar
  - Badges coloridas por tipo: "Nota" (azul) e "Conceito" (verde)
  - Formatação de datas (DD/MM/YYYY)
  - Toasts de sucesso/erro para feedback
  - Design responsivo (desktop e mobile)
- **Formulário de Avaliação**:
  - Select de turma (obrigatório)
  - Select de disciplina (filtrado por turma selecionada)
  - Campo de nome da avaliação (texto)
  - Campo de data (date picker)
  - Seleção de tipo (radio buttons: Nota ou Conceito)
  - Validação completa com Zod
  - Suporta criar e editar
  - **NOVO**: Campo `teacher_id` opcional - preenchido automaticamente no backend se usuário logado for professor
- **Rotas**:
  - `/admin/evaluations` - Acesso admin (todas as avaliações)
  - `/teacher/evaluations` - Acesso professor (próprias avaliações)
- **Services**:
  - `evaluation.service.ts` - Comunicação com API
  - Métodos: getAll, getById, create, update, delete
  - Conversão automática snake_case ↔ camelCase
- **Hooks**:
  - `useEvaluations.ts` - TanStack Query hooks
  - Cache otimizado (5min stale time)
  - Invalidação automática após mutations
- **Tipos**:
  - `evaluation.types.ts` - Interfaces TypeScript
  - IEvaluation, ICreateEvaluationData, IUpdateEvaluationData
  - Type-safe em todas as camadas
- **Filtros Inteligentes**:
  - **NOVO**: Professores visualizam apenas suas turmas nos dropdowns (filtro automático por backend)
  - **NOVO**: Administradores visualizam todas as turmas disponíveis
  - Filtro dinâmico de disciplinas baseado na turma selecionada
- **Operações disponíveis**:
  - ✅ Listar todas as avaliações
  - ✅ Criar nova avaliação (vinculada a turma, disciplina e professor)
  - ✅ Editar avaliação existente
  - ✅ Deletar avaliação (com confirmação)
  - ✅ Filtrar por turma
  - ✅ Visualizar detalhes (turma, disciplina, professor, tipo, data)
  - ✅ Resolução automática de teacher_id para professores logados

### ✅ Gestão de Cursos do Estudante
- **Página dedicada**: `/admin/students/:studentId/courses`
- **Funcionalidades**:
  - Visualização de todos os cursos em que o aluno está/foi inscrito
  - Select dropdown com todos os cursos disponíveis
  - Curso com status 'active' selecionado por padrão
  - Exibição de informações detalhadas do curso selecionado (nome, descrição, duração, tipo)
  - Status da matrícula com badges coloridas (Ativo/Pendente/Cancelado)
  - Tabela de matrículas com data formatada
  - Mensagens contextuais baseadas no status da matrícula
  - Botão rápido na lista de estudantes para acessar esta página
  - **NOVO**: Botão "Cadastrar em Novo Curso" para matricular estudante em curso adicional
  - **NOVO**: Modal de seleção de curso com dropdown de cursos disponíveis
  - **NOVO**: Campo de data de matrícula (pré-preenchido com data atual)
  - **NOVO**: Dropdown para alterar status da matrícula (Ativo/Pendente/Cancelado)
  - **NOVO**: Persistência de alterações de status no banco de dados
  - **NOVO**: Filtro automático de cursos já matriculados no modal de cadastro
  - **NOVO**: Feedback visual com toasts de sucesso/erro
  - **NOVO**: Recarga automática dos dados após cadastro ou alteração de status
- **Rota**: Acessível via botão 📖 na coluna de ações da página de estudantes
- **Operações disponíveis**:
  - ✅ Visualizar cursos do estudante
  - ✅ Cadastrar estudante em novo curso (cria matrícula com status "pending")
  - ✅ Alterar status da matrícula (pending ↔ active ↔ cancelled)
  - ✅ Validação para evitar cadastro duplicado no mesmo curso

### ✅ Gestão de Disciplinas do Curso
- **Página dedicada**: `/admin/courses/:courseId/disciplines`
- **Funcionalidades**:
  - Visualização de todas as disciplinas vinculadas ao curso
  - Tabela organizada com colunas: Código, Nome, Carga Horária, Semestre, Ações
  - Modal para adicionar disciplinas da lista geral à grade do curso
  - Select dropdown com disciplinas disponíveis (exclui disciplinas já vinculadas)
  - Campo de input para especificar o semestre em que a disciplina é oferecida
  - Botão para remover disciplinas da grade com confirmação
  - Filtro automático de disciplinas disponíveis (remove as já vinculadas)
  - Mensagens de sucesso/erro para feedback visual
  - Botão "Voltar para cursos" para navegação
  - Carregamento otimizado de todas as disciplinas (limit: 1000)
- **Rota**: Acessível via botão 📋 (List) na coluna de ações da página de cursos
- **Dados persistidos**: Tabela `course_disciplines` com `course_id`, `discipline_id` e `semester`

### ✅ Rematrícula Global de Estudantes (Etapa 5/9 - Frontend Concluído)
- **Página dedicada**: `/admin/reenrollment`
- **Status**: Frontend implementado ✅ | Backend implementado ✅
- **Descrição**: Sistema de rematrícula semestral/anual que permite processar rematrícula de TODOS os estudantes ativos do sistema em lote
- **Funcionalidades**:
  - ✅ Página administrativa com informações detalhadas sobre o processo
  - ✅ Cards informativos explicando como funciona a rematrícula
  - ✅ Alertas de atenção sobre operação irreversível
  - ✅ Botão principal para iniciar rematrícula global
  - ✅ Modal de rematrícula com formulário de captura de dados
  - ✅ Campos validados: Semestre (1-2), Ano (YYYY), Senha do admin
  - ✅ Tela de confirmação com resumo da operação
  - ✅ Validação de senha do admin antes de processar
  - ✅ Feedback de loading durante processamento
  - ✅ Mensagens de sucesso/erro com toasts/alerts
  - ✅ Invalidação automática de cache após sucesso
  - ✅ Integração completa com TanStack Query
- **Arquivos implementados**:
  - ✅ `src/types/reenrollment.types.ts` - Tipos TypeScript
  - ✅ `src/services/reenrollment.service.ts` - Service de API
  - ✅ `src/hooks/useReenrollment.ts` - Hook customizado com TanStack Query
  - ✅ `src/pages/admin/Reenrollment.tsx` - Página principal
  - ✅ `src/components/modals/GlobalReenrollmentModal.tsx` - Modal de processamento
  - ✅ Rota adicionada em `src/router.tsx`
  - ✅ Item adicionado no menu Sidebar (/admin/reenrollment)
- **Endpoint utilizado**: `POST /api/v1/reenrollments/process-all`
- **Fluxo de operação**:
  1. Admin acessa página `/admin/reenrollment`
  2. Clica em "Iniciar Rematrícula Global"
  3. Preenche formulário no modal (semestre, ano, senha)
  4. Sistema valida dados com Zod
  5. Exibe tela de confirmação com resumo
  6. Admin confirma operação
  7. Backend valida senha e processa rematrícula em lote
  8. Todos os enrollments ativos viram 'pending'
  9. Cache é invalidado e dados são atualizados
  10. Mensagem de sucesso é exibida
- **Validações implementadas**:
  - Semestre: 1 ou 2 (obrigatório)
  - Ano: entre 2020 e 2100 (obrigatório)
  - Senha: mínimo 6 caracteres (obrigatória)
  - Validação de senha no backend antes de processar
- **Características**:
  - ✅ Processa TODOS os estudantes ativos do sistema (não por curso individual)
  - ✅ Usa transação no backend (rollback automático em caso de erro)
  - ✅ NÃO cria contratos (criados após aceite do estudante - Etapa 8)
  - ✅ Modal não pode ser fechado durante processamento
  - ✅ Botões desabilitados durante processamento
  - ✅ Ícones e design consistentes com resto do sistema
- **Próximas etapas** (Backend - Etapas 6, 7, 8 e 9):
  - ⏳ Endpoint para preview de contrato HTML
  - ⏳ Frontend - Tela de aceite de rematrícula (estudante)
  - ⏳ Backend - Endpoint de aceite e criação de contrato
  - ⏳ Documentação final

## 🧪 Testes

### Configuração de Testes

O projeto está configurado com Jest e React Testing Library.

### Scripts de Testes

```bash
npm test              # Executa testes uma vez
npm run test:watch   # Executa testes em modo watch
npm run test:coverage # Executa testes com relatório de cobertura
```

### Estrutura de Testes

Os testes devem ser criados em:
- `src/__tests__/`
- `src/components/__tests__/`
- `src/hooks/__tests__/`
- `src/services/__tests__/`

Ou com sufixo:
- `*.test.ts` / `*.test.tsx`
- `*.spec.ts` / `*.spec.tsx`

### Exemplo de Teste

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
});
```

## 📦 Build para Produção

### Gerar Build

```bash
npm run build
```

Build será gerado na pasta `dist/`

### Verificar Build

```bash
npm run preview
```

### Deploy

O build gerado pode ser deployado em:
- Hostgator (upload via FTP/SFTP para `/public_html/`)
- Vercel, Netlify, ou qualquer servidor de arquivos estáticos
- Nginx, Apache

## 🎨 Estilização

### Tailwind CSS

O projeto usa Tailwind CSS v4 para estilização:

- Utility-first CSS framework
- Design system consistente
- Responsividade fácil
- Classes customizadas em `tailwind.config.js`

### Componentes UI

Componentes base estão em `src/components/ui/`:
- Button
- Input
- Modal
- Table
- FileUpload

## 🔐 Autenticação e Autorização

### AuthContext

O contexto de autenticação (`src/contexts/AuthContext.tsx`) gerencia:
- Estado de autenticação do usuário
- Token JWT
- Informações do usuário logado (name, role, etc.)
- Funções de login/logout

### PrivateRoute

Componente que protege rotas baseado em role:

```tsx
<PrivateRoute requiredRole="admin">
  <AdminDashboard />
</PrivateRoute>
```

### Roles Disponíveis

- `admin`: Acesso total ao sistema
- `teacher`: Acesso a turmas, lançamento de notas
- `student`: Acesso a notas, documentos, solicitações

## 📡 Comunicação com API

### Axios Client

Cliente base configurado em `src/services/api.ts`:
- Base URL da API
- Interceptor para adicionar token JWT
- Interceptor para tratar erros (401, 403, 500)
- Renovação automática de token

### Services

Cada entidade tem seu próprio service:
- `student.service.ts` - Operações com estudantes (tabela `students`)
- `teacher.service.ts` - Operações com professores (tabela `teachers`)
- `user.service.ts` - Operações com usuários (tabela `users`, autenticação)
- `course.service.ts` - Operações com cursos
- `enrollment.service.ts` - Operações com matrículas
- `document.service.ts` - Operações com documentos

**Importante**: A separação entre `student.service`/`teacher.service` e `user.service` reflete a estrutura do banco:
- Use `student.service` para gerenciar dados do estudante (informações pessoais e acadêmicas)
- Use `teacher.service` para gerenciar dados do professor (informações pessoais e profissionais)
- Use `user.service` para criar/gerenciar acesso de login de estudantes ou professores

### TanStack Query

Gerenciamento de estado do servidor com custom hooks:

```typescript
// Exemplo de uso
const { data: students, isLoading } = useStudents();
const createMutation = useCreateStudent();

// Criar estudante
createMutation.mutate(newStudentData);
```

## 🐛 Troubleshooting

### Erro: "Cannot find module"

**Problema**: Path alias `@/` não está funcionando

**Solução**: Verificar configurações em:
- `tsconfig.json` (paths)
- `vite.config.ts` (resolve.alias)

### Erro de CORS

**Problema**: API está bloqueando requisições do frontend

**Solução**: Verificar configuração CORS no backend:
```javascript
// backend/src/server.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Erro: "401 Unauthorized"

**Problema**: Token JWT expirado ou inválido

**Solução**:
- Fazer logout e login novamente
- Verificar se token está sendo enviado no header `Authorization: Bearer <token>`
- Verificar validade do `JWT_SECRET` no backend

### Build falha com erro de TypeScript

**Problema**: Erros de tipo impedem build

**Solução**:
```bash
# Executar type check
npx tsc --noEmit

# Corrigir erros de tipo reportados
```

### Porta 5173 já em uso

**Problema**: Outra aplicação está usando a porta 5173

**Solução (Windows)**:
```bash
# Encontrar processo
netstat -ano | findstr :5173

# Matar processo
taskkill /PID <PID> /F
```

**Solução (macOS/Linux)**:
```bash
# Encontrar processo
lsof -i :5173

# Matar processo
kill -9 <PID>
```

## 📝 Código de Qualidade

### ESLint

```bash
npm run lint         # Verificar erros
npm run lint:fix     # Corrigir erros automaticamente
```

### Prettier

```bash
npm run format       # Formatar código
npm run format:check # Verificar formatação
```

## 🚀 Deploy em Produção

### Hostgator (Shared Hosting)

1. **Build da aplicação:**
```bash
npm run build
```

2. **Upload via FTP/SFTP:**
   - Fazer upload da pasta `dist/` para `/home/usuario/public_html/`

3. **Configurar .htaccess** (para SPA routing):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## 📚 Recursos Adicionais

- [Documentação de Requisitos](../docs/requirements.md)
- [Documentação de Contexto](../docs/contextDoc.md)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Tailwind CSS Documentation](https://tailwindcss.com)

## 📄 Licença

Proprietary - Sistema Secretaria Online

## 👥 Contribuidores

Desenvolvido seguindo as melhores práticas de:
- Clean Code
- Component-Driven Development
- TypeScript Best Practices
- Accessibility Standards (WCAG)

---

**Última atualização:** 2025-12-11
**Versão:** 0.3.2

## 📝 Changelog

### Versão 0.3.2 (2025-12-11) - Melhorias de Backend (Reflexos no Frontend)
- 📋 **NOTA**: Esta versão documenta principalmente correções de backend que melhoram a estabilidade do frontend
- ✅ **MELHORIA**: Sistema de notas agora usa corretamente a tabela `students` ao invés de `users`
  - Backend corrigiu FK `student_id` em `grades` para referenciar `students.id`
  - Services de grades agora buscam dados de alunos com campo `nome` ao invés de `name`
  - Melhor alinhamento com a arquitetura de separação Students/Users
- ✅ **MELHORIA**: Validação de professor em avaliações
  - Backend valida se professor leciona a disciplina antes de criar avaliação
  - Frontend recebe erros mais claros quando tenta criar avaliação inválida
- ✅ **MELHORIA**: Filtro automático de avaliações por professor
  - Professores veem apenas suas próprias avaliações nos endpoints do backend
  - Frontend recebe lista já filtrada, melhorando performance
- 🐛 **BUGFIX**: Corrigido erro ao listar notas de avaliações
  - Resolvido erro "Cannot read properties of undefined" no backend
  - Frontend agora pode carregar notas sem erros 403 ou 500

### Versão 0.3.1 (2025-12-10)
- 🐛 **BUGFIX**: Corrigida exibição de turmas e disciplinas nos dropdowns para professores
- ✅ **NOVO**: Filtro automático de turmas por professor logado
- ✅ **NOVO**: Administradores visualizam todas as turmas, professores apenas suas turmas
- ✅ **NOVO**: Resolução automática de `teacher_id` no backend para professores logados
- ✅ Removida necessidade de enviar `teacher_id` explicitamente no formulário
- ✅ Melhor experiência de usuário para professores ao criar avaliações

### Versão 0.3.0 (2025-12-09)
- ✅ **NOVO**: Interface completa de gestão de avaliações
- ✅ Criada página `Evaluations.tsx` para admin e professores
- ✅ Criado formulário `EvaluationForm.tsx` com validação Zod
- ✅ Criado service `evaluation.service.ts` com métodos CRUD
- ✅ Criados hooks `useEvaluations.ts` com TanStack Query
- ✅ Criados types `evaluation.types.ts` para TypeScript
- ✅ Adicionado item "Avaliações" no menu Sidebar (admin e professor)
- ✅ Implementado filtro por turma na listagem
- ✅ Implementado filtro de disciplinas por turma no formulário
- ✅ Badges coloridas por tipo: Nota (azul) e Conceito (verde)
- ✅ Formatação de datas com date-fns (DD/MM/YYYY)
- ✅ Modais para criar, editar e deletar avaliações
- ✅ Toasts de feedback para todas as operações
- ✅ Design responsivo com Tailwind CSS
- ✅ Rotas configuradas: `/admin/evaluations` e `/teacher/evaluations`

### Versão 0.2.1 (2025-12-09)
- ✅ Adicionado botão "Cadastrar em Novo Curso" na página de Cursos do Estudante
- ✅ Adicionado modal para selecionar curso e data de matrícula
- ✅ Adicionado dropdown para alterar status da matrícula (Ativo/Pendente/Cancelado)
- ✅ Implementada integração com `EnrollmentService` para criar e atualizar matrículas
- ✅ Adicionado filtro automático de cursos já matriculados no modal
- ✅ Adicionado feedback visual com toasts de sucesso/erro
- ✅ Implementada recarga automática de dados após operações
- ✅ Atualizado README com novas funcionalidades
