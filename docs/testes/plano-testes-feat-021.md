# PLANO DE TESTES - feat-021: Criar middleware RBAC (autorização por role)

**Feature:** feat-021 - Criar middleware RBAC (autorização por role)
**Grupo:** Autenticação e Autorização
**Data de criação:** 2025-10-27
**Status:** Aguardando execução

---

## 🔧 PREPARAÇÃO DO AMBIENTE

### Pré-requisitos

Certifique-se que o ambiente está configurado:

```bash
# Certifique-se de que o backend está rodando
cd backend
npm run dev
```

**Esperado:**
```
[SERVER] Server is running on port 3000
[DATABASE] Database connection established successfully
```

**Ferramentas recomendadas:**
- **Postman** ou **Insomnia** para testar APIs REST
- **curl** para testes via terminal
- **MySQL Workbench** ou **DBeaver** para verificar dados no banco

---

## 📋 TESTE FUNCIONAL

### Teste 1: Verificar Autorização para Administradores

**Objetivo:** Verificar se apenas administradores podem acessar endpoints protegidos com `authorize('admin')`

**Pré-condição:**
- Ter um usuário admin no banco (criado pelo seeder `admin-user`)
- Criar endpoints de teste ou usar endpoints existentes protegidos

**Passos:**

1. **Login como administrador:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "login": "admin",
       "password": "admin123"
     }'
   ```

   Salve o `access_token` retornado.

2. **Acessar endpoint protegido com role admin:**
   ```bash
   curl -X GET http://localhost:3000/api/v1/users \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

**Resultado Esperado:**
- ✓ Requisição retorna `200 OK`
- ✓ Response contém dados dos usuários
- ✓ Logs do servidor mostram: `[RBAC] Acesso autorizado`
- ✓ Nenhum erro 403 (Forbidden) é retornado

**Como verificar:**
- Verificar status HTTP: `200 OK`
- Verificar response body: `{ "success": true, "data": [...] }`
- Verificar logs do servidor no terminal

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Bloquear Acesso de Professores a Recursos de Admin

**Objetivo:** Verificar se professores são bloqueados ao tentar acessar endpoints exclusivos de admin

**Pré-condição:**
- Ter um usuário professor no banco (criar manualmente se necessário)

**Passos:**

1. **Criar usuário professor (se necessário):**
   ```sql
   INSERT INTO users (role, name, email, login, password_hash, cpf, rg, created_at, updated_at)
   VALUES (
     'teacher',
     'Professor Teste',
     'professor@test.com',
     'professor',
     '$2a$10$X7YZqKYm6YqKYm6YqKYm6Om6YqKYm6YqKYm6YqKYm6YqKYm6YqKYm', -- senha: test123
     '12345678901',
     '123456789',
     NOW(),
     NOW()
   );
   ```

   **Nota:** Para gerar hash de senha real, use:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('test123', 10).then(hash => console.log(hash));"
   ```

2. **Login como professor:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "login": "professor",
       "password": "test123"
     }'
   ```

   Salve o `access_token` retornado.

3. **Tentar acessar endpoint de admin:**
   ```bash
   curl -X GET http://localhost:3000/api/v1/users \
     -H "Authorization: Bearer SEU_TOKEN_DO_PROFESSOR"
   ```

**Resultado Esperado:**
- ✓ Requisição retorna `403 Forbidden`
- ✓ Response contém:
  ```json
  {
    "success": false,
    "error": {
      "code": "FORBIDDEN",
      "message": "Você não tem permissão para acessar este recurso"
    }
  }
  ```
- ✓ Logs do servidor mostram: `[RBAC] Acesso negado - role não autorizada`
- ✓ Dados sensíveis NÃO são retornados

**Como verificar:**
- Verificar status HTTP: `403 Forbidden`
- Verificar mensagem de erro específica
- Verificar logs do servidor

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Bloquear Acesso de Alunos a Recursos de Admin e Professor

**Objetivo:** Verificar se alunos são bloqueados ao tentar acessar endpoints de admin e professor

**Pré-condição:**
- Ter um usuário aluno no banco

**Passos:**

