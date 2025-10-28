# PLANO DE TESTES - feat-014: Criar migrations para Evaluation e Grade

**Feature:** feat-014 - Criar migrations para Evaluation e Grade
**Grupo:** Banco de Dados e Modelos
**Data de criação:** 2025-10-27
**Status:** Aguardando execução

---

## 🔧 PREPARAÇÃO DO AMBIENTE

### Pré-requisitos

Certifique-se que o ambiente está configurado:

```bash
# Backend
cd backend
npm install

# Verificar conexão com banco
npm run db:test

# Verificar migrations executadas
npx sequelize-cli db:migrate:status
```

**Esperado:**
- "Database connection successful"
- Migrations create-evaluations e create-grades devem estar listadas como "up"

### Variáveis de Ambiente Necessárias

- [ ] DB_HOST configurada
- [ ] DB_PORT configurada
- [ ] DB_NAME configurada
- [ ] DB_USER configurada
- [ ] DB_PASSWORD configurada

---

## 📋 TESTES FUNCIONAIS

### Teste 1: Verificar Estrutura da Tabela evaluations

**Objetivo:** Verificar se a tabela evaluations foi criada corretamente com todos os campos e tipos

**Passos:**
1. Conectar ao banco de dados MySQL
2. Executar query:
   ```sql
   DESCRIBE evaluations;
   ```
3. Verificar cada campo da tabela

**Resultado Esperado:**
- ✓ Campo `id` existe (tipo INT, PRIMARY KEY, AUTO_INCREMENT)
- ✓ Campo `class_id` existe (tipo INT, NOT NULL, FK para classes)
- ✓ Campo `teacher_id` existe (tipo INT UNSIGNED, NOT NULL, FK para users)
- ✓ Campo `discipline_id` existe (tipo INT, NOT NULL, FK para disciplines)
- ✓ Campo `name` existe (tipo VARCHAR(100), NOT NULL)
- ✓ Campo `date` existe (tipo DATE, NOT NULL)
- ✓ Campo `type` existe (tipo ENUM('grade','concept'), NOT NULL, DEFAULT 'grade')
- ✓ Campo `created_at` existe (tipo DATETIME, NOT NULL)
- ✓ Campo `updated_at` existe (tipo DATETIME, NOT NULL)
- ✓ Campo `deleted_at` existe (tipo DATETIME, NULL)

**Como verificar:**
- Usar ferramenta de gerenciamento MySQL (DBeaver, MySQL Workbench, phpMyAdmin)
- Executar DESCRIBE no terminal MySQL

**Resultado Indesejado:**
- ✗ Algum campo está faltando
- ✗ Tipo de dados incorreto
- ✗ Campo deleted_at não é nullable

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Verificar Índices da Tabela evaluations

**Objetivo:** Verificar se todos os índices foram criados corretamente

**Passos:**
1. Conectar ao banco de dados
2. Executar query:
   ```sql
   SHOW INDEX FROM evaluations;
   ```
3. Verificar a existência de cada índice

**Resultado Esperado:**
- ✓ Índice PRIMARY existe (campo id)
- ✓ Índice `idx_evaluations_class_id` existe (campo class_id, tipo BTREE)
- ✓ Índice `idx_evaluations_teacher_id` existe (campo teacher_id, tipo BTREE)
- ✓ Índice `idx_evaluations_discipline_id` existe (campo discipline_id, tipo BTREE)
- ✓ Índice `idx_evaluations_date` existe (campo date, tipo BTREE)
- ✓ Índice `idx_evaluations_type` existe (campo type, tipo BTREE)
- ✓ Índice `idx_evaluations_deleted_at` existe (campo deleted_at, tipo BTREE)
- ✓ Índice `idx_evaluations_class_active` existe (campos class_id, deleted_at)
- ✓ Índice `idx_evaluations_class_discipline` existe (campos class_id, discipline_id)
- ✓ Índice `idx_evaluations_teacher_class` existe (campos teacher_id, class_id)

**Como verificar:**
- Executar SHOW INDEX no MySQL
- Contar o número total de índices (deve ser 10)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Verificar Foreign Keys da Tabela evaluations

**Objetivo:** Verificar se as foreign keys foram criadas corretamente com as ações apropriadas

