# PLANO DE TESTES - feat-006: Configurar Sequelize e conexão MySQL

**Feature:** feat-006 - Configurar Sequelize e conexão MySQL
**Grupo:** Banco de Dados e Modelos
**Data de criação:** 2025-10-25
**Status:** Aguardando execução

---

## 🔧 PREPARAÇÃO DO AMBIENTE

### Pré-requisitos

Certifique-se que o ambiente está configurado:

**1. MySQL instalado e rodando:**
```bash
# Linux/Mac
sudo service mysql status

# Windows
net start | findstr MySQL

# Teste de acesso
mysql -u root -p
```

**Esperado:** MySQL está ativo e você consegue fazer login

**2. Dependências do backend instaladas:**
```bash
cd backend
npm install
```

**Esperado:** Instalação sem erros, com `sequelize`, `mysql2` e `sequelize-cli` presentes em `node_modules/`

**3. Banco de dados criado:**
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS secretaria_online CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**Esperado:** Mensagem de sucesso ou "database exists"

### Variáveis de Ambiente Necessárias

Crie o arquivo `backend/.env` com base no `.env.example`:

```bash
cd backend
cp .env.example .env
```

Edite o `.env` e configure OBRIGATORIAMENTE:

- [ ] **DB_HOST** configurada (ex: localhost)
- [ ] **DB_PORT** configurada (ex: 3306)
- [ ] **DB_NAME** configurada (ex: secretaria_online)
- [ ] **DB_USER** configurada (ex: root)
- [ ] **DB_PASSWORD** configurada (sua senha do MySQL)
- [ ] **DB_POOL_MAX** configurada (ex: 25)
- [ ] **DB_POOL_MIN** configurada (ex: 5)
- [ ] **DB_TIMEZONE** configurada (ex: -03:00)

**Verificar arquivo .env:**
```bash
# Linux/Mac
cat .env | grep "^DB_"

# Windows
findstr "^DB_" .env
```

---

## 📋 TESTES FUNCIONAIS

### Teste 1: Validação de Variáveis de Ambiente Obrigatórias

**Objetivo:** Verificar se o sistema detecta corretamente a ausência de variáveis obrigatórias

**Passos:**
1. Renomeie temporariamente o arquivo `.env`:
   ```bash
   mv .env .env.backup
   ```

2. Execute o script de teste de conexão:
   ```bash
   node src/config/test-connection.js
   ```

3. Restaure o arquivo `.env`:
   ```bash
   mv .env.backup .env
   ```

**Resultado Esperado:**
- ✓ Erro claro informando variáveis faltantes:
  ```
  Missing required database environment variables: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
  ```
- ✓ Mensagem instruindo verificar o arquivo `.env.example`
- ✓ Aplicação não tenta conectar sem credenciais

**Como verificar:**
- O erro aparece antes de qualquer tentativa de conexão
- Mensagem é clara e lista todas as variáveis faltantes

**Resultado Indesejado:**
- ✗ Aplicação tenta conectar mesmo sem credenciais
- ✗ Erro genérico sem indicar o problema
- ✗ Aplicação trava sem mensagem de erro

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Conexão Bem-Sucedida com Credenciais Corretas

**Objetivo:** Verificar se a conexão com MySQL funciona com credenciais válidas

**Passos:**
1. Certifique-se que o arquivo `.env` tem credenciais corretas
2. Execute o script de teste:
   ```bash
   node src/config/test-connection.js
   ```

**Resultado Esperado:**
- ✓ Mensagem de sucesso: `✓ Database connection has been established successfully.`
- ✓ Informações de configuração exibidas corretamente:
  - Ambiente (development)
  - Host, Port, Database
  - User
  - Pool Max e Min
- ✓ Próximos passos sugeridos (migrations, seeders)
- ✓ Conexão fechada graciosamente
- ✓ Script termina com exit code 0

**Como verificar:**
```bash
# Executar e verificar exit code
node src/config/test-connection.js
echo $?  # Linux/Mac
echo %errorlevel%  # Windows
```

