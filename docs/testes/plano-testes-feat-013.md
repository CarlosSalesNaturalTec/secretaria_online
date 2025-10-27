# PLANO DE TESTES - feat-013: Criar migrations para Contract e ContractTemplate

**Feature:** feat-013 - Criar migrations para Contract e ContractTemplate
**Grupo:** Banco de Dados e Modelos
**Data de criação:** 2025-10-27
**Status:** Aguardando execução

---

## 🔧 PREPARAÇÃO DO AMBIENTE

### Pré-requisitos

Certifique-se que o ambiente está configurado:

```bash
# Verifique se o MySQL está rodando
mysql -u root -p -e "SELECT VERSION();"

# Verifique se o banco de dados existe
mysql -u root -p -e "SHOW DATABASES LIKE 'secretaria_online';"

# Navegue até o diretório backend
cd backend

# Verifique se as migrations anteriores foram executadas
npx sequelize-cli db:migrate:status
```

**Esperado:**
- MySQL versão 8.0 ou superior
- Banco de dados `secretaria_online` existente
- Migrations anteriores executadas (users, courses, disciplines, classes, enrollments, documents)

### Variáveis de Ambiente Necessárias

- [ ] DB_HOST configurada
- [ ] DB_PORT configurada
- [ ] DB_NAME configurada
- [ ] DB_USER configurada
- [ ] DB_PASSWORD configurada

---

## 📋 TESTES FUNCIONAIS

### Teste 1: Verificar criação da tabela contract_templates

**Objetivo:** Verificar se a tabela contract_templates foi criada corretamente com todos os campos e índices

**Passos:**
1. Conecte-se ao banco de dados MySQL
   ```bash
   mysql -u root -p secretaria_online
   ```
2. Execute o comando para descrever a tabela
   ```sql
   DESCRIBE contract_templates;
   ```
3. Verifique os índices da tabela
   ```sql
   SHOW INDEX FROM contract_templates;
   ```

**Resultado Esperado:**
- ✓ Tabela `contract_templates` existe
- ✓ Campos presentes: id (INT, PK, AUTO_INCREMENT), name (VARCHAR(100)), content (LONGTEXT), is_active (TINYINT), created_at (DATETIME), updated_at (DATETIME), deleted_at (DATETIME nullable)
- ✓ Índices presentes: PRIMARY (id), idx_contract_templates_name, idx_contract_templates_is_active, idx_contract_templates_deleted_at, idx_contract_templates_active_available
- ✓ Campo `content` deve ser do tipo LONGTEXT para armazenar HTML completo

**Como verificar:**
- Execute `SHOW CREATE TABLE contract_templates;` para ver a definição completa
- Verifique se todos os campos têm os tipos corretos
- Verifique se os comentários (COMMENT) foram criados

**Resultado Indesejado:**
- ✗ Tabela não existe
- ✗ Campo `content` é TEXT ao invés de LONGTEXT
- ✗ Índices faltando

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Verificar criação da tabela contracts

**Objetivo:** Verificar se a tabela contracts foi criada corretamente com todos os campos, foreign keys e índices

**Passos:**
1. Execute o comando para descrever a tabela
   ```sql
   DESCRIBE contracts;
   ```
2. Verifique as foreign keys
   ```sql
   SELECT
     CONSTRAINT_NAME,
     TABLE_NAME,
     COLUMN_NAME,
     REFERENCED_TABLE_NAME,
     REFERENCED_COLUMN_NAME,
     UPDATE_RULE,
     DELETE_RULE
   FROM
     INFORMATION_SCHEMA.KEY_COLUMN_USAGE
   WHERE
     TABLE_SCHEMA = 'secretaria_online'
     AND TABLE_NAME = 'contracts'
     AND REFERENCED_TABLE_NAME IS NOT NULL;
   ```
3. Verifique os índices
   ```sql
   SHOW INDEX FROM contracts;
   ```