**Passos:**
1. Conectar ao banco de dados
2. Executar query:
   ```sql
   SELECT
     CONSTRAINT_NAME,
     COLUMN_NAME,
     REFERENCED_TABLE_NAME,
     REFERENCED_COLUMN_NAME,
     UPDATE_RULE,
     DELETE_RULE
   FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
   WHERE TABLE_SCHEMA = 'secretaria_online'
   AND TABLE_NAME = 'evaluations'
   AND REFERENCED_TABLE_NAME IS NOT NULL;
   ```

**Resultado Esperado:**
- ✓ FK para `classes` existe (coluna class_id, UPDATE: CASCADE, DELETE: RESTRICT)
- ✓ FK para `users` existe (coluna teacher_id, UPDATE: CASCADE, DELETE: RESTRICT)
- ✓ FK para `disciplines` existe (coluna discipline_id, UPDATE: CASCADE, DELETE: RESTRICT)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 4: Verificar Estrutura da Tabela grades

**Objetivo:** Verificar se a tabela grades foi criada corretamente com todos os campos e tipos

**Passos:**
1. Conectar ao banco de dados MySQL
2. Executar query:
   ```sql
   DESCRIBE grades;
   ```
3. Verificar cada campo da tabela

**Resultado Esperado:**
- ✓ Campo `id` existe (tipo INT, PRIMARY KEY, AUTO_INCREMENT)
- ✓ Campo `evaluation_id` existe (tipo INT, NOT NULL, FK para evaluations)
- ✓ Campo `student_id` existe (tipo INT UNSIGNED, NOT NULL, FK para users)
- ✓ Campo `grade` existe (tipo DECIMAL(4,2), NULL)
- ✓ Campo `concept` existe (tipo ENUM('satisfactory','unsatisfactory'), NULL)
- ✓ Campo `created_at` existe (tipo DATETIME, NOT NULL)
- ✓ Campo `updated_at` existe (tipo DATETIME, NOT NULL)
- ✓ Campo `deleted_at` existe (tipo DATETIME, NULL)

**Como verificar:**
- Usar ferramenta de gerenciamento MySQL
- Verificar que grade e concept podem ser NULL simultaneamente

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5: Verificar Índices da Tabela grades

**Objetivo:** Verificar se todos os índices foram criados corretamente, incluindo índice único

**Passos:**
1. Conectar ao banco de dados
2. Executar query:
   ```sql
   SHOW INDEX FROM grades;
   ```
3. Verificar a existência e unicidade de cada índice

**Resultado Esperado:**
- ✓ Índice PRIMARY existe (campo id)
- ✓ Índice `idx_grades_evaluation_id` existe (campo evaluation_id, tipo BTREE)
- ✓ Índice `idx_grades_student_id` existe (campo student_id, tipo BTREE)
- ✓ Índice `idx_grades_unique_evaluation_student` existe (campos evaluation_id, student_id, UNIQUE)
- ✓ Índice `idx_grades_deleted_at` existe (campo deleted_at, tipo BTREE)
- ✓ Índice `idx_grades_student_active` existe (campos student_id, deleted_at)
- ✓ Índice `idx_grades_created_at` existe (campo created_at, tipo BTREE)

**Como verificar:**
- Verificar que idx_grades_unique_evaluation_student é UNIQUE
- Contar o número total de índices (deve ser 7)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6: Verificar Constraints CHECK da Tabela grades

**Objetivo:** Verificar se as constraints CHECK foram criadas corretamente

**Passos:**
1. Conectar ao banco de dados
2. Executar query:
   ```sql
   SELECT
     CONSTRAINT_NAME,
     CHECK_CLAUSE
   FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
   WHERE CONSTRAINT_SCHEMA = 'secretaria_online'
   AND CONSTRAINT_NAME LIKE 'chk_grades%';
   ```

**Resultado Esperado:**
- ✓ Constraint `chk_grades_grade_range` existe (verifica grade entre 0.00 e 10.00)
- ✓ Constraint `chk_grades_grade_or_concept` existe (verifica XOR entre grade e concept)

**Como verificar:**
- Query deve retornar 2 constraints
- CHECK_CLAUSE deve conter as validações corretas

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTES DE VALIDAÇÃO

### Teste 7: Criar Avaliação com Dados Válidos (Tipo Grade)