1. **Criar usuário aluno (se necessário):**
   ```sql
   INSERT INTO users (role, name, email, login, password_hash, cpf, rg, created_at, updated_at)
   VALUES (
     'student',
     'Aluno Teste',
     'aluno@test.com',
     'aluno',
     '$2a$10$X7YZqKYm6YqKYm6YqKYm6Om6YqKYm6YqKYm6YqKYm6YqKYm6YqKYm', -- use hash real
     '98765432101',
     '987654321',
     NOW(),
     NOW()
   );
   ```

2. **Login como aluno:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "login": "aluno",
       "password": "test123"
     }'
   ```

3. **Tentar acessar endpoint de admin:**
   ```bash
   curl -X GET http://localhost:3000/api/v1/users \
     -H "Authorization: Bearer SEU_TOKEN_DO_ALUNO"
   ```

4. **Tentar acessar endpoint de professor (se houver):**
   ```bash
   curl -X GET http://localhost:3000/api/v1/classes \
     -H "Authorization: Bearer SEU_TOKEN_DO_ALUNO"
   ```

**Resultado Esperado:**
- ✓ Ambas requisições retornam `403 Forbidden`
- ✓ Mensagem de erro adequada em cada caso
- ✓ Logs mostram tentativas bloqueadas

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTE DE VALIDAÇÃO

### Teste 4: Acesso sem Token de Autenticação

**Objetivo:** Verificar se o middleware retorna erro 401 quando não há token

**Input:** Requisição sem header `Authorization`

**Método:**
```bash
curl -X GET http://localhost:3000/api/v1/users
```

**Resultado Esperado:**
- ✓ Status HTTP: `401 Unauthorized`
- ✓ Response:
  ```json
  {
    "success": false,
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Autenticação necessária para acessar este recurso"
    }
  }
  ```
- ✓ Logs: `[RBAC] Tentativa de acesso sem autenticação`

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5: Múltiplas Roles Permitidas

**Objetivo:** Verificar se o middleware permite acesso quando usuário tem uma das roles permitidas

**Pré-condição:**
- Endpoint configurado com `authorize('admin', 'teacher')`

**Passos:**

1. **Login como admin e testar:**
   ```bash
   # Login admin
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"login": "admin", "password": "admin123"}'

   # Acessar endpoint
   curl -X GET http://localhost:3000/api/v1/classes \
     -H "Authorization: Bearer TOKEN_ADMIN"
   ```

2. **Login como professor e testar:**
   ```bash
   # Login professor
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"login": "professor", "password": "test123"}'

   # Acessar endpoint
   curl -X GET http://localhost:3000/api/v1/classes \
     -H "Authorization: Bearer TOKEN_PROFESSOR"
   ```

3. **Login como aluno e testar (deve falhar):**
   ```bash
   # Login aluno
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"login": "aluno", "password": "test123"}'

   # Acessar endpoint (deve retornar 403)
   curl -X GET http://localhost:3000/api/v1/classes \
     -H "Authorization: Bearer TOKEN_ALUNO"
   ```

**Resultado Esperado:**
- ✓ Admin: `200 OK` - acesso permitido
- ✓ Professor: `200 OK` - acesso permitido
- ✓ Aluno: `403 Forbidden` - acesso negado

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6: Usuário sem Role Definida

**Objetivo:** Verificar comportamento quando `req.user.role` está ausente

**Pré-condição:**
- Criar usuário no banco sem role (NULL) ou simular token JWT sem campo role

**Passos:**

1. **Criar usuário sem role:**
   ```sql
   INSERT INTO users (role, name, email, login, password_hash, cpf, rg, created_at, updated_at)
   VALUES (
     NULL,
     'Usuário Sem Role',
     'semrole@test.com',
     'semrole',
     '$2a$10$X7YZqKYm6YqKYm6YqKYm6Om6YqKYm6YqKYm6YqKYm6YqKYm6YqKYm',
     '11111111111',
     '111111111',
     NOW(),
     NOW()
   );
   ```

2. **Tentar login e acessar endpoint protegido:**
   ```bash
   # Login
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"login": "semrole", "password": "test123"}'

   # Acessar endpoint
   curl -X GET http://localhost:3000/api/v1/users \
     -H "Authorization: Bearer SEU_TOKEN"
   ```

**Resultado Esperado:**
- ✓ Status: `403 Forbidden`
- ✓ Mensagem: "Usuário sem permissão de acesso definida"
- ✓ Log de erro: `[RBAC] Usuário autenticado sem role definida`

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔗 TESTE DE INTEGRAÇÃO

### Teste 7: Integração com Middleware de Autenticação (auth.middleware.js)

**Objetivo:** Verificar se o middleware RBAC funciona corretamente após o middleware de autenticação

**Verificar:**
- ✓ Middleware de autenticação (auth.middleware.js) injeta `req.user` corretamente
- ✓ Middleware RBAC (rbac.middleware.js) lê `req.user.role` sem erros
- ✓ Ordem de execução está correta: `authenticate → authorize → controller`
- ✓ Erros são propagados corretamente entre middlewares

**Como verificar:**

1. **Verificar ordem dos middlewares nas rotas:**
   ```javascript
   // Exemplo de rota correta
   router.get('/users', authenticate, authorize('admin'), UserController.list);
   ```

2. **Testar fluxo completo:**
   ```bash
   # Login para obter token válido
   TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"login": "admin", "password": "admin123"}' | jq -r '.data.access_token')

   # Usar token em requisição
   curl -X GET http://localhost:3000/api/v1/users \
     -H "Authorization: Bearer $TOKEN" \
     -v
   ```

3. **Verificar logs do servidor:**
   - Deve aparecer: `[AUTH] Token válido`
   - Seguido de: `[RBAC] Acesso autorizado`

**Resultado Esperado:**
- ✓ Integração funciona sem erros
- ✓ `req.user` é passado corretamente entre middlewares
- ✓ Logs mostram sequência correta de execução

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🚨 TESTE DE ERRO

### Teste 8: Erro Inesperado no Middleware

**Objetivo:** Verificar se erros inesperados são capturados pelo try-catch

**Método:** Simular erro forçando situação anormal

**Passos:**

1. **Modificar temporariamente o middleware para forçar erro:**
   ```javascript
   // Em rbac.middleware.js, adicionar temporariamente:
   function authorize(...allowedRoles) {
     return (req, res, next) => {
       try {
         // Forçar erro para teste
         throw new Error('Erro simulado para teste');

         // ... resto do código
       } catch (error) {
         // ... tratamento de erro
       }
     };
   }
   ```

2. **Fazer requisição com token válido:**
   ```bash
   curl -X GET http://localhost:3000/api/v1/users \
     -H "Authorization: Bearer SEU_TOKEN_VALIDO"
   ```

**Resultado Esperado:**
- ✓ Status: `500 Internal Server Error`
- ✓ Response:
  ```json
  {
    "success": false,
    "error": {
      "code": "INTERNAL_ERROR",
      "message": "Erro ao verificar permissões de acesso",
      "details": "Erro simulado para teste" // apenas em development
    }
  }
  ```
- ✓ Log de erro: `[RBAC] Erro ao verificar autorização:`
- ✓ Stack trace está presente nos logs (não no response)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução. Não esquecer de remover a modificação após o teste!]_

---

## 📊 TESTE DE CONSTANTES E HELPERS

### Teste 9: Constantes ROLES

**Objetivo:** Verificar se as constantes ROLES estão corretas e podem ser importadas

**Como verificar:**

1. **Criar script de teste temporário:**
   ```javascript
   // test-rbac-constants.js
   const { ROLES } = require('./src/middlewares/rbac.middleware');

   console.log('ROLES.ADMIN:', ROLES.ADMIN);
   console.log('ROLES.TEACHER:', ROLES.TEACHER);
   console.log('ROLES.STUDENT:', ROLES.STUDENT);

   // Verificações
   if (ROLES.ADMIN !== 'admin') throw new Error('ROLES.ADMIN incorreto');
   if (ROLES.TEACHER !== 'teacher') throw new Error('ROLES.TEACHER incorreto');
   if (ROLES.STUDENT !== 'student') throw new Error('ROLES.STUDENT incorreto');

   console.log('✓ Todas as constantes ROLES estão corretas!');
   ```

2. **Executar:**
   ```bash
   cd backend
   node test-rbac-constants.js
   ```

**Resultado Esperado:**
- ✓ Output mostra valores corretos: `admin`, `teacher`, `student`
- ✓ Nenhum erro é lançado
- ✓ Mensagem de sucesso é exibida

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 10: Middlewares Pré-Configurados

**Objetivo:** Verificar se os middlewares pré-configurados funcionam corretamente

**Como verificar:**

1. **Testar `authorizeAdmin`:**
   ```javascript
   // Em uma rota de teste:
   const { authorizeAdmin } = require('./middlewares/rbac.middleware');
   router.get('/test-admin', authenticate, authorizeAdmin, (req, res) => {
     res.json({ message: 'Acesso admin permitido' });
   });
   ```

   ```bash
   # Testar como admin (deve passar)
   curl -X GET http://localhost:3000/api/v1/test-admin \
     -H "Authorization: Bearer TOKEN_ADMIN"

   # Testar como professor (deve falhar)
   curl -X GET http://localhost:3000/api/v1/test-admin \
     -H "Authorization: Bearer TOKEN_PROFESSOR"
   ```

2. **Testar `authorizeTeacher` (admin + teacher):**
   ```javascript
   const { authorizeTeacher } = require('./middlewares/rbac.middleware');
   router.get('/test-teacher', authenticate, authorizeTeacher, (req, res) => {
     res.json({ message: 'Acesso teacher permitido' });
   });
   ```

   ```bash
   # Admin deve ter acesso
   # Professor deve ter acesso
   # Aluno NÃO deve ter acesso
   ```

3. **Testar `authorizeStudent`:**
   ```javascript
   const { authorizeStudent } = require('./middlewares/rbac.middleware');
   router.get('/test-student', authenticate, authorizeStudent, (req, res) => {
     res.json({ message: 'Acesso student permitido' });
   });
   ```

4. **Testar `authorizeAny` (todos autenticados):**
   ```javascript
   const { authorizeAny } = require('./middlewares/rbac.middleware');
   router.get('/test-any', authenticate, authorizeAny, (req, res) => {
     res.json({ message: 'Acesso permitido para qualquer role' });
   });
   ```

**Resultado Esperado:**
- ✓ `authorizeAdmin`: Apenas admin tem acesso
- ✓ `authorizeTeacher`: Admin e teacher têm acesso
- ✓ `authorizeStudent`: Apenas student tem acesso
- ✓ `authorizeAny`: Todos usuários autenticados têm acesso

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ✅ CHECKLIST FINAL

Após executar todos os testes, verifique:

- [ ] Middleware bloqueia corretamente acessos não autorizados (401)
- [ ] Middleware bloqueia corretamente acessos sem permissão (403)
- [ ] Middleware permite acessos com role adequada (200)
- [ ] Múltiplas roles podem ser especificadas e funcionam corretamente
- [ ] Mensagens de erro são claras e informativas
- [ ] Logs estão sendo gerados adequadamente
- [ ] Constantes ROLES funcionam corretamente
- [ ] Middlewares pré-configurados funcionam conforme esperado
- [ ] Integração com auth.middleware.js está funcionando
- [ ] Erros inesperados são capturados e tratados adequadamente
- [ ] Documentação no README.md está correta e clara
- [ ] Código está seguindo os padrões do projeto (ESLint/Prettier)

---

## 📝 RELATÓRIO DE BUGS (se houver)

**Formato do relatório:**

```
BUG #X: [Título do bug]

