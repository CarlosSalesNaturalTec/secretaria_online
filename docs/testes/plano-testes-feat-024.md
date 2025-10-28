# PLANO DE TESTES - feat-024: Configurar CORS

**Feature:** feat-024 - Configurar CORS
**Grupo:** Backend - Middlewares e Utilitários
**Data de criação:** 2025-10-28
**Status:** Aguardando execução

---

## 📋 TESTE FUNCIONAL

### Teste 1 - Requisição Preflight (OPTIONS) de Origem Permitida

**Objetivo:** Verificar se o servidor responde corretamente a requisições preflight de origens configuradas em CORS_ORIGIN

**Pré-requisitos:**
- Backend rodando em http://localhost:3000
- Variável `CORS_ORIGIN=http://localhost:5173` definida no arquivo `.env`

**Passos:**
1. Abra o terminal
2. Execute o comando curl para simular requisição preflight:
   ```bash
   curl -H "Origin: http://localhost:5173" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type,Authorization" \
        -X OPTIONS \
        http://localhost:3000/api/v1/health --verbose
   ```
3. Analise a resposta HTTP e os headers retornados

**Resultado Esperado:**
- ✓ Status HTTP: 204 No Content
- ✓ Header `Access-Control-Allow-Origin: http://localhost:5173`
- ✓ Header `Access-Control-Allow-Credentials: true`
- ✓ Header `Access-Control-Allow-Methods` contém: GET, POST, PUT, PATCH, DELETE, OPTIONS
- ✓ Header `Access-Control-Allow-Headers` contém: Content-Type, Authorization
- ✓ Header `Access-Control-Max-Age: 86400`
- ✓ Sem erros no console do servidor

**Como verificar:**
- Examine a saída do curl procurando por linhas que começam com `< Access-Control-`
- Confirme que todos os headers CORS estão presentes
- Status 204 indica sucesso sem corpo de resposta

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2 - Requisição GET Real com Origem Permitida

**Objetivo:** Verificar se requisições GET reais incluem headers CORS corretos na resposta

**Pré-requisitos:**
- Backend rodando em http://localhost:3000
- Variável `CORS_ORIGIN=http://localhost:5173` definida no arquivo `.env`

**Passos:**
1. Abra o terminal
2. Execute requisição GET com header Origin:
   ```bash
   curl -H "Origin: http://localhost:5173" \
        -H "Content-Type: application/json" \
        http://localhost:3000/api/v1/health --verbose
   ```
3. Analise a resposta HTTP e os headers retornados

**Resultado Esperado:**
- ✓ Status HTTP: 200 OK
- ✓ Header `Access-Control-Allow-Origin: http://localhost:5173`
- ✓ Header `Access-Control-Allow-Credentials: true`
- ✓ Corpo da resposta contém JSON válido: `{"status":"ok","message":"Secretaria Online API is running","timestamp":"..."}`
- ✓ Sem erros no console do servidor

**Como verificar:**
- Confirme que `Access-Control-Allow-Origin` está presente na resposta
- Verifique que o JSON retornado está correto
- Status 200 indica sucesso

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3 - Requisição de Origem NÃO Permitida

**Objetivo:** Verificar se o servidor bloqueia requisições de origens não configuradas em CORS_ORIGIN