**Resultado Indesejado:**
- ✗ Timeout na conexão
- ✗ Erro de autenticação
- ✗ Mensagem de erro confusa
- ✗ Conexão não é fechada

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Importação do Módulo de Models

**Objetivo:** Verificar se o arquivo `models/index.js` pode ser importado sem erros

**Passos:**
1. Crie um arquivo de teste temporário:
   ```bash
   cat > src/test-import.js << 'EOF'
   const db = require('./models');
   console.log('✓ Models importados com sucesso!');
   console.log('Sequelize:', typeof db.sequelize);
   console.log('Sequelize Class:', typeof db.Sequelize);
   console.log('testConnection:', typeof db.testConnection);
   console.log('syncDatabase:', typeof db.syncDatabase);
   console.log('closeConnection:', typeof db.closeConnection);
   EOF
   ```

2. Execute o teste:
   ```bash
   node src/test-import.js
   ```

3. Remova o arquivo de teste:
   ```bash
   rm src/test-import.js
   ```

**Resultado Esperado:**
- ✓ Importação sem erros
- ✓ `db.sequelize` é um objeto (tipo: object)
- ✓ `db.Sequelize` é uma função (tipo: function)
- ✓ `db.testConnection` é uma função (tipo: function)
- ✓ `db.syncDatabase` é uma função (tipo: function)
- ✓ `db.closeConnection` é uma função (tipo: function)

**Como verificar:**
- Todos os tipos devem ser exibidos corretamente
- Nenhum erro de `require()` ou `module not found`

**Resultado Indesejado:**
- ✗ Erro `Cannot find module`
- ✗ Erro de sintaxe no arquivo
- ✗ Métodos auxiliares ausentes

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTES DE VALIDAÇÃO

### Teste 4: Credenciais Inválidas (Senha Incorreta)

**Objetivo:** Verificar tratamento de erro quando senha do MySQL está incorreta

**Passos:**
1. Edite temporariamente o `.env` e altere `DB_PASSWORD` para um valor incorreto:
   ```
   DB_PASSWORD=senha_errada_123
   ```

2. Execute o teste de conexão:
   ```bash
   node src/config/test-connection.js
   ```

3. Restaure a senha correta no `.env`

**Resultado Esperado:**
- ✓ Erro detectado: `Unable to connect to the database`
- ✓ Mensagem de erro contém: `Access denied` ou `ER_ACCESS_DENIED_ERROR`
- ✓ Sugestões de verificação exibidas:
  - MySQL está rodando?
  - Credenciais corretas?
  - Banco criado?
  - Permissões adequadas?
- ✓ Exit code 1 (erro)

**Como verificar:**
```bash
node src/config/test-connection.js
echo $?  # Deve retornar 1
```

**Resultado Indesejado:**
- ✗ Aplicação trava sem mensagem de erro
- ✗ Mensagem genérica sem detalhes
- ✗ Exit code 0 (sucesso) mesmo com erro

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5: Banco de Dados Inexistente

**Objetivo:** Verificar erro quando banco de dados especificado não existe

**Passos:**
1. Edite temporariamente o `.env` e altere `DB_NAME`:
   ```
   DB_NAME=banco_que_nao_existe_12345
   ```

2. Execute o teste de conexão:
   ```bash
   node src/config/test-connection.js
   ```

3. Restaure o nome correto no `.env`

**Resultado Esperado:**
- ✓ Erro detectado: `Unable to connect to the database`
- ✓ Mensagem contém: `Unknown database` ou `ER_BAD_DB_ERROR`
- ✓ Exit code 1

**Como verificar:**
- Mensagem de erro clara indicando que o banco não existe
- Sugestão de criar o banco é exibida

**Resultado Indesejado:**
- ✗ Erro genérico sem especificar que é problema de banco inexistente
- ✗ Aplicação tenta criar o banco automaticamente (não deve fazer isso)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6: Host Inválido ou Inacessível

**Objetivo:** Verificar tratamento quando host MySQL está inacessível

**Passos:**
1. Edite temporariamente o `.env`:
   ```
   DB_HOST=host_invalido_999.local
   ```

