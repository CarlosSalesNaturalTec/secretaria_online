# PLANO DE TESTES - feat-030: Criar StudentController e StudentService

**Feature:** feat-030 - Criar StudentController e StudentService
**Grupo:** Backend - API de Usuários e Estudantes
**Data de criação:** 2025-10-28
**Status:** Aguardando execução

---

## 📋 TESTE FUNCIONAL

### Teste 1: Criação de Estudante com Sucesso

**Objetivo:** Verificar se um novo estudante pode ser criado com dados válidos por um usuário administrador.

**Passos:**
1.  Obter um token de autenticação de um usuário com perfil `admin`.
2.  Enviar uma requisição `POST` para `/api/students` com o seguinte corpo:
    ```json
    {
      "name": "Aluno Teste",
      "email": "aluno.teste@example.com",
      "cpf": "12345678901",
      "rg": "1234567",
      "mother_name": "Mae Aluno Teste",
      "father_name": "Pai Aluno Teste",
      "address": "Rua Teste, 123",
      "login": "aluno.teste"
    }
    ```
3.  Verificar o status da resposta.
4.  Verificar o corpo da resposta.
5.  Verificar no banco de dados se o usuário foi criado corretamente.

**Resultado Esperado:**
- ✓ Status da resposta: `201 Created`
- ✓ O corpo da resposta contém os dados do estudante criado, incluindo um `id` e `role` igual a `student`.
- ✓ A senha não deve ser retornada na resposta.
- ✓ No banco de dados, o usuário existe na tabela `users` com `role = 'student'` e o campo `password_hash` não está vazio.

**Como verificar:**
- Executar a requisição `curl` ou usar um cliente de API (Postman, Insomnia).
- Executar a query `SELECT * FROM users WHERE email = 'aluno.teste@example.com';` no banco de dados.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Tentativa de Criação de Estudante com Email Duplicado

**Objetivo:** Verificar se o sistema impede a criação de um estudante com um email que já existe.

**Passos:**
1.  Garantir que um estudante com o email `aluno.existente@example.com` já exista no banco.
2.  Obter um token de autenticação de um usuário com perfil `admin`.
3.  Enviar uma requisição `POST` para `/api/students` com o seguinte corpo:
    ```json
    {
      "name": "Aluno Duplicado",
      "email": "aluno.existente@example.com",
      "cpf": "10987654321",
      "rg": "7654321",
      "mother_name": "Mae Aluno Duplicado",
      "father_name": "Pai Aluno Duplicado",
      "address": "Rua Duplicada, 456",
      "login": "aluno.duplicado"
    }
    ```
4.  Verificar o status da resposta.
5.  Verificar o corpo da resposta.

**Resultado Esperado:**
- ✓ Status da resposta: `409 Conflict`
- ✓ O corpo da resposta contém uma mensagem de erro indicando que o email já está em uso.

**Como verificar:**
- Executar a requisição `curl` ou usar um cliente de API.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Listagem de Todos os Estudantes

**Objetivo:** Verificar se a rota `GET /api/students` retorna uma lista de todos os usuários com `role` de `student`.

**Passos:**
1.  Obter um token de autenticação de um usuário com perfil `admin`.
2.  Enviar uma requisição `GET` para `/api/students`.
3.  Verificar o status da resposta.
4.  Verificar o corpo da resposta.

**Resultado Esperado:**
- ✓ Status da resposta: `200 OK`
- ✓ O corpo da resposta é um array de objetos.
- ✓ Cada objeto no array representa um estudante e possui a propriedade `role` com o valor `student`.
- ✓ A propriedade `password_hash` não deve estar presente em nenhum dos objetos.

**Como verificar:**
- Executar a requisição `curl` ou usar um cliente de API.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 4: Obtenção de Estudante por ID

**Objetivo:** Verificar se é possível obter os dados de um estudante específico pelo seu ID.

