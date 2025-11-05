# Secretaria Online

Sistema de gestão acadêmica para instituição de ensino com ~200 alunos e ~10 professores.

## 📋 Descrição

A **Secretaria Online** é uma aplicação web destinada à automação dos processos administrativos e acadêmicos de instituições de ensino. O sistema centraliza e digitaliza o gerenciamento de alunos, professores, cursos, disciplinas, matrículas, turmas, contratos e documentos acadêmicos.

### Principais Funcionalidades

- **Módulo Administrativo**: Gestão completa de usuários, cursos, turmas, matrículas, documentos e solicitações
- **Módulo Aluno**: Consulta de notas, upload de documentos, solicitações acadêmicas
- **Módulo Professor**: Gestão de turmas, lançamento de notas e avaliações

## 🚀 Tecnologias Utilizadas

### Frontend
- React 18.x com TypeScript
- Vite (Build Tool)
- React Router DOM (Roteamento)
- TanStack Query (Gerenciamento de estado servidor)
- Tailwind CSS (Estilização)
- React Hook Form + Zod (Validação de formulários)
- Axios (Cliente HTTP)

### Backend
- Node.js v20 LTS
- Express.js 4.x
- Sequelize (ORM)
- MySQL 8.0
- JWT (Autenticação)
- bcryptjs (Hash de senhas)
- Helmet.js (Headers de segurança)
- CORS (Cross-Origin Resource Sharing)
- express-validator (Validação de requisições)
- Multer (Upload de arquivos) ✨ **feat-041**
- Nodemailer (Envio de emails)
- PDFKit (Geração de PDFs) ✨ **feat-046** (Puppeteer como alternativa)
- Winston (Logging)

## 📁 Estrutura do Projeto

```
secretaria-online/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/          # Páginas/Views
│   │   ├── services/       # Comunicação com API
│   │   ├── hooks/          # Custom React Hooks
│   │   ├── contexts/       # Context API
│   │   ├── utils/          # Utilitários
│   │   └── types/          # TypeScript types
│   └── package.json
│
├── backend/                  # Aplicação Node.js/Express
│   ├── src/
│   │   ├── config/         # Configurações
│   │   ├── controllers/    # Controladores
│   │   ├── models/         # Modelos Sequelize
│   │   ├── routes/         # Definição de rotas
│   │   ├── middlewares/    # Middlewares
│   │   ├── services/       # Lógica de negócio
│   │   ├── utils/          # Utilitários
│   │   └── jobs/           # Tarefas agendadas
│   ├── database/
│   │   ├── migrations/     # Migrations Sequelize
│   │   └── seeders/        # Seeders
│   ├── uploads/            # Arquivos uploadados
│   └── package.json
│
├── docs/                     # Documentação
│   ├── requirements.md
│   ├── contextDoc.md
│   └── backlog.json
│
└── README.md
```

