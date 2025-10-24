# Context Documentation - Secretaria Online

## 1. VISÃO GERAL DA ARQUITETURA

### Tipo de Arquitetura
**Arquitetura Monolítica MVC (Model-View-Controller)** com separação clara entre frontend e backend.

### Justificativa da Escolha

A escolha de uma arquitetura monolítica se justifica pelos seguintes fatores:

1. **Escala do Projeto**: Volume inicial de ~200 alunos e ~10 professores não justifica a complexidade de microserviços
2. **Simplicidade de Deploy**: Hostgator (ambiente compartilhado) tem limitações para deploy de arquiteturas distribuídas
3. **Manutenibilidade**: Equipe pequena se beneficia da simplicidade de uma base de código unificada
4. **Performance Adequada**: Para até 50 usuários simultâneos, uma aplicação monolítica bem otimizada atende perfeitamente
5. **Custo-Benefício**: Menor overhead operacional e infraestrutura mais simples
6. **Time to Market**: Desenvolvimento e deploy mais rápidos

### Diagrama Conceitual da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        CAMADA CLIENTE                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Browser   │  │  Tablet    │  │ Smartphone │            │
│  │  Desktop   │  │            │  │            │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                    │
│                      (Frontend - React)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Páginas por Perfil:                                  │  │
│  │  - Dashboard Admin   - Dashboard Aluno                │  │
│  │  - Dashboard Prof    - Gestão de Contratos           │  │
│  │  - Upload Docs       - Lançamento de Notas           │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API (JSON)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE APLICAÇÃO                       │
│                   (Backend - Node.js/Express)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Middlewares:                                         │  │
│  │  - Autenticação JWT  - Validação de Dados            │  │
│  │  - Controle de Acesso (RBAC)  - Upload de Arquivos  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Controllers:                                         │  │
│  │  - AuthController    - UserController                 │  │
│  │  - StudentController - TeacherController              │  │
│  │  - EnrollmentController - GradeController            │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services (Lógica de Negócio):                       │  │
│  │  - ContractService   - EmailService                   │  │
│  │  - PDFGeneratorService - DocumentValidationService   │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │ ORM (Sequelize)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE PERSISTÊNCIA                    │
│                         MySQL Database                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Principais Tabelas:                                  │  │
│  │  - users (admin, teachers, students)                  │  │
│  │  - courses, disciplines, classes                      │  │
│  │  - enrollments, grades, evaluations                   │  │
│  │  - contracts, documents, requests                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  SISTEMA DE ARQUIVOS                         │
│  /uploads/documents/  - Documentos enviados por usuários    │
│  /uploads/contracts/  - PDFs de contratos gerados           │
│  /temp/              - Arquivos temporários                  │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Requisição Típico

1. **Cliente** faz requisição HTTP (ex: login de aluno)
2. **Frontend** envia POST para `/api/auth/login` com credenciais
3. **Middleware de Autenticação** valida formato e sanitiza dados
4. **AuthController** recebe a requisição
5. **AuthService** valida credenciais no banco de dados
6. **JWT Token** é gerado e retornado ao cliente
7. **Frontend** armazena token e redireciona para dashboard apropriado
8. Próximas requisições incluem token no header `Authorization: Bearer <token>`
9. **Middleware de Autorização** valida token e perfil do usuário antes de permitir acesso aos recursos

---

## 2. STACK TECNOLÓGICA

### 2.1 Frontend

**Framework/Biblioteca:** React 18.x

**Linguagem:** TypeScript

**Build Tool:** Vite

**Principais Bibliotecas:**

| Biblioteca | Propósito | Versão |
|-----------|-----------|---------|
| React Router DOM | Roteamento SPA | ^6.x |
| Axios | Cliente HTTP para API | ^1.x |
| React Hook Form | Gerenciamento de formulários | ^7.x |
| Zod | Validação de schemas | ^3.x |
| TanStack Query (React Query) | Cache e gerenciamento de estado servidor | ^5.x |
| Tailwind CSS | Estilização utility-first | ^3.x |
| Headless UI | Componentes acessíveis | ^2.x |
| React PDF | Visualização de PDFs | ^7.x |
| date-fns | Manipulação de datas | ^3.x |
| lucide-react | Ícones | ^0.x |

**Justificativa das Escolhas:**

- **React**: Ecossistema maduro, vasta comunidade, fácil de encontrar desenvolvedores, excelente performance
- **TypeScript**: Type safety reduz bugs em produção, melhor DX (Developer Experience) com autocomplete
- **Vite**: Build extremamente rápido, HMR (Hot Module Replacement) instantâneo, configuração mínima
- **React Router**: Padrão de facto para roteamento em React, suporta lazy loading de rotas
- **TanStack Query**: Gerenciamento eficiente de cache, reduz chamadas desnecessárias à API, otimização automática
- **Tailwind CSS**: Desenvolvimento rápido, bundle pequeno, design system consistente, responsividade fácil
- **React Hook Form + Zod**: Formulários performáticos com validação robusta e type-safe

---

### 2.2 Backend

**Linguagem:** Node.js v20 LTS

**Framework:** Express.js 4.x

**Runtime:** Node.js

**Principais Bibliotecas/Pacotes:**

