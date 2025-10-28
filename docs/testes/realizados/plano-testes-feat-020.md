# PLANO DE TESTES - feat-020: Criar middleware de autenticação JWT

**Feature:** feat-020 - Criar middleware de autenticação JWT
**Grupo:** Autenticação e Autorização
**Data de criação:** 2025-10-27
**Status:** Aguardando execução

---

## 🔧 PREPARAÇÃO DO AMBIENTE

### Pré-requisitos

1.  Certifique-se de que o backend está configurado corretamente (`.env` preenchido, `npm install` executado).
2.  O banco de dados deve estar populado com pelo menos um usuário para gerar um token de teste.
3.  Você precisará de uma ferramenta para fazer requisições HTTP, como `curl`, Postman ou Insomnia.
4.  Você precisará de um token JWT válido. Para obter um, faça uma requisição de login para o endpoint `POST /api/v1/auth/login` (feat-019) com credenciais válidas.

### Execução

Inicie o servidor de desenvolvimento do backend:

```bash
# No diretório /backend
npm run dev
```

**Esperado:** O servidor deve iniciar sem erros, exibindo uma mensagem como:
`[INFO] Server is running on http://localhost:3000`

---

## 📋 TESTE FUNCIONAL

### Teste 1: Acesso a Rota Protegida com Token Válido

**Objetivo:** Verificar se o middleware permite o acesso a uma rota protegida quando um token JWT válido é fornecido no header `Authorization`.

**Passos:**
1.  Obtenha um token JWT válido de um usuário existente (ex: via endpoint de login).
2.  Crie uma rota de teste temporária no backend que utilize o middleware, por exemplo, em `backend/src/routes/index.js`:
    ```javascript
    // Adicione esta rota para teste
    const authenticate = require('../middlewares/auth.middleware');
    router.get('/api/v1/test-protected', authenticate, (req, res) => {
      res.json({ success: true, user: req.user });
    });
    ```
3.  Faça uma requisição `GET` para `http://localhost:3000/api/v1/test-protected`, incluindo o header `Authorization`.

    ```bash
    # Substitua SEU_TOKEN_VALIDO pelo token obtido no passo 1
    curl -X GET http://localhost:3000/api/v1/test-protected \
      -H "Authorization: Bearer SEU_TOKEN_VALIDO"
    ```

**Resultado Esperado:**
- ✓ Status Code: `200 OK`
- ✓ O corpo da resposta deve ser um JSON contendo `success: true` e os dados do usuário do token.
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "role": "admin",
      "email": "admin@secretariaonline.com",
      "iat": 1678886400,
      "exp": 1678887300
    }
  }
  ```

**Como verificar:**
- Analise a resposta da requisição `curl`.
- Verifique se o corpo da resposta contém o payload decodificado do token no campo `user`.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTES DE VALIDAÇÃO DE ERRO

### Teste 2: Acesso Sem Token de Autenticação

**Objetivo:** Verificar se o middleware bloqueia o acesso quando o header `Authorization` não é fornecido.

**Passos:**
1.  Faça uma requisição `GET` para a rota protegida `http://localhost:3000/api/v1/test-protected` sem o header `Authorization`.

    ```bash
    curl -X GET http://localhost:3000/api/v1/test-protected
    ```

**Resultado Esperado:**
- ✓ Status Code: `401 Unauthorized`
- ✓ O corpo da resposta deve conter o código de erro `TOKEN_NOT_PROVIDED`.
  ```json
  {
    "success": false,
    "error": {
      "code": "TOKEN_NOT_PROVIDED",
      "message": "Token de autenticação não fornecido."
    }
  }
  ```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---


### Teste 3: Acesso com Token Malformado (Sem "Bearer")

**Objetivo:** Verificar se o middleware bloqueia o acesso quando o token não segue o formato "Bearer <token>".

**Passos:**
1.  Faça uma requisição `GET` para a rota protegida, enviando o token diretamente no header.

    ```bash
    # Enviando apenas o token, sem o prefixo "Bearer "
    curl -X GET http://localhost:3000/api/v1/test-protected \
      -H "Authorization: SEU_TOKEN_VALIDO"
    ```

**Resultado Esperado:**
- ✓ Status Code: `401 Unauthorized`
- ✓ O corpo da resposta deve conter o código de erro `TOKEN_MALFORMED`.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---


### Teste 4: Acesso com Token Inválido (Assinatura Incorreta)

**Objetivo:** Verificar se o middleware bloqueia o acesso quando o token JWT tem uma assinatura inválida.

**Passos:**
1.  Pegue um token JWT válido e modifique qualquer caractere no final dele.
2.  Faça uma requisição `GET` para a rota protegida com o token modificado.

    ```bash
    # Token com o último caractere alterado
    curl -X GET http://localhost:3000/api/v1/test-protected \
      -H "Authorization: Bearer SEU_TOKEN_VALIDO_MAS_ALTERADO"
    ```

**Resultado Esperado:**
- ✓ Status Code: `401 Unauthorized`
- ✓ O corpo da resposta deve conter o código de erro `TOKEN_INVALID`.
  ```json
  {
    "success": false,
    "error": {
      "code": "TOKEN_INVALID",
      "message": "Token de autenticação inválido."
    }
  }
  ```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---


### Teste 5: Acesso com Token Expirado

**Objetivo:** Verificar se o middleware bloqueia o acesso quando o token JWT está expirado.

**Passos:**
1.  Gere um token JWT com um tempo de expiração muito curto (ex: 1 segundo). Você pode fazer isso modificando temporariamente `config/auth.js`.
    ```javascript
    // Em backend/src/config/auth.js
    module.exports = {
      secret: process.env.JWT_SECRET,
      expiresIn: '1s', // Altere para 1 segundo para o teste
    };
    ```
2.  Faça o login para obter o token.
3.  Aguarde 2 segundos.
4.  Faça uma requisição `GET` para a rota protegida com o token expirado.

**Resultado Esperado:**
- ✓ Status Code: `401 Unauthorized`
- ✓ O corpo da resposta deve conter o código de erro `TOKEN_EXPIRED`.
  ```json
  {
    "success": false,
    "error": {
      "code": "TOKEN_EXPIRED",
      "message": "Token de autenticação expirado."
    }
  }
  ```
**Nota:** Lembre-se de reverter a alteração no `config/auth.js` após o teste.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---


## 🔗 TESTE DE INTEGRAÇÃO

### Teste 6: Verificação do objeto `req.user`

**Objetivo:** Verificar se o middleware anexa corretamente o payload decodificado do token ao objeto `req.user` para uso nos próximos middlewares ou controllers.

**Como verificar:**
- Reutilize o **Teste 1 (Acesso com Token Válido)**.
- No controller da rota de teste, adicione um `console.log(req.user)` antes de enviar a resposta.
  ```javascript
  // Em backend/src/routes/index.js
  router.get('/api/v1/test-protected', authenticate, (req, res) => {
    console.log('Conteúdo de req.user:', req.user); // Adicione este log
    res.json({ success: true, user: req.user });
  });
  ```
- Execute o Teste 1 novamente.
- Verifique o console do servidor backend.

**Esperado:**
- ✓ O console do servidor deve exibir o objeto `req.user` com os dados do payload do token.
  ```
  Conteúdo de req.user: {
    id: 1,
    role: 'admin',
    email: 'admin@secretariaonline.com',
    iat: 1678886400,
    exp: 1678887300
  }
  ```
- ✓ A resposta da API deve conter o mesmo objeto.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_
