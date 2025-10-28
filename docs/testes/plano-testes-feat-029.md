# PLANO DE TESTES - feat-029: Criar UserController e rotas básicas

**Feature:** feat-029 - Criar UserController e rotas básicas
**Grupo:** Backend - API de Usuários e Estudantes
**Data de criação:** 2025-10-28
**Status:** Aguardando execução

---

## 📋 TESTE FUNCIONAL

### Teste 1 - Listar Usuários (GET /api/v1/users)

**Objetivo:** Verificar se a listagem de usuários retorna dados corretamente com suporte a filtros e paginação

**Pré-requisitos:**
- Servidor backend rodando
- Banco de dados com seeders executados (usuário admin existente)
- Token JWT válido de um usuário admin

**Passos:**

1. **Fazer login como admin para obter token JWT**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "login": "admin",
       "password": "admin123"
     }'
   ```
   - Copiar o `accessToken` retornado

2. **Listar todos os usuários sem filtros**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/users" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

3. **Listar usuários com filtro por role (admin)**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/users?role=admin" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

4. **Listar usuários com busca por nome**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/users?search=admin" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

5. **Listar usuários com paginação (página 1, 5 itens por página)**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/users?page=1&limit=5" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

**Resultado Esperado:**
- ✓ Status HTTP 200 OK
- ✓ Resposta contém `success: true`
- ✓ Campo `data` é um array de usuários
- ✓ Usuários não contêm campo `passwordHash`
- ✓ Campo `pagination` contém:
  - `currentPage` (número da página atual)
  - `totalPages` (total de páginas)
  - `totalRecords` (total de registros)
  - `recordsPerPage` (itens por página)
  - `hasNextPage` (boolean)
  - `hasPreviousPage` (boolean)
- ✓ Filtro por role retorna apenas usuários do role especificado
- ✓ Busca por nome retorna usuários cujo nome, email ou login contenha o termo buscado

**Estrutura de resposta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "role": "admin",
      "name": "Administrador",
      "email": "admin@secretariaonline.com",
      "login": "admin",
      "cpf": "123.456.789-00",
      "createdAt": "2025-10-27T...",
      "updatedAt": "2025-10-27T..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalRecords": 1,
    "recordsPerPage": 10,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

**Como verificar:**
- Confirmar status code 200
- Verificar ausência do campo `passwordHash` em todos os usuários retornados
- Validar estrutura de paginação
- Testar filtros e busca retornam dados corretos

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2 - Buscar Usuário por ID (GET /api/v1/users/:id)

**Objetivo:** Verificar se é possível buscar um usuário específico por ID

**Pré-requisitos:**
- Token JWT de admin
- ID de um usuário existente no banco (usar ID 1 do usuário admin)

**Passos:**

1. **Buscar usuário admin (ID 1)**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/users/1" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

2. **Tentar buscar usuário inexistente (ID 99999)**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/users/99999" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

3. **Tentar buscar com ID inválido (texto ao invés de número)**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/users/abc" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

**Resultado Esperado:**
- ✓ Busca com ID existente: Status 200, usuário retornado sem `passwordHash`
- ✓ Busca com ID inexistente: Status 404, mensagem "Usuário não encontrado", código `USER_NOT_FOUND`
- ✓ Busca com ID inválido: Status 400, erro de validação

**Como verificar:**
- Confirmar códigos HTTP corretos para cada cenário
- Verificar mensagens de erro específicas
- Validar ausência de `passwordHash` no usuário retornado

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3 - Criar Novo Usuário (POST /api/v1/users)

**Objetivo:** Verificar se é possível criar novos usuários com validação de dados

**Pré-requisitos:**
- Token JWT de admin
- CPF válido e único

**Passos:**

1. **Criar usuário administrativo válido**
   ```bash
   curl -X POST "http://localhost:3000/api/v1/users" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "João Silva Administrador",
       "email": "joao.admin@exemplo.com",
       "login": "joao.admin",
       "password": "Senha@123",
       "role": "admin",
       "cpf": "111.222.333-44",
       "rg": "12.345.678-9",
       "motherName": "Maria Silva",
       "fatherName": "José Silva",
       "address": "Rua Exemplo, 123",
       "title": "Coordenador",
       "reservist": "123456"
     }'
   ```

2. **Tentar criar usuário com CPF duplicado**
   ```bash
   curl -X POST "http://localhost:3000/api/v1/users" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Outro Usuário",
       "email": "outro@exemplo.com",
       "login": "outro.user",
       "password": "Senha@123",
       "role": "teacher",
       "cpf": "111.222.333-44"
     }'
   ```

3. **Tentar criar usuário com CPF inválido**
   ```bash
   curl -X POST "http://localhost:3000/api/v1/users" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Usuário Teste",
       "email": "teste@exemplo.com",
       "login": "teste.user",
       "password": "Senha@123",
       "role": "student",
       "cpf": "123.456.789-00"
     }'
   ```

4. **Tentar criar usuário com senha fraca**
   ```bash
   curl -X POST "http://localhost:3000/api/v1/users" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Usuário Teste",
       "email": "teste2@exemplo.com",
       "login": "teste2.user",
       "password": "123",
       "role": "student",
       "cpf": "222.333.444-55"
     }'
   ```

5. **Tentar criar usuário com email inválido**
   ```bash
   curl -X POST "http://localhost:3000/api/v1/users" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Usuário Teste",
       "email": "email-invalido",
       "login": "teste3.user",
       "password": "Senha@123",
       "role": "student",
       "cpf": "333.444.555-66"
     }'
   ```

6. **Tentar criar usuário com role inválido**
   ```bash
   curl -X POST "http://localhost:3000/api/v1/users" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Usuário Teste",
       "email": "teste4@exemplo.com",
       "login": "teste4.user",
       "password": "Senha@123",
       "role": "superuser",
       "cpf": "444.555.666-77"
     }'
   ```

**Resultado Esperado:**
- ✓ Usuário válido: Status 201 Created, usuário retornado sem `passwordHash`, log registrado
- ✓ CPF duplicado: Status 409 Conflict, código `CPF_ALREADY_EXISTS`
- ✓ CPF inválido: Status 400 Bad Request, código `VALIDATION_ERROR`, detalhe sobre CPF
- ✓ Senha fraca: Status 400 Bad Request, mensagem sobre requisitos de senha
- ✓ Email inválido: Status 400 Bad Request, mensagem sobre formato de email
- ✓ Role inválido: Status 400 Bad Request, mensagem sobre roles permitidos
- ✓ Senha é hasheada automaticamente antes de salvar no banco

**Como verificar:**
- Confirmar códigos HTTP corretos
- Verificar que senha não é retornada na resposta
- Consultar banco de dados e confirmar que senha foi hasheada com bcrypt
- Validar mensagens de erro específicas para cada tipo de validação

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 4 - Atualizar Usuário (PUT /api/v1/users/:id)

**Objetivo:** Verificar se é possível atualizar dados de um usuário existente

**Pré-requisitos:**
- Token JWT de admin
- ID de um usuário criado anteriormente

**Passos:**

1. **Atualizar nome e email do usuário**
   ```bash
   curl -X PUT "http://localhost:3000/api/v1/users/2" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "João Silva Administrador Updated",
       "email": "joao.admin.updated@exemplo.com"
     }'
   ```

2. **Atualizar senha do usuário**
   ```bash
   curl -X PUT "http://localhost:3000/api/v1/users/2" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -H "Content-Type: application/json" \
     -d '{
       "password": "NovaSenha@456"
     }'
   ```

3. **Tentar atualizar com email duplicado**
   ```bash
   curl -X PUT "http://localhost:3000/api/v1/users/2" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@secretariaonline.com"
     }'
   ```

4. **Tentar atualizar usuário inexistente**
   ```bash
   curl -X PUT "http://localhost:3000/api/v1/users/99999" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Teste"
     }'
   ```

**Resultado Esperado:**
- ✓ Atualização válida: Status 200 OK, dados atualizados retornados
- ✓ Senha atualizada: Status 200 OK, nova senha hasheada salva no banco
- ✓ Email duplicado: Status 409 Conflict, código `EMAIL_ALREADY_EXISTS`
- ✓ Usuário inexistente: Status 404 Not Found, código `USER_NOT_FOUND`
- ✓ Log de operação registrado

**Como verificar:**
- Confirmar alterações no banco de dados
- Testar login com nova senha após atualização
- Validar que apenas campos fornecidos são atualizados

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5 - Excluir Usuário (DELETE /api/v1/users/:id)

**Objetivo:** Verificar se é possível excluir usuários (soft delete)

**Pré-requisitos:**
- Token JWT de admin
- ID de um usuário criado anteriormente

**Passos:**

1. **Excluir usuário válido**
   ```bash
   curl -X DELETE "http://localhost:3000/api/v1/users/2" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

