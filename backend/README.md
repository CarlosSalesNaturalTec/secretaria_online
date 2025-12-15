# Backend - Secretaria Online

Backend da aplicação Secretaria Online, desenvolvido com Node.js e Express.

## 📋 Índice

- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Módulos Implementados](#módulos-implementados)
- [API Endpoints](#api-endpoints)
- [Testes](#testes)
- [Troubleshooting](#troubleshooting)

## 🚀 Instalação

### 1. Pré-requisitos

- Node.js 20.x LTS (mínimo 18.x)
- npm 10.x (mínimo 9.x)
- MySQL 8.0 (mínimo 5.7)

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Banco de Dados

Crie um banco de dados MySQL:

```bash
mysql -u root -p
CREATE DATABASE secretaria_online CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 4. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e preencha com os valores reais:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações (database, JWT_SECRET, SMTP, etc).

### 5. Executar Migrations e Seeders

```bash
# Executar todas as migrations
npm run migrate

# Executar seeders (cria usuário admin padrão)
npm run seed
```

## ⚙️ Configuração

### Estrutura de Configuração

Todas as configurações estão em `src/config/`:

- **database.js** - Conexão MySQL com Sequelize
- **auth.js** - Autenticação JWT
- **email.js** - Envio de emails (SMTP)
- **upload.js** - Upload de arquivos com Multer
- **pdf.js** - Geração de PDFs com PDFKit

### Variáveis de Ambiente Importantes

```bash
# Servidor
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_NAME=secretaria_online
DB_USER=root
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=gere_uma_chave_secreta_complexa_aqui
JWT_ACCESS_EXPIRATION=15m

# Email (SMTP)
SMTP_HOST=smtp.seudominio.com
SMTP_USER=noreply@seudominio.com
SMTP_PASS=senha_email

# PDF
PDF_LIBRARY=pdfkit
```

## 🎬 Execução

### Modo Development (com Hot Reload)

```bash
npm run dev
```

Servidor rodará em `http://localhost:3000`

### Modo Production

```bash
npm run start
```

### Verificar Saúde da API

```bash
curl http://localhost:3000/health
```

## 📁 Estrutura de Pastas

```
backend/
├── src/
│   ├── config/              # Configurações (database, auth, upload, pdf)
│   ├── controllers/         # Controladores (lógica de rotas)
│   ├── models/              # Modelos Sequelize
│   │   ├── Student.js       # Model da tabela students (dados completos)
│   │   ├── Teacher.js       # Model da tabela teachers (dados completos)
│   │   ├── User.js          # Model da tabela users (autenticação)
│   │   └── ...              # Outros models
│   ├── routes/              # Definição de rotas da API
│   ├── services/            # Serviços (lógica de negócio)
│   ├── middlewares/         # Middlewares (auth, validation, error)
│   ├── utils/               # Funções utilitárias
│   ├── jobs/                # Tarefas agendadas (cron)
│   └── server.js            # Entrada da aplicação
├── database/
│   ├── migrations/          # Migrations Sequelize
│   │   ├── *-create-students.js        # Cria tabela students
│   │   ├── *-add-student-id-to-users.js # Adiciona FK student_id
│   │   ├── *-create-teachers.js        # Cria tabela teachers
│   │   ├── *-add-teacher-id-to-users.js # Adiciona FK teacher_id
│   │   └── ...
│   └── seeders/             # Seeders (dados iniciais)
├── uploads/
│   ├── contracts/           # PDFs de contratos gerados
│   ├── documents/           # Documentos enviados por usuários
│   └── temp/                # Arquivos temporários
├── logs/                    # Logs da aplicação
├── tests/                   # Testes (unitários, integração, e2e)
├── .env.example             # Template de variáveis de ambiente
├── package.json             # Dependências do projeto
└── README.md               # Este arquivo
```

## 🔧 Módulos Implementados

### ✅ Autenticação (feat-001 a feat-003)
- Login com JWT
- Geração de senhas provisórias
- Validação de credenciais com bcryptjs

### ✅ Gestão de Usuários (feat-004 a feat-015, feat-064, feat-110)
- Cadastro de alunos (tabela `students` separada)
- Cadastro de professores (tabela `teachers` separada)
- Cadastro de usuários administrativos
- Reset de senhas
- **Nova estrutura**:
  - Tabela `students` armazena dados completos dos estudantes (CPF, RG, endereço, informações pessoais e acadêmicas)
  - Tabela `teachers` armazena dados completos dos professores (CPF, RG, endereço, informações pessoais e profissionais)
  - Tabela `users` gerencia apenas autenticação (login, senha, role) com relacionamento 1:1 opcional para `students` e `teachers`

### ✅ Cursos e Disciplinas (feat-016 a feat-020)
- Cadastro e gerenciamento de cursos
- Cadastro e gerenciamento de disciplinas
- Associação curso-disciplina com semestres

### ✅ Turmas (feat-021 a feat-025)
- Cadastro de turmas
- Vinculação de professores às turmas
- Vinculação de alunos às turmas

### ✅ Matrículas (feat-026 a feat-030)
- Cadastro de matrículas
- Controle de status de matrícula
- Validações de dupla matrícula

### ✅ Documentos Obrigatórios (feat-031 a feat-035)
- Definição de tipos de documentos
- Upload de documentos
- Validação e aprovação de documentos

### ✅ Gestão de Avaliações (feat-036 a feat-040, feat-051, bug-fix-2025-12-11)
- **Estrutura Corrigida**:
  - ✅ **Chave estrangeira `teacher_id` corrigida**: Agora referencia tabela `teachers` ao invés de `users`
  - ✅ **Migration executada**: `20251211002451-fix-evaluations-teacher-foreign-key.js`
  - ✅ **Busca automática de `teacher_id`**: Sistema busca automaticamente o ID do professor na tabela `teachers` a partir do usuário logado
  - ✅ **Filtro de turmas por professor**: Professores veem apenas suas próprias turmas ao criar avaliações
- **Rotas**:
  - `GET /api/v1/evaluations` - Listar todas as avaliações
  - `GET /api/v1/evaluations/:id` - Buscar avaliação por ID
  - `POST /api/v1/evaluations` - Criar nova avaliação
  - `PUT /api/v1/evaluations/:id` - Atualizar avaliação
  - `DELETE /api/v1/evaluations/:id` - Deletar avaliação
  - `GET /api/v1/classes/:classId/evaluations` - Listar avaliações de uma turma
  - `GET /api/v1/teachers/:teacherId/evaluations` - Listar avaliações de um professor
- **Funcionalidades**:
  - Cadastro de avaliações por professores e administradores
  - Tipos de avaliação: Nota (grade) ou Conceito (concept)
  - Vinculação de avaliação a turma, disciplina e professor
  - Filtragem por turma, professor ou tipo
  - Soft delete (exclusão lógica)
  - Ordenação por data (mais recentes primeiro)
  - Associações com Class, Teacher, Discipline e Grades
- **Estrutura de Requisição (POST - Criar Avaliação)**:
  ```json
  {
    "class_id": 5,
    "teacher_id": 2,
    "discipline_id": 3,
    "name": "Prova 1 - Matemática",
    "date": "2025-12-15",
    "type": "grade"
  }
  ```
  **Observação**: O campo `teacher_id` é **opcional** ao criar avaliação. Se não fornecido, o sistema busca automaticamente o `teacher_id` associado ao usuário logado (tabela `users.teacher_id`).
- **Estrutura de Resposta (GET)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "class_id": 5,
        "teacher_id": 2,
        "discipline_id": 3,
        "name": "Prova 1",
        "date": "2025-12-15",
        "type": "grade",
        "created_at": "2025-12-09T10:00:00Z",
        "updated_at": "2025-12-09T10:00:00Z",
        "class": {
          "id": 5,
          "semester": 1,
          "year": 2025
        },
        "teacher": {
          "id": 2,
          "name": "Maria Santos",
          "email": "maria@example.com"
        },
        "discipline": {
          "id": 3,
          "name": "Matemática",
          "code": "MAT101"
        }
      }
    ],
    "count": 1
  }
  ```
- **Regras de Negócio**:
  - Tipo 'grade': Avaliação por nota numérica (0-10)
  - Tipo 'concept': Avaliação por conceito (satisfactory/unsatisfactory)
  - Professor e disciplina devem existir e estar vinculados à turma
  - Validação de dados no backend (campo obrigatórios, tipos válidos)
  - RBAC: Admin e Professor podem criar/editar, Estudante pode visualizar

### ✅ Lançamento de Notas (feat-036 a feat-040, feat-052, feat-053, bug-fix-2025-12-11)
- **Estrutura Corrigida**:
  - ✅ **Chave estrangeira `student_id` corrigida**: Agora referencia tabela `students` ao invés de `users`
  - ✅ **Migration executada**: `20251211142545-fix-grades-student-fk.js`
  - ✅ **Modelo `Grade.js` corrigido**: Associação alterada de `User` para `Student`
  - ✅ **Service `grade.service.js` corrigido**: Busca alunos na tabela `students` com campo `nome` (ao invés de `name`)
  - ✅ **Controller `grade.controller.js` corrigido**: Bind de métodos para manter contexto `this`
- **Rotas**:
  - `POST /api/v1/grades` - Lançar nota individual
  - `PUT /api/v1/grades/:id` - Atualizar nota existente
  - `GET /api/v1/grades/my-grades` - Obter notas do aluno autenticado
  - `GET /api/v1/evaluations/:id/grades` - Listar notas de uma avaliação
  - `GET /api/v1/evaluations/:id/grades/stats` - Estatísticas de lançamento
  - `GET /api/v1/evaluations/:id/grades/pending` - Notas pendentes de uma avaliação
  - `POST /api/v1/evaluations/:id/grades/batch` - Lançamento em lote
- **Funcionalidades**:
  - Lançamento de notas individuais por professores
  - Lançamento em lote para múltiplos alunos
  - Suporte para nota numérica (0-10) ou conceito (satisfactory/unsatisfactory)
  - Validação de permissões (professor deve lecionar a disciplina)
  - Validação de aluno matriculado na turma
  - Consulta de notas por avaliação, aluno ou disciplina
  - Estatísticas de lançamento (total, lançadas, pendentes)
  - Soft delete (exclusão lógica)
- **Validações**:
  - Professor deve lecionar a disciplina da avaliação
  - Aluno deve estar matriculado na turma da avaliação
  - Nota numérica deve estar entre 0 e 10
  - Conceito deve ser 'satisfactory' ou 'unsatisfactory'
  - Apenas grade OU concept pode ser preenchido (não ambos)

### ✅ Upload de Arquivos (feat-041 a feat-045)
- Configuração de Multer
- Validação de tipos e tamanhos
- Armazenamento organizado

### ✅ Geração de PDFs (feat-046)
- Instalação de PDFKit
- Configuração de diretórios
- Utilitários para geração de PDFs

### ✅ Gestão de Cursos do Estudante
- **Rotas**:
  - `GET /api/v1/students/:studentId/enrollments` - Listar matrículas do estudante
  - `POST /api/v1/enrollments` - Criar nova matrícula (cadastrar estudante em curso)
  - `PUT /api/v1/enrollments/:id/status` - Alterar status da matrícula
- **Funcionalidades**:
  - Listar todas as matrículas de um estudante específico
  - Cadastrar estudante em novo curso (cria matrícula com status "pending")
  - Alterar status da matrícula (pending, active, cancelled)
  - Retorna dados do curso associado (nome, duração, tipo, descrição)
  - Filtra automaticamente registros deletados (soft delete)
  - Ordenação por data de matrícula (decrescente)
  - Associações com dados do curso carregados
  - Validação para evitar matrículas duplicadas
- **Estrutura de Resposta (GET)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "student_id": 146,
        "course_id": 2,
        "status": "active",
        "enrollment_date": "2025-12-01",
        "created_at": "2025-12-01T10:00:00Z",
        "updated_at": "2025-12-01T10:00:00Z",
        "course": {
          "id": 2,
          "name": "Engenharia de Software",
          "duration": 6,
          "duration_type": "Semestres",
          "description": "Curso de engenharia...",
          "courseType": "Superior"
        }
      }
    ]
  }
  ```
- **Estrutura de Requisição (POST - Criar Matrícula)**:
  ```json
  {
    "student_id": 146,
    "course_id": 2,
    "enrollment_date": "2025-12-09"
  }
  ```
- **Estrutura de Requisição (PUT - Alterar Status)**:
  ```json
  {
    "status": "active"
  }
  ```
- **Regras de Negócio**:
  - Matrícula criada com status "pending" por padrão
  - Status válidos: "pending", "active", "cancelled"
  - Administrador pode ativar matrícula manualmente (validação de documentos desabilitada)
  - Permite alterar status de qualquer matrícula (pending → active, cancelled → active, etc.)

### ✅ Gestão de Disciplinas do Curso
- **Rotas**:
  - `GET /api/v1/courses/:courseId/disciplines` - Listar disciplinas do curso
  - `POST /api/v1/courses/:courseId/disciplines` - Adicionar disciplina ao curso
  - `DELETE /api/v1/courses/:courseId/disciplines/:disciplineId` - Remover disciplina do curso
- **Funcionalidades**:
  - Listar todas as disciplinas vinculadas a um curso específico
  - Retorna dados da disciplina com informações do semestre
  - Adicionar disciplina à grade curricular do curso com semestre definido
  - Remover disciplina da grade curricular do curso
  - Associações através da tabela `course_disciplines`
- **Estrutura de Resposta (GET)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 5,
        "name": "Matemática Aplicada",
        "code": "MAT101",
        "workload_hours": 80,
        "course_disciplines": {
          "semester": 1
        },
        "created_at": "2025-12-08T10:00:00Z",
        "updated_at": "2025-12-08T10:00:00Z"
      }
    ]
  }
  ```
- **Estrutura de Requisição (POST)**:
  ```json
  {
    "disciplineId": 5,
    "semester": 1
  }
  ```

### 🔄 Rematrícula Global de Estudantes (Em Desenvolvimento)

**Status:** 🏗️ Em implementação - Etapa 4/9 concluída

**Descrição:** Sistema de rematrícula semestral/anual global que permite processar rematrículas em lote de TODOS os estudantes do sistema e controle de aceite de contratos.

**Objetivo:** Automatizar o processo de renovação de matrículas semestrais, permitindo que administradores processem rematrículas globalmente e estudantes aceitem contratos de renovação antes de retornar ao sistema.

#### 📋 Etapas do Desenvolvimento

- ✅ **Etapa 1: Análise e Modelagem de Dados** (Concluída em 2025-12-15)
  - Análise completa da estrutura atual do banco de dados
  - Identificação de campos e relacionamentos necessários
  - Documentação técnica criada: `docs/analise_rematricula.md`
  - **Principais Conclusões:**
    - ✅ Model `Enrollment.js`: Não precisa de alterações estruturais (campos semester/year não necessários)
    - ⚠️ Model `Contract.js`: Necessita de 2 mudanças:
      1. Adicionar campo `enrollment_id` (FK para enrollments, nullable)
      2. Alterar `file_path` e `file_name` para nullable (suportar contratos sem PDF)
    - ✅ Retrocompatibilidade garantida para dados existentes
    - ✅ Impacto avaliado e documentado

- ✅ **Etapa 2: Migrations e Atualização de Models** (Concluída em 2025-12-15)
  - ✅ Criadas 2 migrations:
    1. **`20251215120000-add-enrollment-id-to-contracts.js`**
       - Adiciona campo `enrollment_id` (INTEGER, nullable) à tabela `contracts`
       - Cria FK constraint: `fk_contracts_enrollment_id` → `enrollments.id`
       - Cria índice `idx_contracts_enrollment_id` para performance
       - Cria índice composto `idx_contracts_enrollment_period` (enrollment_id, semester, year)
       - Rollback: Remove coluna, constraints e índices
    2. **`20251215120001-allow-null-file-fields-in-contracts.js`**
       - Altera `file_path` para nullable (permite contratos sem PDF)
       - Altera `file_name` para nullable (permite contratos sem PDF)
       - Verifica existência de contratos com file_path NULL antes de rollback
       - Rollback: Restaura campos para NOT NULL (pode falhar se existirem contratos sem PDF)
  - ✅ Atualizado `Contract.js`:
    - Adicionado campo `enrollment_id` com validação customizada
    - Alterados `file_path` e `file_name` para nullable com validações
    - Adicionada associação `belongsTo(Enrollment)` com alias 'enrollment'
    - Adicionados métodos: `hasPDF()` e `getContractType()`
  - ✅ Atualizado `Enrollment.js`:
    - Adicionada associação `hasMany(Contract)` com alias 'contracts'
  - ✅ Migrations executadas com sucesso no banco de desenvolvimento
  - ✅ Rollback testado e funcionando corretamente

- ✅ **Etapa 3: Backend - Service de Rematrícula** (Concluída em 2025-12-15)
  - ✅ Criado `ReenrollmentService` (`src/services/reenrollment.service.js`)
  - ✅ Implementado método `validateAdminPassword(userId, password)`:
    - Busca usuário por ID e valida que é admin
    - Compara senha fornecida com hash usando bcrypt
    - Retorna true/false conforme validação
    - Lança AppError se usuário não existe ou não é admin
  - ✅ Implementado método `processGlobalReenrollment(semester, year, adminUserId)`:
    - Busca TODOS os enrollments ativos do sistema (não por curso)
    - Atualiza status de 'active' para 'pending' em batch
    - Usa transação do Sequelize para garantir atomicidade
    - Registra log detalhado da operação (admin_id, total_affected, semester, year)
    - Retorna objeto com totalStudents e affectedEnrollmentIds
    - Rollback automático em caso de erro
  - ✅ Service implementado seguindo padrões do projeto:
    - Logging detalhado com Winston
    - Tratamento de erros com AppError
    - Documentação JSDoc completa
    - Validações de regras de negócio

- ✅ **Etapa 4: Backend - Controller e Rotas** (Concluída em 2025-12-15)
  - ✅ Criado `ReenrollmentController` (`src/controllers/reenrollment.controller.js`)
  - ✅ Implementado método `processGlobalReenrollment(req, res, next)`:
    - Valida request body com express-validator (semester, year, adminPassword)
    - Valida senha do admin com ReenrollmentService.validateAdminPassword()
    - Retorna erro 401 se senha incorreta
    - Chama ReenrollmentService.processGlobalReenrollment()
    - Retorna resposta 200 com totalStudents e affectedEnrollmentIds
    - Tratamento de erros com middleware next(error)
  - ✅ Criado arquivo de rotas `src/routes/reenrollment.routes.js`:
    - Endpoint: `POST /api/v1/reenrollments/process-all`
    - Middlewares: authenticate + authorizeAdmin (apenas admin)
    - Validações: semester (1-2), year (YYYY), adminPassword (min 6 chars)
    - handleValidationErrors para retornar erros de validação
  - ✅ Rotas registradas em `src/routes/index.js` com prefixo `/reenrollments`
  - ✅ Documentação completa com JSDoc em controller e rotas

- ✅ **Etapa 5: Frontend - Interface de Rematrícula Global** (Concluída em 2025-12-15)
  - Página administrativa para rematrícula global
  - Modal de confirmação com senha
  - Feedback de progresso

- ✅ **Etapa 6: Backend - Preview de Contrato HTML** (Concluída em 2025-12-15)
  - ✅ Endpoint implementado: `GET /api/v1/reenrollments/contract-preview/:enrollmentId`
  - ✅ Método `getReenrollmentContractPreview()` criado em ReenrollmentService
  - ✅ Método `previewContract()` criado em ReenrollmentController
  - ✅ Rota registrada em `reenrollment.routes.js`
  - ✅ Reutilização de `ContractTemplate.replacePlaceholders()`
  - ✅ Retorna HTML renderizado (sem PDF)
  - ✅ Validação de ownership (apenas dono do enrollment pode visualizar)
  - ✅ Validação de status (apenas enrollments 'pending')
  - ✅ Suporte a placeholders: studentName, studentId, cpf, courseName, semester, year, date, institutionName
  - ✅ Documentação completa em README

- ⏳ **Etapa 7: Frontend - Tela de Aceite** (Em Progresso - Parcialmente Concluída em 2025-12-15)
  - ✅ Tipos TypeScript criados (`IContractPreviewResponse`, `IAcceptReenrollmentResponse`)
  - ✅ Service atualizado com métodos `getContractPreview()` e `acceptReenrollment()`
  - ✅ Hooks criados: `useContractPreview()` e `useAcceptReenrollment()`
  - ✅ Página `ReenrollmentAcceptance.tsx` criada com interface completa
  - ⏳ **PENDENTE**: Adicionar rota `/student/reenrollment-acceptance` no router
  - ⏳ **PENDENTE**: Atualizar `AuthContext` para verificar enrollment pending e redirecionar
  - ⏳ **PENDENTE**: Implementar lógica de bloqueio de acesso em `PrivateRoute` ou `App.tsx`
  - ⏳ **PENDENTE**: Atualizar frontend/README.md com documentação completa

- ⏳ **Etapa 8: Backend - Endpoint de Aceite** (Não Iniciada)
  - Endpoint: `POST /api/v1/reenrollments/accept/:enrollmentId`
  - Atualizar enrollment status: 'pending' → 'active'
  - **CRIAR contrato após aceite** com `file_path=null` e `file_name=null`
  - Transação para garantir atomicidade

- ⏳ **Etapa 9: Documentação Final**
  - Consolidar documentação de todas as etapas
  - Atualizar changelogs
  - Atualizar API docs

#### 💡 Uso do ReenrollmentService

O `ReenrollmentService` está localizado em `backend/src/services/reenrollment.service.js` e fornece dois métodos principais:

**1. Validar senha do administrador:**
```javascript
const ReenrollmentService = require('./services/reenrollment.service');

