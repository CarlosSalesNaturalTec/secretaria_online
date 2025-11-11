# Implementação de Campos Condicionais para Usuários

**Data:** 2025-11-08
**Feature:** feat-100 - Campos Condicionais para Usuários Admin, Alunos e Professores
**Status:** ✅ Implementado e Testado

---

## 📋 Resumo da Solução

O sistema foi adaptado para suportar **dois cenários de cadastro de usuários** com campos condicionais:

### **Cenário 1: Usuários Admin** (sem campos extras obrigatórios)
- `role`, `nome`, `email`, `login`, `password`, `cpf`, `rg`

### **Cenário 2: Alunos e Professores** (com campos extras obrigatórios)
- Todos os campos do Cenário 1, **MAIS**:
  - `voter_title` (Título de Eleitor)
  - `reservist` (Número de Reservista)
  - `mother_name` (Nome da Mãe)
  - `father_name` (Nome do Pai)
  - `address` (Endereço)

---

## 🔧 Mudanças Implementadas

### 1. **Database Migration**
**Arquivo:** `backend/database/migrations/20251108175552-add-conditional-fields-to-users.js`

```javascript
// Adicionadas 5 colunas NULLABLE à tabela users:
- voter_title (VARCHAR(20))
- reservist (VARCHAR(20))
- mother_name (VARCHAR(255))
- father_name (VARCHAR(255))
- address (TEXT)
```

**Status:** ✅ Migration executada com sucesso

---

### 2. **User Model Updates**
**Arquivo:** `backend/src/models/User.js`

#### Novos Campos Adicionados
```javascript
voter_title: {
  type: DataTypes.STRING(20),
  allowNull: true,
  validate: { len: { args: [0, 20], msg: 'Máximo 20 caracteres' } }
}

reservist: {
  type: DataTypes.STRING(20),
  allowNull: true,
  validate: { len: { args: [0, 20], msg: 'Máximo 20 caracteres' } }
}

mother_name: {
  type: DataTypes.STRING(255),
  allowNull: true,
  validate: { len: { args: [0, 255], msg: 'Máximo 255 caracteres' } }
}

father_name: {
  type: DataTypes.STRING(255),
  allowNull: true,
  validate: { len: { args: [0, 255], msg: 'Máximo 255 caracteres' } }
}

address: {
  type: DataTypes.TEXT,
  allowNull: true
}
```

#### Validação Condicional no Hook `beforeValidate`
```javascript
beforeValidate: async (user) => {
  // Se o usuário for student ou teacher, validar campos extras
  if (user.role === 'student' || user.role === 'teacher') {
    const requiredFields = ['voter_title', 'reservist', 'mother_name', 'father_name', 'address'];
    const missingFields = [];

    requiredFields.forEach(field => {
      if (!user[field] || (typeof user[field] === 'string' && !user[field].trim())) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      throw new Error(
        `Os seguintes campos são obrigatórios para ${user.role === 'student' ? 'alunos' : 'professores'}: ${missingFields.join(', ')}`
      );
    }
  }
  // ... resto do hook
}
```

#### Método `getPublicData()` Atualizado
```javascript
User.prototype.getPublicData = function () {
  const publicData = { id, role, name, email, login, cpf, rg, created_at, updated_at };

  // Incluir campos extras apenas para students e teachers
  if (this.role === 'student' || this.role === 'teacher') {
    publicData.voter_title = this.voter_title;
    publicData.reservist = this.reservist;
    publicData.mother_name = this.mother_name;
    publicData.father_name = this.father_name;
    publicData.address = this.address;
  }

  return publicData;
};
```

---

### 3. **Student Service Updates**
**Arquivo:** `backend/src/services/student.service.js`

#### Validação de Campos Obrigatórios
```javascript
async create(studentData) {
  const requiredFields = {
    voter_title: 'Título de eleitor',
    reservist: 'Número de reservista',
    mother_name: 'Nome da mãe',
    father_name: 'Nome do pai',
    address: 'Endereço',
  };

  const missingFields = [];
  for (const [field, label] of Object.entries(requiredFields)) {
    if (!studentData[field] || (typeof studentData[field] === 'string' && !studentData[field].trim())) {
      missingFields.push(label);
    }
  }

  if (missingFields.length > 0) {
    throw new AppError(
      `Os seguintes campos são obrigatórios para alunos: ${missingFields.join(', ')}`,
      400
    );
  }

  // ... resto da lógica
}
```

---

### 4. **Teacher Service Updates**
**Arquivo:** `backend/src/services/teacher.service.js`

- Padronizado para usar o mesmo padrão que o StudentService
- Validação condicional de campos obrigatórios
- Envio de email não-bloqueante com a senha provisória

---

### 5. **User Controller Updates**
**Arquivo:** `backend/src/controllers/user.controller.js`

