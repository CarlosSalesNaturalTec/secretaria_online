# PLANO DE TESTES - feat-010: Criar migrations para Class e relacionamentos

**Feature:** feat-010 - Criar migrations para Class e relacionamentos
**Grupo:** Banco de Dados e Modelos
**Data de criação:** 2025-10-26
**Status:** Aguardando execução

---

## 🔧 PREPARAÇÃO DO AMBIENTE

### Pré-requisitos

Certifique-se que o ambiente está configurado:

```bash
# Backend - Acesse o diretório
cd backend

# Verifique se as dependências estão instaladas
npm list sequelize sequelize-cli mysql2

# Verifique conexão com banco de dados
node src/config/test-connection.js

# Verifique se as migrations foram executadas
npx sequelize-cli db:migrate:status
```

**Esperado:**
- Dependências instaladas corretamente
- Conexão com banco estabelecida
- Migrations `20251026215729-create-classes`, `20251026215825-create-class-teachers` e `20251026215909-create-class-students` com status "up"

### Variáveis de Ambiente Necessárias

- [ ] DB_HOST configurada
- [ ] DB_PORT configurada
- [ ] DB_NAME configurada (banco `secretaria_online` criado)
- [ ] DB_USER configurada
- [ ] DB_PASSWORD configurada

---

## 📋 TESTES FUNCIONAIS

### Teste 1: Verificar Estrutura da Tabela `classes`

**Objetivo:** Verificar se a tabela `classes` foi criada com todos os campos corretos

**Passos:**
1. Conectar ao MySQL
   ```bash
   mysql -u root -p
   ```
2. Selecionar o banco de dados
   ```sql
   USE secretaria_online;
   ```
3. Descrever a tabela `classes`
   ```sql
   DESCRIBE classes;
   ```

**Resultado Esperado:**
- ✓ Tabela `classes` existe
- ✓ Campo `id` INT PRIMARY KEY AUTO_INCREMENT
- ✓ Campo `course_id` INT NOT NULL com FK para `courses`
- ✓ Campo `semester` INT NOT NULL
- ✓ Campo `year` INT NOT NULL
- ✓ Campo `created_at` DATETIME NOT NULL
- ✓ Campo `updated_at` DATETIME NOT NULL
- ✓ Campo `deleted_at` DATETIME NULL

**Como verificar:**
- Campos devem corresponder exatamente à migration
- Tipos de dados corretos (INT, DATETIME)
- NOT NULL/NULL conforme especificado

**Resultado Indesejado:**
- ✗ Tabela não existe
- ✗ Campos faltando ou com nomes diferentes
- ✗ Tipos de dados incorretos

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Verificar Índices da Tabela `classes`

**Objetivo:** Verificar se todos os índices foram criados corretamente

**Passos:**
1. Consultar índices da tabela
   ```sql
   SHOW INDEX FROM classes;
   ```

**Resultado Esperado:**
- ✓ PRIMARY KEY em `id`
- ✓ INDEX `idx_classes_course_id` em `course_id`
- ✓ INDEX `idx_classes_semester_year` em `semester, year`
- ✓ UNIQUE INDEX `idx_classes_unique_course_semester_year` em `course_id, semester, year`
- ✓ INDEX `idx_classes_deleted_at` em `deleted_at`
- ✓ INDEX `idx_classes_active` em `course_id, deleted_at`

**Como verificar:**
- Quantidade de índices: 6 (incluindo PRIMARY)
- Nomes dos índices correspondem aos definidos na migration
- Campos indexados corretos

**Resultado Indesejado:**
- ✗ Índices faltando
- ✗ Nomes incorretos
- ✗ Campos indexados errados

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Verificar Foreign Key da Tabela `classes`

**Objetivo:** Verificar se a FK com `courses` está configurada corretamente

**Passos:**
1. Consultar foreign keys
   ```sql
   SELECT
     CONSTRAINT_NAME,
     TABLE_NAME,
     COLUMN_NAME,
     REFERENCED_TABLE_NAME,
     REFERENCED_COLUMN_NAME
   FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
   WHERE TABLE_NAME = 'classes' AND REFERENCED_TABLE_NAME IS NOT NULL;
   ```

