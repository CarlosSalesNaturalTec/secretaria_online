# Estratégia de Migração de Dados - Sistema Antigo para Secretaria Online (v3)

**Data:** 2025-12-18
**Versão:** 3.0 (REVISADA - APENAS DADOS EXISTENTES)
**Status:** Em Análise

---

## 🔄 REVISÃO v3: REGRAS DE MIGRAÇÃO

### ⚠️ MUDANÇAS CRÍTICAS DA V2 PARA V3:

**REGRA #1: NÃO CRIAR NOVOS CADASTROS**
- ❌ **NÃO** criar novos registros em `teachers`
- ❌ **NÃO** criar novos registros em `students`
- ✅ **APENAS** mapear registros que **JÁ EXISTEM**

**REGRA #2: USAR CREDENCIAIS DO SISTEMA ANTIGO**
- ✅ `users.login` = `professor.professor_login` (ex: "20240013")
- ✅ `users.password_hash` = `professor.professor_senha` (hash já existente)

**REGRA #3: TRATAMENTO DE DADOS ÓRFÃOS**
- Notas de professores não migrados → Usuário admin "Sistema Migração"
- Notas de alunos não migrados → Serão **ignoradas**

---

## 📊 IMPACTO DAS MUDANÇAS

### Professores:
| Sistema Antigo | Já existe em `teachers`? | Será Migrado? |
|----------------|--------------------------|---------------|
| PATRICIA (id=4) | ✅ Sim (id=1) | ✅ Mapear + criar user |
| ROSANA (id=5) | ✅ Sim (id=2) | ✅ Mapear + criar user |
| JACKSON (id=7) | ✅ Sim (id=3) | ✅ Mapear + criar user |
| TAINA (id=8) | ✅ Sim (id=4) | ✅ Mapear + criar user |
| **TUTOR (id=3)** | ❌ Não | ❌ **Ignorar** |
| Tony (id=6) | ❌ Não | ❌ **Ignorar** |
| Tony dup (id=9) | ❌ Não | ❌ **Ignorar** |

**Resultado:**
- ✅ **4 professores** serão mapeados
- ❌ **3 professores** serão ignorados
- ⚠️ **~70% das notas** eram de TUTOR → irão para "Sistema Migração"

### Alunos:
- ✅ **304 alunos** já existem em `students` → serão mapeados
- ❌ Alunos que não existem em `students` → notas serão **ignoradas**

---

## 🏗️ ARQUITETURA (sem mudanças da v2)

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
| `professor` | `professor_login` | `users` | `login` ✅ |
| `professor` | `professor_senha` | `users` | `password_hash` ✅ |

**Relação:** `professor.professor_nome` = `teachers.nome` (STRING MATCHING)

---

## 🗺️ ESTRATÉGIA DE MIGRAÇÃO v3

### **FASE 1: PREPARAÇÃO - PROFESSORES**

#### 1.1. Criar Tabela de Mapeamento Professor

```sql
CREATE TABLE migration_professor_mapping (
  old_professor_id INT PRIMARY KEY,
  old_nome VARCHAR(200),
  old_login VARCHAR(30),
  old_senha VARCHAR(200),
  new_teacher_id INT UNSIGNED,
  new_user_id INT UNSIGNED,
  match_type ENUM('exact', 'fuzzy', 'not_found') DEFAULT 'not_found',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (new_teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (new_user_id) REFERENCES users(id)
);
```

#### 1.2. Mapear APENAS Professores Já Existentes

**⚠️ IMPORTANTE:** Apenas professores que **JÁ EXISTEM** em `teachers` serão mapeados.

