# Documentação da API - Secretaria Online

**Versão:** 1.0
**Base URL:** `https://secretariaonline.com/api/v1` (Produção)
**Base URL:** `http://localhost:3000/api/v1` (Desenvolvimento)
**Gerado em:** 2025-11-05

---

## Sumário

1. [Introdução](#introdução)
2. [Autenticação e Autorização](#autenticação-e-autorização)
3. [Códigos de Status HTTP](#códigos-de-status-http)
4. [Formato de Resposta](#formato-de-resposta)
5. [Rate Limiting](#rate-limiting)
6. [Endpoints](#endpoints)
   - [Autenticação](#autenticação)
   - [Usuários Administrativos](#usuários-administrativos)
   - [Estudantes](#estudantes)
   - [Professores](#professores)
   - [Cursos](#cursos)
   - [Disciplinas](#disciplinas)
   - [Turmas](#turmas)
   - [Matrículas](#matrículas)
   - [Documentos](#documentos)
   - [Contratos](#contratos)
   - [Avaliações](#avaliações)
   - [Notas](#notas)
   - [Solicitações](#solicitações)

---

## Introdução

A API REST da **Secretaria Online** fornece endpoints para gerenciar todos os processos administrativos e acadêmicos de uma instituição de ensino. Esta API é utilizada pelo frontend React e pode ser integrada com outros sistemas.

### Características

- **Formato:** JSON
- **Protocolo:** HTTPS (obrigatório em produção)
- **Autenticação:** JWT (JSON Web Token)
- **Versionamento:** `/api/v1` (prefixo de versão)
- **Paginação:** Suportada em endpoints de listagem
- **Rate Limiting:** Proteção contra abuso

---

## Autenticação e Autorização

### Autenticação JWT

A API utiliza **JSON Web Tokens (JWT)** para autenticação. Após o login bem-sucedido, você receberá um token de acesso que deve ser incluído em todas as requisições subsequentes.

#### Como Autenticar

1. **Faça login** no endpoint `/auth/login` com suas credenciais
2. **Receba o token** na resposta (campo `data.token`)
3. **Inclua o token** no header `Authorization` de todas as requisições

**Formato do Header:**

```http
Authorization: Bearer <seu-token-jwt>
```

**Exemplo de Requisição com Autenticação:**

```bash
curl -X GET https://secretariaonline.com/api/v1/students \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Perfis de Usuário (RBAC)

A API implementa controle de acesso baseado em perfis (**Role-Based Access Control**):

| Perfil      | Descrição                                                    |
|-------------|--------------------------------------------------------------|
| **admin**   | Acesso total ao sistema, pode gerenciar todos os recursos   |
| **teacher** | Acesso a turmas, alunos, lançamento de notas e avaliações   |
| **student** | Acesso a notas, documentos e solicitações próprias          |

### Tokens

| Token          | Duração  | Propósito                                      |
|----------------|----------|------------------------------------------------|
| Access Token   | 15 min   | Autenticação nas requisições da API            |
| Refresh Token  | 7 dias   | Renovação do access token sem novo login       |

---

## Códigos de Status HTTP

| Código | Significado           | Descrição                                           |
|--------|-----------------------|-----------------------------------------------------|
| 200    | OK                    | Requisição bem-sucedida                             |
| 201    | Created               | Recurso criado com sucesso                          |
| 204    | No Content            | Requisição bem-sucedida, sem conteúdo de retorno    |
| 207    | Multi-Status          | Processamento parcial (ex: batch com falhas)        |
| 400    | Bad Request           | Dados inválidos ou faltando                         |
| 401    | Unauthorized          | Não autenticado (token ausente ou inválido)         |
| 403    | Forbidden             | Sem permissão para acessar o recurso                |
| 404    | Not Found             | Recurso não encontrado                              |
| 409    | Conflict              | Conflito (ex: CPF já cadastrado)                    |
| 413    | Payload Too Large     | Arquivo muito grande (máx: 10MB)                    |
| 422    | Unprocessable Entity  | Validação de regra de negócio falhou                |
| 429    | Too Many Requests     | Rate limit excedido                                 |
| 500    | Internal Server Error | Erro interno do servidor                            |

---

## Formato de Resposta

### Resposta de Sucesso

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "João Silva"
  },
  "message": "Operação realizada com sucesso"
}
```

### Resposta de Erro

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      {
        "field": "cpf",
        "message": "CPF inválido"
      }
    ]
  }
}
```

### Resposta de Listagem com Paginação

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

---

## Rate Limiting

Alguns endpoints possuem proteção contra abuso através de **rate limiting**:

| Endpoint             | Limite                         | Janela de Tempo |
|----------------------|--------------------------------|-----------------|
| `/auth/login`        | 5 tentativas por IP            | 15 minutos      |
| `/auth/change-password` | 3 tentativas por IP         | 60 minutos      |

**Resposta ao Exceder Limite:**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  }
}
```

---

## Endpoints

### Autenticação

#### POST /auth/login

Autentica um usuário e retorna token JWT.

**Acesso:** Público
**Rate Limit:** 5 tentativas / 15 minutos

**Request Body:**

```json
{
  "login": "admin",
  "password": "senha123"
}
```

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Administrador",
      "email": "admin@example.com",
      "role": "admin"
    }
  },
  "message": "Login realizado com sucesso"
}
```

**Response 401 (Erro):**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Login ou senha inválidos"
  }
}
```

---

#### POST /auth/logout

Invalida o token atual (logout).

**Acesso:** Autenticado
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

#### POST /auth/refresh-token

Renova o access token usando o refresh token.

**Acesso:** Público

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### POST /auth/change-password

Altera a senha do usuário autenticado.

**Acesso:** Autenticado
**Headers:** `Authorization: Bearer <token>`
**Rate Limit:** 3 tentativas / 60 minutos

**Request Body:**

```json
{
  "currentPassword": "senha123",
  "newPassword": "NovaSenha@2025"
}
```

**Validação de Senha:**
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial

**Response 200 (Success):**

```json
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

---

### Usuários Administrativos

#### GET /users

Lista todos os usuários administrativos com filtros e paginação.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Parâmetro | Tipo   | Descrição                           | Opcional |
|-----------|--------|-------------------------------------|----------|
| role      | string | Filtrar por role (admin/teacher/student) | Sim      |
| search    | string | Buscar por nome, email ou login     | Sim      |
| page      | number | Página atual (padrão: 1)            | Sim      |
| limit     | number | Itens por página (padrão: 10, máx: 100) | Sim  |

**Exemplo de Requisição:**

```
GET /api/v1/users?role=admin&page=1&limit=20
```

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Administrador",
      "email": "admin@example.com",
      "login": "admin",
      "role": "admin",
      "cpf": "123.456.789-00",
      "created_at": "2025-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

#### GET /users/:id

Busca um usuário específico por ID.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Parâmetros de URL:**

| Parâmetro | Tipo   | Descrição      |
|-----------|--------|----------------|
| id        | number | ID do usuário  |

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@example.com",
    "login": "admin",
    "role": "admin",
    "cpf": "123.456.789-00",
    "rg": "12.345.678-9",
    "mother_name": "Maria da Silva",
    "father_name": "José da Silva",
    "address": "Rua Exemplo, 123",
    "title": null,
    "reservist": null,
    "created_at": "2025-01-01T10:00:00.000Z",
    "updated_at": "2025-01-01T10:00:00.000Z"
  }
}
```

**Response 404 (Erro):**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Usuário não encontrado"
  }
}
```

---

#### POST /users

Cria um novo usuário administrativo.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "João Silva",
  "email": "joao.silva@example.com",
  "login": "joao.silva",
  "password": "Senha@123",
  "role": "admin",
  "cpf": "987.654.321-00",
  "rg": "98.765.432-1",
  "mother_name": "Ana Silva",
  "father_name": "Carlos Silva",
  "address": "Av. Principal, 456",
  "title": "Mestre",
  "reservist": "123456"
}
```

**Campos Obrigatórios:**
- name, email, login, password, role, cpf

**Response 201 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "João Silva",
    "email": "joao.silva@example.com",
    "login": "joao.silva",
    "role": "admin",
    "cpf": "987.654.321-00"
  },
  "message": "Usuário criado com sucesso"
}
```

**Response 409 (Conflito - CPF ou login já existe):**

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_ENTRY",
    "message": "CPF ou login já cadastrado"
  }
}
```

---

#### PUT /users/:id

Atualiza dados de um usuário existente.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Parâmetros de URL:**

| Parâmetro | Tipo   | Descrição      |
|-----------|--------|----------------|
| id        | number | ID do usuário  |

**Request Body (todos os campos são opcionais):**

```json
{
  "name": "João Silva Atualizado",
  "email": "joao.novo@example.com",
  "address": "Novo endereço, 789"
}
```

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "João Silva Atualizado",
    "email": "joao.novo@example.com"
  },
  "message": "Usuário atualizado com sucesso"
}
```

---

#### DELETE /users/:id

Exclui um usuário (soft delete).

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Parâmetros de URL:**

| Parâmetro | Tipo   | Descrição      |
|-----------|--------|----------------|
| id        | number | ID do usuário  |

**Response 204 (Success):**

Sem corpo de resposta.

---

### Estudantes

#### POST /students

Cria um novo estudante com senha provisória.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "Maria Santos",
  "email": "maria.santos@example.com",
  "cpf": "111.222.333-44",
  "rg": "11.222.333-4",
  "mother_name": "Ana Santos",
  "father_name": "Pedro Santos",
  "address": "Rua das Flores, 100",
  "login": "maria.santos"
}
```

**Campos Obrigatórios:**
- name, email, cpf, rg, mother_name, father_name, address, login

**Response 201 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "Maria Santos",
    "email": "maria.santos@example.com",
    "login": "maria.santos",
    "role": "student",
    "provisional_password": "Temp@2025xyz"
  },
  "message": "Estudante criado com sucesso. Senha provisória gerada."
}
```

---

#### GET /students

Lista todos os estudantes.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Maria Santos",
      "email": "maria.santos@example.com",
      "cpf": "111.222.333-44",
      "created_at": "2025-11-05T10:00:00.000Z"
    }
  ]
}
```

---

#### GET /students/:id

Busca um estudante por ID.

**Acesso:** Autenticado (Admin ou o próprio estudante)
**Headers:** `Authorization: Bearer <token>`

**Parâmetros de URL:**

| Parâmetro | Tipo   | Descrição         |
|-----------|--------|-------------------|
| id        | number | ID do estudante   |

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "Maria Santos",
    "email": "maria.santos@example.com",
    "cpf": "111.222.333-44",
    "rg": "11.222.333-4",
    "mother_name": "Ana Santos",
    "father_name": "Pedro Santos",
    "address": "Rua das Flores, 100"
  }
}
```

---

#### PUT /students/:id

Atualiza dados de um estudante.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body (campos opcionais):**

```json
{
  "name": "Maria Santos Silva",
  "address": "Novo endereço, 200"
}
```

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "Maria Santos Silva",
    "address": "Novo endereço, 200"
  },
  "message": "Estudante atualizado com sucesso"
}
```

---

#### DELETE /students/:id

Exclui um estudante (soft delete).

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 204 (Success):**

Sem corpo de resposta.

---

#### POST /students/:id/reset-password

Regenera a senha provisória de um estudante e envia por email.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Parâmetros de URL:**

| Parâmetro | Tipo   | Descrição         |
|-----------|--------|-------------------|
| id        | number | ID do estudante   |

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "new_password": "NewTemp@2025abc"
  },
  "message": "Senha provisória regenerada e enviada para o email do estudante"
}
```

---

#### GET /students/:studentId/enrollments

Lista todas as matrículas de um estudante.

**Acesso:** Autenticado (Admin ou o próprio estudante)
**Headers:** `Authorization: Bearer <token>`

**Parâmetros de URL:**

| Parâmetro  | Tipo   | Descrição         |
|------------|--------|-------------------|
| studentId  | number | ID do estudante   |

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "student_id": 5,
      "course_id": 2,
      "status": "active",
      "enrollment_date": "2025-02-01",
      "course": {
        "id": 2,
        "name": "Engenharia de Software",
        "duration_semesters": 8
      }
    }
  ]
}
```

---

### Professores

#### POST /teachers

Cria um novo professor com senha provisória.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "Prof. Carlos Eduardo",
  "email": "carlos.eduardo@example.com",
  "cpf": "555.666.777-88",
  "rg": "55.666.777-8",
  "mother_name": "Carla Eduardo",
  "father_name": "Eduardo Souza",
  "address": "Av. Universitária, 500",
  "title": "Doutor",
  "login": "carlos.eduardo"
}
```

**Response 201 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 10,
    "name": "Prof. Carlos Eduardo",
    "email": "carlos.eduardo@example.com",
    "role": "teacher",
    "provisional_password": "TempProf@2025xyz"
  },
  "message": "Professor criado com sucesso"
}
```