## 🔧 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (v20 LTS ou superior)
- [MySQL](https://www.mysql.com/) (v8.0 ou superior)
- [Git](https://git-scm.com/)
- Editor de código (recomendado: [VS Code](https://code.visualstudio.com/))

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd secretaria_online
```

### 2. Configure o Backend

#### 2.1 Instale as dependências

```bash
cd backend
npm install
```

#### 2.2 Configure as variáveis de ambiente

Crie o arquivo `.env` baseado no `.env.example`:

```bash
# Linux/Mac
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env

# Windows (CMD)
copy .env.example .env
```

#### 2.3 Edite o arquivo `.env` com suas configurações

**Variáveis obrigatórias mínimas:**

```env
# ====================
# SERVIDOR
# ====================
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

# ====================
# BANCO DE DADOS
# ====================
DB_HOST=localhost
DB_PORT=3306
DB_NAME=secretaria_online
DB_USER=root
DB_PASSWORD=sua_senha_mysql_aqui
DB_POOL_MAX=25
DB_POOL_MIN=5

# ====================
# JWT (AUTENTICAÇÃO)
# ====================
# IMPORTANTE: Gere uma chave secreta forte com:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=sua_chave_secreta_complexa_de_pelo_menos_32_caracteres
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# ====================
# EMAIL (SMTP)
# ====================
SMTP_HOST=smtp.hostgator.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@seudominio.com
SMTP_PASS=sua_senha_email
SMTP_FROM="Secretaria Online <noreply@seudominio.com>"

# ====================
# UPLOAD DE ARQUIVOS
# ====================
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/jpg,image/png

# ====================
# LOGS
# ====================
LOG_LEVEL=debug
LOG_PATH=./logs

# ====================
# SEGURANÇA
# ====================
RATE_LIMIT_LOGIN_MAX=5
RATE_LIMIT_LOGIN_WINDOW=15
CORS_ORIGIN=http://localhost:5173

# ====================
# GERAÇÃO DE PDF
# ====================
PDF_LIBRARY=pdfkit
CONTRACTS_TEMPLATE_PATH=./templates/contracts

# ====================
# CRON JOBS
# ====================
ENABLE_TEMP_CLEANUP=true
TEMP_FILES_RETENTION_DAYS=7
ENABLE_CONTRACT_RENEWAL=true

# ====================
# OUTROS
# ====================
API_PREFIX=/api/v1
REQUEST_TIMEOUT=30000
MAINTENANCE_MODE=false
```

**⚠️ Importante:**
- O arquivo `.env.example` contém **TODAS** as variáveis disponíveis com documentação completa
- Consulte `backend/.env.example` para ver todas as opções e descrições detalhadas
- **Nunca** commite o arquivo `.env` no Git - ele contém credenciais sensíveis!

### 3. Configure o Banco de Dados

#### 3.1 Criar o banco de dados MySQL

```bash
# Acesse o MySQL
mysql -u root -p

# Crie o banco de dados com charset correto
CREATE DATABASE secretaria_online CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# (Opcional) Verifique se foi criado
SHOW DATABASES;

# Saia do MySQL
EXIT;
```

#### 3.2 Testar conexão com banco de dados

Antes de executar migrations, teste se a conexão está funcionando:

```bash
cd backend
node src/config/test-connection.js
```

**Resultado esperado:**
```
✓ Database connection has been established successfully.
✓ SUCESSO: Conexão estabelecida com sucesso!
```

**Se houver erro:**
- Verifique se o MySQL está rodando
- Confirme as credenciais no arquivo `.env`
- Certifique-se que o banco `secretaria_online` foi criado
- Verifique se o usuário tem permissões adequadas

#### 3.3 Executar migrations

As migrations criam a estrutura de tabelas no banco de dados:

```bash
# Execute todas as migrations
npm run db:migrate

# (Se precisar desfazer) Reverter última migration
npm run db:migrate:undo

# (Se precisar desfazer) Reverter todas migrations
npm run db:migrate:undo:all
```

**Migrations disponíveis:**

- ✅ **create-users** - Tabela de usuários (admin, teacher, student)
  - Campos: id, role, name, email, login, password_hash, cpf, rg, timestamps, deleted_at
  - Índices otimizados para email, login, cpf, role
  - Suporte a soft delete (paranoid)
  - Validações de CPF e email

- ✅ **create-courses** - Tabela de cursos
  - Campos: id, name, description, duration_semesters, timestamps, deleted_at
  - Índices otimizados para name (único)
  - Suporte a soft delete (paranoid)
  - Validações de nome e duração

- ✅ **create-disciplines** - Tabela de disciplinas
  - Campos: id, name, code, workload_hours, timestamps, deleted_at
  - Índices otimizados para code (único) e name
  - Suporte a soft delete (paranoid)
  - Validações de código e carga horária

- ✅ **create-course-disciplines** - Tabela pivot para relação N:N entre courses e disciplines
  - Campos: id, course_id, discipline_id, semester, timestamps
  - Relacionamento: Um curso possui múltiplas disciplinas, uma disciplina pode estar em múltiplos cursos
  - Índice único composto (course_id, discipline_id, semester) - previne duplicação
  - Foreign keys com onDelete: RESTRICT (previne exclusão de curso/disciplina vinculados)
  - Permite organizar disciplinas por semestre dentro do curso

- ✅ **create-classes** - Tabela de turmas
  - Campos: id, course_id, semester, year, timestamps, deleted_at
  - Índices otimizados para course_id, semester/year, e índice único composto
  - Suporte a soft delete (paranoid)
  - Validações de semestre (1-12) e ano (2020-2100)
  - Foreign key com onDelete: RESTRICT (previne exclusão de curso com turmas ativas)

- ✅ **create-class-teachers** - Tabela pivot para relação N:N entre turmas, professores e disciplinas
  - Campos: id, class_id, teacher_id, discipline_id, timestamps
  - Relacionamento: Uma turma possui múltiplos professores, cada um lecionando uma ou mais disciplinas
  - Índice único composto (class_id, teacher_id, discipline_id) - previne duplicação
  - Foreign keys: class_id (CASCADE on delete), teacher_id/discipline_id (RESTRICT)

- ✅ **create-class-students** - Tabela pivot para relação N:N entre turmas e alunos
  - Campos: id, class_id, student_id, timestamps
  - Relacionamento: Uma turma possui múltiplos alunos, um aluno pode estar em múltiplas turmas
  - Índice único composto (class_id, student_id) - previne duplicação
  - Foreign keys: class_id (CASCADE on delete), student_id (RESTRICT)

- ✅ **create-enrollments** - Tabela de matrículas de alunos em cursos
  - Campos: id, student_id, course_id, status (ENUM: pending|active|cancelled), enrollment_date, timestamps, deleted_at
  - Relacionamento: Um aluno pode ter UMA matrícula ativa/pending por vez, um curso pode ter múltiplas matrículas
  - Índices otimizados para student_id, course_id, status, enrollment_date
  - Índice único composto (student_id, status) com filtro deleted_at IS NULL - garante apenas 1 matrícula ativa/pending por aluno
  - Suporte a soft delete (paranoid)
  - Status padrão: pending (aguardando aprovação de documentos)
  - Foreign keys: student_id (RESTRICT), course_id (RESTRICT)
  - Validações: data de matrícula não pode ser futura

- ✅ **create-document-types** - Tabela de tipos de documentos obrigatórios
  - Campos: id, name, description, user_type (ENUM: student|teacher|both), is_required, timestamps, deleted_at
  - Define quais documentos são obrigatórios para alunos, professores ou ambos
  - Índices otimizados para name, user_type, is_required, deleted_at
  - Suporte a soft delete (paranoid)
  - Exemplos de tipos: RG, CPF, Comprovante de Residência, Histórico Escolar
  - Validações: nome deve ter entre 3 e 100 caracteres

- ✅ **create-documents** - Tabela de documentos enviados pelos usuários
  - Campos: id, user_id, document_type_id, file_path, file_name, file_size, mime_type, status (ENUM: pending|approved|rejected), reviewed_by, reviewed_at, observations, timestamps, deleted_at
  - Relacionamento: Um usuário possui múltiplos documentos, um documento pertence a um tipo de documento
  - Índices otimizados para user_id, document_type_id, status, reviewed_by, created_at
  - Índice composto (user_id, document_type_id) - facilita busca de documentos específicos de um usuário
  - Índice composto (status, created_at) - facilita busca de documentos pendentes ordenados por data
  - Suporte a soft delete (paranoid)
  - Status padrão: pending (aguardando revisão)
  - Foreign keys: user_id (RESTRICT), document_type_id (RESTRICT), reviewed_by (SET NULL)
  - Validações: tamanho do arquivo não pode ser negativo, nome e caminho são obrigatórios
  - Armazena metadados do arquivo (tamanho, tipo MIME) para controle

- ✅ **create-contract-templates** - Tabela de templates de contratos
  - Campos: id, name, content (LONGTEXT), is_active, timestamps, deleted_at
  - Armazena templates HTML com placeholders ({{studentName}}, {{courseName}}, etc.)
  - Índices otimizados para name, is_active, deleted_at
  - Índice composto (is_active, deleted_at) - facilita busca de templates disponíveis
  - Suporte a soft delete (paranoid)
  - Tipo LONGTEXT permite armazenar HTML completo com estilização
  - Validações: nome deve ter entre 3 e 100 caracteres, conteúdo deve ter estrutura HTML básica

- ✅ **create-contracts** - Tabela de contratos gerados para alunos e professores
  - Campos: id, user_id, template_id, file_path, file_name, accepted_at, semester, year, timestamps, deleted_at
  - Relacionamento: Um usuário possui múltiplos contratos, um contrato usa um template
  - Índices otimizados para user_id, template_id, accepted_at, semester, year
  - Índice composto (user_id, semester, year) - facilita busca de contratos por período
  - Índice composto (user_id, accepted_at) - facilita busca de contratos aceitos/pendentes
  - Suporte a soft delete (paranoid)
  - Campo accepted_at NULL indica contrato pendente de aceite
  - Foreign keys: user_id (RESTRICT), template_id (RESTRICT)
  - Validações: semestre (1-12), ano (2020-2100)
  - Armazena caminho do PDF gerado e informações do período

- ✅ **create-evaluations** - Tabela de avaliações (provas, trabalhos, atividades)
  - Campos: id, class_id, teacher_id, discipline_id, name, date, type (ENUM: grade|concept), timestamps, deleted_at
  - Relacionamento: Uma avaliação pertence a uma turma, um professor e uma disciplina
  - Índices otimizados para class_id, teacher_id, discipline_id, date, type, deleted_at
  - Índice composto (class_id, deleted_at) - facilita busca de avaliações ativas de uma turma
  - Índice composto (class_id, discipline_id) - facilita busca de avaliações por turma e disciplina
  - Índice composto (teacher_id, class_id) - facilita busca de avaliações de um professor
  - Suporte a soft delete (paranoid)
  - Tipo de avaliação: grade (nota 0-10) ou concept (satisfatório/não satisfatório)
  - Foreign keys: class_id (RESTRICT), teacher_id (RESTRICT), discipline_id (RESTRICT)
  - Validações: nome deve ter entre 3 e 100 caracteres, data é obrigatória
  - Data da avaliação armazenada como DATEONLY (sem horário)

- ✅ **create-grades** - Tabela de notas dos alunos nas avaliações
  - Campos: id, evaluation_id, student_id, grade (DECIMAL 4,2), concept (ENUM: satisfactory|unsatisfactory), timestamps, deleted_at
  - Relacionamento: Uma nota pertence a uma avaliação e a um aluno
  - Índices otimizados para evaluation_id, student_id, deleted_at, created_at
  - Índice único composto (evaluation_id, student_id) com filtro deleted_at IS NULL - previne duplicação de nota
  - Índice composto (student_id, deleted_at) - facilita busca de notas ativas de um aluno
  - Suporte a soft delete (paranoid)
  - Validação XOR: grade OU concept deve estar preenchido, nunca ambos
  - Constraint CHECK: grade deve estar entre 0.00 e 10.00
  - Foreign keys: evaluation_id (RESTRICT), student_id (RESTRICT)
  - Permite armazenar notas numéricas (0-10) ou conceitos (satisfatório/não satisfatório)
  - Notas podem ser editadas sem restrição de período

- ✅ **create-request-types** - Tabela de tipos de solicitações que alunos podem fazer
  - Campos: id, name, description, response_deadline_days (prazo em dias úteis), is_active, timestamps, deleted_at
  - Armazena tipos de solicitações disponíveis: atestado, histórico escolar, certificado, atividades complementares, transferência, cancelamento
  - Índices otimizados para name, is_active, deleted_at
  - Índice composto (is_active, deleted_at) - facilita busca de tipos disponíveis
  - Suporte a soft delete (paranoid)
  - Campo response_deadline_days define prazo de resposta estimado (padrão: 5 dias úteis)
  - Campo is_active controla quais tipos de solicitações estão disponíveis para alunos
  - Validações: nome deve ter entre 3 e 100 caracteres, prazo não pode ser negativo

- ✅ **create-requests** - Tabela de solicitações feitas por alunos
  - Campos: id, student_id, request_type_id, description, status (ENUM: pending|approved|rejected), reviewed_by, reviewed_at, observations, timestamps, deleted_at
  - Relacionamento: Uma solicitação pertence a um aluno, a um tipo de solicitação e pode ser revisada por um admin
  - Índices otimizados para student_id, request_type_id, status, reviewed_by, created_at, deleted_at
  - Índice composto (student_id, status) - facilita busca de solicitações de um aluno por status
  - Índice composto (status, created_at) - facilita filtrar por status e ordenar por data
  - Índice composto (student_id, deleted_at) - facilita busca de solicitações ativas do aluno
  - Suporte a soft delete (paranoid)
  - Status padrão: pending (pendente de revisão)
  - Foreign keys: student_id (RESTRICT), request_type_id (RESTRICT), reviewed_by (SET NULL)
  - Campos de revisão (reviewed_by, reviewed_at, observations) preenchidos quando admin aprova/rejeita
  - Description: justificativa fornecida pelo aluno
  - Observations: feedback do admin sobre a aprovação/rejeição

#### 3.4 Executar seeders (dados iniciais)

Os seeders populam o banco com dados iniciais necessários para o funcionamento do sistema:

```bash
# Executar todos os seeders
npm run db:seed

# Executar um seeder específico
npx sequelize-cli db:seed --seed 20251027211219-admin-user.js

# (Se precisar desfazer) Reverter todos seeders
npm run db:seed:undo:all

# (Se precisar desfazer) Reverter último seeder
npm run db:seed:undo
```

**Seeders disponíveis:**

- ✅ **admin-user** - Cria o usuário administrativo inicial
  - Login: `admin`
  - Senha: `admin123` (deve ser alterada no primeiro acesso)
  - Role: admin
  - Email: admin@secretariaonline.com
  - **Nota:** Se já existir um usuário admin no banco, o seeder será ignorado automaticamente

- ✅ **document-types** - Cria tipos de documentos obrigatórios padrão
  - **Para Alunos (9 tipos):**
    - RG (Frente e Verso) - obrigatório
    - CPF - obrigatório
    - Comprovante de Residência - obrigatório
    - Foto 3x4 - obrigatório
    - Certificado de Conclusão do Ensino Médio - obrigatório
    - Histórico Escolar do Ensino Médio - obrigatório
    - Certidão de Nascimento ou Casamento - opcional
    - Título de Eleitor - opcional
    - Reservista (Masculino) - opcional

  - **Para Professores (8 tipos):**
    - RG (Frente e Verso) - obrigatório
    - CPF - obrigatório
    - Comprovante de Residência - obrigatório
    - Foto 3x4 - obrigatório
    - Diploma de Graduação - obrigatório
    - Título de Pós-Graduação - opcional
    - Currículo Lattes - opcional
    - Certificado de Reservista (Masculino) - opcional

  - **Para Ambos (1 tipo):**
    - Atestado Médico - opcional

  - **Total:** 19 tipos de documentos (documentos duplicados entre alunos/professores são cadastrados separadamente)
  - **Nota:** Se já existirem tipos de documentos no banco, o seeder será ignorado

- ✅ **request-types** - Cria tipos de solicitações que alunos podem fazer
  - Pedido de Atestado de Matrícula (prazo: 3 dias úteis)
  - Histórico Escolar (prazo: 5 dias úteis)
  - Certificado de Conclusão (prazo: 10 dias úteis)
  - Validação de Atividades Complementares (prazo: 7 dias úteis)
  - Transferência de Turma (prazo: 5 dias úteis)
  - Cancelamento de Matrícula (prazo: 5 dias úteis)
  - Declaração de Frequência (prazo: 3 dias úteis)
  - Segunda Via de Diploma (prazo: 15 dias úteis)
  - Trancamento de Matrícula (prazo: 5 dias úteis)
  - Reabertura de Matrícula (prazo: 5 dias úteis)
  - **Total:** 10 tipos de solicitações
  - **Nota:** Se já existirem tipos de solicitações no banco, o seeder será ignorado

- ✅ **sample-courses-and-disciplines** - Cria cursos e disciplinas de exemplo para testes
  - **Cursos (3):**
    1. Análise e Desenvolvimento de Sistemas (6 semestres, 14 disciplinas)
    2. Gestão de Recursos Humanos (4 semestres, 9 disciplinas)
    3. Administração (8 semestres, 13 disciplinas)

  - **Disciplinas (28 total):**
    - Disciplinas comuns (4): Português Instrumental, Matemática Básica, Metodologia Científica, Ética e Cidadania
    - Disciplinas de ADS (10): Lógica de Programação, Algoritmos, POO, Banco de Dados, Engenharia de Software, etc.
    - Disciplinas de RH (6): Introdução à Gestão de Pessoas, Recrutamento e Seleção, Treinamento, etc.
    - Disciplinas de Administração (8): Teoria Geral da Administração, Contabilidade, Marketing, etc.

  - **Associações:** 40 associações curso-disciplina com organização por semestre
  - **Nota:** Se já existirem cursos no banco, o seeder será ignorado

**⚠️ IMPORTANTE:**
- Os seeders são **idempotentes**: podem ser executados múltiplas vezes sem duplicar dados
- Execute os seeders **APÓS** as migrations
- Para resetar completamente o banco (apaga tudo e recria): `npm run db:reset`
- O usuário admin é essencial para o primeiro acesso ao sistema

#### 3.5 Resetar banco de dados (desenvolvimento)

⚠️ **CUIDADO**: Este comando apaga TODOS os dados!

```bash
# Apaga o banco, recria, executa migrations e seeders
npm run db:reset
```

### 4. Configure o Frontend

#### 4.1 Instale as dependências

```bash
cd ../frontend
npm install
```

#### 4.2 Configure as variáveis de ambiente

Crie o arquivo `.env` baseado no `.env.example`:

```bash
# Linux/Mac
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env

# Windows (CMD)
copy .env.example .env
```

#### 4.3 Edite o arquivo `.env`

**Variáveis obrigatórias mínimas:**

```env
# ====================
# API BACKEND
# ====================
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=30000

# ====================
# APLICAÇÃO
# ====================
VITE_APP_ENV=development
VITE_APP_NAME="Secretaria Online"
VITE_APP_VERSION=0.1.0

# ====================
# AUTENTICAÇÃO
# ====================
VITE_AUTH_TOKEN_KEY=auth_token
VITE_AUTH_USER_KEY=auth_user
VITE_AUTH_TOKEN_EXPIRATION=15

# ====================
# UPLOAD
# ====================
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/jpg,image/png
VITE_ALLOWED_FILE_EXTENSIONS=.pdf,.jpg,.jpeg,.png

# ====================
# UI/UX
# ====================
VITE_DEFAULT_PAGE_SIZE=20
VITE_PAGE_SIZE_OPTIONS=10,20,50,100
VITE_TOAST_DURATION=3000
VITE_TOAST_POSITION=top-right
VITE_ENABLE_DEBUG=true

# ====================
# LOCALIZAÇÃO
# ====================
VITE_LOCALE=pt-BR
VITE_DATE_FORMAT=dd/MM/yyyy
VITE_DATETIME_FORMAT=dd/MM/yyyy HH:mm
VITE_TIMEZONE=America/Sao_Paulo

# ====================
# REACT QUERY
# ====================
VITE_ENABLE_REACT_QUERY_DEVTOOLS=true
VITE_REACT_QUERY_STALE_TIME=300000
VITE_REACT_QUERY_CACHE_TIME=600000
```

**⚠️ Importante:**
- **TODAS** as variáveis de ambiente no Vite devem começar com `VITE_`
- O arquivo `.env.example` contém documentação completa de todas as variáveis
- Consulte `frontend/.env.example` para ver todas as opções disponíveis
- Após modificar o `.env`, **reinicie** o servidor de desenvolvimento (`npm run dev`)

## ▶️ Executando a Aplicação

### Backend

```bash
cd backend
npm run dev
```

O servidor estará rodando em: http://localhost:3000

### Frontend

```bash
cd frontend
npm run dev
```

A aplicação estará disponível em: http://localhost:5173

## 👤 Acesso Inicial

Após executar os seeders, você pode acessar o sistema com o usuário administrativo padrão:

- **Login:** admin
- **Senha:** admin123

⚠️ **IMPORTANTE:** Altere a senha no primeiro acesso!

## 🔧 Troubleshooting

### Problemas com Variáveis de Ambiente

#### Backend: "Cannot find module 'dotenv'"
```bash
# Certifique-se de que as dependências estão instaladas
cd backend
npm install
```

#### Backend: Erro ao conectar no banco de dados
- Verifique se o MySQL está rodando: `mysql -u root -p`
- Confirme que o banco `secretaria_online` foi criado
- Verifique as credenciais no `.env` (DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME)
- Teste a conexão: `node src/config/test-connection.js`
- Teste acesso direto ao MySQL: `mysql -u root -p secretaria_online`

#### Backend: "Missing required database environment variables"
- Certifique-se que o arquivo `.env` existe na pasta `backend/`
- Verifique se todas as variáveis DB_* estão definidas:
  - DB_HOST (ex: localhost)
  - DB_PORT (ex: 3306)
  - DB_NAME (ex: secretaria_online)
  - DB_USER (ex: root)
  - DB_PASSWORD (sua senha do MySQL)
- Copie novamente do `.env.example` se necessário

#### Sequelize: "ER_ACCESS_DENIED_ERROR"
- Senha incorreta ou usuário sem permissões
- Teste o login manual: `mysql -u seu_usuario -p`
- Certifique-se que o usuário tem privilégios no banco:
  ```sql
  GRANT ALL PRIVILEGES ON secretaria_online.* TO 'seu_usuario'@'localhost';
  FLUSH PRIVILEGES;
  ```

#### Sequelize: "ER_BAD_DB_ERROR: Unknown database"
- O banco de dados não foi criado
- Execute: `mysql -u root -p -e "CREATE DATABASE secretaria_online CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`

#### Sequelize: "Too many connections"
- Reduza DB_POOL_MAX no `.env` (padrão: 25)
- Verifique conexões ativas: `SHOW PROCESSLIST;` no MySQL
- Em shared hosting, limite é geralmente 25-50 conexões

#### Backend: "JWT_SECRET is not defined"
- Certifique-se de que criou o arquivo `.env` a partir do `.env.example`
- Gere uma chave secreta forte:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Adicione ao `.env`: `JWT_SECRET=sua_chave_gerada_aqui`

#### Frontend: Variáveis não são carregadas
- **IMPORTANTE**: Variáveis no Vite devem começar com `VITE_`
- Após modificar `.env`, reinicie o servidor: `Ctrl+C` e `npm run dev`
- Verifique no código: `console.log(import.meta.env.VITE_API_BASE_URL)`

#### Frontend: Erro de CORS ao chamar API

**Sintomas:**
- Erro no console: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"
- Requisições retornam erro de rede ou status 0

**Soluções:**

1. **Verificar variável CORS_ORIGIN no backend:**
   ```bash
   # No arquivo backend/.env, certifique-se que está definida:
   CORS_ORIGIN=http://localhost:5173
   ```

2. **Múltiplas origens (desenvolvimento + produção):**
   ```bash
   # Separe por vírgula para permitir múltiplos domínios
   CORS_ORIGIN=http://localhost:5173,https://seudominio.com
   ```

3. **Verificar configuração do frontend:**
   - Em `frontend/.env`, confirme que `VITE_API_BASE_URL` aponta para a API correta
   - Desenvolvimento: `http://localhost:3000/api/v1`
   - Produção: `https://api.seudominio.com/api/v1`

4. **Reiniciar servidor backend após modificar .env:**
   ```bash
   cd backend
   # Pressione Ctrl+C para parar o servidor
   npm run dev
   ```

5. **Testar CORS com curl:**
   ```bash
   curl -H "Origin: http://localhost:5173" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        http://localhost:3000/api/v1/health --verbose
   ```

   **Resultado esperado:**
   - Status: 204 No Content
   - Headers incluindo:
     - `Access-Control-Allow-Origin: http://localhost:5173`
     - `Access-Control-Allow-Credentials: true`
     - `Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS`

6. **Configuração específica para produção:**
   - **NUNCA** use `CORS_ORIGIN=*` em produção (inseguro!)
   - Use apenas domínios específicos: `CORS_ORIGIN=https://seudominio.com`
   - Certifique-se de usar HTTPS em produção

#### Erro: "SMTP connection failed"
- Verifique credenciais SMTP no `.env`
- Para Gmail, use [senha de app](https://support.google.com/accounts/answer/185833)
- Teste a porta: 587 (STARTTLS) ou 465 (SSL/TLS)

### Comandos Úteis

```bash
# Verificar qual Node.js está instalado
node --version

# Verificar se MySQL está rodando (Linux/Mac)
sudo service mysql status

# Verificar se MySQL está rodando (Windows)
net start | findstr MySQL

# Verificar se as portas estão em uso
# Linux/Mac
lsof -i :3000
lsof -i :5173

# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Gerar JWT_SECRET seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Limpar cache npm e reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentação Adicional

- [Requirements](./docs/requirements.md) - Requisitos funcionais e não funcionais
- [Context Documentation](./docs/contextDoc.md) - Arquitetura e padrões técnicos
- [Backlog](./docs/backlog.json) - Features e roadmap de desenvolvimento

## 📤 Upload de Arquivos (feat-041)

O sistema implementa upload seguro e validado de arquivos utilizando **Multer** com as seguintes características:

### Configuração

**Arquivo de Configuração:** `backend/src/config/upload.js`

- **Diretório de armazenamento**: `backend/uploads/documents/[userId]/`
- **Tamanho máximo de arquivo**: 10MB
- **Formatos permitidos**: PDF, JPG, PNG
- **Máximo de arquivos por requisição**: 5

### Tipos de Arquivo Aceitos

| Formato | MIME Type | Extensão |
|---------|-----------|----------|
| PDF | application/pdf | .pdf |
| JPEG | image/jpeg | .jpg, .jpeg |
| PNG | image/png | .png |

### Middlewares de Upload

**Arquivo:** `backend/src/middlewares/upload.middleware.js`

- `validateUploadSingle`: Valida upload de um arquivo único
  - Uso: `router.post('/documents', authenticate, validateUploadSingle, controller)`

- `validateUploadMultiple`: Valida upload de múltiplos arquivos (até 5)
  - Uso: `router.post('/documents/batch', authenticate, validateUploadMultiple, controller)`

- `cleanupOnError`: Remove arquivo do disco em caso de erro no controller
  - Uso: Middleware secundário para limpeza de uploads falhados

### Validações Implementadas

✅ **Validação de MIME Type**: Verifica se o tipo do arquivo é permitido
✅ **Validação de Extensão**: Garante extensão adequada
✅ **Limite de Tamanho**: Máximo 10MB por arquivo
✅ **Limite de Quantidade**: Máximo 5 arquivos por requisição
✅ **Mensagens de Erro Amigáveis**: Feedback claro ao usuário

### Exemplo de Uso

**Requisição:**
```bash
curl -X POST http://localhost:3000/api/v1/documents \
  -H "Authorization: Bearer seu_token_jwt" \
  -F "document=@documento.pdf"
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 5,
    "filename": "1698700200000-documento.pdf",
    "path": "uploads/documents/5/1698700200000-documento.pdf",
    "mimetype": "application/pdf",
    "size": 245632,
    "uploadedAt": "2025-10-30T10:00:00Z"
  },
  "message": "Arquivo enviado com sucesso"
}
```

**Resposta de Erro (400/413):**
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "Arquivo muito grande. Tamanho máximo: 10MB"
  }
}
```

### Estrutura de Diretórios

```
backend/
├── uploads/
│   ├── documents/          # Documentos de usuários
│   │   ├── 1/              # ID do usuário
│   │   │   ├── 1698700200000-documento.pdf
│   │   │   └── 1698700200001-certificado.jpg
│   │   ├── 2/
│   │   └── ...
│   ├── contracts/          # PDFs de contratos (feat-042+)
│   └── temp/               # Arquivos temporários
└── ...
```

### Segurança

- ✅ Validação de tipos de arquivo rigorosa
- ✅ Geração de nomes únicos com timestamps (previne colisões)
- ✅ Sanitização de nomes de arquivo (remove caracteres perigosos)
- ✅ Organização por usuário (isolamento de uploads)
- ✅ Tratamento de erros sem expor caminhos do servidor
- ✅ Limpeza automática de uploads em caso de erro no controller

### Variáveis de Ambiente

```env
# UPLOAD DE ARQUIVOS
MAX_FILE_SIZE=10485760                                    # Tamanho máximo em bytes (10MB)
UPLOAD_PATH=./uploads                                     # Caminho base de upload
ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/png  # MIME types permitidos
```

### Integração com feat-042 (DocumentService)

A configuração de upload está pronta para ser integrada com o **DocumentService** (feat-042):

```javascript
// Exemplo de uso no controller (feat-043)
const { validateUploadSingle } = require('../middlewares/upload.middleware');
const DocumentService = require('../services/document.service');

router.post('/documents',
  authenticate,
  validateUploadSingle,
  async (req, res, next) => {
    try {
      // req.file contém informações do arquivo validado
      const documentData = {
        userId: req.user.id,
        documentTypeId: req.body.document_type_id,
        filePath: req.file.path,
        fileName: req.file.filename,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      };

      const document = await DocumentService.upload(documentData);
      res.status(201).json({ success: true, data: document });
    } catch (error) {
      next(error);
    }
  }
);
```

### Troubleshooting

#### Erro: "Arquivo muito grande"
- Verifique o tamanho do arquivo (máximo 10MB)
- Reduza o tamanho ou comprima antes de enviar

#### Erro: "Tipo de arquivo não permitido"
- Verifique se o arquivo é PDF, JPG ou PNG
- Alguns arquivos PNG podem ter MIME type diferente; teste com um arquivo conhecido

#### Erro: "Nenhum arquivo foi enviado"
- Certifique-se de que o parâmetro `document` está sendo enviado no form-data
- Exemplo com curl: `-F "document=@arquivo.pdf"`

#### Diretório de uploads não encontrado
- O diretório é criado automaticamente na primeira requisição
- Se persistir, crie manualmente: `mkdir -p backend/uploads/documents`

## 📄 Geração de PDFs - PDFService (feat-047)

O sistema implementa um serviço robusto de geração de PDFs para contratos utilizando **PDFKit** com as seguintes características:

### Configuração

**Arquivo de Serviço:** `backend/src/services/pdf.service.js`

- **Biblioteca**: PDFKit v0.17.2 (leve e eficiente)
- **Diretório de saída**: `backend/uploads/contracts/`
- **Formato de saída**: PDF compatível com ISO 32000
- **Tamanho máximo de PDF**: Sem limite prático (até ~100MB de memória)

### Funcionalidades Principais

#### 1. Geração de Contrato PDF

```javascript
const PDFService = require('../services/pdf.service');

const contractData = {
  studentName: 'João Silva da Santos',
  studentId: 123,
  courseName: 'Engenharia de Software',
  courseId: 5,
  semester: 1,
  year: 2025,
  startDate: '01/11/2025',  // opcional
  duration: '8 semestres',   // opcional
  institutionName: 'Secretaria Online' // opcional
};

const templateContent = `
CONTRATO DE MATRÍCULA

Este contrato formaliza a matrícula de {{studentName}} no curso {{courseName}}.

Dados da Matrícula:
- ID do Aluno: {{studentId}}
- ID do Curso: {{courseId}}
- Semestre: {{semester}}
- Ano: {{year}}
- Data de Início: {{startDate}}
- Duração: {{duration}}
- Instituição: {{institutionName}}

Data: {{currentDate}}
`;

// Gerar PDF
const result = await PDFService.generateContractPDF(
  contractData,
  templateContent,
  'uploads/contracts'
);

// Resultado contém:
// {
//   filePath: 'C:\....\backend\uploads\contracts\contract_123_s1_2025_1635680291234.pdf',
//   fileName: 'contract_123_s1_2025_1635680291234.pdf',
//   fileSize: 2048,
//   relativePath: 'contracts/contract_123_s1_2025_1635680291234.pdf'
// }
```

### Placeholders Disponíveis

O serviço substitui automaticamente os seguintes placeholders no template:

| Placeholder | Descrição | Exemplo |
|-----------|-----------|---------|
| `{{studentName}}` | Nome do aluno | João Silva |
| `{{studentId}}` | ID do aluno | 123 |
| `{{courseName}}` | Nome do curso | Engenharia de Software |
| `{{courseId}}` | ID do curso | 5 |
| `{{semester}}` | Número do semestre | 1 |
| `{{year}}` | Ano da matrícula | 2025 |
| `{{startDate}}` | Data de início (ou data atual) | 01/11/2025 |
| `{{duration}}` | Duração do curso | 8 semestres |
| `{{institutionName}}` | Nome da instituição | Secretaria Online |
| `{{currentDate}}` | Data atual (formato local) | 01/11/2025 |
| `{{currentDateTime}}` | Data e hora atuais | 01/11/2025 15:30:45 |

### Formatação de Conteúdo

O serviço suporta formatação simples com Markdown:

```
**Texto em negrito**  → Texto em bold no PDF
```

### Métodos Disponíveis

#### `PDFService.generateContractPDF(contractData, templateContent, outputDir)`

Gera um PDF de contrato a partir de dados e template.

**Parâmetros:**
- `contractData` (Object): Dados para preencher o contrato
  - `studentName` (String, obrigatório): Nome do aluno
  - `studentId` (Number, obrigatório): ID do aluno
  - `courseName` (String, obrigatório): Nome do curso
  - `courseId` (Number, obrigatório): ID do curso
  - `semester` (Number, obrigatório): Semestre
  - `year` (Number, obrigatório): Ano
  - `startDate`, `duration`, `institutionName` (String, opcional)

- `templateContent` (String): Conteúdo do template com placeholders
- `outputDir` (String): Diretório de saída (padrão: 'uploads/contracts')

**Retorna:**
```javascript
{
  filePath: String,           // Caminho completo do arquivo
  fileName: String,           // Nome do arquivo gerado
  fileSize: Number,           // Tamanho em bytes
  relativePath: String        // Caminho relativo para armazenar em BD
}
```

**Throws:**
- `Error` com `code: 'VALIDATION_ERROR'` - Dados faltando ou inválidos
- `Error` com `code: 'DIRECTORY_ERROR'` - Erro ao criar diretório
- `Error` com `code: 'FILE_WRITE_ERROR'` - Erro ao escrever arquivo
- `Error` com `code: 'PDF_GENERATION_ERROR'` - Erro ao gerar PDF

#### `PDFService.pdfExists(filePath)`

Verifica se um arquivo PDF existe.

```javascript
const exists = await PDFService.pdfExists('uploads/contracts/contract_123_s1_2025.pdf');
// returns: true ou false
```

#### `PDFService.readPDF(filePath)`

Retorna o conteúdo de um arquivo PDF como Buffer.

```javascript
const buffer = await PDFService.readPDF('uploads/contracts/contract_123_s1_2025.pdf');
// Útil para enviar arquivo ao cliente (download, envio por email)
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', 'attachment; filename="contrato.pdf"');
res.send(buffer);
```

#### `PDFService.removePDF(filePath)`

Remove um arquivo PDF do disco.

```javascript
const removed = await PDFService.removePDF('uploads/contracts/contract_123_s1_2025.pdf');
// returns: true se removido, false se não existia
```

### Segurança

- ✅ Validação rigorosa de dados de entrada
- ✅ Prevenção de path traversal (caminhos seguros)
- ✅ Geração automática de nomes únicos com timestamps
- ✅ Tratamento robusto de erros
- ✅ Logging estruturado de operações críticas
- ✅ Suporte a soft permissions com isolamento de diretórios

### Variáveis de Ambiente

```env
# GERAÇÃO DE PDF
PDF_LIBRARY=pdfkit                          # Biblioteca a usar (pdfkit ou puppeteer)
CONTRACTS_TEMPLATE_PATH=./templates/contracts # Caminho dos templates
UPLOAD_PATH=./uploads                       # Caminho base de upload
```

### Testes

Execute os testes unitários do PDFService:

```bash
cd backend
node src/services/pdf.service.test.js
```

Testes incluem:
- ✓ Validação de dados obrigatórios
- ✓ Geração de PDF com dados válidos
- ✓ Substituição de placeholders
- ✓ Validação de tipos de dados
- ✓ Gerenciamento de diretórios
- ✓ Operações de arquivo (read, exists, remove)

### Troubleshooting

#### Erro: "Campos obrigatórios faltando"
- Certifique-se de fornecer: `studentName`, `studentId`, `courseName`, `courseId`, `semester`, `year`
- Todos são obrigatórios para gerar um contrato válido

#### Erro: "Tipo inválido para semester"
- `semester` deve ser um número (1-12)
- `year` deve ser um número (2020-2100)

#### Diretório `uploads/contracts` não encontrado
- O diretório é criado automaticamente na primeira geração
- Se persistir, crie manualmente: `mkdir -p backend/uploads/contracts`

#### Arquivo PDF vazio ou corrompido
- Verifique se o PDFKit está corretamente instalado
- Teste com: `npm list pdfkit`
- Se necessário, reinstale: `npm install pdfkit@0.17.2`

## 📋 Gestão de Contratos - ContractService (feat-048)

O sistema implementa um serviço robusto de lógica de negócio para geração e gestão de contratos com as seguintes características:

### Configuração

**Arquivo de Serviço:** `backend/src/services/contract.service.js`

- **Responsabilidades principais:**
  - Gerar contratos automaticamente para alunos e professores
  - Buscar templates e substituir placeholders com dados reais
  - Gerar PDFs de contratos usando PDFService
  - Registrar contratos gerados no banco de dados
  - Registrar aceite de contratos (com data/hora)
  - Validar regras de negócio para geração e aceite
  - Buscar contratos por usuário, período e status

### Funcionalidades Principais

#### 1. Gerar Contrato para um Usuário

```javascript
const ContractService = require('../services/contract.service');

// Gerar contrato para aluno
const contract = await ContractService.generateContract(
  studentId,
  'student',
  {
    semester: 1,
    year: 2025,
    templateId: 1,                    // opcional - usa primeira disponível se omitido
    outputDir: 'uploads/contracts'   // opcional
  }
);

// Resultado contém:
// {
//   id: 42,
//   user_id: 123,
//   template_id: 1,
//   file_path: 'C:\...\backend\uploads\contracts\contract_123_s1_2025_1635680291234.pdf',
//   file_name: 'contract_123_s1_2025_1635680291234.pdf',
//   semester: 1,
//   year: 2025,
//   accepted_at: null,
//   created_at: '2025-11-01T10:30:00.000Z'
// }
```

**FLUXO INTERNO:**
1. Valida se usuário existe e é aluno ou professor
2. Busca template disponível (padrão ou especificado)
3. Se aluno: busca matrícula ativa para obter dados do curso
4. Se professor: coleta dados do professor
5. Substitui placeholders do template com dados reais
6. Gera PDF usando PDFService
7. Salva registro do contrato no banco de dados

#### 2. Aceitar Contrato

```javascript
// Aluno/Professor aceita um contrato
const accepted = await ContractService.acceptContract(contractId, userId);

// Resultado contém:
// {
//   id: 42,
//   user_id: 123,
//   template_id: 1,
//   file_path: '...',
//   file_name: '...',
//   semester: 1,
//   year: 2025,
//   accepted_at: '2025-11-01T10:35:00.000Z',
//   status: 'accepted',
//   created_at: '2025-11-01T10:30:00.000Z'
// }
```

**FLUXO INTERNO:**
1. Busca contrato por ID
2. Valida que contrato ainda não foi aceito
3. Valida que o usuário é o proprietário do contrato
4. Registra data/hora do aceite
5. Salva contrato atualizado no banco

#### 3. Buscar Contratos Pendentes

```javascript
// Obter contratos pendentes de aceite de um aluno
const pending = await ContractService.getPendingByUser(studentId);

// Retorna array com contratos pendentes:
// [
//   {
//     id: 42,
//     user_id: 123,
//     template_id: 1,
//     file_path: '...',
//     file_name: '...',
//     semester: 1,
//     year: 2025,
//     accepted_at: null,
//     status: 'pending',
//     created_at: '2025-11-01T10:30:00.000Z'
//   }
// ]
```

#### 4. Buscar Contratos Aceitos

```javascript
// Obter contratos já aceitos por um aluno
const accepted = await ContractService.getAcceptedByUser(studentId);

// Retorna array com contratos aceitos (accepted_at não é null)
```

#### 5. Buscar Todos os Contratos de um Usuário

```javascript
// Obter todos os contratos (pendentes e aceitos)
const allContracts = await ContractService.getAllByUser(studentId);

// Retorna array com todos os contratos ordenados por data de criação (DESC)
```

#### 6. Buscar Contratos de um Período Específico

```javascript
// Obter contratos de um semestre/ano específico
const contracts = await ContractService.getByPeriod(studentId, 1, 2025);

// Retorna array com contratos do período especificado
```

#### 7. Buscar Contrato por ID

```javascript
// Obter contrato específico com todos os detalhes
const contract = await ContractService.getById(contractId);

// Resultado contém informações completas incluindo usuário e template
```

#### 8. Verificar se há Contratos Pendentes

```javascript
// Verificar se um usuário tem contratos pendentes
const hasPending = await ContractService.hasPendingContracts(studentId);
// returns: true ou false

// Contar quantos contratos pendentes um usuário tem
const count = await ContractService.countPendingContracts(studentId);
// returns: número de contratos pendentes
```

### Regras de Negócio Validadas

| Regra | Descrição |
|-------|-----------|
| **Usuário válido** | Usuário deve existir no banco de dados |
| **Template obrigatório** | Deve existir pelo menos um template disponível |
| **Aceite único** | Um contrato não pode ser aceito duas vezes |
| **Propriedade** | Apenas o proprietário do contrato pode aceitá-lo |
| **Dados da matrícula** | Se aluno, busca dados da matrícula ativa para preencher contrato |
| **Dados do professor** | Se professor, usa dados do usuário para preencher contrato |

### Métodos Disponíveis

| Método | Descrição | Retorna |
|--------|-----------|---------|
| `generateContract(userId, userType, options)` | Gera novo contrato para usuário | Object com dados do contrato |
| `acceptContract(contractId, userId)` | Registra aceite de contrato | Object com contrato aceito |
| `getPendingByUser(userId)` | Lista contratos pendentes | Array de contratos |
| `getAcceptedByUser(userId)` | Lista contratos aceitos | Array de contratos |
| `getAllByUser(userId)` | Lista todos os contratos | Array de contratos |
| `getByPeriod(userId, semester, year)` | Busca contratos de um período | Array de contratos |
| `getById(contractId)` | Busca contrato por ID | Object com contrato completo |
| `hasPendingContracts(userId)` | Verifica se há contratos pendentes | Boolean |
| `countPendingContracts(userId)` | Conta contratos pendentes | Number |
| `delete(contractId)` | Deleta um contrato (soft delete) | Void |

### Integração com PDFService

O ContractService utiliza PDFService para gerar os PDFs:

1. **Preparação de dados**: Coleta dados do usuário, matrícula/curso, período
2. **Substituição de placeholders**: Usa template.replacePlaceholders()
3. **Geração de PDF**: Chama PDFService.generateContractPDF()
4. **Armazenamento**: Salva caminho do PDF na tabela contracts

```javascript
// Fluxo interno de geração:
const processedContent = template.replacePlaceholders(contractData);
const pdfResult = await PDFService.generateContractPDF(
  contractData,
  processedContent,
  outputDir
);
// Salva pdfResult.filePath e pdfResult.fileName no banco
```

### Tratamento de Erros

Todos os métodos lançam `AppError` com mensagens claras:

```javascript
try {
  await ContractService.generateContract(userId, 'student');
} catch (error) {
  if (error.statusCode === 404) {
    console.log('Usuário não encontrado');
  } else if (error.statusCode === 422) {
    console.log('Nenhum template disponível - configure antes de gerar contratos');
  } else if (error.statusCode === 500) {
    console.log('Erro ao gerar contrato - verifique logs');
  }
}
```

### Logging Estruturado

Todas as operações críticas são registradas:

```
[ContractService.generateContract] User: 123, Type: student - Iniciando geração de contrato
[ContractService.generateContract] Gerando PDF...
[ContractService.generateContract] Salvando contrato no banco de dados
[ContractService.generateContract] Contrato gerado com sucesso - Contract ID: 42
```

### Testes

A implementação segue padrões testáveis:

```javascript
// Exemplo de teste
const contract = await ContractService.generateContract(123, 'student');
assert(contract.id).exists();
assert(contract.file_path).includes('uploads/contracts');
assert(contract.accepted_at).isNull();
```

### Variáveis de Ambiente

```env
# GERAÇÃO DE PDF
PDF_LIBRARY=pdfkit                    # Biblioteca a usar
CONTRACTS_TEMPLATE_PATH=./templates   # Caminho dos templates
UPLOAD_PATH=./uploads                 # Caminho base de upload
```

### Troubleshooting

#### Erro: "Usuário não encontrado"
- Verifique se o ID do usuário é válido
- Confirme que o usuário existe no banco de dados

#### Erro: "Nenhum template de contrato disponível"
- Configure pelo menos um template antes de gerar contratos
- Crie um template via ContractTemplate model

#### Erro: "Contrato já foi aceito"
- Um contrato só pode ser aceito uma vez
- Verifique se accepted_at é null antes de aceitar

#### Contrato não está salvando no banco
- Verifique se a tabela `contracts` existe
- Execute migrations: `npm run db:migrate`
- Confirme conexão com banco de dados

## 🔌 API Endpoints

### Autenticação

- `POST /api/v1/auth/login` - Login de usuário
- `POST /api/v1/auth/logout` - Logout de usuário
- `POST /api/v1/auth/refresh-token` - Renovar access token
- `POST /api/v1/auth/change-password` - Alterar senha

### Usuários (Admin only)

- `GET /api/v1/users` - Listar usuários com filtros e paginação
  - Query params: `role` (admin|teacher|student), `search`, `page`, `limit`
- `GET /api/v1/users/:id` - Buscar usuário por ID
- `POST /api/v1/users` - Criar novo usuário
- `PUT /api/v1/users/:id` - Atualizar usuário
- `DELETE /api/v1/users/:id` - Excluir usuário (soft delete)

### Estudantes (Admin only)

- `GET /api/v1/students` - Listar todos os estudantes
- `GET /api/v1/students/:id` - Buscar estudante por ID
- `GET /api/v1/students/:id/enrollments` - Listar matrículas do aluno (feat-040)
- `POST /api/v1/students` - Criar novo estudante
- `PUT /api/v1/students/:id` - Atualizar estudante
- `DELETE /api/v1/students/:id` - Excluir estudante (soft delete)
- `POST /api/v1/students/:id/reset-password` - Resetar senha do estudante

### Professores (Admin only)

- `GET /api/v1/teachers` - Listar todos os professores
- `GET /api/v1/teachers/:id` - Buscar professor por ID
- `POST /api/v1/teachers` - Criar novo professor
- `PUT /api/v1/teachers/:id` - Atualizar professor
- `DELETE /api/v1/teachers/:id` - Excluir professor (soft delete)

### Cursos (Admin only)

- `GET /api/v1/courses` - Listar todos os cursos
- `GET /api/v1/courses/:id` - Buscar curso por ID
- `POST /api/v1/courses` - Criar novo curso
- `PUT /api/v1/courses/:id` - Atualizar curso
- `DELETE /api/v1/courses/:id` - Excluir curso (soft delete)
- `POST /api/v1/courses/:id/disciplines` - Adicionar disciplina a um curso
- `DELETE /api/v1/courses/:id/disciplines/:disciplineId` - Remover disciplina de um curso

### Documentos (feat-041, feat-042, feat-043)

**Endpoints de Documentos:**

- **`POST /api/v1/documents` - Upload de documento (feat-043)**
  - **Autenticação:** Requer autenticação (JWT token)
  - **Autorização:** Aluno, professor ou admin
  - **Body:** Multipart form-data com arquivo + document_type_id
  - **Resposta:** Documento criado (201 Created)
  - **Validações:**
    - Arquivo obrigatório (PDF, JPG, PNG)
    - Máximo 10MB
    - document_type_id obrigatório
    - Não permitir duplicação de documento do mesmo tipo (exceto se rejeitado)
  - **Exemplo:**
    ```bash
    curl -X POST http://localhost:3000/api/v1/documents \
      -H "Authorization: Bearer <token>" \
      -F "document=@documento.pdf" \
      -F "document_type_id=2"
    ```

- **`GET /api/v1/documents` - Listar documentos (feat-043)**
  - **Autenticação:** Requer autenticação
  - **Autorização:** Admin only
  - **Query params:**
    - `status`: pending, approved, rejected
    - `userId`: Filtrar por ID do usuário
    - `page`: Página (padrão: 1)
    - `limit`: Itens por página (padrão: 20)
    - `orderBy`: Campo para ordenar (padrão: created_at)
    - `order`: ASC ou DESC (padrão: DESC)
  - **Resposta:** Lista de documentos com paginação
  - **Exemplo:**
    ```bash
    curl -X GET "http://localhost:3000/api/v1/documents?status=pending&page=1&limit=20" \
      -H "Authorization: Bearer <token>"
    ```

- **`GET /api/v1/documents/:id` - Buscar documento por ID (feat-043)**
  - **Autenticação:** Requer autenticação
  - **Autorização:** Qualquer usuário autenticado
  - **Parâmetros:** `:id` (inteiro positivo)
  - **Resposta:** Documento detalhado com informações do usuário
  - **Exemplo:**
    ```bash
    curl -X GET http://localhost:3000/api/v1/documents/10 \
      -H "Authorization: Bearer <token>"
    ```

- **`PUT /api/v1/documents/:id/approve` - Aprovar documento (feat-043)**
  - **Autenticação:** Requer autenticação
  - **Autorização:** Admin only
  - **Parâmetros:** `:id` (inteiro positivo)
  - **Body:**
    ```json
    {
      "observations": "Documento aprovado" // opcional
    }
    ```
  - **Resposta:** Documento atualizado com status 'approved'
  - **Validações:**
    - Documento não pode estar já aprovado
    - Registra quem aprovou e quando
  - **Exemplo:**
    ```bash
    curl -X PUT http://localhost:3000/api/v1/documents/10/approve \
      -H "Authorization: Bearer <token>" \
      -H "Content-Type: application/json" \
      -d '{"observations": "Documento OK"}'
    ```

- **`PUT /api/v1/documents/:id/reject` - Rejeitar documento (feat-043)**
  - **Autenticação:** Requer autenticação
  - **Autorização:** Admin only
  - **Parâmetros:** `:id` (inteiro positivo)
  - **Body:**
    ```json
    {
      "observations": "Motivo da rejeição" // obrigatório
    }
    ```
  - **Resposta:** Documento atualizado com status 'rejected'
  - **Validações:**
    - Observations é obrigatório
    - Documento não pode estar já rejeitado
    - Registra quem rejeitou e quando
  - **Exemplo:**
    ```bash
    curl -X PUT http://localhost:3000/api/v1/documents/10/reject \
      -H "Authorization: Bearer <token>" \
      -H "Content-Type: application/json" \
      -d '{"observations": "Documento ilegível"}'
    ```

- **`DELETE /api/v1/documents/:id` - Deletar documento (feat-043)**
  - **Autenticação:** Requer autenticação
  - **Autorização:** Admin only
  - **Parâmetros:** `:id` (inteiro positivo)
  - **Resposta:** 204 No Content
  - **Ações:**
    - Remove arquivo do servidor
    - Faz soft delete no banco
  - **Exemplo:**
    ```bash
    curl -X DELETE http://localhost:3000/api/v1/documents/10 \
      -H "Authorization: Bearer <token>"
    ```

- **`GET /api/v1/documents/:id/validate` - Validar documentos obrigatórios (feat-043)**
  - **Autenticação:** Requer autenticação
  - **Autorização:** Qualquer usuário autenticado
  - **Parâmetros:** `:id` (ID do usuário)
  - **Resposta:** Status de validação dos documentos obrigatórios
  - **Exemplo:**
    ```bash
    curl -X GET http://localhost:3000/api/v1/documents/5/validate \
      -H "Authorization: Bearer <token>"
    ```
  - **Resposta exemplo:**
    ```json
    {
      "success": true,
      "data": {
        "allApproved": false,
        "pending": [
          {
            "documentTypeId": 2,
            "documentTypeName": "RG",
            "status": "pending"
          }
        ],
        "approved": [
          {
            "documentTypeId": 1,
            "documentTypeName": "CPF",
            "status": "approved"
          }
        ],
        "rejected": []
      }
    }
    ```

- **`GET /api/v1/documents/:id/download` - Download de documento (feat-044)**
  - **Autenticação:** Requer autenticação (JWT token)
  - **Autorização:** Próprio usuário ou admin
  - **Parâmetros:** `:id` (ID do documento)
  - **Resposta:** Arquivo binário (PDF, JPG ou PNG)
  - **Headers de resposta:**
    - `Content-Type`: application/pdf (ou image/jpeg, image/png)
    - `Content-Disposition`: attachment; filename="documento.pdf"
  - **Validações:**
    - Documento deve existir
    - Usuário deve ser proprietário do documento ou admin
    - Arquivo deve existir no servidor
  - **Exemplo:**
    ```bash
    curl -X GET http://localhost:3000/api/v1/documents/10/download \
      -H "Authorization: Bearer <token>" \
      --output documento_baixado.pdf
    ```
  - **Erros possíveis:**
    - `400 Bad Request`: ID inválido
    - `401 Unauthorized`: Não autenticado
    - `403 Forbidden`: Sem permissão para acessar (documento de outro usuário)
    - `404 Not Found`: Documento ou arquivo não encontrado
    - `500 Internal Server Error`: Erro no servidor
  - **Respostas de erro:**
    ```json
    {
      "success": false,
      "error": {
        "code": "FORBIDDEN",
        "message": "Você não tem permissão para acessar este documento"
      }
    }
    ```
    ```json
    {
      "success": false,
      "error": {
        "code": "FILE_NOT_FOUND",
        "message": "Arquivo não encontrado no servidor"
      }
    }
    ```

- **`GET /api/v1/documents/my-documents` - Listar próprios documentos (feat-045)**
  - **Autenticação:** Requer autenticação (JWT token)
  - **Autorização:** Qualquer usuário autenticado (aluno, professor ou admin)
  - **Query params:**
    - `page` (optional): Página (padrão: 1)
    - `limit` (optional): Itens por página (padrão: 20, máximo: 100)
  - **Resposta:** Lista de documentos do usuário autenticado com paginação
  - **Validações:**
    - Usuário deve estar autenticado
    - Valores de page e limit devem ser inteiros positivos
  - **Exemplo:**
    ```bash
    curl -X GET "http://localhost:3000/api/v1/documents/my-documents?page=1&limit=20" \
      -H "Authorization: Bearer <token>"
    ```
  - **Resposta exemplo (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "documents": [
          {
            "id": 1,
            "user_id": 5,
            "document_type_id": 2,
            "file_name": "1698700200000-rg.pdf",
            "file_size": 245632,
            "mime_type": "application/pdf",
            "status": "pending",
            "reviewed_by": null,
            "reviewed_at": null,
            "observations": null,
            "created_at": "2025-10-30T10:00:00Z",
            "updated_at": "2025-10-30T10:00:00Z",
            "documentType": {
              "id": 2,
              "name": "RG",
              "user_type": "student",
              "is_required": true
            }
          }
        ],
        "total": 5,
        "page": 1,
        "limit": 20,
        "pages": 1
      }
    }
    ```

- **`GET /api/v1/users/:userId/documents` - Listar documentos de um usuário (feat-045)**
  - **Autenticação:** Requer autenticação (JWT token)
  - **Autorização:** Admin pode ver documentos de qualquer usuário, usuário comum vê apenas seus próprios
  - **Parâmetros:** `:userId` (ID do usuário)
  - **Query params:**
    - `page` (optional): Página (padrão: 1)
    - `limit` (optional): Itens por página (padrão: 20, máximo: 100)
  - **Resposta:** Lista de documentos do usuário especificado
  - **Validações:**
    - Usuário deve estar autenticado
    - ID do usuário deve ser inteiro positivo
    - Permissão: admin ou proprietário dos documentos
  - **Exemplo - Admin vizualizando documentos de um aluno:**
    ```bash
    curl -X GET "http://localhost:3000/api/v1/users/5/documents?page=1&limit=20" \
      -H "Authorization: Bearer <admin_token>"
    ```
  - **Exemplo - Aluno vizualizando seus próprios documentos:**
    ```bash
    curl -X GET "http://localhost:3000/api/v1/users/5/documents?page=1&limit=20" \
      -H "Authorization: Bearer <student_token>"  # user_id = 5
    ```
  - **Resposta exemplo (200 OK):** Mesma estrutura de /my-documents
  - **Erros possíveis:**
    - `400 Bad Request`: ID inválido
    - `401 Unauthorized`: Não autenticado
    - `403 Forbidden`: Sem permissão para visualizar documentos deste usuário
    - `404 Not Found`: Usuário não encontrado
    - `500 Internal Server Error`: Erro no servidor
  - **Resposta de erro (403 Forbidden):**
    ```json
    {
      "success": false,
      "error": {
        "code": "FORBIDDEN",
        "message": "Você não tem permissão para visualizar os documentos deste usuário"
      }
    }
    ```

### Contratos (feat-048, feat-049)

**Endpoints de Contratos:**

- **`GET /api/v1/contracts` - Listar contratos (feat-049)**
  - **Autenticação:** Requer autenticação (JWT token)
  - **Autorização:**
    - Admin: pode listar todos os contratos ou filtrar por usuário
    - Aluno/Professor: lista apenas seus próprios contratos
  - **Query params:**
    - `userId` (opcional): ID do usuário para filtrar (admin only)
    - `status` (opcional): 'pending' ou 'accepted'
    - `limit` (opcional, padrão: 10): quantidade de registros
    - `offset` (opcional, padrão: 0): offset para paginação
  - **Resposta:** Lista de contratos com informações de paginação
  - **Validações:**
    - Usuário deve estar autenticado
    - Aluno/Professor não pode listar contratos de outro usuário
  - **Exemplo:**
    ```bash
    curl -X GET "http://localhost:3000/api/v1/contracts?status=pending" \
      -H "Authorization: Bearer <token>"
    ```
  - **Resposta exemplo:**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 42,
          "user_id": 123,
          "template_id": 1,
          "file_path": "uploads/contracts/contract_123_s1_2025_1635680291234.pdf",
          "file_name": "contract_123_s1_2025_1635680291234.pdf",
          "semester": 1,
          "year": 2025,
          "accepted_at": null,
          "status": "pending",
          "created_at": "2025-11-01T10:30:00.000Z"
        }
      ],
      "pagination": {
        "total": 1,
        "limit": 10,
        "offset": 0
      }
    }
    ```

- **`GET /api/v1/contracts/:id` - Buscar contrato por ID (feat-049)**
  - **Autenticação:** Requer autenticação
  - **Autorização:** Proprietário do contrato ou admin
  - **Parâmetros:** `:id` (inteiro positivo)
  - **Resposta:** Dados completos do contrato com informações do usuário e template
  - **Exemplo:**
    ```bash
    curl -X GET http://localhost:3000/api/v1/contracts/42 \
      -H "Authorization: Bearer <token>"
    ```

- **`POST /api/v1/contracts` - Gerar novo contrato (feat-049)**
  - **Autenticação:** Requer autenticação
  - **Autorização:** Admin only
  - **Body (JSON):**
    ```json
    {
      "userId": 123,           // Obrigatório: ID do aluno ou professor
      "userType": "student",   // Obrigatório: 'student' ou 'teacher'
      "semester": 1,           // Opcional: semestre (padrão: atual)
      "year": 2025,            // Opcional: ano (padrão: atual)
      "templateId": 1          // Opcional: ID do template (padrão: primeiro disponível)
    }
    ```
  - **Resposta:** 201 Created com dados do contrato gerado
  - **Validações:**
    - userId e userType são obrigatórios
    - userType deve ser 'student' ou 'teacher'
    - Usuário deve existir no banco
    - Deve existir pelo menos um template disponível
  - **Ações:**
    - Busca dados da matrícula (se aluno) ou professor
    - Substitui placeholders do template
    - Gera PDF automaticamente
    - Salva contrato no banco com status 'pending'
  - **Exemplo:**
    ```bash
    curl -X POST http://localhost:3000/api/v1/contracts \
      -H "Authorization: Bearer <token>" \
      -H "Content-Type: application/json" \
      -d '{
        "userId": 123,
        "userType": "student",
        "semester": 1,
        "year": 2025
      }'
    ```
  - **Erros possíveis:**
    - `400 Bad Request`: Dados obrigatórios faltando
    - `403 Forbidden`: Usuário não é admin
    - `404 Not Found`: Usuário ou template não encontrado
    - `422 Unprocessable Entity`: Nenhum template disponível

- **`POST /api/v1/contracts/:id/accept` - Aceitar contrato (feat-049)**
  - **Autenticação:** Requer autenticação
  - **Autorização:** Proprietário do contrato ou admin
  - **Parâmetros:** `:id` (ID do contrato)
  - **Resposta:** Contrato atualizado com data de aceite
  - **Validações:**
    - Contrato deve existir
    - Usuário deve ser proprietário (ou ser admin)
    - Contrato ainda não pode ter sido aceito
  - **Ações:**
    - Registra data/hora do aceite
    - Atualiza campo `accepted_at` no banco
    - Retorna contrato com status 'accepted'
  - **Exemplo:**
    ```bash
    curl -X POST http://localhost:3000/api/v1/contracts/42/accept \
      -H "Authorization: Bearer <token>"
    ```
  - **Resposta exemplo:**
    ```json
    {
      "success": true,
      "data": {
        "id": 42,
        "user_id": 123,
        "template_id": 1,
        "file_path": "uploads/contracts/contract_123_s1_2025_1635680291234.pdf",
        "file_name": "contract_123_s1_2025_1635680291234.pdf",
        "semester": 1,
        "year": 2025,
        "accepted_at": "2025-11-01T10:35:00.000Z",
        "status": "accepted",
        "created_at": "2025-11-01T10:30:00.000Z"
      },
      "message": "Contrato aceito com sucesso"
    }
    ```
  - **Erros possíveis:**
    - `403 Forbidden`: Usuário não é proprietário e não é admin
    - `404 Not Found`: Contrato não encontrado
    - `422 Unprocessable Entity`: Contrato já foi aceito

- **`GET /api/v1/contracts/:id/pdf` - Download do PDF do contrato (feat-049)**
  - **Autenticação:** Requer autenticação
  - **Autorização:** Proprietário do contrato ou admin
  - **Parâmetros:** `:id` (ID do contrato)
  - **Resposta:** Arquivo PDF para download
  - **Headers de resposta:**
    - `Content-Type`: application/pdf
    - `Content-Disposition`: attachment; filename="contract_123_s1_2025_*.pdf"
  - **Validações:**
    - Contrato deve existir
    - Usuário deve ter permissão de acesso
    - Arquivo PDF deve existir no servidor
  - **Exemplo:**
    ```bash
    curl -X GET http://localhost:3000/api/v1/contracts/42/pdf \
      -H "Authorization: Bearer <token>" \
      --output contrato.pdf
    ```
  - **Erros possíveis:**
    - `403 Forbidden`: Sem permissão para baixar arquivo
    - `404 Not Found`: Contrato ou arquivo não encontrado

**Fluxo Típico de Uso:**

1. **Admin gera contrato para aluno:**
   ```bash
   POST /api/v1/contracts
   { "userId": 123, "userType": "student" }
   ```

2. **Aluno visualiza contratos pendentes:**
   ```bash
   GET /api/v1/contracts?status=pending
   ```

3. **Aluno baixa PDF do contrato:**
   ```bash
   GET /api/v1/contracts/42/pdf
   ```

4. **Aluno aceita o contrato:**
   ```bash
   POST /api/v1/contracts/42/accept
   ```

5. **Admin verifica contratos aceitos:**
   ```bash
   GET /api/v1/contracts?status=accepted
   ```

**Regras de Negócio Implementadas:**
- Contratos são gerados automaticamente para alunos ao criar matrícula
- Contratos devem ser aceitos antes que aluno possa continuar usando o sistema
- Um contrato só pode ser aceito uma vez
- Apenas proprietário (ou admin) pode aceitar/acessar contrato
- Contratos são renovados automaticamente a cada semestre para alunos

## 📝 Template HTML de Contrato Padrão (feat-050)

**Descrição:** Seeder que cria um template HTML profissional para contratos de matrícula com placeholders dinâmicos que serão substituídos pelos dados reais ao gerar PDFs.

**Arquivo de Seeder:** `backend/database/seeders/20251101120000-contract-template.js`

### Características do Template

**Nome do Template:**
- `Contrato de Matrícula Padrão` (ativo por padrão)

**Seções Incluídas:**

1. **Header Profissional**
   - Título "CONTRATO DE MATRÍCULA"
   - Identificação "Secretaria Online - Sistema de Gestão Acadêmica"

2. **Dados do Aluno**
   - {{studentName}}: Nome completo
   - {{studentCPF}}: CPF (formatado)
   - {{studentEmail}}: Email de contato
   - {{studentPhone}}: Telefone
   - {{studentAddress}}: Endereço completo

3. **Dados da Matrícula**
   - {{courseName}}: Nome do curso
   - {{currentSemester}}: Semestre inicial
   - {{enrollmentDate}}: Data da matrícula
   - {{courseDuration}}: Duração total em semestres
   - {{enrollmentNumber}}: Número/ID da matrícula

4. **Termos e Condições**
   - Cláusula 1: Obrigações do Aluno
   - Cláusula 2: Obrigações da Instituição
   - Cláusula 3: Renovação do Contrato
   - Cláusula 4: Cancelamento
   - Cláusula 5: Declaração de Conformidade

5. **Assinaturas**
   - Espaço para assinatura do aluno
   - Espaço para assinatura da instituição

6. **Footer**
   - Data da geração: {{contractDate}}
   - ID do documento: {{contractId}}
   - Timestamp de geração: {{generatedAt}}

### Placeholders Disponíveis

| Placeholder | Descrição | Tipo |
|-------------|-----------|------|
| {{studentName}} | Nome completo do aluno | string |
| {{studentCPF}} | CPF formatado do aluno | string |
| {{studentEmail}} | Email do aluno | string |
| {{studentPhone}} | Telefone do aluno | string |
| {{studentAddress}} | Endereço completo do aluno | string |
| {{courseName}} | Nome do curso | string |
| {{currentSemester}} | Número do semestre atual | number |
| {{enrollmentDate}} | Data da matrícula (dd/MM/yyyy) | date |
| {{courseDuration}} | Total de semestres do curso | number |
| {{enrollmentNumber}} | ID/número da matrícula | number |
| {{contractDate}} | Data da geração do contrato | date |
| {{contractId}} | ID único do contrato | number |
| {{generatedAt}} | Data e hora de geração (ISO 8601) | datetime |

### Estilização

O template inclui CSS profissional com:

✅ **Layout Responsivo**
- Suporta impressão e visualização digital
- Máximo 800px de largura
- Grid layout para organização de campos

✅ **Design Profissional**
- Cor primária: Azul (#0066cc)
- Fontes: Arial, sans-serif
- Espaçamento apropriado entre seções
- Bordas e separadores visuais

✅ **Acessibilidade**
- Alto contraste entre texto e fundo
- Fontes legíveis em tamanhos 11-24px
- Media queries para impressão

✅ **Elementos de Segurança Visual**
- Linhas de assinatura com bordas
- Campos claramente identificados
- Cabeçalho com identidade visual

### Uso do Template

**No ContractService (feat-048):**

```javascript
// 1. Buscar template padrão
const template = await ContractTemplate.findOne({
  where: {
    name: 'Contrato de Matrícula Padrão',
    is_active: true
  }
});

// 2. Substituir placeholders com dados reais
const contractData = {
  studentName: 'João Silva Santos',
  studentCPF: '123.456.789-00',
  studentEmail: 'joao@email.com',
  studentPhone: '(11) 98765-4321',
  studentAddress: 'Rua Principal, 123 - São Paulo, SP',
  courseName: 'Análise e Desenvolvimento de Sistemas',
  currentSemester: 1,
  enrollmentDate: '01/11/2025',
  courseDuration: 6,
  enrollmentNumber: 42,
  contractDate: '01/11/2025',
  contractId: 1,
  generatedAt: '2025-11-01T14:30:00Z'
};

let htmlContent = template.content;
Object.entries(contractData).forEach(([key, value]) => {
  htmlContent = htmlContent.replace(
    new RegExp(`{{${key}}}`, 'g'),
    value
  );
});

// 3. Gerar PDF a partir do HTML
const pdfBuffer = await PDFService.generateFromHTML(htmlContent);

// 4. Salvar contrato com referência ao template
const contract = await Contract.create({
  user_id: userId,
  template_id: template.id,
  file_path: pdfPath,
  file_name: pdfFileName,
  semester: currentSemester,
  year: currentYear
});
```

### Como Executar o Seeder

```bash
# Executar todos os seeders (incluindo o novo template)
npm run db:seed:all

# Ou executar apenas este seeder
npx sequelize-cli db:seed:all --seed 20251101120000-contract-template.js
```

### Criando Novos Templates

Você pode criar templates adicionais para casos específicos:

```javascript
// Exemplo: Template para professor
const teacherTemplate = {
  name: 'Contrato de Professor',
  content: `<html>...</html>`,
  is_active: true
};

await ContractTemplate.create(teacherTemplate);
```

### Validações do Template

- ✅ Nome: String de 3-100 caracteres
- ✅ Conteúdo: LONGTEXT com estrutura HTML válida
- ✅ is_active: Boolean (true para templates disponíveis)
- ✅ Soft delete: Suporta exclusão lógica (deleted_at)
- ✅ Índices otimizados: Por name, is_active, deleted_at

### Troubleshooting

**Template não aparece ao gerar contrato:**
- Verifique se `is_active` é true
- Verifique se `deleted_at` é null
- Confirme que o template foi inserido: `SELECT * FROM contract_templates;`

**Placeholders não sendo substituídos:**
- Use a sintaxe exata: `{{placeholderName}}`
- Certifique-se de que os dados são strings/números válidos
- Verifique se não há espaços extras: `{{studentName }}` (errado)

**PDF gerado sem dados:**
- Confirme que o ContractService está using o mesmo template
- Verifique se os dados de contrato contêm todos os placeholders necessários
- Verifique logs do backend para erros de substituição

### Avaliações (feat-051)

**Descrição:** CRUD de avaliações com rotas para professores criar avaliações de turmas, listar avaliações de uma turma ou professor, buscar avaliação por ID, atualizar e deletar avaliações.

**Arquivos Criados:**
- `backend/src/services/evaluation.service.js` - Serviço de avaliações com lógica de negócio
- `backend/src/controllers/evaluation.controller.js` - Controlador de avaliações
- `backend/src/routes/evaluation.routes.js` - Rotas de avaliações

**Endpoints de Avaliações:**

- **`POST /api/v1/evaluations` - Criar nova avaliação (feat-051)**
  - **Autenticação:** Requer autenticação (JWT token)
  - **Autorização:** Professor ou Admin
  - **Body (JSON):**
    ```json
    {
      "class_id": 1,              // Obrigatório: ID da turma
      "teacher_id": 123,          // Obrigatório: ID do professor
      "discipline_id": 5,         // Obrigatório: ID da disciplina
      "name": "Prova de Matemática",  // Obrigatório: Nome da avaliação
      "date": "2025-11-15",       // Obrigatório: Data (YYYY-MM-DD)
      "type": "grade"             // Obrigatório: 'grade' (0-10) ou 'concept'
    }
    ```
  - **Resposta:** 201 Created com dados da avaliação criada
  - **Validações:**
    - Todos os campos são obrigatórios
    - `class_id`, `teacher_id`, `discipline_id` devem existir no banco
    - `type` deve ser 'grade' ou 'concept'
    - Data deve ser válida
  - **Exemplo:**
    ```bash
    curl -X POST http://localhost:3000/api/v1/evaluations \
      -H "Authorization: Bearer <token>" \
      -H "Content-Type: application/json" \
      -d '{
        "class_id": 1,
        "teacher_id": 123,
        "discipline_id": 5,
        "name": "Prova de Matemática",
        "date": "2025-11-15",
        "type": "grade"
      }'
    ```

- **`GET /api/v1/classes/:classId/evaluations` - Listar avaliações de uma turma (feat-051)**
  - **Autenticação:** Requer autenticação
  - **Query params:**
    - `type` (opcional): Filtrar por tipo ('grade' ou 'concept')
  - **Resposta:** Array de avaliações com informações do professor e disciplina
  - **Exemplo:**
    ```bash
    curl -X GET "http://localhost:3000/api/v1/classes/1/evaluations?type=grade" \
      -H "Authorization: Bearer <token>"
    ```
  - **Resposta exemplo:**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 42,
          "class_id": 1,
          "teacher_id": 123,
          "discipline_id": 5,
          "name": "Prova de Matemática",
          "date": "2025-11-15",
          "type": "grade",
          "teacher": {
            "id": 123,
            "name": "Prof. João Silva",
            "email": "joao@email.com"
          },
          "discipline": {
            "id": 5,
            "name": "Matemática",
            "code": "MAT001"
          },
          "created_at": "2025-11-01T14:30:00Z"
        }
      ],
      "count": 1
    }
    ```

- **`GET /api/v1/teachers/:teacherId/evaluations` - Listar avaliações de um professor (feat-051)**
  - **Autenticação:** Requer autenticação
  - **Parâmetros:** `:teacherId` (inteiro positivo)
  - **Resposta:** Array de avaliações criadas pelo professor
  - **Exemplo:**
    ```bash
    curl -X GET http://localhost:3000/api/v1/teachers/123/evaluations \
      -H "Authorization: Bearer <token>"
    ```

- **`GET /api/v1/evaluations/:id` - Buscar avaliação por ID (feat-051)**
  - **Autenticação:** Requer autenticação
  - **Parâmetros:** `:id` (inteiro positivo)
  - **Resposta:** Dados completos da avaliação com professor, disciplina e notas associadas
  - **Exemplo:**
    ```bash
    curl -X GET http://localhost:3000/api/v1/evaluations/42 \
      -H "Authorization: Bearer <token>"
    ```

- **`PUT /api/v1/evaluations/:id` - Atualizar avaliação (feat-051)**
  - **Autenticação:** Requer autenticação
  - **Autorização:** Professor (criador) ou Admin
  - **Parâmetros:** `:id` (inteiro positivo)
  - **Body (JSON):** Campos a atualizar (opcionais)
    ```json
    {
      "name": "Prova Revisada",
      "date": "2025-11-20",
      "type": "concept"
    }
    ```
  - **Resposta:** 200 OK com dados atualizados
  - **Exemplo:**
    ```bash
    curl -X PUT http://localhost:3000/api/v1/evaluations/42 \
      -H "Authorization: Bearer <token>" \
      -H "Content-Type: application/json" \
      -d '{ "name": "Prova Revisada" }'
    ```

- **`DELETE /api/v1/evaluations/:id` - Deletar avaliação (feat-051)**
  - **Autenticação:** Requer autenticação
  - **Autorização:** Professor (criador) ou Admin
  - **Parâmetros:** `:id` (inteiro positivo)
  - **Resposta:** 204 No Content
  - **Validação:** Avaliação deve existir
  - **Exemplo:**
    ```bash
    curl -X DELETE http://localhost:3000/api/v1/evaluations/42 \
      -H "Authorization: Bearer <token>"
    ```

- **`GET /api/v1/classes/:classId/evaluations/upcoming` - Listar avaliações futuras (feat-051)**
  - **Autenticação:** Requer autenticação
  - **Parâmetros:** `:classId` (inteiro positivo)
  - **Resposta:** Array de avaliações com data futura, ordenadas por data ascendente
  - **Exemplo:**
    ```bash
    curl -X GET http://localhost:3000/api/v1/classes/1/evaluations/upcoming \
      -H "Authorization: Bearer <token>"
    ```

**EvaluationService (feat-051):**
O serviço implementa a lógica de negócio para avaliações:
- `create(evaluationData)` - Cria avaliação com validações de turma, professor e disciplina
- `listByClass(classId, options)` - Lista avaliações de uma turma com filtro opcional por tipo
- `listByTeacher(teacherId)` - Lista avaliações criadas por um professor
- `getById(evaluationId)` - Busca avaliação completa com relacionamentos
- `update(evaluationId, updateData)` - Atualiza avaliação com validações
- `delete(evaluationId)` - Deleta avaliação (soft delete)
- `countByClass(classId)` - Conta avaliações de uma turma
- `listUpcomingByClass(classId)` - Lista avaliações futuras de uma turma

**Validações Implementadas:**
- ✅ Turma deve existir
- ✅ Professor deve existir e ter role 'teacher'
- ✅ Disciplina deve existir
- ✅ Type deve ser 'grade' ou 'concept'
- ✅ Data deve ser válida
- ✅ Soft delete habilitado (deleted_at)

**Tipos de Avaliação:**
- `grade`: Avaliação com nota de 0 a 10
- `concept`: Avaliação com conceito (Satisfatório/Não Satisfatório)

**Exemplos de Uso:**

1. **Professor cria avaliação:**
   ```bash
   POST /api/v1/evaluations
   Body: { "class_id": 1, "teacher_id": 123, "discipline_id": 5, "name": "Prova", "date": "2025-11-15", "type": "grade" }
   ```

2. **Listar avaliações de uma turma:**
   ```bash
   GET /api/v1/classes/1/evaluations
   ```

3. **Listar avaliações futuras:**
   ```bash
   GET /api/v1/classes/1/evaluations/upcoming
   ```

4. **Professor atualiza avaliação:**
   ```bash
   PUT /api/v1/evaluations/42
   Body: { "date": "2025-11-20" }
   ```

5. **Deletar avaliação:**
   ```bash
   DELETE /api/v1/evaluations/42
   ```

### Notas (feat-052)

**Descrição:** Serviço de lançamento de notas com validações robustas de tipo de avaliação, valor de nota, e verificação de inscrição do aluno na turma.

**Arquivos Criados:**
- `backend/src/services/grade.service.js` - Serviço de notas com lógica de negócio validações

**Métodos do GradeService:**

- **`createGrade(gradeData)` - Lançar nota para um aluno**
  - Validações:
    - ✅ Avaliação deve existir
    - ✅ Aluno deve existir e ter role 'student'
    - ✅ Aluno deve estar inscrito na turma da avaliação
    - ✅ Tipo de nota deve corresponder ao tipo da avaliação
    - ✅ Para 'grade': valor deve estar entre 0 e 10
    - ✅ Para 'concept': valor deve ser 'satisfactory' ou 'unsatisfactory'
  - Retorna nota criada ou atualizada (idempotente)
  - Exemplo:
    ```javascript
    // Nota numérica
    const grade = await GradeService.createGrade({
      evaluation_id: 1,
      student_id: 5,
      grade: 8.5
    });

    // Conceito
    const grade = await GradeService.createGrade({
      evaluation_id: 2,
      student_id: 5,
      concept: 'satisfactory'
    });
    ```

- **`listByEvaluation(evaluationId, options)` - Listar notas de uma avaliação**
  - Options:
    - `includePending`: boolean - incluir alunos sem nota lançada (default: false)
  - Retorna array de notas com informações do aluno

- **`getGradeByEvaluationAndStudent(evaluationId, studentId)` - Buscar nota específica**
  - Retorna nota do aluno na avaliação ou null se não existe

- **`updateGrade(gradeId, updateData)` - Atualizar nota existente**
  - Recebe { grade } ou { concept } conforme tipo da avaliação
  - Valida novo valor antes de atualizar

- **`deleteGrade(gradeId)` - Deletar nota (soft delete)**
  - Remove logicamente a nota do banco

- **`gradeExists(evaluationId, studentId)` - Verificar se nota foi lançada**
  - Retorna boolean

- **`listPendingGrades(evaluationId)` - Listar alunos sem nota lançada**
  - Retorna array com id, name, email dos alunos que ainda não receberam nota

- **`countGradesByEvaluation(evaluationId)` - Contar notas lançadas**
  - Retorna objeto: { total: number, launched: number, pending: number }

- **`validateGradeInput(data)` - Validar dados de entrada**
  - Validação básica antes de chamar createGrade
  - Retorna objeto com erros ou vazio se válido

**Validações Implementadas:**

1. **Validação de Avaliação**
   - Avaliação deve existir no banco
   - Tipo da avaliação define qual tipo de nota é aceito

2. **Validação de Aluno**
   - Aluno deve existir
   - Aluno deve ter role 'student'
   - Aluno deve estar inscrito na turma da avaliação

3. **Validação de Nota Numérica (grade)**
   - Obrigatório quando tipo de avaliação é 'grade'
   - Deve ser número decimal válido
   - Deve estar entre 0 e 10
   - Pode ter até 2 casas decimais (ex: 8.75)

4. **Validação de Conceito (concept)**
   - Obrigatório quando tipo de avaliação é 'concept'
   - Deve ser 'satisfactory' ou 'unsatisfactory'
   - Case-insensitive (será normalizado para minúsculas)

5. **Validação XOR (exclusive OR)**
   - Apenas UMA das duas opções pode estar preenchida
   - Não é permitido informar grade E concept simultaneamente
   - Ambos não podem estar vazios

6. **Validação de Inscrição**
   - Verifica se aluno está na tabela class_students
   - Impede lançamento de nota para aluno não inscrito na turma

**Exemplos de Uso Completo:**

1. **Criar nota numérica:**
   ```javascript
   try {
     const grade = await GradeService.createGrade({
       evaluation_id: 1,
       student_id: 5,
       grade: 7.5
     });
     console.log('Nota lançada:', grade.id);
   } catch (error) {
     console.error(error.message); // Ex: "Aluno não está inscrito na turma"
   }
   ```

2. **Listar notas de uma avaliação:**
   ```javascript
   const grades = await GradeService.listByEvaluation(1);
   // Retorna apenas notas lançadas (grade ou concept preenchido)

   const allGrades = await GradeService.listByEvaluation(1, { includePending: true });
   // Retorna incluindo alunos que ainda não receberam nota
   ```

3. **Verificar se nota já existe:**
   ```javascript
   const exists = await GradeService.gradeExists(1, 5);
   if (exists) {
     // Atualizar nota existente
     await GradeService.updateGrade(gradeId, { grade: 8.0 });
   } else {
     // Criar nova nota
     await GradeService.createGrade({ evaluation_id: 1, student_id: 5, grade: 8.0 });
   }
   ```

4. **Listar alunos que ainda não receberam nota:**
   ```javascript
   const pending = await GradeService.listPendingGrades(1);
   // Retorna: [
   //   { id: 3, name: "João Silva", email: "joao@example.com" },
   //   { id: 7, name: "Maria Santos", email: "maria@example.com" }
   // ]
   ```

5. **Obter estatísticas de lançamento:**
   ```javascript
   const stats = await GradeService.countGradesByEvaluation(1);
   // Retorna: { total: 30, launched: 25, pending: 5 }
   ```

**Códigos de Erro Retornados:**

| Código | HTTP | Descrição |
|--------|------|-----------|
| `EVALUATION_NOT_FOUND` | 404 | Avaliação não encontrada |
| `STUDENT_NOT_FOUND` | 404 | Aluno não encontrado |
| `STUDENT_NOT_IN_CLASS` | 422 | Aluno não está inscrito na turma |
| `INVALID_EVALUATION_TYPE` | 422 | Tipo de avaliação inválido |
| `MISSING_GRADE_VALUE` | 422 | Nota numérica obrigatória mas não informada |
| `MISSING_CONCEPT_VALUE` | 422 | Conceito obrigatório mas não informado |
| `INVALID_GRADE_FORMAT` | 422 | Nota com formato inválido |
| `GRADE_OUT_OF_RANGE` | 422 | Nota fora do intervalo 0-10 |
| `INVALID_CONCEPT_VALUE` | 422 | Conceito inválido |
| `GRADE_NOT_FOUND` | 404 | Nota não encontrada |
| `GRADE_CREATE_ERROR` | 500 | Erro ao criar nota |
| `GRADE_UPDATE_ERROR` | 500 | Erro ao atualizar nota |
| `GRADE_DELETE_ERROR` | 500 | Erro ao deletar nota |

### Lançamento de Notas (feat-053)

**Descrição:** Controlador e rotas para lançamento e gerenciamento de notas individuais. Permite que professores lancem, editem e visualizem notas com validação de permissões.

**Arquivos Criados:**
- `backend/src/controllers/grade.controller.js` - Controlador para operações CRUD de notas
- `backend/src/routes/grade.routes.js` - Rotas para endpoints de notas

**Endpoints de Lançamento de Notas:**

- **`POST /api/v1/grades` - Lançar nota para um aluno em uma avaliação (feat-053)**
  - **Autenticação:** Requer autenticação (JWT token)
  - **Autorização:** Professor que leciona a disciplina ou Admin
  - **Body (JSON):**
    ```json
    {
      "evaluation_id": 1,
      "student_id": 5,
      "grade": 8.5
    }
    // OU para avaliação conceitual
    {
      "evaluation_id": 2,
      "student_id": 5,
      "concept": "satisfactory"
    }
    ```
  - **Respostas:**
    - **201 Created** - Nota lançada com sucesso
      ```json
      {
        "success": true,
        "data": {
          "id": 1,
          "evaluation_id": 1,
          "student_id": 5,
          "grade": 8.5,
          "concept": null,
          "created_at": "2025-11-01T10:00:00Z",
          "updated_at": "2025-11-01T10:00:00Z"
        },
        "message": "Nota lançada com sucesso"
      }
      ```
    - **400 Bad Request** - Dados inválidos ou campos faltando
    - **403 Forbidden** - Usuário não leciona a disciplina
    - **422 Unprocessable Entity** - Validação de negócio falhou (aluno não está na turma, valor inválido)
    - **500 Internal Server Error** - Erro no servidor
  - **Validações:**
    - ✅ evaluation_id e student_id obrigatórios
    - ✅ Ao menos grade ou concept deve estar preenchido
    - ✅ Professor deve lecionar a disciplina da avaliação
    - ✅ Aluno deve estar inscrito na turma
    - ✅ Tipo de nota deve corresponder ao tipo da avaliação
    - ✅ Se grade: valor entre 0 e 10
    - ✅ Se concept: 'satisfactory' ou 'unsatisfactory'
  - **Exemplo com curl:**
    ```bash
    curl -X POST http://localhost:3000/api/v1/grades \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer <token>" \
      -d '{
        "evaluation_id": 1,
        "student_id": 5,
        "grade": 8.5
      }'
    ```

- **`PUT /api/v1/grades/:id` - Atualizar nota existente (feat-053)**
  - **Autenticação:** Requer autenticação (JWT token)
  - **Autorização:** Professor que leciona ou Admin
  - **Parâmetros:** `:id` (ID da nota)
  - **Body (JSON):**
    ```json
    {
      "grade": 9.0
    }
    // OU para conceitual
    {
      "concept": "unsatisfactory"
    }
    ```
  - **Respostas:**
    - **200 OK** - Nota atualizada com sucesso
    - **400 Bad Request** - Dados inválidos
    - **403 Forbidden** - Sem permissão
    - **404 Not Found** - Nota não encontrada
    - **422 Unprocessable Entity** - Validação falhou
    - **500 Internal Server Error** - Erro no servidor
  - **Validações:**
    - ✅ Ao menos grade ou concept deve estar preenchido
    - ✅ Professor deve lecionar a disciplina
    - ✅ Tipo de nota deve corresponder ao tipo da avaliação
  - **Exemplo:**
    ```bash
    curl -X PUT http://localhost:3000/api/v1/grades/1 \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer <token>" \
      -d '{ "grade": 9.0 }'
    ```

- **`GET /api/v1/evaluations/:evaluationId/grades` - Listar todas as notas de uma avaliação (feat-053)**
  - **Autenticação:** Requer autenticação (JWT token)
  - **Autorização:** Professor que leciona a disciplina ou Admin
  - **Parâmetros:**
    - `:evaluationId` (ID da avaliação)
    - Query param `?includePending=true` (opcional) - Incluir alunos sem nota lançada
  - **Respostas:**
    - **200 OK** - Lista de notas
      ```json
      {
        "success": true,
        "data": [
          {
            "id": 1,
            "evaluation_id": 1,
            "student_id": 5,
            "grade": 8.5,
            "concept": null,
            "student": {
              "id": 5,
              "name": "João Silva",
              "email": "joao@example.com"
            },
            "created_at": "2025-11-01T10:00:00Z"
          }
        ],
        "count": 1
      }
      ```
    - **400 Bad Request** - Parâmetros inválidos
    - **403 Forbidden** - Sem permissão
    - **404 Not Found** - Avaliação não encontrada
    - **500 Internal Server Error** - Erro no servidor
  - **Exemplo:**
    ```bash
    curl -X GET http://localhost:3000/api/v1/evaluations/1/grades \
      -H "Authorization: Bearer <token>"
    ```

- **`GET /api/v1/evaluations/:evaluationId/grades/stats` - Obter estatísticas de lançamento (feat-053)**
  - **Autenticação:** Requer autenticação (JWT token)
  - **Autorização:** Professor que leciona ou Admin
  - **Parâmetros:** `:evaluationId` (ID da avaliação)
  - **Respostas:**
    - **200 OK** - Estatísticas de lançamento
      ```json
      {
        "success": true,
        "data": {
          "total": 30,
          "launched": 25,
          "pending": 5
        }
      }
      ```
  - **Exemplo:**
    ```bash
    curl -X GET http://localhost:3000/api/v1/evaluations/1/grades/stats \
      -H "Authorization: Bearer <token>"
    ```

- **`GET /api/v1/evaluations/:evaluationId/grades/pending` - Listar alunos sem nota (feat-053)**
  - **Autenticação:** Requer autenticação (JWT token)
  - **Autorização:** Professor que leciona ou Admin
  - **Parâmetros:** `:evaluationId` (ID da avaliação)
  - **Respostas:**
    - **200 OK** - Lista de alunos sem nota
      ```json
      {
        "success": true,
        "data": [
          {
            "id": 3,
            "name": "Maria Santos",
            "email": "maria@example.com"
          },
          {
            "id": 7,
            "name": "Pedro Costa",
            "email": "pedro@example.com"
          }
        ],
        "count": 2
      }
      ```
  - **Exemplo:**
    ```bash
    curl -X GET http://localhost:3000/api/v1/evaluations/1/grades/pending \
      -H "Authorization: Bearer <token>"
    ```

**GradeController (feat-053):**
O controller implementa a lógica de validação e autorização:
- `create(req, res, next)` - Lança nota com validação de permissão e dados
- `update(req, res, next)` - Atualiza nota existente
- `getByEvaluation(req, res, next)` - Lista notas de uma avaliação
- `getStats(req, res, next)` - Retorna estatísticas de lançamento
- `getPending(req, res, next)` - Lista alunos que ainda não receberam nota

**Validações Implementadas:**
- ✅ Autenticação JWT obrigatória
- ✅ Autorização: apenas professor que leciona ou admin
- ✅ Dados de entrada validados (evaluation_id, student_id, grade/concept)
- ✅ Verificação se professor leciona a disciplina
- ✅ Delegação de validações de negócio ao GradeService
- ✅ Tratamento robusto de erros com mensagens amigáveis
- ✅ Logs estruturados de operações críticas

**Códigos HTTP Utilizados:**
- `201 Created` - Nota criada com sucesso
- `200 OK` - Operações de leitura e atualização bem-sucedidas
- `400 Bad Request` - Dados inválidos ou faltando campos obrigatórios
- `403 Forbidden` - Sem permissão para realizar operação
- `404 Not Found` - Recurso não encontrado
- `422 Unprocessable Entity` - Validação de negócio falhou
- `500 Internal Server Error` - Erro no servidor

**Exemplo de Fluxo Completo:**

1. **Professor cria avaliação:**
   ```bash
   POST /api/v1/evaluations
   Body: { "class_id": 1, "teacher_id": 123, "discipline_id": 5, "name": "Prova P1", "date": "2025-11-15", "type": "grade" }
   ```

2. **Professor lança notas dos alunos:**
   ```bash
   POST /api/v1/grades
   Body: { "evaluation_id": 1, "student_id": 5, "grade": 8.5 }
   POST /api/v1/grades
   Body: { "evaluation_id": 1, "student_id": 6, "grade": 7.0 }
   ```

3. **Professor verifica quantas notas foram lançadas:**
   ```bash
   GET /api/v1/evaluations/1/grades/stats
   Response: { total: 30, launched: 2, pending: 28 }
   ```

4. **Professor vê quem ainda não recebeu nota:**
   ```bash
   GET /api/v1/evaluations/1/grades/pending
   ```

5. **Professor atualiza uma nota:**
   ```bash
   PUT /api/v1/grades/1
   Body: { "grade": 9.0 }
   ```

### Matrículas (Admin e Student)

**Regras de Negócio Implementadas:**
- Um aluno não pode ter matrícula ativa/pendente em dois cursos simultaneamente
- Matrícula só pode ser ativada se todos os documentos obrigatórios forem aprovados
- Status padrão de nova matrícula: 'pending' (aguardando aprovação de documentos)
- Status 'active': matrícula ativada após aprovação de todos os documentos obrigatórios

**EnrollmentService (feat-038):**
O serviço implementa validações automáticas de regras de negócio:
- `create(studentId, courseId)` - Cria matrícula com validação de duplicação
- `canEnroll(studentId, courseId)` - Verifica se aluno pode se matricular
- `validateDocuments(studentId)` - Valida se todos documentos obrigatórios foram aprovados
- `activateEnrollment(enrollmentId)` - Ativa matrícula após validação de documentos
- `getPendingDocuments(studentId)` - Lista documentos obrigatórios pendentes
- `updateStatus(enrollmentId, newStatus)` - Atualiza status (pending/active/cancelled)
- `getByStudent(studentId)` - Lista matrículas do aluno
- `getByCourse(courseId)` - Lista matrículas do curso
- `cancel(enrollmentId)` - Cancela matrícula
- `delete(enrollmentId)` - Remove matrícula (soft delete)

**EnrollmentController e Rotas (feat-039):**
O controller implementa endpoints CRUD para matrículas:

**Endpoints de Matrículas:**
- `POST /api/v1/enrollments` - Criar nova matrícula (requer autenticação)
  - Body: `{ "student_id": 1, "course_id": 2, "enrollment_date": "2025-10-30" }`
  - Response: Matrícula criada com status 'pending' (201 Created)
  - Validações: student_id e course_id obrigatórios, enrollment_date opcional

- `GET /api/v1/enrollments` - Listar todas as matrículas (admin only)
  - Response: Array de matrículas com informações de aluno e curso
  - Ordenação: Por data de matrícula (desc)

- `GET /api/v1/enrollments/:id` - Buscar matrícula por ID (requer autenticação)
  - Response: Matrícula detalhada com informações de aluno e curso
  - Validação: ID deve ser inteiro positivo

- **`GET /api/v1/students/:studentId/enrollments` - Listar matrículas do aluno (feat-040)**
  - **Autenticação:** Requer autenticação (JWT token)
  - **Resposta:** Array de matrículas do aluno com informações do curso
  - **Parâmetros:** `studentId` (inteiro positivo)
  - **Exemplo de resposta:**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "student_id": 5,
          "course_id": 2,
          "status": "pending",
          "enrollment_date": "2025-10-30",
          "created_at": "2025-10-30T10:00:00Z",
          "course": {
            "id": 2,
            "name": "Engenharia de Software",
            "duration_semesters": 4
          }
        }
      ]
    }
    ```
  - **Validações:** studentId deve ser inteiro positivo
  - **Casos de uso:**
    - Aluno consulta suas próprias matrículas
    - Admin consulta matrículas de qualquer aluno
    - Útil para verificar histórico de matrículas e status atual