```javascript
const fs = require('fs');
const csv = require('csv-parser');

// Função para normalizar string (remover acentos, lowercase)
function normalizeString(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Ler professores do sistema antigo
const professoresAntigos = [];
fs.createReadStream('database/professor.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    professoresAntigos.push({
      professor_id: row.professor_id,
      professor_nome: row.professor_nome,
      professor_login: row.professor_login,
      professor_senha: row.professor_senha,
    });
  });

// Buscar professores que já existem no sistema novo
const teachersNovos = await db.query('SELECT id, nome FROM teachers WHERE deleted_at IS NULL');

// Fazer match por nome normalizado
const professorMapping = [];

for (const prof of professoresAntigos) {
  const normalizedOld = normalizeString(prof.professor_nome);

  // Tentar match exato
  const match = teachersNovos.find(t =>
    normalizeString(t.nome) === normalizedOld
  );

  if (match) {
    professorMapping.push({
      old_id: prof.professor_id,
      old_nome: prof.professor_nome,
      old_login: prof.professor_login,
      old_senha: prof.professor_senha,
      new_teacher_id: match.id,
      match_type: 'exact'
    });

    console.log(`✅ Mapeado: ${prof.professor_nome} (old_id=${prof.professor_id}) → teacher_id=${match.id}`);
  } else {
    console.warn(`⚠️ Professor NÃO existe em teachers (será ignorado): ${prof.professor_nome} (old_id=${prof.professor_id})`);
  }
}

// Inserir mapeamento no banco
for (const map of professorMapping) {
  await db.query(`
    INSERT INTO migration_professor_mapping
    (old_professor_id, old_nome, old_login, old_senha, new_teacher_id, match_type)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [map.old_id, map.old_nome, map.old_login, map.old_senha, map.new_teacher_id, map.match_type]);
}

console.log(`\n✅ ${professorMapping.length} professores mapeados de ${professoresAntigos.length} do sistema antigo`);
// Esperado: ✅ 4 professores mapeados de 7 do sistema antigo

console.log(`⚠️ ${professoresAntigos.length - professorMapping.length} professores ignorados (não existem em teachers)`);
// Esperado: ⚠️ 3 professores ignorados (TUTOR, Tony, Tony dup)
```

**Resultado esperado:**
```
✅ Mapeado: PATRICIA DA SILVA TEIXEIRA (old_id=4) → teacher_id=1
✅ Mapeado: ROSANA SILVA COSTA (old_id=5) → teacher_id=2
✅ Mapeado: JACKSON SANTOS SANTANA (old_id=7) → teacher_id=3
✅ Mapeado: TAINA DA SILVA MACEDO (old_id=8) → teacher_id=4

⚠️ Professor NÃO existe em teachers (será ignorado): TUTOR (old_id=3)
⚠️ Professor NÃO existe em teachers (será ignorado): Tony (old_id=6)
⚠️ Professor NÃO existe em teachers (será ignorado): Tony (old_id=9)

✅ 4 professores mapeados de 7 do sistema antigo
⚠️ 3 professores ignorados (não existem em teachers)
```

#### 1.3. Criar Usuários (users) com Credenciais do Sistema Antigo

**⚠️ IMPORTANTE:**
- `users.login` = `professor.professor_login` do sistema antigo ✅
- `users.password_hash` = `professor.professor_senha` do sistema antigo ✅

```javascript
// Buscar professores mapeados que NÃO têm usuário
const professoresSemUser = await db.query(`
  SELECT
    mpm.old_professor_id,
    mpm.old_nome,
    mpm.old_login,
    mpm.old_senha,
    mpm.new_teacher_id,
    t.nome
  FROM migration_professor_mapping mpm
  JOIN teachers t ON mpm.new_teacher_id = t.id
  LEFT JOIN users u ON u.teacher_id = t.id
  WHERE u.id IS NULL
`);

console.log(`\n📝 Criando usuários para ${professoresSemUser.length} professores...`);

for (const prof of professoresSemUser) {
  const userId = await db.query(`
    INSERT INTO users (name, email, login, password_hash, role, teacher_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'teacher', ?, NOW(), NOW())
  `, [
    prof.nome,
    `${prof.old_login}@sistema.edu.br`,  // Email baseado no login
    prof.old_login,                       // ✅ Login do sistema antigo
    prof.old_senha,                       // ✅ Hash de senha do sistema antigo
    prof.new_teacher_id
  ]);

  console.log(`✅ Usuário criado: login="${prof.old_login}", teacher_id=${prof.new_teacher_id} (${prof.nome})`);
}

// Atualizar mapeamento com user_ids
await db.query(`
  UPDATE migration_professor_mapping mpm
  JOIN teachers t ON mpm.new_teacher_id = t.id
  JOIN users u ON u.teacher_id = t.id
  SET mpm.new_user_id = u.id
`);

console.log(`\n✅ Mapeamento atualizado com user_ids`);
```

**Resultado esperado:**
```
📝 Criando usuários para 4 professores...
✅ Usuário criado: login="20240013", teacher_id=1 (PATRICIA DA SILVA TEIXEIRA)
✅ Usuário criado: login="20240002", teacher_id=2 (ROSANA SILVA COSTA)
✅ Usuário criado: login="20240017", teacher_id=3 (JACKSON SANTOS SANTANA)
✅ Usuário criado: login="20240023", teacher_id=4 (TAINA DA SILVA MACEDO)

