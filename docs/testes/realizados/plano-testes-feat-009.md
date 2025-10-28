# PLANO DE TESTES - feat-009: Criar migration course_disciplines (relação N:N)

**Feature:** feat-009 - Criar migration course_disciplines (relação N:N)
**Grupo:** Banco de Dados e Modelos
**Data de criação:** 2025-10-26
**Status:** Aguardando execução

---

## 🔧 PREPARAÇÃO DO AMBIENTE

### Pré-requisitos

Certifique-se que o ambiente está configurado:

```bash
cd backend

# Verificar se o banco de dados está configurado corretamente
node src/config/test-connection.js

# Verificar se as migrations anteriores foram executadas
npx sequelize-cli db:migrate:status
```

**Esperado:**
- Conexão com banco estabelecida com sucesso
- Migrations `create-courses` e `create-disciplines` devem estar listadas como executadas
- Migration `create-course-disciplines` deve aparecer como pendente ou executada

### Variáveis de Ambiente Necessárias

- [x] DB_HOST configurada
- [x] DB_PORT configurada
- [x] DB_NAME configurada
- [x] DB_USER configurada
- [x] DB_PASSWORD configurada

### Executar Migration (se ainda não executada)

```bash
cd backend
npx sequelize-cli db:migrate
```

**Esperado:** Migration `20251026211804-create-course-disciplines` executada com sucesso

---

## 📋 TESTES FUNCIONAIS

### Teste 1: Verificar Estrutura da Tabela course_disciplines

**Objetivo:** Verificar se a tabela `course_disciplines` foi criada com todos os campos corretos

**Passos:**
1. Conectar ao banco de dados MySQL
   ```bash
   mysql -u root -p secretaria_online
   ```
2. Executar comando para descrever a tabela
   ```sql
   DESCRIBE course_disciplines;
   ```

**Resultado Esperado:**
- ✓ Tabela `course_disciplines` existe
- ✓ Campo `id` (INT, PRIMARY KEY, AUTO_INCREMENT, NOT NULL)
- ✓ Campo `course_id` (INT, NOT NULL, com FOREIGN KEY para `courses.id`)
- ✓ Campo `discipline_id` (INT, NOT NULL, com FOREIGN KEY para `disciplines.id`)
- ✓ Campo `semester` (INT, NOT NULL)
- ✓ Campo `created_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- ✓ Campo `updated_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**Como verificar:**
- Verificar se todos os campos estão presentes
- Verificar tipos de dados corretos
- Verificar constraints NOT NULL

**Resultado Indesejado:**
- ✗ Tabela não foi criada
- ✗ Campos ausentes ou com tipos incorretos
- ✗ Campos sem constraints NOT NULL

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Verificar Índices da Tabela

**Objetivo:** Confirmar que todos os índices foram criados corretamente

**Passos:**
1. Conectar ao banco de dados
2. Executar query para listar índices
   ```sql
   SHOW INDEX FROM course_disciplines;
   ```

**Resultado Esperado:**
- ✓ Índice `PRIMARY` no campo `id`
- ✓ Índice único composto `unique_course_discipline_semester` em (course_id, discipline_id, semester)
- ✓ Índice `idx_course_disciplines_course_id` no campo `course_id`
- ✓ Índice `idx_course_disciplines_discipline_id` no campo `discipline_id`
- ✓ Índice `idx_course_disciplines_semester` no campo `semester`

**Como verificar:**
- Contar total de índices (deve ter 5)
- Verificar se índice composto está marcado como UNIQUE (Non_unique = 0)
- Confirmar nomes e colunas dos índices

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Verificar Foreign Keys

**Objetivo:** Confirmar que as chaves estrangeiras foram criadas com as ações corretas

**Passos:**
1. Conectar ao banco de dados
2. Executar query para listar foreign keys
   ```sql
   SELECT
       CONSTRAINT_NAME,
       COLUMN_NAME,
       REFERENCED_TABLE_NAME,
       REFERENCED_COLUMN_NAME
   FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
   WHERE TABLE_SCHEMA = 'secretaria_online'
     AND TABLE_NAME = 'course_disciplines'
     AND REFERENCED_TABLE_NAME IS NOT NULL;
   ```