- `PUT /api/v1/enrollments/:id/status` - Alterar status (admin only)
  - Body: `{ "status": "active|pending|cancelled" }`
  - Response: Matrícula atualizada
  - Validações: Status deve ser válido, documentos devem estar aprovados para ativar
  - Regra de negócio: Apenas pendente → ativa valida documentos automaticamente

- `DELETE /api/v1/enrollments/:id` - Excluir matrícula (soft delete, admin only)
  - Response: 204 No Content
  - Validação: ID deve ser inteiro positivo

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 🎨 Qualidade de Código (ESLint e Prettier)

Este projeto utiliza **ESLint** para identificar e corrigir problemas no código, e **Prettier** para garantir formatação consistente.

### Configurações

- **Backend**: `eslint.config.js` (Flat Config - ESLint v9+) com regras para Node.js/JavaScript
- **Frontend**: `.eslintrc.json` com regras para TypeScript/React
- **Prettier**: `.prettierrc` na raiz (configurações unificadas)
- **Ignore**: `.prettierignore` (arquivos excluídos da formatação)

**Nota:** O backend utiliza o formato **Flat Config** do ESLint 9+. Se você encontrar problemas, certifique-se de que está usando ESLint v9 ou superior.

### Comandos Disponíveis

#### Backend

```bash
cd backend

# Verificar problemas de código (sem corrigir)
npm run lint

# Corrigir automaticamente problemas de código
npm run lint:fix

# Verificar formatação (sem modificar arquivos)
npm run format:check

# Formatar todos os arquivos
npm run format
```

