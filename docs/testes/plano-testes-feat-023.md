# PLANO DE TESTES - feat-023: Configurar Helmet.js para headers de segurança

**Feature:** feat-023 - Configurar Helmet.js para headers de segurança
**Grupo:** Backend - Middlewares e Utilitários
**Data de criação:** 2025-10-28
**Status:** Aguardando execução

---

## 🔧 PREPARAÇÃO DO AMBIENTE

### Pré-requisitos

Certifique-se que o ambiente está configurado:

```bash
# Instalar dependências (se ainda não instalou)
cd backend
npm install

# Iniciar o servidor backend
npm run dev
```

**Esperado:** Servidor rodando em http://localhost:3000 com mensagem:
```
🚀 Server is running on port 3000
📍 Health check: http://localhost:3000/health
📍 API Base: http://localhost:3000/api/v1
```

### Ferramentas Recomendadas

- **Browser DevTools** (Chrome, Firefox, Edge) - Para inspecionar headers HTTP
- **cURL** - Para testar headers via linha de comando
- **Postman** ou **Insomnia** - Para testar APIs com visualização de headers
- **Online Security Header Checker**: https://securityheaders.com

---

## 📋 TESTE FUNCIONAL

### Teste 1: Verificar se Headers de Segurança estão Presentes

**Objetivo:** Confirmar que o Helmet.js está aplicando headers de segurança HTTP em todas as respostas

**Passos:**

1. Com o servidor backend rodando, abra um terminal
2. Execute o comando cURL para verificar headers:
   ```bash
   curl -I http://localhost:3000/health
   ```
3. Analise os headers de resposta

**Resultado Esperado:**

A resposta deve conter **todos** os seguintes headers de segurança:

- ✓ `Content-Security-Policy`: Presente com diretivas configuradas
- ✓ `Strict-Transport-Security`: `max-age=31536000; includeSubDomains; preload`
- ✓ `X-Frame-Options`: `DENY`
- ✓ `X-Content-Type-Options`: `nosniff`
- ✓ `X-XSS-Protection`: `0` (desabilitado por padrão no Helmet moderno) ou ausente
- ✓ `Referrer-Policy`: `strict-origin-when-cross-origin`
- ✓ **AUSÊNCIA** do header `X-Powered-By` (deve estar removido)

**Como verificar:**

1. Execute: `curl -I http://localhost:3000/health`
2. Procure pelos headers listados acima
3. Confirme que `X-Powered-By: Express` **NÃO** está presente

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Validar Content Security Policy (CSP)

**Objetivo:** Verificar se a política de segurança de conteúdo está configurada corretamente

**Passos:**

1. Execute o cURL para capturar apenas o header CSP:
   ```bash
   curl -I http://localhost:3000/health | grep -i "content-security-policy"
   ```

2. Analise as diretivas presentes

**Resultado Esperado:**

O header `Content-Security-Policy` deve conter as seguintes diretivas:

- ✓ `default-src 'self'`
- ✓ `style-src 'self' 'unsafe-inline'`
- ✓ `script-src 'self'`
- ✓ `img-src 'self' data: https:`
- ✓ `font-src 'self' data:`
- ✓ `connect-src 'self'`
- ✓ `frame-src 'none'`
- ✓ `object-src 'none'`
- ✓ `upgrade-insecure-requests`

**Como verificar:**

- O header CSP é uma única linha com todas as diretivas separadas por ponto-e-vírgula
- Exemplo esperado:
  ```
  Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-src 'none'; object-src 'none'; upgrade-insecure-requests
  ```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Validar HTTP Strict Transport Security (HSTS)

**Objetivo:** Verificar se o header HSTS está forçando uso de HTTPS

**Passos:**

1. Execute o cURL:
   ```bash
   curl -I http://localhost:3000/health | grep -i "strict-transport-security"
   ```

**Resultado Esperado:**

- ✓ Header presente: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- ✓ `max-age` deve ser 31536000 (1 ano em segundos)
- ✓ `includeSubDomains` deve estar presente
- ✓ `preload` deve estar presente

**Como verificar:**

- Confirme que o valor exato é: `max-age=31536000; includeSubDomains; preload`
- **Nota:** Este header só tem efeito real em conexões HTTPS, mas deve estar presente mesmo em desenvolvimento HTTP

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 4: Validar X-Frame-Options (Proteção Clickjacking)

