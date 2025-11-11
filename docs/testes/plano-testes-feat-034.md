# PLANO DE TESTES - feat-034: Adicionar endpoint para vincular disciplinas a curso

**Feature:** feat-034 - Adicionar endpoint para vincular disciplinas a curso
**Grupo:** Backend - API de Cursos e Turmas
**Data de criação:** 2025-10-29
**Status:** Aguardando execução

---

## 📋 TESTE FUNCIONAL

### Teste 1: Vincular disciplina a um curso com sucesso

**Objetivo:** Verificar se é possível vincular uma disciplina existente a um curso existente com sucesso.

**Passos:**
1.  Obter um token de autenticação de um usuário com perfil de `admin`.
2.  Executar a seguinte requisição `POST` para a API, substituindo `:id` pelo ID de um curso existente e `disciplineId` pelo ID de uma disciplina existente:

    ```bash
    curl -X POST http://localhost:3000/api/v1/courses/:id/disciplines \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <seu-token-admin>" \
    -d '{
      "disciplineId": 1,
      "semester": 1
    }'
    ```

**Resultado Esperado:**
- ✓ A API deve retornar o status `201 Created`.
- ✓ O corpo da resposta deve conter o objeto da associação criada, com `course_id`, `discipline_id` e `semester`.
- ✓ A associação deve ser salva na tabela `course_disciplines` do banco de dados.

**Como verificar:**
- Verificar o status da resposta e o corpo da resposta.
- Consultar a tabela `course_disciplines` no banco de dados para confirmar a nova entrada.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Tentar vincular disciplina a um curso inexistente

**Objetivo:** Verificar se a API retorna um erro apropriado ao tentar vincular uma disciplina a um curso que não existe.

**Passos:**
1.  Obter um token de autenticação de um usuário com perfil de `admin`.
2.  Executar a seguinte requisição `POST` para a API, utilizando um ID de curso que não existe (ex: 999):

    ```bash
    curl -X POST http://localhost:3000/api/v1/courses/999/disciplines \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <seu-token-admin>" \
    -d '{
      "disciplineId": 1,
      "semester": 1
    }'
    ```

**Resultado Esperado:**
- ✓ A API deve retornar o status `404 Not Found` ou um erro similar indicando que o curso não foi encontrado.
- ✓ O corpo da resposta deve conter uma mensagem de erro clara.

**Como verificar:**
- Verificar o status da resposta e a mensagem de erro.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Tentar vincular uma disciplina inexistente a um curso

**Objetivo:** Verificar se a API retorna um erro apropriado ao tentar vincular uma disciplina que não existe a um curso.

**Passos:**
1.  Obter um token de autenticação de um usuário com perfil de `admin`.
2.  Executar a seguinte requisição `POST` para a API, utilizando um ID de disciplina que não existe (ex: 999):

    ```bash
    curl -X POST http://localhost:3000/api/v1/courses/:id/disciplines \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <seu-token-admin>" \
    -d '{
      "disciplineId": 999,
      "semester": 1
    }'
    ```

**Resultado Esperado:**
- ✓ A API deve retornar o status `404 Not Found` ou um erro similar indicando que a disciplina não foi encontrada.
- ✓ O corpo da resposta deve conter uma mensagem de erro clara.

**Como verificar:**
- Verificar o status da resposta e a mensagem de erro.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 4: Desvincular disciplina de um curso com sucesso

**Objetivo:** Verificar se é possível desvincular uma disciplina de um curso com sucesso.

**Passos:**
1.  Garantir que existe uma disciplina vinculada a um curso.
2.  Obter um token de autenticação de um usuário com perfil de `admin`.
3.  Executar a seguinte requisição `DELETE` para a API, substituindo `:id` pelo ID do curso e `:disciplineId` pelo ID da disciplina vinculada:

    ```bash
    curl -X DELETE http://localhost:3000/api/v1/courses/:id/disciplines/:disciplineId \
    -H "Authorization: Bearer <seu-token-admin>"
    ```

**Resultado Esperado:**
- ✓ A API deve retornar o status `204 No Content`.
- ✓ A associação deve ser removida da tabela `course_disciplines` do banco de dados.

**Como verificar:**
- Verificar o status da resposta.
- Consultar a tabela `course_disciplines` no banco de dados para confirmar que a entrada foi removida.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5: Tentar desvincular uma associação inexistente

**Objetivo:** Verificar se a API retorna um erro apropriado ao tentar desvincular uma disciplina que não está associada a um curso.

**Passos:**
1.  Obter um token de autenticação de um usuário com perfil de `admin`.
2.  Executar a seguinte requisição `DELETE` para a API, utilizando um ID de disciplina que não está vinculada ao curso:

    ```bash
    curl -X DELETE http://localhost:3000/api/v1/courses/:id/disciplines/999 \
    -H "Authorization: Bearer <seu-token-admin>"
    ```

**Resultado Esperado:**
- ✓ A API deve retornar o status `404 Not Found`.
- ✓ O corpo da resposta deve conter uma mensagem de erro indicando que a associação não foi encontrada.

**Como verificar:**
- Verificar o status da resposta e a mensagem de erro.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔒 TESTE DE SEGURANÇA

### Teste 6: Tentar acessar os endpoints sem autenticação

**Objetivo:** Verificar se os endpoints estão protegidos e não podem ser acessados sem um token de autenticação.

**Passos:**
1.  Executar as requisições `POST` e `DELETE` dos testes anteriores sem o header `Authorization`.

**Resultado Esperado:**
- ✓ A API deve retornar o status `401 Unauthorized` para ambas as requisições.

**Como verificar:**
- Verificar o status da resposta.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---


### Teste 7: Tentar acessar os endpoints com um perfil não autorizado (ex: aluno)

**Objetivo:** Verificar se apenas usuários com perfil de `admin` podem acessar os endpoints.

**Passos:**
1.  Obter um token de autenticação de um usuário com perfil de `student` ou `teacher`.
2.  Executar as requisições `POST` e `DELETE` dos testes anteriores com o token não autorizado.

**Resultado Esperado:**
- ✓ A API deve retornar o status `403 Forbidden` para ambas as requisições.

**Como verificar:**
- Verificar o status da resposta.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_