---

#### GET /teachers

Lista todos os professores.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "name": "Prof. Carlos Eduardo",
      "email": "carlos.eduardo@example.com",
      "title": "Doutor",
      "created_at": "2025-11-05T12:00:00.000Z"
    }
  ]
}
```

---

#### GET /teachers/:id

Busca um professor por ID.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 10,
    "name": "Prof. Carlos Eduardo",
    "email": "carlos.eduardo@example.com",
    "cpf": "555.666.777-88",
    "title": "Doutor"
  }
}
```

---

#### PUT /teachers/:id

Atualiza dados de um professor.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body (campos opcionais):**

```json
{
  "title": "Pós-Doutor",
  "address": "Novo endereço acadêmico, 600"
}
```

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 10,
    "title": "Pós-Doutor"
  },
  "message": "Professor atualizado com sucesso"
}
```

---

#### DELETE /teachers/:id

Exclui um professor (soft delete).

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 204 (Success):**

Sem corpo de resposta.

---

### Cursos

#### POST /courses

Cria um novo curso.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "Engenharia de Software",
  "description": "Curso voltado para desenvolvimento de software empresarial",
  "duration_semesters": 8
}
```

**Response 201 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Engenharia de Software",
    "description": "Curso voltado para desenvolvimento de software empresarial",
    "duration_semesters": 8
  },
  "message": "Curso criado com sucesso"
}
```

---

#### GET /courses

Lista todos os cursos.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name": "Engenharia de Software",
      "duration_semesters": 8,
      "created_at": "2025-11-05T14:00:00.000Z"
    }
  ]
}
```