**Objetivo:** Verificar se o header está bloqueando uso em iframes

**Passos:**

1. Execute o cURL:
   ```bash
   curl -I http://localhost:3000/health | grep -i "x-frame-options"
   ```

**Resultado Esperado:**

- ✓ Header presente: `X-Frame-Options: DENY`
- ✓ Valor deve ser exatamente `DENY` (bloqueia totalmente uso em iframes)

**Como verificar:**

- Confirme que o valor é `DENY` (não `SAMEORIGIN` nem ausente)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5: Validar X-Content-Type-Options (Previne MIME Sniffing)

**Objetivo:** Verificar se o header está prevenindo MIME type sniffing

**Passos:**

1. Execute o cURL:
   ```bash
   curl -I http://localhost:3000/health | grep -i "x-content-type-options"
   ```

**Resultado Esperado:**

- ✓ Header presente: `X-Content-Type-Options: nosniff`

**Como verificar:**

- Confirme que o valor é exatamente `nosniff`

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6: Validar Referrer-Policy

**Objetivo:** Verificar se a política de referrer está configurada adequadamente

**Passos:**

1. Execute o cURL:
   ```bash
   curl -I http://localhost:3000/health | grep -i "referrer-policy"
   ```

**Resultado Esperado:**

- ✓ Header presente: `Referrer-Policy: strict-origin-when-cross-origin`

**Como verificar:**

- Confirme que o valor é `strict-origin-when-cross-origin`

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 7: Confirmar Remoção do Header X-Powered-By

**Objetivo:** Verificar se o header que identifica Express.js foi removido

**Passos:**

1. Execute o cURL:
   ```bash
   curl -I http://localhost:3000/health | grep -i "x-powered-by"
   ```

**Resultado Esperado:**

- ✓ **Nenhum resultado** deve ser retornado (o header NÃO deve estar presente)
- ✓ O comando não deve retornar linha alguma

**Resultado Indesejado:**

- ✗ Se aparecer `X-Powered-By: Express`, o Helmet não está removendo o header

**Como verificar:**

- Se o grep não retornar nada = **SUCESSO** (header foi removido)
- Se aparecer alguma linha com `X-Powered-By` = **FALHA**

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTE DE INTEGRAÇÃO

### Teste 8: Headers Presentes em Diferentes Rotas

**Objetivo:** Verificar se os headers de segurança são aplicados em todas as rotas da API

**Passos:**

1. Teste rota de health check:
   ```bash
   curl -I http://localhost:3000/health
   ```

2. Teste rota base da API:
   ```bash
   curl -I http://localhost:3000/api/v1
   ```

3. Teste rota inexistente (404):
   ```bash
   curl -I http://localhost:3000/rota-inexistente
   ```

**Resultado Esperado:**

- ✓ **Todos os headers de segurança** devem estar presentes nas três respostas
- ✓ Não deve haver diferença entre rotas existentes e inexistentes
- ✓ Headers devem ser aplicados globalmente pelo middleware

**Como verificar:**

- Execute os três comandos acima
- Compare se todos os headers (CSP, HSTS, X-Frame-Options, etc.) estão presentes em todas as respostas
- Use este comando para ver todos os headers de uma vez:
  ```bash
  curl -I http://localhost:3000/health 2>&1 | grep -E "(Content-Security-Policy|Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options|Referrer-Policy)"
  ```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔗 TESTE DE COMPATIBILIDADE

### Teste 9: Validar Headers com Browser DevTools

**Objetivo:** Confirmar que os headers são reconhecidos e interpretados corretamente pelos navegadores

**Passos:**

1. Abra o navegador (Chrome, Firefox ou Edge)
2. Acesse: http://localhost:3000/health
3. Abra as **DevTools** (F12)
4. Vá até a aba **Network** (Rede)
5. Recarregue a página (F5)
6. Clique na requisição `health`
7. Visualize a seção **Response Headers**

**Resultado Esperado:**

- ✓ Todos os headers de segurança devem estar visíveis na aba Network
- ✓ Navegador não deve mostrar erros ou avisos relacionados aos headers
- ✓ CSP deve estar ativo (verifique no Console se não há erros de CSP)

**Como verificar:**

