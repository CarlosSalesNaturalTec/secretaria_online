# Guia de Endpoints da Feature feat-36

## Resumo da Implementação

A feat-36 implementa os endpoints para vincular/desvincular professores e alunos às turmas, bem como listar membros das turmas.

## Endpoints Implementados

### 1. Adicionar Professor + Disciplina à Turma
```
POST /api/v1/classes/:id/teachers/:teacherId/discipline/:disciplineId
```

**Descrição**: Vincula um professor a uma turma para lecionar uma disciplina específica.

**Parâmetros**:
- `id` (path) - ID da turma
- `teacherId` (path) - ID do professor (usuário com role='teacher')
- `disciplineId` (path) - ID da disciplina

**Exemplo de Requisição**:
```bash
POST /api/v1/classes/1/teachers/5/discipline/10
```

**Resposta de Sucesso (201)**:
```json
{
  "id": 1,
  "class_id": 1,
  "teacher_id": 5,
  "discipline_id": 10,
  "created_at": "2025-10-30T10:30:00.000Z",
  "updated_at": "2025-10-30T10:30:00.000Z"
}
```

**Erros Possíveis**:
- `404`: Turma não encontrada
- `404`: Professor não encontrado (ou não tem role='teacher')
- `404`: Disciplina não encontrada
- `409`: Professor já está vinculado à turma nessa disciplina (unique constraint)

---

### 2. Remover Professor da Turma
```
DELETE /api/v1/classes/:id/teachers/:teacherId/discipline/:disciplineId
```

**Descrição**: Desvincula um professor da turma.

**Parâmetros**:
- `id` (path) - ID da turma
- `teacherId` (path) - ID do professor
- `disciplineId` (path) - ID da disciplina

**Exemplo de Requisição**:
```bash
DELETE /api/v1/classes/1/teachers/5/discipline/10
```

**Resposta de Sucesso (204)**: Sem conteúdo

**Erros Possíveis**:
- `404`: Associação não encontrada

---

### 3. Adicionar Aluno à Turma
```
POST /api/v1/classes/:id/students/:studentId
```

**Descrição**: Vincula um aluno a uma turma.

**Parâmetros**:
- `id` (path) - ID da turma
- `studentId` (path) - ID do aluno (usuário com role='student')

**Exemplo de Requisição**:
```bash
POST /api/v1/classes/1/students/15
```

**Resposta de Sucesso (201)**:
```json
{
  "id": 1,
  "class_id": 1,
  "student_id": 15,
  "created_at": "2025-10-30T10:30:00.000Z",
  "updated_at": "2025-10-30T10:30:00.000Z"
}
```

**Erros Possíveis**:
- `404`: Turma não encontrada
- `404`: Aluno não encontrado (ou não tem role='student')
- `409`: Aluno já está vinculado à turma

---

### 4. Remover Aluno da Turma
```
DELETE /api/v1/classes/:id/students/:studentId
```

**Descrição**: Desvincula um aluno da turma.

**Parâmetros**:
- `id` (path) - ID da turma
- `studentId` (path) - ID do aluno

**Exemplo de Requisição**:
```bash
DELETE /api/v1/classes/1/students/15
```

**Resposta de Sucesso (204)**: Sem conteúdo

**Erros Possíveis**:
- `404`: Associação não encontrada

---

### 5. Listar Alunos de uma Turma
```
GET /api/v1/classes/:id/students
```

**Descrição**: Lista todos os alunos vinculados a uma turma.

**Parâmetros**:
- `id` (path) - ID da turma

**Exemplo de Requisição**:
```bash
GET /api/v1/classes/1/students
```

**Resposta de Sucesso (200)**:
```json
[
  {
    "id": 15,
    "name": "João Silva",
    "email": "joao@example.com",
    "cpf": "123.456.789-00"
  },
  {
    "id": 16,
    "name": "Maria Santos",
    "email": "maria@example.com",
    "cpf": "987.654.321-00"
  }
]
```

**Erros Possíveis**:
- `404`: Turma não encontrada

---