#### Validação de Role
```javascript
async create(req, res, next) {
  const { role = 'admin', ... } = req.body;

  // Validar que apenas admins podem ser criados neste endpoint
  if (role !== 'admin') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ROLE',
        message: 'Este endpoint é apenas para criar usuários admin. Use /students ou /teachers para criar alunos ou professores.'
      }
    });
  }

  // ... criar usuário admin
}
```

---

### 6. **Route Validations Updates**

#### Student Routes: `backend/src/routes/student.routes.js`
```javascript
router.post('/', authorizeAdmin, [
  // Campos básicos
  body('name').trim().notEmpty().isLength({ min: 3, max: 255 }),
  body('email').trim().isEmail().notEmpty(),
  body('cpf').trim().custom(validateCPF),
  body('rg').trim().notEmpty().isLength({ max: 20 }),
  body('login').trim().notEmpty().isAlphanumeric().isLength({ min: 3, max: 100 }),

  // Campos condicionais obrigatórios
  body('voter_title').trim().notEmpty().isLength({ max: 20 }),
  body('reservist').trim().notEmpty().isLength({ max: 20 }),
  body('mother_name').trim().notEmpty().isLength({ min: 3, max: 255 }),
  body('father_name').trim().notEmpty().isLength({ min: 3, max: 255 }),
  body('address').trim().notEmpty().isLength({ min: 10 }),
], StudentController.create);
```

#### Teacher Routes: `backend/src/routes/teacher.routes.js`
- Mesmas validações que student routes
- Garante que todos os campos extras são obrigatórios

#### User Routes: `backend/src/routes/user.routes.js`
```javascript
// Campos extras são opcionais para admin
body('voter_title').optional().trim().isLength({ max: 20 }),
body('reservist').optional().trim().isLength({ max: 20 }),
body('mother_name').optional().trim().isLength({ max: 255 }),
body('father_name').optional().trim().isLength({ max: 255 }),
body('address').optional().trim().isLength({ max: 500 }),
```

---

## 📚 Exemplos de Uso

### Exemplo 1: Criar Usuário Admin

```bash
POST /api/v1/users
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "João Silva",
  "email": "joao@admin.com",
  "login": "joao.silva",
  "password": "senhaSegura123",
  "cpf": "12345678901",
  "rg": "MG1234567"
}
```

**Resposta (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "role": "admin",
    "name": "João Silva",
    "email": "joao@admin.com",
    "login": "joao.silva",
    "cpf": "12345678901",
    "rg": "MG1234567",
    "created_at": "2025-11-08T10:30:00Z",
    "updated_at": "2025-11-08T10:30:00Z"
  },
  "message": "Usuário admin criado com sucesso"
}
```

**Campos extras (voter_title, reservist, etc.) NÃO aparecem na resposta do admin.**

---

### Exemplo 2: Criar Aluno

```bash
POST /api/v1/students
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Maria Santos",
  "email": "maria@aluno.com",
  "login": "maria.santos",
  "cpf": "98765432101",
  "rg": "SP9876543",
  "voter_title": "123456789",
  "reservist": "RS123456",
  "mother_name": "Rosa Silva Santos",
  "father_name": "Paulo Santos",
  "address": "Rua Principal, 123, São Paulo, SP"
}
```

**Resposta (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "role": "student",
    "name": "Maria Santos",
    "email": "maria@aluno.com",
    "login": "maria.santos",
    "cpf": "98765432101",
    "rg": "SP9876543",
    "voter_title": "123456789",
    "reservist": "RS123456",
    "mother_name": "Rosa Silva Santos",
    "father_name": "Paulo Santos",
    "address": "Rua Principal, 123, São Paulo, SP",
    "created_at": "2025-11-08T10:35:00Z",
    "updated_at": "2025-11-08T10:35:00Z"
  },
  "message": "Estudante criado com sucesso"
}
```

**Campos extras aparecem na resposta do aluno.**

---

### Exemplo 3: Criar Aluno sem Campos Extras (ERRO)

```bash
POST /api/v1/students
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Carlos Silva",
  "email": "carlos@aluno.com",
  "login": "carlos.silva",
  "cpf": "11122233344",
  "rg": "RJ1122334"
  // Campos extras faltando!
}
```