---

#### GET /courses/:id

Busca um curso por ID com suas disciplinas vinculadas.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Engenharia de Software",
    "description": "Curso voltado para desenvolvimento de software empresarial",
    "duration_semesters": 8,
    "disciplines": [
      {
        "id": 5,
        "name": "Algoritmos e Estruturas de Dados",
        "code": "AED101",
        "semester": 1
      },
      {
        "id": 6,
        "name": "Banco de Dados",
        "code": "BD201",
        "semester": 2
      }
    ]
  }
}
```

---

#### PUT /courses/:id

Atualiza dados de um curso.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body (campos opcionais):**

```json
{
  "description": "Curso voltado para desenvolvimento de software empresarial e sistemas distribuídos",
  "duration_semesters": 10
}
```

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "description": "Curso voltado para desenvolvimento de software empresarial e sistemas distribuídos",
    "duration_semesters": 10
  },
  "message": "Curso atualizado com sucesso"
}
```

---

#### DELETE /courses/:id

Exclui um curso (soft delete).

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 204 (Success):**

Sem corpo de resposta.

---

#### POST /courses/:id/disciplines

Vincula uma disciplina a um curso em um semestre específico.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Parâmetros de URL:**

| Parâmetro | Tipo   | Descrição    |
|-----------|--------|--------------|
| id        | number | ID do curso  |

**Request Body:**

```json
{
  "discipline_id": 5,
  "semester": 1
}
```

**Response 201 (Success):**

