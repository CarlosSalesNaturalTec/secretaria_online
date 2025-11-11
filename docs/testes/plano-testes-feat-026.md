# PLANO DE TESTES - feat-026: Configurar Winston para logging

**Feature:** feat-026 - Configurar Winston para logging
**Grupo:** Backend - Middlewares e Utilitários
**Data de criação:** 2025-10-28
**Status:** Aguardando execução

---

## 📋 TESTE FUNCIONAL 1 - Instalação e Configuração Básica

### Teste: Verificar se Winston foi instalado corretamente

**Objetivo:** Validar que o pacote winston foi instalado e está disponível no projeto

**Passos:**
1. Acessar diretório do backend:
   ```bash
   cd backend
   ```

2. Verificar se winston está listado nas dependências:
   ```bash
   npm list winston
   ```

3. Verificar se o arquivo logger.js foi criado:
   ```bash
   ls -la src/utils/logger.js
   ```

4. Verificar se o diretório de logs foi criado:
   ```bash
   ls -la logs/
   ```

**Resultado Esperado:**
- ✓ Winston deve aparecer na lista de dependências com versão 3.x
- ✓ Arquivo `src/utils/logger.js` deve existir
- ✓ Diretório `logs/` deve existir com arquivo `.gitkeep`
- ✓ Arquivos de log NÃO devem existir ainda (combined.log, error.log)

**Como verificar:**
- Comando `npm list winston` retorna versão instalada sem erros
- Comando `ls` mostra os arquivos/diretórios existentes
- Arquivo `.gitignore` deve conter padrão `logs/*.log` para ignorar arquivos de log

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE FUNCIONAL 2 - Logger em Ambiente de Desenvolvimento

### Teste: Validar comportamento do logger em desenvolvimento

**Objetivo:** Verificar se o logger exibe logs no console em formato legível durante desenvolvimento

**Passos:**
1. Configurar ambiente de desenvolvimento:
   ```bash
   cd backend
   # Certifique-se que o .env contém:
   # NODE_ENV=development
   # LOG_LEVEL=debug
   # LOG_TO_FILE=false
   ```

2. Criar arquivo de teste temporário `test-logger.js`:
   ```javascript
   require('dotenv').config();
   const logger = require('./src/utils/logger');

   logger.error('Teste de erro', { codigo: 'ERR001', usuario: 'admin' });
   logger.warn('Teste de aviso', { acao: 'login_falhou' });
   logger.info('Teste de info', { operacao: 'criar_usuario' });
   logger.debug('Teste de debug', { cpf: '123.456.789-00' });

   logger.logUserAction('login', { userId: 123, ip: '127.0.0.1' });
   logger.logError('TestContext', new Error('Erro simulado'), { details: 'teste' });

   console.log('\n✓ Se você viu os logs coloridos acima, o teste passou!');
   ```

3. Executar o teste:
   ```bash
   node test-logger.js
   ```

4. Verificar que logs NÃO foram salvos em arquivo:
   ```bash
   ls logs/
   # Deve mostrar apenas .gitkeep
   ```

5. Remover arquivo de teste:
   ```bash
   rm test-logger.js
   ```

**Resultado Esperado:**
- ✓ Logs devem aparecer no console com cores (error em vermelho, warn em amarelo, etc.)
- ✓ Formato legível: `2025-10-28 HH:mm:ss [level]: message {metadata}`
- ✓ Todos os 6 logs devem aparecer (error, warn, info, debug, logUserAction, logError)
- ✓ NENHUM arquivo de log deve ser criado em `logs/` (apenas console)
- ✓ Timestamp deve estar no formato `YYYY-MM-DD HH:mm:ss`

**Como verificar:**
- Logs aparecem coloridos no terminal
- Mensagens contêm timestamp, nível e metadata
- Diretório `logs/` permanece vazio (exceto .gitkeep)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE FUNCIONAL 3 - Logger em Ambiente de Produção

### Teste: Validar comportamento do logger em produção (com arquivos)

**Objetivo:** Verificar se o logger grava logs em arquivos JSON no modo produção

**Passos:**
1. Configurar ambiente de produção temporariamente:
   ```bash
   cd backend
   # Criar .env.test com:
   cat > .env.test << 'EOF'
   NODE_ENV=production
   LOG_LEVEL=info
   EOF
   ```

