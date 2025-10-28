# PLANO DE TESTES - feat-022: Implementar rate limiting para login

**Feature:** feat-022 - Implementar rate limiting para login
**Grupo:** Autenticação e Autorização
**Data de criação:** 2025-10-27
**Status:** Aguardando execução

---

## 🔧 PREPARAÇÃO DO AMBIENTE

### Pré-requisitos

Certifique-se que o ambiente está configurado:

```bash
# Navegue até a pasta do backend
cd backend

# Instale as dependências (incluindo express-rate-limit)
npm install

# Verifique se express-rate-limit está instalado
npm list express-rate-limit

# Inicie o servidor em modo de desenvolvimento
npm run dev
```

**Esperado:**
```
[INFO] Server is running on http://localhost:3000
[INFO] Environment: development
```

**Nota:** Certifique-se de que o arquivo `.env` está configurado corretamente com as credenciais do banco de dados.

---

## 📋 TESTES FUNCIONAIS

### Teste 1: Rate Limiting no Endpoint de Login - Primeira Tentativa

**Objetivo:** Verificar se o endpoint de login permite requisições dentro do limite estabelecido

**Passos:**
1. Certifique-se que o servidor está rodando (`npm run dev`)
2. Faça uma requisição POST para o endpoint de login:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "login": "admin",
       "password": "senhaqualquer"
     }'
   ```
3. Verifique a resposta HTTP

**Resultado Esperado:**
- ✓ Status HTTP: 400 ou 401 (credenciais inválidas - comportamento normal)
- ✓ Header `RateLimit-Limit: 5` presente na resposta
- ✓ Header `RateLimit-Remaining: 4` presente (primeira tentativa)
- ✓ Resposta JSON com estrutura esperada

**Como verificar:**
- Observe os headers da resposta usando `-i` no curl:
  ```bash
  curl -i -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"login": "admin", "password": "senhaqualquer"}'
  ```
- Os headers `RateLimit-*` devem estar presentes

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Rate Limiting - Múltiplas Tentativas Dentro do Limite

**Objetivo:** Verificar se o sistema permite até 5 tentativas de login do mesmo IP

**Passos:**
1. Execute 5 requisições consecutivas de login com credenciais inválidas:
   ```bash
   # Tentativa 1
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"login": "admin", "password": "senha1"}'

   # Tentativa 2
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"login": "admin", "password": "senha2"}'

   # Tentativa 3, 4, 5...
   # Repita o comando acima mais 3 vezes
   ```

2. Observe os headers `RateLimit-Remaining` em cada resposta

**Resultado Esperado:**
- ✓ 1ª tentativa: `RateLimit-Remaining: 4`
- ✓ 2ª tentativa: `RateLimit-Remaining: 3`
- ✓ 3ª tentativa: `RateLimit-Remaining: 2`
- ✓ 4ª tentativa: `RateLimit-Remaining: 1`
- ✓ 5ª tentativa: `RateLimit-Remaining: 0`
- ✓ Todas as 5 tentativas recebem resposta (não são bloqueadas)

**Como verificar:**
- Use `curl -i` para ver os headers de cada resposta
- Verifique que o contador `RateLimit-Remaining` decrementa corretamente

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Rate Limiting - Bloqueio Após Exceder Limite

**Objetivo:** Verificar se o sistema bloqueia tentativas de login após 5 tentativas

**Passos:**
1. Execute 6 requisições consecutivas de login (após reiniciar o servidor ou aguardar 15 minutos):
   ```bash
   # Execute este loop para fazer 6 tentativas
   for i in {1..6}; do
     echo "Tentativa $i:"
     curl -i -X POST http://localhost:3000/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"login": "admin", "password": "senha'$i'"}'
     echo -e "\n---\n"
   done
   ```

2. Observe a resposta da 6ª tentativa

**Resultado Esperado:**
- ✓ Tentativas 1-5: Status HTTP 400 ou 401 (comportamento normal)
- ✓ Tentativa 6: Status HTTP 429 (Too Many Requests)
- ✓ Corpo da resposta da 6ª tentativa:
  ```json
  {
    "success": false,
    "error": {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "Muitas tentativas de login. Por favor, tente novamente em 15 minutos."
    },
    "retryAfter": <número_em_segundos>
  }
  ```
- ✓ Header `Retry-After` presente na resposta

**Como verificar:**
- Verifique o status HTTP da 6ª requisição
- Confirme a mensagem de erro específica de rate limiting
- Confira que o campo `retryAfter` contém um valor numérico (segundos até poder tentar novamente)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 4: Rate Limiting - Reset Após Janela de Tempo

**Objetivo:** Verificar se o contador é resetado após 15 minutos

**Passos:**
1. Execute 5 tentativas de login para atingir o limite
2. Aguarde 15 minutos OU reinicie o servidor
3. Execute uma nova tentativa de login:
   ```bash
   curl -i -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"login": "admin", "password": "senhaqualquer"}'
   ```

**Resultado Esperado:**
- ✓ Status HTTP: 400 ou 401 (não mais 429)
- ✓ Header `RateLimit-Remaining: 4` (contador resetado)
- ✓ Requisição não é bloqueada

**Como verificar:**
- Após aguardar 15 minutos ou reiniciar o servidor, faça uma nova requisição
- Verifique que não retorna 429 e que `RateLimit-Remaining` voltou para 4

**Nota:** Para testes rápidos, reiniciar o servidor (`Ctrl+C` e `npm run dev`) reseta os contadores.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔐 TESTE DE SEGURANÇA

### Teste 5: Rate Limiting na Mudança de Senha

**Objetivo:** Verificar se o endpoint de mudança de senha tem proteção mais rigorosa (3 tentativas em 60 minutos)

**Passos:**
1. Primeiro, faça login com credenciais válidas para obter um token JWT:
   ```bash
   # Faça login com o usuário admin (ou outro usuário válido)
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "login": "admin",
       "password": "admin123"
     }'
   ```

2. Copie o token JWT da resposta (campo `token` ou `accessToken`)

3. Execute 4 requisições consecutivas de mudança de senha:
   ```bash
   TOKEN="<cole_o_token_aqui>"

   for i in {1..4}; do
     echo "Tentativa $i:"
     curl -i -X POST http://localhost:3000/api/auth/change-password \
       -H "Content-Type: application/json" \
       -H "Authorization: Bearer $TOKEN" \
       -d '{
         "oldPassword": "senhaerrada'$i'",
         "newPassword": "NovaSenha123!"
       }'
     echo -e "\n---\n"
   done
   ```

**Resultado Esperado:**
- ✓ Tentativas 1-3: Status HTTP 400 ou 401 (senha antiga incorreta)
- ✓ Tentativa 4: Status HTTP 429 (Too Many Requests)
- ✓ Mensagem de erro:
  ```json
  {
    "success": false,
    "error": {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "Muitas tentativas de alteração de senha. Por favor, tente novamente em 1 hora."
    }
  }
  ```
- ✓ Limite mais rigoroso que o endpoint de login (3 vs 5)

**Como verificar:**
- Verifique que o bloqueio ocorre na 4ª tentativa (não na 6ª)
- Confirme a mensagem específica mencionando "1 hora"

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTE DE VALIDAÇÃO

### Teste 6: Rate Limiting por IP - Isolamento de Clientes

**Objetivo:** Verificar se o rate limiting é aplicado por endereço IP (tentativas de um IP não afetam outro)

**Nota:** Este teste é mais complexo e pode exigir ferramentas adicionais.

**Passos:**
1. Opção A - Usando Postman/Insomnia:
   - Faça 5 requisições de login pelo Postman (IP do seu computador)
   - Faça uma requisição adicional de outra máquina/rede (ou usando VPN)
   - Verifique que a requisição de outro IP não é bloqueada

2. Opção B - Usando proxy (avançado):
   - Configure um proxy ou VPN para simular outro IP
   - Execute requisições de ambos os IPs

**Resultado Esperado:**
- ✓ Requisições do IP-1 (bloqueado após 5 tentativas) retornam 429
- ✓ Requisições do IP-2 (sem tentativas anteriores) funcionam normalmente
- ✓ Contadores são independentes por IP

**Como verificar:**
- Se não for possível testar com IPs diferentes, este teste pode ser marcado como "Não aplicável"
- Em ambiente de produção, este comportamento é garantido pela biblioteca express-rate-limit

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou | [ ] Não aplicável
**Observações:** _[Preencher após execução]_

---

## 🧪 TESTE DE INTEGRAÇÃO

### Teste 7: Login Bem-Sucedido Não É Bloqueado

**Objetivo:** Verificar que logins bem-sucedidos são contabilizados no rate limit mas não bloqueiam o usuário

**Passos:**
1. Execute 5 logins bem-sucedidos consecutivos:
   ```bash
   for i in {1..5}; do
     echo "Login bem-sucedido $i:"
     curl -i -X POST http://localhost:3000/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{
         "login": "admin",
         "password": "admin123"
       }'
     echo -e "\n---\n"
   done
   ```

2. Tente um 6º login:
   ```bash
   curl -i -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "login": "admin",
       "password": "admin123"
     }'
   ```

**Resultado Esperado:**
- ✓ Todos os 6 logins retornam 429 (Too Many Requests) na 6ª tentativa
- ✓ Logins bem-sucedidos também contam para o rate limit
- ✓ **OU** implementação alternativa: apenas logins falhos contam (depende da implementação escolhida)

**Como verificar:**
- Observe se o 6º login é bloqueado ou permitido
- Confirme qual comportamento foi implementado

**Nota:** Ambos os comportamentos são válidos. O importante é documentar qual foi escolhido.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🧩 TESTE DE AMBIENTE

### Teste 8: Rate Limiting Desabilitado em Ambiente de Teste

**Objetivo:** Verificar se o rate limiting é automaticamente desabilitado quando `NODE_ENV=test`

**Passos:**
1. Pare o servidor (Ctrl+C)

2. Altere a variável de ambiente:
   ```bash
   # Linux/Mac
   export NODE_ENV=test
   npm run dev

   # Windows (CMD)
   set NODE_ENV=test
   npm run dev

   # Windows (PowerShell)
   $env:NODE_ENV="test"
   npm run dev
   ```

3. Execute 10 requisições consecutivas de login:
   ```bash
   for i in {1..10}; do
     echo "Tentativa $i:"
     curl -X POST http://localhost:3000/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"login": "admin", "password": "senha'$i'"}'
   done
   ```

**Resultado Esperado:**
- ✓ Todas as 10 requisições retornam 400 ou 401 (nunca 429)
- ✓ Nenhuma requisição é bloqueada por rate limiting
- ✓ Headers `RateLimit-*` podem não estar presentes (ou estar com valores ilimitados)

**Como verificar:**
- Verifique que nenhuma das 10 requisições retorna HTTP 429
- Confirme que o rate limiting está desabilitado em ambiente de teste

**Importante:** Após o teste, volte `NODE_ENV` para `development`:
```bash
# Linux/Mac
export NODE_ENV=development