```json
{
  "success": true,
  "message": "Disciplina vinculada ao curso com sucesso"
}
```

---

#### DELETE /courses/:id/disciplines/:disciplineId

Remove uma disciplina de um curso.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Parâmetros de URL:**

| Parâmetro      | Tipo   | Descrição         |
|----------------|--------|-------------------|
| id             | number | ID do curso       |
| disciplineId   | number | ID da disciplina  |

**Response 204 (Success):**

Sem corpo de resposta.

---

### Disciplinas

#### POST /disciplines

Cria uma nova disciplina.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "Algoritmos e Estruturas de Dados",
  "code": "AED101",
  "workload_hours": 80
}
```

**Response 201 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "Algoritmos e Estruturas de Dados",
    "code": "AED101",
    "workload_hours": 80
  },
  "message": "Disciplina criada com sucesso"
}
```

---

#### GET /disciplines

Lista todas as disciplinas.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Algoritmos e Estruturas de Dados",
      "code": "AED101",
      "workload_hours": 80
    }
  ]
}
```

---

#### GET /disciplines/:id

Busca uma disciplina por ID.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "Algoritmos e Estruturas de Dados",
    "code": "AED101",
    "workload_hours": 80
  }
}
```

---

#### PUT /disciplines/:id

Atualiza dados de uma disciplina.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body (campos opcionais):**

```json
{
  "workload_hours": 100
}
```

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 5,
    "workload_hours": 100
  },
  "message": "Disciplina atualizada com sucesso"
}
```

---

#### DELETE /disciplines/:id

Exclui uma disciplina (soft delete).

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 204 (Success):**

Sem corpo de resposta.

---

### Turmas

#### POST /class

Cria uma nova turma.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "course_id": 2,
  "semester": 1,
  "year": 2025
}
```

**Response 201 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 15,
    "course_id": 2,
    "semester": 1,
    "year": 2025
  },
  "message": "Turma criada com sucesso"
}
```

---

#### GET /class

Lista todas as turmas.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "course_id": 2,
      "semester": 1,
      "year": 2025,
      "course": {
        "id": 2,
        "name": "Engenharia de Software"
      }
    }
  ]
}
```

---

#### GET /class/:id

Busca uma turma por ID com alunos e professores.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 15,
    "course_id": 2,
    "semester": 1,
    "year": 2025,
    "course": {
      "id": 2,
      "name": "Engenharia de Software"
    },
    "students": [
      {
        "id": 5,
        "name": "Maria Santos"
      }
    ],
    "teachers": [
      {
        "id": 10,
        "name": "Prof. Carlos Eduardo",
        "discipline": {
          "id": 5,
          "name": "Algoritmos e Estruturas de Dados"
        }
      }
    ]
  }
}
```

---

#### PUT /class/:id

Atualiza dados de uma turma.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body (campos opcionais):**

```json
{
  "semester": 2
}
```

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 15,
    "semester": 2
  },
  "message": "Turma atualizada com sucesso"
}
```

---

#### DELETE /class/:id

Exclui uma turma (soft delete).

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 204 (Success):**

Sem corpo de resposta.

---

#### POST /class/:id/students/:studentId

Adiciona um aluno à turma.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Parâmetros de URL:**

| Parâmetro  | Tipo   | Descrição       |
|------------|--------|-----------------|
| id         | number | ID da turma     |
| studentId  | number | ID do aluno     |

**Response 201 (Success):**

```json
{
  "success": true,
  "message": "Aluno adicionado à turma com sucesso"
}
```

---

#### DELETE /class/:id/students/:studentId

Remove um aluno da turma.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 204 (Success):**

Sem corpo de resposta.

---

#### POST /class/:id/teachers/:teacherId/discipline/:disciplineId

Adiciona um professor à turma para lecionar uma disciplina.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Parâmetros de URL:**

| Parâmetro      | Tipo   | Descrição          |
|----------------|--------|--------------------|
| id             | number | ID da turma        |
| teacherId      | number | ID do professor    |
| disciplineId   | number | ID da disciplina   |

**Response 201 (Success):**

```json
{
  "success": true,
  "message": "Professor vinculado à turma com sucesso"
}
```

---

#### DELETE /class/:id/teachers/:teacherId/discipline/:disciplineId

Remove um professor da turma.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 204 (Success):**

Sem corpo de resposta.

---

#### GET /class/:id/students

Lista todos os alunos de uma turma.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Maria Santos",
      "email": "maria.santos@example.com"
    }
  ]
}
```

---

#### GET /class/:id/teachers

Lista todos os professores de uma turma.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "name": "Prof. Carlos Eduardo",
      "discipline": {
        "id": 5,
        "name": "Algoritmos e Estruturas de Dados"
      }
    }
  ]
}
```

---

### Matrículas

#### POST /enrollments

Cria uma nova matrícula (status inicial: `pending`).

**Acesso:** Autenticado
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "student_id": 5,
  "course_id": 2,
  "enrollment_date": "2025-11-05"
}
```

**Campos Obrigatórios:**
- student_id, course_id
- enrollment_date é opcional (padrão: data atual)

**Response 201 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "student_id": 5,
    "course_id": 2,
    "status": "pending",
    "enrollment_date": "2025-11-05"
  },
  "message": "Matrícula criada com sucesso com status 'pending'"
}
```

---

#### GET /enrollments