| Pacote | Propósito | Versão |
|--------|-----------|---------|
| Express | Framework web minimalista | ^4.x |
| Sequelize | ORM para MySQL | ^6.x |
| mysql2 | Driver MySQL para Node.js | ^3.x |
| bcryptjs | Hash de senhas | ^2.x |
| jsonwebtoken | Geração e validação de JWT | ^9.x |
| multer | Upload de arquivos multipart | ^1.x |
| puppeteer | Geração de PDFs | ^21.x |
| nodemailer | Envio de emails | ^6.x |
| express-validator | Validação de requisições | ^7.x |
| helmet | Segurança HTTP headers | ^7.x |
| cors | Configuração CORS | ^2.x |
| dotenv | Variáveis de ambiente | ^16.x |
| winston | Sistema de logs | ^3.x |
| express-rate-limit | Rate limiting | ^7.x |
| cron | Agendamento de tarefas | ^3.x |

**Justificativa das Escolhas:**

- **Node.js v20 LTS**: Suporte de longo prazo, performance excelente, compatibilidade com Hostgator
- **Express**: Minimalista, flexível, amplamente adotado, documentação extensa
- **Sequelize**: ORM maduro para MySQL, suporte a migrations e seeders, fácil manutenção
- **bcryptjs**: Algoritmo seguro para hash de senhas, resistente a ataques de força bruta
- **JWT**: Stateless authentication, escalável, suportado por bibliotecas em todas as plataformas
- **Puppeteer**: Geração de PDFs com HTML/CSS, flexibilidade total no design dos contratos
- **Nodemailer**: Biblioteca confiável para envio de emails, suporta múltiplos transportes
- **Winston**: Logging estruturado, múltiplos níveis, suporte a transports (arquivo, console, etc.)

---

### 2.3 Banco de Dados

**Tipo:** SQL (Relacional)

**SGBD:** MySQL 8.0

**Justificativa da Escolha:**

- **Requisito do Cliente**: Hostgator fornece MySQL nativamente
- **Modelo de Dados Relacional**: Relacionamentos complexos entre alunos, professores, turmas, cursos, matrículas e notas se beneficiam de banco relacional
- **Integridade Referencial**: Foreign keys garantem consistência dos dados (ex: ao deletar um curso, podemos cascatear ou impedir se houver matrículas)
- **Transações ACID**: Operações críticas como matrícula e aprovação de documentos requerem atomicidade
- **Maturidade**: MySQL é extremamente estável e tem suporte massivo da comunidade
- **Performance**: Para volumes de até 500 usuários e ~1000 documentos, MySQL tem performance excelente

**Estratégia de Modelagem:**

- **Normalização**: Tabelas normalizadas até 3FN para evitar redundância
- **Índices Estratégicos**: Em colunas frequentemente consultadas (ex: `cpf`, `email`, `user_id`)
- **Soft Deletes**: Tabelas críticas (users, enrollments) usarão `deleted_at` para exclusão lógica
- **Timestamps**: Todas as tabelas terão `created_at` e `updated_at` para auditoria
- **ENUMs para Status**: Campos como `enrollment_status`, `document_status`, `request_status` usarão ENUM para validação no banco

**Exemplo de Tabelas Principais:**

```sql
-- Usuários (polimórfico: admin, professor, aluno)
users (
  id, role (enum: admin|teacher|student),
  name, email, login, password_hash,
  cpf, rg, mother_name, father_name, address,
  title, reservist,
  first_access_at, created_at, updated_at, deleted_at
)

-- Cursos
courses (
  id, name, description, duration_semesters,
  created_at, updated_at, deleted_at
)

-- Disciplinas
disciplines (
  id, name, code, workload_hours,
  created_at, updated_at, deleted_at
)

-- Relação Curso-Disciplina
course_disciplines (
  id, course_id, discipline_id, semester,
  created_at, updated_at
)

-- Turmas
classes (
  id, course_id, semester, year,
  created_at, updated_at, deleted_at
)

-- Relação Turma-Professor-Disciplina
class_teachers (
  id, class_id, teacher_id, discipline_id,
  created_at, updated_at
)

-- Relação Turma-Aluno
class_students (
  id, class_id, student_id,
  created_at, updated_at
)

-- Matrículas
enrollments (
  id, student_id, course_id,
  status (enum: pending|active|cancelled),
  enrollment_date,
  created_at, updated_at, deleted_at
)

-- Contratos
contracts (
  id, user_id, template_id,
  file_path, accepted_at,
  semester, year,
  created_at, updated_at
)

-- Documentos
documents (
  id, user_id, document_type_id,
  file_path,
  status (enum: pending|approved|rejected),
  reviewed_by, reviewed_at, observations,
  created_at, updated_at
)

-- Avaliações
evaluations (
  id, class_id, teacher_id, discipline_id,
  name, date,
  type (enum: grade|concept),
  created_at, updated_at
)

-- Notas
grades (
  id, evaluation_id, student_id,
  grade (decimal ou null),
  concept (enum: satisfactory|unsatisfactory ou null),
  created_at, updated_at
)

-- Solicitações
requests (
  id, student_id, request_type_id,
  description,
  status (enum: pending|approved|rejected),
  reviewed_by, reviewed_at,
  created_at, updated_at
)
```