2. Execute o teste de conexão:
   ```bash
   node src/config/test-connection.js
   ```

3. Restaure o host correto no `.env`

**Resultado Esperado:**
- ✓ Erro de timeout ou `ENOTFOUND`
- ✓ Mensagem indicando problema de conexão com host
- ✓ Exit code 1

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔗 TESTES DE INTEGRAÇÃO

### Teste 7: Configuração de Pool de Conexões

**Objetivo:** Verificar se o pool de conexões está configurado corretamente

**Passos:**
1. Crie arquivo de teste:
   ```bash
   cat > src/test-pool.js << 'EOF'
   const db = require('./models');

   async function testPool() {
     try {
       console.log('Pool Configuration:');
       console.log('- Max:', db.sequelize.config.pool.max);
       console.log('- Min:', db.sequelize.config.pool.min);
       console.log('- Acquire:', db.sequelize.config.pool.acquire);
       console.log('- Idle:', db.sequelize.config.pool.idle);

       // Testar conexão
       await db.testConnection();

       // Fechar
       await db.closeConnection();
       console.log('✓ Pool configurado corretamente!');
       process.exit(0);
     } catch (error) {
       console.error('✗ Erro:', error.message);
       process.exit(1);
     }
   }

   testPool();
   EOF
   ```

2. Execute:
   ```bash
   node src/test-pool.js
   ```

3. Remova o arquivo:
   ```bash
   rm src/test-pool.js
   ```

**Resultado Esperado:**
- ✓ Pool Max = 25 (ou valor definido em DB_POOL_MAX)
- ✓ Pool Min = 5 (ou valor definido em DB_POOL_MIN)
- ✓ Pool Acquire = 30000 (ou valor definido)
- ✓ Pool Idle = 10000 (ou valor definido)
- ✓ Conexão funciona normalmente

**Como verificar:**
- Valores exibidos correspondem ao `.env`
- Se `.env` não define valores, usa defaults

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 8: Charset e Collation Corretos

**Objetivo:** Verificar se a conexão está usando utf8mb4 e collation correto

**Passos:**
1. Conecte ao banco e verifique charset:
   ```bash
   mysql -u root -p -e "
   USE secretaria_online;
   SHOW VARIABLES LIKE 'character_set_database';
   SHOW VARIABLES LIKE 'collation_database';
   "
   ```

**Resultado Esperado:**
- ✓ character_set_database = utf8mb4
- ✓ collation_database = utf8mb4_unicode_ci