Lista todas as matrículas.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "student_id": 5,
      "course_id": 2,
      "status": "pending",
      "enrollment_date": "2025-11-05",
      "student": {
        "id": 5,
        "name": "Maria Santos"
      },
      "course": {
        "id": 2,
        "name": "Engenharia de Software"
      }
    }
  ]
}
```

---

#### GET /enrollments/:id

Busca uma matrícula por ID.

**Acesso:** Autenticado
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "student_id": 5,
    "course_id": 2,
    "status": "pending",
    "enrollment_date": "2025-11-05"
  }
}
```

---

#### PUT /enrollments/:id/status

Altera o status de uma matrícula.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "status": "active"
}
```

**Status Permitidos:**
- `pending`: Aguardando aprovação de documentos
- `active`: Matrícula ativa (documentos aprovados)
- `cancelled`: Matrícula cancelada

**Regra de Negócio:**
- Mudança de `pending` para `active` requer que todos os documentos obrigatórios estejam aprovados

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "active"
  },
  "message": "Status da matrícula alterado para 'active'"
}
```

**Response 422 (Erro - Documentos pendentes):**

```json
{
  "success": false,
  "error": {
    "code": "DOCUMENTS_PENDING",
    "message": "Não é possível ativar matrícula. Documentos obrigatórios pendentes."
  }
}
```

---

#### DELETE /enrollments/:id

Exclui uma matrícula (soft delete).

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 204 (Success):**

Sem corpo de resposta.

---

### Documentos

#### POST /documents

Faz upload de um documento obrigatório.

**Acesso:** Autenticado (Aluno, Professor ou Admin)
**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**

| Campo            | Tipo   | Descrição                            |
|------------------|--------|--------------------------------------|
| document         | file   | Arquivo (PDF, JPG, PNG - máx: 10MB) |
| document_type_id | number | ID do tipo de documento              |

**Exemplo de Requisição (cURL):**

```bash
curl -X POST https://secretariaonline.com/api/v1/documents \
  -H "Authorization: Bearer <token>" \
  -F "document=@/path/to/file.pdf" \
  -F "document_type_id=2"
```

**Response 201 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 25,
    "user_id": 5,
    "document_type_id": 2,
    "file_path": "/uploads/documents/doc_1699360800_abc123.pdf",
    "status": "pending",
    "created_at": "2025-11-05T10:30:00.000Z"
  },
  "message": "Documento enviado com sucesso. Aguardando aprovação."
}
```

**Response 413 (Erro - Arquivo muito grande):**

```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "Arquivo excede o tamanho máximo permitido (10MB)"
  }
}
```

---

#### GET /documents

Lista documentos com filtros.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Parâmetro | Tipo   | Descrição                                    | Opcional |
|-----------|--------|----------------------------------------------|----------|
| status    | string | Filtrar por status (pending/approved/rejected) | Sim      |
| userId    | number | Filtrar por ID do usuário                    | Sim      |
| page      | number | Página atual (padrão: 1)                     | Sim      |
| limit     | number | Itens por página (padrão: 20)                | Sim      |
| orderBy   | string | Campo para ordenar (padrão: created_at)      | Sim      |
| order     | string | ASC ou DESC (padrão: DESC)                   | Sim      |

**Exemplo de Requisição:**

```
GET /api/v1/documents?status=pending&page=1&limit=10
```

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 25,
      "user_id": 5,
      "document_type_id": 2,
      "status": "pending",
      "file_path": "/uploads/documents/doc_abc123.pdf",
      "created_at": "2025-11-05T10:30:00.000Z",
      "user": {
        "id": 5,
        "name": "Maria Santos"
      },
      "document_type": {
        "id": 2,
        "name": "RG",
        "description": "Documento de identidade"
      }
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

#### GET /documents/:id

Busca um documento por ID.

**Acesso:** Autenticado (Admin ou proprietário do documento)
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 25,
    "user_id": 5,
    "document_type_id": 2,
    "status": "pending",
    "file_path": "/uploads/documents/doc_abc123.pdf",
    "observations": null,
    "reviewed_at": null,
    "reviewed_by": null,
    "created_at": "2025-11-05T10:30:00.000Z"
  }
}
```

---

#### PUT /documents/:id/approve

Aprova um documento.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "observations": "Documento aprovado conforme exigências"
}
```

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 25,
    "status": "approved",
    "reviewed_at": "2025-11-05T11:00:00.000Z",
    "reviewed_by": 1
  },
  "message": "Documento aprovado com sucesso"
}
```

---

#### PUT /documents/:id/reject

Rejeita um documento.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "observations": "Documento ilegível. Favor enviar foto mais nítida."
}
```

**Campos Obrigatórios:**
- observations (obrigatório ao rejeitar)

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 25,
    "status": "rejected",
    "observations": "Documento ilegível. Favor enviar foto mais nítida.",
    "reviewed_at": "2025-11-05T11:05:00.000Z",
    "reviewed_by": 1
  },
  "message": "Documento rejeitado"
}
```

---

#### DELETE /documents/:id

Exclui um documento.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Response 204 (Success):**

Sem corpo de resposta.

---

#### GET /documents/my-documents

Lista documentos do usuário autenticado.

**Acesso:** Autenticado (Aluno, Professor ou Admin)
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Parâmetro | Tipo   | Descrição                  | Opcional |
|-----------|--------|----------------------------|----------|
| page      | number | Página atual (padrão: 1)   | Sim      |
| limit     | number | Itens por página (padrão: 20) | Sim   |

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 25,
      "document_type_id": 2,
      "status": "pending",
      "created_at": "2025-11-05T10:30:00.000Z",
      "document_type": {
        "id": 2,
        "name": "RG",
        "description": "Documento de identidade"
      }
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

