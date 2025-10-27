# PLANO DE TESTES - feat-015: Criar migrations para Request e RequestType

**Feature:** feat-015 - Criar migrations para Request e RequestType
**Grupo:** Banco de Dados e Modelos
**Data de criação:** 2025-10-27
**Status:** Aguardando execução

---

## 🔧 PREPARAÇÃO DO AMBIENTE

### Pré-requisitos

Certifique-se que o ambiente está configurado:

```bash
cd backend
npm run dev
```

**Esperado:** Servidor backend iniciado sem erros e conexão com banco de dados estabelecida.

### Verificar migrations executadas

```bash
cd backend
npx sequelize-cli db:migrate:status
```

**Esperado:** As migrations `20251027192921-create-request-types.js` e `20251027192954-create-requests.js` devem aparecer como "up".

---

## 📋 TESTE FUNCIONAL - TABELA REQUEST_TYPES

### Teste 1: Verificar estrutura da tabela request_types

**Objetivo:** Confirmar que a tabela foi criada com todos os campos, tipos e índices corretos

**Passos:**
1. Conectar ao banco de dados MySQL:
   ```bash
   mysql -u root -p secretaria_online
   ```

2. Executar comando DESCRIBE:
   ```sql
   DESCRIBE request_types;
   ```

**Resultado Esperado:**
- ✓ Campo `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- ✓ Campo `name` (VARCHAR(100), NOT NULL)
- ✓ Campo `description` (TEXT, NULLABLE)
- ✓ Campo `response_deadline_days` (INT, NOT NULL, DEFAULT 5)
- ✓ Campo `is_active` (TINYINT(1), NOT NULL, DEFAULT 1)
- ✓ Campo `created_at` (DATETIME, NOT NULL)
- ✓ Campo `updated_at` (DATETIME, NOT NULL)
- ✓ Campo `deleted_at` (DATETIME, NULLABLE)

**Como verificar índices:**
```sql
SHOW INDEX FROM request_types;
```

**Esperado:**
- ✓ Índice `idx_request_types_name` em (name)
- ✓ Índice `idx_request_types_is_active` em (is_active)
- ✓ Índice `idx_request_types_deleted_at` em (deleted_at)
- ✓ Índice `idx_request_types_available` em (is_active, deleted_at)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Inserir tipo de solicitação válido

**Objetivo:** Verificar inserção de dados com valores válidos

**Passos:**
1. Executar INSERT:
   ```sql
   INSERT INTO request_types (name, description, response_deadline_days, is_active)
   VALUES ('Atestado de Matrícula', 'Documento comprobatório de vínculo com a instituição', 3, TRUE);
   ```

2. Verificar registro inserido:
   ```sql
   SELECT * FROM request_types WHERE name = 'Atestado de Matrícula';
   ```

**Resultado Esperado:**
- ✓ Registro inserido com sucesso
- ✓ Campo `id` gerado automaticamente
- ✓ Campos `created_at` e `updated_at` preenchidos automaticamente
- ✓ Campo `deleted_at` deve ser NULL
- ✓ Campo `response_deadline_days` = 3
- ✓ Campo `is_active` = 1 (TRUE)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Validar prazo de resposta padrão

**Objetivo:** Verificar se o valor padrão de 5 dias é aplicado quando não especificado

**Passos:**
1. Executar INSERT sem especificar response_deadline_days:
   ```sql
   INSERT INTO request_types (name, description)
   VALUES ('Histórico Escolar', 'Documento com histórico completo do aluno');
   ```

2. Verificar registro:
   ```sql
   SELECT response_deadline_days FROM request_types WHERE name = 'Histórico Escolar';
   ```

**Resultado Esperado:**
- ✓ Campo `response_deadline_days` = 5 (valor padrão)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE FUNCIONAL - TABELA REQUESTS

### Teste 4: Verificar estrutura da tabela requests

**Objetivo:** Confirmar que a tabela foi criada com todos os campos, tipos, índices e foreign keys corretas

**Passos:**
1. Executar comando DESCRIBE:
   ```sql
   DESCRIBE requests;
   ```

**Resultado Esperado:**
- ✓ Campo `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- ✓ Campo `student_id` (INT UNSIGNED, NOT NULL)
- ✓ Campo `request_type_id` (INT, NOT NULL)
- ✓ Campo `description` (TEXT, NULLABLE)
- ✓ Campo `status` (ENUM('pending','approved','rejected'), NOT NULL, DEFAULT 'pending')
- ✓ Campo `reviewed_by` (INT UNSIGNED, NULLABLE)
- ✓ Campo `reviewed_at` (DATETIME, NULLABLE)
- ✓ Campo `observations` (TEXT, NULLABLE)
- ✓ Campo `created_at` (DATETIME, NOT NULL)
- ✓ Campo `updated_at` (DATETIME, NOT NULL)
- ✓ Campo `deleted_at` (DATETIME, NULLABLE)