1. Na aba Network, procure pelos seguintes headers:
   - `content-security-policy`
   - `strict-transport-security`
   - `x-frame-options`
   - `x-content-type-options`
   - `referrer-policy`

2. Na aba Console, confirme que **não há** erros como:
   - "Refused to load the script... because it violates the Content Security Policy"
   - (Se houver erros de CSP em desenvolvimento, isso é esperado para recursos externos)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🌐 TESTE ONLINE (Opcional - Requer Deploy)

### Teste 10: Análise com SecurityHeaders.com

**Objetivo:** Validar a configuração de segurança com ferramenta online especializada

**⚠️ Importante:** Este teste só pode ser executado após deploy em produção com domínio público

**Passos:**

1. Faça deploy da aplicação em ambiente acessível pela internet
2. Acesse: https://securityheaders.com
3. Digite a URL do seu backend (ex: https://api.seudominio.com)
4. Clique em "Scan"

**Resultado Esperado:**

- ✓ **Grade A ou superior**
- ✓ Content-Security-Policy: Verde (✓)
- ✓ Strict-Transport-Security: Verde (✓)
- ✓ X-Frame-Options: Verde (✓)
- ✓ X-Content-Type-Options: Verde (✓)
- ✓ Referrer-Policy: Verde (✓)

**Como verificar:**

- O site retorna uma nota de A a F
- Cada header tem uma marcação de cor (verde = presente e configurado corretamente)
- Leia as recomendações se a nota for inferior a A

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou | [ ] Aguardando deploy
**Observações:** _[Preencher após execução]_

---

## 🔴 TESTE DE REGRESSÃO

### Teste 11: Verificar se Aplicação Continua Funcional

**Objetivo:** Garantir que os headers de segurança não quebram funcionalidades existentes

**Passos:**

1. Inicie o backend: `npm run dev`
2. Teste a rota de health check:
   ```bash
   curl http://localhost:3000/health
   ```
3. Verifique se a resposta JSON é retornada corretamente

**Resultado Esperado:**

- ✓ Resposta HTTP 200
- ✓ JSON válido retornado:
  ```json
  {
    "status": "ok",
    "message": "Secretaria Online API is running",
    "timestamp": "2025-10-28T..."
  }
  ```
- ✓ Headers de segurança presentes **E** aplicação funcionando normalmente

**Resultado Indesejado:**

- ✗ Erro 500 (Internal Server Error)
- ✗ Resposta vazia ou corrompida
- ✗ Timeout ou servidor não responde

**Como verificar:**

- Execute o comando acima
- Confirme que o JSON é retornado corretamente
- Se houver erro, verifique os logs do servidor

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📊 CHECKLIST FINAL

Antes de marcar a feature como **Concluída**, confirme:

- [ ] Todos os 11 testes foram executados
- [ ] **Pelo menos 90%** dos testes passaram (mínimo 10 de 11)
- [ ] Headers de segurança estão presentes em todas as rotas
- [ ] Aplicação continua funcional após implementação do Helmet
- [ ] README.md foi atualizado com informações sobre segurança
- [ ] backlog.json está marcado como "Em Andamento"

---

## 📝 OBSERVAÇÕES IMPORTANTES

### Diferenças entre Desenvolvimento e Produção

- **HTTP vs HTTPS**: Em desenvolvimento (localhost), o HSTS não tem efeito prático, mas deve estar configurado para produção
- **CSP strictness**: Pode ser necessário ajustar diretivas de CSP em produção se usar CDNs externos
- **X-XSS-Protection**: Header legado, o Helmet moderno pode não incluí-lo (navegadores modernos não precisam)

### Possíveis Ajustes

Se algum teste falhar ou houver conflitos, considere:

1. **CSP muito restritivo**: Ajustar diretivas em `server.js` se precisar permitir recursos externos
2. **CORS + CSP**: Certifique-se que CORS está configurado corretamente (feat-024)
3. **CDNs/Fontes externas**: Adicionar domínios confiáveis às diretivas CSP

### Próximos Passos Após Aprovação

Se todos os testes passarem:

1. Execute: `/versionamento-branch-push` para commitar e fazer push
2. Prossiga para próxima feature: **feat-024 - Configurar CORS**

---

**Última atualização:** 2025-10-28
**Responsável pelos testes:** [Nome do testador]
**Ambiente testado:** [Desenvolvimento/Staging/Produção]