#### GET /documents/user/:userId

Lista documentos de um usuário específico.

**Acesso:** Admin ou o próprio usuário
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 25,
      "document_type_id": 2,
      "status": "pending"
    }
  ]
}
```

---

#### GET /documents/:id/validate

Valida status de documentos obrigatórios de um usuário.

**Acesso:** Autenticado
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "all_approved": false,
    "total_required": 5,
    "total_uploaded": 3,
    "total_approved": 2,
    "total_pending": 1,
    "total_rejected": 0,
    "missing_documents": [
      {
        "id": 4,
        "name": "Comprovante de Residência"
      }
    ]
  }
}
```

---

#### GET /documents/:id/download

Faz download de um documento.

**Acesso:** Admin ou proprietário do documento
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

Retorna o arquivo binário com headers:

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="documento.pdf"
```

---

### Contratos

#### GET /contracts

Lista contratos do usuário autenticado (ou todos, se admin).

**Acesso:** Autenticado
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Parâmetro | Tipo   | Descrição                              | Opcional |
|-----------|--------|----------------------------------------|----------|
| userId    | number | Filtrar por ID do usuário (admin only) | Sim      |
| status    | string | Filtrar por status (pending/accepted)  | Sim      |
| limit     | number | Itens por página (padrão: 10)          | Sim      |
| offset    | number | Offset para paginação (padrão: 0)      | Sim      |

**Comportamento:**
- **Admin:** Lista todos os contratos, pode filtrar por userId
- **Aluno/Professor:** Lista apenas seus próprios contratos

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 50,
      "user_id": 5,
      "template_id": 1,
      "file_path": "/uploads/contracts/contract_abc123.pdf",
      "accepted_at": null,
      "semester": 1,
      "year": 2025,
      "created_at": "2025-11-05T09:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

---

#### POST /contracts

Gera um novo contrato para um usuário (Admin only).

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "userId": 5,
  "userType": "student",
  "semester": 1,
  "year": 2025,
  "templateId": 1
}
```

**Campos Obrigatórios:**
- userId, userType (student ou teacher)

**Response 201 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 51,
    "user_id": 5,
    "template_id": 1,
    "file_path": "/uploads/contracts/contract_xyz789.pdf",
    "semester": 1,
    "year": 2025,
    "created_at": "2025-11-05T12:00:00.000Z"
  },
  "message": "Contrato gerado com sucesso"
}
```

---

#### GET /contracts/:id

Busca detalhes de um contrato específico.

**Acesso:** Proprietário do contrato ou Admin
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 50,
    "user_id": 5,
    "template_id": 1,
    "file_path": "/uploads/contracts/contract_abc123.pdf",
    "accepted_at": null,
    "semester": 1,
    "year": 2025,
    "user": {
      "id": 5,
      "name": "Maria Santos",
      "email": "maria.santos@example.com"
    }
  }
}
```

---

#### POST /contracts/:id/accept

Registra o aceite de um contrato.

**Acesso:** Proprietário do contrato ou Admin
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 50,
    "accepted_at": "2025-11-05T13:00:00.000Z"
  },
  "message": "Contrato aceito com sucesso"
}
```

**Response 422 (Erro - Contrato já aceito):**

```json
{
  "success": false,
  "error": {
    "code": "CONTRACT_ALREADY_ACCEPTED",
    "message": "Este contrato já foi aceito anteriormente"
  }
}
```

---

#### GET /contracts/:id/pdf

Faz download do PDF do contrato.

**Acesso:** Proprietário do contrato ou Admin
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

Retorna o arquivo PDF com headers:

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="contract_50.pdf"
```

---

### Avaliações

#### POST /evaluations

Cria uma nova avaliação para uma turma.

**Acesso:** Admin ou Professor
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "class_id": 15,
  "teacher_id": 10,
  "discipline_id": 5,
  "name": "Prova 1 - Algoritmos",
  "date": "2025-12-10",
  "type": "grade"
}
```

**Campos Obrigatórios:**
- class_id, teacher_id, discipline_id, name, date, type

**Tipos de Avaliação:**
- `grade`: Nota numérica de 0 a 10
- `concept`: Conceito (satisfactory / unsatisfactory)

**Response 201 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 100,
    "class_id": 15,
    "teacher_id": 10,
    "discipline_id": 5,
    "name": "Prova 1 - Algoritmos",
    "date": "2025-12-10",
    "type": "grade",
    "created_at": "2025-11-05T14:00:00.000Z"
  },
  "message": "Avaliação criada com sucesso"
}
```

---

#### GET /evaluations/classes/:classId/evaluations

Lista todas as avaliações de uma turma.

**Acesso:** Autenticado
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Parâmetro | Tipo   | Descrição                       | Opcional |
|-----------|--------|---------------------------------|----------|
| type      | string | Filtrar por tipo (grade/concept) | Sim      |

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 100,
      "name": "Prova 1 - Algoritmos",
      "date": "2025-12-10",
      "type": "grade",
      "teacher": {
        "id": 10,
        "name": "Prof. Carlos Eduardo"
      },
      "discipline": {
        "id": 5,
        "name": "Algoritmos e Estruturas de Dados"
      }
    }
  ]
}
```

---

#### GET /evaluations/classes/:classId/evaluations/upcoming

Lista avaliações futuras de uma turma.

**Acesso:** Autenticado
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 100,
      "name": "Prova 1 - Algoritmos",
      "date": "2025-12-10",
      "type": "grade"
    }
  ]
}
```