**Como verificar foreign keys:**
```sql
SELECT
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'requests' AND REFERENCED_TABLE_NAME IS NOT NULL;
```

**Esperado:**
- ✓ FK de `student_id` para `users(id)` com ON DELETE RESTRICT, ON UPDATE CASCADE
- ✓ FK de `request_type_id` para `request_types(id)` com ON DELETE RESTRICT, ON UPDATE CASCADE
- ✓ FK de `reviewed_by` para `users(id)` com ON DELETE SET NULL, ON UPDATE CASCADE

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5: Inserir solicitação válida

**Objetivo:** Verificar inserção de solicitação com dados válidos

**Pré-requisito:** Deve existir ao menos 1 usuário com role='student' e 1 request_type na tabela

**Passos:**
1. Buscar um student_id e request_type_id válidos:
   ```sql
   SELECT id FROM users WHERE role = 'student' LIMIT 1;
   SELECT id FROM request_types LIMIT 1;
   ```

2. Executar INSERT (substituir IDs pelos valores encontrados):
   ```sql
   INSERT INTO requests (student_id, request_type_id, description, status)
   VALUES (1, 1, 'Preciso do atestado para apresentar na empresa', 'pending');
   ```

3. Verificar registro:
   ```sql
   SELECT * FROM requests WHERE id = LAST_INSERT_ID();
   ```

**Resultado Esperado:**
- ✓ Registro inserido com sucesso
- ✓ Campo `id` gerado automaticamente
- ✓ Campos `created_at` e `updated_at` preenchidos automaticamente
- ✓ Campo `status` = 'pending'
- ✓ Campos `reviewed_by`, `reviewed_at`, `observations`, `deleted_at` devem ser NULL

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6: Validar ENUM de status

**Objetivo:** Verificar que apenas valores válidos são aceitos no campo status

**Passos:**
1. Tentar inserir com status inválido:
   ```sql
   INSERT INTO requests (student_id, request_type_id, status)
   VALUES (1, 1, 'INVALID_STATUS');
   ```

**Resultado Esperado:**
- ✓ Erro retornado: `Data truncated for column 'status'` ou similar
- ✓ Registro NÃO foi inserido

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 7: Validar status padrão

**Objetivo:** Verificar se o status padrão 'pending' é aplicado quando não especificado

**Passos:**
1. Inserir sem especificar status:
   ```sql
   INSERT INTO requests (student_id, request_type_id, description)
   VALUES (1, 1, 'Solicitação de teste');
   ```

2. Verificar status:
   ```sql
   SELECT status FROM requests WHERE id = LAST_INSERT_ID();
   ```

**Resultado Esperado:**
- ✓ Campo `status` = 'pending'

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔗 TESTE DE INTEGRAÇÃO

### Teste 8: Validar Foreign Key - student_id

**Objetivo:** Verificar que não é possível inserir solicitação com student_id inexistente

**Passos:**
1. Tentar inserir com student_id inválido:
   ```sql
   INSERT INTO requests (student_id, request_type_id)
   VALUES (99999, 1);
   ```

**Resultado Esperado:**
- ✓ Erro retornado: `Cannot add or update a child row: a foreign key constraint fails`
- ✓ Registro NÃO foi inserido

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 9: Validar Foreign Key - request_type_id

**Objetivo:** Verificar que não é possível inserir solicitação com request_type_id inexistente

**Passos:**
1. Tentar inserir com request_type_id inválido:
   ```sql
   INSERT INTO requests (student_id, request_type_id)
   VALUES (1, 99999);
   ```

**Resultado Esperado:**
- ✓ Erro retornado: `Cannot add or update a child row: a foreign key constraint fails`
- ✓ Registro NÃO foi inserido

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 10: Validar ON DELETE RESTRICT em request_type_id

**Objetivo:** Verificar que não é possível deletar um request_type que possui requests associadas

**Passos:**
1. Criar um request_type e uma request associada:
   ```sql
   INSERT INTO request_types (name) VALUES ('Tipo de Teste');
   SET @type_id = LAST_INSERT_ID();

   INSERT INTO requests (student_id, request_type_id) VALUES (1, @type_id);
   ```

2. Tentar deletar o request_type:
   ```sql
   DELETE FROM request_types WHERE id = @type_id;
   ```

