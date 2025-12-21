# Estratégia de Migração de Dados - Sistema Antigo para Secretaria Online (v2)

**Data:** 2025-12-18
**Versão:** 2.0 (REVISADA)
**Status:** Em Análise

---

## 🔄 REVISÃO: ARQUITETURA DE PROFESSORES

### Estrutura Confirmada:

1. **Tabela `teachers`** (dados cadastrais)
   - Campo `nome` (STRING 200)
   - Armazena dados completos dos professores

2. **Tabela `users`** (autenticação)
   - Campo `role` (ENUM: 'admin', 'teacher', 'student')
   - Campo `teacher_id` (FK opcional → `teachers.id`)

3. **Relacionamentos:**
   - `class_teachers.teacher_id` → `teachers.id` ✅
   - `evaluations.teacher_id` → `users.id` (onde role='teacher') ✅
   - `users.teacher_id` → `teachers.id` (vincula user ao cadastro)

### Mapeamento Sistema Antigo → Novo:

| Sistema Antigo | Campo | Sistema Novo | Campo |
|----------------|-------|--------------|-------|
| `professor` | `professor_nome` | `teachers` | `nome` |
| `professor` | `professor_login` | `users` | `login` |
| `professor` | `professor_senha` | `users` | `password_hash` |

**Relação:** `professor.professor_nome` = `teachers.nome` (STRING MATCHING)

---

## 📊 DADOS IDENTIFICADOS

### Professores no Sistema Antigo:
```csv
professor_id | professor_nome              | professor_login
3            | TUTOR                       | tutor
4            | PATRICIA DA SILVA TEIXEIRA  | 20240013
5            | ROSANA SILVA COSTA          | 20240002
6            | Tony                        | 1
7            | JACKSON SANTOS SANTANA      | 20240017
8            | TAINA DA SILVA MACEDO       | 20240023
9            | Tony (duplicado)            | 1
```

### Professores Já Migrados no Sistema Novo (teachers):
```csv
id | nome
1  | PATRICIA DA SILVA TEIXEIRA  ✅ (professor_id=4)
2  | ROSANA SILVA COSTA          ✅ (professor_id=5)
3  | JACKSON SANTOS SANTANA      ✅ (professor_id=7)
4  | TAINA DA SILVA MACEDO       ✅ (professor_id=8)
```

### **FALTAM MIGRAR:**
- **professor_id=3:** TUTOR (não migrado)
- **professor_id=6:** Tony (provável estudante, verificar)
- **professor_id=9:** Tony (duplicata)

### Relacionamentos Professor-Disciplina (profmat):
```
professor_id=3 (TUTOR) → disciplinas: 44, 56, 55, 57, 58, 59, 60, 61, 51
```
**Total:** 29 relacionamentos

### Relacionamentos Professor-Série (profserie):
```
professor_id=3 (TUTOR)    → séries: 8, 26, 31, 32, 33, 34, 35, 36, 37, 38, 41, 52
professor_id=5 (ROSANA)   → série: 43
professor_id=6 (Tony)     → série: 37
professor_id=7 (JACKSON)  → série: 43
professor_id=8 (TAINA)    → séries: 46, 54
```
**Total:** 19 relacionamentos

---

## 🗺️ ESTRATÉGIA DE MIGRAÇÃO REVISADA

### **FASE 1: PREPARAÇÃO DE PROFESSORES**

#### 1.1. Criar Tabela de Mapeamento Professor
```sql
CREATE TABLE migration_professor_mapping (
  old_professor_id INT PRIMARY KEY,
  old_nome VARCHAR(200),
  new_teacher_id INT UNSIGNED,
  new_user_id INT UNSIGNED,
  match_type ENUM('exact', 'manual', 'not_found') DEFAULT 'not_found',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (new_teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (new_user_id) REFERENCES users(id)
);
```

#### 1.2. Popular Mapeamento com Professores Já Migrados