**Pré-requisitos:**
- Backend rodando em http://localhost:3000
- Variável `CORS_ORIGIN=http://localhost:5173` definida no arquivo `.env` (sem incluir http://exemplo.com)

**Passos:**
1. Abra o terminal
2. Execute requisição com origem não permitida:
   ```bash
   curl -H "Origin: http://exemplo.com" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        http://localhost:3000/api/v1/health --verbose
   ```
3. Analise a resposta HTTP

**Resultado Esperado:**
- ✓ Requisição é rejeitada pelo CORS
- ✓ Navegador receberia erro CORS (não aplicável ao curl diretamente)
- ✓ Servidor pode retornar erro ou não incluir headers `Access-Control-Allow-Origin`

**Resultado NÃO Esperado:**
- ✗ Header `Access-Control-Allow-Origin: http://exemplo.com` presente
- ✗ Requisição bem-sucedida com headers CORS para origem não permitida

**Como verificar:**
- Confirme que `Access-Control-Allow-Origin` **NÃO** contém `http://exemplo.com`
- Em navegador real, console mostraria erro: "blocked by CORS policy"

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 4 - Requisição sem Header Origin (Postman/curl/mobile)

**Objetivo:** Verificar se requisições sem header Origin (ferramentas como Postman, curl, apps mobile) são permitidas

**Pré-requisitos:**
- Backend rodando em http://localhost:3000

**Passos:**
1. Abra o terminal
2. Execute requisição **SEM** header Origin:
   ```bash
   curl http://localhost:3000/api/v1/health --verbose
   ```
3. Analise a resposta HTTP

**Resultado Esperado:**
- ✓ Status HTTP: 200 OK
- ✓ Resposta JSON válida retornada
- ✓ Headers CORS podem ou não estar presentes (não são necessários quando não há Origin)
- ✓ Requisição não é bloqueada

**Como verificar:**
- Confirme que a requisição foi bem-sucedida (status 200)
- Verifique que o JSON foi retornado corretamente
- Este comportamento permite que Postman, mobile apps e curl funcionem normalmente

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5 - Requisições com Métodos HTTP Diversos

**Objetivo:** Verificar se todos os métodos HTTP configurados (GET, POST, PUT, PATCH, DELETE) são permitidos pelo CORS

**Pré-requisitos:**
- Backend rodando em http://localhost:3000
- Variável `CORS_ORIGIN=http://localhost:5173` definida no arquivo `.env`

**Passos:**
1. Para cada método (GET, POST, PUT, PATCH, DELETE), execute:
   ```bash
   # Exemplo para POST
   curl -H "Origin: http://localhost:5173" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type,Authorization" \
        -X OPTIONS \
        http://localhost:3000/api/v1/health --verbose
   ```
2. Repita substituindo POST por PUT, PATCH, DELETE
3. Analise os headers `Access-Control-Allow-Methods` nas respostas

**Resultado Esperado:**
- ✓ Todos os métodos retornam status 204 No Content
- ✓ Header `Access-Control-Allow-Methods` inclui todos os métodos: GET,POST,PUT,PATCH,DELETE,OPTIONS
- ✓ Nenhum método é bloqueado

**Como verificar:**
- Confirme que cada requisição OPTIONS retornou 204
- Verifique que `Access-Control-Allow-Methods` lista todos os métodos

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6 - Múltiplas Origens Configuradas

**Objetivo:** Verificar se o servidor aceita requisições de múltiplas origens quando configuradas em CORS_ORIGIN

**Pré-requisitos:**
- Backend rodando em http://localhost:3000
- Variável `CORS_ORIGIN=http://localhost:5173,http://localhost:3001` definida no arquivo `.env`
- Reinicie o servidor após modificar `.env`

**Passos:**
1. Teste primeira origem:
   ```bash
   curl -H "Origin: http://localhost:5173" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        http://localhost:3000/api/v1/health --verbose
   ```
2. Teste segunda origem:
   ```bash
   curl -H "Origin: http://localhost:3001" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        http://localhost:3000/api/v1/health --verbose
   ```
3. Analise os headers `Access-Control-Allow-Origin` em ambas as respostas

**Resultado Esperado:**
- ✓ Primeira requisição retorna `Access-Control-Allow-Origin: http://localhost:5173`
- ✓ Segunda requisição retorna `Access-Control-Allow-Origin: http://localhost:3001`
- ✓ Ambas retornam status 204 No Content
- ✓ Ambas incluem `Access-Control-Allow-Credentials: true`

**Como verificar:**
- Confirme que cada origem recebe seu respectivo header `Access-Control-Allow-Origin`
- Verifique que não há bloqueios para nenhuma das origens configuradas

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 7 - Teste com Frontend Real (Browser)

**Objetivo:** Verificar se o frontend React consegue fazer requisições à API sem erros CORS

**Pré-requisitos:**
- Backend rodando em http://localhost:3000
- Frontend rodando em http://localhost:5173
- Variável `CORS_ORIGIN=http://localhost:5173` definida no `.env` do backend

**Passos:**
1. Inicie o backend:
   ```bash
   cd backend
   npm run dev
   ```
2. Em outro terminal, inicie o frontend:
   ```bash
   cd frontend
   npm run dev
   ```
3. Abra o navegador em http://localhost:5173
4. Abra o Console do Desenvolvedor (F12)
5. No console, execute:
   ```javascript
   fetch('http://localhost:3000/api/v1/health', {
     method: 'GET',
     headers: {
       'Content-Type': 'application/json'
     },
     credentials: 'include'
   })
   .then(res => res.json())
   .then(data => console.log('Sucesso:', data))
   .catch(err => console.error('Erro:', err));
   ```
6. Observe a resposta no console e na aba Network

**Resultado Esperado:**
- ✓ Requisição OPTIONS (preflight) é enviada automaticamente pelo navegador
- ✓ Requisição OPTIONS retorna status 204
- ✓ Requisição GET é enviada após preflight bem-sucedido
- ✓ Requisição GET retorna status 200 com JSON
- ✓ Console exibe: `Sucesso: {status: "ok", message: "...", timestamp: "..."}`
- ✓ **SEM** mensagens de erro CORS no console

**Resultado NÃO Esperado:**
- ✗ Erro no console: "Access to fetch... has been blocked by CORS policy"
- ✗ Requisição GET não é enviada após preflight
- ✗ Status 0 (rede) nas requisições

**Como verificar:**
- Abra a aba Network (Rede) do DevTools
- Filtre por "health"
- Verifique que há duas requisições: OPTIONS (preflight) e GET (real)
- Clique em cada requisição e veja os headers de resposta incluindo headers CORS
- Console deve mostrar "Sucesso:" sem erros CORS

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 8 - Validação de Headers Customizados

**Objetivo:** Verificar se headers customizados (Authorization, X-Requested-With) são permitidos nas requisições

**Pré-requisitos:**
- Backend rodando em http://localhost:3000
- Variável `CORS_ORIGIN=http://localhost:5173` definida no arquivo `.env`

**Passos:**
1. Execute requisição preflight solicitando headers customizados:
   ```bash
   curl -H "Origin: http://localhost:5173" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type,Authorization,X-Requested-With" \
        -X OPTIONS \
        http://localhost:3000/api/v1/health --verbose
   ```
2. Analise o header `Access-Control-Allow-Headers` na resposta

**Resultado Esperado:**
- ✓ Status HTTP: 204 No Content
- ✓ Header `Access-Control-Allow-Headers` inclui: Content-Type, Authorization, X-Requested-With, Accept, Origin
- ✓ Todos os headers solicitados são permitidos

**Como verificar:**
- Confirme que `Access-Control-Allow-Headers` lista todos os headers necessários
- Verifique que não há restrições impeditivas

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 9 - Cache de Preflight (maxAge)

**Objetivo:** Verificar se o navegador está recebendo instrução de cache para requisições preflight (reduz tráfego)

**Pré-requisitos:**
- Backend rodando em http://localhost:3000
- Variável `CORS_ORIGIN=http://localhost:5173` definida no arquivo `.env`

**Passos:**
1. Execute requisição preflight:
   ```bash
   curl -H "Origin: http://localhost:5173" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        http://localhost:3000/api/v1/health --verbose
   ```
2. Procure pelo header `Access-Control-Max-Age` na resposta

**Resultado Esperado:**
- ✓ Header `Access-Control-Max-Age: 86400` presente (24 horas em segundos)
- ✓ Navegadores irão cachear a resposta preflight por 24 horas, reduzindo requisições OPTIONS

**Como verificar:**
- Confirme a presença do header `Access-Control-Max-Age: 86400`
- Isso instrui o navegador a não repetir preflight para o mesmo endpoint por 24h

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🧪 TESTES DE SEGURANÇA

### Teste 10 - Configuração CORS_ORIGIN=* (Não Recomendado)

**Objetivo:** Verificar o comportamento quando CORS_ORIGIN é configurado com wildcard (*)

**⚠️ ATENÇÃO:** Este teste deve ser feito apenas em ambiente de desenvolvimento. **NUNCA** use `CORS_ORIGIN=*` em produção!

**Pré-requisitos:**
- Backend rodando em http://localhost:3000
- Variável `CORS_ORIGIN=*` definida temporariamente no arquivo `.env`
- Reinicie o servidor

**Passos:**
1. Execute requisição com origem qualquer:
   ```bash
   curl -H "Origin: http://origem-qualquer.com" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        http://localhost:3000/api/v1/health --verbose
   ```
2. Analise a resposta

**Resultado Esperado (com wildcard):**
- ✓ Requisição é aceita independentemente da origem
- ✓ Header `Access-Control-Allow-Origin` está presente
- ✓ Qualquer domínio pode fazer requisições

**⚠️ Risco de Segurança:**
- Permite que qualquer site malicioso faça requisições à sua API
- Expõe dados sensíveis se credenciais estiverem habilitadas
- **NUNCA use em produção!**

**Como verificar:**
- Confirme que a requisição foi bem-sucedida
- Após o teste, **reverta imediatamente** `CORS_ORIGIN` para valor específico: `http://localhost:5173`
- Reinicie o servidor

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução e REVERTIR configuração!]_