**Resultado Esperado:**
- ✓ FK `classes_ibfk_1` (ou similar)
- ✓ Coluna `course_id` referencia `courses.id`
- ✓ ON UPDATE CASCADE
- ✓ ON DELETE RESTRICT

**Como verificar:**
- Consulta retorna exatamente 1 foreign key
- Nome das tabelas e colunas corretos

**Resultado Indesejado:**
- ✗ FK não existe
- ✗ Referência incorreta
- ✗ ON DELETE/UPDATE incorretos

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 4: Verificar Estrutura da Tabela `class_teachers`

**Objetivo:** Verificar se a tabela pivot `class_teachers` foi criada corretamente

**Passos:**
1. Descrever a tabela
   ```sql
   DESCRIBE class_teachers;
   ```

**Resultado Esperado:**
- ✓ Tabela `class_teachers` existe
- ✓ Campo `id` INT PRIMARY KEY AUTO_INCREMENT
- ✓ Campo `class_id` INT NOT NULL com FK
- ✓ Campo `teacher_id` INT UNSIGNED NOT NULL com FK
- ✓ Campo `discipline_id` INT NOT NULL com FK
- ✓ Campos `created_at` e `updated_at`

**Como verificar:**
- Todos os campos presentes
- `teacher_id` é INT UNSIGNED (compatível com `users.id`)
- FKs apontam para tabelas corretas

**Resultado Indesejado:**
- ✗ Tabela não existe
- ✗ `teacher_id` não é UNSIGNED (causaria erro de FK)
- ✗ Campos faltando

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5: Verificar Índice Único Composto de `class_teachers`

**Objetivo:** Verificar se o índice único previne duplicação

**Passos:**
1. Verificar índice
   ```sql
   SHOW INDEX FROM class_teachers WHERE Key_name = 'idx_class_teachers_unique';
   ```

**Resultado Esperado:**
- ✓ Índice UNIQUE em `class_id, teacher_id, discipline_id`
- ✓ Impede que um professor lecione a mesma disciplina na mesma turma duas vezes

**Como verificar:**
- Índice existe e é UNIQUE
- Possui 3 colunas

**Resultado Indesejado:**
- ✗ Índice não existe
- ✗ Não é UNIQUE
- ✗ Campos incorretos

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6: Verificar Foreign Keys de `class_teachers`

**Objetivo:** Verificar se as 3 FKs estão corretamente configuradas

**Passos:**
1. Consultar FKs
   ```sql
   SELECT
     CONSTRAINT_NAME,
     COLUMN_NAME,
     REFERENCED_TABLE_NAME,
     REFERENCED_COLUMN_NAME
   FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
   WHERE TABLE_NAME = 'class_teachers' AND REFERENCED_TABLE_NAME IS NOT NULL;
   ```

**Resultado Esperado:**
- ✓ FK para `classes.id` (class_id) - CASCADE on delete
- ✓ FK para `users.id` (teacher_id) - RESTRICT on delete
- ✓ FK para `disciplines.id` (discipline_id) - RESTRICT on delete

**Como verificar:**
- 3 foreign keys retornadas
- Tabelas e colunas referenciadas corretas

**Resultado Indesejado:**
- ✗ FK faltando
- ✗ Referências incorretas

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 7: Verificar Estrutura da Tabela `class_students`

**Objetivo:** Verificar se a tabela pivot `class_students` foi criada corretamente

**Passos:**
1. Descrever a tabela
   ```sql
   DESCRIBE class_students;
   ```

**Resultado Esperado:**
- ✓ Tabela `class_students` existe
- ✓ Campo `id` INT PRIMARY KEY AUTO_INCREMENT
- ✓ Campo `class_id` INT NOT NULL com FK
- ✓ Campo `student_id` INT UNSIGNED NOT NULL com FK
- ✓ Campos `created_at` e `updated_at`