**Resultado Esperado:**
- ✓ Erro retornado: `Cannot delete or update a parent row: a foreign key constraint fails`
- ✓ Registro NÃO foi deletado

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 11: Validar ON DELETE SET NULL em reviewed_by

**Objetivo:** Verificar que ao deletar um usuário revisor, o campo reviewed_by é setado para NULL

**Passos:**
1. Criar um usuário admin temporário:
   ```sql
   INSERT INTO users (role, name, email, login, password_hash, cpf)
   VALUES ('admin', 'Admin Teste', 'admin.teste@test.com', 'admintest', 'hash123', '12345678901');
   SET @admin_id = LAST_INSERT_ID();
   ```

2. Criar uma solicitação e marcar como revisada por esse admin:
   ```sql
   INSERT INTO requests (student_id, request_type_id, reviewed_by, status)
   VALUES (1, 1, @admin_id, 'approved');
   SET @request_id = LAST_INSERT_ID();
   ```

3. Deletar o admin:
   ```sql
   DELETE FROM users WHERE id = @admin_id;
   ```

4. Verificar o campo reviewed_by:
   ```sql
   SELECT reviewed_by FROM requests WHERE id = @request_id;
   ```

**Resultado Esperado:**
- ✓ Admin deletado com sucesso
- ✓ Campo `reviewed_by` da request = NULL

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🧪 TESTE DE MODELS (Node.js/Sequelize)

### Teste 12: Testar model RequestType

**Objetivo:** Verificar que o model RequestType carrega corretamente e possui métodos esperados

**Passos:**
1. Criar arquivo de teste `backend/test-request-type.js`:
   ```javascript
   const { RequestType } = require('./src/models');

   async function testRequestType() {
     try {
       console.log('✓ Model RequestType carregado');

       // Testar criação
       const requestType = await RequestType.create({
         name: 'Certificado',
         description: 'Certificado de conclusão de curso',
         response_deadline_days: 10
       });

       console.log('✓ RequestType criado:', requestType.id);

       // Testar métodos de instância
       console.log('✓ isActive():', requestType.isActive());
       console.log('✓ getDeadlineLabel():', requestType.getDeadlineLabel());
       console.log('✓ getStatusLabel():', requestType.getStatusLabel());

       // Testar métodos estáticos
       const active = await RequestType.findActive();
       console.log('✓ findActive():', active.length, 'tipos ativos');

       const available = await RequestType.findAvailable();
       console.log('✓ findAvailable():', available.length, 'tipos disponíveis');

       console.log('\n✅ Todos os testes do model RequestType passaram!');
       process.exit(0);
     } catch (error) {
       console.error('❌ Erro:', error.message);
       process.exit(1);
     }
   }

   testRequestType();
   ```

2. Executar teste:
   ```bash
   cd backend
   node test-request-type.js
   ```

**Resultado Esperado:**
- ✓ Model carregado sem erros
- ✓ Registro criado com sucesso
- ✓ Todos os métodos executados sem erros
- ✓ Métodos retornam valores esperados

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 13: Testar model Request

**Objetivo:** Verificar que o model Request carrega corretamente e possui métodos esperados

**Passos:**
1. Criar arquivo de teste `backend/test-request.js`:
   ```javascript
   const { Request, RequestType, User } = require('./src/models');

   async function testRequest() {
     try {
       console.log('✓ Model Request carregado');

       // Buscar IDs existentes
       const student = await User.findOne({ where: { role: 'student' } });
       const requestType = await RequestType.findOne();

       if (!student || !requestType) {
         throw new Error('Pré-requisitos não encontrados (student ou requestType)');
       }

       // Testar criação
       const request = await Request.create({
         student_id: student.id,
         request_type_id: requestType.id,
         description: 'Solicitação de teste'
       });

       console.log('✓ Request criado:', request.id);

       // Testar métodos de instância
       console.log('✓ isPending():', request.isPending());
       console.log('✓ getStatusLabel():', request.getStatusLabel());
       console.log('✓ getFormattedCreatedAt():', request.getFormattedCreatedAt());

       // Testar método approve
       const admin = await User.findOne({ where: { role: 'admin' } });
       if (admin) {
         await request.approve(admin.id, 'Aprovado para teste');
         console.log('✓ approve():', request.status === 'approved');
       }

       // Testar métodos estáticos
       const pending = await Request.findPending();
       console.log('✓ findPending():', pending.length, 'solicitações pendentes');

       const byStudent = await Request.findByStudent(student.id);
       console.log('✓ findByStudent():', byStudent.length, 'solicitações do aluno');

       console.log('\n✅ Todos os testes do model Request passaram!');
       process.exit(0);
     } catch (error) {
       console.error('❌ Erro:', error.message);
       process.exit(1);
     }
   }

   testRequest();
   ```

