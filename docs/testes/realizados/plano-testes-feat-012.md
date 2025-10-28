# PLANO DE TESTES - feat-012: Criar migrations para Document e DocumentType

**Feature:** feat-012 - Criar migrations para Document e DocumentType
**Grupo:** Banco de Dados e Modelos
**Data de criação:** 2025-10-27
**Status:** Aguardando execução

---

## 🔧 PREPARAÇÃO DO AMBIENTE

### Pré-requisitos

Certifique-se que o ambiente está configurado:

```bash
# 1. Verifique se o MySQL está rodando
# Windows: Abra Services e verifique se MySQL está ativo
# Ou execute:
mysql --version

# 2. Acesse o diretório do backend
cd backend

# 3. Verifique se o arquivo .env existe e está configurado
dir .env

# Se não existir, copie do .env.example e configure:
copy .env.example .env
# Edite o .env com suas credenciais do MySQL
```

### Variáveis de Ambiente Necessárias

- [ ] DB_HOST configurada (padrão: localhost)
- [ ] DB_PORT configurada (padrão: 3306)
- [ ] DB_NAME configurada (ex: secretaria_online)
- [ ] DB_USER configurada (ex: root)
- [ ] DB_PASSWORD configurada

### Verificar Conexão com Banco de Dados

```bash
cd backend
node src/config/test-connection.js
```

**Esperado:**
```
✓ Database connection has been established successfully.
✓ SUCESSO: Conexão estabelecida com sucesso!
```

---

## 📋 TESTES FUNCIONAIS

### Teste 1: Executar Migrations - Criar Tabelas

**Objetivo:** Verificar se as migrations criam corretamente as tabelas document_types e documents no banco de dados

**Passos:**
1. Acesse o diretório backend:
   ```bash
   cd backend
   ```

2. Execute as migrations:
   ```bash
   npx sequelize-cli db:migrate
   ```

3. Verifique se as migrations foram executadas sem erros

**Resultado Esperado:**
- ✓ Migration `20251027145519-create-document-types.js` executada com sucesso
- ✓ Migration `20251027145627-create-documents.js` executada com sucesso
- ✓ Mensagem de confirmação exibida no terminal
- ✓ Tabelas `document_types` e `documents` criadas no banco

**Como verificar:**
Conecte ao MySQL e verifique as tabelas:
```sql
USE secretaria_online;

-- Verificar se tabelas existem
SHOW TABLES;

-- Deve listar: document_types, documents (entre outras)

-- Verificar estrutura da tabela document_types
DESCRIBE document_types;

-- Verificar estrutura da tabela documents
DESCRIBE documents;
```

**Resultado Indesejado:**
- ✗ Erros de sintaxe SQL
- ✗ Conflitos com tabelas existentes
- ✗ Falta de permissões no banco de dados
- ✗ Campos ou índices ausentes

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Validar Estrutura da Tabela document_types

**Objetivo:** Verificar se a tabela document_types possui todos os campos, tipos e índices corretos

**Passos:**
1. Conecte ao MySQL:
   ```bash
   mysql -u root -p secretaria_online
   ```

2. Execute as queries de verificação:
   ```sql
   -- Verificar campos
   DESCRIBE document_types;

   -- Verificar índices
   SHOW INDEX FROM document_types;

   -- Verificar ENUM de user_type
   SHOW COLUMNS FROM document_types LIKE 'user_type';
   ```

**Resultado Esperado:**

Campos:
- ✓ id (INT, AUTO_INCREMENT, PRIMARY KEY)
- ✓ name (VARCHAR(100), NOT NULL)
- ✓ description (TEXT, NULL)
- ✓ user_type (ENUM('student', 'teacher', 'both'), NOT NULL, DEFAULT 'both')
- ✓ is_required (TINYINT(1)/BOOLEAN, NOT NULL, DEFAULT 1)
- ✓ created_at (DATETIME, NOT NULL)
- ✓ updated_at (DATETIME, NOT NULL)
- ✓ deleted_at (DATETIME, NULL)