```javascript
// Mapeamento baseado em nome (STRING MATCHING)
const professorMapping = [
  { old_id: 4, old_nome: 'PATRICIA DA SILVA TEIXEIRA', new_teacher_id: 1 },
  { old_id: 5, old_nome: 'ROSANA SILVA COSTA', new_teacher_id: 2 },
  { old_id: 7, old_nome: 'JACKSON SANTOS SANTANA', new_teacher_id: 3 },
  { old_id: 8, old_nome: 'TAINA DA SILVA MACEDO', new_teacher_id: 4 },
];

for (const map of professorMapping) {
  await db.query(`
    INSERT INTO migration_professor_mapping
    (old_professor_id, old_nome, new_teacher_id, match_type)
    VALUES (?, ?, ?, 'exact')
  `, [map.old_id, map.old_nome, map.new_teacher_id]);
}
```

#### 1.3. Migrar Professor "TUTOR" para Teachers

```sql
-- Inserir TUTOR na tabela teachers
INSERT INTO teachers (nome, created_at, updated_at)
VALUES ('TUTOR', NOW(), NOW());

-- Obter ID gerado
SET @tutor_teacher_id = LAST_INSERT_ID();

-- Adicionar ao mapeamento
INSERT INTO migration_professor_mapping
(old_professor_id, old_nome, new_teacher_id, match_type)
VALUES (3, 'TUTOR', @tutor_teacher_id, 'exact');
```

#### 1.4. Verificar se Professor "Tony" é Aluno

```sql
-- Tony aparece em professor mas pode ser estudante
-- Verificar se existe em students
SELECT id, nome, matricula FROM students WHERE nome LIKE '%Tony%';

-- Se for aluno, marcar como não migrado
-- Se não for, migrar para teachers
```

**Decisão:**
- Se "Tony" for aluno: ignorar entradas professor_id=6 e 9
- Se não for aluno: migrar como professor normal

#### 1.5. Criar Usuários (users) para Professores

**IMPORTANTE:** `evaluations.teacher_id` referencia `users.id`, não `teachers.id`

```sql
-- Verificar quais professores já têm usuários
SELECT t.id, t.nome, u.id AS user_id
FROM teachers t
LEFT JOIN users u ON u.teacher_id = t.id
WHERE u.id IS NULL;

-- Criar usuários para professores sem login
INSERT INTO users (name, email, login, password_hash, role, teacher_id, created_at, updated_at)
SELECT
  t.nome,
  CONCAT(LOWER(REPLACE(t.nome, ' ', '.')), '@migrado.edu.br'),
  CONCAT('prof', t.id),
  '$2a$10$dummy_hash_migration', -- Hash dummy para forçar troca de senha
  'teacher',
  t.id,
  NOW(),
  NOW()
FROM teachers t
LEFT JOIN users u ON u.teacher_id = t.id
WHERE u.id IS NULL;

-- Atualizar mapeamento com user_ids
UPDATE migration_professor_mapping mpm
JOIN teachers t ON mpm.new_teacher_id = t.id
JOIN users u ON u.teacher_id = t.id
SET mpm.new_user_id = u.id;
```

---

### **FASE 2: CRIAÇÃO DE TURMAS (classes)**

*(Mantém-se igual à versão anterior)*

#### 2.1. Criar Turmas a partir de `sub`
```sql
-- Analisar sub.csv e criar classes
-- Exemplo: "Bacharelado em Psicologia 8°" → course_id=1, semester=8, year=2024
```

#### 2.2. Criar Tabela de Mapeamento
```sql
CREATE TABLE migration_sub_class_mapping (
  sub_id INT PRIMARY KEY,
  class_id INT NOT NULL,
  course_name VARCHAR(200),
  semester INT,
  year INT,
  FOREIGN KEY (class_id) REFERENCES classes(id)
);
```

---

### **FASE 3: ASSOCIAÇÃO PROFESSOR-TURMA-DISCIPLINA (class_teachers)**

**IMPORTANTE:** `class_teachers.teacher_id` referencia `teachers.id`

#### 3.1. Estratégia de Associação

Usar `profmat` + `profserie` para determinar:
- **profmat:** qual professor leciona qual disciplina
- **profserie:** qual professor leciona em qual série

**Lógica:**
```
professor_id → profserie → sub_id → class_id
professor_id → profmat → discipline_id

Combinar: (professor_id, sub_id, discipline_id) → (teacher_id, class_id, discipline_id)
```

#### 3.2. Popular class_teachers