**Input:**
```javascript
{
  class_id: 1,
  teacher_id: 2,
  discipline_id: 1,
  name: 'Prova 1',
  date: '2025-12-15',
  type: 'grade'
}
```

**Método:** Usar Sequelize via Node.js ou SQL direto

**Esperado:**
- ✓ Avaliação criada com sucesso
- ✓ Campo type armazenado como 'grade'
- ✓ Campos created_at e updated_at preenchidos automaticamente
- ✓ Campo deleted_at é NULL

**Como testar:**
```javascript
// Node.js
const { Evaluation } = require('./src/models');
const evaluation = await Evaluation.create({
  class_id: 1,
  teacher_id: 2,
  discipline_id: 1,
  name: 'Prova 1',
  date: '2025-12-15',
  type: 'grade'
});
console.log(evaluation.id); // Deve retornar ID gerado
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 8: Criar Avaliação com Dados Válidos (Tipo Concept)

**Input:**
```javascript
{
  class_id: 1,
  teacher_id: 2,
  discipline_id: 1,
  name: 'Trabalho Prático',
  date: '2025-12-20',
  type: 'concept'
}
```

**Método:** Usar Sequelize via Node.js

**Esperado:**
- ✓ Avaliação criada com sucesso
- ✓ Campo type armazenado como 'concept'

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 9: Criar Nota Numérica Válida

**Input:**
```javascript
{
  evaluation_id: 1,
  student_id: 5,
  grade: 8.5,
  concept: null
}
```

**Método:** Usar Sequelize via Node.js

**Esperado:**
- ✓ Nota criada com sucesso
- ✓ Campo grade armazenado como 8.50 (DECIMAL 4,2)
- ✓ Campo concept é NULL

**Como testar:**
```javascript
const { Grade } = require('./src/models');
const grade = await Grade.create({
  evaluation_id: 1,
  student_id: 5,
  grade: 8.5,
  concept: null
});
console.log(grade.grade); // Deve retornar "8.50"
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 10: Criar Conceito Válido

**Input:**
```javascript
{
  evaluation_id: 2,
  student_id: 5,
  grade: null,
  concept: 'satisfactory'
}
```

**Método:** Usar Sequelize via Node.js

**Esperado:**
- ✓ Nota criada com sucesso
- ✓ Campo concept armazenado como 'satisfactory'
- ✓ Campo grade é NULL

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 11: Validação - Tipo de Avaliação Inválido

**Input:**
```javascript
{
  class_id: 1,
  teacher_id: 2,
  discipline_id: 1,
  name: 'Prova Teste',
  date: '2025-12-15',
  type: 'invalid_type'
}
```

**Método:** Tentar criar via Sequelize

**Esperado:**
- ✓ Deve rejeitar com erro de validação
- ✓ Mensagem de erro indica que type deve ser 'grade' ou 'concept'

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 12: Validação - Nota Fora do Intervalo (Acima de 10)

**Input:**
```javascript
{
  evaluation_id: 1,
  student_id: 5,
  grade: 11.0,
  concept: null
}
```

**Método:** Tentar criar via Sequelize ou SQL

**Esperado:**
- ✓ Deve rejeitar com erro de constraint CHECK
- ✓ Mensagem indica que grade deve estar entre 0.00 e 10.00

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 13: Validação - Nota Fora do Intervalo (Negativa)

**Input:**
```javascript
{
  evaluation_id: 1,
  student_id: 5,
  grade: -1.5,
  concept: null
}
```

**Método:** Tentar criar via Sequelize ou SQL

**Esperado:**
- ✓ Deve rejeitar com erro de constraint CHECK
- ✓ Mensagem indica que grade deve estar entre 0.00 e 10.00

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 14: Validação XOR - Ambos grade E concept Preenchidos

**Input:**
```javascript
{
  evaluation_id: 1,
  student_id: 5,
  grade: 8.5,
  concept: 'satisfactory'
}
```

**Método:** Tentar criar via Sequelize ou SQL

**Esperado:**
- ✓ Deve rejeitar com erro de constraint CHECK
- ✓ Mensagem indica que apenas grade OU concept pode ser preenchido

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 15: Validação XOR - Nenhum Preenchido

**Input:**
```javascript
{
  evaluation_id: 1,
  student_id: 5,
  grade: null,
  concept: null
}
```

**Método:** Tentar criar via Sequelize ou SQL

