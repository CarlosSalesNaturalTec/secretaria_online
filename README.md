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
- Nodemailer (Envio de emails)
- Puppeteer/PDFKit (Geração de PDFs)
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

Crie o banco de dados MySQL:

```bash
mysql -u seu_usuario -p
CREATE DATABASE secretaria_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

Execute as migrations:

```bash
npx sequelize-cli db:migrate
```

Execute os seeders (dados iniciais):

```bash
npx sequelize-cli db:seed:all
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
- Verifique as credenciais no `.env` (DB_USER, DB_PASSWORD)
- Teste a conexão: `mysql -u root -p secretaria_online`

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
- Verifique se `CORS_ORIGIN` no backend `.env` inclui `http://localhost:5173`
- Em produção, use o domínio correto: `https://seudominio.com`

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

## 🔒 Segurança

- Autenticação JWT com tokens de curta duração
- Senhas hashadas com bcrypt
- Validação de inputs no frontend e backend
- Rate limiting para prevenir ataques
- Headers de segurança com Helmet.js
- CORS configurado adequadamente

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