// Validar senha do admin antes de operação crítica
const isValid = await ReenrollmentService.validateAdminPassword(adminUserId, 'senha123');

if (!isValid) {
  throw new AppError('Senha incorreta', 401);
}
```

**2. Processar rematrícula global:**
```javascript
const ReenrollmentService = require('./services/reenrollment.service');

try {
  // Processar rematrícula de TODOS os estudantes do sistema
  const result = await ReenrollmentService.processGlobalReenrollment(
    1,           // semester (1 ou 2)
    2025,        // year
    adminUserId  // ID do admin que executou
  );

  console.log(`Total de estudantes rematriculados: ${result.totalStudents}`);
  console.log(`IDs dos enrollments afetados:`, result.affectedEnrollmentIds);
} catch (error) {
  console.error('Erro ao processar rematrícula:', error.message);
  // Transação foi revertida automaticamente
}
```

**Características importantes:**
- ✅ Usa transação do Sequelize (rollback automático em caso de erro)
- ✅ Processa TODOS os enrollments ativos do sistema em batch
- ✅ Registra log detalhado com Winston (admin_id, total_affected, semester, year)
- ✅ NÃO cria contratos (contratos serão criados após aceite do estudante - Etapa 8)
- ✅ Retorna lista de IDs dos enrollments afetados para auditoria

#### 🔑 Conceitos Principais

**Rematrícula Global:**
- Processa TODOS os enrollments ativos do sistema de uma vez (não por curso individual)
- Admin define semestre, ano e confirma com senha
- Todos os enrollments com status 'active' são atualizados para 'pending'
- **Contratos NÃO são criados** durante o processamento em lote
- Utiliza transações do Sequelize para garantir atomicidade

**Aceite de Rematrícula:**
- Estudantes com enrollment 'pending' devem aceitar contrato antes de acessar o sistema
- **Contrato é criado SOMENTE após aceite** do estudante
- Contrato de rematrícula não possui PDF (`file_path=null`, `file_name=null`)
- Após aceite: enrollment volta para 'active' e estudante acessa normalmente

**Estrutura de Dados:**
```
Enrollment (matrícula no curso)
  ├── status: 'pending' | 'active' | 'cancelled'
  ├── NÃO possui semester/year (curso completo, não semestral)
  └── hasMany Contract (1 enrollment pode ter vários contratos ao longo do tempo)