2. Criar arquivo de teste `test-logger-prod.js`:
   ```javascript
   require('dotenv').config({ path: '.env.test' });
   const logger = require('./src/utils/logger');

   logger.error('Erro crítico em produção', { codigo: 'ERR500', stack: 'test stack' });
   logger.warn('Aviso de segurança', { tentativas: 5, ip: '192.168.1.100' });
   logger.info('Usuário criado', { userId: 456, role: 'student' });
   logger.debug('Debug não deve aparecer em info level', { teste: true });

   // Aguardar gravação dos logs
   setTimeout(() => {
     console.log('\n✓ Logs gravados! Verificar arquivos agora.');
   }, 1000);
   ```

3. Executar o teste:
   ```bash
   node test-logger-prod.js
   ```

4. Verificar arquivos de log criados:
   ```bash
   # Deve mostrar combined.log e error.log
   ls -lh logs/

   # Ver conteúdo de combined.log (deve ter 3 logs: error, warn, info)
   cat logs/combined.log

   # Ver conteúdo de error.log (deve ter apenas 1 log: error)
   cat logs/error.log
   ```

5. Validar formato JSON dos logs:
   ```bash
   # Cada linha deve ser um JSON válido
   head -n 1 logs/combined.log | python -m json.tool
   ```

6. Limpar teste:
   ```bash
   rm test-logger-prod.js .env.test
   rm logs/combined.log logs/error.log
   ```

**Resultado Esperado:**
- ✓ Arquivo `logs/combined.log` deve ser criado com 3 entradas (error, warn, info)
- ✓ Arquivo `logs/error.log` deve ser criado com 1 entrada (apenas error)
- ✓ Log de `debug` NÃO deve aparecer (LOG_LEVEL=info ignora debug)
- ✓ Cada linha dos arquivos deve ser um JSON válido
- ✓ JSON deve conter campos: timestamp, level, message, metadata
- ✓ Timestamp no formato: `YYYY-MM-DD HH:mm:ss`

**Como verificar:**
- Arquivos de log existem e não estão vazios
- `combined.log` contém logs de múltiplos níveis
- `error.log` contém APENAS logs de erro
- Comando `python -m json.tool` valida JSON sem erros

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE FUNCIONAL 4 - Níveis de Log

### Teste: Validar hierarquia de níveis de log

**Objetivo:** Verificar que LOG_LEVEL controla corretamente quais logs são exibidos

**Passos:**
1. Criar script de teste `test-log-levels.js`:
   ```javascript
   require('dotenv').config();

   function testLogLevel(level) {
     process.env.LOG_LEVEL = level;
     process.env.NODE_ENV = 'development';

     // Limpar cache do módulo para recarregar com novo LOG_LEVEL
     delete require.cache[require.resolve('./src/utils/logger')];
     const logger = require('./src/utils/logger');

     console.log(`\n========== Testando LOG_LEVEL=${level} ==========`);
     logger.error('1. ERRO');
     logger.warn('2. WARN');
     logger.info('3. INFO');
     logger.http('4. HTTP');
     logger.verbose('5. VERBOSE');
     logger.debug('6. DEBUG');
   }

   // Testar cada nível
   testLogLevel('error');   // Deve mostrar apenas: 1
   testLogLevel('warn');    // Deve mostrar: 1, 2
   testLogLevel('info');    // Deve mostrar: 1, 2, 3
   testLogLevel('http');    // Deve mostrar: 1, 2, 3, 4
   testLogLevel('verbose'); // Deve mostrar: 1, 2, 3, 4, 5
   testLogLevel('debug');   // Deve mostrar: 1, 2, 3, 4, 5, 6

   console.log('\n✓ Teste concluído! Verifique se os logs apareceram conforme esperado.');
   ```

2. Executar teste:
   ```bash
   cd backend
   node test-log-levels.js
   ```

3. Analisar saída e validar hierarquia

4. Limpar:
   ```bash
   rm test-log-levels.js
   ```