```sql
-- Inserir relações professor-turma-disciplina
INSERT INTO class_teachers (class_id, teacher_id, discipline_id, created_at, updated_at)
SELECT DISTINCT
  mscm.class_id,
  mpm.new_teacher_id,  -- ✅ Usa teachers.id
  profmat.profmat_mat AS discipline_id,
  NOW(),
  NOW()
FROM profserie_temp ps  -- Tabela temporária com CSV importado
JOIN profmat_temp pm ON ps.profserie_prof = pm.profmat_prof
JOIN migration_sub_class_mapping mscm ON ps.profserie_sub = mscm.sub_id
JOIN migration_professor_mapping mpm ON ps.profserie_prof = mpm.old_professor_id
WHERE mpm.new_teacher_id IS NOT NULL
  AND mscm.class_id IS NOT NULL
ON DUPLICATE KEY UPDATE updated_at = NOW();
```

**Observação:** Relacionamentos `profmat` e `profserie` são independentes. Um professor pode lecionar uma disciplina em várias séries.

---

### **FASE 4: CRIAÇÃO DE AVALIAÇÕES (evaluations)**

**IMPORTANTE:** `evaluations.teacher_id` referencia `users.id`

#### 4.1. Determinar Professor da Avaliação

Para cada registro em `boletim_novo`:
1. Obter `disciplina` (nome textual) → `discipline_id`
2. Obter `matricula` → `student_id` → `sub_id` → `class_id`
3. Buscar em `class_teachers`:
   ```sql
   SELECT teacher_id
   FROM class_teachers
   WHERE class_id = ? AND discipline_id = ?
   ```
4. Obter `users.id` do professor:
   ```sql
   SELECT u.id
   FROM users u
   WHERE u.teacher_id = ?
   ```

#### 4.2. Criar Avaliações com Professor Correto

```sql
-- Criar avaliações "Teste"
INSERT INTO evaluations (class_id, teacher_id, discipline_id, name, date, type, created_at, updated_at)
SELECT DISTINCT
  mscm.class_id,
  u.id AS teacher_id,  -- ✅ Usa users.id
  mdm.new_discipline_id,
  'Teste (histórico)',
  '2024-01-15',
  'grade',
  NOW(),
  NOW()
FROM boletim_novo_temp bn
JOIN migration_matricula_student mms ON bn.matricula = mms.matricula
JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
JOIN class_teachers ct ON ct.class_id = mscm.class_id AND ct.discipline_id = mdm.new_discipline_id
JOIN teachers t ON ct.teacher_id = t.id
JOIN users u ON u.teacher_id = t.id  -- ✅ Vincula teachers → users
WHERE mdm.new_discipline_id IS NOT NULL
  AND mscm.class_id IS NOT NULL
  AND u.role = 'teacher';

-- Repetir para "Prova" e "Final"
```

**Fallback:** Se não houver professor em `class_teachers`:
```sql
-- Usar TUTOR como professor padrão
SELECT u.id
FROM users u
JOIN teachers t ON u.teacher_id = t.id
WHERE t.nome = 'TUTOR'
LIMIT 1;
```

---

### **FASE 5: MIGRAÇÃO DE NOTAS (grades)**

*(Mantém-se igual à versão anterior)*

```sql
-- Migrar notas vinculando evaluation_id e student_id
INSERT INTO grades (evaluation_id, student_id, grade, created_at, updated_at)
SELECT
  mem.evaluation_id,
  mms.student_id,
  CASE
    WHEN bn.teste IS NULL THEN NULL
    WHEN bn.teste > 10 THEN 10.00
    ELSE ROUND(bn.teste, 2)
  END,
  NOW(),
  NOW()
FROM boletim_novo_temp bn
JOIN migration_matricula_student mms ON bn.matricula = mms.matricula
JOIN migration_evaluation_mapping mem ON ...
WHERE ...;
```

---

## 📊 MAPEAMENTO COMPLETO

### Exemplo Prático:

**Registro em boletim_novo:**
```csv
id=11, matricula=11, disciplina="Português Instrumental", teste=4, prova=0, final=0
```

**Passos de Migração:**

1. **Identificar Aluno:**
   ```
   matricula=11 → students.id=X (via migration_matricula_student)
   ```

2. **Identificar Turma:**
   ```
   students.sub_categoria=Y → sub_id=Y → class_id=Z (via migration_sub_class_mapping)
   ```

3. **Identificar Disciplina:**
   ```
   "Português Instrumental" → discipline_id=42 (via migration_discipline_mapping)
   ```