Índices:
- ✓ PRIMARY KEY em id
- ✓ idx_document_types_name
- ✓ idx_document_types_user_type
- ✓ idx_document_types_is_required
- ✓ idx_document_types_deleted_at

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Validar Estrutura da Tabela documents

**Objetivo:** Verificar se a tabela documents possui todos os campos, tipos, índices e foreign keys corretos

**Passos:**
1. Execute no MySQL:
   ```sql
   -- Verificar campos
   DESCRIBE documents;

   -- Verificar índices
   SHOW INDEX FROM documents;

   -- Verificar ENUM de status
   SHOW COLUMNS FROM documents LIKE 'status';

   -- Verificar foreign keys
   SELECT
       CONSTRAINT_NAME,
       TABLE_NAME,
       COLUMN_NAME,
       REFERENCED_TABLE_NAME,
       REFERENCED_COLUMN_NAME
   FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
   WHERE TABLE_NAME = 'documents'
   AND REFERENCED_TABLE_NAME IS NOT NULL;
   ```

**Resultado Esperado:**

Campos:
- ✓ id (INT, AUTO_INCREMENT, PRIMARY KEY)
- ✓ user_id (INT UNSIGNED, NOT NULL, FK para users)
- ✓ document_type_id (INT, NOT NULL, FK para document_types)
- ✓ file_path (VARCHAR(500), NOT NULL)
- ✓ file_name (VARCHAR(255), NOT NULL)
- ✓ file_size (INT, NULL)
- ✓ mime_type (VARCHAR(100), NULL)
- ✓ status (ENUM('pending', 'approved', 'rejected'), NOT NULL, DEFAULT 'pending')
- ✓ reviewed_by (INT UNSIGNED, NULL, FK para users)
- ✓ reviewed_at (DATETIME, NULL)
- ✓ observations (TEXT, NULL)
- ✓ created_at (DATETIME, NOT NULL)
- ✓ updated_at (DATETIME, NOT NULL)
- ✓ deleted_at (DATETIME, NULL)

Índices:
- ✓ PRIMARY KEY em id
- ✓ idx_documents_user_id
- ✓ idx_documents_document_type_id
- ✓ idx_documents_status
- ✓ idx_documents_reviewed_by
- ✓ idx_documents_created_at
- ✓ idx_documents_deleted_at
- ✓ idx_documents_user_doctype (composto: user_id, document_type_id)
- ✓ idx_documents_status_created (composto: status, created_at)

Foreign Keys:
- ✓ user_id -> users(id) com ON DELETE RESTRICT, ON UPDATE CASCADE
- ✓ document_type_id -> document_types(id) com ON DELETE RESTRICT, ON UPDATE CASCADE
- ✓ reviewed_by -> users(id) com ON DELETE SET NULL, ON UPDATE CASCADE

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTES DE VALIDAÇÃO

### Teste 4: Inserir Tipo de Documento Válido

**Objetivo:** Verificar se é possível inserir um tipo de documento com dados válidos

**Método:** SQL direto ou Node.js

**SQL:**
```sql
INSERT INTO document_types (name, description, user_type, is_required, created_at, updated_at)
VALUES (
  'RG',
  'Registro Geral - Documento de Identidade',
  'both',
  1,
  NOW(),
  NOW()
);

-- Verificar inserção
SELECT * FROM document_types WHERE name = 'RG';
```

**Node.js (opcional):**
```javascript
const { DocumentType } = require('./src/models');

const docType = await DocumentType.create({
  name: 'RG',
  description: 'Registro Geral - Documento de Identidade',
  user_type: 'both',
  is_required: true
});

console.log('Tipo de documento criado:', docType.toJSON());
```

**Esperado:**
- ✓ Registro inserido com sucesso
- ✓ ID gerado automaticamente
- ✓ Campos created_at e updated_at preenchidos automaticamente
- ✓ deleted_at permanece NULL

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5: Validação de ENUM user_type

**Objetivo:** Verificar se o ENUM user_type aceita apenas valores válidos

