# PLANO DE TESTES - feat-027: Criar middleware de tratamento de erros

**Feature:** feat-027 - Criar middleware de tratamento de erros
**Grupo:** Backend - Middlewares e Utilitários
**Data de criação:** 2025-10-28
**Status:** Aguardando execução

---

## 📋 TESTE FUNCIONAL

### Teste 1 - AppError: Criação de erro operacional básico

**Objetivo:** Verificar se a classe AppError cria erros operacionais corretamente com statusCode, code e flag isOperational

**Passos:**
1. Navegue até o diretório backend:
   ```bash
   cd backend
   ```

2. Crie um arquivo de teste temporário `test-error.js`:
   ```javascript
   const { AppError } = require('./src/middlewares/error.middleware');

   const error = new AppError('CPF inválido', 400, 'VALIDATION_ERROR');

   console.log('Message:', error.message);
   console.log('StatusCode:', error.statusCode);
   console.log('Code:', error.code);
   console.log('isOperational:', error.isOperational);
   console.log('Name:', error.name);
   ```

3. Execute o arquivo:
   ```bash
   node test-error.js
   ```

4. Remova o arquivo de teste:
   ```bash
   rm test-error.js
   ```

**Resultado Esperado:**
- ✓ Message deve ser: "CPF inválido"
- ✓ StatusCode deve ser: 400
- ✓ Code deve ser: "VALIDATION_ERROR"
- ✓ isOperational deve ser: true
- ✓ Name deve ser: "AppError"

**Como verificar:**
- A saída do console deve exibir todas as propriedades corretamente
- Nenhum erro deve ocorrer durante a execução

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2 - AppError: Erro com detalhes adicionais

**Objetivo:** Verificar se a classe AppError aceita e armazena detalhes adicionais (ex: erros de validação)

**Passos:**
1. Crie arquivo de teste `test-error-details.js`:
   ```javascript
   const { AppError } = require('./src/middlewares/error.middleware');

   const details = [
     { field: 'cpf', message: 'CPF deve ter 11 dígitos' },
     { field: 'email', message: 'Email inválido' }
   ];

   const error = new AppError('Dados inválidos', 400, 'VALIDATION_ERROR', details);

   console.log('Details:', JSON.stringify(error.details, null, 2));
   ```

2. Execute:
   ```bash
   node test-error-details.js
   ```

3. Remova o arquivo:
   ```bash
   rm test-error-details.js
   ```

**Resultado Esperado:**
- ✓ Detalhes devem ser armazenados como array de objetos
- ✓ Cada detalhe deve ter os campos `field` e `message`

**Como verificar:**
- A saída deve exibir o array de detalhes formatado em JSON

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3 - errorHandler: Erro operacional retorna resposta padronizada

**Objetivo:** Verificar se o errorHandler processa corretamente erros operacionais e retorna JSON padronizado

**Passos:**
1. Inicie o servidor backend em modo desenvolvimento:
   ```bash
   cd backend
   npm run dev
   ```

2. Em outro terminal, faça uma requisição para uma rota inexistente (que dispara notFoundHandler):
   ```bash
   curl -X GET http://localhost:3000/api/v1/rota-inexistente
   ```

3. Observe a resposta JSON