**Resposta (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Os seguintes campos são obrigatórios para alunos: Título de eleitor, Número de reservista, Nome da mãe, Nome do pai, Endereço"
  }
}
```

---

### Exemplo 4: Criar Professor

```bash
POST /api/v1/teachers
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Dr. Roberto Costa",
  "email": "roberto@professor.com",
  "login": "roberto.costa",
  "cpf": "55566677788",
  "rg": "MG5556667",
  "voter_title": "987654321",
  "reservist": "RS789012",
  "mother_name": "Ana Costa Silva",
  "father_name": "José Costa",
  "address": "Avenida Brasil, 456, Belo Horizonte, MG"
}
```

**Resposta (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "role": "teacher",
    "name": "Dr. Roberto Costa",
    "email": "roberto@professor.com",
    "login": "roberto.costa",
    "cpf": "55566677788",
    "rg": "MG5556667",
    "voter_title": "987654321",
    "reservist": "RS789012",
    "mother_name": "Ana Costa Silva",
    "father_name": "José Costa",
    "address": "Avenida Brasil, 456, Belo Horizonte, MG",
    "created_at": "2025-11-08T10:40:00Z",
    "updated_at": "2025-11-08T10:40:00Z"
  },
  "message": "Professor criado com sucesso"
}
```

---

## 🎯 Fluxo de Validação

```
┌─────────────────────────────────────────────────────────────┐
│                    Requisição de Criação                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Route-Level Validation       │
        │  (express-validator)          │
        │  - Verifica tipos             │
        │  - Formatos básicos           │
        │  - Unicidade relativa         │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Service-Level Validation     │
        │  (Student/Teacher Service)    │
        │  - Valida campos obrigatórios │
        │  - Verifica unicidade DB      │
        │  - Gera senha provisória      │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Model Hooks (beforeValidate) │
        │  - Validação condicional      │
        │  - Se role=student|teacher:   │
        │    * Verifica campos extras   │
        │  - Hash da senha              │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Model Validations            │
        │  - Validações de campo        │
        │  - CPF check                  │
        │  - Comprimentos               │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Database Insert              │
        │  - Soft delete ready          │
        │  - Timestamps automáticos     │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Email Service                │
        │  (Não-bloqueante)             │
        │  - Envia senha provisória     │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Sucesso (201)                │
        │  Retorna dados criados        │
        └───────────────────────────────┘
```

---

## 🔐 Segurança

### Pontos de Validação
1. **Route-Level:** Express-validator garante tipos e formatos
2. **Service-Level:** Validações de negócio e unicidade
3. **Model-Level:** Hooks e validações de atributo
4. **Database-Level:** Constraints de integridade

### Proteções Implementadas
- ✅ Validação condicional de campos baseada em `role`
- ✅ Todos os campos extras são `nullable` (não bloqueiam admin)
- ✅ Validação só é obrigatória para `student` e `teacher`
- ✅ Campos extras não aparecem na resposta de admins
- ✅ Senha nunca é retornada nas respostas (excluída por `defaultScope`)

---

## 📊 Estrutura de Dados

### Tabela `users` (Antes)
```sql
CREATE TABLE users (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  role ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  login VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) NOT NULL UNIQUE,
  rg VARCHAR(20),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

### Tabela `users` (Depois)
```sql
CREATE TABLE users (
  -- ... colunas anteriores ...
  rg VARCHAR(20),
  voter_title VARCHAR(20),         -- 🆕
  reservist VARCHAR(20),            -- 🆕
  mother_name VARCHAR(255),         -- 🆕
  father_name VARCHAR(255),         -- 🆕
  address TEXT,                     -- 🆕
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

---

## ✅ Checklist de Implementação

- [x] Migration criada e executada
- [x] Campos adicionados à Model User
- [x] Validação condicional no hook `beforeValidate`
- [x] Método `getPublicData()` atualizado
- [x] Student Service atualizado
- [x] Teacher Service padronizado
- [x] User Controller atualizado para admin-only
- [x] Validações de rota atualizadas (students)
- [x] Validações de rota atualizadas (teachers)
- [x] Validações de rota atualizadas (users/admin)
- [x] Testes manuais realizados
- [x] Documentação completada

---

## 🚀 Próximos Passos (Recomendados)

1. **Testes Automatizados:** Adicionar testes para validação condicional
   - Teste criar admin sem campos extras (deve passar)
   - Teste criar aluno sem campos extras (deve falhar)
   - Teste criar professor sem campos extras (deve falhar)

2. **Frontend:** Atualizar formulários
   - Formulário de admin: sem campos extras
   - Formulário de aluno: com campos extras obrigatórios
   - Formulário de professor: com campos extras obrigatórios

3. **Documentação API:** Atualizar Swagger/OpenAPI
   - Endpoints diferentes para admin, student, teacher
   - Campos obrigatórios vs opcionais claramente documentados

4. **Auditoria:** Verificar dados existentes
   - Se já existem alunos/professores, seus campos extras podem ser NULL
   - Considerar migração de dados ou validação suave em transição

---

## 📞 Suporte e Questões

**Dúvidas sobre a implementação?**
- Verificar testes em `backend/src/routes/student.routes.js`
- Revisar validações em `backend/src/models/User.js`
- Consultar examples acima neste documento

---

**Documento Criado em:** 2025-11-08
**Versão:** 1.0
**Status:** ✅ Completo e Testado