---

#### GET /evaluations/teachers/:teacherId/evaluations

Lista todas as avaliações criadas por um professor.

**Acesso:** Autenticado
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 100,
      "name": "Prova 1 - Algoritmos",
      "date": "2025-12-10",
      "class": {
        "id": 15,
        "semester": 1,
        "year": 2025
      }
    }
  ]
}
```

---

#### GET /evaluations/:id

Busca uma avaliação por ID.

**Acesso:** Autenticado
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 100,
    "class_id": 15,
    "teacher_id": 10,
    "discipline_id": 5,
    "name": "Prova 1 - Algoritmos",
    "date": "2025-12-10",
    "type": "grade"
  }
}
```

---

#### PUT /evaluations/:id

Atualiza uma avaliação.

**Acesso:** Admin ou Professor (criador da avaliação)
**Headers:** `Authorization: Bearer <token>`

**Request Body (campos opcionais):**

```json
{
  "name": "Prova 1 - Algoritmos (2ª Chamada)",
  "date": "2025-12-15"
}
```

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 100,
    "name": "Prova 1 - Algoritmos (2ª Chamada)",
    "date": "2025-12-15"
  },
  "message": "Avaliação atualizada com sucesso"
}
```

---

#### DELETE /evaluations/:id

Exclui uma avaliação.

**Acesso:** Admin ou Professor (criador)
**Headers:** `Authorization: Bearer <token>`

**Response 204 (Success):**

Sem corpo de resposta.

---

### Notas

#### POST /grades

Lança uma nota para um aluno em uma avaliação.

**Acesso:** Professor ou Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body (Nota Numérica):**

```json
{
  "evaluation_id": 100,
  "student_id": 5,
  "grade": 8.5
}
```

**Request Body (Conceito):**

```json
{
  "evaluation_id": 101,
  "student_id": 5,
  "concept": "satisfactory"
}
```

**Validações:**
- grade: 0 a 10 (apenas para avaliações tipo `grade`)
- concept: "satisfactory" ou "unsatisfactory" (apenas para tipo `concept`)

**Response 201 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 500,
    "evaluation_id": 100,
    "student_id": 5,
    "grade": 8.5,
    "concept": null,
    "created_at": "2025-11-05T15:00:00.000Z"
  },
  "message": "Nota lançada com sucesso"
}
```

**Response 422 (Erro - Aluno não está na turma):**

```json
{
  "success": false,
  "error": {
    "code": "STUDENT_NOT_IN_CLASS",
    "message": "O aluno não está matriculado nesta turma"
  }
}
```

---

#### PUT /grades/:id

Atualiza uma nota existente.

**Acesso:** Professor (criador) ou Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "grade": 9.0
}
```

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 500,
    "grade": 9.0,
    "updated_at": "2025-11-05T16:00:00.000Z"
  },
  "message": "Nota atualizada com sucesso"
}
```

---

#### GET /grades/evaluations/:id/grades

Lista todas as notas de uma avaliação.

**Acesso:** Professor (da disciplina) ou Admin
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Parâmetro       | Tipo    | Descrição                                  | Opcional |
|-----------------|---------|-------------------------------------------|----------|
| includePending  | boolean | Incluir alunos sem nota lançada (default: false) | Sim      |

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 500,
      "student_id": 5,
      "grade": 8.5,
      "concept": null,
      "student": {
        "id": 5,
        "name": "Maria Santos",
        "email": "maria.santos@example.com"
      }
    },
    {
      "student_id": 6,
      "student": {
        "id": 6,
        "name": "João Alves"
      },
      "grade": null,
      "concept": null,
      "status": "pending"
    }
  ]
}
```

---

#### GET /grades/evaluations/:id/grades/stats

Obtém estatísticas de lançamento de notas para uma avaliação.

**Acesso:** Professor ou Admin
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

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

---

#### GET /grades/evaluations/:id/grades/pending

Lista alunos que ainda não tiveram nota lançada em uma avaliação.

**Acesso:** Professor ou Admin
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 6,
      "name": "João Alves",
      "email": "joao.alves@example.com"
    },
    {
      "id": 7,
      "name": "Pedro Costa",
      "email": "pedro.costa@example.com"
    }
  ],
  "count": 2
}
```

---

#### POST /grades/evaluations/:id/grades/batch

Lança múltiplas notas em lote para uma avaliação.