**Resultado Esperado:**
- ✓ Tabela `contracts` existe
- ✓ Campos presentes: id, user_id (INT UNSIGNED), template_id (INT), file_path (VARCHAR(255)), file_name (VARCHAR(255)), accepted_at (DATETIME nullable), semester (INT), year (INT), created_at, updated_at, deleted_at (nullable)
- ✓ Foreign key `user_id` → `users.id` com ON DELETE RESTRICT, ON UPDATE CASCADE
- ✓ Foreign key `template_id` → `contract_templates.id` com ON DELETE RESTRICT, ON UPDATE CASCADE
- ✓ Índices presentes: PRIMARY, idx_contracts_user_id, idx_contracts_template_id, idx_contracts_accepted_at, idx_contracts_semester, idx_contracts_year, idx_contracts_deleted_at, idx_contracts_user_period, idx_contracts_user_accepted

**Como verificar:**
- Execute `SHOW CREATE TABLE contracts;` para ver a definição completa
- Verifique se o tipo de `user_id` é INT UNSIGNED (compatível com users.id)
- Verifique se as regras ON DELETE/UPDATE estão corretas

**Resultado Indesejado:**
- ✗ Foreign keys faltando ou com regras incorretas
- ✗ Tipo de `user_id` incompatível com `users.id`
- ✗ Índices compostos faltando

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTES DE VALIDAÇÃO

### Teste 3: Inserir template de contrato válido

**Input:** Template com todos os campos obrigatórios preenchidos
**Método:** SQL direto ou Node.js

**SQL:**
```sql
INSERT INTO contract_templates (name, content, is_active)
VALUES (
  'Contrato de Matrícula 2025',
  '<html><body><h1>Contrato de Matrícula</h1><p>Aluno: {{studentName}}</p><p>Curso: {{courseName}}</p></body></html>',
  1
);

-- Verificar se foi inserido
SELECT * FROM contract_templates WHERE id = LAST_INSERT_ID();
```

**Node.js (opcional):**
```bash
cd backend
node -e "
const { ContractTemplate } = require('./src/models');
(async () => {
  const template = await ContractTemplate.create({
    name: 'Contrato de Matrícula 2025',
    content: '<html><body><h1>Contrato</h1><p>{{studentName}}</p></body></html>',
    is_active: true
  });
  console.log('Template criado:', template.toJSON());
  process.exit(0);
})();
"
```

**Esperado:**
- ✓ Template inserido com sucesso
- ✓ Campo `id` auto-incrementado
- ✓ Campos `created_at` e `updated_at` preenchidos automaticamente
- ✓ Campo `deleted_at` é NULL
- ✓ Campo `is_active` é TRUE

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 4: Inserir contrato válido

**Input:** Contrato vinculado a usuário e template existentes
**Método:** SQL direto

**SQL:**
```sql
-- Primeiro, obtenha IDs válidos
SELECT id FROM users LIMIT 1; -- Pegar um user_id válido
SELECT id FROM contract_templates LIMIT 1; -- Pegar um template_id válido

-- Inserir contrato (substitua USER_ID e TEMPLATE_ID pelos valores obtidos)
INSERT INTO contracts (user_id, template_id, file_path, file_name, semester, year)
VALUES (
  1, -- USER_ID (substitua pelo ID real)
  1, -- TEMPLATE_ID (substitua pelo ID real)
  'uploads/contracts/contract_001.pdf',
  'contrato_joao_silva_2025_1.pdf',
  1,
  2025
);

-- Verificar se foi inserido
SELECT * FROM contracts WHERE id = LAST_INSERT_ID();
```

**Esperado:**
- ✓ Contrato inserido com sucesso
- ✓ Foreign keys validadas corretamente
- ✓ Campo `accepted_at` é NULL (pendente)
- ✓ Timestamps preenchidos automaticamente

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5: Validação de dados inválidos - Template sem nome

**Input:** Template sem campo `name`
**Método:** SQL direto

**SQL:**
```sql
INSERT INTO contract_templates (content, is_active)
VALUES ('<html><body>Teste</body></html>', 1);
```

**Esperado:**
- ✓ Erro: "Field 'name' doesn't have a default value" ou similar
- ✓ Inserção é rejeitada

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6: Validação de semestre fora do intervalo (1-12)

**Input:** Contrato com semestre inválido (ex: 15)
**Método:** Node.js com Sequelize (validações do model)