---

### 2.4 Infraestrutura

**Ambiente de Hospedagem:** Hostgator (Shared Hosting ou VPS)

**Configurações Necessárias:**

| Recurso | Especificação Mínima | Recomendado |
|---------|----------------------|-------------|
| PHP/Node.js Support | Node.js 18+ | Node.js 20 LTS |
| RAM | 512MB | 1GB+ |
| Storage | 5GB | 10GB |
| Banco de Dados | MySQL 5.7+ | MySQL 8.0 |
| SSL/TLS | Certificado SSL gratuito (Let's Encrypt) | Obrigatório |
| Acesso SSH | Sim | Sim |
| Cron Jobs | Disponível | Para tarefas agendadas |

**Estratégia de Deploy:**

1. **Repositório Git**: GitHub/GitLab privado
2. **Build Local ou CI/CD**:
   - Frontend: Build com Vite (`npm run build`) gera pasta `dist/`
   - Backend: Sem build necessário (Node.js executa diretamente)
3. **Deploy via FTP/SFTP ou SSH**:
   - Upload de `dist/` do frontend para `/public_html/`
   - Upload do backend para `/api/` ou diretório apropriado
   - Configurar Node.js app no cPanel (se disponível)
4. **Variáveis de Ambiente**: Arquivo `.env` no servidor com credenciais sensíveis
5. **Inicialização**: `pm2` ou similar para manter aplicação Node.js rodando

**Considerações sobre Limitações do Hostgator:**

- **Shared Hosting**: Recursos compartilhados podem causar variação de performance
- **Processamento de PDFs**: Puppeteer pode ser pesado; considerar limite de uso ou alternativa mais leve (PDFKit)
- **Concurrent Connections**: MySQL pode ter limite de conexões simultâneas; usar connection pooling
- **Upload de Arquivos**: Configurar limite de upload adequado (10MB)
- **Cron Jobs**: Usar para limpeza de arquivos temporários, renovação automática de contratos

**Estrutura de Diretórios no Servidor:**

```
/home/usuario/
├── public_html/               # Frontend (React build)
│   ├── index.html
│   ├── assets/
│   └── ...
├── api/                       # Backend (Node.js)
│   ├── src/
│   ├── uploads/
│   ├── node_modules/
│   ├── .env
│   ├── server.js
│   └── package.json
└── backups/                   # Backups automáticos
    ├── db/
    └── uploads/
```

---

## 3. ESTRUTURA DE PASTAS

### Estrutura Completa do Projeto

```
secretaria-online/
│
├── frontend/                          # Aplicação React
│   ├── public/
│   │   ├── favicon.ico
│   │   └── robots.txt
│   │
│   ├── src/
│   │   ├── assets/                    # Imagens, fontes, ícones estáticos
│   │   │   ├── images/
│   │   │   └── fonts/
│   │   │
│   │   ├── components/                # Componentes reutilizáveis
│   │   │   ├── ui/                    # Componentes básicos (Button, Input, Modal)
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   └── FileUpload.tsx
│   │   │   ├── layout/                # Layout components
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── DashboardLayout.tsx
│   │   │   └── forms/                 # Formulários específicos
│   │   │       ├── StudentForm.tsx
│   │   │       ├── TeacherForm.tsx
│   │   │       └── EnrollmentForm.tsx
│   │   │
│   │   ├── pages/                     # Páginas/Views
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── FirstAccess.tsx
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Students.tsx
│   │   │   │   ├── Teachers.tsx
│   │   │   │   ├── Courses.tsx
│   │   │   │   ├── Classes.tsx
│   │   │   │   ├── Documents.tsx
│   │   │   │   └── Requests.tsx
│   │   │   ├── student/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Grades.tsx
│   │   │   │   ├── Documents.tsx
│   │   │   │   └── Requests.tsx
│   │   │   └── teacher/
│   │   │       ├── Dashboard.tsx
│   │   │       ├── Classes.tsx
│   │   │       ├── Students.tsx
│   │   │       └── Grades.tsx
│   │   │
│   │   ├── services/                  # Comunicação com API
│   │   │   ├── api.ts                 # Configuração Axios
│   │   │   ├── auth.service.ts
│   │   │   ├── student.service.ts
│   │   │   ├── teacher.service.ts
│   │   │   ├── enrollment.service.ts
│   │   │   ├── document.service.ts
│   │   │   └── grade.service.ts
│   │   │
│   │   ├── hooks/                     # Custom React Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useUser.ts
│   │   │   ├── useDocuments.ts
│   │   │   └── useGrades.ts
│   │   │
│   │   ├── contexts/                  # Context API
│   │   │   └── AuthContext.tsx
│   │   │
│   │   ├── utils/                     # Utilitários
│   │   │   ├── validators.ts          # Validações (CPF, email)
│   │   │   ├── formatters.ts          # Formatadores (data, CPF)
│   │   │   ├── constants.ts           # Constantes
│   │   │   └── helpers.ts             # Funções auxiliares
│   │   │
│   │   ├── types/                     # TypeScript types/interfaces
│   │   │   ├── user.types.ts
│   │   │   ├── student.types.ts
│   │   │   ├── teacher.types.ts
│   │   │   ├── course.types.ts
│   │   │   └── api.types.ts
│   │   │
│   │   ├── styles/                    # Estilos globais
│   │   │   └── globals.css
│   │   │
│   │   ├── App.tsx                    # Componente raiz
│   │   ├── main.tsx                   # Entry point
│   │   └── router.tsx                 # Configuração de rotas
│   │
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                           # Aplicação Node.js/Express
│   ├── src/
│   │   ├── config/                    # Configurações
│   │   │   ├── database.js            # Config Sequelize
│   │   │   ├── auth.js                # Config JWT
│   │   │   ├── email.js               # Config Nodemailer
│   │   │   └── upload.js              # Config Multer
│   │   │
│   │   ├── controllers/               # Controladores (lógica de rota)
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── student.controller.js
│   │   │   ├── teacher.controller.js
│   │   │   ├── course.controller.js
│   │   │   ├── discipline.controller.js
│   │   │   ├── class.controller.js
│   │   │   ├── enrollment.controller.js
│   │   │   ├── document.controller.js
│   │   │   ├── contract.controller.js
│   │   │   ├── grade.controller.js
│   │   │   ├── evaluation.controller.js
│   │   │   └── request.controller.js
│   │   │
│   │   ├── models/                    # Modelos Sequelize
│   │   │   ├── index.js               # Inicialização e associações
│   │   │   ├── User.js
│   │   │   ├── Student.js
│   │   │   ├── Teacher.js
│   │   │   ├── Course.js
│   │   │   ├── Discipline.js
│   │   │   ├── Class.js
│   │   │   ├── Enrollment.js
│   │   │   ├── Document.js
│   │   │   ├── DocumentType.js
│   │   │   ├── Contract.js
│   │   │   ├── ContractTemplate.js
│   │   │   ├── Grade.js
│   │   │   ├── Evaluation.js
│   │   │   ├── Request.js
│   │   │   └── RequestType.js
│   │   │
│   │   ├── routes/                    # Definição de rotas
│   │   │   ├── index.js               # Agregador de rotas
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── student.routes.js
│   │   │   ├── teacher.routes.js
│   │   │   ├── course.routes.js
│   │   │   ├── class.routes.js
│   │   │   ├── enrollment.routes.js
│   │   │   ├── document.routes.js
│   │   │   ├── contract.routes.js
│   │   │   ├── grade.routes.js
│   │   │   └── request.routes.js
│   │   │
│   │   ├── middlewares/               # Middlewares
│   │   │   ├── auth.middleware.js     # Verificação JWT
│   │   │   ├── rbac.middleware.js     # Controle de acesso por perfil
│   │   │   ├── validation.middleware.js
│   │   │   ├── upload.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── rateLimiter.middleware.js
│   │   │
│   │   ├── services/                  # Lógica de negócio
│   │   │   ├── auth.service.js
│   │   │   ├── email.service.js
│   │   │   ├── pdf.service.js         # Geração de PDFs
│   │   │   ├── contract.service.js
│   │   │   ├── document.service.js
│   │   │   ├── enrollment.service.js
│   │   │   ├── grade.service.js
│   │   │   └── notification.service.js
│   │   │
│   │   ├── utils/                     # Utilitários
│   │   │   ├── validators.js          # Validação CPF, email
│   │   │   ├── generators.js          # Geração de senhas
│   │   │   ├── formatters.js
│   │   │   ├── logger.js              # Winston logger
│   │   │   └── constants.js
│   │   │
│   │   ├── jobs/                      # Tarefas agendadas (cron)
│   │   │   ├── contractRenewal.job.js
│   │   │   ├── cleanupTemp.job.js
│   │   │   └── index.js
│   │   │
│   │   └── server.js                  # Entry point
│   │
│   ├── database/
│   │   ├── migrations/                # Migrations Sequelize
│   │   │   ├── 20250101000001-create-users.js
│   │   │   ├── 20250101000002-create-courses.js
│   │   │   ├── 20250101000003-create-disciplines.js
│   │   │   └── ...
│   │   │
│   │   └── seeders/                   # Seeders
│   │       ├── 20250101000001-admin-user.js
│   │       ├── 20250101000002-sample-courses.js
│   │       └── 20250101000003-document-types.js
│   │
│   ├── uploads/                       # Arquivos uploadados
│   │   ├── documents/                 # Documentos de alunos/professores
│   │   ├── contracts/                 # PDFs de contratos
│   │   └── temp/                      # Temporários
│   │
│   ├── logs/                          # Logs da aplicação
│   │   ├── error.log
│   │   ├── combined.log
│   │   └── access.log
│   │
│   ├── tests/                         # Testes (opcional)
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── docs/                              # Documentação
│   ├── requirements.md
│   ├── contextDoc.md
│   ├── database-schema.md
│   └── api-documentation.md
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## 4. PADRÕES E CONVENÇÕES

### 4.1 Padrões de Código

**Naming Conventions:**

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Arquivos (Frontend) | PascalCase (componentes) | `StudentForm.tsx` |
| Arquivos (Backend) | camelCase | `auth.controller.js` |
| Componentes React | PascalCase | `DashboardLayout` |
| Funções/Métodos | camelCase | `getUserById()` |
| Constantes | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Interfaces (TS) | PascalCase com prefixo I | `IStudent`, `IEnrollment` |
| Types (TS) | PascalCase | `UserRole`, `EnrollmentStatus` |
| Variáveis | camelCase | `studentName`, `enrollmentId` |
| Classes | PascalCase | `AuthService`, `PDFGenerator` |
| Rotas API | kebab-case | `/api/students`, `/api/enrollments` |
| Tabelas DB | snake_case, plural | `users`, `enrollments`, `class_students` |
| Colunas DB | snake_case | `created_at`, `student_id` |

**Estrutura de Arquivos:**

- **Frontend**: Um componente por arquivo, nome do arquivo = nome do componente
- **Backend**: Controllers, Services e Models exportam uma única classe ou objeto
- **Index Files**: Usados para agregar e re-exportar módulos relacionados

**Exemplo de Componente React:**

```tsx
// src/components/forms/StudentForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentSchema } from '@/utils/validators';
import type { IStudent } from '@/types/student.types';

interface StudentFormProps {
  initialData?: IStudent;
  onSubmit: (data: IStudent) => void;
}

export function StudentForm({ initialData, onSubmit }: StudentFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

**Exemplo de Controller (Backend):**

```javascript
// src/controllers/student.controller.js
const StudentService = require('../services/student.service');
const { validationResult } = require('express-validator');

class StudentController {
  async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const student = await StudentService.create(req.body);
      return res.status(201).json({ success: true, data: student });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const student = await StudentService.findById(id);

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      return res.json({ success: true, data: student });
    } catch (error) {
      next(error);
    }
  }

  // ... outros métodos
}

module.exports = new StudentController();
```

---

### 4.2 Padrões de Commits

**Conventional Commits:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, espaços, ponto-e-vírgula (sem mudança de código)
- `refactor`: Refatoração de código (sem adicionar feature ou corrigir bug)
- `test`: Adição ou correção de testes
- `chore`: Manutenção, build, dependências

**Exemplos:**

```
feat(auth): add JWT authentication
fix(enrollment): correct status validation on document approval
docs(readme): update installation instructions
refactor(pdf): extract contract generation to service
chore(deps): update react to version 18.3
```

---

### 4.3 Padrões de API (REST)

**Estrutura de Endpoints:**

```
Base URL: /api/v1

Recursos:
- /auth
  - POST /login
  - POST /logout
  - POST /refresh-token
  - POST /change-password

- /users (admin only)
  - GET    /users
  - GET    /users/:id
  - POST   /users
  - PUT    /users/:id
  - DELETE /users/:id

- /students
  - GET    /students
  - GET    /students/:id
  - POST   /students
  - PUT    /students/:id
  - DELETE /students/:id
  - POST   /students/:id/reset-password

- /teachers
  - GET    /teachers
  - GET    /teachers/:id
  - POST   /teachers
  - PUT    /teachers/:id
  - DELETE /teachers/:id

- /enrollments
  - GET    /enrollments
  - GET    /enrollments/:id
  - POST   /enrollments
  - PUT    /enrollments/:id/status
  - DELETE /enrollments/:id

- /documents
  - GET    /documents
  - GET    /documents/:id
  - POST   /documents (upload)
  - PUT    /documents/:id/approve
  - PUT    /documents/:id/reject
  - DELETE /documents/:id

- /contracts
  - GET    /contracts
  - GET    /contracts/:id
  - POST   /contracts/:id/accept
  - GET    /contracts/:id/pdf

- /grades
  - GET    /classes/:classId/grades
  - POST   /grades
  - PUT    /grades/:id
  - DELETE /grades/:id
```

**Padrão de Resposta de Sucesso:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "João Silva"
  },
  "message": "Student created successfully"
}
```

**Padrão de Resposta de Erro:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "cpf",
        "message": "CPF is invalid"
      }
    ]
  }
}
```