### 6. Listar Professores e Disciplinas de uma Turma
```
GET /api/v1/classes/:id/teachers
```

**Descrição**: Lista todos os professores e disciplinas vinculados a uma turma.

**Parâmetros**:
- `id` (path) - ID da turma

**Exemplo de Requisição**:
```bash
GET /api/v1/classes/1/teachers
```

**Resposta de Sucesso (200)**:
```json
{
  "teachers": [
    {
      "id": 5,
      "name": "Prof. Carlos",
      "email": "carlos@example.com"
    },
    {
      "id": 6,
      "name": "Prof. Ana",
      "email": "ana@example.com"
    }
  ],
  "disciplines": [
    {
      "id": 10,
      "name": "Matemática",
      "code": "MAT101"
    },
    {
      "id": 11,
      "name": "Português",
      "code": "POR101"
    }
  ]
}
```

**Erros Possíveis**:
- `404`: Turma não encontrada

---

## Fluxo de Uso Recomendado

### 1. Criar uma Turma
```bash
POST /api/v1/classes
Content-Type: application/json

{
  "course_id": 1,
  "semester": 1,
  "year": 2025
}
```

### 2. Adicionar Professores à Turma
```bash
POST /api/v1/classes/1/teachers/5/discipline/10
POST /api/v1/classes/1/teachers/6/discipline/11
```

### 3. Adicionar Alunos à Turma
```bash
POST /api/v1/classes/1/students/15
POST /api/v1/classes/1/students/16
POST /api/v1/classes/1/students/17
```

### 4. Listar Membros
```bash
GET /api/v1/classes/1/teachers  # Ver professores e disciplinas
GET /api/v1/classes/1/students  # Ver alunos
```

### 5. Remover Membros (se necessário)
```bash
DELETE /api/v1/classes/1/teachers/5/discipline/10
DELETE /api/v1/classes/1/students/15
```

---

## Validações Implementadas

### ClassTeacher (Professor + Disciplina)
✓ Turma deve existir
✓ Professor deve existir e ter role='teacher'
✓ Disciplina deve existir
✓ Combinação (class_id, teacher_id, discipline_id) deve ser única
✓ Integridade referencial: CASCADE on delete class, RESTRICT on delete teacher/discipline

### ClassStudent (Aluno)
✓ Turma deve existir
✓ Aluno deve existir e ter role='student'
✓ Combinação (class_id, student_id) deve ser única
✓ Integridade referencial: CASCADE on delete class, RESTRICT on delete student

---

## Modelos Envolvidos

### ClassTeacher
```javascript
{
  id: Integer,
  class_id: Integer (FK -> classes),
  teacher_id: Integer (FK -> users),
  discipline_id: Integer (FK -> disciplines),
  created_at: Date,
  updated_at: Date
}
```

### ClassStudent
```javascript
{
  id: Integer,
  class_id: Integer (FK -> classes),
  student_id: Integer (FK -> users),
  created_at: Date,
  updated_at: Date
}
```

---

## Troubleshooting

### Erro: "Cannot add or update a child row"
**Causa**: O ID referenciado (class_id, teacher_id, student_id ou discipline_id) não existe no banco.

**Solução**: Verifique se todos os IDs passados existem realmente:
```bash
# Verificar turmas
GET /api/v1/classes

# Verificar professores
GET /api/v1/teachers

# Verificar alunos
GET /api/v1/students

# Verificar disciplinas
GET /api/v1/disciplines
```

### Erro: "Unique constraint violated"
**Causa**: O professor/aluno já está vinculado à turma.

**Solução**: Primeiro remova a associação antiga, depois crie a nova.

---

## Status da Feature

| Item | Status |
|------|--------|
| feat-036 | ✅ Concluída |
| feat-037 | ✅ Concluída (endpoints GET implementados) |
| Modelos | ✅ ClassTeacher e ClassStudent criadas |
| Controllers | ✅ Todos os métodos implementados |
| Routes | ✅ Todas as rotas configuradas |
| Validações | ✅ Completas |
| Documentação | ✅ Este arquivo |