**Como verificar:**
- Todos os campos presentes
- `student_id` é INT UNSIGNED
- Tipos corretos

**Resultado Indesejado:**
- ✗ Tabela não existe
- ✗ `student_id` não é UNSIGNED
- ✗ Campos faltando

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 8: Verificar Índice Único Composto de `class_students`

**Objetivo:** Verificar se o índice único previne aluno duplicado na mesma turma

**Passos:**
1. Verificar índice
   ```sql
   SHOW INDEX FROM class_students WHERE Key_name = 'idx_class_students_unique';
   ```

**Resultado Esperado:**
- ✓ Índice UNIQUE em `class_id, student_id`
- ✓ Impede que um aluno seja vinculado à mesma turma mais de uma vez

**Como verificar:**
- Índice UNIQUE existe
- Possui 2 colunas

**Resultado Indesejado:**
- ✗ Índice não existe
- ✗ Não é UNIQUE

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTES DE VALIDAÇÃO

### Teste 9: Criar Turma Válida

**Objetivo:** Verificar se é possível criar uma turma com dados válidos

**Passos:**
1. Verificar se existe curso no banco
   ```sql
   SELECT id, name FROM courses LIMIT 1;
   ```
2. Inserir turma válida
   ```sql
   INSERT INTO classes (course_id, semester, year)
   VALUES (1, 2, 2025);
   ```
3. Verificar se foi criada
   ```sql
   SELECT * FROM classes WHERE id = LAST_INSERT_ID();
   ```

**Resultado Esperado:**
- ✓ Turma criada com sucesso
- ✓ Campos `created_at` e `updated_at` preenchidos automaticamente
- ✓ Campo `deleted_at` é NULL

**Como verificar:**
- Query INSERT não retorna erro
- SELECT retorna 1 registro

**Resultado Indesejado:**
- ✗ Erro ao inserir
- ✗ Timestamps não preenchidos

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 10: Tentar Criar Turma Duplicada (Deve Falhar)

**Objetivo:** Verificar se o índice único composto previne duplicação

**Passos:**
1. Tentar inserir turma com mesmo course_id, semester e year
   ```sql
   INSERT INTO classes (course_id, semester, year)
   VALUES (1, 2, 2025);
   ```

**Resultado Esperado:**
- ✓ Erro: "Duplicate entry" ou violação de índice único
- ✓ Turma NÃO é criada

**Como verificar:**
- Query retorna erro
- Mensagem menciona violação de índice/chave única

**Resultado Indesejado:**
- ✗ Turma duplicada é criada (ERRO CRÍTICO)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 11: Tentar Criar Turma com course_id Inválido (Deve Falhar)

**Objetivo:** Verificar se a FK previne inserção com curso inexistente

**Passos:**
1. Tentar inserir turma com course_id inexistente
   ```sql
   INSERT INTO classes (course_id, semester, year)
   VALUES (99999, 1, 2025);
   ```

**Resultado Esperado:**
- ✓ Erro: "Cannot add or update a child row: a foreign key constraint fails"
- ✓ Turma NÃO é criada

**Como verificar:**
- Query retorna erro de FK
- Nenhum registro é inserido

**Resultado Indesejado:**
- ✗ Turma criada sem curso válido (ERRO CRÍTICO)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 12: Vincular Professor a Turma

**Objetivo:** Verificar se é possível vincular professor e disciplina a uma turma

**Passos:**
1. Verificar se existe professor (user com role='teacher')
   ```sql
   SELECT id, name FROM users WHERE role = 'teacher' LIMIT 1;
   ```
2. Verificar se existe disciplina
   ```sql
   SELECT id, name FROM disciplines LIMIT 1;
   ```
3. Vincular professor a turma
   ```sql
   INSERT INTO class_teachers (class_id, teacher_id, discipline_id)
   VALUES (1, <teacher_id>, <discipline_id>);
   ```

**Resultado Esperado:**
- ✓ Vínculo criado com sucesso
- ✓ Timestamps preenchidos automaticamente

