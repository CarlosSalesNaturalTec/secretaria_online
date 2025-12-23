# 📌 Documentação do Projeto — Secretaria Online

## 1. Visão Geral

**Secretaria Online** é um sistema de gestão acadêmica desenvolvido para uma instituição de ensino com aproximadamente 200 alunos e 10 professores. O sistema centraliza a gestão de alunos, professores, cursos, disciplinas, matrículas, turmas, contratos e documentos acadêmicos.

O projeto é um **monorepo** dividido em duas partes principais:
- **Frontend:** SPA moderna em React 19 com TypeScript.
- **Backend:** API REST em Node.js v20 com Express e MySQL.

---

## 2. Arquitetura e Tecnologias

### Backend (`/backend`)
*   **Runtime:** Node.js v20 LTS.
*   **Framework:** Express.js v4.
*   **Banco de Dados:** MySQL 8.0 com ORM **Sequelize**.
*   **Autenticação:** JWT (JSON Web Tokens) com Refresh Tokens.
*   **Funcionalidades Chave:**
    *   Upload de arquivos (Multer).
    *   Geração de PDFs (PDFKit).
    *   Tarefas agendadas (Node-cron).
    *   Envio de emails (Nodemailer).
*   **Estrutura de Pastas:**
    *   `src/controllers`: Lógica de entrada/saída HTTP.
    *   `src/services`: Regras de negócio.
    *   `src/models`: Definições de tabelas Sequelize.
    *   `src/routes`: Definição de endpoints.
    *   `src/middlewares`: Autenticação, validação, upload.
    *   `src/utils`: Helpers e logger (Winston).

### Frontend (`/frontend`)
*   **Framework:** React 19 + TypeScript.
*   **Build Tool:** Vite.
*   **Estilização:** Tailwind CSS v4.
*   **Gerenciamento de Estado:** TanStack Query (Server State) + Context API (Auth).
*   **Roteamento:** React Router DOM v7.
*   **Formulários:** React Hook Form + Zod.
*   **Estrutura de Pastas:**
    *   `src/pages`: Componentes de página (divididos por role: admin/student/teacher).
    *   `src/components`: Componentes reutilizáveis (ui, forms, layout).
    *   `src/services`: Integração com a API (Axios).
    *   `src/hooks`: Custom hooks (principalmente queries do React Query).
    *   `src/types`: Definições de tipos TypeScript.

---

## 3. Configuração e Execução

### Pré-requisitos
*   Node.js v20+
*   MySQL 8.0+

### Configuração Inicial
1.  **Variáveis de Ambiente:**
    *   Backend: Copie `.env.example` para `.env` em `backend/`. Configure as credenciais do banco.
    *   Frontend: Copie `.env.example` para `.env` em `frontend/`.

2.  **Instalação de Dependências:**
    ```bash
    cd backend && npm install
    cd ../frontend && npm install
    ```

3.  **Banco de Dados:**
    ```bash
    cd backend
    npm run db:migrate  # Criar tabelas
    npm run db:seed     # Popular com dados iniciais (Admin: admin / admin123)
    ```

### Comandos de Execução

| Ação | Comando Backend (`/backend`) | Comando Frontend (`/frontend`) |
| :--- | :--- | :--- |
| **Rodar Dev** | `npm run dev` (Porta 3000) | `npm run dev` (Porta 5173) |
| **Migrações** | `npm run db:migrate` | - |
| **Desfazer Migração** | `npm run db:migrate:undo` | - |
| **Seeds** | `npm run db:seed` | - |
| **Lint/Format** | `npm run lint` / `npm run format` | `npm run lint` / `npm run format` |
| **Testes** | (Não configurado) | `npm test` |

---

## 4. Padrões de Desenvolvimento

### Convenções de Código
*   **Backend:** CamelCase para arquivos e variáveis. Arquitetura em camadas (Controller -> Service -> Model).
    *   *Regra de Ouro:* Controladores devem ser magros. Regra de negócio fica nos Services.
*   **Frontend:** PascalCase para componentes. Hooks iniciam com `use`.
    *   *Regra de Ouro:* Use TanStack Query para dados assíncronos. Evite `useEffect` para fetch de dados.

### Fluxo de Database
*   Nunca use `sync()` em produção.
*   Sempre crie migrações para alterações de esquema:
    ```bash
    npx sequelize-cli migration:generate --name nome-descritivo
    ```

### Autenticação e RBAC
*   O sistema usa RBAC (Role-Based Access Control) com 3 papéis: `admin`, `teacher`, `student`.
*   Rotas protegidas no backend usam middleware `authenticate` e `rbac(['role'])`.
*   No frontend, use `<PrivateRoute requiredRole="admin">`.

---

## 5. Documentação Adicional
*   **`CLAUDE.md`**: Guia detalhado de desenvolvimento e comandos.
*   **`docs/api-documentation.md`**: Detalhes dos endpoints da API.
*   **`docs/requirements.md`**: Requisitos funcionais do sistema.
*   **`docs/ESTRATEGIA_MIGRACAO_v3.md`**: Detalhes sobre a migração de dados do sistema legado.