**HTTP Status Codes:**

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `204 No Content`: Requisição bem-sucedida, sem conteúdo de retorno
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Sem permissão
- `404 Not Found`: Recurso não encontrado
- `409 Conflict`: Conflito (ex: CPF já cadastrado)
- `422 Unprocessable Entity`: Validação de negócio falhou
- `500 Internal Server Error`: Erro no servidor

---

### 4.4 Tratamento de Erros

**Frontend:**

- Usar `try-catch` em funções assíncronas
- Exibir mensagens de erro amigáveis ao usuário (evitar stack traces)
- Usar toast/notification para feedback visual
- Registrar erros no console (dev) ou serviço de monitoramento (prod)

**Backend:**

- Middleware de erro centralizado (`error.middleware.js`)
- Classes de erro customizadas (ValidationError, NotFoundError, UnauthorizedError)
- Logs estruturados com Winston

**Exemplo de Error Middleware:**

```javascript
// src/middlewares/error.middleware.js
const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

function errorHandler(err, req, res, next) {
  let { statusCode, message, code } = err;

  // Default para erros não tratados
  if (!err.isOperational) {
    statusCode = 500;
    message = 'Internal server error';
    code = 'INTERNAL_ERROR';

    // Log completo apenas para erros não esperados
    logger.error({
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
    });
  } else {
    // Log simples para erros operacionais
    logger.warn({
      message: err.message,
      code: err.code,
      url: req.url,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}

module.exports = { errorHandler, AppError };
```