# Windows (CMD)
set NODE_ENV=development

# Windows (PowerShell)
$env:NODE_ENV="development"
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📊 CHECKLIST FINAL

Antes de marcar a feature como concluída, verifique:

- [ ] **Teste 1:** Primeira tentativa dentro do limite funciona normalmente
- [ ] **Teste 2:** Múltiplas tentativas (até 5) são permitidas
- [ ] **Teste 3:** 6ª tentativa é bloqueada com HTTP 429
- [ ] **Teste 4:** Contador reseta após 15 minutos (ou reinício do servidor)
- [ ] **Teste 5:** Mudança de senha tem limite mais rigoroso (3 tentativas)
- [ ] **Teste 6:** Rate limiting é isolado por IP (ou marcado como N/A)
- [ ] **Teste 7:** Logins bem-sucedidos são tratados corretamente
- [ ] **Teste 8:** Rate limiting desabilitado em ambiente de teste

---

## 🛠️ FERRAMENTAS RECOMENDADAS

### cURL (Linha de Comando)
- **Vantagem:** Rápido, disponível em todos os sistemas, fácil de automatizar
- **Uso:** Exemplos fornecidos nos testes acima

### Postman
- **Download:** https://www.postman.com/downloads/
- **Vantagem:** Interface gráfica, fácil de ver headers e respostas
- **Uso:**
  1. Crie uma requisição POST para `http://localhost:3000/api/auth/login`
  2. Adicione body JSON: `{"login": "admin", "password": "senhaqualquer"}`
  3. Envie múltiplas vezes para testar o rate limiting
  4. Verifique os headers `RateLimit-*` na aba "Headers" da resposta