2. **Verificar que usuário foi soft deleted (não aparece em listagem)**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/users/2" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

3. **Tentar excluir o próprio usuário (auto-exclusão)**
   ```bash
   curl -X DELETE "http://localhost:3000/api/v1/users/1" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

4. **Tentar excluir usuário inexistente**
   ```bash
   curl -X DELETE "http://localhost:3000/api/v1/users/99999" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

5. **Verificar no banco que registro foi soft deleted**
   ```sql
   SELECT id, name, email, deletedAt FROM users WHERE id = 2;
   ```

**Resultado Esperado:**
- ✓ Exclusão válida: Status 200 OK, mensagem de sucesso
- ✓ Busca após exclusão: Status 404 Not Found (soft delete oculta o registro)
- ✓ Auto-exclusão: Status 400 Bad Request, código `CANNOT_DELETE_SELF`
- ✓ Usuário inexistente: Status 404 Not Found
- ✓ No banco: campo `deletedAt` preenchido com timestamp
- ✓ Log de exclusão registrado

**Como verificar:**
- Confirmar que registro não aparece em listagens após exclusão
- Verificar no banco que `deletedAt` foi preenchido
- Validar que auto-exclusão é bloqueada

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔒 TESTE DE SEGURANÇA

### Teste 6 - Controle de Acesso (RBAC)