---

### 4.5 Logging

**Níveis de Log (Winston):**

- `error`: Erros críticos que impedem funcionamento
- `warn`: Avisos de situações anormais (ex: documento rejeitado)
- `info`: Informações gerais (ex: usuário criado)
- `debug`: Informações detalhadas para debugging

**Formato de Log:**

```json
{
  "timestamp": "2025-10-23T10:30:00.000Z",
  "level": "info",
  "message": "User logged in",
  "userId": 123,
  "role": "student",
  "ip": "192.168.1.1"
}
```

**Logs a Registrar:**

- Login/logout de usuários
- Criação/edição/exclusão de recursos críticos (alunos, matrículas, contratos)
- Aprovação/rejeição de documentos e solicitações
- Erros e exceções
- Upload de arquivos
- Geração de PDFs

---

## 5. SEGURANÇA

### 5.1 Autenticação e Autorização

**Autenticação:**

- **JWT (JSON Web Token)**: Tokens assinados com chave secreta (variável de ambiente)
- **Expiração**: Access token com 15 minutos, Refresh token com 7 dias
- **Hash de Senha**: bcryptjs com salt rounds = 10
- **Primeiro Acesso**: Senha provisória deve ser alterada, campo `first_access_at` registra timestamp

**Autorização (RBAC - Role-Based Access Control):**