Descrição: [Descrição detalhada do problema]
Severidade: [Crítica | Alta | Média | Baixa]
Passos para reproduzir:
1. [Passo 1]
2. [Passo 2]

Resultado esperado: [O que deveria acontecer]
Resultado obtido: [O que realmente aconteceu]

Logs relevantes:
[Cole aqui logs do servidor/erros]

Screenshots/Evidências: [Se aplicável]
```

---

## 🎯 CRITÉRIOS DE APROVAÇÃO

A feature será considerada **APROVADA** se:

1. ✅ Todos os testes funcionais (1-3) passarem
2. ✅ Todos os testes de validação (4-6) passarem
3. ✅ Teste de integração (7) passar
4. ✅ Testes de constantes e helpers (9-10) passarem
5. ✅ Nenhum bug crítico ou de alta severidade for encontrado
6. ✅ Código seguir os padrões do projeto (linting/formatação)
7. ✅ Documentação estar completa e correta

A feature será considerada **REPROVADA** se:

1. ❌ Qualquer teste funcional falhar
2. ❌ Bugs críticos forem encontrados
3. ❌ Middleware permitir acesso indevido a recursos protegidos
4. ❌ Middleware bloquear acesso de usuários autorizados
5. ❌ Erros não forem tratados adequadamente

---

**Última atualização:** 2025-10-27
**Responsável pelos testes:** _[Nome do testador]_
**Data de execução:** _[Preencher após testes]_