**SQL:**
```sql
-- Deve ACEITAR
INSERT INTO document_types (name, user_type, created_at, updated_at)
VALUES ('Teste Student', 'student', NOW(), NOW());

INSERT INTO document_types (name, user_type, created_at, updated_at)
VALUES ('Teste Teacher', 'teacher', NOW(), NOW());

INSERT INTO document_types (name, user_type, created_at, updated_at)
VALUES ('Teste Both', 'both', NOW(), NOW());

-- Deve REJEITAR
INSERT INTO document_types (name, user_type, created_at, updated_at)
VALUES ('Teste Invalido', 'admin', NOW(), NOW());
```

**Esperado:**
- ✓ Primeiros 3 INSERTs executam com sucesso
- ✓ Último INSERT falha com erro de ENUM
- ✓ Mensagem de erro clara sobre valor inválido para ENUM

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6: Validação de ENUM status em documents

**Objetivo:** Verificar se o ENUM status aceita apenas valores válidos

**SQL:**
```sql
-- Primeiro, garanta que existe um tipo de documento e um usuário
-- Assumindo que existe user_id=1 e document_type_id=1

-- Deve ACEITAR
INSERT INTO documents (user_id, document_type_id, file_path, file_name, status, created_at, updated_at)
VALUES (1, 1, '/uploads/test1.pdf', 'test1.pdf', 'pending', NOW(), NOW());

INSERT INTO documents (user_id, document_type_id, file_path, file_name, status, created_at, updated_at)
VALUES (1, 1, '/uploads/test2.pdf', 'test2.pdf', 'approved', NOW(), NOW());

INSERT INTO documents (user_id, document_type_id, file_path, file_name, status, created_at, updated_at)
VALUES (1, 1, '/uploads/test3.pdf', 'test3.pdf', 'rejected', NOW(), NOW());

-- Deve REJEITAR
INSERT INTO documents (user_id, document_type_id, file_path, file_name, status, created_at, updated_at)
VALUES (1, 1, '/uploads/test4.pdf', 'test4.pdf', 'invalid_status', NOW(), NOW());
```

**Esperado:**
- ✓ Primeiros 3 INSERTs executam com sucesso
- ✓ Último INSERT falha com erro de ENUM
- ✓ Status padrão é 'pending' se não especificado

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 7: Validação de Campos Obrigatórios

**Objetivo:** Verificar se campos NOT NULL são validados corretamente

**SQL:**
```sql
-- document_types: Deve REJEITAR (name é obrigatório)
INSERT INTO document_types (description, created_at, updated_at)
VALUES ('Teste sem nome', NOW(), NOW());

-- documents: Deve REJEITAR (user_id é obrigatório)
INSERT INTO documents (document_type_id, file_path, file_name, created_at, updated_at)
VALUES (1, '/test.pdf', 'test.pdf', NOW(), NOW());

-- documents: Deve REJEITAR (file_path é obrigatório)
INSERT INTO documents (user_id, document_type_id, file_name, created_at, updated_at)
VALUES (1, 1, 'test.pdf', NOW(), NOW());
```

**Esperado:**
- ✓ Todos os INSERTs acima devem falhar
- ✓ Mensagens de erro indicando campos obrigatórios faltando

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔗 TESTES DE INTEGRAÇÃO

### Teste 8: Integridade Referencial - Foreign Keys

**Objetivo:** Verificar se as foreign keys impedem inserção de dados inválidos e gerenciam exclusões corretamente

**SQL:**
```sql
-- Deve REJEITAR: user_id inexistente
INSERT INTO documents (user_id, document_type_id, file_path, file_name, created_at, updated_at)
VALUES (999999, 1, '/test.pdf', 'test.pdf', NOW(), NOW());

-- Deve REJEITAR: document_type_id inexistente
INSERT INTO documents (user_id, document_type_id, file_path, file_name, created_at, updated_at)
VALUES (1, 999999, '/test.pdf', 'test.pdf', NOW(), NOW());

-- Deve REJEITAR: reviewed_by inexistente
INSERT INTO documents (user_id, document_type_id, file_path, file_name, reviewed_by, created_at, updated_at)
VALUES (1, 1, '/test.pdf', 'test.pdf', 999999, NOW(), NOW());

-- Teste de ON DELETE RESTRICT
-- Tente deletar um document_type que tem documents associados
-- Deve REJEITAR
DELETE FROM document_types WHERE id = 1;

-- Teste de ON DELETE SET NULL
-- Delete um usuário que revisou documentos
-- O campo reviewed_by deve ser SET NULL
DELETE FROM users WHERE id = (SELECT reviewed_by FROM documents WHERE reviewed_by IS NOT NULL LIMIT 1);
-- Verifique se reviewed_by foi setado para NULL
SELECT * FROM documents WHERE reviewed_by IS NULL;
```