- **Perfis**: `admin`, `teacher`, `student`
- **Middleware de Autorização**: Verifica role do usuário antes de permitir acesso
- **Matriz de Permissões**:

| Recurso | Admin | Teacher | Student |
|---------|-------|---------|---------|
| Gerenciar usuários | ✓ | ✗ | ✗ |
| Gerenciar cursos/disciplinas | ✓ | ✗ | ✗ |
| Aprovar documentos | ✓ | ✗ | ✗ |
| Lançar notas | ✗ | ✓ | ✗ |
| Ver próprias notas | ✗ | ✗ | ✓ |
| Fazer solicitações | ✗ | ✗ | ✓ |

**Exemplo de Middleware de Autorização:**

```javascript
// src/middlewares/rbac.middleware.js
function authorize(...allowedRoles) {
  return (req, res, next) => {
    const { user } = req; // Injetado pelo auth.middleware

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

// Uso em rotas:
router.get('/students', authenticate, authorize('admin'), StudentController.list);
router.get('/my-grades', authenticate, authorize('student'), GradeController.getMyGrades);
```

---

### 5.2 Proteção de Dados Sensíveis

**Dados a Proteger:**

- Senhas (hash com bcrypt)
- CPF/RG (criptografia ou acesso controlado)
- Documentos anexados (acesso apenas a usuários autorizados)

**Estratégias:**

- **HTTPS Obrigatório**: Certificado SSL no servidor
- **Variáveis de Ambiente**: Credenciais em `.env`, nunca commitadas no git
- **Tokens JWT**: Nunca armazenar informações sensíveis no payload
- **Sanitização de Logs**: Nunca logar senhas ou tokens completos

---

### 5.3 Validação de Inputs

**Frontend:**

- Validação com Zod antes de enviar para API
- Validação de CPF, email, formatos de arquivo
- Sanitização de inputs (remover scripts, caracteres especiais)

**Backend:**

- Validação com `express-validator` em todas as rotas
- Validação de tipos, formatos, tamanhos
- Validação de regras de negócio (ex: CPF único, aluno já matriculado)

**Exemplo:**

```javascript
// src/routes/student.routes.js
const { body, param } = require('express-validator');

router.post('/students',
  authenticate,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('cpf').custom(validateCPF).withMessage('Invalid CPF'),
    body('email').isEmail().withMessage('Invalid email'),
  ],
  StudentController.create
);
```

---

### 5.4 Proteção contra Vulnerabilidades Comuns (OWASP Top 10)

| Vulnerabilidade | Proteção Implementada |
|-----------------|----------------------|
| **Injection (SQL)** | Sequelize ORM com prepared statements |
| **Broken Authentication** | JWT seguro, bcrypt para senhas, expiração de tokens |
| **Sensitive Data Exposure** | HTTPS, hash de senhas, controle de acesso |
| **XML External Entities (XXE)** | Não aplicável (sem processamento XML) |
| **Broken Access Control** | RBAC middleware, validação de ownership |
| **Security Misconfiguration** | Helmet.js para headers seguros, rate limiting |
| **Cross-Site Scripting (XSS)** | Sanitização de inputs, React escapa HTML por padrão |
| **Insecure Deserialization** | Validação estrita de JSON, sem uso de `eval()` |
| **Using Components with Known Vulnerabilities** | `npm audit` regular, dependências atualizadas |
| **Insufficient Logging & Monitoring** | Winston com logs estruturados, monitoramento de erros |

**Headers de Segurança (Helmet.js):**

```javascript
// src/server.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));
```

**Rate Limiting:**

```javascript
// src/middlewares/rateLimiter.middleware.js
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Too many login attempts, please try again later',
});

module.exports = { loginLimiter };
```

---

## 6. INTEGRAÇÕES