---

### Teste 11 - Validação de Credentials com Origens Permitidas

**Objetivo:** Verificar se o header `Access-Control-Allow-Credentials: true` está presente e funcional

**Pré-requisitos:**
- Backend rodando em http://localhost:3000
- Variável `CORS_ORIGIN=http://localhost:5173` definida no arquivo `.env`

**Passos:**
1. Execute requisição OPTIONS com origin permitida:
   ```bash
   curl -H "Origin: http://localhost:5173" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        http://localhost:3000/api/v1/health --verbose
   ```
2. Procure pelo header `Access-Control-Allow-Credentials` na resposta

**Resultado Esperado:**
- ✓ Header `Access-Control-Allow-Credentials: true` presente
- ✓ Permite que o frontend envie cookies e tokens de autenticação

**Como verificar:**
- Confirme que `Access-Control-Allow-Credentials: true` está na resposta
- Isso permite que requisições incluam `credentials: 'include'` no fetch

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 CHECKLIST DE VALIDAÇÃO GERAL

Após executar todos os testes, confirme:

- [ ] CORS permite requisições do frontend (http://localhost:5173)
- [ ] CORS bloqueia requisições de origens não permitidas
- [ ] Requisições sem origin (Postman, curl) funcionam normalmente
- [ ] Todos os métodos HTTP (GET, POST, PUT, PATCH, DELETE) são permitidos
- [ ] Headers customizados (Authorization, Content-Type) são aceitos
- [ ] Credenciais (credentials: true) estão habilitadas
- [ ] Cache de preflight (maxAge: 86400) está configurado
- [ ] Múltiplas origens podem ser configuradas via vírgula
- [ ] Navegador não exibe erros CORS ao fazer requisições do frontend real
- [ ] Documentação no README está clara e completa
- [ ] `.env.example` contém instruções adequadas sobre CORS_ORIGIN
- [ ] Configuração funciona tanto em desenvolvimento quanto em cenários de produção

---

## 🔍 OBSERVAÇÕES FINAIS

**Ambiente de teste recomendado:**
- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- Ferramentas: curl, navegador Chrome/Firefox com DevTools

**Logs para monitorar:**
- Console do servidor backend (terminal onde `npm run dev` está rodando)
- Console do navegador (F12 → Console)
- Network tab do DevTools (F12 → Network)

**Em caso de falha:**
1. Verifique se a variável `CORS_ORIGIN` está corretamente definida no `.env`
2. Certifique-se de que o servidor foi reiniciado após modificar `.env`
3. Confirme que não há typos nos domínios (http vs https, porta, etc.)
4. Verifique se há outros middlewares interferindo com CORS

**Resultado esperado geral:** Todos os testes devem passar, confirmando que o CORS está configurado corretamente e permite requisições do frontend, bloqueia origens não autorizadas, e funciona com todas as features necessárias (credentials, métodos HTTP, headers customizados).

---

**Responsável pela execução:** _[Preencher nome]_
**Data de execução:** _[Preencher data]_
**Resultado geral:** _[Preencher: Aprovado / Reprovado / Parcial]_