✅ Mapeamento atualizado com user_ids
```

**Verificação:**
```sql
SELECT
  u.id AS user_id,
  u.login,
  u.role,
  t.id AS teacher_id,
  t.nome AS teacher_nome
FROM users u
JOIN teachers t ON u.teacher_id = t.id
WHERE u.role = 'teacher'
ORDER BY u.id;
```

#### 1.4. Criar Usuário Admin "Sistema Migração" (Fallback)

**Propósito:** Avaliações de professores não mapeados (TUTOR, Tony) serão atribuídas a este usuário.

```sql
-- Criar usuário administrativo para dados históricos órfãos
INSERT INTO users (name, email, login, password_hash, role, created_at, updated_at)
VALUES (
  'Sistema Migração',
  'migracao@sistema.edu.br',
  'migracao',
  '$2a$10$dummy_hash_migracao_historica_v3',
  'admin',  -- ✅ Admin, não teacher (não precisa de teacher_id)
  NOW(),
  NOW()
);

SET @migration_user_id = LAST_INSERT_ID();

SELECT @migration_user_id AS migration_user_id;
-- Armazenar este ID para uso posterior
```

---

### **FASE 2: PREPARAÇÃO - ALUNOS**

#### 2.1. Mapear APENAS Alunos Já Existentes

**⚠️ IMPORTANTE:** Apenas alunos que **JÁ EXISTEM** em `students` serão mapeados.

```sql
-- Criar tabela temporária para mapeamento de alunos
CREATE TEMPORARY TABLE migration_matricula_student (
  old_matricula INT PRIMARY KEY,
  student_id INT UNSIGNED NOT NULL,
  sub_id INT,
  class_id INT,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Popular APENAS com alunos que JÁ EXISTEM em students
INSERT INTO migration_matricula_student (old_matricula, student_id, sub_id)
SELECT
  s.matricula AS old_matricula,
  s.id AS student_id,
  s.sub_categoria AS sub_id  -- Campo que armazena sub_id do sistema antigo
FROM students s
WHERE s.matricula IS NOT NULL
  AND s.deleted_at IS NULL;  -- Apenas alunos ativos

-- Verificar quantos alunos foram mapeados
SELECT COUNT(*) AS alunos_mapeados FROM migration_matricula_student;
-- Esperado: ~304 alunos
```

**Verificar alunos do sistema antigo que NÃO foram mapeados:**

```javascript
// Ler alunos do sistema antigo
const alunosAntigos = [];
fs.createReadStream('database/cliente.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    alunosAntigos.push({
      matricula: row.cliente_matricula,
      nome: row.cliente_nome,
    });
  });

// Buscar em migration_matricula_student
const alunosNaoMapeados = [];

for (const aluno of alunosAntigos) {
  const exists = await db.query(`
    SELECT 1 FROM migration_matricula_student WHERE old_matricula = ?
  `, [aluno.matricula]);

  if (exists.length === 0) {
    alunosNaoMapeados.push(aluno);
    console.warn(`⚠️ Aluno NÃO existe em students (notas serão ignoradas): ${aluno.nome} (matricula=${aluno.matricula})`);
  }
}

console.log(`\n⚠️ ${alunosNaoMapeados.length} alunos do sistema antigo NÃO têm cadastro em students`);
console.log(`⚠️ Notas desses alunos serão IGNORADAS na migração`);
```

#### 2.2. Associar Alunos a Classes

```sql
-- Associar com class_id via mapeamento sub → class
UPDATE migration_matricula_student mms
JOIN migration_sub_class_mapping mscm ON mms.sub_id = mscm.sub_id
SET mms.class_id = mscm.class_id;

-- Verificar alunos sem class_id (sub_id não encontrado em mapeamento)
SELECT COUNT(*) AS alunos_sem_classe
FROM migration_matricula_student
WHERE class_id IS NULL;

-- Listar alunos sem classe
SELECT
  mms.old_matricula,
  s.nome,
  mms.sub_id