### 6.1 Serviço de Email (SMTP)

**Nome:** Serviço SMTP (Hostgator ou Gmail)

**Propósito:** Envio de senhas provisórias para alunos

**Configuração:**

- **Transport**: SMTP via Nodemailer
- **Host/Port**: Configuração do provedor (ex: smtp.hostgator.com:587)
- **Autenticação**: Usuário e senha em variáveis de ambiente

**Endpoints Principais:**

- Não é API REST, é serviço SMTP

**Exemplo de Uso:**

```javascript
// src/services/email.service.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendPasswordEmail(to, password) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Sua senha provisória - Secretaria Online',
    html: `
      <p>Sua senha provisória é: <strong>${password}</strong></p>
      <p>Por favor, altere sua senha no primeiro acesso.</p>
    `,
  });
}

module.exports = { sendPasswordEmail };
```

---

### 6.2 Geração de PDFs (Puppeteer ou PDFKit)

**Nome:** Puppeteer (ou alternativa PDFKit se Puppeteer for muito pesado)

**Propósito:** Gerar contratos em PDF a partir de templates HTML

**Configuração:**

- **Puppeteer**: Requer Chrome headless (pode ser pesado em shared hosting)
- **PDFKit**: Alternativa mais leve, gera PDFs programaticamente

**Exemplo com Puppeteer:**

```javascript
// src/services/pdf.service.js
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function generateContractPDF(contractData, templateHTML) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Substituir placeholders no template
  const html = templateHTML
    .replace('{{studentName}}', contractData.studentName)
    .replace('{{courseName}}', contractData.courseName)
    .replace('{{semester}}', contractData.semester)
    .replace('{{date}}', contractData.date);

  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: 'A4' });

  await browser.close();
  return pdfBuffer;
}

module.exports = { generateContractPDF };
```

**Exemplo com PDFKit (alternativa leve):**

```javascript
// src/services/pdf.service.js
const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateContractPDF(contractData, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    doc.fontSize(20).text('Contrato de Matrícula', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Aluno: ${contractData.studentName}`);
    doc.text(`Curso: ${contractData.courseName}`);
    doc.text(`Semestre: ${contractData.semester}`);
    doc.text(`Data: ${contractData.date}`);

    doc.end();

    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}