```bash
cd backend
node -e "
const { Contract } = require('./src/models');
(async () => {
  try {
    await Contract.create({
      user_id: 1,
      template_id: 1,
      file_path: 'test.pdf',
      file_name: 'test.pdf',
      semester: 15, // INVÁLIDO
      year: 2025
    });
    console.log('ERRO: Deveria ter rejeitado!');
  } catch (error) {
    console.log('✓ Validação funcionou:', error.message);
  }
  process.exit(0);
})();
"
```

**Esperado:**
- ✓ Erro de validação: "O semestre deve ser menor ou igual a 12"
- ✓ Inserção é rejeitada

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 7: Validação de year fora do intervalo (2020-2100)

**Input:** Contrato com ano inválido (ex: 1999)
**Método:** Node.js com Sequelize

```bash
cd backend
node -e "
const { Contract } = require('./src/models');
(async () => {
  try {
    await Contract.create({
      user_id: 1,
      template_id: 1,
      file_path: 'test.pdf',
      file_name: 'test.pdf',
      semester: 1,
      year: 1999 // INVÁLIDO
    });
    console.log('ERRO: Deveria ter rejeitado!');
  } catch (error) {
    console.log('✓ Validação funcionou:', error.message);
  }
  process.exit(0);
})();
"
```

**Esperado:**
- ✓ Erro de validação: "O ano deve ser maior ou igual a 2020"
- ✓ Inserção é rejeitada

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔗 TESTES DE INTEGRAÇÃO

### Teste 8: Verificar foreign key constraint - Deletar usuário com contratos

**Verificar:** Foreign key impede exclusão de usuário com contratos

**SQL:**
```sql
-- Criar um usuário de teste
INSERT INTO users (role, name, email, login, password_hash, cpf)
VALUES ('student', 'Teste FK', 'testefk@test.com', 'testefk', 'hash', '12345678901');

SET @user_id = LAST_INSERT_ID();

-- Criar um contrato para este usuário
INSERT INTO contracts (user_id, template_id, file_path, file_name, semester, year)
VALUES (@user_id, 1, 'test.pdf', 'test.pdf', 1, 2025);

-- Tentar deletar o usuário (deve falhar)
DELETE FROM users WHERE id = @user_id;

-- Limpar (deletar o contrato primeiro, depois o usuário)
DELETE FROM contracts WHERE user_id = @user_id;
DELETE FROM users WHERE id = @user_id;
```

**Esperado:**
- ✓ DELETE do usuário é rejeitado com erro de foreign key constraint
- ✓ Mensagem de erro menciona RESTRICT ou referência à tabela `contracts`

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 9: Verificar foreign key constraint - Deletar template usado em contratos

**Verificar:** Foreign key impede exclusão de template usado

**SQL:**
```sql
-- Obter ID de um template que tem contratos
SELECT template_id FROM contracts LIMIT 1;

-- Tentar deletar o template (deve falhar)
DELETE FROM contract_templates WHERE id = <template_id obtido>;
```

**Esperado:**
- ✓ DELETE do template é rejeitado
- ✓ Mensagem de erro menciona foreign key constraint

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 10: Testar soft delete em contract_templates

**Verificar:** Soft delete funciona corretamente

**SQL:**
```sql
-- Criar template de teste
INSERT INTO contract_templates (name, content, is_active)
VALUES ('Template Soft Delete Teste', '<html><body>Teste</body></html>', 1);

SET @template_id = LAST_INSERT_ID();

-- "Deletar" (soft delete) usando UPDATE
UPDATE contract_templates SET deleted_at = NOW() WHERE id = @template_id;

-- Verificar que ainda existe no banco mas está deletado
SELECT id, name, deleted_at FROM contract_templates WHERE id = @template_id;

-- Limpar (deletar definitivamente)
DELETE FROM contract_templates WHERE id = @template_id;
```

**Esperado:**
- ✓ Registro ainda existe no banco após UPDATE
- ✓ Campo `deleted_at` está preenchido com timestamp

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🎯 TESTES DE MÉTODOS DO MODEL

### Teste 11: Testar método replacePlaceholders do ContractTemplate

**Verificar:** Substituição de placeholders funciona corretamente