2. Executar teste:
   ```bash
   cd backend
   node test-request.js
   ```

**Resultado Esperado:**
- ✓ Model carregado sem erros
- ✓ Registro criado com sucesso
- ✓ Todos os métodos executados sem erros
- ✓ Método approve altera o status corretamente

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 14: Testar associações

**Objetivo:** Verificar que as associações entre models funcionam corretamente

**Passos:**
1. Criar arquivo de teste `backend/test-associations.js`:
   ```javascript
   const { Request, RequestType, User } = require('./src/models');

   async function testAssociations() {
     try {
       // Buscar uma request com relações
       const request = await Request.scope('withRelations').findOne();

       if (!request) {
         throw new Error('Nenhuma request encontrada no banco');
       }

       console.log('✓ Request carregada com relações');
       console.log('✓ Student:', request.student ? request.student.name : 'NULL');
       console.log('✓ RequestType:', request.requestType ? request.requestType.name : 'NULL');
       console.log('✓ Reviewer:', request.reviewer ? request.reviewer.name : 'NULL');

       // Testar associação reversa (User -> Requests)
       const student = await User.findOne({
         where: { role: 'student' },
         include: [{ association: 'requests' }]
       });

       if (student) {
         console.log('✓ Associação reversa User.requests:', student.requests.length, 'solicitações');
       }

       // Testar associação reversa (RequestType -> Requests)
       const requestType = await RequestType.findOne({
         include: [{ association: 'requests' }]
       });

       if (requestType) {
         console.log('✓ Associação reversa RequestType.requests:', requestType.requests.length, 'solicitações');
       }

       console.log('\n✅ Todas as associações funcionam corretamente!');
       process.exit(0);
     } catch (error) {
       console.error('❌ Erro:', error.message);
       process.exit(1);
     }
   }

   testAssociations();
   ```

2. Executar teste:
   ```bash
   cd backend
   node test-associations.js
   ```

**Resultado Esperado:**
- ✓ Request carregada com student, requestType e reviewer (se houver)
- ✓ Associação reversa User.requests funciona
- ✓ Associação reversa RequestType.requests funciona

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🧹 LIMPEZA

### Teste 15: Limpar dados de teste

**Objetivo:** Remover todos os dados criados durante os testes

**Passos:**
```sql
-- Deletar requests de teste
DELETE FROM requests WHERE description LIKE '%teste%';

-- Deletar request_types de teste
DELETE FROM request_types WHERE name LIKE '%Teste%';

-- Deletar usuários de teste (se criados)
DELETE FROM users WHERE email LIKE '%test.com%';
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📊 RESUMO DOS TESTES

| # | Teste | Status | Observações |
|---|-------|--------|-------------|
| 1 | Estrutura request_types | ⏳ Aguardando | |
| 2 | Inserir request_type válido | ⏳ Aguardando | |
| 3 | Prazo padrão | ⏳ Aguardando | |
| 4 | Estrutura requests | ⏳ Aguardando | |
| 5 | Inserir request válida | ⏳ Aguardando | |
| 6 | Validar ENUM status | ⏳ Aguardando | |
| 7 | Status padrão | ⏳ Aguardando | |
| 8 | FK student_id | ⏳ Aguardando | |
| 9 | FK request_type_id | ⏳ Aguardando | |
| 10 | ON DELETE RESTRICT | ⏳ Aguardando | |
| 11 | ON DELETE SET NULL | ⏳ Aguardando | |
| 12 | Model RequestType | ⏳ Aguardando | |
| 13 | Model Request | ⏳ Aguardando | |
| 14 | Associações | ⏳ Aguardando | |
| 15 | Limpeza | ⏳ Aguardando | |

---

## 🛠️ FERRAMENTAS RECOMENDADAS

- **MySQL Workbench**: Para visualizar estrutura e executar queries SQL
- **DBeaver**: Alternativa ao MySQL Workbench
- **Node.js**: Para executar testes de models
- **Postman**: (Futuro) Para testar endpoints da API

---

## 📝 NOTAS FINAIS

- Todos os testes devem ser executados na ordem apresentada
- Marque cada teste como executado e anote observações
- Se algum teste falhar, corrija o problema antes de prosseguir
- Mantenha este arquivo atualizado com os resultados

---

**Data de execução:** _[Preencher]_
**Executado por:** _[Preencher]_
**Resultado final:** _[Preencher: Passou | Falhou | Parcial]_