**Acesso:** Professor ou Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "grades": [
    {
      "student_id": 5,
      "grade": 8.5
    },
    {
      "student_id": 6,
      "grade": 7.0
    },
    {
      "student_id": 7,
      "grade": 9.5
    }
  ]
}
```

**Response 201 (Success - Todas lançadas):**

```json
{
  "success": true,
  "data": {
    "total": 3,
    "success": 3,
    "failed": 0,
    "results": [
      {
        "student_id": 5,
        "status": "success",
        "grade": {
          "id": 500,
          "grade": 8.5
        }
      },
      {
        "student_id": 6,
        "status": "success",
        "grade": {
          "id": 501,
          "grade": 7.0
        }
      },
      {
        "student_id": 7,
        "status": "success",
        "grade": {
          "id": 502,
          "grade": 9.5
        }
      }
    ]
  },
  "message": "Todas as notas foram lançadas com sucesso"
}
```

**Response 207 (Processamento Parcial - Algumas falharam):**

```json
{
  "success": true,
  "data": {
    "total": 3,
    "success": 2,
    "failed": 1,
    "results": [
      {
        "student_id": 5,
        "status": "success",
        "grade": {
          "id": 500,
          "grade": 8.5
        }
      },
      {
        "student_id": 6,
        "status": "failed",
        "error": "Aluno não está matriculado na turma"
      },
      {
        "student_id": 7,
        "status": "success",
        "grade": {
          "id": 502,
          "grade": 9.5
        }
      }
    ]
  },
  "message": "Processamento parcial: 2 notas lançadas, 1 falhou"
}
```

---

#### GET /grades/my-grades

Obtém todas as notas do aluno autenticado.

**Acesso:** Estudante
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Parâmetro      | Tipo   | Descrição                        | Opcional |
|----------------|--------|----------------------------------|----------|
| semester       | number | Filtrar por semestre             | Sim      |
| discipline_id  | number | Filtrar por ID da disciplina     | Sim      |

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 500,
      "evaluation": {
        "id": 100,
        "name": "Prova 1 - Algoritmos",
        "date": "2025-12-10",
        "type": "grade"
      },
      "class": {
        "id": 15,
        "semester": 1,
        "year": 2025
      },
      "discipline": {
        "id": 5,
        "name": "Algoritmos e Estruturas de Dados",
        "code": "AED101"
      },
      "grade": 8.5,
      "concept": null,
      "created_at": "2025-11-05T15:00:00.000Z",
      "updated_at": "2025-11-05T15:00:00.000Z"
    }
  ],
  "count": 1,
  "filters": null
}
```

---

### Solicitações

#### POST /requests

Cria uma nova solicitação.

**Acesso:** Aluno ou Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body (Aluno):**

```json
{
  "request_type_id": 1,
  "description": "Preciso do histórico escolar para processo de transferência"
}
```

**Request Body (Admin criando para um aluno):**

```json
{
  "student_id": 5,
  "request_type_id": 2,
  "description": "Solicitação de certificado"
}
```

**Campos Obrigatórios:**
- request_type_id
- student_id (apenas para admin)

**Response 201 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 200,
    "student_id": 5,
    "request_type_id": 1,
    "description": "Preciso do histórico escolar para processo de transferência",
    "status": "pending",
    "created_at": "2025-11-05T16:00:00.000Z"
  },
  "message": "Solicitação criada com sucesso"
}
```

---

#### GET /requests

Lista solicitações.

**Acesso:** Aluno (próprias) ou Admin (todas)
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Parâmetro  | Tipo   | Descrição                                   | Opcional |
|------------|--------|---------------------------------------------|----------|
| status     | string | Filtrar por status (pending/approved/rejected) | Sim      |
| student_id | number | Filtrar por aluno (admin only)              | Sim      |

**Comportamento:**
- **Admin:** Lista todas as solicitações, pode filtrar por student_id
- **Aluno:** Lista apenas suas próprias solicitações

**Response 200 (Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": 200,
      "student_id": 5,
      "request_type_id": 1,
      "description": "Preciso do histórico escolar para processo de transferência",
      "status": "pending",
      "created_at": "2025-11-05T16:00:00.000Z",
      "student": {
        "id": 5,
        "name": "Maria Santos"
      },
      "request_type": {
        "id": 1,
        "name": "Histórico Escolar",
        "deadline_days": 5
      }
    }
  ]
}
```

---

#### GET /requests/:id

Busca uma solicitação por ID.

**Acesso:** Aluno (própria) ou Admin
**Headers:** `Authorization: Bearer <token>`

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 200,
    "student_id": 5,
    "request_type_id": 1,
    "description": "Preciso do histórico escolar para processo de transferência",
    "status": "pending",
    "observations": null,
    "reviewed_at": null,
    "reviewed_by": null,
    "created_at": "2025-11-05T16:00:00.000Z"
  }
}
```

---

#### PUT /requests/:id/approve

Aprova uma solicitação.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "observations": "Histórico escolar disponível para retirada na secretaria"
}
```

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 200,
    "status": "approved",
    "observations": "Histórico escolar disponível para retirada na secretaria",
    "reviewed_at": "2025-11-05T17:00:00.000Z",
    "reviewed_by": 1
  },
  "message": "Solicitação aprovada com sucesso"
}
```

---

#### PUT /requests/:id/reject

Rejeita uma solicitação.

**Acesso:** Admin
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "observations": "Matrícula não está ativa. Não é possível emitir histórico escolar."
}
```

**Response 200 (Success):**

```json
{
  "success": true,
  "data": {
    "id": 200,
    "status": "rejected",
    "observations": "Matrícula não está ativa. Não é possível emitir histórico escolar.",
    "reviewed_at": "2025-11-05T17:05:00.000Z",
    "reviewed_by": 1
  },
  "message": "Solicitação rejeitada"
}
```

---

## Conclusão

Esta documentação cobre todos os endpoints disponíveis na API REST da **Secretaria Online**. Para questões, sugestões ou reporte de bugs, entre em contato com a equipe de desenvolvimento.

**Versão do Documento:** 1.0
**Última Atualização:** 2025-11-05

---

**© 2025 Secretaria Online - Todos os direitos reservados**