Contract (renovação semestral)
  ├── enrollment_id (FK para enrollments) ← NOVO
  ├── semester, year (período específico do contrato)
  ├── file_path, file_name (nullable para contratos de rematrícula) ← ALTERADO
  ├── accepted_at (data do aceite)
  └── belongsTo Enrollment ← NOVO
```

#### 📚 Documentação Relacionada

- **Backlog Completo:** `backlog/backlog_rematricula.json`
- **Análise Técnica:** `docs/analise_rematricula.md` ✅
- **Contexto do Sistema:** `docs/contextDoc.md`

#### ⚠️ Notas Importantes

- ✅ Reutilizar sistema existente de `ContractTemplate` (não criar novo)
- ✅ Usar transações do Sequelize em operações críticas
- ✅ Manter retrocompatibilidade com contratos e enrollments existentes
- ✅ Contratos antigos continuam funcionando normalmente (com PDF)
- ✅ Contratos de rematrícula funcionam sem PDF (apenas registro de aceite)

---

## 📡 API Endpoints

### Autenticação

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "login": "usuario",
  "password": "senha"
}
```

Resposta:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": 1,
      "name": "Admin",
      "role": "admin"
    }
  }
}
```

### Usuários (Admin Only)

```http
# Listar usuários
GET /api/v1/users