#### Frontend

```bash
cd frontend

# Verificar problemas de código (sem corrigir)
npm run lint

# Corrigir automaticamente problemas de código
npm run lint:fix

# Verificar formatação (sem modificar arquivos)
npm run format:check

# Formatar todos os arquivos
npm run format
```

### Integração com VS Code

Para melhor experiência de desenvolvimento, instale as extensões:

- **ESLint** ([dbaeumer.vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint))
- **Prettier** ([esbenp.prettier-vscode](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode))

Adicione ao seu `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### Regras Principais

**Backend (Node.js):**
- Single quotes para strings
- Ponto-e-vírgula obrigatório
- Indentação de 2 espaços
- Máximo de 120 caracteres por linha
- Trailing comma em arrays/objects multilinha

**Frontend (TypeScript/React):**
- Single quotes para strings (double quotes para JSX)
- Ponto-e-vírgula obrigatório
- Indentação de 2 espaços
- Máximo de 100 caracteres por linha
- React Hooks validados automaticamente
- Variáveis não utilizadas iniciadas com `_` são permitidas

### Pre-commit Hook (Opcional)

Para garantir que todo código commitado esteja formatado, você pode configurar o **Husky** com **lint-staged**:

```bash
# Na raiz do projeto
npm install --save-dev husky lint-staged

