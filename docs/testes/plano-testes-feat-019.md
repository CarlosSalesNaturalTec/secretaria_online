# PLANO DE TESTES - feat-019: Criar AuthController e rotas de autenticação

**Feature:** feat-019 - Criar AuthController e rotas de autenticação
**Grupo:** Autenticação e Autorização
**Data de criação:** 2025-10-27
**Status:** Aguardando execução

---

## 🔧 PREPARAÇÃO DO AMBIENTE

### Pré-requisitos

Certifique-se que o ambiente está configurado:

```bash
# Inicie o servidor de backend
cd backend
npm run dev
```

**Esperado:** "🚀 Server is running on port 3000"

---

## 📋 TESTE FUNCIONAL

### Teste 1: Login com Credenciais Válidas

**Objetivo:** Verificar se um usuário consegue se autenticar com login e senha corretos.

**Passos:**
1.  Faça uma requisição POST para `http://localhost:3000/api/v1/auth/login` com o seguinte corpo:
    ```json
    {
      "login": "admin",
      "password": "admin123"
    }
    ```

**Resultado Esperado:**
- ✓ Status code `200 OK`
- ✓ Resposta contém `accessToken` e `refreshToken`

**Como verificar:**
- Use uma ferramenta como o Postman ou `curl` para fazer a requisição.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTE DE VALIDAÇÃO

### Teste 2: Login com Senha Incorreta

**Input:**
```json
{
  "login": "admin",
  "password": "wrongpassword"
}
```
**Método:** Requisição POST para `http://localhost:3000/api/v1/auth/login`

**Esperado:**
- ✓ Status code `401 Unauthorized`
- ✓ Mensagem de erro "Credenciais inválidas."

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

### Teste 3: Login com Usuário Inexistente

**Input:**
```json
{
  "login": "nonexistentuser",
  "password": "anypassword"
}
```
**Método:** Requisição POST para `http://localhost:3000/api/v1/auth/login`

**Esperado:**
- ✓ Status code `401 Unauthorized`
- ✓ Mensagem de erro "Credenciais inválidas."

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔗 TESTE DE INTEGRAÇÃO

### Teste 4: Logout (Simulado)

**Objetivo:** Verificar se o endpoint de logout responde corretamente.

**Passos:**
1.  Faça uma requisição POST para `http://localhost:3000/api/v1/auth/logout`

**Resultado Esperado:**
- ✓ Status code `200 OK`
- ✓ Mensagem "Logout realizado com sucesso."

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_
