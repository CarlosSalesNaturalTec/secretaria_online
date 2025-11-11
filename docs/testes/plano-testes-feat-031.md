# PLANO DE TESTES - feat-031: Adicionar endpoint de reset de senha para aluno

**Feature:** feat-031 - Adicionar endpoint de reset de senha para aluno
**Grupo:** Backend - API de Usuários e Estudantes
**Data de criação:** 2025-10-28
**Status:** Aguardando execução

---

## 📋 TESTE FUNCIONAL

### Teste 1: Reset de senha com sucesso (Admin)

**Objetivo:** Verificar se um administrador pode resetar a senha de um estudante com sucesso.

**Passos:**
1. Autentique-se como administrador para obter um token JWT.
2. Obtenha o ID de um estudante existente.
3. Envie uma requisição `POST` para o endpoint `/api/students/:id/reset-password`, substituindo `:id` pelo ID do estudante e incluindo o token de admin no header `Authorization`.

   ```bash
   curl -X POST http://localhost:3000/api/students/1/reset-password \
     -H "Authorization: Bearer <seu-token-de-admin>"
   ```

**Resultado Esperado:**
- ✓ O status da resposta HTTP deve ser `200 OK`.
- ✓ O corpo da resposta deve conter um objeto JSON com `success: true` e um campo `data` contendo a `temporaryPassword`.
- ✓ A senha do estudante no banco de dados deve ser atualizada para o novo hash.

**Como verificar:**
- Verifique o corpo da resposta da API.
- Tente fazer login com a senha antiga do estudante (deve falhar).
- Tente fazer login com a nova senha provisória (deve funcionar).

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Tentativa de reset de senha sem autenticação

**Objetivo:** Verificar se o endpoint não permite o reset de senha sem um token de autenticação.

**Passos:**
1. Obtenha o ID de um estudante existente.
2. Envie uma requisição `POST` para o endpoint `/api/students/:id/reset-password` sem o header `Authorization`.

   ```bash
   curl -X POST http://localhost:3000/api/students/1/reset-password
   ```

**Resultado Esperado:**
- ✓ O status da resposta HTTP deve ser `401 Unauthorized`.

**Como verificar:**
- Verifique o status da resposta da API.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Tentativa de reset de senha com perfil não autorizado (Aluno/Professor)

**Objetivo:** Verificar se apenas administradores podem resetar senhas.

**Passos:**
1. Autentique-se como um aluno ou professor para obter um token JWT.
2. Obtenha o ID de um estudante existente.
3. Envie uma requisição `POST` para o endpoint `/api/students/:id/reset-password` com o token de não-admin.

   ```bash
   curl -X POST http://localhost:3000/api/students/1/reset-password \
     -H "Authorization: Bearer <seu-token-de-aluno-ou-professor>"
   ```

**Resultado Esperado:**
- ✓ O status da resposta HTTP deve ser `403 Forbidden`.

**Como verificar:**
- Verifique o status da resposta da API.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 4: Tentativa de reset de senha para um estudante inexistente

**Objetivo:** Verificar se o sistema trata corretamente a tentativa de reset para um ID de estudante que não existe.

**Passos:**
1. Autentique-se como administrador.
2. Envie uma requisição `POST` para o endpoint `/api/students/:id/reset-password` usando um ID que não existe no banco (ex: 9999).

   ```bash
   curl -X POST http://localhost:3000/api/students/9999/reset-password \
     -H "Authorization: Bearer <seu-token-de-admin>"
   ```

**Resultado Esperado:**
- ✓ O status da resposta HTTP deve ser `404 Not Found`.
- ✓ O corpo da resposta deve conter uma mensagem de erro indicando que o estudante não foi encontrado.

**Como verificar:**
- Verifique o status e o corpo da resposta da API.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_