# Configurar husky
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

Adicione ao `package.json` (raiz):

```json
{
  "lint-staged": {
    "backend/**/*.{js,json}": [
      "cd backend && npm run lint:fix",
      "cd backend && npm run format"
    ],
    "frontend/**/*.{ts,tsx}": [
      "cd frontend && npm run lint:fix",
      "cd frontend && npm run format"
    ]
  }
}
```

## 📦 Build para Produção

### Frontend

```bash
cd frontend
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

### Backend

```bash
cd backend
npm run start:prod
```

## 🚀 Deploy

Consulte o arquivo [contextDoc.md](./docs/contextDoc.md) para instruções detalhadas de deploy no Hostgator.

## ⚠️ Sistema de Tratamento de Erros

O sistema implementa tratamento de erros centralizado com logs estruturados, diferenciando erros operacionais (esperados) de erros de sistema (bugs).

### Classe AppError

Erro customizado para situações operacionais esperadas:

```javascript
const { AppError } = require('./middlewares/error.middleware');

// Erro de validação
throw new AppError('CPF inválido', 400, 'VALIDATION_ERROR');

// Erro de recurso não encontrado
throw new AppError('Aluno não encontrado', 404, 'NOT_FOUND');

// Erro de autorização
throw new AppError('Acesso negado', 403, 'FORBIDDEN');
```

### Helpers de Erro

Funções auxiliares para criação de erros comuns:

```javascript
const {
  createValidationError,
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
  createConflictError
} = require('./middlewares/error.middleware');