**Objetivo:** Verificar que apenas administradores podem acessar endpoints de usuários

**Pré-requisitos:**
- Tokens JWT de diferentes roles (admin, teacher, student)

**Passos:**

1. **Tentar listar usuários sem autenticação (sem token)**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/users"
   ```

2. **Criar usuário professor para obter token**
   ```bash
   # Primeiro, criar professor como admin
   curl -X POST "http://localhost:3000/api/v1/users" \
     -H "Authorization: Bearer TOKEN_ADMIN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Professor Teste",
       "email": "professor@exemplo.com",
       "login": "professor.teste",
       "password": "Senha@123",
       "role": "teacher",
       "cpf": "555.666.777-88"
     }'

   # Fazer login como professor
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "login": "professor.teste",
       "password": "Senha@123"
     }'
   ```

3. **Tentar listar usuários como professor**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/users" \
     -H "Authorization: Bearer TOKEN_PROFESSOR"
   ```

4. **Tentar criar usuário como professor**
   ```bash
   curl -X POST "http://localhost:3000/api/v1/users" \
     -H "Authorization: Bearer TOKEN_PROFESSOR" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Teste",
       "email": "teste@exemplo.com",
       "login": "teste",
       "password": "Senha@123",
       "role": "student",
       "cpf": "666.777.888-99"
     }'
   ```

**Resultado Esperado:**
- ✓ Sem token: Status 401 Unauthorized
- ✓ Com token de professor: Status 403 Forbidden, mensagem de acesso negado
- ✓ Com token de aluno: Status 403 Forbidden
- ✓ Apenas com token de admin: Acesso permitido

**Como verificar:**
- Testar com tokens de cada role
- Confirmar códigos HTTP de erro apropriados
- Verificar logs de segurança registrados

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 7 - Validação de Token JWT

**Objetivo:** Verificar que tokens inválidos ou expirados são rejeitados

**Passos:**