```

---

## 7. CONSIDERAÇÕES DE DEPLOYMENT

### 7.1 Estratégia de Versionamento (Git Flow Simplificado)

**Branches:**

- `main`: Código em produção
- `develop`: Código em desenvolvimento
- `feature/<nome>`: Novas funcionalidades
- `hotfix/<nome>`: Correções urgentes em produção

**Fluxo:**

1. Desenvolvimento acontece em `feature/*` branches
2. Merge para `develop` após code review
3. Quando pronto para release, merge `develop` → `main`
4. Tag de versão (ex: `v1.0.0`)
5. Hotfixes vão direto para `main` e depois back-merge para `develop`

---

### 7.2 Ambientes

| Ambiente | Propósito | URL Exemplo |
|----------|-----------|-------------|
| **Development** | Desenvolvimento local | http://localhost:5173 (frontend), http://localhost:3000 (backend) |
| **Staging** | Testes antes de produção | https://staging.secretariaonline.com |
| **Production** | Ambiente de produção | https://secretariaonline.com |

**Configurações por Ambiente:**

- Variáveis de ambiente diferentes (`.env.development`, `.env.production`)
- Banco de dados separado por ambiente
- Logs mais verbosos em dev, mais concisos em prod

---

### 7.3 Scripts de Deploy

**Frontend (Build e Upload):**

```bash
# package.json (frontend)
{
  "scripts": {
    "build": "vite build",
    "deploy": "npm run build && scp -r dist/* user@server:/path/to/public_html/"
  }
}
```

**Backend (Upload via SSH):**

```bash
# Script de deploy (deploy.sh)
#!/bin/bash
ssh user@server << 'EOF'
  cd /path/to/api
  git pull origin main
  npm install --production
  pm2 restart secretaria-api
EOF
```

---

### 7.4 Variáveis de Ambiente

**Arquivo `.env.example` (Backend):**

```bash
# Server
NODE_ENV=production
PORT=3000
BASE_URL=https://secretariaonline.com

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=secretaria_db
DB_USER=db_user
DB_PASS=db_password

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Email
SMTP_HOST=smtp.hostgator.com
SMTP_PORT=587
SMTP_USER=noreply@secretariaonline.com
SMTP_PASS=email_password
SMTP_FROM="Secretaria Online <noreply@secretariaonline.com>"

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/path/to/uploads

# Logs
LOG_LEVEL=info
```

---

### 7.5 Backups e Rollback

**Backup do Banco de Dados (Cron Job Diário):**

```bash
# Cron: 0 2 * * * (todo dia às 2h da manhã)
mysqldump -u db_user -p'db_password' secretaria_db > /path/to/backups/db/backup_$(date +\%Y\%m\%d).sql
```

**Backup de Uploads (Semanal):**

```bash
# Cron: 0 3 * * 0 (domingo às 3h da manhã)
tar -czf /path/to/backups/uploads/uploads_$(date +\%Y\%m\%d).tar.gz /path/to/uploads
```

**Rollback:**

- Git: `git revert <commit>` ou `git checkout <tag>`
- Banco de Dados: Restaurar dump do backup
- Uploads: Restaurar arquivos do backup

---

## 8. DEPENDÊNCIAS E PRÉ-REQUISITOS

### 8.1 Versões de Runtime

| Software | Versão Mínima | Versão Recomendada |
|----------|---------------|-------------------|
| Node.js | 18.x | 20 LTS |
| npm | 9.x | 10.x |
| MySQL | 5.7 | 8.0 |
| Git | 2.x | Última estável |

---

### 8.2 Serviços Externos Dependentes

- **SMTP Server**: Para envio de emails (Hostgator ou Gmail)
- **SSL Certificate**: Let's Encrypt ou similar

---

### 8.3 Configurações de Servidor Necessárias

**No cPanel/Hostgator:**

1. **Node.js App Setup**:
   - Criar aplicação Node.js (se disponível no painel)
   - Definir diretório raiz da aplicação
   - Definir arquivo de entrada (`server.js`)
   - Configurar variáveis de ambiente

2. **MySQL Database**:
   - Criar banco de dados
   - Criar usuário e conceder permissões
   - Anotar credenciais para `.env`

3. **Upload Limits**:
   - Aumentar `upload_max_filesize` para 10MB
   - Aumentar `post_max_size` para 10MB

4. **Cron Jobs**:
   - Configurar backup diário do banco
   - Configurar backup semanal de uploads
   - Configurar limpeza de arquivos temporários

5. **SSL/TLS**:
   - Instalar certificado SSL (Let's Encrypt)
   - Forçar HTTPS

---

### 8.4 Limites e Quotas a Considerar

| Recurso | Limite Típico (Shared Hosting) | Solução se Exceder |
|---------|--------------------------------|-------------------|
| Conexões MySQL simultâneas | 25-50 | Implementar connection pooling |
| Memória PHP/Node | 512MB - 1GB | Otimizar código, considerar VPS |
| Espaço em disco | 10-50GB | Implementar limpeza de arquivos antigos |
| Bandwidth | 100GB-500GB/mês | Otimizar imagens, usar CDN |
| Processos simultâneos | Limitado | Implementar rate limiting |

---

## 9. ROADMAP DE DESENVOLVIMENTO SUGERIDO

### Fase 1: Fundação (Semanas 1-2)
- [ ] Setup do ambiente (Git, Node, MySQL)
- [ ] Estrutura de pastas frontend e backend
- [ ] Configuração Sequelize + Migrations
- [ ] Models básicos (User, Student, Teacher)
- [ ] Autenticação JWT
- [ ] Seeder de usuário admin

### Fase 2: Módulo Administrativo (Semanas 3-5)
- [ ] CRUD de alunos, professores, cursos, disciplinas
- [ ] CRUD de turmas
- [ ] Sistema de matrículas
- [ ] Gestão de documentos obrigatórios
- [ ] Validação de documentos

### Fase 3: Módulo Aluno (Semana 6)
- [ ] Dashboard do aluno
- [ ] Upload de documentos
- [ ] Visualização de notas
- [ ] Sistema de solicitações

### Fase 4: Módulo Professor (Semana 7)
- [ ] Dashboard do professor
- [ ] Visualização de turmas e alunos
- [ ] Cadastro de avaliações
- [ ] Lançamento de notas

### Fase 5: Contratos e PDFs (Semana 8)
- [ ] Templates de contratos
- [ ] Geração de PDFs
- [ ] Aceite de contratos
- [ ] Renovação automática

### Fase 6: Testes e Deploy (Semana 9-10)
- [ ] Testes de integração
- [ ] Ajustes de segurança
- [ ] Deploy em staging
- [ ] Deploy em produção
- [ ] Documentação final

---

## 10. GLOSSÁRIO TÉCNICO

| Termo | Definição |
|-------|-----------|
| **JWT** | JSON Web Token - Token de autenticação stateless |
| **ORM** | Object-Relational Mapping - Mapeamento de objetos para tabelas |
| **RBAC** | Role-Based Access Control - Controle de acesso baseado em perfis |
| **Migration** | Script de alteração de schema do banco de dados |
| **Seeder** | Script para popular banco com dados iniciais |
| **Middleware** | Função intermediária no pipeline de requisição |
| **Soft Delete** | Exclusão lógica (marca como deletado sem remover fisicamente) |
| **CRUD** | Create, Read, Update, Delete |
| **SPA** | Single Page Application |
| **SMTP** | Simple Mail Transfer Protocol - Protocolo de envio de emails |
| **CORS** | Cross-Origin Resource Sharing - Compartilhamento de recursos entre origens |

---

**Documento gerado em:** 2025-10-23
**Versão:** 1.0
**Status:** Aprovado

---

**Nota Final:**
Este documento serve como guia técnico completo para o desenvolvimento da aplicação. Todas as decisões arquiteturais foram baseadas nos requisitos funcionais, restrições técnicas (Hostgator, MySQL, Windows) e melhores práticas da indústria. Ajustes pontuais podem ser necessários durante a implementação, mas a estrutura geral deve ser mantida para garantir consistência e manutenibilidade.
