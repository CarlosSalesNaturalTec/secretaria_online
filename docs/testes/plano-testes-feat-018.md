
# PLANO DE TESTES - feat-018: Criar AuthService com lógica de autenticação

**Feature:** feat-018 - Criar AuthService com lógica de autenticação
**Grupo:** Autenticação e Autorização
**Data de criação:** 2025-10-27
**Status:** Aguardando execução

---

## 🔧 PREPARAÇÃO DO AMBIENTE

### Pré-requisitos

Certifique-se que o ambiente está configurado e o banco de dados populado com o usuário admin.

```bash
# Inicie o servidor de backend
cd backend
npm run dev
```

**Esperado:** O servidor deve iniciar sem erros e exibir a mensagem "Server is running on port XXXX".

---

## 📋 TESTE FUNCIONAL

### Teste 1: Login com Credenciais Válidas

**Objetivo:** Verificar se um usuário consegue se autenticar com login e senha corretos.

**Passos:**
1.  Use uma ferramenta de API (Postman, Insomnia, ou cURL) para fazer uma requisição `POST` para o endpoint de login (que será criado na feat-019).
2.  No corpo da requisição, envie as credenciais do usuário admin criado pelo seeder:
    ```json
    {
      "login": "admin",
      "password": "admin123"
    }
    ```

**Resultado Esperado:**
- ✓ A API deve retornar um status `200 OK`.
- ✓ O corpo da resposta deve conter um objeto com as informações do usuário (sem a senha) e uma propriedade `token`.
- ✓ O `token` deve ser um JWT válido.

**Como verificar:**
- Verifique o status da resposta.
- Copie o token JWT e cole em um decodificador online (como jwt.io) para verificar se o payload contém o `id` e `role` do usuário.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Login com Senha Incorreta

**Objetivo:** Verificar se o sistema nega o acesso quando a senha está incorreta.

**Passos:**
1.  Faça uma requisição `POST` para o endpoint de login.
2.  Envie um login válido com uma senha incorreta:
    ```json
    {
      "login": "admin",
      "password": "wrongpassword"
    }
    ```

**Resultado Esperado:**
- ✓ A API deve retornar um status de erro (ex: `401 Unauthorized` ou `400 Bad Request`).
- ✓ O corpo da resposta deve conter uma mensagem de erro clara, como "Senha inválida".

**Como verificar:**
- Verifique o status da resposta e a mensagem de erro.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Login com Usuário Inexistente

**Objetivo:** Verificar se o sistema nega o acesso quando o usuário não existe.

**Passos:**
1.  Faça uma requisição `POST` para o endpoint de login.
2.  Envie um login que não existe no banco de dados:
    ```json
    {
      "login": "nonexistentuser",
      "password": "anypassword"
    }
    ```

**Resultado Esperado:**
- ✓ A API deve retornar um status de erro (ex: `404 Not Found` ou `400 Bad Request`).
- ✓ O corpo da resposta deve conter uma mensagem de erro clara, como "Usuário não encontrado".

**Como verificar:**
- Verifique o status da resposta e a mensagem de erro.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTE DE VALIDAÇÃO

### Teste 4: Troca de Senha com Senha Antiga Correta

**Objetivo:** Verificar se o usuário consegue alterar sua senha fornecendo a senha antiga corretamente.

**Passos:**
1.  Obtenha um token JWT válido para o usuário admin (do Teste 1).
2.  Faça uma requisição `POST` para o endpoint de troca de senha (que será criado na feat-019), incluindo o token na autorização.
3.  Envie a senha antiga e a nova senha no corpo da requisição:
    ```json
    {
      "oldPassword": "admin123",
      "newPassword": "newAdminPassword"
    }
    ```

**Resultado Esperado:**
- ✓ A API deve retornar um status `200 OK` ou `204 No Content`.
- ✓ O usuário deve conseguir fazer login com a nova senha ("newAdminPassword").
- ✓ O login com a senha antiga ("admin123") deve falhar.

**Como verificar:**
- Após a troca, tente executar o Teste 1 com a nova senha. Deve passar.
- Tente executar o Teste 1 com a senha antiga. Deve falhar.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Lembre-se de trocar a senha de volta para "admin123" para os próximos testes]_

---

### Teste 5: Troca de Senha com Senha Antiga Incorreta

**Objetivo:** Verificar se o sistema impede a troca de senha se a senha antiga estiver incorreta.

**Passos:**
1.  Obtenha um token JWT válido.
2.  Faça uma requisição `POST` para o endpoint de troca de senha.
3.  Envie uma senha antiga incorreta:
    ```json
    {
      "oldPassword": "wrongOldPassword",
      "newPassword": "anotherNewPassword"
    }
    ```

**Resultado Esperado:**
- ✓ A API deve retornar um status de erro (ex: `400 Bad Request`).
- ✓ O corpo da resposta deve conter uma mensagem de erro clara, como "Senha antiga inválida".
- ✓ A senha do usuário não deve ser alterada.

**Como verificar:**
- Verifique o status da resposta e a mensagem de erro.
- Tente fazer login com a senha original ("admin123"). Deve funcionar.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔗 TESTE DE INTEGRAÇÃO

### Teste 6: Validação de Token Válido

**Objetivo:** Verificar se o método `validateToken` reconhece um token JWT válido.

**Método:** Este teste é mais conceitual para a lógica do serviço e será validado pelo middleware na `feat-020`.
1.  Obtenha um token JWT válido do Teste 1.
2.  Em uma rota protegida (a ser criada), o middleware de autenticação usará o `AuthService.validateToken`.

**Esperado:**
- ✓ A rota protegida deve ser acessada com sucesso.
- ✓ O payload decodificado do token (com `id` e `role`) deve estar disponível na requisição.

**Como verificar:**
- O acesso a endpoints protegidos deve funcionar normalmente ao passar o token no header `Authorization`.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Este teste depende da implementação do middleware de autenticação]_

---

### Teste 7: Validação de Token Inválido/Expirado

**Objetivo:** Verificar se o sistema rejeita tokens inválidos ou expirados.

**Passos:**
1.  Tente acessar uma rota protegida com um token JWT inválido (ex: uma string aleatória).
2.  Tente acessar uma rota protegida com um token JWT expirado (pode-se diminuir o tempo de expiração em `config/auth.js` para testar).

**Esperado:**
- ✓ A API deve retornar um status `401 Unauthorized`.
- ✓ O corpo da resposta deve conter uma mensagem de erro como "Token inválido".

**Como verificar:**
- Verifique o status da resposta e a mensagem de erro.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_
