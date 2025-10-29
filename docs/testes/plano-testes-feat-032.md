# PLANO DE TESTES - feat-032: Criar TeacherController, TeacherService e rotas

**Feature:** feat-032 - Criar TeacherController, TeacherService e rotas
**Grupo:** Backend - API de Usuários e Estudantes
**Data de criação:** 2025-10-28
**Status:** Aguardando execução

---

## 📋 TESTE FUNCIONAL

### Teste 1: Criação de Professor com Sucesso

**Objetivo:** Verificar se um novo professor pode ser criado com dados válidos.

**Passos:**
1. Obter um token de autenticação de um usuário com perfil 'admin'.
2. Enviar uma requisição `POST` para `/api/teachers` com um corpo JSON contendo os dados do novo professor.
   ```bash
   curl -X POST http://localhost:3000/api/teachers \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer <seu_token_admin>" \
   -d 
     {
       "name": "Professor Teste",
       "email": "professor.teste@example.com",
       "login": "prof.teste",
       "cpf": "12345678901",
       "rg": "1234567",
       "mother_name": "Mae do Professor",
       "father_name": "Pai do Professor",
       "address": "Rua dos Professores, 123",
       "title": "Mestre",
       "reservist": "1234567890"
     }
   ```

**Resultado Esperado:**
- ✓ O servidor deve responder com status `201 Created`.
- ✓ O corpo da resposta deve conter os dados do professor criado, incluindo um ID e uma senha temporária.
- ✓ O campo `role` do professor deve ser 'teacher'.
- ✓ A senha no banco de dados deve estar com hash.

**Como verificar:**
- Analisar a resposta da API.
- Consultar a tabela `users` no banco de dados para confirmar a criação do registro.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Listagem de Professores

**Objetivo:** Verificar se a lista de professores é retornada corretamente.

**Passos:**
1. Obter um token de autenticação de um usuário com perfil 'admin'.
2. Enviar uma requisição `GET` para `/api/teachers`.
   ```bash
   curl -X GET http://localhost:3000/api/teachers \
   -H "Authorization: Bearer <seu_token_admin>"
   ```

**Resultado Esperado:**
- ✓ O servidor deve responder com status `200 OK`.
- ✓ O corpo da resposta deve ser um array de objetos, onde cada objeto é um professor.
- ✓ Apenas usuários com `role` 'teacher' devem ser listados.

**Como verificar:**
- Analisar a resposta da API e verificar se todos os professores cadastrados são retornados.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Obtenção de Professor por ID

**Objetivo:** Verificar se um professor específico pode ser obtido pelo seu ID.

**Passos:**
1. Obter um token de autenticação de um usuário com perfil 'admin'.
2. Obter o ID de um professor existente.
3. Enviar uma requisição `GET` para `/api/teachers/:id`, substituindo `:id` pelo ID do professor.
   ```bash
   curl -X GET http://localhost:3000/api/teachers/1 \
   -H "Authorization: Bearer <seu_token_admin>"
   ```

**Resultado Esperado:**
- ✓ O servidor deve responder com status `200 OK`.
- ✓ O corpo da resposta deve conter os dados do professor solicitado.

**Como verificar:**
- Analisar a resposta da API.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 4: Atualização de Professor

**Objetivo:** Verificar se os dados de um professor podem ser atualizados.

**Passos:**
1. Obter um token de autenticação de um usuário com perfil 'admin'.
2. Obter o ID de um professor existente.
3. Enviar uma requisição `PUT` para `/api/teachers/:id` com os dados a serem atualizados.
   ```bash
   curl -X PUT http://localhost:3000/api/teachers/1 \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer <seu_token_admin>" \
   -d 
     {
       "name": "Professor Teste Atualizado",
       "address": "Nova Rua dos Professores, 456"
     }
   ```

**Resultado Esperado:**
- ✓ O servidor deve responder com status `200 OK`.
- ✓ O corpo da resposta deve conter os dados do professor atualizado.
- ✓ O campo `role` não deve ser alterado, mesmo que enviado no corpo da requisição.

**Como verificar:**
- Analisar a resposta da API.
- Consultar o banco de dados para confirmar a atualização.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5: Exclusão de Professor

**Objetivo:** Verificar se um professor pode ser excluído.

**Passos:**
1. Obter um token de autenticação de um usuário com perfil 'admin'.
2. Obter o ID de um professor existente.
3. Enviar uma requisição `DELETE` para `/api/teachers/:id`.
   ```bash
   curl -X DELETE http://localhost:3000/api/teachers/1 \
   -H "Authorization: Bearer <seu_token_admin>"
   ```

**Resultado Esperado:**
- ✓ O servidor deve responder com status `204 No Content`.
- ✓ O professor não deve mais ser encontrado no banco de dados.

**Como verificar:**
- Tentar obter o professor pelo ID novamente (deve retornar 404).
- Consultar o banco de dados.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔒 TESTE DE SEGURANÇA

### Teste 6: Acesso não autorizado

**Objetivo:** Verificar se usuários sem perfil 'admin' não podem acessar as rotas de professores.

**Passos:**
1. Obter um token de autenticação de um usuário com perfil 'student' ou 'teacher'.
2. Tentar executar qualquer uma das requisições dos testes anteriores (criar, listar, obter, atualizar, deletar).

**Resultado Esperado:**
- ✓ O servidor deve responder com status `403 Forbidden` para todas as tentativas.

**Como verificar:**
- Analisar a resposta da API.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_