# Criar usuário
POST /api/v1/users
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "login": "joao_silva",
  "password": "senha_provisoria",
  "cpf": "12345678901",
  "role": "student"
}

# Obter usuário
GET /api/v1/users/:id

# Atualizar usuário
PUT /api/v1/users/:id

# Deletar usuário
DELETE /api/v1/users/:id
```

### Alunos

```http
# Listar alunos (da tabela students)
GET /api/v1/students

# Criar aluno (cria registro na tabela students)
POST /api/v1/students
Content-Type: application/json

{
  "nome": "João Silva",
  "cpf": "12345678901",
  "email": "joao@example.com",
  "data_nascimento": "2000-01-15",
  "telefone": "31999999999",
  ...
}

# Obter aluno
GET /api/v1/students/:id

# Atualizar aluno
PUT /api/v1/students/:id

# Criar usuário de login para estudante existente
POST /api/v1/students/:id/user
{
  "login": "joao.silva",
  "password": "senha_provisoria"
}
```

### Professores

```http
# Listar professores (da tabela teachers)
GET /api/v1/teachers

# Criar professor (cria registro na tabela teachers)
POST /api/v1/teachers
Content-Type: application/json

{
  "nome": "Maria Santos",
  "cpf": "12345678901",
  "email": "maria@example.com",
  "data_nascimento": "1985-05-20",
  "telefone": "31999999999",
  "celular": "31987654321",
  "endereco_rua": "Rua das Flores",
  "endereco_numero": "123",
  "endereco_bairro": "Centro",
  "endereco_cidade": "Belo Horizonte",
  "endereco_uf": "MG",
  "cep": "30000000",
  "mae": "Ana Santos",
  "sexo": "F",
  ...
}