// Erros de validação com detalhes
const errors = [
  { field: 'cpf', message: 'CPF inválido' },
  { field: 'email', message: 'Email já cadastrado' }
];
throw createValidationError('Dados inválidos', errors);

// Erro de recurso não encontrado
if (!student) {
  throw createNotFoundError('Aluno');
}

// Erro de conflito (duplicação)
const existingUser = await User.findOne({ where: { cpf } });
if (existingUser) {
  throw createConflictError('CPF já cadastrado');
}
```

### Resposta de Erro Padronizada

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "CPF inválido",
    "details": [
      {
        "field": "cpf",
        "message": "CPF deve conter 11 dígitos"
      }
    ]
  }
}
```

### Diferenciação de Erros

- **Erros Operacionais** (`isOperational: true`):
  - Erros esperados no fluxo normal (validação, recurso não encontrado, conflito)
  - Logados como `warn` (warning)
  - Mensagem de erro é enviada ao cliente
  - Exemplos: CPF duplicado, documento não encontrado, permissão negada

- **Erros Não Operacionais** (bugs):
  - Erros inesperados de programação (exceções não tratadas)
  - Logados como `error` com stack trace completo
  - Em produção, retorna mensagem genérica ao cliente
  - Em desenvolvimento, inclui stack trace na resposta
  - Exemplos: referência a variável undefined, erro de sintaxe, falha de conexão