**Resultado Esperado:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Rota não encontrada: GET /api/v1/rota-inexistente"
  }
}
```

**Como verificar:**
- ✓ Status HTTP deve ser 404
- ✓ Resposta deve ter estrutura JSON padronizada com `success: false`
- ✓ Campo `error.code` deve ser "NOT_FOUND"
- ✓ Campo `error.message` deve conter método e URL da rota

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 4 - errorHandler: Log de erro operacional com Winston

**Objetivo:** Verificar se erros operacionais são logados corretamente como `warn` no Winston

**Passos:**
1. Certifique-se que o servidor está rodando:
   ```bash
   cd backend
   npm run dev
   ```

2. Faça requisição para rota inexistente:
   ```bash
   curl -X GET http://localhost:3000/api/v1/teste-erro
   ```

3. Verifique os logs do servidor no terminal (console)

4. Se `LOG_TO_FILE=true` no `.env`, verifique o arquivo de log:
   ```bash
   tail -n 20 logs/combined.log
   ```

**Resultado Esperado:**
- ✓ Log deve aparecer no console com nível `warn`
- ✓ Log deve conter:
  - `code: 'NOT_FOUND'`
  - `message: 'Rota não encontrada...'`
  - `url: '/api/v1/teste-erro'`
  - `method: 'GET'`
  - `timestamp`

**Como verificar:**
- Console deve exibir log amarelo (warn level)
- Arquivo `combined.log` deve conter entrada com `"level":"warn"`

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5 - errorHandler: Erro não operacional em desenvolvimento

**Objetivo:** Verificar se erros não operacionais (bugs) retornam stack trace em ambiente de desenvolvimento

**Passos:**
1. No arquivo `.env`, certifique-se que:
   ```env
   NODE_ENV=development
   ```

2. Crie uma rota de teste que dispara erro não operacional em `backend/src/routes/index.js`:
   ```javascript
   router.get('/test-error', (req, res) => {
     // Erro não operacional (bug simulado)
     throw new Error('Erro de teste não operacional');
   });
   ```

3. Reinicie o servidor:
   ```bash
   npm run dev
   ```

4. Faça requisição:
   ```bash
   curl http://localhost:3000/api/v1/test-error
   ```

5. Remova a rota de teste após validação

**Resultado Esperado:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Erro de teste não operacional",
    "stack": "Error: Erro de teste não operacional\n    at ..."
  }
}
```

**Como verificar:**
- ✓ Status HTTP deve ser 500
- ✓ Resposta deve incluir campo `error.stack` (apenas em desenvolvimento)
- ✓ Console deve exibir log `error` com stack trace completo

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6 - errorHandler: Erro não operacional em produção

**Objetivo:** Verificar se erros não operacionais retornam mensagem genérica em produção (sem expor stack trace)

**Passos:**
1. No arquivo `.env`, altere temporariamente para:
   ```env
   NODE_ENV=production
   ```

2. Mantenha a rota de teste do Teste 5 (ou crie novamente se já removeu)

3. Reinicie o servidor:
   ```bash
   npm run dev
   ```

4. Faça requisição:
   ```bash
   curl http://localhost:3000/api/v1/test-error
   ```

5. Restaure `NODE_ENV=development` e remova a rota de teste