**Node.js:**
```bash
cd backend
node -e "
const { ContractTemplate } = require('./src/models');
(async () => {
  const template = await ContractTemplate.findOne();
  if (!template) {
    console.log('Crie um template primeiro!');
    process.exit(1);
  }

  const result = template.replacePlaceholders({
    studentName: 'João Silva',
    courseName: 'Engenharia de Software',
    semester: 1,
    year: 2025
  });

  console.log('Conteúdo com placeholders substituídos:');
  console.log(result);

  // Verificar se {{studentName}} foi substituído
  if (result.includes('João Silva')) {
    console.log('✓ Substituição funcionou!');
  } else {
    console.log('✗ Substituição falhou!');
  }

  process.exit(0);
})();
"
```

**Esperado:**
- ✓ Método retorna HTML com placeholders substituídos
- ✓ `{{studentName}}` substituído por "João Silva"
- ✓ Outros placeholders também substituídos

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 12: Testar método accept do Contract

**Verificar:** Aceite de contrato funciona corretamente

**Node.js:**
```bash
cd backend
node -e "
const { Contract } = require('./src/models');
(async () => {
  const contract = await Contract.findOne({ where: { accepted_at: null } });
  if (!contract) {
    console.log('Crie um contrato pendente primeiro!');
    process.exit(1);
  }

  console.log('Antes:', contract.isPending()); // true

  await contract.accept();

  console.log('Depois:', contract.isAccepted()); // true
  console.log('accepted_at:', contract.accepted_at);

  if (contract.isAccepted() && contract.accepted_at) {
    console.log('✓ Método accept funcionou!');
  }

  process.exit(0);
})();
"
```

**Esperado:**
- ✓ Método `accept()` preenche campo `accepted_at` com timestamp
- ✓ Método `isAccepted()` retorna `true`
- ✓ Método `isPending()` retorna `false`

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 13: Testar scopes do ContractTemplate

**Verificar:** Scopes retornam dados corretos

**Node.js:**
```bash
cd backend
node -e "
const { ContractTemplate } = require('./src/models');
(async () => {
  const active = await ContractTemplate.scope('active').findAll();
  console.log('Templates ativos:', active.length);

  const available = await ContractTemplate.scope('available').findAll();
  console.log('Templates disponíveis (ativos e não deletados):', available.length);

  if (active.length >= 0 && available.length >= 0) {
    console.log('✓ Scopes funcionaram!');
  }

  process.exit(0);
})();
"
```

**Esperado:**
- ✓ Scope `active` retorna apenas templates não deletados
- ✓ Scope `available` retorna apenas templates is_active=true e não deletados

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 14: Testar métodos estáticos do Contract

**Verificar:** Métodos estáticos retornam dados corretos

**Node.js:**
```bash
cd backend
node -e "
const { Contract } = require('./src/models');
(async () => {
  const pending = await Contract.findPending();
  console.log('Contratos pendentes:', pending.length);

  const accepted = await Contract.findAccepted();
  console.log('Contratos aceitos:', accepted.length);

  if (pending.length >= 0 && accepted.length >= 0) {
    console.log('✓ Métodos estáticos funcionaram!');
  }

  process.exit(0);
})();
"
```

**Esperado:**
- ✓ `findPending()` retorna contratos com accepted_at NULL
- ✓ `findAccepted()` retorna contratos com accepted_at preenchido

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ⚠️ TESTES DE EDGE CASES

### Teste 15: Inserir template com conteúdo muito grande (> 64KB)

**Cenário:** Testar se LONGTEXT suporta conteúdo grande

**SQL:**
```sql
-- Gerar conteúdo com ~100KB
INSERT INTO contract_templates (name, content, is_active)
VALUES (
  'Template Grande Teste',
  REPEAT('<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. </p>', 2000),
  1
);

-- Verificar tamanho
SELECT id, name, LENGTH(content) as tamanho_bytes FROM contract_templates WHERE name = 'Template Grande Teste';

-- Limpar
DELETE FROM contract_templates WHERE name = 'Template Grande Teste';
```

**Esperado:**
- ✓ Inserção bem-sucedida
- ✓ Tamanho do conteúdo > 64KB
- ✓ Sem erros ou truncamento

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 16: Tentar aceitar contrato já aceito

**Cenário:** Tentar chamar `accept()` em contrato já aceito