4. **Identificar Professor:**
   ```sql
   SELECT ct.teacher_id
   FROM class_teachers ct
   WHERE ct.class_id = Z AND ct.discipline_id = 42;
   -- Retorna: teacher_id = 5 (TUTOR)

   SELECT u.id
   FROM users u
   WHERE u.teacher_id = 5 AND u.role = 'teacher';
   -- Retorna: user_id = 10
   ```

5. **Criar Avaliações:**
   ```sql
   INSERT INTO evaluations (class_id, teacher_id, discipline_id, name, date, type)
   VALUES
     (Z, 10, 42, 'Teste (histórico)', '2024-01-15', 'grade'),
     (Z, 10, 42, 'Prova (histórico)', '2024-02-15', 'grade'),
     (Z, 10, 42, 'Final (histórico)', '2024-03-15', 'grade');
   ```

6. **Criar Notas:**
   ```sql
   INSERT INTO grades (evaluation_id, student_id, grade)
   VALUES
     (101, X, 4.00),  -- Teste
     (102, X, 0.00),  -- Prova
     (103, X, 0.00);  -- Final
   ```

---

## ✅ DIFERENÇAS DA VERSÃO ANTERIOR

### ❌ **Versão 1 (Incorreta):**
- Criava professor fictício "Sistema Antigo"
- Todos os professores eram ignorados
- `class_teachers.teacher_id` apontava para user fictício

### ✅ **Versão 2 (Correta):**
- **Usa professores reais** do sistema antigo
- **Migra professor "TUTOR"** que faltava
- **Cria usuários (users)** para todos os professores
- **Vincula corretamente:**
  - `class_teachers.teacher_id` → `teachers.id`
  - `evaluations.teacher_id` → `users.id`
  - `users.teacher_id` → `teachers.id`
- **Usa profmat + profserie** para determinar professor de cada avaliação

---

## ⚠️ PONTOS DE ATENÇÃO

### 1. Professor "Tony"
- Aparece em `professor` (id=6 e 9)
- Pode ser aluno que foi cadastrado incorretamente
- **Ação:** Verificar se existe em `students` antes de migrar

### 2. Avaliações sem Professor em class_teachers
- Nem todas as combinações (turma+disciplina) podem ter professor em `profmat/profserie`
- **Fallback:** Usar professor "TUTOR" como padrão

### 3. Disciplinas sem Match
- ~5-10% podem não ter correspondência em `disciplines`
- **Ação:** Revisão manual de `migration_discipline_mapping`

---

## 🚀 ORDEM DE EXECUÇÃO REVISADA

```bash
# FASE 1: Professores
node scripts/01_create_professor_mapping.js
node scripts/02_migrate_tutor.js
node scripts/03_verify_tony_is_student.js
node scripts/04_create_users_for_teachers.js

# FASE 2: Turmas
node scripts/05_create_classes_from_sub.js
node scripts/06_map_sub_to_classes.js

# FASE 3: Alunos
node scripts/07_populate_class_students.js

# FASE 4: Professores-Turmas-Disciplinas
node scripts/08_populate_class_teachers.js  # ✅ USA TEACHERS.ID

# FASE 5: Disciplinas
node scripts/09_create_discipline_mapping.js

# FASE 6: Avaliações
node scripts/10_import_boletim_to_temp.js
node scripts/11_create_evaluations.js  # ✅ USA USERS.ID
node scripts/12_create_evaluation_mapping.js

# FASE 7: Notas
node scripts/13_migrate_grades.js

# FASE 8: Validação
node scripts/14_validate_migration.js
node scripts/15_generate_report.js
```

---

## 📊 RESUMO DE TABELAS ENVOLVIDAS

| Tabela | Papel na Migração |
|--------|-------------------|
| `teachers` | Cadastro de professores (nome, CPF, etc.) |
| `users` | Autenticação de professores (role='teacher', teacher_id) |
| `class_teachers` | Professor leciona disciplina em turma (teacher_id → teachers.id) |
| `evaluations` | Avaliação criada por professor (teacher_id → users.id) |
| `grades` | Notas dos alunos nas avaliações |

---

**Documento atualizado por:** Claude Code AI
**Última atualização:** 2025-12-18 (v2)