# Obter professor
GET /api/v1/teachers/:id

# Atualizar professor
PUT /api/v1/teachers/:id

# Criar usuário de login para professor existente
POST /api/v1/teachers/:id/user
{
  "login": "maria.santos",
  "password": "senha_provisoria"
}

# Reset de senha (requer user_id)
POST /api/v1/teachers/:userId/reset-password
```

### Cursos

```http
# Listar cursos
GET /api/v1/courses

# Criar curso
POST /api/v1/courses

# Obter curso
GET /api/v1/courses/:id

# Gerenciamento de Disciplinas do Curso

# Listar disciplinas de um curso
GET /api/v1/courses/:id/disciplines

# Adicionar disciplina ao curso
POST /api/v1/courses/:id/disciplines
Content-Type: application/json

{
  "disciplineId": 5,
  "semester": 1
}

# Remover disciplina do curso
DELETE /api/v1/courses/:id/disciplines/:disciplineId
```

### Matrículas

```http
# Listar todas as matrículas (admin only)
GET /api/v1/enrollments

# Listar matrículas de um estudante específico
GET /api/v1/students/:studentId/enrollments

# Criar matrícula (cadastrar estudante em curso)
POST /api/v1/enrollments
Content-Type: application/json

{
  "student_id": 146,
  "course_id": 2,
  "enrollment_date": "2025-12-09"
}