FROM migration_matricula_student mms
JOIN students s ON mms.student_id = s.id
WHERE mms.class_id IS NULL;
```

---

### **FASE 3: CRIAÇÃO DE TURMAS (classes)**

*(Mantém-se igual à v2)*

#### 3.1. Criar Turmas a partir de `sub`

```javascript
// Ler sub.csv e extrair curso + semestre
const subs = [];
fs.createReadStream('database/sub.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    // Extrair de "Bacharelado em Psicologia 8°"
    const match = row.sub_title.match(/(.+?)\s+(\d+)/);
    if (match) {
      subs.push({
        sub_id: row.sub_id,
        sub_title: row.sub_title,
        course_name: match[1].trim(),
        semester: parseInt(match[2]),
        sub_categoria: row.sub_categoria,
      });
    }
  });

// Para cada sub, buscar course_id correspondente
for (const sub of subs) {
  const course = await db.query(`
    SELECT id FROM courses
    WHERE name LIKE ?
    LIMIT 1
  `, [`%${sub.course_name}%`]);

  if (course.length === 0) {
    console.error(`❌ Curso não encontrado: ${sub.course_name} (sub_id=${sub.sub_id})`);
    continue;
  }

  // Determinar ano (assumir 2024 ou usar ano mais comum dos alunos)
  const year = 2024;

  // Verificar se classe já existe
  const existingClass = await db.query(`
    SELECT id FROM classes
    WHERE course_id = ? AND semester = ? AND year = ? AND deleted_at IS NULL
  `, [course[0].id, sub.semester, year]);

  let classId;

  if (existingClass.length > 0) {
    classId = existingClass[0].id;
    console.log(`⚠️ Classe já existe: ${sub.sub_title} → class_id=${classId}`);
  } else {
    // Criar classe
    const result = await db.query(`
      INSERT INTO classes (course_id, semester, year, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `, [course[0].id, sub.semester, year]);

    classId = result.insertId;
    console.log(`✅ Classe criada: ${sub.sub_title} → class_id=${classId}`);
  }

  // Inserir mapeamento
  await db.query(`
    INSERT INTO migration_sub_class_mapping (sub_id, class_id, course_name, semester, year)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE class_id = ?
  `, [sub.sub_id, classId, sub.course_name, sub.semester, year, classId]);
}
```

#### 3.2. Criar Tabela de Mapeamento

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

### **FASE 4: ASSOCIAÇÃO ALUNOS-TURMAS (class_students)**

```sql
-- Inserir alunos nas turmas (apenas alunos mapeados)
INSERT INTO class_students (class_id, student_id, created_at, updated_at)
SELECT DISTINCT
  mms.class_id,
  mms.student_id,
  NOW(),
  NOW()
FROM migration_matricula_student mms
WHERE mms.class_id IS NOT NULL
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Verificar quantos foram inseridos
SELECT COUNT(*) AS alunos_em_turmas FROM class_students;
```

---

### **FASE 5: ASSOCIAÇÃO PROFESSORES-TURMAS-DISCIPLINAS (class_teachers)**

**⚠️ IMPORTANTE:** Apenas professores mapeados terão relações criadas.

#### 5.1. Importar profmat e profserie para tabelas temporárias

```sql
-- Tabela temporária para profmat
CREATE TEMPORARY TABLE profmat_temp (
  profmat_id INT,
  profmat_mat INT,
  profmat_prof INT
);

-- Tabela temporária para profserie
CREATE TEMPORARY TABLE profserie_temp (
  profserie_id INT,
  profserie_prof INT,
  profserie_sub INT
);

-- Importar CSVs (via script Node.js ou LOAD DATA INFILE)
```

#### 5.2. Popular class_teachers

```sql
-- Inserir relações professor-turma-disciplina
-- Apenas para professores que EXISTEM no mapeamento
INSERT INTO class_teachers (class_id, teacher_id, discipline_id, created_at, updated_at)
SELECT DISTINCT
  mscm.class_id,
  mpm.new_teacher_id,  -- ✅ Usa teachers.id (somente mapeados)
  pm.profmat_mat AS discipline_id,
  NOW(),
  NOW()
FROM profserie_temp ps
JOIN profmat_temp pm ON ps.profserie_prof = pm.profmat_prof
JOIN migration_sub_class_mapping mscm ON ps.profserie_sub = mscm.sub_id
JOIN migration_professor_mapping mpm ON ps.profserie_prof = mpm.old_professor_id
WHERE mpm.new_teacher_id IS NOT NULL  -- ✅ Somente professores mapeados
  AND mscm.class_id IS NOT NULL