**Resultado Esperado:**
- ✓ Foreign key de `course_id` referenciando `courses.id`
- ✓ Foreign key de `discipline_id` referenciando `disciplines.id`
- ✓ Ações: ON DELETE RESTRICT, ON UPDATE CASCADE

**Como verificar:**
- Verificar se ambas as foreign keys estão presentes
- Confirmar tabelas e colunas referenciadas
- Verificar ações de cascade/restrict

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔗 TESTES DE INTEGRAÇÃO

### Teste 4: Inserir Relacionamento Curso-Disciplina

**Objetivo:** Verificar se é possível inserir um relacionamento válido entre curso e disciplina

**Passos:**
1. Garantir que existe ao menos 1 curso e 1 disciplina no banco
   ```sql
   SELECT * FROM courses LIMIT 1;
   SELECT * FROM disciplines LIMIT 1;
   ```
2. Inserir relacionamento
   ```sql
   INSERT INTO course_disciplines (course_id, discipline_id, semester, created_at, updated_at)
   VALUES (1, 1, 1, NOW(), NOW());
   ```
3. Verificar inserção
   ```sql
   SELECT * FROM course_disciplines WHERE course_id = 1 AND discipline_id = 1;
   ```

**Resultado Esperado:**
- ✓ Inserção realizada com sucesso
- ✓ Registro aparece na query de verificação
- ✓ Campos `created_at` e `updated_at` foram preenchidos automaticamente
- ✓ Campo `id` foi gerado automaticamente (AUTO_INCREMENT)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5: Associações no Model Course

**Objetivo:** Verificar se o model Course consegue buscar disciplinas associadas

**Passos:**
1. Criar um script de teste em `backend/test-course-disciplines.js`
   ```javascript
   const { Course, Discipline } = require('./src/models');

   async function testCourseAssociations() {
     try {
       // Buscar curso com suas disciplinas
       const course = await Course.findByPk(1, {
         include: [{
           model: Discipline,
           as: 'disciplines',
           through: { attributes: ['semester'] }
         }]
       });

       if (course) {
         console.log('✓ Curso encontrado:', course.name);
         console.log('✓ Disciplinas associadas:', course.disciplines.length);

         if (course.disciplines.length > 0) {
           course.disciplines.forEach(discipline => {
             console.log(`  - ${discipline.name} (Semestre: ${discipline.course_disciplines.semester})`);
           });
         }
       } else {
         console.log('✗ Curso não encontrado');
       }
     } catch (error) {
       console.error('✗ Erro ao buscar curso:', error.message);
     } finally {
       process.exit();
     }
   }

   testCourseAssociations();
   ```
2. Executar o script
   ```bash
   node backend/test-course-disciplines.js
   ```

**Resultado Esperado:**
- ✓ Script executa sem erros
- ✓ Curso é encontrado
- ✓ Disciplinas associadas são retornadas
- ✓ Campo `semester` da tabela pivot é incluído
- ✓ Dados aparecem corretamente formatados

**Resultado Indesejado:**
- ✗ Erro de associação não configurada
- ✗ Campo `semester` não é retornado
- ✗ Erro ao fazer JOIN

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6: Associações no Model Discipline

**Objetivo:** Verificar se o model Discipline consegue buscar cursos associados

**Passos:**
1. Criar um script de teste em `backend/test-discipline-courses.js`
   ```javascript
   const { Course, Discipline } = require('./src/models');

   async function testDisciplineAssociations() {
     try {
       // Buscar disciplina com seus cursos
       const discipline = await Discipline.findByPk(1, {
         include: [{
           model: Course,
           as: 'courses',
           through: { attributes: ['semester'] }
         }]
       });

       if (discipline) {
         console.log('✓ Disciplina encontrada:', discipline.name);
         console.log('✓ Cursos associados:', discipline.courses.length);

         if (discipline.courses.length > 0) {
           discipline.courses.forEach(course => {
             console.log(`  - ${course.name} (Semestre: ${course.course_disciplines.semester})`);
           });
         }
       } else {
         console.log('✗ Disciplina não encontrada');
       }
     } catch (error) {
       console.error('✗ Erro ao buscar disciplina:', error.message);
     } finally {
       process.exit();
     }
   }

   testDisciplineAssociations();
   ```