### Integração com Winston

Todos os erros são automaticamente logados com Winston:

```javascript
// Erro operacional (log como warning)
logger.warn('Erro operacional', {
  code: 'VALIDATION_ERROR',
  message: 'CPF inválido',
  url: '/api/students',
  method: 'POST',
  userId: 123
});

// Erro não operacional (log como error com stack trace)
logger.error('Erro não operacional detectado', {
  code: 'INTERNAL_ERROR',
  message: 'Cannot read property of undefined',
  stack: err.stack,
  url: '/api/students',
  method: 'POST'
});
```

### Configuração

O middleware de erro está configurado em `backend/src/server.js`:

```javascript
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

// Após todas as rotas
app.use(notFoundHandler);  // Trata rotas 404
app.use(errorHandler);     // Trata todos os erros (deve ser o último middleware)
```

**⚠️ Importante:**
- O `errorHandler` deve sempre ser o **último middleware** registrado
- O `notFoundHandler` deve vir **antes** do `errorHandler`
- Em produção, erros não operacionais retornam mensagens genéricas (sem expor detalhes internos)
- Em desenvolvimento, stack traces são incluídos na resposta para facilitar debugging

## 📋 Sistema de Logging

O sistema utiliza **Winston** para logging estruturado, permitindo rastreamento completo de operações e diagnóstico de problemas.

### Configuração

O logger está configurado em `backend/src/utils/logger.js` com:

- **Transports**: Console (sempre) + Arquivos (produção)
- **Níveis de log**: error, warn, info, http, verbose, debug
- **Formato**: JSON estruturado em produção, legível em desenvolvimento
- **Rotação de logs**: Arquivos limitados a 5MB com histórico de 5 arquivos

### Arquivos de Log

```
backend/logs/
├── combined.log    # Todos os logs (info, warn, error, etc.)
└── error.log       # Apenas logs de erro
```

**⚠️ Importante:**
- Em produção, logs são salvos em arquivos automaticamente
- Em desenvolvimento, logs são exibidos apenas no console (a menos que `LOG_TO_FILE=true`)
- Logs são ignorados pelo Git (configurado em `.gitignore`)
- Arquivos antigos são automaticamente removidos após atingir o limite

### Variáveis de Ambiente

```env
# Nível de log (error|warn|info|http|verbose|debug)
LOG_LEVEL=debug                    # desenvolvimento: debug, produção: info

# Forçar gravação em arquivo mesmo em desenvolvimento
LOG_TO_FILE=false                  # Padrão: apenas em produção

# NODE_ENV determina automaticamente o comportamento
NODE_ENV=development               # ou production
```

### Uso Básico

```javascript
const logger = require('./utils/logger');

// Logs simples
logger.info('Usuário criado com sucesso', { userId: 123 });
logger.warn('Documento rejeitado', { documentId: 456, reason: 'ilegível' });
logger.error('Erro ao processar matrícula', { error: err.message });
logger.debug('Processando validação de CPF', { cpf: '123.456.789-00' });

// Helpers especializados
logger.logUserAction('login', { userId: 123, ip: '192.168.1.1' });
logger.logError('AuthController.login', error, { userId: 123 });

// Stream para Morgan (logs HTTP)
const morgan = require('morgan');
app.use(morgan('combined', { stream: logger.stream }));
```

### Níveis de Log

| Nível | Quando Usar | Exemplos |
|-------|-------------|----------|
| **error** | Erros críticos que impedem funcionamento | Falha ao conectar no banco, exceções não tratadas |
| **warn** | Situações anormais que não impedem funcionamento | Documento rejeitado, tentativa de login com senha incorreta |
| **info** | Informações gerais sobre operações | Usuário criado, matrícula aprovada, documento enviado |
| **http** | Requisições HTTP (integração com Morgan) | GET /api/users 200, POST /api/login 401 |
| **verbose** | Informações detalhadas para debugging | Detalhes de queries SQL, payloads completos |
| **debug** | Informações de debug para desenvolvimento | Valores de variáveis, fluxo de execução |

### Formato de Log

**Produção (JSON estruturado):**
```json
{
  "timestamp": "2025-10-28 10:30:00",
  "level": "info",
  "message": "User action: login",
  "action": "login",
  "userId": 123,
  "role": "admin",
  "ip": "192.168.1.1"
}
```

**Desenvolvimento (legível):**
```
2025-10-28 10:30:00 [info]: User action: login {"action":"login","userId":123,"role":"admin","ip":"192.168.1.1"}
```

### Operações Logadas Automaticamente

O sistema registra automaticamente:

- ✅ Login/logout de usuários
- ✅ Criação/edição/exclusão de recursos (alunos, professores, cursos, etc.)
- ✅ Aprovação/rejeição de documentos
- ✅ Aprovação/rejeição de solicitações
- ✅ Upload de arquivos
- ✅ Geração de PDFs (contratos)
- ✅ Erros e exceções
- ✅ Requisições HTTP (se Morgan estiver configurado)

### Monitoramento em Produção

Para monitorar logs em produção:

```bash
# Ver logs em tempo real
tail -f backend/logs/combined.log

# Ver apenas erros
tail -f backend/logs/error.log

# Buscar logs específicos
grep "userId.*123" backend/logs/combined.log

# Contar erros por tipo
grep -o '"code":"[^"]*"' backend/logs/error.log | sort | uniq -c
```

### Integração com Serviços Externos (Opcional)

Winston suporta transports adicionais para serviços de monitoramento:

- **Loggly**: `winston-loggly-bulk`
- **Papertrail**: `winston-papertrail`
- **Slack**: `winston-slack-webhook-transport`
- **Sentry**: `@sentry/node`

Consulte a documentação do Winston para configuração: https://github.com/winstonjs/winston

## 🔒 Segurança

### Autenticação e Autorização

O sistema implementa múltiplas camadas de segurança para proteger dados sensíveis e controlar acesso aos recursos:

#### CORS (Cross-Origin Resource Sharing)

O sistema implementa **CORS** para controlar quais domínios externos podem fazer requisições à API:

**Configuração aplicada:**

- **Origens permitidas**: Definidas em `CORS_ORIGIN` no `.env`
  - Desenvolvimento: `http://localhost:5173` (frontend Vite padrão)
  - Produção: `https://seudominio.com`
  - Múltiplas origens: `https://dominio1.com,https://dominio2.com` (separadas por vírgula)

- **Credenciais**: Habilitado (`credentials: true`)
  - Permite envio de cookies e headers de autorização (JWT)

- **Métodos HTTP**: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
  - Todos os métodos REST necessários para CRUD completo

- **Headers permitidos**:
  - `Content-Type`: Para envio de JSON/form-data
  - `Authorization`: Para tokens JWT
  - `X-Requested-With`: Identificador de requisições AJAX
  - `Accept`, `Origin`: Headers padrão do navegador

- **Headers expostos**:
  - `Content-Range`, `X-Content-Range`, `X-Total-Count`: Para paginação e listagens

- **Preflight cache**: 24 horas (86400 segundos)
  - Reduz requisições OPTIONS repetidas do navegador

- **Requisições sem origin**: Automaticamente permitidas
  - Mobile apps, Postman, curl não enviam header `Origin`

**Como funciona:**

Quando o frontend faz uma requisição para a API:
1. Navegador envia requisição OPTIONS (preflight) para verificar permissões
2. Servidor retorna headers CORS informando se a origem é permitida
3. Se permitido, navegador procede com a requisição real (GET, POST, etc.)
4. Servidor retorna resposta com headers CORS confirmando permissão

**Configuração no .env:**
```env
# Desenvolvimento (frontend local)
CORS_ORIGIN=http://localhost:5173

# Produção (domínio único)
CORS_ORIGIN=https://seudominio.com

# Múltiplos ambientes
CORS_ORIGIN=http://localhost:5173,https://staging.seudominio.com,https://seudominio.com
```

**⚠️ Importante:**
- **NUNCA** use `CORS_ORIGIN=*` em produção (permite qualquer domínio fazer requisições)
- Em produção, liste apenas os domínios confiáveis
- Requisições sem origin (Postman, mobile) são permitidas automaticamente
- HTTPS é obrigatório em produção para segurança

**Validação da configuração:**
```bash
# Testar preflight (OPTIONS)
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:3000/api/v1/health --verbose

# Resposta esperada: HTTP 204 com headers CORS
```

#### Helmet.js (Headers de Segurança HTTP)

O sistema utiliza **Helmet.js** para aplicar automaticamente headers de segurança HTTP que protegem contra vulnerabilidades comuns:

**Proteções aplicadas:**

- **Content Security Policy (CSP)**: Define políticas de segurança de conteúdo, restringindo fontes de scripts, estilos e recursos
  - `default-src 'self'`: Permite recursos apenas do mesmo domínio
  - `script-src 'self'`: Restringe execução de scripts apenas do domínio
  - `img-src 'self' data: https:`: Permite imagens do domínio, data URIs e HTTPS
  - `frame-src 'none'`: Bloqueia uso em iframes (previne clickjacking)
  - `object-src 'none'`: Bloqueia plugins como Flash
  - `upgrade-insecure-requests`: Força upgrade de HTTP para HTTPS

- **HTTP Strict Transport Security (HSTS)**: Força navegadores a usarem HTTPS
  - `max-age: 31536000`: Cache por 1 ano
  - `includeSubDomains`: Aplica a todos os subdomínios
  - `preload`: Permite inclusão na lista HSTS pré-carregada dos navegadores

- **X-Frame-Options**: Previne clickjacking bloqueando uso em iframes
  - Configurado com `deny` (bloqueio total)

- **X-Content-Type-Options**: Previne MIME sniffing
  - Força navegadores a respeitarem o Content-Type declarado

- **X-XSS-Protection**: Proteção XSS legada para navegadores antigos
  - Ativa filtro XSS embutido nos navegadores

- **Referrer-Policy**: Controla informações de referrer enviadas em requisições
  - Configurado com `strict-origin-when-cross-origin`

- **Hide X-Powered-By**: Remove header que identifica Express.js
  - Dificulta identificação da tecnologia usada

**Configuração:**
Todos os headers são aplicados automaticamente em **todas as rotas** através do middleware configurado em `backend/src/server.js`:

```javascript
app.use(helmet({
  contentSecurityPolicy: { /* ... */ },
  hsts: { /* ... */ },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hidePoweredBy: true,
}));
```

**⚠️ Importante:**
- Em produção, certifique-se de que o servidor está usando **HTTPS/TLS** para que HSTS funcione corretamente
- Se precisar ajustar políticas de CSP (ex: permitir CDNs externos), edite as diretivas em `server.js`
- Nunca desabilite o Helmet.js em produção