ON DUPLICATE KEY UPDATE updated_at = NOW();
```

**Resultado esperado:**
```
✅ Relações criadas para 4 professores mapeados
⚠️ Relações do professor TUTOR (id=3) foram IGNORADAS (~70% dos dados)
⚠️ Relações de Tony (id=6) foram IGNORADAS
```

**Verificação:**
```sql
-- Contar relações criadas por professor
SELECT
  t.nome AS professor,
  COUNT(*) AS num_relacoes
FROM class_teachers ct
JOIN teachers t ON ct.teacher_id = t.id
GROUP BY t.id, t.nome;

-- Verificar turmas SEM professor (devido a TUTOR não migrado)
SELECT
  c.id AS class_id,
  co.name AS course_name,
  c.semester,
  c.year,
  COUNT(DISTINCT ct.teacher_id) AS num_professores
FROM classes c
JOIN courses co ON c.course_id = co.id
LEFT JOIN class_teachers ct ON c.id = ct.class_id
GROUP BY c.id
HAVING num_professores = 0;
```

---

### **FASE 6: MAPEAMENTO DE DISCIPLINAS**

#### 6.1. Criar Tabela de Mapeamento

```sql
CREATE TABLE migration_discipline_mapping (
  id INT AUTO_INCREMENT PRIMARY KEY,
  old_name VARCHAR(200) NOT NULL,
  old_name_normalized VARCHAR(200),
  new_discipline_id INT,
  match_type ENUM('exact', 'fuzzy', 'manual', 'not_found') DEFAULT 'not_found',
  similarity_score DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (new_discipline_id) REFERENCES disciplines(id)
);
```

#### 6.2. Popular Mapeamento (automático + manual)

```javascript
// Extrair nomes únicos de disciplinas de boletim_novo
const disciplinasAntigo = [];
fs.createReadStream('database/boletim_novo.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    if (row.disciplina && !disciplinasAntigo.includes(row.disciplina)) {
      disciplinasAntigo.push(row.disciplina);
    }
  });

// Buscar disciplinas no sistema novo
const disciplinasNovo = await db.query('SELECT id, name FROM disciplines WHERE deleted_at IS NULL');

// Fazer match
for (const oldName of disciplinasAntigo) {
  const normalized = normalizeString(oldName);

  // Tentar match exato
  let match = disciplinasNovo.find(d =>
    normalizeString(d.name) === normalized
  );

  let matchType = 'not_found';

  // Se não encontrar, tentar match fuzzy (similaridade)
  if (!match) {
    // Implementar algoritmo de similaridade (Levenshtein, etc.)
    // ...
  }

  await db.query(`
    INSERT INTO migration_discipline_mapping (old_name, old_name_normalized, new_discipline_id, match_type)
    VALUES (?, ?, ?, ?)
  `, [oldName, normalized, match?.id, matchType]);
}
```

---

### **FASE 7: MIGRAÇÃO DE NOTAS (evaluations + grades)**

#### 7.1. Importar boletim_novo para Tabela Temporária

```sql
CREATE TEMPORARY TABLE boletim_novo_temp (
  id INT,
  matricula INT,
  disciplina VARCHAR(200),
  periodo VARCHAR(15),
  teste FLOAT,
  prova FLOAT,
  final VARCHAR(16),
  resultado FLOAT,
  status VARCHAR(35),
  semestre VARCHAR(70),
  dia_hora VARCHAR(50)
);

-- Importar CSV via script
```

#### 7.2. Criar Avaliações com Professor Correto ou Fallback

**⚠️ IMPORTANTE:** Usar professor real quando possível, senão usar "Sistema Migração"

```sql
-- Criar avaliações "Teste" com professor correto ou fallback
INSERT INTO evaluations (class_id, teacher_id, discipline_id, name, date, type, created_at, updated_at)
SELECT DISTINCT
  mscm.class_id,
  COALESCE(u.id, @migration_user_id) AS teacher_id,  -- ✅ Professor real ou fallback
  mdm.new_discipline_id,
  'Teste (histórico)',
  '2024-01-15',
  'grade',
  NOW(),
  NOW()