**Esperado:**
- ✓ Deve rejeitar com erro de constraint CHECK
- ✓ Mensagem indica que grade ou concept deve ser preenchido

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 16: Validação - Conceito Inválido

**Input:**
```javascript
{
  evaluation_id: 2,
  student_id: 5,
  grade: null,
  concept: 'invalid_concept'
}
```

**Método:** Tentar criar via Sequelize ou SQL

**Esperado:**
- ✓ Deve rejeitar com erro de validação ENUM
- ✓ Mensagem indica que concept deve ser 'satisfactory' ou 'unsatisfactory'

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 17: Validação - Campos Obrigatórios Vazios (Evaluation)

**Input:**
```javascript
{
  class_id: null,
  teacher_id: 2,
  discipline_id: 1,
  name: 'Prova',
  date: '2025-12-15',
  type: 'grade'
}
```

**Método:** Tentar criar via Sequelize

**Esperado:**
- ✓ Deve rejeitar com erro de validação NOT NULL
- ✓ Mensagem indica que class_id é obrigatório

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔗 TESTES DE INTEGRAÇÃO

### Teste 18: Foreign Key - Avaliação com Turma Inexistente

**Cenário:** Tentar criar avaliação referenciando class_id que não existe

**Input:**
```javascript
{
  class_id: 99999,
  teacher_id: 2,
  discipline_id: 1,
  name: 'Prova',
  date: '2025-12-15',
  type: 'grade'
}
```

**Esperado:**
- ✓ Deve rejeitar com erro de foreign key constraint
- ✓ Mensagem indica que class_id não existe na tabela classes

**Como verificar:**
```javascript
try {
  await Evaluation.create({...});
} catch (error) {
  console.log(error.name); // Deve ser ForeignKeyConstraintError
}
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 19: Foreign Key - Nota com Avaliação Inexistente

**Cenário:** Tentar criar nota referenciando evaluation_id que não existe

**Input:**
```javascript
{
  evaluation_id: 99999,
  student_id: 5,
  grade: 8.5,
  concept: null
}
```

**Esperado:**
- ✓ Deve rejeitar com erro de foreign key constraint
- ✓ Mensagem indica que evaluation_id não existe na tabela evaluations

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 20: Índice Único - Duplicação de Nota

**Cenário:** Tentar criar duas notas para o mesmo aluno na mesma avaliação

**Passos:**
1. Criar primeira nota para student_id=5, evaluation_id=1
2. Tentar criar segunda nota para student_id=5, evaluation_id=1

**Esperado:**
- ✓ Primeira nota é criada com sucesso
- ✓ Segunda tentativa é rejeitada por violação de índice único
- ✓ Mensagem indica duplicação da chave (evaluation_id, student_id)

**Como testar:**
```javascript
await Grade.create({ evaluation_id: 1, student_id: 5, grade: 8.5, concept: null });

try {
  await Grade.create({ evaluation_id: 1, student_id: 5, grade: 9.0, concept: null });
} catch (error) {
  console.log(error.name); // Deve ser UniqueConstraintError
}
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 21: Cascade Delete - Deletar Avaliação Remove Notas

**Cenário:** Ao deletar uma avaliação, todas as notas associadas devem ser deletadas

**Passos:**
1. Criar avaliação
2. Criar 3 notas para essa avaliação
3. Deletar a avaliação (hard delete)
4. Verificar se as notas foram removidas

**Esperado:**
- ✓ Avaliação é deletada com sucesso
- ✓ Todas as notas associadas são removidas automaticamente (CASCADE)
- ✓ Query para buscar notas da avaliação retorna 0 resultados