**Como verificar:**
- Query INSERT sem erro
- SELECT retorna registro criado

**Resultado Indesejado:**
- ✗ Erro ao criar vínculo
- ✗ Erro de tipo incompatível (INT vs INT UNSIGNED)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 13: Tentar Vincular Mesmo Professor/Disciplina Duplicado (Deve Falhar)

**Objetivo:** Verificar se índice único previne duplicação em `class_teachers`

**Passos:**
1. Tentar inserir mesmo vínculo novamente
   ```sql
   INSERT INTO class_teachers (class_id, teacher_id, discipline_id)
   VALUES (1, <teacher_id>, <discipline_id>);
   ```

**Resultado Esperado:**
- ✓ Erro: "Duplicate entry"
- ✓ Vínculo NÃO é criado

**Como verificar:**
- Query retorna erro
- Contagem de registros não muda

**Resultado Indesejado:**
- ✗ Vínculo duplicado criado (ERRO CRÍTICO)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 14: Vincular Aluno a Turma

**Objetivo:** Verificar se é possível vincular aluno a uma turma

**Passos:**
1. Verificar se existe aluno (user com role='student')
   ```sql
   SELECT id, name FROM users WHERE role = 'student' LIMIT 1;
   ```
2. Vincular aluno a turma
   ```sql
   INSERT INTO class_students (class_id, student_id)
   VALUES (1, <student_id>);
   ```

**Resultado Esperado:**
- ✓ Vínculo criado com sucesso
- ✓ Timestamps preenchidos

**Como verificar:**
- Query INSERT sem erro
- SELECT retorna registro

**Resultado Indesejado:**
- ✗ Erro ao criar vínculo
- ✗ Erro de incompatibilidade de tipo

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 15: Tentar Vincular Mesmo Aluno Duplicado (Deve Falhar)

**Objetivo:** Verificar se índice único previne aluno duplicado em `class_students`

**Passos:**
1. Tentar inserir mesmo vínculo novamente
   ```sql
   INSERT INTO class_students (class_id, student_id)
   VALUES (1, <student_id>);
   ```

**Resultado Esperado:**
- ✓ Erro: "Duplicate entry"
- ✓ Vínculo NÃO é criado

**Como verificar:**
- Query retorna erro
- Aluno não aparece duplicado

**Resultado Indesejado:**
- ✗ Aluno vinculado duas vezes à mesma turma (ERRO CRÍTICO)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔗 TESTES DE INTEGRIDADE REFERENCIAL

### Teste 16: Tentar Deletar Curso com Turma Ativa (Deve Falhar)

**Objetivo:** Verificar se ON DELETE RESTRICT previne exclusão de curso com turmas

**Passos:**
1. Tentar deletar curso que possui turmas
   ```sql
   DELETE FROM courses WHERE id = 1;
   ```

**Resultado Esperado:**
- ✓ Erro: "Cannot delete or update a parent row: a foreign key constraint fails"
- ✓ Curso NÃO é deletado

**Como verificar:**
- Query retorna erro de FK
- Curso ainda existe no banco

**Resultado Indesejado:**
- ✗ Curso deletado com turmas órfãs (ERRO CRÍTICO)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 17: Deletar Turma (Soft Delete)

**Objetivo:** Verificar se soft delete funciona corretamente

**Passos:**
1. "Deletar" turma (via application com Sequelize)
   ```sql
   UPDATE classes SET deleted_at = NOW() WHERE id = 1;
   ```
2. Verificar se turma foi marcada como deletada
   ```sql
   SELECT * FROM classes WHERE id = 1;
   ```

**Resultado Esperado:**
- ✓ Campo `deleted_at` preenchido com data/hora atual
- ✓ Registro ainda existe no banco (soft delete)

**Como verificar:**
- Campo `deleted_at` não é NULL
- SELECT retorna o registro

**Resultado Indesejado:**
- ✗ Registro deletado fisicamente (hard delete)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 18: Deletar Turma Remove Vínculos (CASCADE)

**Objetivo:** Verificar se ON DELETE CASCADE funciona em tabelas pivot