2. Executar o script
   ```bash
   node backend/test-discipline-courses.js
   ```

**Resultado Esperado:**
- ✓ Script executa sem erros
- ✓ Disciplina é encontrada
- ✓ Cursos associados são retornados
- ✓ Campo `semester` da tabela pivot é incluído
- ✓ Relacionamento bidirecional funciona corretamente

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 7: Adicionar Disciplina a Curso (Método Sequelize)

**Objetivo:** Verificar se o método `addDiscipline` gerado pelo Sequelize funciona corretamente

**Passos:**
1. Criar script de teste `backend/test-add-discipline.js`
   ```javascript
   const { Course, Discipline } = require('./src/models');

   async function testAddDiscipline() {
     try {
       const course = await Course.findByPk(1);
       const discipline = await Discipline.findByPk(2);

       if (!course || !discipline) {
         console.log('✗ Curso ou disciplina não encontrados');
         process.exit(1);
       }

       // Adicionar disciplina ao curso no semestre 3
       await course.addDiscipline(discipline, { through: { semester: 3 } });
       console.log('✓ Disciplina adicionada ao curso com sucesso');

       // Verificar se foi adicionada
       const disciplines = await course.getDisciplines();
       const added = disciplines.find(d => d.id === discipline.id);

       if (added && added.course_disciplines.semester === 3) {
         console.log('✓ Disciplina encontrada no curso com semestre correto');
       } else {
         console.log('✗ Disciplina não foi adicionada corretamente');
       }
     } catch (error) {
       console.error('✗ Erro:', error.message);
     } finally {
       process.exit();
     }
   }

   testAddDiscipline();
   ```
2. Executar script
   ```bash
   node backend/test-add-discipline.js
   ```

**Resultado Esperado:**
- ✓ Método `addDiscipline` executa sem erros
- ✓ Registro é criado na tabela pivot
- ✓ Campo `semester` é salvo corretamente
- ✓ Método `getDisciplines` retorna a disciplina adicionada

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTES DE VALIDAÇÃO

### Teste 8: Validação de Índice Único Composto

**Objetivo:** Verificar se o índice único composto previne duplicação de disciplina no mesmo semestre

**Passos:**
1. Inserir um relacionamento válido
   ```sql
   INSERT INTO course_disciplines (course_id, discipline_id, semester, created_at, updated_at)
   VALUES (1, 1, 2, NOW(), NOW());
   ```
2. Tentar inserir a mesma combinação novamente
   ```sql
   INSERT INTO course_disciplines (course_id, discipline_id, semester, created_at, updated_at)
   VALUES (1, 1, 2, NOW(), NOW());
   ```

**Resultado Esperado:**
- ✓ Primeira inserção com sucesso
- ✓ Segunda inserção falha com erro de duplicação (Duplicate entry)
- ✓ Erro menciona índice `unique_course_discipline_semester`

**Como verificar:**
- Verificar mensagem de erro MySQL
- Confirmar que apenas 1 registro existe na tabela

**Resultado Indesejado:**
- ✗ Segunda inserção é bem-sucedida (índice único não funciona)
- ✗ Erro diferente do esperado

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 9: Permitir Mesma Disciplina em Semestres Diferentes

**Objetivo:** Verificar que uma disciplina pode ser oferecida em múltiplos semestres do mesmo curso

**Passos:**
1. Inserir disciplina no semestre 1
   ```sql
   INSERT INTO course_disciplines (course_id, discipline_id, semester, created_at, updated_at)
   VALUES (1, 2, 1, NOW(), NOW());
   ```
2. Inserir a mesma disciplina no semestre 4
   ```sql
   INSERT INTO course_disciplines (course_id, discipline_id, semester, created_at, updated_at)
   VALUES (1, 2, 4, NOW(), NOW());
   ```
