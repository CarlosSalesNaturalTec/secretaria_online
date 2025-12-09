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

### ✅ Avaliações e Notas (feat-036 a feat-040)
- Cadastro de avaliações
- Lançamento de notas
- Cálculo de médias

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

### Notas

```http
# Listar notas de uma turma
GET /api/v1/classes/:classId/grades

# Criar nota
POST /api/v1/grades

# Atualizar nota
PUT /api/v1/grades/:id
```

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

**Última atualização:** 2025-12-09
**Versão:** 0.2.1

## 📝 Changelog

### Versão 0.2.1 (2025-12-09)
- ✅ Adicionada funcionalidade de cadastrar estudante em novo curso
- ✅ Adicionada funcionalidade de alterar status da matrícula
- ✅ Corrigido `EnrollmentService` para buscar estudantes na tabela `students`
- ✅ Removida restrição de status ao ativar matrícula (agora permite ativar de qualquer status)
- ✅ Desabilitada validação de documentos obrigatórios para ativação manual pelo admin
- ✅ Atualizado README com novas funcionalidades e exemplos de uso
