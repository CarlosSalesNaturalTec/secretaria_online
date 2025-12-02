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
  - Tabela `students` armazena dados completos dos estudantes, tabela `users` gerencia autenticação. Relacionamento 1:1 opcional via `users.student_id`
  - Tabela `teachers` armazena dados completos dos professores, tabela `users` gerencia autenticação. Relacionamento 1:1 opcional via `users.teacher_id`

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
```

### Matrículas

```http
# Listar matrículas
GET /api/v1/enrollments

# Criar matrícula
POST /api/v1/enrollments

# Atualizar status de matrícula
PUT /api/v1/enrollments/:id/status
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

**Última atualização:** 2025-11-01
**Versão:** 0.1.0