# Resposta:
{
  "success": true,
  "message": "Matrícula criada com sucesso com status \"pending\"",
  "data": {
    "id": 5,
    "student_id": 146,
    "course_id": 2,
    "status": "pending",
    "enrollment_date": "2025-12-09",
    "created_at": "2025-12-09T10:00:00Z",
    "updated_at": "2025-12-09T10:00:00Z"
  }
}

# Atualizar status de matrícula
PUT /api/v1/enrollments/:id/status
Content-Type: application/json

{
  "status": "active"
}

# Resposta:
{
  "success": true,
  "message": "Status da matrícula alterado para 'active'",
  "data": {
    "id": 5,
    "student_id": 146,
    "course_id": 2,
    "status": "active",
    "enrollment_date": "2025-12-09",
    "created_at": "2025-12-09T10:00:00Z",
    "updated_at": "2025-12-09T10:30:00Z"
  }
}
```

### Documentos

```http
# Listar documentos
GET /api/v1/documents

# Upload de documento
POST /api/v1/documents
Content-Type: multipart/form-data

# Aprovar documento
PUT /api/v1/documents/:id/approve

# Rejeitar documento
PUT /api/v1/documents/:id/reject
```

### Avaliações

```http
# Listar todas as avaliações
GET /api/v1/evaluations
Authorization: Bearer <token>

# Criar avaliação
POST /api/v1/evaluations
Authorization: Bearer <token>
Content-Type: application/json

{
  "class_id": 5,
  "teacher_id": 2,
  "discipline_id": 3,
  "name": "Prova 1 - Matemática",
  "date": "2025-12-15",
  "type": "grade"
}

# Obter avaliação por ID
GET /api/v1/evaluations/:id
Authorization: Bearer <token>

# Atualizar avaliação
PUT /api/v1/evaluations/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Prova 1 - Matemática (Revisada)",
  "date": "2025-12-20"
}

# Deletar avaliação
DELETE /api/v1/evaluations/:id
Authorization: Bearer <token>

# Listar avaliações de uma turma
GET /api/v1/classes/:classId/evaluations
Authorization: Bearer <token>