**Esperado:**
- ✓ Inserções com IDs inexistentes são rejeitadas
- ✓ Erro indicando violação de foreign key constraint
- ✓ DELETE de document_type com documents é bloqueado (RESTRICT)
- ✓ DELETE de user que revisou documento seta reviewed_by para NULL

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 9: Associações do Sequelize - DocumentType

**Objetivo:** Verificar se as associações do model DocumentType funcionam corretamente

**Node.js:**
```javascript
const { DocumentType, Document } = require('./src/models');

// Teste 1: Buscar tipo de documento com seus documentos
const docType = await DocumentType.findOne({
  where: { name: 'RG' },
  include: ['documents']
});

console.log('Tipo de documento:', docType.name);
console.log('Quantidade de documentos:', docType.documents.length);

// Teste 2: Métodos de instância
console.log('É obrigatório para alunos?', docType.isRequiredForStudents());
console.log('É obrigatório para professores?', docType.isRequiredForTeachers());
console.log('Label do tipo de usuário:', docType.getUserTypeLabel());

// Teste 3: Métodos estáticos
const studentDocs = await DocumentType.findRequiredForUserType('student');
console.log('Documentos obrigatórios para alunos:', studentDocs.length);

const activeDocs = await DocumentType.findActive();
console.log('Tipos de documentos ativos:', activeDocs.length);
```

**Esperado:**
- ✓ Include 'documents' funciona sem erros
- ✓ Métodos de instância retornam valores corretos
- ✓ Métodos estáticos retornam resultados esperados
- ✓ Scopes funcionam corretamente

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 10: Associações do Sequelize - Document

**Objetivo:** Verificar se as associações do model Document funcionam corretamente

**Node.js:**
```javascript
const { Document, User, DocumentType } = require('./src/models');

// Teste 1: Buscar documento com usuário e tipo
const document = await Document.findOne({
  include: ['user', 'documentType', 'reviewer']
});

console.log('Documento:', document.file_name);
console.log('Enviado por:', document.user.name);
console.log('Tipo:', document.documentType.name);
if (document.reviewer) {
  console.log('Revisado por:', document.reviewer.name);
}

// Teste 2: Métodos de instância
console.log('Status:', document.getStatusLabel());
console.log('Está pendente?', document.isPending());
console.log('Está aprovado?', document.isApproved());
console.log('Tamanho formatado:', document.getFormattedFileSize());

// Teste 3: Aprovar documento
if (document.isPending()) {
  await document.approve(1, 'Documento válido');
  console.log('Documento aprovado com sucesso');
}

// Teste 4: Métodos estáticos
const userDocs = await Document.findByUser(1);
console.log('Documentos do usuário:', userDocs.length);

const pendingDocs = await Document.findPending();
console.log('Documentos pendentes:', pendingDocs.length);
```

**Esperado:**
- ✓ Includes funcionam sem erros
- ✓ Métodos de instância retornam valores corretos
- ✓ Método approve() atualiza status, reviewed_by e reviewed_at
- ✓ Métodos estáticos retornam resultados corretos
- ✓ Scopes funcionam corretamente

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 11: Associações Reversas em User

**Objetivo:** Verificar se User consegue acessar seus documentos e documentos que revisou