**Resultado Esperado:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Internal server error"
  }
}
```

**Como verificar:**
- ✓ Status HTTP deve ser 500
- ✓ Resposta **NÃO** deve incluir campo `error.stack`
- ✓ Mensagem deve ser genérica "Internal server error" (não expõe detalhes)
- ✓ Console/log deve conter erro completo com stack trace (para debugging do desenvolvedor)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 7 - Helpers: createValidationError

**Objetivo:** Verificar se o helper createValidationError cria erro de validação com detalhes

**Passos:**
1. Crie arquivo de teste `test-helpers.js`:
   ```javascript
   const { createValidationError } = require('./src/middlewares/error.middleware');

   const errors = [
     { field: 'cpf', message: 'CPF inválido' },
     { field: 'email', message: 'Email já cadastrado' }
   ];

   const error = createValidationError('Dados inválidos', errors);

   console.log('StatusCode:', error.statusCode);
   console.log('Code:', error.code);
   console.log('Message:', error.message);
   console.log('Details:', JSON.stringify(error.details, null, 2));
   console.log('isOperational:', error.isOperational);
   ```

2. Execute:
   ```bash
   node test-helpers.js
   ```

3. Remova o arquivo:
   ```bash
   rm test-helpers.js
   ```

**Resultado Esperado:**
- ✓ StatusCode deve ser: 400
- ✓ Code deve ser: "VALIDATION_ERROR"
- ✓ Message deve ser: "Dados inválidos"
- ✓ Details deve conter array com os erros de validação
- ✓ isOperational deve ser: true

**Como verificar:**
- Todos os campos devem ser exibidos corretamente no console

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 8 - Helpers: createNotFoundError

**Objetivo:** Verificar se o helper createNotFoundError cria erro 404 padronizado

**Passos:**
1. Crie arquivo de teste:
   ```javascript
   const { createNotFoundError } = require('./src/middlewares/error.middleware');

   const error = createNotFoundError('Aluno');

   console.log('StatusCode:', error.statusCode);
   console.log('Code:', error.code);
   console.log('Message:', error.message);
   console.log('isOperational:', error.isOperational);
   ```

2. Execute e depois remova o arquivo

**Resultado Esperado:**
- ✓ StatusCode deve ser: 404
- ✓ Code deve ser: "NOT_FOUND"
- ✓ Message deve ser: "Aluno não encontrado"
- ✓ isOperational deve ser: true

**Como verificar:**
- Campos exibidos corretamente no console

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 9 - Helpers: createUnauthorizedError

**Objetivo:** Verificar se o helper createUnauthorizedError cria erro 401

**Passos:**
1. Crie e execute arquivo de teste:
   ```javascript
   const { createUnauthorizedError } = require('./src/middlewares/error.middleware');

   const error = createUnauthorizedError('Token não fornecido');

   console.log('StatusCode:', error.statusCode);
   console.log('Code:', error.code);
   console.log('Message:', error.message);
   ```

**Resultado Esperado:**
- ✓ StatusCode deve ser: 401
- ✓ Code deve ser: "UNAUTHORIZED"
- ✓ Message deve ser: "Token não fornecido"

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 10 - Helpers: createForbiddenError

**Objetivo:** Verificar se o helper createForbiddenError cria erro 403

**Passos:**
1. Crie e execute arquivo de teste:
   ```javascript
   const { createForbiddenError } = require('./src/middlewares/error.middleware');

   const error = createForbiddenError('Apenas administradores podem acessar este recurso');

   console.log('StatusCode:', error.statusCode);
   console.log('Code:', error.code);
   console.log('Message:', error.message);
   ```

**Resultado Esperado:**
- ✓ StatusCode deve ser: 403
- ✓ Code deve ser: "FORBIDDEN"
- ✓ Message deve conter a mensagem customizada

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 11 - Helpers: createConflictError

**Objetivo:** Verificar se o helper createConflictError cria erro 409

**Passos:**
1. Crie e execute arquivo de teste:
   ```javascript
   const { createConflictError } = require('./src/middlewares/error.middleware');

   const error = createConflictError('CPF já cadastrado no sistema');

   console.log('StatusCode:', error.statusCode);
   console.log('Code:', error.code);
   console.log('Message:', error.message);
   ```

**Resultado Esperado:**
- ✓ StatusCode deve ser: 409
- ✓ Code deve ser: "CONFLICT"
- ✓ Message deve ser: "CPF já cadastrado no sistema"

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 12 - Integração: notFoundHandler antes de errorHandler

**Objetivo:** Verificar se a ordem dos middlewares está correta (notFoundHandler → errorHandler)

**Passos:**
1. Verifique o arquivo `backend/src/server.js` e confirme a ordem:
   ```javascript
   // Após todas as rotas válidas
   app.use(notFoundHandler);  // Primeiro
   app.use(errorHandler);     // Segundo (último middleware)
   ```

2. Certifique-se que o servidor está rodando

3. Faça requisição para rota inexistente:
   ```bash
   curl -v http://localhost:3000/api/v1/nao-existe
   ```

**Resultado Esperado:**
- ✓ Status HTTP deve ser 404
- ✓ Resposta JSON deve ter estrutura padronizada
- ✓ Nenhum erro interno do servidor deve ocorrer

**Como verificar:**
- Resposta deve vir do notFoundHandler (erro 404 estruturado)
- Não deve haver erro 500 ou mensagem de middleware não encontrado

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTE DE INTEGRAÇÃO

### Teste 13 - Integração com Winston: Logs em arquivo (produção)

**Objetivo:** Verificar se logs de erro são gravados em arquivo quando `NODE_ENV=production` ou `LOG_TO_FILE=true`

**Pré-requisito:** Winston deve estar configurado (feat-026)

**Passos:**
1. No `.env`, configure:
   ```env
   LOG_TO_FILE=true
   LOG_LEVEL=debug
   ```

2. Reinicie o servidor:
   ```bash
   npm run dev
   ```

3. Faça requisição para rota inexistente:
   ```bash
   curl http://localhost:3000/api/v1/teste
   ```

4. Verifique o arquivo de log:
   ```bash
   tail -n 30 logs/combined.log
   ```

5. Restaure configuração original do `.env`

**Resultado Esperado:**
- ✓ Arquivo `logs/combined.log` deve existir
- ✓ Deve conter log com:
  - `"level":"warn"`
  - `"code":"NOT_FOUND"`
  - `"url":"/api/v1/teste"`
  - `"method":"GET"`
  - Timestamp formatado

**Como verificar:**
- Use `grep "NOT_FOUND" logs/combined.log` para buscar a entrada
- Log deve estar em formato JSON estruturado

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 14 - Integração: Erro dentro de rota autenticada (futuro)

**Objetivo:** Verificar se o errorHandler captura userId quando usuário está autenticado

**Observação:** Este teste só pode ser executado após implementação do middleware de autenticação (feat-020)

**Passos (quando feat-020 estiver implementada):**
1. Faça login para obter token JWT
2. Crie rota protegida que dispara erro
3. Faça requisição autenticada
4. Verifique se log contém `userId` do usuário autenticado

**Resultado Esperado:**
- ✓ Log deve incluir campo `userId` com ID do usuário
- ✓ Log deve incluir campo `role` com perfil do usuário

**Status:** [ ] Bloqueado (aguardando feat-020) | [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após feat-020]_

---

## 🧪 TESTE DE REGRESSÃO

### Teste 15 - Health check ainda funciona

**Objetivo:** Verificar se a adição dos middlewares de erro não quebrou rotas existentes

**Passos:**
1. Com servidor rodando, faça requisição para health check:
   ```bash
   curl http://localhost:3000/health
   ```

**Resultado Esperado:**
```json
{
  "status": "ok",
  "message": "Secretaria Online API is running",
  "timestamp": "2025-10-28T..."
}
```

**Como verificar:**
- ✓ Status HTTP deve ser 200
- ✓ Resposta deve ter estrutura esperada
- ✓ Timestamp deve ser válido

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📊 RESUMO DOS TESTES

| # | Teste | Status | Prioridade |
|---|-------|--------|------------|
| 1 | AppError básico | [ ] | Alta |
| 2 | AppError com detalhes | [ ] | Alta |
| 3 | errorHandler retorna JSON padronizado | [ ] | Alta |
| 4 | Log de erro operacional | [ ] | Alta |
| 5 | Erro não operacional em dev | [ ] | Alta |
| 6 | Erro não operacional em prod | [ ] | Alta |
| 7 | Helper createValidationError | [ ] | Média |
| 8 | Helper createNotFoundError | [ ] | Média |
| 9 | Helper createUnauthorizedError | [ ] | Média |
| 10 | Helper createForbiddenError | [ ] | Média |
| 11 | Helper createConflictError | [ ] | Média |
| 12 | Ordem dos middlewares | [ ] | Alta |
| 13 | Integração com Winston em arquivo | [ ] | Média |
| 14 | Erro em rota autenticada | [ ] | Baixa (bloqueado) |
| 15 | Regressão: health check | [ ] | Alta |

**Legenda:**
- [ ] Não executado
- [✓] Passou
- [✗] Falhou
- [⚠] Falhou parcialmente

---

## 📝 NOTAS FINAIS

### Cenários de Erro Indesejados

Se algum teste falhar, verifique:

1. **Erro: "Cannot find module './middlewares/error.middleware'"**
   - Solução: Confirme que `backend/src/middlewares/error.middleware.js` existe
   - Verifique o caminho relativo no require

2. **Erro: Winston não está logando**
   - Solução: Verifique se feat-026 está implementada corretamente
   - Confirme que `backend/src/utils/logger.js` existe
   - Verifique variáveis de ambiente `LOG_LEVEL` e `LOG_TO_FILE`

3. **Erro: Stack trace aparece em produção**
   - Solução: Confirme que `NODE_ENV=production` no `.env`
   - Reinicie o servidor após modificar `.env`

4. **Erro: Middleware não está sendo chamado**
   - Solução: Verifique ordem no `server.js`
   - errorHandler deve ser o **último** middleware
   - notFoundHandler deve vir **antes** do errorHandler

### Dependências

- ✅ **feat-026**: Winston deve estar configurado para logging funcionar
- ⚠️ **feat-020**: Testes com usuário autenticado dependem de middleware de autenticação

### Ambiente de Teste

- Node.js v20 LTS
- Servidor backend rodando localmente na porta 3000
- `.env` configurado corretamente

---

**Plano de testes criado em:** 2025-10-28
**Última atualização:** 2025-10-28
**Responsável pela execução:** A definir