**Resultado Esperado:**
- ✓ `LOG_LEVEL=error`: Mostrar APENAS logs de erro
- ✓ `LOG_LEVEL=warn`: Mostrar error + warn
- ✓ `LOG_LEVEL=info`: Mostrar error + warn + info
- ✓ `LOG_LEVEL=http`: Mostrar error + warn + info + http
- ✓ `LOG_LEVEL=verbose`: Mostrar error + warn + info + http + verbose
- ✓ `LOG_LEVEL=debug`: Mostrar TODOS os logs (error até debug)

**Como verificar:**
- Contar quantos logs aparecem em cada seção
- Ordem deve ser sempre: error → warn → info → http → verbose → debug
- Níveis superiores incluem todos os inferiores

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE FUNCIONAL 5 - Helpers Especializados

### Teste: Validar funcionamento dos helpers logUserAction e logError

**Objetivo:** Garantir que funções auxiliares formatam logs corretamente

**Passos:**
1. Criar script de teste `test-logger-helpers.js`:
   ```javascript
   require('dotenv').config();
   const logger = require('./src/utils/logger');

   console.log('=== Testando logger.logUserAction ===\n');

   logger.logUserAction('login', {
     userId: 123,
     role: 'admin',
     ip: '192.168.1.1'
   });

   logger.logUserAction('document_upload', {
     userId: 456,
     documentType: 'RG',
     fileName: 'rg-frente.pdf'
   });

   console.log('\n=== Testando logger.logError ===\n');

   const erro1 = new Error('Falha na validação de CPF');
   erro1.code = 'VALIDATION_ERROR';
   logger.logError('StudentController.create', erro1, {
     cpf: '123.456.789-00',
     userId: 789
   });

   const erro2 = new Error('Banco de dados inacessível');
   logger.logError('DatabaseConnection', erro2);

   console.log('\n✓ Logs gravados! Verifique o formato acima.');
   ```

2. Executar teste:
   ```bash
   cd backend
   node test-logger-helpers.js
   ```

3. Validar formato dos logs exibidos

4. Limpar:
   ```bash
   rm test-logger-helpers.js
   ```

**Resultado Esperado:**

**Para logUserAction:**
- ✓ Log nível `info`
- ✓ Mensagem no formato: `User action: <action>`
- ✓ Metadata deve incluir: action, timestamp (ISO), ...dados adicionais
- ✓ Exemplo: `User action: login {"action":"login","userId":123,"role":"admin","ip":"192.168.1.1","timestamp":"2025-10-28T..."}`

**Para logError:**
- ✓ Log nível `error`
- ✓ Mensagem no formato: `[<context>] <error.message>`
- ✓ Metadata deve incluir: context, error.message, error.stack, error.name, ...dados adicionais
- ✓ Stack trace completa deve estar presente
- ✓ Exemplo: `[StudentController.create] Falha na validação de CPF {"context":"StudentController.create","error":{...},"cpf":"...","userId":789}`

**Como verificar:**
- Logs aparecem com formato esperado no console
- Campos obrigatórios estão presentes
- Stack trace é legível e completa

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE FUNCIONAL 6 - Rotação de Logs

### Teste: Validar limite de tamanho e rotação de arquivos de log

**Objetivo:** Verificar que logs são rotacionados ao atingir 5MB e mantém histórico de 5 arquivos

**Passos:**
1. Configurar ambiente:
   ```bash
   cd backend
   # Criar .env.test
   cat > .env.test << 'EOF'
   NODE_ENV=production
   LOG_LEVEL=info
   EOF
   ```

2. Criar script para gerar logs grandes `test-log-rotation.js`:
   ```javascript
   require('dotenv').config({ path: '.env.test' });
   const logger = require('./src/utils/logger');
   const fs = require('fs');

   console.log('Gerando logs para testar rotação (isso pode demorar)...\n');

   // Gerar ~6MB de logs (mais que o limite de 5MB)
   const bigString = 'x'.repeat(1000); // 1KB

   for (let i = 0; i < 7000; i++) {
     logger.info(`Log número ${i}`, { data: bigString });

     // Feedback a cada 1000 logs
     if (i % 1000 === 0) {
       const size = fs.statSync('logs/combined.log').size / 1024 / 1024;
       console.log(`${i} logs gerados - Tamanho: ${size.toFixed(2)} MB`);
     }
   }

   console.log('\n✓ Logs gerados! Verificar arquivos rotacionados.');
   ```