**Node.js:**
```javascript
const { User } = require('./src/models');

// Teste 1: Buscar usuário com documentos
const user = await User.findOne({
  where: { role: 'student' },
  include: ['documents']
});

console.log('Usuário:', user.name);
console.log('Total de documentos enviados:', user.documents.length);

// Teste 2: Buscar admin com documentos revisados
const admin = await User.findOne({
  where: { role: 'admin' },
  include: ['reviewedDocuments']
});

if (admin && admin.reviewedDocuments) {
  console.log('Admin:', admin.name);
  console.log('Total de documentos revisados:', admin.reviewedDocuments.length);
}
```

**Esperado:**
- ✓ Include 'documents' funciona para buscar documentos enviados pelo usuário
- ✓ Include 'reviewedDocuments' funciona para buscar documentos revisados pelo admin
- ✓ Associações duplas (user e reviewer) não conflitam

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ⚠️ TESTES DE EDGE CASES

### Teste 12: Soft Delete - DocumentType

**Objetivo:** Verificar se o soft delete funciona corretamente para tipos de documentos

**Node.js:**
```javascript
const { DocumentType } = require('./src/models');

// Criar tipo de documento
const docType = await DocumentType.create({
  name: 'Teste Soft Delete',
  user_type: 'both',
  is_required: false
});

const id = docType.id;

// Soft delete (paranoid)
await docType.destroy();

// Verificar que não aparece em queries normais
const found = await DocumentType.findByPk(id);
console.log('Encontrado após delete:', found); // Deve ser null

// Verificar que aparece com paranoid: false
const foundWithDeleted = await DocumentType.findByPk(id, { paranoid: false });
console.log('Encontrado com paranoid:false:', foundWithDeleted); // Deve existir
console.log('Deleted at:', foundWithDeleted.deleted_at); // Deve ter data

// Restaurar
await foundWithDeleted.restore();
const restored = await DocumentType.findByPk(id);
console.log('Restaurado:', restored); // Deve existir novamente
```

**Esperado:**
- ✓ destroy() seta deleted_at ao invés de deletar fisicamente
- ✓ Queries normais não retornam registros com deleted_at preenchido
- ✓ paranoid: false permite acessar registros deletados
- ✓ restore() limpa deleted_at e torna registro visível novamente

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 13: Soft Delete - Document

**Objetivo:** Verificar se o soft delete funciona corretamente para documentos

**Node.js:**
```javascript
const { Document } = require('./src/models');

// Criar documento de teste
const doc = await Document.create({
  user_id: 1,
  document_type_id: 1,
  file_path: '/uploads/soft-delete-test.pdf',
  file_name: 'soft-delete-test.pdf',
  file_size: 1024,
  mime_type: 'application/pdf'
});

const id = doc.id;

// Soft delete
await doc.destroy();

// Verificações
const found = await Document.findByPk(id);
console.log('Encontrado após delete:', found); // null

const foundWithDeleted = await Document.findByPk(id, { paranoid: false });
console.log('Deleted at:', foundWithDeleted.deleted_at); // data preenchida

// Restaurar
await foundWithDeleted.restore();
const restored = await Document.findByPk(id);
console.log('Restaurado:', restored !== null); // true
```

**Esperado:**
- ✓ Comportamento idêntico ao DocumentType
- ✓ Soft delete preserva dados para auditoria

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 14: Tamanho de Arquivo Negativo

**Objetivo:** Verificar se a validação impede file_size negativo

**Node.js:**
```javascript
const { Document } = require('./src/models');

try {
  await Document.create({
    user_id: 1,
    document_type_id: 1,
    file_path: '/test.pdf',
    file_name: 'test.pdf',
    file_size: -1000 // Negativo - INVÁLIDO
  });
  console.log('ERRO: Deveria ter rejeitado file_size negativo');
} catch (error) {
  console.log('Validação funcionou:', error.message);
}
```

**Esperado:**
- ✓ Erro de validação ao tentar inserir file_size negativo
- ✓ Mensagem clara sobre tamanho inválido

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 15: Nome de Documento Muito Longo

**Objetivo:** Verificar limites de VARCHAR