**Como verificar:**
```sql
USE secretaria_online;
SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
FROM information_schema.SCHEMATA
WHERE SCHEMA_NAME = 'secretaria_online';
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 9: Timezone Configurado

**Objetivo:** Verificar se o timezone está configurado corretamente

**Passos:**
1. Crie arquivo de teste:
   ```bash
   cat > src/test-timezone.js << 'EOF'
   const db = require('./models');

   console.log('Timezone configurado:', db.sequelize.config.timezone);

   if (db.sequelize.config.timezone === '-03:00' || db.sequelize.config.timezone === process.env.DB_TIMEZONE) {
     console.log('✓ Timezone correto!');
   } else {
     console.log('✗ Timezone incorreto!');
   }
   EOF
   ```

2. Execute:
   ```bash
   node src/test-timezone.js
   ```

3. Remova:
   ```bash
   rm src/test-timezone.js
   ```

**Resultado Esperado:**
- ✓ Timezone = `-03:00` (America/Sao_Paulo) ou valor definido em DB_TIMEZONE

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 10: Configurações de Define (timestamps, underscored, paranoid)

**Objetivo:** Verificar configurações globais de models

**Passos:**
1. Crie arquivo de teste:
   ```bash
   cat > src/test-define.js << 'EOF'
   const db = require('./models');

   console.log('Define Configuration:');
   console.log('- underscored:', db.sequelize.options.define.underscored);
   console.log('- timestamps:', db.sequelize.options.define.timestamps);
   console.log('- paranoid:', db.sequelize.options.define.paranoid);
   console.log('- createdAt:', db.sequelize.options.define.createdAt);
   console.log('- updatedAt:', db.sequelize.options.define.updatedAt);
   console.log('- deletedAt:', db.sequelize.options.define.deletedAt);
   console.log('- freezeTableName:', db.sequelize.options.define.freezeTableName);

   const allCorrect =
     db.sequelize.options.define.underscored === true &&
     db.sequelize.options.define.timestamps === true &&
     db.sequelize.options.define.paranoid === true &&
     db.sequelize.options.define.createdAt === 'created_at' &&
     db.sequelize.options.define.updatedAt === 'updated_at' &&
     db.sequelize.options.define.deletedAt === 'deleted_at' &&
     db.sequelize.options.define.freezeTableName === true;

   if (allCorrect) {
     console.log('\n✓ Todas as configurações corretas!');
   } else {
     console.log('\n✗ Alguma configuração incorreta!');
   }
   EOF
   ```

2. Execute:
   ```bash
   node src/test-define.js
   ```

3. Remova:
   ```bash
   rm src/test-define.js
   ```

**Resultado Esperado:**
- ✓ underscored = true
- ✓ timestamps = true
- ✓ paranoid = true (soft deletes)
- ✓ createdAt = 'created_at'
- ✓ updatedAt = 'updated_at'
- ✓ deletedAt = 'deleted_at'
- ✓ freezeTableName = true

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ⚠️ TESTES DE EDGE CASES

### Teste 11: MySQL Não Está Rodando

**Objetivo:** Verificar comportamento quando MySQL não está ativo

**Passos:**
1. Pare o serviço MySQL:
   ```bash
   # Linux/Mac
   sudo service mysql stop

   # Windows
   net stop MySQL
   ```

2. Execute o teste de conexão:
   ```bash
   node src/config/test-connection.js
   ```

3. Reinicie o MySQL:
   ```bash
   # Linux/Mac
   sudo service mysql start

   # Windows
   net start MySQL
   ```

**Resultado Esperado:**
- ✓ Erro de conexão detectado
- ✓ Mensagem: `ECONNREFUSED` ou similar
- ✓ Sugestão de verificar se MySQL está rodando
- ✓ Exit code 1

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 12: Porta MySQL Incorreta

**Objetivo:** Verificar erro quando porta MySQL está incorreta

**Passos:**
1. Edite `.env`:
   ```
   DB_PORT=9999
   ```

2. Execute:
   ```bash
   node src/config/test-connection.js
   ```

3. Restaure porta correta (3306)

**Resultado Esperado:**
- ✓ Erro de conexão
- ✓ Timeout ou `ECONNREFUSED`
- ✓ Exit code 1

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 13: Valores Extremos para Pool

**Objetivo:** Verificar se valores extremos de pool não quebram a aplicação

**Passos:**
1. Edite `.env`:
   ```
   DB_POOL_MAX=1
   DB_POOL_MIN=1
   ```

2. Execute teste de conexão:
   ```bash
   node src/config/test-connection.js
   ```

3. Restaure valores normais

**Resultado Esperado:**
- ✓ Conexão funciona mesmo com pool mínimo
- ✓ Valores são respeitados (max=1, min=1)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 14: Ambientes Diferentes (development, production, test)

**Objetivo:** Verificar se a configuração funciona para diferentes ambientes

**Passos:**
1. Teste ambiente `development` (padrão):
   ```bash
   NODE_ENV=development node src/config/test-connection.js
   ```

2. Teste ambiente `production`:
   ```bash
   NODE_ENV=production node src/config/test-connection.js
   ```

3. Teste ambiente `test`:
   ```bash
   NODE_ENV=test node src/config/test-connection.js
   ```

**Resultado Esperado:**
- ✓ Development: logging habilitado (queries aparecem no console)
- ✓ Production: logging desabilitado, pool mais conservador
- ✓ Test: usa banco de testes separado, logging desabilitado

**Como verificar:**
- Verifique se as mensagens de log SQL aparecem apenas em development
- Verifique se test tenta conectar em `secretaria_online_test`

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ✅ CHECKLIST FINAL

### Funcionalidade
- [ ] Conexão com MySQL funciona com credenciais corretas
- [ ] Validação de variáveis de ambiente está funcionando
- [ ] Erros de credenciais são tratados adequadamente
- [ ] Pool de conexões está configurado
- [ ] Timezone configurado corretamente
- [ ] Charset e collation corretos (utf8mb4)
- [ ] Configurações de define (underscored, timestamps, paranoid) corretas
- [ ] Métodos auxiliares funcionam (testConnection, closeConnection)

### Código
- [ ] Sem console.log desnecessários
- [ ] Sem código comentado ou "TODO"
- [ ] Funções e métodos documentados
- [ ] Nomes de variáveis claros e descritivos
- [ ] Código segue padrões do projeto (ESLint + Prettier)

### Segurança
- [ ] Credenciais não expostas no código
- [ ] Validação de variáveis de ambiente obrigatórias
- [ ] Tratamento de erros adequado
- [ ] Logs não expõem informações sensíveis

### Documentação
- [ ] README.md atualizado com instruções de Sequelize
- [ ] .env.example atualizado com novas variáveis (DB_TIMEZONE, DB_NAME_TEST)
- [ ] backlog.json atualizado para status "Em Andamento"
- [ ] Comentários inline nos arquivos de configuração

### Arquivos
- [ ] backend/src/config/database.js criado e funcional
- [ ] backend/src/models/index.js criado e funcional
- [ ] backend/src/config/test-connection.js criado e funcional
- [ ] backend/database/migrations/ criado
- [ ] backend/database/seeders/ criado
- [ ] docs/testes/plano-testes-feat-006.md criado

---

## 🛠️ FERRAMENTAS RECOMENDADAS

### Banco de Dados
- **MySQL Workbench** - Interface gráfica para gerenciar MySQL
  - Download: https://www.mysql.com/products/workbench/
  - Útil para: Visualizar banco, executar queries, gerenciar usuários

- **DBeaver** - Cliente universal de banco de dados
  - Download: https://dbeaver.io/
  - Útil para: Gerenciar múltiplos bancos, importar/exportar dados

- **phpMyAdmin** - Interface web para MySQL
  - Geralmente já vem com XAMPP/WAMP
  - Acesso: http://localhost/phpmyadmin

### Terminal
- **Git Bash** (Windows) - Terminal Unix-like
- **Terminal** (Mac/Linux) - Terminal nativo

### Comandos Úteis MySQL
```bash
# Conectar ao MySQL
mysql -u root -p