3. Verificar ambos os registros
   ```sql
   SELECT * FROM course_disciplines WHERE course_id = 1 AND discipline_id = 2;
   ```

**Resultado Esperado:**
- ✓ Ambas as inserções são bem-sucedidas
- ✓ Query retorna 2 registros distintos
- ✓ Semestres estão corretos (1 e 4)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 10: Validação de Foreign Key - Curso Inválido

**Objetivo:** Verificar que não é possível inserir relacionamento com course_id inexistente

**Passos:**
1. Tentar inserir relacionamento com course_id que não existe
   ```sql
   INSERT INTO course_disciplines (course_id, discipline_id, semester, created_at, updated_at)
   VALUES (99999, 1, 1, NOW(), NOW());
   ```

**Resultado Esperado:**
- ✓ Inserção falha com erro de foreign key
- ✓ Erro menciona constraint de `course_id`
- ✓ Nenhum registro é criado

**Resultado Indesejado:**
- ✗ Inserção bem-sucedida com course_id inválido
- ✗ Foreign key não está funcionando

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 11: Validação de Foreign Key - Disciplina Inválida

**Objetivo:** Verificar que não é possível inserir relacionamento com discipline_id inexistente

**Passos:**
1. Tentar inserir relacionamento com discipline_id que não existe
   ```sql
   INSERT INTO course_disciplines (course_id, discipline_id, semester, created_at, updated_at)
   VALUES (1, 99999, 1, NOW(), NOW());
   ```

**Resultado Esperado:**
- ✓ Inserção falha com erro de foreign key
- ✓ Erro menciona constraint de `discipline_id`
- ✓ Nenhum registro é criado

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 12: Validação de Restrição ON DELETE RESTRICT (Curso)

**Objetivo:** Verificar que não é possível deletar um curso que possui disciplinas vinculadas

**Passos:**
1. Garantir que existe relacionamento para curso 1
   ```sql
   SELECT * FROM course_disciplines WHERE course_id = 1;
   ```
2. Tentar deletar o curso
   ```sql
   DELETE FROM courses WHERE id = 1;
   ```

**Resultado Esperado:**
- ✓ Deleção falha com erro de foreign key constraint
- ✓ Erro menciona que existem registros dependentes em `course_disciplines`
- ✓ Curso não é deletado

**Como verificar:**
- Verificar mensagem de erro
- Confirmar que curso ainda existe após tentativa de deleção

**Resultado Indesejado:**
- ✗ Curso é deletado e relacionamentos são apagados em cascata (deveria ser RESTRICT)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 13: Validação de Restrição ON DELETE RESTRICT (Disciplina)

**Objetivo:** Verificar que não é possível deletar uma disciplina que está vinculada a cursos

**Passos:**
1. Garantir que existe relacionamento para disciplina 1
   ```sql
   SELECT * FROM course_disciplines WHERE discipline_id = 1;
   ```
2. Tentar deletar a disciplina
   ```sql
   DELETE FROM disciplines WHERE id = 1;
   ```

**Resultado Esperado:**
- ✓ Deleção falha com erro de foreign key constraint
- ✓ Erro menciona registros dependentes
- ✓ Disciplina não é deletada

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ⚠️ TESTES DE EDGE CASES

### Teste 14: Inserção com Semestre Mínimo (1)

**Objetivo:** Validar que semestre 1 é aceito

**Passos:**
1. Inserir relacionamento com semester = 1
   ```sql
   INSERT INTO course_disciplines (course_id, discipline_id, semester, created_at, updated_at)
   VALUES (1, 3, 1, NOW(), NOW());
   ```

**Resultado Esperado:**
- ✓ Inserção bem-sucedida
- ✓ Semestre é salvo corretamente como 1

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 15: Inserção com Semestre Máximo (12)

**Objetivo:** Validar que semestre 12 é aceito (limite definido na migration)