1. **Tentar usar token inválido**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/users" \
     -H "Authorization: Bearer token_invalido_123"
   ```

2. **Tentar usar token mal formatado (sem "Bearer ")**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/users" \
     -H "Authorization: SEU_TOKEN_AQUI"
   ```

3. **Tentar usar token sem header Authorization**
   ```bash
   curl -X GET "http://localhost:3000/api/v1/users" \
     -H "X-Custom-Token: SEU_TOKEN_AQUI"
   ```

**Resultado Esperado:**
- ✓ Token inválido: Status 401 Unauthorized
- ✓ Token mal formatado: Status 401 Unauthorized
- ✓ Sem header Authorization: Status 401 Unauthorized

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ✅ TESTE DE VALIDAÇÃO

### Teste 8 - Validação de Dados de Entrada

**Objetivo:** Verificar que todas as validações de entrada estão funcionando

**Passos:**

1. **Criar usuário sem campos obrigatórios**
   ```bash
   curl -X POST "http://localhost:3000/api/v1/users" \
     -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

2. **Criar usuário com nome muito curto (menos de 3 caracteres)**
   ```bash
   curl -X POST "http://localhost:3000/api/v1/users" \
     -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Jo",
       "email": "jo@exemplo.com",
       "login": "jo",
       "password": "Senha@123",
       "role": "student",
       "cpf": "777.888.999-00"
     }'
   ```

3. **Criar usuário com login contendo caracteres especiais inválidos**
   ```bash
   curl -X POST "http://localhost:3000/api/v1/users" \
     -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Teste Usuario",
       "email": "teste@exemplo.com",
       "login": "teste@#$%",
       "password": "Senha@123",
       "role": "student",
       "cpf": "888.999.000-11"
     }'
   ```

**Resultado Esperado:**
- ✓ Campos vazios: Status 400, múltiplos erros de validação listados em `details`
- ✓ Nome curto: Status 400, erro específico sobre tamanho mínimo
- ✓ Login inválido: Status 400, erro sobre caracteres permitidos

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📊 TESTE DE INTEGRAÇÃO

### Teste 9 - Fluxo Completo de CRUD

**Objetivo:** Testar o ciclo completo de operações em sequência

**Passos:**

1. Login como admin
2. Criar novo usuário
3. Listar usuários e confirmar que o novo usuário aparece
4. Buscar o novo usuário por ID
5. Atualizar dados do usuário
6. Buscar novamente e confirmar alterações
7. Excluir o usuário
8. Confirmar que usuário não aparece mais na listagem

**Resultado Esperado:**
- ✓ Todas as operações executam com sucesso
- ✓ Dados permanecem consistentes entre operações
- ✓ Logs registrados para todas as operações críticas

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTE DE LOGGING

### Teste 10 - Verificação de Logs

**Objetivo:** Confirmar que operações críticas são registradas nos logs

**Passos:**

1. **Executar operações críticas:**
   - Criar usuário
   - Atualizar usuário
   - Excluir usuário
   - Tentativa de acesso não autorizado

2. **Verificar logs gerados**
   ```bash
   # Ver logs em tempo real
   tail -f backend/logs/combined.log

   # Buscar logs específicos de UserController
   grep "UserController" backend/logs/combined.log

   # Buscar logs de segurança
   grep "Forbidden\|Unauthorized" backend/logs/combined.log
   ```

**Resultado Esperado:**
- ✓ Log de criação de usuário contém: userId, role, createdBy
- ✓ Log de atualização contém: userId, updatedBy, updatedFields
- ✓ Log de exclusão contém: userId, userRole, deletedBy
- ✓ Logs de tentativas de acesso não autorizado registrados
- ✓ Nenhuma senha ou token completo aparece nos logs

**Como verificar:**
- Abrir arquivo `backend/logs/combined.log`
- Buscar por timestamps e mensagens específicas
- Confirmar formato JSON estruturado

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ⚡ TESTE DE PERFORMANCE

### Teste 11 - Paginação e Performance

**Objetivo:** Verificar que paginação funciona corretamente e performance é adequada

**Pré-requisitos:**
- Criar múltiplos usuários para testar paginação (pelo menos 50)

**Passos:**

1. **Criar script para popular banco com usuários**
   ```javascript
   // scripts/populate-users.js
   for (let i = 1; i <= 50; i++) {
     await User.create({
       name: `Usuário Teste ${i}`,
       email: `teste${i}@exemplo.com`,
       login: `teste${i}`,
       passwordHash: await bcrypt.hash('Senha@123', 10),
       role: i % 3 === 0 ? 'admin' : i % 3 === 1 ? 'teacher' : 'student',
       cpf: `${String(i).padStart(11, '0')}`
     });
   }
   ```

2. **Testar listagem com diferentes tamanhos de página**
   ```bash
   curl "http://localhost:3000/api/v1/users?limit=10" \
     -H "Authorization: Bearer TOKEN" -w "\nTime: %{time_total}s\n"

   curl "http://localhost:3000/api/v1/users?limit=50" \
     -H "Authorization: Bearer TOKEN" -w "\nTime: %{time_total}s\n"
   ```

3. **Testar navegação entre páginas**
   ```bash
   curl "http://localhost:3000/api/v1/users?page=1&limit=10" -H "Authorization: Bearer TOKEN"
   curl "http://localhost:3000/api/v1/users?page=2&limit=10" -H "Authorization: Bearer TOKEN"
   curl "http://localhost:3000/api/v1/users?page=5&limit=10" -H "Authorization: Bearer TOKEN"
   ```

**Resultado Esperado:**
- ✓ Tempo de resposta < 500ms para listagem com 50 registros
- ✓ Paginação retorna número correto de registros por página
- ✓ `totalPages` calculado corretamente
- ✓ `hasNextPage` e `hasPreviousPage` corretos para cada página

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📝 RESUMO DE TESTES

| # | Teste | Tipo | Status | Observações |
|---|-------|------|--------|-------------|
| 1 | Listar usuários | Funcional | ⏳ Pendente | |
| 2 | Buscar usuário por ID | Funcional | ⏳ Pendente | |
| 3 | Criar novo usuário | Funcional | ⏳ Pendente | |
| 4 | Atualizar usuário | Funcional | ⏳ Pendente | |
| 5 | Excluir usuário | Funcional | ⏳ Pendente | |
| 6 | Controle de acesso RBAC | Segurança | ⏳ Pendente | |
| 7 | Validação de token JWT | Segurança | ⏳ Pendente | |
| 8 | Validação de dados | Validação | ⏳ Pendente | |
| 9 | Fluxo completo CRUD | Integração | ⏳ Pendente | |
| 10 | Verificação de logs | Logging | ⏳ Pendente | |
| 11 | Paginação e performance | Performance | ⏳ Pendente | |

**Legenda:**
- ⏳ Pendente
- ✅ Passou
- ❌ Falhou

---

## 🐛 BUGS ENCONTRADOS

_[Preencher durante execução dos testes]_

| # | Teste | Descrição do Bug | Severidade | Status |
|---|-------|------------------|------------|---------|
| | | | | |

**Severidade:**
- 🔴 Crítica: Impede funcionamento
- 🟡 Alta: Afeta funcionalidade principal
- 🔵 Média: Afeta funcionalidade secundária
- ⚪ Baixa: Cosmético ou menor

---

## ✅ CRITÉRIOS DE APROVAÇÃO

Para que a feature seja considerada **CONCLUÍDA**, todos os seguintes critérios devem ser atendidos:

- [ ] Todos os testes funcionais (1-5) devem passar
- [ ] Todos os testes de segurança (6-7) devem passar
- [ ] Validações (teste 8) devem estar funcionando corretamente
- [ ] Nenhum bug crítico ou alto encontrado
- [ ] Logs estão sendo registrados corretamente
- [ ] Performance está dentro do esperado (< 500ms)
- [ ] Código está documentado e segue padrões do projeto
- [ ] README.md está atualizado com novos endpoints

---

**Responsável pela execução:** _[Nome]_
**Data de execução:** _[YYYY-MM-DD]_
**Aprovado por:** _[Nome]_
**Data de aprovação:** _[YYYY-MM-DD]_