#### JWT (JSON Web Token)
- **Access Token**: Expira em 15 minutos (configurável via `JWT_ACCESS_EXPIRATION`)
- **Refresh Token**: Expira em 7 dias (configurável via `JWT_REFRESH_EXPIRATION`)
- **Algoritmo**: HS256 (HMAC SHA-256)
- **Chave Secreta**: Definida em `JWT_SECRET` (mínimo 32 caracteres recomendado)
- **Payload**: Contém apenas id, role e email do usuário (sem dados sensíveis)

**Gerar chave JWT segura:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Bcrypt (Hash de Senhas)
- **Salt Rounds**: 10 (balanceamento entre segurança e performance)
- **Hash irreversível**: Senhas nunca são armazenadas em texto plano
- **Senhas provisórias**: Geradas automaticamente com 8 caracteres (letras + números)
- **Primeiro acesso**: Sistema força alteração de senha provisória

**Exemplo de uso:**
```javascript
const { hashPassword, comparePassword } = require('./utils/generators');

// Criar novo usuário
const hashedPassword = await hashPassword('minhasenha123');
// Salvar hashedPassword no banco

// Validar login
const isValid = await comparePassword('minhasenha123', hashedPasswordFromDB);
```

#### RBAC (Role-Based Access Control)
O sistema implementa controle de acesso baseado em roles (perfis de usuário):

- **Roles disponíveis:**
  - `admin`: Acesso total ao sistema (gestão de usuários, cursos, documentos, solicitações)
  - `teacher`: Acesso às suas turmas, alunos e lançamento de notas
  - `student`: Acesso às suas notas, documentos e solicitações

**Middleware de autorização:**
```javascript
const { authorize, ROLES } = require('./middlewares/rbac.middleware');

// Apenas administradores
router.get('/users', authenticate, authorize(ROLES.ADMIN), UserController.list);

// Administradores e professores
router.get('/classes', authenticate, authorize(ROLES.ADMIN, ROLES.TEACHER), ClassController.list);

// Qualquer usuário autenticado
router.get('/profile', authenticate, authorize(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT), UserController.getProfile);
```

**Middlewares pré-configurados:**
```javascript
const { authorizeAdmin, authorizeTeacher, authorizeStudent, authorizeAny } = require('./middlewares/rbac.middleware');

// Uso simplificado
router.get('/users', authenticate, authorizeAdmin, UserController.list);
router.get('/grades', authenticate, authorizeStudent, GradeController.getMyGrades);
```

**Respostas HTTP:**
- `401 Unauthorized`: Usuário não autenticado
- `403 Forbidden`: Usuário autenticado mas sem permissão

#### Rate Limiting (Proteção contra Força Bruta)
O sistema implementa limitação de taxa (rate limiting) para proteger contra ataques de força bruta e uso excessivo de recursos:

**Endpoints protegidos:**
- **Login** (`POST /api/auth/login`):
  - Máximo: 5 tentativas por IP
  - Janela de tempo: 15 minutos
  - Retorno: HTTP 429 (Too Many Requests) após exceder o limite

- **Mudança de senha** (`POST /api/auth/change-password`):
  - Máximo: 3 tentativas por IP
  - Janela de tempo: 60 minutos
  - Proteção mais rigorosa por ser operação crítica de segurança

**Headers de resposta:**
Quando o rate limiting está ativo, a API retorna headers informativos:
```
RateLimit-Limit: 5
RateLimit-Remaining: 3
RateLimit-Reset: 1234567890
```

**Configuração:**
```javascript
// backend/src/middlewares/rateLimiter.middleware.js
const { loginRateLimiter, passwordChangeRateLimiter } = require('./middlewares/rateLimiter.middleware');

router.post('/login', loginRateLimiter, AuthController.login);
router.post('/change-password', passwordChangeRateLimiter, AuthController.changePassword);
```

**Resposta ao exceder limite:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Muitas tentativas de login. Por favor, tente novamente em 15 minutos."
  },
  "retryAfter": 900
}
```

**Variáveis de ambiente:**
```env
RATE_LIMIT_LOGIN_MAX=5          # Máximo de tentativas de login
RATE_LIMIT_LOGIN_WINDOW=15      # Janela em minutos
```

**⚠️ Nota:** Em ambiente de teste (`NODE_ENV=test`), o rate limiting é automaticamente desabilitado.

#### Validação de Dados (express-validator)

O sistema implementa validação robusta em todas as requisições usando **express-validator** combinado com validadores customizados:

**Validadores disponíveis:**
- **CPF**: Valida formato e dígitos verificadores
- **Email**: Validação padrão RFC5322 + normalização
- **Telefone**: Valida formato brasileiro (10-11 dígitos)
- **Senha forte**: Mínimo 8 caracteres, maiúsculas, minúsculas e números
- **Data de nascimento**: Valida idade mínima (16 anos)
- **Notas**: 0-10 com no máximo 2 casas decimais
- **Conceitos**: satisfactory/unsatisfactory
- **Códigos de curso/disciplina**: Formato AAA999
- **Semestres**: 1-12
- **Paginação**: Page/limit/sort

**Arquivos implementados:**
- `backend/src/middlewares/validation.middleware.js`: Middleware com regras de validação pré-configuradas para cada entidade
- `backend/src/utils/validators.js`: Funções de validação customizadas reutilizáveis

**Uso em rotas:**
```javascript
const { studentValidationRules, handleValidationErrors } = require('./middlewares/validation.middleware');

router.post('/students',
  authenticate,
  authorizeAdmin,
  studentValidationRules(),
  handleValidationErrors,
  StudentController.create
);
```

**Resposta de erro padronizada:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos fornecidos",
    "details": [
      {
        "field": "cpf",
        "message": "CPF inválido",
        "value": "123.456.789-00"
      }
    ]
  }
}
```

**Validadores pré-configurados disponíveis:**
- `studentValidationRules()`: Validação de alunos
- `teacherValidationRules()`: Validação de professores
- `courseValidationRules()`: Validação de cursos
- `disciplineValidationRules()`: Validação de disciplinas
- `enrollmentValidationRules()`: Validação de matrículas
- `gradeValidationRules()`: Validação de notas
- `evaluationValidationRules()`: Validação de avaliações
- `loginValidationRules()`: Validação de login
- `changePasswordValidationRules()`: Validação de mudança de senha
- `idParamValidationRules()`: Validação de parâmetros ID
- `paginationValidationRules()`: Validação de queries de paginação

#### Outras Medidas de Segurança
- Validação de inputs no frontend e backend (express-validator)
- Headers de segurança com Helmet.js (CSP, HSTS, X-Frame-Options, etc.)
- CORS configurado adequadamente
- Logs estruturados para auditoria de operações críticas
- Soft delete em tabelas sensíveis (preserva histórico)

**⚠️ IMPORTANTE EM PRODUÇÃO:**
- Use HTTPS obrigatoriamente (certificado SSL/TLS)
- Gere `JWT_SECRET` forte e único (nunca use valores de exemplo)
- Configure `CORS_ORIGIN` com domínio específico (nunca use `*`)
- Mantenha dependências atualizadas (`npm audit` regularmente)
- Configure backups automáticos do banco de dados

## 📊 Consulta de Notas do Aluno - GET /my-grades (feat-054)

O sistema implementa um endpoint para alunos consultarem suas próprias notas com suporte a filtros opcionais.

### Descrição

Os alunos podem consultar todas as suas notas em uma única requisição, visualizando informações detalhadas sobre cada avaliação, disciplina e turma. O endpoint suporta filtros por semestre e disciplina para facilitar a busca.

### Funcionalidades

✅ **Listagem Completa**: Ver todas as notas de todas as disciplinas
✅ **Filtro por Semestre**: Consultar apenas notas de um semestre específico
✅ **Filtro por Disciplina**: Consultar apenas notas de uma disciplina específica
✅ **Combinação de Filtros**: Usar semestre E disciplina simultaneamente
✅ **Detalhes Expandidos**: Cada nota inclui informações de avaliação, disciplina e turma
✅ **Segurança**: Apenas estudantes autenticados podem acessar suas próprias notas

### Endpoint

**URL:** `GET /api/my-grades`

**Autenticação:** Obrigatória (JWT Token de aluno)

**Restrição:** Apenas para usuários com `role = 'student'`

### Query Parameters (Opcionais)

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `semester` | number | Filtra por número do semestre | `?semester=1` |
| `discipline_id` | number | Filtra por ID da disciplina | `?discipline_id=3` |

**Combinações válidas:**
- Sem parâmetros: Retorna todas as notas
- `?semester=1`: Retorna notas do 1º semestre
- `?discipline_id=5`: Retorna notas da disciplina ID 5
- `?semester=1&discipline_id=5`: Retorna notas do 1º semestre DA disciplina ID 5

### Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "evaluation": {
        "id": 10,
        "name": "Prova 1",
        "date": "2025-10-15",
        "type": "grade"
      },
      "class": {
        "id": 2,
        "semester": 1,
        "year": 2025
      },
      "discipline": {
        "id": 3,
        "name": "Cálculo I",
        "code": "MAT101"
      },
      "grade": 8.5,
      "concept": null,
      "created_at": "2025-10-16T10:30:00.000Z",
      "updated_at": "2025-10-16T10:30:00.000Z"
    },
    {
      "id": 2,
      "evaluation": {
        "id": 11,
        "name": "Trabalho Final",
        "date": "2025-10-20",
        "type": "concept"
      },
      "class": {
        "id": 3,
        "semester": 1,
        "year": 2025
      },
      "discipline": {
        "id": 4,
        "name": "Física I",
        "code": "FIS101"
      },
      "grade": null,
      "concept": "satisfactory",
      "created_at": "2025-10-21T14:15:00.000Z",
      "updated_at": "2025-10-21T14:15:00.000Z"
    }
  ],
  "count": 2,
  "filters": null
}
```

### Resposta com Filtros Aplicados

```bash
# Requisição
curl -H "Authorization: Bearer seu_token" \
  "http://localhost:3000/api/my-grades?semester=1&discipline_id=3"

# Resposta
{
  "success": true,
  "data": [
    {
      "id": 1,
      "evaluation": { ... },
      "class": { "semester": 1, ... },
      "discipline": { "id": 3, ... },
      "grade": 8.5,
      ...
    }
  ],
  "count": 1,
  "filters": {
    "semester": 1,
    "discipline_id": 3
  }
}
```

### Respostas de Erro

#### 400 - Parâmetro de Query Inválido

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Semestre deve ser um número válido maior que 0"
  }
}
```

#### 403 - Usuário Não é Aluno

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Apenas alunos podem acessar suas próprias notas"
  }
}
```

#### 404 - Aluno Não Encontrado

```json
{
  "success": false,
  "error": {
    "code": "STUDENT_NOT_FOUND",
    "message": "Aluno não encontrado"
  }
}
```

#### 500 - Erro do Servidor

```json
{
  "success": false,
  "error": {
    "code": "STUDENT_GRADES_FETCH_ERROR",
    "message": "Erro ao buscar notas do aluno"
  }
}
```

### Exemplos de Uso

#### JavaScript/Fetch API

```javascript
// Sem filtros - todas as notas
const token = localStorage.getItem('authToken');
const response = await fetch('http://localhost:3000/api/my-grades', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data); // Array de notas
```

#### Axios

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
});

// Todas as notas
const { data: allGrades } = await apiClient.get('/my-grades');

// Apenas do 1º semestre
const { data: semester1 } = await apiClient.get('/my-grades?semester=1');

// Apenas da disciplina ID 3
const { data: discipline3 } = await apiClient.get('/my-grades?discipline_id=3');

// 1º semestre E disciplina ID 3
const { data: filtered } = await apiClient.get('/my-grades?semester=1&discipline_id=3');
```

#### cURL

```bash
# Sem autenticação (retorna 401)
curl http://localhost:3000/api/my-grades

# Com token JWT
TOKEN="seu_token_aqui"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/my-grades

# Com filtro de semestre
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3000/api/my-grades?semester=1"

# Com ambos os filtros
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3000/api/my-grades?semester=1&discipline_id=3"
```

### Estrutura de Dados Retornados

Cada nota retornada contém:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | number | ID único da nota |
| `evaluation.id` | number | ID da avaliação |
| `evaluation.name` | string | Nome da avaliação (ex: "Prova 1") |
| `evaluation.date` | string | Data da avaliação (YYYY-MM-DD) |
| `evaluation.type` | string | Tipo de avaliação: "grade" ou "concept" |
| `class.id` | number | ID da turma |
| `class.semester` | number | Semestre da turma |
| `class.year` | number | Ano da turma |
| `discipline.id` | number | ID da disciplina |
| `discipline.name` | string | Nome da disciplina |
| `discipline.code` | string | Código da disciplina |
| `grade` | number\|null | Nota numérica (0-10) ou null se não é tipo "grade" |
| `concept` | string\|null | Conceito (satisfactory/unsatisfactory) ou null se não é tipo "concept" |
| `created_at` | string | Timestamp de criação (ISO 8601) |
| `updated_at` | string | Timestamp da última atualização (ISO 8601) |

### Casos de Uso

1. **Aluno quer ver todas suas notas**: Sem parâmetros
2. **Aluno quer ver notas do semestre atual**: `?semester=1` (ou o semestre atual)
3. **Aluno quer revisar notas de uma disciplina específica**: `?discipline_id=5`
4. **Aluno quer revisar notas de Cálculo I apenas do 1º semestre**: `?semester=1&discipline_id=3`

### Validações Implementadas

✅ Verificação de autenticação (JWT válido)
✅ Validação de role (apenas estudantes)
✅ Validação de query parameters (semestre > 0, discipline_id > 0)
✅ Verificação de existência do aluno
✅ Validação de tipos de dados

### Performance

- **Índices do banco**: As queries utilizam índices em `student_id`, `evaluation_id` e `discipline_id`
- **Relacionamentos eager-loaded**: Avalia ções, disciplinas e turmas são carregadas em uma única query
- **Ordenação**: Notas são ordenadas por data de criação (mais recentes primeiro)

### Segurança

✅ Autenticação obrigatória (sem token, retorna 401)
✅ Autorização por role (apenas estudantes)
✅ Isolamento de dados (aluno vê apenas suas próprias notas)
✅ Validação de inputs (proteção contra injeção SQL via ORM)
✅ Rate limiting por usuário (prevenção de abuso)

### Logging

Todas as requisições são registradas com informações:

```
[GradeController.getMyGrades] Notas do aluno obtidas com sucesso
  studentId: 123
  count: 5
  filters: { semester: 1 }
```

### Arquivos Afetados

- `backend/src/controllers/grade.controller.js` - Método `getMyGrades()`
- `backend/src/services/grade.service.js` - Método `getStudentGrades()`
- `backend/src/routes/grade.routes.js` - Rota `GET /my-grades`

## 🚀 Deploy em Produção

### Deploy Automatizado

O projeto inclui um script de deploy automatizado que facilita o processo de envio para produção:

```bash
# Deploy completo (frontend + backend)
./deploy.sh

# Deploy apenas do frontend
./deploy.sh frontend

# Deploy apenas do backend
./deploy.sh backend
```

### Configuração do Deploy

1. **Edite o arquivo `deploy.sh`** e configure as variáveis de conexão SSH:

```bash
SSH_USER="seu_usuario_ssh"
SSH_HOST="seu-dominio.com"
SSH_PORT="22"
REMOTE_PUBLIC_HTML="/home/seu_usuario/public_html"
REMOTE_API_PATH="/home/seu_usuario/api"
PM2_APP_NAME="secretaria-api"
```

2. **Configure variáveis de ambiente no servidor:**

Copie o arquivo `.env.production.example` para `.env` no servidor e preencha com os valores de produção.

### Scripts de Build

**Frontend:**
```bash
cd frontend
npm run build        # Build de produção (gera pasta dist/)
```

**Backend:**
```bash
cd backend
npm run start:prod   # Inicia em modo produção (NODE_ENV=production)
```

### Documentação Completa

Para instruções detalhadas de deploy, configuração de PM2, troubleshooting e mais, consulte:

- 📖 **[Guia Completo de Deploy](./docs/deploy-guide.md)** - Instruções detalhadas passo a passo
- ⚡ **[Quick Reference de Deploy](./docs/deploy-quick-reference.md)** - Comandos úteis para consulta rápida

### Requisitos no Servidor

- Node.js v20 LTS
- PM2 instalado globalmente (`npm install -g pm2`)
- MySQL 8.0
- Certificado SSL configurado
- Acesso SSH habilitado

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrão de Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração de código
- `test`: Testes
- `chore`: Manutenção

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

## 📞 Suporte

Para reportar problemas ou solicitar funcionalidades, abra uma [issue](../../issues) no repositório.

---

**Desenvolvido com ❤️ para facilitar a gestão acadêmica**