### Insomnia
- **Download:** https://insomnia.rest/download
- **Vantagem:** Similar ao Postman, mais leve
- **Uso:** Similar ao Postman

### Verificação de Logs (Opcional)
```bash
# Acompanhe os logs do servidor em tempo real
cd backend
npm run dev

# Em outro terminal, execute os testes
# Observe os logs do servidor para ver mensagens de rate limiting
```

---

## 📝 OBSERVAÇÕES IMPORTANTES

1. **Reset de Contadores:**
   - Contadores são armazenados em memória (não persistem após reinício)
   - Para produção, considere usar Redis ou similar para persistência

2. **Headers de Resposta:**
   - `RateLimit-Limit`: Número máximo de requisições permitidas
   - `RateLimit-Remaining`: Número de requisições restantes
   - `RateLimit-Reset`: Timestamp de quando o contador será resetado
   - `Retry-After`: Segundos até poder tentar novamente (retornado no 429)

3. **Comportamento em Proxy Reverso:**
   - Se usar Nginx ou outro proxy, certifique-se que o IP real do cliente é repassado
   - Configure `trust proxy` no Express se necessário

4. **Logs:**
   - Eventos de rate limiting podem ser logados para auditoria
   - Verifique logs do servidor para mensagens relacionadas

---

## ✅ CRITÉRIOS DE ACEITAÇÃO

A feature será considerada **APROVADA** se:

1. ✅ Endpoint de login permite até 5 tentativas por IP em 15 minutos
2. ✅ 6ª tentativa e seguintes retornam HTTP 429 com mensagem apropriada
3. ✅ Endpoint de mudança de senha permite até 3 tentativas por IP em 60 minutos
4. ✅ Contador reseta após a janela de tempo (15 minutos para login, 60 para senha)
5. ✅ Rate limiting é desabilitado em ambiente de teste (`NODE_ENV=test`)
6. ✅ Headers `RateLimit-*` são retornados corretamente nas respostas
7. ✅ Mensagens de erro são claras e informativas
8. ✅ Documentação no README.md está atualizada

---

**IMPORTANTE:** Execute TODOS os testes acima antes de marcar a feature como concluída. Registre qualquer comportamento inesperado nas observações de cada teste.

**Próximo passo após aprovação:** Execute `/versionamento-branch-push` para commit e push das mudanças.