**Passos:**
1.  Obter o `id` de um estudante existente no banco de dados.
2.  Obter um token de autenticação de um usuário com perfil `admin`.
3.  Enviar uma requisição `GET` para `/api/students/{id}`, substituindo `{id}` pelo ID obtido.
4.  Verificar o status da resposta.
5.  Verificar o corpo da resposta.

**Resultado Esperado:**
- ✓ Status da resposta: `200 OK`
- ✓ O corpo da resposta contém os dados do estudante correspondente ao ID.
- ✓ A propriedade `password_hash` não deve estar presente.

**Como verificar:**
- Executar a requisição `curl` ou usar um cliente de API.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5: Atualização de Estudante com Sucesso

**Objetivo:** Verificar se os dados de um estudante podem ser atualizados corretamente.

**Passos:**
1.  Obter o `id` de um estudante existente.
2.  Obter um token de autenticação de um usuário com perfil `admin`.
3.  Enviar uma requisição `PUT` para `/api/students/{id}` com o seguinte corpo:
    ```json
    {
      "name": "Aluno Teste Atualizado",
      "address": "Novo Endereco, 789"
    }
    ```
4.  Verificar o status da resposta.
5.  Verificar o corpo da resposta.
6.  Verificar no banco de dados se os dados foram atualizados.

**Resultado Esperado:**
- ✓ Status da resposta: `200 OK`
- ✓ O corpo da resposta contém os dados atualizados do estudante.
- ✓ No banco de dados, o nome e o endereço do estudante foram alterados.

**Como verificar:**
- Executar a requisição `curl` ou usar um cliente de API.
- Executar a query `SELECT name, address FROM users WHERE id = {id};` no banco de dados.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6: Exclusão de Estudante

**Objetivo:** Verificar se um estudante pode ser excluído (soft delete).

**Passos:**
1.  Obter o `id` de um estudante existente.
2.  Obter um token de autenticação de um usuário com perfil `admin`.
3.  Enviar uma requisição `DELETE` para `/api/students/{id}`.
4.  Verificar o status da resposta.
5.  Verificar no banco de dados se o campo `deleted_at` foi preenchido para o estudante.

**Resultado Esperado:**
- ✓ Status da resposta: `204 No Content`
- ✓ No banco de dados, a coluna `deleted_at` para o usuário com o ID correspondente não é `NULL`.

**Como verificar:**
- Executar a requisição `curl` ou usar um cliente de API.
- Executar a query `SELECT deleted_at FROM users WHERE id = {id};` no banco de dados.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔒 TESTE DE SEGURANÇA

### Teste 7: Acesso às Rotas de Estudante sem Autenticação

**Objetivo:** Verificar se as rotas de estudante estão protegidas e não podem ser acessadas sem um token JWT válido.

**Passos:**
1.  Enviar uma requisição `GET` para `/api/students` sem o header `Authorization`.
2.  Enviar uma requisição `POST` para `/api/students` com dados válidos, mas sem o header `Authorization`.

**Resultado Esperado:**
- ✓ Status da resposta para ambas as requisições: `401 Unauthorized`
- ✓ O corpo da resposta contém uma mensagem de erro sobre a falta de autenticação.

**Como verificar:**
- Executar as requisições `curl` ou usar um cliente de API.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 8: Acesso às Rotas de Estudante com Perfil de Aluno/Professor

**Objetivo:** Verificar se apenas usuários com perfil `admin` podem acessar as rotas de gerenciamento de estudantes.

**Passos:**
1.  Obter um token de autenticação de um usuário com perfil `student` ou `teacher`.
2.  Enviar uma requisição `GET` para `/api/students` com o token obtido.
3.  Enviar uma requisição `POST` para `/api/students` com dados válidos e com o token obtido.

**Resultado Esperado:**
- ✓ Status da resposta para ambas as requisições: `403 Forbidden`
- ✓ O corpo da resposta contém uma mensagem de erro indicando que o usuário não tem permissão.

**Como verificar:**
- Executar as requisições `curl` ou usar um cliente de API.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_