**Como testar:**
```sql
-- Criar avaliação
INSERT INTO evaluations (...) VALUES (...);
SET @evaluation_id = LAST_INSERT_ID();

-- Criar notas
INSERT INTO grades (evaluation_id, student_id, grade, concept) VALUES (@evaluation_id, 5, 8.5, NULL);
INSERT INTO grades (evaluation_id, student_id, grade, concept) VALUES (@evaluation_id, 6, 7.0, NULL);

-- Verificar contagem antes
SELECT COUNT(*) FROM grades WHERE evaluation_id = @evaluation_id; -- Deve ser 2

-- Deletar avaliação
DELETE FROM evaluations WHERE id = @evaluation_id;

-- Verificar contagem depois
SELECT COUNT(*) FROM grades WHERE evaluation_id = @evaluation_id; -- Deve ser 0
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 22: Associações do Model Evaluation

**Cenário:** Verificar se as associações do model Evaluation funcionam corretamente

**Passos:**
1. Buscar uma avaliação com include de Class, Teacher, Discipline e Grades
2. Verificar se os dados relacionados são carregados

**Esperado:**
- ✓ Avaliação carrega a turma (class)
- ✓ Avaliação carrega o professor (teacher)
- ✓ Avaliação carrega a disciplina (discipline)
- ✓ Avaliação carrega as notas (grades)

**Como testar:**
```javascript
const evaluation = await Evaluation.findByPk(1, {
  include: ['class', 'teacher', 'discipline', 'grades']
});

console.log(evaluation.class); // Deve retornar objeto Class
console.log(evaluation.teacher); // Deve retornar objeto User
console.log(evaluation.discipline); // Deve retornar objeto Discipline
console.log(evaluation.grades); // Deve retornar array de Grade
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 23: Associações do Model Grade

**Cenário:** Verificar se as associações do model Grade funcionam corretamente

**Passos:**
1. Buscar uma nota com include de Evaluation e Student
2. Verificar se os dados relacionados são carregados

**Esperado:**
- ✓ Nota carrega a avaliação (evaluation)
- ✓ Nota carrega o aluno (student)

**Como testar:**
```javascript
const grade = await Grade.findByPk(1, {
  include: ['evaluation', 'student']
});

console.log(grade.evaluation); // Deve retornar objeto Evaluation
console.log(grade.student); // Deve retornar objeto User
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ⚠️ TESTES DE EDGE CASES

### Teste 24: Soft Delete - Avaliação

**Cenário:** Testar soft delete de avaliação (paranoid)

**Passos:**
1. Criar avaliação
2. Executar método destroy()
3. Verificar que avaliação não aparece em queries normais
4. Verificar que deleted_at foi preenchido

**Esperado:**
- ✓ Avaliação não aparece em Evaluation.findAll()
- ✓ Campo deleted_at está preenchido com timestamp
- ✓ Avaliação ainda pode ser recuperada com paranoid: false

**Como testar:**
```javascript
const evaluation = await Evaluation.create({...});
await evaluation.destroy(); // Soft delete

const found = await Evaluation.findByPk(evaluation.id);
console.log(found); // Deve ser null

const withDeleted = await Evaluation.findByPk(evaluation.id, { paranoid: false });
console.log(withDeleted.deleted_at); // Deve ter timestamp
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 25: Soft Delete - Nota

**Cenário:** Testar soft delete de nota (paranoid)

**Passos:**
1. Criar nota
2. Executar método destroy()
3. Verificar que nota não aparece em queries normais
4. Verificar que deleted_at foi preenchido

**Esperado:**
- ✓ Nota não aparece em Grade.findAll()
- ✓ Campo deleted_at está preenchido com timestamp
- ✓ Nota ainda pode ser recuperada com paranoid: false

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 26: Valores Extremos - Nota Máxima (10.00)

**Input:**
```javascript
{
  evaluation_id: 1,
  student_id: 5,
  grade: 10.00,
  concept: null
}
```

**Esperado:**
- ✓ Nota criada com sucesso
- ✓ Campo grade armazenado como 10.00

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 27: Valores Extremos - Nota Mínima (0.00)

**Input:**
```javascript
{
  evaluation_id: 1,
  student_id: 5,
  grade: 0.00,
  concept: null
}
```

**Esperado:**
- ✓ Nota criada com sucesso
- ✓ Campo grade armazenado como 0.00

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 28: Valores Extremos - Nota com Precisão Decimal

**Input:**
```javascript
{
  evaluation_id: 1,
  student_id: 5,
  grade: 8.75,
  concept: null
}
```

**Esperado:**
- ✓ Nota criada com sucesso
- ✓ Campo grade armazenado como 8.75 (mantém 2 casas decimais)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 29: Nome de Avaliação com Caracteres Especiais

**Input:**
```javascript
{
  class_id: 1,
  teacher_id: 2,
  discipline_id: 1,
  name: 'Prova 1 - Álgebra & Geometria (1º Semestre)',
  date: '2025-12-15',
  type: 'grade'
}
```