**Passos:**
1. Inserir relacionamento com semester = 12
   ```sql
   INSERT INTO course_disciplines (course_id, discipline_id, semester, created_at, updated_at)
   VALUES (1, 4, 12, NOW(), NOW());
   ```

**Resultado Esperado:**
- ✓ Inserção bem-sucedida
- ✓ Semestre é salvo corretamente como 12

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 16: Inserção com Semestre Inválido (Negativo)

**Objetivo:** Verificar comportamento ao tentar inserir semestre negativo

**Método:**
```sql
INSERT INTO course_disciplines (course_id, discipline_id, semester, created_at, updated_at)
VALUES (1, 5, -1, NOW(), NOW());
```

**Esperado:**
- ✓ Inserção falha ou valor é rejeitado
- ✓ Erro apropriado é retornado

**Nota:** A validação min/max na migration é apenas documentação. MySQL permite valores fora do range. Validação real deve ser feita na camada de aplicação (model/controller).

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 17: Inserção com Semestre Acima do Limite (13)

**Objetivo:** Verificar comportamento ao tentar inserir semestre acima de 12

**Método:**
```sql
INSERT INTO course_disciplines (course_id, discipline_id, semester, created_at, updated_at)
VALUES (1, 6, 13, NOW(), NOW());
```

**Esperado:**
- ✓ Inserção bem-sucedida (MySQL não valida automaticamente min/max)
- ✗ Se inserção for bloqueada, validação no BD está funcionando

**Nota:** Validação de range deve ser implementada na camada de aplicação.

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 18: Atualização Automática do Timestamp updated_at

**Objetivo:** Verificar se o campo updated_at é atualizado automaticamente ao modificar registro

**Passos:**
1. Inserir um registro
   ```sql
   INSERT INTO course_disciplines (course_id, discipline_id, semester, created_at, updated_at)
   VALUES (2, 2, 3, NOW(), NOW());
   ```
2. Anotar o valor de `updated_at`
   ```sql
   SELECT updated_at FROM course_disciplines WHERE course_id = 2 AND discipline_id = 2;
   ```
3. Aguardar alguns segundos e atualizar o registro
   ```sql
   UPDATE course_disciplines SET semester = 4 WHERE course_id = 2 AND discipline_id = 2;
   ```
4. Verificar novamente o `updated_at`
   ```sql
   SELECT updated_at FROM course_disciplines WHERE course_id = 2 AND discipline_id = 2;
   ```

**Resultado Esperado:**
- ✓ Campo `updated_at` foi atualizado automaticamente
- ✓ Novo timestamp é posterior ao original

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔄 TESTES DE ROLLBACK

### Teste 19: Rollback da Migration

**Objetivo:** Verificar se o método `down` da migration funciona corretamente

**Passos:**
1. Executar rollback da migration
   ```bash
   cd backend
   npx sequelize-cli db:migrate:undo
   ```
2. Verificar se a tabela foi removida
   ```sql
   SHOW TABLES LIKE 'course_disciplines';
   ```
3. Verificar se os índices foram removidos
   ```sql
   SHOW INDEX FROM course_disciplines;
   ```

**Resultado Esperado:**
- ✓ Migration revertida com sucesso
- ✓ Tabela `course_disciplines` não existe mais
- ✓ Todos os índices foram removidos
- ✓ Nenhum erro durante o rollback

**Resultado Indesejado:**
- ✗ Erro ao reverter migration
- ✗ Tabela ainda existe após rollback
- ✗ Índices não foram removidos

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 20: Re-executar Migration Após Rollback

**Objetivo:** Verificar se a migration pode ser executada novamente após rollback

**Passos:**
1. Após executar rollback (Teste 19), re-executar a migration
   ```bash
   npx sequelize-cli db:migrate
   ```
2. Verificar se a tabela foi recriada
   ```sql
   DESCRIBE course_disciplines;
   ```

**Resultado Esperado:**
- ✓ Migration executada com sucesso novamente
- ✓ Tabela recriada com mesma estrutura
- ✓ Todos os índices recriados
- ✓ Nenhum erro durante a execução

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ✅ CHECKLIST FINAL