# Listar avaliações de um professor
GET /api/v1/teachers/:teacherId/evaluations
Authorization: Bearer <token>
```

### Notas

```http
# Listar notas de uma turma
GET /api/v1/classes/:classId/grades

# Criar nota
POST /api/v1/grades

# Atualizar nota
PUT /api/v1/grades/:id
```

### Rematrícula Global (Admin Only)

```http
# Processar rematrícula global de TODOS os estudantes
POST /api/v1/reenrollments/process-all
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "semester": 1,
  "year": 2025,
  "adminPassword": "senha_admin"
}

# Resposta de sucesso (200):
{
  "success": true,
  "data": {
    "totalStudents": 150,
    "affectedEnrollmentIds": [1, 2, 3, ...]
  },
  "message": "Rematrícula global processada com sucesso. 150 estudantes rematriculados."
}

# Resposta de erro - Senha incorreta (401):
{
  "success": false,
  "error": "Senha incorreta"
}

# Resposta de erro - Validação falhou (400):
{
  "success": false,
  "error": "Dados inválidos",
  "details": [
    {
      "msg": "semester deve ser 1 ou 2",
      "param": "semester",
      "location": "body"
    }
  ]
}
```

**Observações importantes:**
- ✅ Processa TODOS os enrollments ativos do sistema (não por curso individual)
- ✅ Atualiza status de 'active' para 'pending'
- ✅ Usa transação do Sequelize (rollback automático em caso de erro)
- ✅ NÃO cria contratos (criados após aceite do estudante na Etapa 8)
- ✅ Requer autenticação JWT e role 'admin'
- ✅ Validação de senha do administrador obrigatória

```http
# Preview de Contrato HTML para Estudante (Etapa 6)
GET /api/v1/reenrollments/contract-preview/:enrollmentId
Authorization: Bearer <student_token>

# Resposta de sucesso (200):
{
  "success": true,
  "data": {
    "contractHTML": "<html>...</html>",
    "enrollmentId": 5,
    "semester": 1,
    "year": 2025
  }
}

# Resposta de erro - Não é dono do enrollment (403):
{
  "success": false,
  "error": "Você não tem permissão para visualizar este contrato"
}

# Resposta de erro - Enrollment não encontrado (404):
{
  "success": false,
  "error": "Matrícula não encontrada"
}

# Resposta de erro - Enrollment não está pending (422):
{
  "success": false,
  "error": "Esta matrícula não está pendente de aceite (status atual: active)"
}

# Resposta de erro - Sem template disponível (422):
{
  "success": false,
  "error": "Nenhum template de contrato disponível. Entre em contato com a administração."
}
```

**Observações sobre preview de contrato:**
- ✅ Retorna HTML renderizado pronto para exibição (NÃO gera PDF)
- ✅ Apenas estudantes (role: 'student') podem acessar
- ✅ Validação de ownership: apenas dono do enrollment pode visualizar
- ✅ Apenas enrollments com status 'pending' podem ter preview
- ✅ Reutiliza sistema existente de ContractTemplate com método replacePlaceholders()
- ✅ Placeholders suportados: {{studentName}}, {{studentId}}, {{cpf}}, {{courseName}}, {{semester}}, {{year}}, {{date}}, {{institutionName}}

Para documentação completa da API, veja `docs/api-documentation.md`

### 📌 Observações Importantes sobre Matrículas

- A rota `GET /api/v1/students/:studentId/enrollments` está disponível em `student.routes.js`
- Esta rota retorna todas as matrículas de um estudante com dados do curso carregados
- Usuários autenticados podem acessar esta rota (validação de acesso é feita no frontend)
- A resposta inclui o status da matrícula (pending, active, cancelled)
- Cursos deletados são filtrados automaticamente (soft delete)

## 🧪 Testes

### Executar Todos os Testes

```bash
npm run test
```

### Executar Testes de Um Módulo

```bash
npm run test -- auth
npm run test -- users
```

### Executar com Coverage

```bash
npm run test:coverage
```

## 🐛 Troubleshooting

### Erro: "Error: connect ECONNREFUSED 127.0.0.1:3306"

**Problema:** Banco de dados MySQL não está rodando

**Solução:**
```bash
# Windows
net start MySQL80

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

### Erro: "ER_DBACCESS_DENIED_ERROR"

**Problema:** Credenciais de banco de dados incorretas no `.env`

**Solução:** Verificar `DB_USER`, `DB_PASSWORD`, `DB_HOST` no arquivo `.env`

### Erro: "ENOENT: no such file or directory, mkdir"

**Problema:** Diretórios de upload não foram criados

**Solução:**
```bash
mkdir -p uploads/contracts
mkdir -p uploads/documents
mkdir -p uploads/temp
```

### Erro ao gerar PDF: "Cannot find module 'pdfkit'"

**Problema:** PDFKit não foi instalado

**Solução:**
```bash
npm install pdfkit
```

### Porta 3000 já em uso

**Problema:** Outra aplicação está usando a porta 3000

**Solução (Windows):**
```bash
# Encontrar processo usando porta 3000
netstat -ano | findstr :3000

# Matar o processo (PID)
taskkill /PID <PID> /F

# Ou usar porta diferente
set PORT=3001 && npm run dev
```