**Esperado:**
- ✓ Avaliação criada com sucesso
- ✓ Nome armazenado corretamente com acentos e caracteres especiais

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 30: Data da Avaliação no Passado

**Input:**
```javascript
{
  class_id: 1,
  teacher_id: 2,
  discipline_id: 1,
  name: 'Prova Recuperação',
  date: '2020-01-01',
  type: 'grade'
}
```

**Esperado:**
- ✓ Avaliação criada com sucesso (não há restrição de data passada)
- ✓ Data armazenada corretamente

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ✅ CHECKLIST FINAL

### Funcionalidade
- [ ] Todos os testes funcionais passaram
- [ ] Validações funcionam corretamente
- [ ] Integrações estão operacionais
- [ ] Edge cases tratados adequadamente
- [ ] Soft delete funciona corretamente
- [ ] Foreign keys funcionam com ações corretas (CASCADE/RESTRICT)

### Estrutura do Banco
- [ ] Tabela evaluations criada com todos os campos
- [ ] Tabela grades criada com todos os campos
- [ ] Todos os índices foram criados
- [ ] Constraints CHECK funcionam corretamente
- [ ] Foreign keys configuradas corretamente

### Models Sequelize
- [ ] Model Evaluation carregado corretamente
- [ ] Model Grade carregado corretamente
- [ ] Associações funcionam (belongsTo, hasMany)
- [ ] Validações do Sequelize funcionam
- [ ] Scopes personalizados funcionam
- [ ] Métodos auxiliares funcionam

### Código
- [ ] Sem erros de sintaxe
- [ ] Migrations podem ser revertidas (down)
- [ ] Código bem documentado
- [ ] Hooks dos models funcionam

### Documentação
- [ ] README.md atualizado
- [ ] backlog.json atualizado
- [ ] Comentários inline adequados

### Performance
- [ ] Índices otimizam queries
- [ ] Não há lentidão perceptível
- [ ] Constraints não causam overhead excessivo

---

## 🛠️ FERRAMENTAS RECOMENDADAS

### Banco de Dados
- **DBeaver** - https://dbeaver.io/ (interface gráfica universal)
- **MySQL Workbench** - https://www.mysql.com/products/workbench/
- **phpMyAdmin** - Interface web para MySQL
- **Linha de comando MySQL** - Para queries rápidas

### Desenvolvimento/Testes
- **Node.js REPL** - Para testar models Sequelize rapidamente
- **Postman** - Para testar APIs (quando forem criadas)
- **VS Code** - Com extensão MySQL para queries inline

### Específicos para esta feature
- **Sequelize CLI** - Para verificar status de migrations
  ```bash
  npx sequelize-cli db:migrate:status
  ```
- **Node.js Script de Teste** - Criar arquivo test-evaluations-grades.js para testar models

---

## 📊 RESULTADO FINAL DOS TESTES

**Data de execução:** _[Preencher]_
**Executado por:** _[Preencher]_

### Resumo
- **Total de testes:** 30
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

1. **Constraint XOR (grade/concept):** É crítico testar a validação XOR. Certifique-se que:
   - Apenas grade OU concept pode estar preenchido
   - Pelo menos um dos dois deve estar preenchido
   - A constraint CHECK do MySQL está funcionando corretamente

2. **Tipo DECIMAL(4,2):** O campo grade aceita:
   - Valores de 0.00 a 10.00
   - Até 4 dígitos no total
   - 2 casas decimais (ex: 10.00, 9.99, 8.75)

3. **Soft Delete:** Lembre-se que:
   - Avaliações e notas deletadas não aparecem em queries padrão
   - Use `paranoid: false` para incluir deletados
   - Campo deleted_at contém timestamp da deleção

4. **Foreign Keys:**
   - evaluation_id → evaluations (CASCADE on delete)
   - student_id, teacher_id → users (RESTRICT on delete)
   - class_id, discipline_id → classes/disciplines (RESTRICT on delete)

5. **Charset UTF8MB4:** Garante suporte a emojis e caracteres especiais em nomes de avaliações

### Sugestões para Testes Futuros

- Testar performance com grande volume de notas (>1000)
- Testar queries complexas com múltiplos JOINs
- Testar índices compostos para otimização de queries específicas
- Criar script automatizado para popular banco com dados de teste