### Funcionalidade
- [ ] Tabela course_disciplines foi criada corretamente
- [ ] Todos os campos estão presentes e com tipos corretos
- [ ] Índices foram criados (único composto + índices simples)
- [ ] Foreign keys funcionam com RESTRICT/CASCADE
- [ ] Associações belongsToMany funcionam em ambos os models
- [ ] Métodos Sequelize (addDiscipline, getDisciplines) funcionam
- [ ] Validação de duplicação funciona (índice único composto)
- [ ] Restrição de deleção funciona (ON DELETE RESTRICT)

### Código
- [ ] Migration está bem documentada com comentários
- [ ] Associações nos models estão documentadas com exemplos
- [ ] Sem console.log desnecessários
- [ ] Código segue padrões do projeto

### Integridade de Dados
- [ ] Foreign keys previnem inserção de IDs inválidos
- [ ] Índice único previne duplicação de disciplina no mesmo semestre
- [ ] Restrição RESTRICT previne exclusão acidental de curso/disciplina vinculados
- [ ] Timestamps são preenchidos automaticamente

### Documentação
- [ ] README.md atualizado com informações da nova migration
- [ ] backlog.json atualizado com status "Em Andamento"
- [ ] Plano de testes criado (este arquivo)

### Rollback
- [ ] Migration pode ser revertida sem erros
- [ ] Tabela e índices são removidos corretamente no rollback
- [ ] Migration pode ser executada novamente após rollback

---

## 🛠️ FERRAMENTAS RECOMENDADAS

### Banco de Dados
- **MySQL Workbench** - Interface gráfica para visualizar estrutura e dados
- **DBeaver** - Cliente SQL universal (alternativa)
- **MySQL CLI** - Linha de comando (`mysql -u root -p secretaria_online`)

### Backend
- **Node.js** - Para executar scripts de teste
- **Sequelize CLI** - Para gerenciar migrations (`npx sequelize-cli`)
- **VS Code** - Editor com extensões MySQL e JavaScript

### Específicos para esta feature
- **Scripts de teste personalizados** - Criar arquivos .js na pasta backend/ para testar associações
- **Console do MySQL** - Para testes de queries e validações SQL diretas

---

## 📊 RESULTADO FINAL DOS TESTES

**Data de execução:** _[Preencher]_
**Executado por:** _[Preencher]_

### Resumo
- **Total de testes:** 20
- **Testes aprovados:** [X]
- **Testes reprovados:** [X]
- **Testes não executados:** [X]

### Decisão
- [ ] **APROVADO** - Feature pronta para versionamento
- [ ] **REPROVADO** - Necessita ajustes (detalhar abaixo)

### Problemas Encontrados
_[Descrever problemas encontrados durante os testes]_

### Próximas Ações
_[Descrever ações necessárias]_

---

## 📝 NOTAS ADICIONAIS

### Observações sobre Validações

**Importante:** A validação de `min: 1` e `max: 12` definida na migration é apenas **documentação**. MySQL não aplica automaticamente essas validações. Para garantir que semestres estejam no range correto:

1. **Implementar validação no model Sequelize** (quando criar model CourseDiscipline no futuro)
2. **Implementar validação nos controllers** antes de inserir/atualizar
3. **Validar no frontend** para melhor UX

### Relacionamento N:N Bidirecional

A configuração atual permite:
- **Do Curso → Disciplinas**: `course.getDisciplines()`, `course.addDiscipline()`
- **Da Disciplina → Cursos**: `discipline.getCourses()`, `discipline.addCourse()`

Isso é útil para consultas em ambas as direções.

### Limpeza Após Testes

Se necessário limpar dados de teste:

```sql
-- Remover todos os relacionamentos de teste
DELETE FROM course_disciplines WHERE id > 0;

-- Resetar auto_increment
ALTER TABLE course_disciplines AUTO_INCREMENT = 1;
```

---

**IMPORTANTE:** Não prossiga para a próxima feature sem executar TODOS os testes listados neste arquivo e corrigir eventuais problemas encontrados.