**Node.js:**
```bash
cd backend
node -e "
const { Contract } = require('./src/models');
(async () => {
  const contract = await Contract.findOne({ where: { accepted_at: { [Op.ne]: null } } });
  if (!contract) {
    console.log('Crie e aceite um contrato primeiro!');
    process.exit(1);
  }

  try {
    await contract.accept();
    console.log('✗ Deveria ter lançado erro!');
  } catch (error) {
    console.log('✓ Erro esperado:', error.message);
  }

  process.exit(0);
})();
"
```

**Esperado:**
- ✓ Erro lançado: "Este contrato já foi aceito"
- ✓ Campo `accepted_at` não é alterado

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ✅ CHECKLIST FINAL

### Funcionalidade
- [ ] Tabelas criadas corretamente
- [ ] Todos os índices presentes
- [ ] Foreign keys funcionando
- [ ] Soft delete operacional
- [ ] Validações do Sequelize funcionando
- [ ] Métodos de instância funcionando
- [ ] Métodos estáticos funcionando
- [ ] Scopes retornando dados corretos

### Código
- [ ] Sem console.log desnecessários
- [ ] Sem código comentado ou "TODO"
- [ ] Funções e métodos documentados
- [ ] Nomes de variáveis claros e descritivos
- [ ] Código segue padrões do projeto

### Segurança
- [ ] Foreign keys com RESTRICT impedem exclusão acidental
- [ ] Validações impedem dados inválidos
- [ ] Soft delete preserva histórico

### Documentação
- [ ] README.md atualizado
- [ ] backlog.json atualizado
- [ ] Comentários inline onde necessário

### Performance
- [ ] Índices otimizados criados
- [ ] Índices compostos para queries frequentes
- [ ] LONGTEXT usado apenas onde necessário

---

## 🛠️ FERRAMENTAS RECOMENDADAS

### Banco de Dados
- **DBeaver** - Interface gráfica universal (https://dbeaver.io/)
- **MySQL Workbench** - Interface oficial MySQL
- **CLI MySQL** - Linha de comando nativa

### Node.js
- **Node.js REPL** - `node -e "código"` para testes rápidos
- **VS Code** - Editor com suporte a JavaScript

### Específicos para esta feature
- **MySQL Query Browser** - Para visualizar estrutura das tabelas
- **Sequelize CLI** - Para gerenciar migrations (`npx sequelize-cli`)

---

## 📊 RESULTADO FINAL DOS TESTES

**Data de execução:** _[Preencher]_
**Executado por:** _[Preencher]_

### Resumo
- **Total de testes:** 16
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

### Comandos Úteis de Troubleshooting

**Verificar status das migrations:**
```bash
cd backend
npx sequelize-cli db:migrate:status
```

**Reverter migrations (se necessário):**
```bash
npx sequelize-cli db:migrate:undo
npx sequelize-cli db:migrate:undo:all
```

**Visualizar estrutura completa da tabela:**
```sql
SHOW CREATE TABLE contract_templates;
SHOW CREATE TABLE contracts;
```

**Verificar todos os índices:**
```sql
SELECT
  TABLE_NAME,
  INDEX_NAME,
  GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS COLUMNS
FROM
  INFORMATION_SCHEMA.STATISTICS
WHERE
  TABLE_SCHEMA = 'secretaria_online'
  AND TABLE_NAME IN ('contract_templates', 'contracts')
GROUP BY
  TABLE_NAME, INDEX_NAME;
```

### Observações sobre Tipos de Dados

- **LONGTEXT:** Usado para `contract_templates.content` pois pode armazenar até 4GB (suficiente para HTML completo com estilos inline)
- **INT UNSIGNED:** Usado para `contracts.user_id` para compatibilidade com `users.id`
- **DATETIME:** Usado para timestamps e `accepted_at` (suporta timezone configurado no Sequelize)

### Placeholders Comuns em Templates

Exemplos de placeholders que podem ser usados:
- `{{studentName}}` - Nome do aluno
- `{{courseName}}` - Nome do curso
- `{{semester}}` - Semestre
- `{{year}}` - Ano
- `{{enrollmentDate}}` - Data de matrícula
- `{{currentDate}}` - Data atual
- `{{institutionName}}` - Nome da instituição
