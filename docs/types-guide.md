# Guia de Types TypeScript - Secretaria Online

**Feature:** feat-101 - Criar types TypeScript
**Data de Criação:** 2025-11-04
**Status:** Implementado

---

## 📋 Sumário de Types

Este documento descreve todos os tipos TypeScript criados para a aplicação Secretaria Online.

## 📁 Arquivos de Types

### 1. **user.types.ts**
Tipos relacionados a usuários genéricos do sistema (admin, professor, aluno)

**Interfaces principais:**
- `IUser` - Representa um usuário do sistema
- `IAuthUser` - Dados do usuário após autenticação
- `ILoginCredentials` - Credenciais para login
- `IChangePassword` - Dados para mudança de senha
- `IAuthContext` - Contexto de autenticação no frontend
- `IUserCreateRequest` - Dados para criar usuário
- `IUserUpdateRequest` - Dados para editar usuário

**Types:**
- `UserRole` - Union type: 'admin' | 'teacher' | 'student'

---

### 2. **student.types.ts**
Tipos específicos para alunos

**Interfaces principais:**
- `IStudent` - Aluno com informações completas
- `IStudentCreateRequest` - Dados para criar aluno
- `IStudentUpdateRequest` - Dados para editar aluno
- `IStudentDashboard` - Resumo do aluno para dashboard
- `IStudentStats` - Estatísticas de alunos
- `IStudentListResponse` - Resposta ao listar alunos

**Tipos relacionados:**
- `IEnrollmentBasic` - Matrícula básica do aluno
- `IStudentDocument` - Documento do aluno
- `IStudentGrade` - Nota do aluno

---

### 3. **teacher.types.ts**
Tipos específicos para professores

**Interfaces principais:**
- `ITeacher` - Professor com informações completas
- `ITeacherCreateRequest` - Dados para criar professor
- `ITeacherUpdateRequest` - Dados para editar professor
- `ITeacherDashboard` - Resumo do professor para dashboard
- `ITeacherClassSummary` - Resumo de turma para professor
- `ITeacherStats` - Estatísticas de professores

**Tipos relacionados:**
- `ITeacherClass` - Turma do professor
- `ITeacherDocument` - Documento do professor
- `ITeacherEvaluation` - Avaliação criada por professor
- `IGradeSubmissionRequest` - Dados para lançamento de notas
- `IGradeSubmissionResponse` - Resposta ao lançar notas

---

### 4. **course.types.ts**
Tipos para cursos e disciplinas

**Interfaces principais:**
- `ICourse` - Curso oferecido pela instituição
- `IDiscipline` - Disciplina que pode ser associada a cursos
- `ICourseDiscipline` - Relação curso-disciplina
- `ICourseCreateRequest` - Dados para criar curso
- `ICourseUpdateRequest` - Dados para editar curso
- `IDisciplineCreateRequest` - Dados para criar disciplina
- `IDisciplineUpdateRequest` - Dados para editar disciplina
- `ICourseListResponse` - Resposta ao listar cursos
- `ICourseFilters` - Filtros para busca de cursos

---

### 5. **class.types.ts**
Tipos para turmas

**Interfaces principais:**
- `IClass` - Turma vinculada a um curso
- `IClassTeacher` - Relação turma-professor-disciplina
- `IClassStudent` - Relação turma-aluno
- `IClassCreateRequest` - Dados para criar turma
- `IClassUpdateRequest` - Dados para editar turma
- `IAddTeacherToClassRequest` - Dados para adicionar professor
- `IAddStudentToClassRequest` - Dados para adicionar aluno
- `IClassListResponse` - Resposta ao listar turmas
- `IClassFilters` - Filtros para busca de turmas

---

### 6. **enrollment.types.ts**
Tipos para matrículas

**Interfaces principais:**
- `IEnrollment` - Matrícula de aluno em curso
- `IEnrollmentCreateRequest` - Dados para criar matrícula
- `IEnrollmentUpdateRequest` - Dados para editar matrícula
- `IEnrollmentDetails` - Detalhes completos de matrícula
- `IEnrollmentDuplicateCheck` - Verificação de matrícula duplicada
- `IBatchEnrollmentResponse` - Resposta de processamento em lote

**Types:**
- `EnrollmentStatus` - Union type: 'pending' | 'active' | 'cancelled'

---

### 7. **document.types.ts**
Tipos para documentos

**Interfaces principais:**
- `IDocument` - Documento enviado por aluno/professor
- `IDocumentType` - Tipo de documento obrigatório
- `IDocumentFilters` - Filtros para busca de documentos
- `IDocumentListResponse` - Resposta ao listar documentos
- `IUploadDocumentRequest` - Dados para upload de documento
- `IApproveDocumentRequest` - Dados para aprovar documento
- `IRejectDocumentRequest` - Dados para rejeitar documento

**Types:**
- `DocumentStatus` - Union type: 'pending' | 'approved' | 'rejected'
- `DocumentUserType` - Union type: 'student' | 'teacher'