FROM boletim_novo_temp bn
JOIN migration_matricula_student mms ON bn.matricula = mms.old_matricula
JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
LEFT JOIN class_teachers ct ON ct.class_id = mscm.class_id AND ct.discipline_id = mdm.new_discipline_id
LEFT JOIN teachers t ON ct.teacher_id = t.id
LEFT JOIN users u ON u.teacher_id = t.id AND u.role = 'teacher'
WHERE mdm.new_discipline_id IS NOT NULL
  AND mscm.class_id IS NOT NULL
  AND mms.student_id IS NOT NULL;  -- ✅ Apenas alunos mapeados

-- Repetir para "Prova" e "Final"
INSERT INTO evaluations (class_id, teacher_id, discipline_id, name, date, type, created_at, updated_at)
SELECT DISTINCT
  mscm.class_id,
  COALESCE(u.id, @migration_user_id) AS teacher_id,
  mdm.new_discipline_id,
  'Prova (histórico)',
  '2024-02-15',
  'grade',
  NOW(),
  NOW()
FROM boletim_novo_temp bn
JOIN migration_matricula_student mms ON bn.matricula = mms.old_matricula
JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
LEFT JOIN class_teachers ct ON ct.class_id = mscm.class_id AND ct.discipline_id = mdm.new_discipline_id
LEFT JOIN teachers t ON ct.teacher_id = t.id
LEFT JOIN users u ON u.teacher_id = t.id AND u.role = 'teacher'
WHERE mdm.new_discipline_id IS NOT NULL
  AND mscm.class_id IS NOT NULL
  AND mms.student_id IS NOT NULL;

INSERT INTO evaluations (class_id, teacher_id, discipline_id, name, date, type, created_at, updated_at)
SELECT DISTINCT
  mscm.class_id,
  COALESCE(u.id, @migration_user_id) AS teacher_id,
  mdm.new_discipline_id,
  'Prova Final (histórico)',
  '2024-03-15',
  'grade',
  NOW(),
  NOW()
FROM boletim_novo_temp bn
JOIN migration_matricula_student mms ON bn.matricula = mms.old_matricula
JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
LEFT JOIN class_teachers ct ON ct.class_id = mscm.class_id AND ct.discipline_id = mdm.new_discipline_id
LEFT JOIN teachers t ON ct.teacher_id = t.id
LEFT JOIN users u ON u.teacher_id = t.id AND u.role = 'teacher'
WHERE mdm.new_discipline_id IS NOT NULL
  AND mscm.class_id IS NOT NULL
  AND mms.student_id IS NOT NULL;
```

**Verificação:**
```sql
-- Contar avaliações por professor
SELECT
  u.name AS professor,
  COUNT(*) AS num_avaliacoes
FROM evaluations e
JOIN users u ON e.teacher_id = u.id
WHERE e.name LIKE '%(histórico)%'
GROUP BY u.id, u.name;

-- Esperado:
-- "Sistema Migração": ~70% (avaliações de TUTOR)
-- Professores reais: ~30%
```

#### 7.3. Criar Tabela de Mapeamento evaluation_id

```sql
CREATE TABLE migration_evaluation_mapping (
  class_id INT,
  discipline_id INT,
  eval_type ENUM('teste', 'prova', 'final'),
  evaluation_id INT,
  PRIMARY KEY (class_id, discipline_id, eval_type),
  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id)
);

-- Popular mapeamento
INSERT INTO migration_evaluation_mapping (class_id, discipline_id, eval_type, evaluation_id)
SELECT class_id, discipline_id, 'teste', id FROM evaluations WHERE name = 'Teste (histórico)';

INSERT INTO migration_evaluation_mapping (class_id, discipline_id, eval_type, evaluation_id)
SELECT class_id, discipline_id, 'prova', id FROM evaluations WHERE name = 'Prova (histórico)';

INSERT INTO migration_evaluation_mapping (class_id, discipline_id, eval_type, evaluation_id)
SELECT class_id, discipline_id, 'final', id FROM evaluations WHERE name = 'Prova Final (histórico)';
```

#### 7.4. Migrar Notas

```sql
-- Migrar notas de TESTE
INSERT INTO grades (evaluation_id, student_id, grade, created_at, updated_at)
SELECT
  mem.evaluation_id,
  mms.student_id,
  CASE
    WHEN bn.teste IS NULL THEN NULL
    WHEN bn.teste > 10 THEN 10.00
    ELSE ROUND(bn.teste, 2)
  END AS grade,
  NOW(),
  NOW()