**Passos:**
1. Deletar fisicamente uma turma
   ```sql
   DELETE FROM classes WHERE id = 2; -- usar turma sem restrições
   ```
2. Verificar se vínculos foram removidos
   ```sql
   SELECT * FROM class_teachers WHERE class_id = 2;
   SELECT * FROM class_students WHERE class_id = 2;
   ```

**Resultado Esperado:**
- ✓ Turma deletada com sucesso
- ✓ Vínculos em `class_teachers` removidos automaticamente
- ✓ Vínculos em `class_students` removidos automaticamente

**Como verificar:**
- SELECTs retornam 0 registros

**Resultado Indesejado:**
- ✗ Vínculos órfãos permanecem no banco

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ✅ CHECKLIST FINAL

### Funcionalidade
- [ ] Todas as 3 tabelas criadas corretamente
- [ ] Todos os índices presentes e funcionais
- [ ] Foreign keys configuradas corretamente
- [ ] Índices únicos previnem duplicação
- [ ] Soft delete funciona em `classes`
- [ ] CASCADE funciona nas tabelas pivot
- [ ] RESTRICT previne exclusões indevidas

### Integridade de Dados
- [ ] Não é possível criar turmas duplicadas
- [ ] Não é possível vincular professor/disciplina duplicados
- [ ] Não é possível vincular aluno duplicado
- [ ] FKs previnem dados órfãos
- [ ] Tipos de dados compatíveis (INT UNSIGNED para users)

### Documentação
- [ ] README.md atualizado com novas migrations
- [ ] backlog.json atualizado
- [ ] Plano de testes documentado
- [ ] Observações registradas

---

## 🛠️ FERRAMENTAS RECOMENDADAS

### Banco de Dados
- **DBeaver** - Interface gráfica universal (https://dbeaver.io/)
- **MySQL Workbench** - Cliente oficial MySQL (https://www.mysql.com/products/workbench/)
- **phpMyAdmin** - Interface web (se disponível)
- **Linha de comando MySQL** - mysql-cli

### Comandos Úteis MySQL

```sql
-- Ver todas as tabelas
SHOW TABLES;

-- Ver estrutura de tabela
DESCRIBE nome_tabela;

-- Ver índices
SHOW INDEX FROM nome_tabela;

-- Ver foreign keys
SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'secretaria_online'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Ver tamanho das tabelas
SELECT
  TABLE_NAME,
  ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'secretaria_online'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
```

---

## 📊 RESULTADO FINAL DOS TESTES

**Data de execução:** _[Preencher]_
**Executado por:** _[Preencher]_

### Resumo
- **Total de testes:** 18
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

### Observações Importantes

1. **Compatibilidade de Tipos**: A correção `INTEGER.UNSIGNED` foi crucial para compatibilidade com a tabela `users`. Sempre verificar tipos de dados ao criar FKs.

2. **Soft Delete**: A tabela `classes` usa soft delete (paranoid), mas as tabelas pivot (`class_teachers`, `class_students`) não. Isso é intencional - quando uma turma é "deletada", os vínculos permanecem para histórico.

3. **Índices Únicos com WHERE**: O índice único composto em `classes` usa `WHERE deleted_at IS NULL` para permitir "reativar" turmas deletadas com mesmos dados.

4. **ON DELETE Behaviors**:
   - `classes` → `courses`: RESTRICT (não pode deletar curso com turmas)
   - `class_teachers` → `classes`: CASCADE (deletar turma remove vínculos)
   - `class_teachers` → `users/disciplines`: RESTRICT (protege usuários/disciplinas)
   - `class_students` → `classes`: CASCADE
   - `class_students` → `users`: RESTRICT

### Sugestões de Melhorias Futuras

1. Adicionar campo `active` em `classes` para controle mais explícito de turmas ativas
2. Considerar adicionar `enrollment_date` em `class_students` para rastrear quando aluno entrou na turma
3. Avaliar necessidade de campo `status` em `class_teachers` (ativo/inativo)