3. Executar teste:
   ```bash
   node test-log-rotation.js
   ```

4. Verificar arquivos rotacionados:
   ```bash
   ls -lh logs/
   # Deve mostrar: combined.log, combined.log.1, etc.
   ```

5. Verificar tamanho dos arquivos:
   ```bash
   du -h logs/*
   # Nenhum arquivo deve exceder ~5MB
   ```

6. Limpar:
   ```bash
   rm test-log-rotation.js .env.test
   rm -rf logs/*.log*
   ```

**Resultado Esperado:**
- ✓ Quando `combined.log` atinge ~5MB, é renomeado para `combined.log.1`
- ✓ Novo arquivo `combined.log` é criado
- ✓ Processo se repete, criando `combined.log.2`, `.3`, etc.
- ✓ Máximo de 5 arquivos de histórico são mantidos (combined.log + .1 até .5)
- ✓ Arquivos mais antigos são automaticamente excluídos
- ✓ Mesmo comportamento para `error.log`

**Como verificar:**
- Comando `ls logs/` mostra múltiplos arquivos numerados
- Tamanho dos arquivos não excede 5-6MB
- Total de arquivos não excede 6 (1 atual + 5 históricos)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução - Teste demorado, pode levar 1-2 minutos]_

---

## 📋 TESTE FUNCIONAL 7 - Integração com Morgan (HTTP Logger)

### Teste: Validar stream para integração com Morgan

**Objetivo:** Verificar que logger.stream funciona corretamente para logging de requisições HTTP

**Passos:**
1. Criar script de teste `test-morgan-integration.js`:
   ```javascript
   require('dotenv').config();
   const logger = require('./src/utils/logger');

   console.log('=== Testando logger.stream para Morgan ===\n');

   // Simular mensagens do Morgan
   const messages = [
     'GET /api/users 200 123ms',
     'POST /api/auth/login 200 45ms',
     'GET /api/students/123 404 12ms',
     'PUT /api/courses/5 500 234ms\n' // Com newline no final
   ];

   messages.forEach(msg => {
     logger.stream.write(msg);
   });

   console.log('\n✓ Se você viu 4 logs [http] acima sem newlines extras, o stream funciona!');
   ```

2. Executar teste:
   ```bash
   cd backend
   node test-morgan-integration.js
   ```

3. Verificar formato dos logs

4. Limpar:
   ```bash
   rm test-morgan-integration.js
   ```

**Resultado Esperado:**
- ✓ Cada mensagem deve aparecer como log de nível `http`
- ✓ Newlines no final devem ser removidos automaticamente (método `.trim()`)
- ✓ Formato: `timestamp [http]: <mensagem>`
- ✓ Não deve haver linhas em branco entre os logs

**Como verificar:**
- 4 logs aparecem no console
- Todos no nível `http` (colorido apropriadamente)
- Sem linhas em branco entre logs
- Mensagens exatamente como enviadas (sem modificações além do trim)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE FUNCIONAL 8 - Modo Silencioso em Testes

### Teste: Validar que logger fica silencioso quando NODE_ENV=test

**Objetivo:** Garantir que logs não poluem output de testes automatizados

**Passos:**
1. Criar script de teste `test-silent-mode.js`:
   ```javascript
   process.env.NODE_ENV = 'test';

   // Limpar cache para recarregar logger com NODE_ENV=test
   delete require.cache[require.resolve('./src/utils/logger')];
   const logger = require('./src/utils/logger');

   console.log('=== Modo silencioso ativado (NODE_ENV=test) ===\n');
   console.log('Os logs abaixo NÃO devem aparecer:\n');

   logger.error('Este erro NÃO deve aparecer');
   logger.warn('Este warning NÃO deve aparecer');
   logger.info('Este info NÃO deve aparecer');
   logger.debug('Este debug NÃO deve aparecer');
   logger.logUserAction('login', { userId: 123 });
   logger.logError('TestContext', new Error('Erro de teste'));

   console.log('\n=== Fim do teste ===');
   console.log('✓ Se você NÃO viu nenhum log entre as mensagens acima, o teste passou!');
   ```

2. Executar teste:
   ```bash
   cd backend
   node test-silent-mode.js
   ```