# Listar bancos
SHOW DATABASES;

# Usar um banco
USE secretaria_online;

# Listar tabelas
SHOW TABLES;

# Ver estrutura de tabela
DESCRIBE nome_da_tabela;

# Ver processos/conexões ativas
SHOW PROCESSLIST;

# Ver variáveis de configuração
SHOW VARIABLES LIKE 'character%';
SHOW VARIABLES LIKE 'collation%';

# Criar usuário e dar permissões
CREATE USER 'usuario'@'localhost' IDENTIFIED BY 'senha';
GRANT ALL PRIVILEGES ON secretaria_online.* TO 'usuario'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📊 RESULTADO FINAL DOS TESTES

**Data de execução:** _[Preencher]_
**Executado por:** _[Preencher]_

### Resumo
- **Total de testes:** 14
- **Testes aprovados:** _[Preencher]_
- **Testes reprovados:** _[Preencher]_
- **Testes não executados:** _[Preencher]_

### Decisão
- [ ] **APROVADO** - Feature pronta para versionamento
- [ ] **REPROVADO** - Necessita ajustes (detalhar abaixo)

### Problemas Encontrados
_[Descrever problemas encontrados durante os testes]_

### Próximas Ações
_[Descrever ações necessárias]_

---

## 📝 NOTAS ADICIONAIS

### Observações sobre o ambiente de teste
_[Adicionar observações sobre SO, versão do Node.js, versão do MySQL, etc.]_

### Dificuldades encontradas
_[Descrever dificuldades ou comportamentos inesperados]_

### Sugestões de melhoria
_[Sugestões para melhorar a feature ou o plano de testes]_