**SQL:**
```sql
-- file_name tem limite de 255 caracteres
-- Tente inserir string com 256+ caracteres
INSERT INTO documents (user_id, document_type_id, file_path, file_name, created_at, updated_at)
VALUES (
  1,
  1,
  '/test.pdf',
  REPEAT('a', 300), -- 300 caracteres
  NOW(),
  NOW()
);
```

**Esperado:**
- ✓ Erro ou truncamento se exceder 255 caracteres
- ✓ MySQL gerencia limite de VARCHAR corretamente

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ✅ CHECKLIST FINAL

### Funcionalidade
- [ ] Migrations executam sem erros
- [ ] Todas as tabelas criadas corretamente
- [ ] Todos os campos têm tipos corretos
- [ ] Todos os índices foram criados
- [ ] Foreign keys funcionam conforme esperado
- [ ] ENUMs aceitam apenas valores válidos
- [ ] Validações de campos obrigatórios funcionam
- [ ] Soft delete funciona em ambas as tabelas
- [ ] Associações do Sequelize funcionam corretamente

### Código
- [ ] Models não possuem erros de sintaxe
- [ ] Métodos de instância funcionam
- [ ] Métodos estáticos funcionam
- [ ] Scopes retornam resultados corretos
- [ ] Hooks são executados corretamente

### Segurança
- [ ] Foreign keys impedem dados órfãos
- [ ] ON DELETE RESTRICT protege dados relacionados
- [ ] ON DELETE SET NULL funciona para reviewed_by
- [ ] Validações de entrada funcionam

### Documentação
- [ ] README.md atualizado
- [ ] backlog.json atualizado
- [ ] Comentários inline nos models estão claros

### Performance
- [ ] Índices criados em colunas frequentemente consultadas
- [ ] Índices compostos otimizam queries comuns
- [ ] Queries de teste executam rapidamente

---

## 🛠️ FERRAMENTAS RECOMENDADAS

### Banco de Dados
- **MySQL Workbench** - Interface gráfica para visualizar tabelas, índices e executar queries
  - Download: https://dev.mysql.com/downloads/workbench/
- **DBeaver** - Alternativa universal e gratuita
  - Download: https://dbeaver.io/download/
- **HeidiSQL** (Windows) - Leve e poderoso
  - Download: https://www.heidisql.com/download.php

### Node.js Testing
- **Node.js REPL** - Para testar models diretamente
  ```bash
  cd backend
  node
  > const { DocumentType, Document } = require('./src/models');
  > // Testar models aqui
  ```

### Específicos para esta feature
- **mysql CLI** - Para testes SQL rápidos
  ```bash
  mysql -u root -p secretaria_online
  ```

---

## 📊 RESULTADO FINAL DOS TESTES

**Data de execução:** _[Preencher]_
**Executado por:** _[Preencher]_

### Resumo
- **Total de testes:** 15
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

### Dependências para Próximas Features
Esta feature é pré-requisito para:
- **feat-016**: Seeders de dados iniciais (incluirá tipos de documentos padrão)
- **feat-041-045**: Upload e Gestão de Documentos (controllers e rotas)

### Dados de Teste Recomendados
Após validar as migrations, considere criar alguns tipos de documentos de exemplo:

```sql
INSERT INTO document_types (name, description, user_type, is_required, created_at, updated_at) VALUES
('RG', 'Registro Geral - Documento de Identidade', 'both', 1, NOW(), NOW()),
('CPF', 'Cadastro de Pessoa Física', 'both', 1, NOW(), NOW()),
('Comprovante de Residência', 'Comprovante de Residência atualizado', 'both', 1, NOW(), NOW()),
('Histórico Escolar', 'Histórico Escolar do Ensino Médio', 'student', 1, NOW(), NOW()),
('Diploma de Graduação', 'Diploma de curso superior', 'teacher', 1, NOW(), NOW()),
('Currículo Lattes', 'Currículo Lattes atualizado', 'teacher', 0, NOW(), NOW());
```

### Observações sobre Execução
- Execute os testes em ordem sequencial
- Documente qualquer comportamento inesperado
- Guarde screenshots de erros para análise
- Limpe dados de teste após validação (se necessário)