3. Verificar que NENHUM log do logger aparece

4. Limpar:
   ```bash
   rm test-silent-mode.js
   ```

**Resultado Esperado:**
- ✓ NENHUM log do Winston deve aparecer
- ✓ Apenas as mensagens `console.log` do script devem ser visíveis
- ✓ Logs entre "Modo silencioso ativado" e "Fim do teste" devem estar vazios
- ✓ Nenhum arquivo de log deve ser criado em `logs/`

**Como verificar:**
- Executar o script e contar quantos logs aparecem (deve ser 0)
- Apenas 3 linhas visíveis: título, instrução, conclusão
- Diretório `logs/` permanece vazio

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE DE INTEGRAÇÃO 1 - Logger no Server.js (Futuro)

### Teste: Integrar logger no arquivo server.js para logging real

**Objetivo:** Validar integração do logger com o servidor Express (quando implementado)

**Passos:**
1. Após implementar `server.js`, adicionar logger:
   ```javascript
   const logger = require('./utils/logger');
   const morgan = require('morgan');

   // Logging HTTP com Morgan
   app.use(morgan('combined', { stream: logger.stream }));

   // Exemplo de uso em rotas
   app.post('/api/auth/login', (req, res) => {
     logger.info('Tentativa de login', { login: req.body.login });
     // ... lógica de autenticação
   });
   ```

2. Iniciar servidor:
   ```bash
   npm run dev
   ```

3. Fazer requisições HTTP de teste:
   ```bash
   curl http://localhost:3000/api/health
   curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"login":"admin","password":"wrong"}'
   ```

4. Verificar logs no console/arquivo

**Resultado Esperado:**
- ✓ Requisições HTTP devem gerar logs via Morgan
- ✓ Operações da aplicação devem gerar logs apropriados
- ✓ Em desenvolvimento: logs coloridos no console
- ✓ Em produção: logs em arquivos JSON
- ✓ Erros devem incluir stack trace completa

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Executar após implementar server.js completo]_

---

## ✅ CHECKLIST DE VALIDAÇÃO FINAL

Antes de marcar a feature como concluída, verificar:

### Arquivos Criados
- [ ] `backend/src/utils/logger.js` existe e está completo
- [ ] `backend/logs/.gitkeep` existe
- [ ] `backend/.gitignore` ignora `logs/*.log`

### Funcionalidades
- [ ] Logger funciona em modo desenvolvimento (console)
- [ ] Logger funciona em modo produção (arquivos)
- [ ] Níveis de log são respeitados (error > warn > info > debug)
- [ ] Formato JSON estruturado em produção
- [ ] Formato legível/colorido em desenvolvimento
- [ ] Rotação de logs funciona (5MB, 5 arquivos)
- [ ] Modo silencioso em testes (NODE_ENV=test)

### Helpers
- [ ] `logger.logUserAction()` funciona corretamente
- [ ] `logger.logError()` funciona corretamente
- [ ] `logger.stream` funciona para Morgan

### Documentação
- [ ] README.md atualizado com seção de Logging
- [ ] Exemplos de uso estão claros
- [ ] Variáveis de ambiente documentadas
- [ ] Comandos de monitoramento documentados

### Backlog
- [ ] `backlog.json` atualizado com status "Em Andamento"

---

## 📝 OBSERVAÇÕES GERAIS

**Ambiente de teste:**
- Node.js: v20 LTS
- Sistema operacional: Windows/Linux/MacOS
- Winston: v3.x

**Tempo estimado de execução:**
- Testes 1-5: ~10 minutos
- Teste 6 (rotação): ~2-5 minutos
- Testes 7-8: ~5 minutos
- **Total: ~20-25 minutos**

**Notas importantes:**
- Todos os scripts de teste devem ser executados a partir do diretório `backend/`
- Arquivos de teste temporários devem ser removidos após execução
- Logs de teste devem ser apagados para não poluir o repositório
- Em caso de falha, verificar permissões de escrita no diretório `logs/`

**Critérios de aprovação:**
- Todos os testes funcionais (1-8) devem passar
- Documentação deve estar completa e clara
- Não deve haver warnings ou erros durante os testes
- Logger não deve impactar performance significativamente