FROM boletim_novo_temp bn
JOIN migration_matricula_student mms ON bn.matricula = mms.old_matricula
JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
JOIN migration_evaluation_mapping mem
  ON mem.class_id = mscm.class_id
  AND mem.discipline_id = mdm.new_discipline_id
  AND mem.eval_type = 'teste'
WHERE mdm.new_discipline_id IS NOT NULL
  AND mscm.class_id IS NOT NULL
  AND mms.student_id IS NOT NULL;  -- ✅ Apenas alunos mapeados

-- Migrar notas de PROVA
INSERT INTO grades (evaluation_id, student_id, grade, created_at, updated_at)
SELECT
  mem.evaluation_id,
  mms.student_id,
  CASE
    WHEN bn.prova IS NULL THEN NULL
    WHEN bn.prova > 10 THEN 10.00
    ELSE ROUND(bn.prova, 2)
  END,
  NOW(),
  NOW()
FROM boletim_novo_temp bn
JOIN migration_matricula_student mms ON bn.matricula = mms.old_matricula
JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
JOIN migration_evaluation_mapping mem
  ON mem.class_id = mscm.class_id
  AND mem.discipline_id = mdm.new_discipline_id
  AND mem.eval_type = 'prova'
WHERE mdm.new_discipline_id IS NOT NULL
  AND mscm.class_id IS NOT NULL
  AND mms.student_id IS NOT NULL;

-- Migrar notas de FINAL
INSERT INTO grades (evaluation_id, student_id, grade, created_at, updated_at)
SELECT
  mem.evaluation_id,
  mms.student_id,
  CASE
    WHEN bn.final IS NULL OR bn.final = '' THEN NULL
    WHEN CAST(bn.final AS DECIMAL(4,2)) > 10 THEN 10.00
    ELSE ROUND(CAST(bn.final AS DECIMAL(4,2)), 2)
  END,
  NOW(),
  NOW()
FROM boletim_novo_temp bn
JOIN migration_matricula_student mms ON bn.matricula = mms.old_matricula
JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
JOIN migration_evaluation_mapping mem
  ON mem.class_id = mscm.class_id
  AND mem.discipline_id = mdm.new_discipline_id
  AND mem.eval_type = 'final'
WHERE mdm.new_discipline_id IS NOT NULL
  AND mscm.class_id IS NOT NULL
  AND mms.student_id IS NOT NULL;
```

---

### **FASE 8: VALIDAÇÃO E RELATÓRIOS**

#### 8.1. Validações

```sql
-- 1. Total de notas migradas vs esperadas
SELECT
  'Registros em boletim_novo' AS origem,
  COUNT(*) AS total
FROM boletim_novo_temp;

SELECT
  'Notas migradas (×3 por registro)' AS origem,
  COUNT(*) AS total
FROM grades
WHERE evaluation_id IN (
  SELECT id FROM evaluations WHERE name LIKE '%(histórico)%'
);

-- 2. Professores utilizados
SELECT
  u.name AS professor,
  u.role,
  COUNT(DISTINCT e.id) AS num_avaliacoes
FROM evaluations e
JOIN users u ON e.teacher_id = u.id
WHERE e.name LIKE '%(histórico)%'
GROUP BY u.id, u.name, u.role;

-- 3. Alunos com notas migradas
SELECT COUNT(DISTINCT student_id) AS alunos_com_notas
FROM grades
WHERE evaluation_id IN (
  SELECT id FROM evaluations WHERE name LIKE '%(histórico)%'
);

-- 4. Disciplinas sem match
SELECT DISTINCT old_name
FROM migration_discipline_mapping
WHERE new_discipline_id IS NULL;