**Solução (macOS/Linux):**
```bash
# Encontrar processo usando porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar porta diferente
PORT=3001 npm run dev
```

## 📝 Logs

Logs são salvos em `logs/` com os seguintes arquivos:

- **error.log** - Apenas erros
- **combined.log** - Todos os logs
- **access.log** - Requisições HTTP

Em desenvolvimento, logs também aparecem no console.

## 🔒 Segurança

### Headers de Segurança

Todos os headers de segurança são implementados via Helmet.js:

- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- HTTP Strict Transport Security (HSTS)

### Rate Limiting

O limite de requisições está ativado:

- Login: máximo 5 tentativas por IP a cada 15 minutos
- API geral: limites por endpoint

### Validação de Input

Todas as requisições são validadas com:

- `express-validator` no backend
- Sanitização de dados
- Type checking

## 🚀 Deploy em Produção

### Hostgator (Shared Hosting)

1. **Preparar aplicação:**
```bash
npm run build
```

2. **Upload via SFTP:**
   - Backend para `/home/usuario/api/`
   - Frontend para `/home/usuario/public_html/`

3. **Configurar no cPanel:**
   - Node.js App Setup
   - Set Node.js version to 20
   - Set app root directory
   - Set app startup file to `server.js`

4. **Instalar dependências em produção:**
```bash
npm install --production
```

5. **Executar migrations:**
```bash
npm run migrate
```

6. **Iniciar aplicação:**
```bash
npm start
```

## 📚 Recursos Adicionais

- [Documentação de Requisitos](../docs/requirements.md)
- [Documentação de Contexto](../docs/contextDoc.md)
- [Documentação de API](../docs/api-documentation.md)
- [Decisão de PDF](../docs/PDF_DECISION.md)

## 📄 Licença

Proprietary - Sistema Secretaria Online

## 👥 Contribuidores

Desenvolvido seguindo as melhores práticas de:
- Clean Code
- SOLID Principles
- REST API Standards
- Security Best Practices

---

**Última atualização:** 2025-12-11
**Versão:** 0.3.1

## 📝 Changelog

### Versão 0.3.1 (2025-12-11) - Correções Arquiteturais Críticas
- 🔧 **CORREÇÃO CRÍTICA**: Corrigida FK `student_id` na tabela `grades`
  - **Antes**: `grades.student_id` referenciava `users.id` (incorreto)
  - **Depois**: `grades.student_id` referencia `students.id` (correto)
  - Migration executada: `20251211142545-fix-grades-student-fk.js`
  - Modelo `Grade.js` atualizado com associação para `Student` ao invés de `User`
  - Migration original `20251027181409-create-grades.js` corrigida
- 🔧 **CORREÇÃO**: Corrigido `GradeService` para usar tabela `students`
  - Método `_getAndValidateStudent` alterado para usar `Student.findByPk`
  - Atributo `name` alterado para `nome` (campo correto na tabela students)
  - Todos os includes alterados de `model: User` para `model: Student`
  - Import atualizado de `User` para `Student`
- 🔧 **CORREÇÃO**: Corrigido contexto `this` em `GradeController`
  - Adicionado construtor com bind de todos os métodos públicos
  - Resolvido erro: "Cannot read properties of undefined (reading '_validateTeacherOwnership')"
- 🔧 **MELHORIA**: Validação de professor em avaliações
  - Adicionada validação no `EvaluationService` para verificar se professor leciona a disciplina na turma antes de criar avaliação
  - Corrigidas 2 avaliações inconsistentes existentes no banco (IDs 4 e 5)
- 🔧 **MELHORIA**: Filtro de avaliações por professor
  - Métodos `list()` e `listByClass()` do `EvaluationService` agora filtram avaliações quando usuário é professor
  - Professores veem apenas suas próprias avaliações
  - Controllers atualiza dos para passar `currentUser` aos services

### Versão 0.3.0 (2025-12-09)
- ✅ **NOVO**: Sistema completo de gestão de avaliações
- ✅ Adicionada rota `GET /api/v1/evaluations` para listar todas as avaliações
- ✅ Adicionado método `list()` no `EvaluationController` e `EvaluationService`
- ✅ Corrigidas associações no `EvaluationService` (adicionado `as` para Class, Discipline e Grade)
- ✅ Adicionado item "Avaliações" no menu Sidebar para Admin e Professor
- ✅ Corrigido erro de coluna `duration_semesters` em `ClassService` (substituído por `duration` e `duration_type`)
- ✅ API de avaliações totalmente funcional com CRUD completo
- ✅ Documentação atualizada com endpoints e exemplos de uso

### Versão 0.2.1 (2025-12-09)
- ✅ Adicionada funcionalidade de cadastrar estudante em novo curso
- ✅ Adicionada funcionalidade de alterar status da matrícula
- ✅ Corrigido `EnrollmentService` para buscar estudantes na tabela `students`
- ✅ Removida restrição de status ao ativar matrícula (agora permite ativar de qualquer status)
- ✅ Desabilitada validação de documentos obrigatórios para ativação manual pelo admin
- ✅ Atualizado README com novas funcionalidades e exemplos de uso