---

### 8. **grade.types.ts**
Tipos para avaliações e notas

**Interfaces principais:**
- `IEvaluation` - Avaliação criada por professor
- `IGrade` - Nota individual de aluno
- `IGradeSummary` - Resumo de notas do aluno
- `IDisciplineAverage` - Média final de disciplina
- `ICreateEvaluationRequest` - Dados para criar avaliação
- `ICreateGradeRequest` - Dados para lançar nota
- `ISetFinalAverageRequest` - Dados para lançar média final

**Types:**
- `EvaluationType` - Union type: 'grade' | 'concept'
- `GradeConcept` - Union type: 'satisfactory' | 'unsatisfactory'

---

### 9. **request.types.ts**
Tipos para solicitações

**Interfaces principais:**
- `IRequest` - Solicitação de aluno
- `IRequestType` - Tipo de solicitação
- `IRequestListResponse` - Resposta ao listar solicitações
- `IApproveRequestRequest` - Dados para aprovar solicitação
- `IRejectRequestRequest` - Dados para rejeitar solicitação
- `IStudentCreateRequestRequest` - Dados para aluno criar solicitação

**Types:**
- `RequestStatus` - Union type: 'pending' | 'approved' | 'rejected'
- `RequestType` - Union type de tipos de solicitação

---

## 🎯 Padrões Utilizados

### 1. **Nomeação de Interfaces**
- Prefixo `I` para todas as interfaces (ex: `IUser`, `ICourse`)
- PascalCase para nomes de interfaces
- Sufixos para indicar tipo:
  - `Request` - Dados de entrada (POST/PUT)
  - `Response` - Dados de saída de uma requisição
  - `Create` ou `Update` - Operações específicas
  - `Filter` ou `Filters` - Critérios de busca
  - `Stats` ou `Summary` - Dados consolidados

### 2. **Types (Union Types)**
- UPPER_SNAKE_CASE para nomes de types
- Utilizados para enums e tipos união
- Exemplos: `UserRole`, `EnrollmentStatus`, `DocumentStatus`

### 3. **Documentação**
- Cada interface possui comentário JSDoc
- Cada propriedade documentada com seu propósito
- Exemplos de uso fornecidos quando aplicável

### 4. **Campos Obrigatórios vs Opcionais**
- Propriedades obrigatórias sem `?`
- Propriedades opcionais com `?`
- Interfaces de Request geralmente têm campos opcionais para flexibilidade

---

## 📦 Importação Centralizada

Para importar tipos de forma centralizada, use:

```typescript
import type { IUser, IStudent, ICourse, EnrollmentStatus } from '@/types';
```

O arquivo `index.ts` re-exporta todos os tipos para facilitar importações.

---

## 🔄 Relacionamentos entre Types

```
IUser
├── IStudent (extends IUser)
├── ITeacher (extends IUser)
└── (usuários comuns)

ICourse
├── ICourseDiscipline
│   └── IDiscipline
└── IClass
    ├── IClassTeacher (relaciona IUser ao curso)
    └── IClassStudent (relaciona IStudent à turma)

IEnrollment
├── IStudent (quem está matriculado)
└── ICourse (em qual curso)

IDocument
├── IDocumentType (qual tipo de documento)
└── IUser (quem enviou)

IEvaluation
├── IClass (em qual turma)
├── IUser (professor criou)
└── IDiscipline (qual disciplina)

IGrade
└── IEvaluation (avaliação associada)
```

---

## ✅ Checklist de Cobertura

- [x] Tipos de usuário (User, Student, Teacher)
- [x] Tipos de cursos e disciplinas (Course, Discipline)
- [x] Tipos de turmas (Class, ClassTeacher, ClassStudent)
- [x] Tipos de matrículas (Enrollment)
- [x] Tipos de documentos (Document)
- [x] Tipos de avaliações e notas (Evaluation, Grade)
- [x] Tipos de solicitações (Request)
- [x] Tipos de request/response para CRUD
- [x] Types para enums (UserRole, EnrollmentStatus, etc)
- [x] Filtros e paginação
- [x] Arquivo de índice centralizado

---

## 🚀 Próximos Passos

1. **Utilizar tipos em Services** - Importar tipos em `frontend/src/services/`
2. **Utilizar tipos em Components** - Tipar props e estado em componentes React
3. **Validação com Zod** - Integrar validators.ts com estes tipos
4. **TypeScript Strict Mode** - Considerar habilitar strict mode em tsconfig.json

---

## 📝 Notas Importantes

- Todos os tipos estão em `frontend/src/types/`
- Use importação centralizada via `index.ts`
- Mantenha a documentação JSDoc atualizada
- Siga os padrões de nomeação ao adicionar novos tipos
- Sincronize tipos com o backend (estrutura de resposta da API)

---

**Última atualização:** 2025-11-04
**Feature:** feat-101