-- 5. Notas órfãs (se houver)
SELECT COUNT(*)
FROM boletim_novo_temp bn
LEFT JOIN migration_matricula_student mms ON bn.matricula = mms.old_matricula
WHERE mms.student_id IS NULL;
-- Estas notas foram ignoradas (alunos não existem em students)
```

#### 8.2. Gerar Relatório de Migração

```javascript
const report = {
  timestamp: new Date().toISOString(),
  professores: {
    sistema_antigo: 7,
    mapeados: 4,
    ignorados: 3,
    usuarios_criados: 4,
    professores_mapeados: ['PATRICIA', 'ROSANA', 'JACKSON', 'TAINA'],
    professores_ignorados: ['TUTOR', 'Tony', 'Tony (dup)'],
  },
  alunos: {
    sistema_antigo: await countClientesCsv(),
    mapeados: await db.query('SELECT COUNT(*) FROM migration_matricula_student'),
    ignorados: await countAlunosNaoMapeados(),
  },
  turmas: {
    criadas: await db.query('SELECT COUNT(*) FROM classes WHERE created_at > ?', [dataInicio]),
  },
  avaliacoes: {
    total: await db.query('SELECT COUNT(*) FROM evaluations WHERE name LIKE "%histórico%"'),
    com_professor_real: await db.query(`
      SELECT COUNT(*) FROM evaluations e
      JOIN users u ON e.teacher_id = u.id
      WHERE e.name LIKE '%histórico%' AND u.role = 'teacher'
    `),
    com_sistema_migracao: await db.query(`
      SELECT COUNT(*) FROM evaluations e
      JOIN users u ON e.teacher_id = u.id
      WHERE e.name LIKE '%histórico%' AND u.name = 'Sistema Migração'
    `),
  },
  notas: {
    total_migradas: await db.query('SELECT COUNT(*) FROM grades WHERE ...'),
    total_esperadas: await countBoletimNovo() * 3,
  },
  disciplinas: {
    mapeadas: await db.query('SELECT COUNT(*) FROM migration_discipline_mapping WHERE new_discipline_id IS NOT NULL'),
    nao_mapeadas: await db.query('SELECT COUNT(*) FROM migration_discipline_mapping WHERE new_discipline_id IS NULL'),
  },
};

fs.writeFileSync('migration_report_v3.json', JSON.stringify(report, null, 2));
console.log('✅ Relatório salvo em migration_report_v3.json');
```

---

## 📊 ORDEM DE EXECUÇÃO v3

```bash
# 1. Preparação - Professores
node scripts/01_create_professor_mapping.js         # Mapear professores existentes
node scripts/02_create_users_with_old_credentials.js # Criar users com login/senha antigos
node scripts/03_create_migration_admin_user.js       # Criar "Sistema Migração"

# 2. Preparação - Alunos
node scripts/04_map_existing_students.js             # Mapear alunos existentes

# 3. Criação de Turmas
node scripts/05_create_classes_from_sub.js
node scripts/06_map_sub_to_classes.js

# 4. Associações
node scripts/07_populate_class_students.js           # Alunos → Turmas
node scripts/08_populate_class_teachers.js           # Professores → Turmas (apenas mapeados)

# 5. Mapeamento de Disciplinas
node scripts/09_create_discipline_mapping.js

# 6. Migração de Notas
node scripts/10_import_boletim_to_temp.js
node scripts/11_create_evaluations_with_fallback.js  # Com fallback para Sistema Migração
node scripts/12_create_evaluation_mapping.js
node scripts/13_migrate_grades.js                    # Apenas alunos mapeados

# 7. Validação e Relatórios
node scripts/14_validate_migration.js
node scripts/15_generate_report.js
```

---

## ⚠️ DIFERENÇAS DA V2 PARA V3

| Aspecto | v2 | v3 |
|---------|----|----|
| **Professores** | Migra TUTOR para `teachers` | ❌ NÃO migra TUTOR (apenas mapeia existentes) |
| **Login/Senha** | Gera login/senha novos | ✅ Usa `professor_login` e `professor_senha` |
| **Alunos** | Assume todos migrados | ✅ Apenas mapeia existentes |
| **Avaliações órfãs** | Usa TUTOR | ✅ Usa "Sistema Migração" (admin) |
| **Notas órfãs** | Não menciona | ✅ São **ignoradas** (alunos não existem) |

---

## 📝 IMPACTO FINAL v3

### Dados Migrados:
- ✅ **4 professores** (PATRICIA, ROSANA, JACKSON, TAINA)
- ✅ **~304 alunos** (todos que existem em `students`)
- ✅ **~85 turmas** (baseadas em `sub`)
- ✅ **~255 avaliações** (3 tipos × ~85 combinações turma+disciplina)
- ✅ **~8.000-8.640 notas** (depende de alunos mapeados)

### Dados NÃO Migrados:
- ❌ **3 professores** (TUTOR, Tony, Tony dup)
- ❌ Alunos que não existem em `students`
- ⚠️ **~70% das avaliações** atribuídas a "Sistema Migração" (eram de TUTOR)

---

**Documento criado por:** Claude Code AI
**Última atualização:** 2025-12-18 (v3)
