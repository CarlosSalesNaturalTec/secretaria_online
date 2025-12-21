# Estratégia de Migração de Dados - Sistema Antigo para Secretaria Online

**Data:** 2025-12-18
**Versão:** 2.0 (REVISADA)
**Status:** Em Análise

---

## 🔄 REVISÃO IMPORTANTE - PROFESSORES E ALUNOS

**⚠️ ATUALIZAÇÃO CRÍTICA:**

O sistema novo possui arquitetura de professores separada em duas tabelas:

1. **`teachers`** - Dados cadastrais (nome, CPF, endereço, etc.)
2. **`users`** - Autenticação (role='teacher', teacher_id FK)

**Relacionamentos confirmados:**
- `class_teachers.teacher_id` → `teachers.id` ✅
- `evaluations.teacher_id` → `users.id` (onde role='teacher') ✅
- `users.teacher_id` → `teachers.id` (vincula user ao cadastro)

**Mapeamento:** `professor.professor_nome` = `teachers.nome` (STRING MATCHING)

**⚠️ REGRAS DE MIGRAÇÃO IMPORTANTES:**

1. **PROFESSORES:**
   - ✅ **APENAS** mapear professores que **JÁ EXISTEM** em `teachers`
   - ❌ **NÃO** criar novos registros em `teachers`
   - ✅ Criar usuários (`users`) usando:
     - `login` = `professor.professor_login` do sistema antigo
     - `password_hash` = `professor.professor_senha` do sistema antigo (hash já existente)

2. **ALUNOS:**
   - ✅ **APENAS** mapear alunos que **JÁ EXISTEM** em `students`
   - ❌ **NÃO** criar novos registros em `students`

**Professores disponíveis para migração:**
- Sistema antigo: 7 professores
- Já existem em `teachers`: 4 professores (PATRICIA, ROSANA, JACKSON, TAINA)
- **TUTOR**: ❌ NÃO será migrado (não existe em teachers)
- **Tony**: ❌ Será ignorado (verificar se é aluno ou se não existe)

**Impacto:**
- Apenas **4 professores** terão usuários criados
- Avaliações sem professor correspondente: precisarão de tratamento especial

---

## 📊 RESUMO EXECUTIVO

Esta estratégia detalha o processo de migração de **2.880 registros de notas** e dados acadêmicos relacionados do sistema antigo para o novo sistema Secretaria Online, sem alterar a estrutura das tabelas existentes.

### Volumes de Dados

**Sistema Antigo:**
- **boletim_novo:** 2.880 registros de notas
- **cliente:** 304 estudantes
- **disciplina:** 314 disciplinas
- **sub:** 85 séries/turmas
- **professor:** 7 professores
- **profmat:** 29 relações professor-disciplina
- **profserie:** 19 relações professor-série
- **categoria:** 3 categorias (turnos)

**Sistema Atual (já importados parcialmente):**
- **students:** ~304 estudantes
- **courses:** dados já migrados
- **disciplines:** ~314 disciplinas
- **enrollments:** alguns registros existentes
- **teachers:** alguns professores já cadastrados

---

## 🔍 ANÁLISE COMPARATIVA DAS ESTRUTURAS

### 1. Mapeamento: Sistema Antigo → Sistema Novo

| Sistema Antigo | Sistema Novo | Observações |
|----------------|--------------|-------------|
| `cliente` | `students` | ✅ Estrutura compatível - dados já importados |
| `sub` (séries) | `classes` (turmas) | ⚠️ Requer criação de turmas baseadas em sub_id |
| `categoria` | Atributo de `classes` ou `courses` | ⚠️ Turno não está explícito na estrutura nova |
| `disciplina` | `disciplines` | ✅ Estrutura compatível |
| `professor` | `users` (role='teacher') + `teachers` (se existir) | ⚠️ Verificar se tabela teachers existe |
| `profmat` | `class_teachers` | ⚠️ Requer mapeamento indireto via classes |
| `profserie` | `class_teachers` | ⚠️ Mesmo que acima |
| `boletim_novo` | `evaluations` + `grades` | ❌ **PROBLEMA CRÍTICO** - Estrutura incompatível |

---

## ⚠️ INCONSISTÊNCIAS E PROBLEMAS IDENTIFICADOS

### 🔴 CRÍTICOS

#### 1. **Estrutura de Notas Incompatível (boletim_novo → evaluations + grades)**

**Problema:**
- Sistema antigo: **Estrutura "wide"** com colunas `teste`, `prova`, `final`, `resultado`
- Sistema novo: **Estrutura "long"** com tabelas separadas `evaluations` e `grades`

**Exemplo do sistema antigo:**
```csv
id  | matricula | disciplina              | teste | prova | final | resultado
11  | 11        | Português Instrumental  | 4     | 0     | 0     | 0
```

**Estrutura esperada no sistema novo:**
```
evaluations:
  id | class_id | teacher_id | discipline_id | name    | date       | type
  1  | 5        | 2          | 42            | Teste   | 2024-01-15 | grade
  2  | 5        | 2          | 42            | Prova   | 2024-02-20 | grade
  3  | 5        | 2          | 42            | Final   | 2024-03-10 | grade

grades:
  id | evaluation_id | student_id | grade
  1  | 1             | 123        | 4.00
  2  | 2             | 123        | 0.00
  3  | 3             | 123        | 0.00
```

**Solução:**
- Para cada registro em `boletim_novo`, criar **3 avaliações** (Teste, Prova, Final)
- Para cada tipo de avaliação, criar um registro em `grades` vinculado ao aluno

---

#### 2. **Campo `disciplina` é String, Não FK**

**Problema:**
- `boletim_novo.disciplina` armazena nome textual: `"Português Instrumental"`
- Sistema novo espera `discipline_id` (FK para `disciplines.id`)
- Problemas de encoding: `"PortuguÃƒÂªs"` em vez de `"Português"`

**Impacto:**
- Necessário **match fuzzy** para correlacionar nomes textuais com IDs
- Risco de não encontrar correspondência para ~10% das disciplinas

**Solução:**
1. Limpar encoding UTF-8 dos nomes
2. Criar tabela de mapeamento manual para casos sem match automático
3. Normalizar nomes (remover acentos, converter para minúsculas)
4. Usar algoritmo de similaridade (Levenshtein) para matches aproximados

---

#### 3. **Falta de Informação de Professor e Turma em `boletim_novo`**

**Problema:**
- `boletim_novo` não tem campos `professor_id` ou `class_id`
- Sistema novo exige `teacher_id` e `class_id` em `evaluations`

**Dados disponíveis em boletim_novo:**
- `matricula` → podemos obter `student_id`
- `disciplina` (texto) → tentaremos obter `discipline_id`
- `semestre` (ex: "1° Psicologia") → informação de série, mas não de turma específica

**Soluções propostas:**

**Opção A - Criar Professor Genérico "Sistema Antigo" (RECOMENDADA)**
```sql
-- Criar usuário professor para migração
INSERT INTO users (name, email, login, password_hash, role)
VALUES ('Professor Sistema Antigo', 'historico@sistema.edu', 'historico', '<hash>', 'teacher');
```
- Todas as avaliações migradas terão `teacher_id` deste professor
- Campo `name` da avaliação identificará origem: "Teste (importado 2024)"

**Opção B - Inferir Professor via profmat/profserie**
- Tentar correlacionar disciplina + série com tabelas `profmat` e `profserie`
- **PROBLEMA:** Relacionamentos insuficientes (apenas 29 profmat, 19 profserie)

---

#### 4. **Ausência de Turmas (classes) no Sistema Antigo**

**Problema:**
- Sistema antigo tem `sub` (séries) mas não turmas por ano
- Sistema novo exige `classes` com `course_id`, `semester`, `year`

**Dados em `sub`:**
```csv
sub_id | sub_title                         | sub_categoria
8      | Bacharelado em Psicologia 8°      | 6
26     | Bacharelado em Psicologia 1°      | 6
```

**Solução:**
1. **Criar turmas retroativas** para cada combinação única de:
   - Curso (extraído de `sub_title`: "Psicologia", "Serviço Social")
   - Semestre (extraído de `sub_title`: "8°", "1°")
   - Ano: **assumir ano de matrícula do aluno** (`cliente.cliente_ano_matricula`)

2. **Associar alunos às turmas criadas**:
   - `cliente.cliente_sub` → mapeia para `sub_id` → cria/busca `class_id`
   - Popular `class_students` com `student_id` e `class_id`

**Exemplo:**
```
sub_id=8 "Bacharelado em Psicologia 8°"
↓
course_id=1 (Psicologia), semester=8, year=2024 (assumido)
↓
Criar: classes(id=X, course_id=1, semester=8, year=2024)
```

---

### 🟡 MÉDIOS

#### 5. **Encoding UTF-8 Inconsistente**

**Problema:**
- Caracteres especiais com problemas: `"PortuguÃƒÂªs"`, `"Bacharelado em Psicologia 8�"`

**Solução:**
- Conversão UTF-8 durante parse dos CSVs
- Substituições manuais conhecidas:
  - `Ãƒ` → acentos
  - `�` → `°` (grau)

---

#### 6. **Dados de `semestre` Redundantes e Não Estruturados**

**Problema:**
- Campo `boletim_novo.semestre` contém strings como: `"1° Psicologia"`, `"8° Psicologia"`
- Informação já presente em `cliente.cliente_sub` → `sub.sub_title`

**Solução:**
- Ignorar campo `semestre` de boletim_novo
- Usar `matricula` → `cliente` → `sub` para determinar série

---

#### 7. **Campo `periodo` Vazio em boletim_novo**

**Problema:**
- Campo `boletim_novo.periodo` está vazio em todos os registros analisados

**Solução:**
- Assumir período acadêmico baseado em `cliente.cliente_ano_matricula`
- Usar data atual como fallback para `evaluations.date`

---

### 🟢 BAIXOS

#### 8. **Notas Zeradas vs Nulas**

**Observação:**
- Muitos registros têm `prova=0`, `final=0`
- Não é possível distinguir entre:
  - Nota zero (aluno fez e tirou zero)
  - Avaliação não realizada (deveria ser NULL)

**Solução:**
- Migrar valores como estão (0.00)
- Documentar que zeros podem representar avaliações não realizadas

---

## 🗺️ ESTRATÉGIA DE MIGRAÇÃO

### Fase 1: PREPARAÇÃO (Pré-requisitos)

#### 1.1. Verificar Dados Já Migrados
```sql
-- Verificar students
SELECT COUNT(*) FROM students;
-- Esperado: ~304

-- Verificar disciplines
SELECT COUNT(*) FROM disciplines;
-- Esperado: ~314

-- Verificar courses
SELECT COUNT(*) FROM courses;

-- Verificar se tabela teachers existe
SHOW TABLES LIKE 'teachers';
```

#### 1.2. Verificar Professores Já Migrados

```sql
-- Verificar professores na tabela teachers
SELECT id, nome FROM teachers ORDER BY id;

-- Resultado esperado:
-- id=1: PATRICIA DA SILVA TEIXEIRA  (professor_id=4 do sistema antigo)
-- id=2: ROSANA SILVA COSTA          (professor_id=5 do sistema antigo)
-- id=3: JACKSON SANTOS SANTANA      (professor_id=7 do sistema antigo)
-- id=4: TAINA DA SILVA MACEDO       (professor_id=8 do sistema antigo)

-- Verificar se professores têm usuários vinculados
SELECT t.id, t.nome, u.id AS user_id, u.role
FROM teachers t
LEFT JOIN users u ON u.teacher_id = t.id;
```

#### 1.3. Criar Tabela de Mapeamento de Disciplinas
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

#### 1.4. Popular Mapeamento de Disciplinas
```javascript
// Script Node.js para popular mapeamento
const oldDisciplines = [
  'Português Instrumental',
  'Introdução à Psicologia',
  // ... todas as disciplinas de boletim_novo
];

const newDisciplines = await db.Discipline.findAll();

for (const oldName of oldDisciplines) {
  const normalized = normalizeString(oldName); // Remove acentos, lowercase

  // Tentar match exato
  let match = newDisciplines.find(d =>
    normalizeString(d.name) === normalized
  );

  // Se não encontrar, tentar match fuzzy
  if (!match) {
    match = newDisciplines.find(d =>
      levenshteinDistance(normalized, normalizeString(d.name)) < 3
    );
  }

  await db.query(`
    INSERT INTO migration_discipline_mapping
    (old_name, old_name_normalized, new_discipline_id, match_type)
    VALUES (?, ?, ?, ?)
  `, [oldName, normalized, match?.id, match ? 'fuzzy' : 'not_found']);
}
```

---

### Fase 2: CRIAÇÃO DE TURMAS (classes)

#### 2.1. Analisar Combinações Únicas de Curso+Semestre
```javascript
// Ler CSV sub.csv
const subs = parseCsv('database/sub.csv');

// Para cada sub, extrair curso e semestre
const classesToCreate = [];

for (const sub of subs) {
  // Extrair info de "Bacharelado em Psicologia 8°"
  const match = sub.sub_title.match(/(.+?)\s+(\d+)/);
  const courseName = match[1].trim(); // "Bacharelado em Psicologia"
  const semester = parseInt(match[2]); // 8

  // Buscar course_id correspondente
  const course = await db.Course.findOne({
    where: { name: { [Op.like]: `%${courseName}%` } }
  });

  if (!course) {
    console.warn(`Curso não encontrado: ${courseName}`);
    continue;
  }

  // Determinar ano (assumir 2024 ou usar ano_matricula mais comum)
  const year = 2024; // Pode ser refinado consultando cliente.csv

  classesToCreate.push({
    sub_id: sub.sub_id, // Para mapeamento posterior
    course_id: course.id,
    semester: semester,
    year: year,
  });
}
```

#### 2.2. Criar Classes
```sql
-- Criar classes a partir do mapeamento
INSERT INTO classes (course_id, semester, year, created_at, updated_at)
VALUES
  (1, 1, 2024, NOW(), NOW()),
  (1, 2, 2024, NOW(), NOW()),
  (1, 8, 2024, NOW(), NOW()),
  -- ... todas as combinações únicas
;
```

#### 2.3. Criar Tabela de Mapeamento sub_id → class_id
```sql
CREATE TABLE migration_sub_class_mapping (
  sub_id INT PRIMARY KEY,
  class_id INT NOT NULL,
  course_name VARCHAR(200),
  semester INT,
  year INT,
  FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Popular mapeamento
INSERT INTO migration_sub_class_mapping (sub_id, class_id, course_name, semester, year)
VALUES
  (8, 1, 'Bacharelado em Psicologia', 8, 2024),
  (26, 2, 'Bacharelado em Psicologia', 1, 2024),
  -- ... todas as séries
;
```

---

### Fase 3: ASSOCIAÇÃO DE ALUNOS A TURMAS (class_students)

#### 3.1. Obter Mapeamento de Matrículas
```sql
-- Criar tabela temporária para mapear matricula → student_id
CREATE TEMPORARY TABLE migration_matricula_student (
  matricula INT PRIMARY KEY,
  student_id INT NOT NULL,
  sub_id INT,
  class_id INT,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Popular a partir de students (assumindo que matricula foi importada)
INSERT INTO migration_matricula_student (matricula, student_id, sub_id)
SELECT
  matricula,
  id,
  sub_categoria  -- ou campo que armazena sub_id
FROM students
WHERE matricula IS NOT NULL;

-- Associar com class_id via mapeamento
UPDATE migration_matricula_student mms
JOIN migration_sub_class_mapping mscm ON mms.sub_id = mscm.sub_id
SET mms.class_id = mscm.class_id;
```

#### 3.2. Popular class_students
```sql
-- Inserir alunos nas turmas
INSERT INTO class_students (class_id, student_id, created_at, updated_at)
SELECT DISTINCT
  class_id,
  student_id,
  NOW(),
  NOW()
FROM migration_matricula_student
WHERE class_id IS NOT NULL
ON DUPLICATE KEY UPDATE updated_at = NOW();
-- Obs: ON DUPLICATE KEY previne duplicatas caso haja reexecução
```

---

### Fase 4: MIGRAÇÃO E MAPEAMENTO DE PROFESSORES

**⚠️ ATUALIZAÇÃO IMPORTANTE:** O sistema novo possui tabela `teachers` separada de `users`.

#### 4.1. Arquitetura de Professores

**Tabelas envolvidas:**
1. `teachers` - Dados cadastrais (nome, CPF, endereço, etc.)
2. `users` - Autenticação (role='teacher', teacher_id FK)

**Relacionamentos:**
- `class_teachers.teacher_id` → `teachers.id` ✅
- `evaluations.teacher_id` → `users.id` (onde role='teacher') ✅
- `users.teacher_id` → `teachers.id` (vincula user ao cadastro)

**Mapeamento:** `professor.professor_nome` = `teachers.nome` (STRING MATCHING)

#### 4.2. Criar Tabela de Mapeamento de Professores

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

#### 4.3. Mapear APENAS Professores Já Existentes

**⚠️ IMPORTANTE:** Apenas professores que **JÁ EXISTEM** em `teachers` serão mapeados.

```javascript
// Buscar professores do sistema antigo
const professoresAntigos = parseCsv('database/professor.csv');
// Resultado:
// professor_id=3, nome='TUTOR', login='tutor', senha='1f6f42334e1709a4e0f9922ad789912b'
// professor_id=4, nome='PATRICIA DA SILVA TEIXEIRA', login='20240013', senha='...'
// professor_id=5, nome='ROSANA SILVA COSTA', login='20240002', senha='...'
// professor_id=6, nome='Tony', login='1', senha='...'
// professor_id=7, nome='JACKSON SANTOS SANTANA', login='20240017', senha='...'
// professor_id=8, nome='TAINA DA SILVA MACEDO', login='20240023', senha='...'

// Buscar professores que já existem no sistema novo
const teachersNovos = await db.query('SELECT id, nome FROM teachers');
// Resultado:
// id=1, nome='PATRICIA DA SILVA TEIXEIRA'
// id=2, nome='ROSANA SILVA COSTA'
// id=3, nome='JACKSON SANTOS SANTANA'
// id=4, nome='TAINA DA SILVA MACEDO'

// Fazer match por nome (normalizado)
const professorMapping = [];

for (const prof of professoresAntigos) {
  const normalizedOld = normalizeString(prof.professor_nome);

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
    console.warn(`⚠️ Professor não existe em teachers: ${prof.professor_nome} (id=${prof.professor_id})`);
  }
}

// Inserir mapeamento
for (const map of professorMapping) {
  await db.query(`
    INSERT INTO migration_professor_mapping
    (old_professor_id, old_nome, old_login, old_senha, new_teacher_id, match_type)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [map.old_id, map.old_nome, map.old_login, map.old_senha, map.new_teacher_id, map.match_type]);
}

console.log(`✅ ${professorMapping.length} professores mapeados de ${professoresAntigos.length} do sistema antigo`);
// Esperado: ✅ 4 professores mapeados de 7 do sistema antigo
```

**Resultado esperado:**
- ✅ 4 professores mapeados: PATRICIA, ROSANA, JACKSON, TAINA
- ⚠️ 3 professores ignorados: TUTOR, Tony, Tony(duplicado)

#### 4.4. Criar Usuários (users) para Professores

**⚠️ IMPORTANTE:**
- `evaluations.teacher_id` referencia `users.id`, não `teachers.id`
- **Login e senha vêm do sistema antigo:**
  - `users.login` = `professor.professor_login`
  - `users.password_hash` = `professor.professor_senha` (hash já existe)

```sql
-- Verificar quais professores mapeados já têm usuários
SELECT
  mpm.old_professor_id,
  mpm.old_nome,
  mpm.new_teacher_id,
  t.nome,
  u.id AS user_id,
  u.login
FROM migration_professor_mapping mpm
JOIN teachers t ON mpm.new_teacher_id = t.id
LEFT JOIN users u ON u.teacher_id = t.id;
```

```javascript
// Criar usuários usando login e senha do sistema antigo
const professoresSemUser = await db.query(`
  SELECT
    mpm.old_professor_id,
    mpm.old_login,
    mpm.old_senha,
    mpm.new_teacher_id,
    t.nome
  FROM migration_professor_mapping mpm
  JOIN teachers t ON mpm.new_teacher_id = t.id
  LEFT JOIN users u ON u.teacher_id = t.id
  WHERE u.id IS NULL
`);

for (const prof of professoresSemUser) {
  await db.query(`
    INSERT INTO users (name, email, login, password_hash, role, teacher_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'teacher', ?, NOW(), NOW())
  `, [
    prof.nome,
    `${prof.old_login}@sistema.edu.br`,  // Email baseado no login
    prof.old_login,                       // ✅ Login do sistema antigo
    prof.old_senha,                       // ✅ Hash de senha do sistema antigo
    prof.new_teacher_id
  ]);

  console.log(`✅ Usuário criado: login=${prof.old_login}, teacher_id=${prof.new_teacher_id}`);
}

// Atualizar mapeamento com user_ids
await db.query(`
  UPDATE migration_professor_mapping mpm
  JOIN teachers t ON mpm.new_teacher_id = t.id
  JOIN users u ON u.teacher_id = t.id
  SET mpm.new_user_id = u.id
`);

console.log(`✅ Usuários criados para professores`);
```

**Resultado esperado:**
```
✅ Usuário criado: login=20240013, teacher_id=1 (PATRICIA)
✅ Usuário criado: login=20240002, teacher_id=2 (ROSANA)
✅ Usuário criado: login=20240017, teacher_id=3 (JACKSON)
✅ Usuário criado: login=20240023, teacher_id=4 (TAINA)
```

**Verificação:**
```sql
SELECT
  u.id,
  u.login,
  u.role,
  t.nome AS teacher_nome
FROM users u
JOIN teachers t ON u.teacher_id = t.id
WHERE u.role = 'teacher';
```

#### 4.5. Popular class_teachers com Professores Mapeados

**⚠️ IMPORTANTE:** Apenas professores que foram mapeados terão relações criadas.

**Usar profmat + profserie para determinar relações:**

```sql
-- Popular class_teachers usando profmat e profserie
-- Apenas para professores que EXISTEM no mapeamento
INSERT INTO class_teachers (class_id, teacher_id, discipline_id, created_at, updated_at)
SELECT DISTINCT
  mscm.class_id,
  mpm.new_teacher_id,  -- ✅ Usa teachers.id (somente mapeados)
  pm.profmat_mat AS discipline_id,
  NOW(),
  NOW()
FROM profserie_temp ps  -- CSV importado de profserie
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
⚠️ Relações do professor TUTOR (id=3) serão IGNORADAS (12 séries × N disciplinas)
⚠️ Relações de Tony (id=6) serão IGNORADAS
```

**Verificação:**
```sql
-- Contar relações criadas
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

### Fase 5: MIGRAÇÃO DE NOTAS (evaluations + grades)

#### 5.1. Importar boletim_novo para Tabela Temporária
```sql
CREATE TEMPORARY TABLE boletim_novo_temp (
  id INT,
  matricula INT,
  disciplina VARCHAR(200),
  periodo VARCHAR(15),
  teste FLOAT,
  prova FLOAT,
  final VARCHAR(16),  -- VARCHAR porque pode ter valores não numéricos
  resultado FLOAT,
  status VARCHAR(35),
  semestre VARCHAR(70),
  dia_hora VARCHAR(50)
);

-- Importar CSV (via script ou LOAD DATA INFILE)
LOAD DATA LOCAL INFILE 'database/boletim_novo.csv'
INTO TABLE boletim_novo_temp
FIELDS TERMINATED BY ';'
OPTIONALLY ENCLOSED BY '"'
IGNORE 1 ROWS;
```

#### 5.2. Criar Avaliações (evaluations)

**⚠️ IMPORTANTE:** `evaluations.teacher_id` referencia `users.id`, não `teachers.id`

**Estratégia:**
- Para cada combinação única de `(class_id, discipline_id)`, criar **3 avaliações**:
  1. Teste
  2. Prova
  3. Final (ou "Prova Final")
- Determinar professor correto via `class_teachers` → `teachers` → `users`

```sql
-- Criar avaliações "Teste" com professor correto
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
-- ✅ Buscar professor via class_teachers
JOIN class_teachers ct ON ct.class_id = mscm.class_id AND ct.discipline_id = mdm.new_discipline_id
JOIN teachers t ON ct.teacher_id = t.id
JOIN users u ON u.teacher_id = t.id  -- ✅ Vincula teachers → users
WHERE mdm.new_discipline_id IS NOT NULL
  AND mscm.class_id IS NOT NULL
  AND u.role = 'teacher';

-- Repetir para "Prova"
INSERT INTO evaluations (class_id, teacher_id, discipline_id, name, date, type, created_at, updated_at)
SELECT DISTINCT
  mscm.class_id,
  u.id AS teacher_id,  -- ✅ Usa users.id
  mdm.new_discipline_id,
  'Prova (histórico)',
  '2024-02-15',
  'grade',
  NOW(),
  NOW()
FROM boletim_novo_temp bn
JOIN migration_matricula_student mms ON bn.matricula = mms.matricula
JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
JOIN class_teachers ct ON ct.class_id = mscm.class_id AND ct.discipline_id = mdm.new_discipline_id
JOIN teachers t ON ct.teacher_id = t.id
JOIN users u ON u.teacher_id = t.id
WHERE mdm.new_discipline_id IS NOT NULL
  AND mscm.class_id IS NOT NULL
  AND u.role = 'teacher';

-- Repetir para "Final"
INSERT INTO evaluations (class_id, teacher_id, discipline_id, name, date, type, created_at, updated_at)
SELECT DISTINCT
  mscm.class_id,
  u.id AS teacher_id,  -- ✅ Usa users.id
  mdm.new_discipline_id,
  'Prova Final (histórico)',
  '2024-03-15',
  'grade',
  NOW(),
  NOW()
FROM boletim_novo_temp bn
JOIN migration_matricula_student mms ON bn.matricula = mms.matricula
JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
JOIN class_teachers ct ON ct.class_id = mscm.class_id AND ct.discipline_id = mdm.new_discipline_id
JOIN teachers t ON ct.teacher_id = t.id
JOIN users u ON u.teacher_id = t.id
WHERE mdm.new_discipline_id IS NOT NULL
  AND mscm.class_id IS NOT NULL
  AND u.role = 'teacher';
```

**⚠️ Problema: Avaliações sem Professor Mapeado**

Muitas turmas/disciplinas eram lecionadas por "TUTOR" que **não foi migrado**.

**Opção 1 - Criar Usuário Administrativo "Sistema Migração" (RECOMENDADA):**

```sql
-- Criar usuário admin para avaliações históricas sem professor
INSERT INTO users (name, email, login, password_hash, role, created_at, updated_at)
VALUES (
  'Sistema Migração',
  'migracao@sistema.edu.br',
  'migracao',
  '$2a$10$dummy_hash_migracao_historica',
  'admin',  -- ✅ Admin, não teacher (não precisa de teacher_id)
  NOW(),
  NOW()
);

SET @migration_user_id = LAST_INSERT_ID();
```

**Criar avaliações com fallback:**
```sql
-- Criar avaliações "Teste" tentando usar professor real, fallback para migração
INSERT INTO evaluations (class_id, teacher_id, discipline_id, name, date, type, created_at, updated_at)
SELECT DISTINCT
  mscm.class_id,
  COALESCE(u.id, @migration_user_id) AS teacher_id,  -- ✅ Usa professor real ou fallback
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
LEFT JOIN class_teachers ct ON ct.class_id = mscm.class_id AND ct.discipline_id = mdm.new_discipline_id
LEFT JOIN teachers t ON ct.teacher_id = t.id
LEFT JOIN users u ON u.teacher_id = t.id AND u.role = 'teacher'
WHERE mdm.new_discipline_id IS NOT NULL
  AND mscm.class_id IS NOT NULL;

-- Repetir para "Prova" e "Final"
```

**Opção 2 - Ignorar Avaliações sem Professor (NÃO RECOMENDADA):**

```sql
-- Apenas criar avaliações que TÊM professor mapeado
-- Avaliações de TUTOR seriam perdidas
WHERE u.id IS NOT NULL  -- Ignora se não houver professor
```

**Resultado esperado (Opção 1):**
```
✅ Avaliações com professor real: ~30%
⚠️ Avaliações com "Sistema Migração": ~70% (eram do TUTOR)
```

#### 5.3. Criar Tabela de Mapeamento evaluation_id

```sql
CREATE TABLE migration_evaluation_mapping (
  class_id INT,
  discipline_id INT,
  eval_type ENUM('teste', 'prova', 'final'),
  evaluation_id INT,
  PRIMARY KEY (class_id, discipline_id, eval_type),
  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id)
);

-- Popular mapeamento para "Teste"
INSERT INTO migration_evaluation_mapping (class_id, discipline_id, eval_type, evaluation_id)
SELECT
  class_id,
  discipline_id,
  'teste',
  id
FROM evaluations
WHERE name = 'Teste (histórico)';

-- Repetir para "Prova" e "Final"
INSERT INTO migration_evaluation_mapping (class_id, discipline_id, eval_type, evaluation_id)
SELECT class_id, discipline_id, 'prova', id
FROM evaluations
WHERE name = 'Prova (histórico)';

INSERT INTO migration_evaluation_mapping (class_id, discipline_id, eval_type, evaluation_id)
SELECT class_id, discipline_id, 'final', id
FROM evaluations
WHERE name = 'Prova Final (histórico)';
```

#### 5.4. Migrar Notas (grades)

```sql
-- Migrar notas de TESTE
INSERT INTO grades (evaluation_id, student_id, grade, created_at, updated_at)
SELECT
  mem.evaluation_id,
  mms.student_id,
  CASE
    WHEN bn.teste IS NULL THEN NULL
    WHEN bn.teste > 10 THEN 10.00  -- Cap em 10
    ELSE ROUND(bn.teste, 2)
  END AS grade,
  NOW(),
  NOW()
FROM boletim_novo_temp bn
JOIN migration_matricula_student mms ON bn.matricula = mms.matricula
JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
JOIN migration_evaluation_mapping mem
  ON mem.class_id = mscm.class_id
  AND mem.discipline_id = mdm.new_discipline_id
  AND mem.eval_type = 'teste'
WHERE mdm.new_discipline_id IS NOT NULL
  AND mscm.class_id IS NOT NULL;

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
JOIN migration_matricula_student mms ON bn.matricula = mms.matricula
JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
JOIN migration_evaluation_mapping mem
  ON mem.class_id = mscm.class_id
  AND mem.discipline_id = mdm.new_discipline_id
  AND mem.eval_type = 'prova'
WHERE mdm.new_discipline_id IS NOT NULL
  AND mscm.class_id IS NOT NULL;

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
JOIN migration_matricula_student mms ON bn.matricula = mms.matricula
JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
JOIN migration_evaluation_mapping mem
  ON mem.class_id = mscm.class_id
  AND mem.discipline_id = mdm.new_discipline_id
  AND mem.eval_type = 'final'
WHERE mdm.new_discipline_id IS NOT NULL
  AND mscm.class_id IS NOT NULL;
```

---

### Fase 6: VALIDAÇÃO E LIMPEZA

#### 6.1. Validações

```sql
-- 1. Verificar total de notas migradas
SELECT
  'Notas no sistema antigo' AS origem,
  COUNT(*) * 3 AS total  -- 3 avaliações por registro
FROM boletim_novo_temp;

SELECT
  'Notas migradas' AS origem,
  COUNT(*) AS total
FROM grades;

-- 2. Verificar notas órfãs (sem student ou evaluation)
SELECT COUNT(*) FROM grades g
LEFT JOIN students s ON g.student_id = s.id
WHERE s.id IS NULL;

-- 3. Verificar avaliações sem notas
SELECT e.id, e.name, e.class_id, COUNT(g.id) AS num_grades
FROM evaluations e
LEFT JOIN grades g ON e.id = g.evaluation_id
WHERE e.name LIKE '%(histórico)%'
GROUP BY e.id
HAVING num_grades = 0;

-- 4. Verificar disciplinas não mapeadas
SELECT DISTINCT disciplina
FROM boletim_novo_temp bn
LEFT JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
WHERE mdm.new_discipline_id IS NULL;

-- 5. Comparar totais por aluno
SELECT
  bn.matricula,
  COUNT(*) AS notas_antigas
FROM boletim_novo_temp bn
GROUP BY bn.matricula
ORDER BY notas_antigas DESC
LIMIT 10;

SELECT
  s.matricula,
  s.nome,
  COUNT(g.id) AS notas_novas
FROM students s
JOIN grades g ON s.id = g.student_id
GROUP BY s.id
ORDER BY notas_novas DESC
LIMIT 10;
```

#### 6.2. Gerar Relatório de Inconsistências

```sql
-- Criar tabela de log de migração
CREATE TABLE migration_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phase VARCHAR(50),
  status ENUM('success', 'warning', 'error'),
  message TEXT,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir logs
INSERT INTO migration_log (phase, status, message, details)
VALUES
  ('discipline_mapping', 'warning', 'Disciplinas sem match',
   JSON_OBJECT('count', (SELECT COUNT(*) FROM migration_discipline_mapping WHERE match_type = 'not_found'))),

  ('grades_migration', 'success', 'Notas migradas com sucesso',
   JSON_OBJECT('total', (SELECT COUNT(*) FROM grades)));
```

#### 6.3. Limpeza de Tabelas Temporárias

```sql
DROP TEMPORARY TABLE IF EXISTS boletim_novo_temp;
DROP TABLE IF EXISTS migration_matricula_student;

-- Manter tabelas de mapeamento para auditoria:
-- - migration_discipline_mapping
-- - migration_sub_class_mapping
-- - migration_evaluation_mapping
```

---

## 📝 RESUMO DAS INCONSISTÊNCIAS FINAIS

### ❌ Problemas Não Resolvíveis Automaticamente

1. **Disciplinas sem correspondência**
   - Estimativa: 5-10% das disciplinas (encoding, nomes divergentes)
   - **Ação:** Revisar manualmente `migration_discipline_mapping` e adicionar mapeamentos

2. **Notas sem informação de turma precisa**
   - Sistema antigo não tinha conceito de turma por ano
   - **Ação:** Assumimos ano 2024 para todas as turmas criadas

3. **Professores não identificados**
   - Não há informação de qual professor aplicou cada avaliação
   - **Ação:** Usamos professor "Sistema Antigo" para todas as notas históricas

### ✅ Problemas Resolvidos

1. ✅ Estrutura wide → long de avaliações
2. ✅ Encoding UTF-8
3. ✅ Criação de turmas retroativas
4. ✅ Mapeamento de disciplinas (via normalização e fuzzy match)

---

## 🚀 ORDEM DE EXECUÇÃO (REVISADA)

```bash
# 1. Preparação - Professores
node scripts/01_verify_existing_data.js
node scripts/02_create_professor_mapping.js
node scripts/03_migrate_tutor.js
node scripts/04_create_users_for_teachers.js

# 2. Preparação - Disciplinas
node scripts/05_create_discipline_mapping.js

# 3. Criação de Turmas
node scripts/06_create_classes_from_sub.js
node scripts/07_map_sub_to_classes.js

# 4. Associação de Alunos
node scripts/08_populate_class_students.js

# 5. Associação de Professores (✅ USA PROFESSORES REAIS)
node scripts/09_populate_class_teachers.js  # Usa teachers.id

# 6. Migração de Notas
node scripts/10_import_boletim_to_temp.js
node scripts/11_create_evaluations.js  # ✅ Usa users.id com professor correto
node scripts/12_create_evaluation_mapping.js
node scripts/13_migrate_grades.js

# 7. Validação
node scripts/14_validate_migration.js
node scripts/15_generate_report.js
```

---

## 📊 ESTIMATIVA DE IMPACTO

| Entidade | Antes | Depois | Delta |
|----------|-------|--------|-------|
| **students** | 304 | 304 | 0 (já migrados) |
| **classes** | 0-10 | ~85 | +75-85 (baseado em sub) |
| **class_students** | 0-50 | ~304 | +254-304 |
| **class_teachers** | 0-20 | ~150-200 | +130-180 |
| **evaluations** | 0-100 | ~255 | +155-255 (85 turmas × 3) |
| **grades** | 0 | **8.640** | +8.640 (2.880 × 3) |

**Total de novos registros:** ~9.400-9.600

---

## ⏱️ TEMPO ESTIMADO

- **Preparação:** 2-3 horas (scripts + mapeamento manual de disciplinas)
- **Execução:** 30-60 minutos (depende do hardware)
- **Validação:** 1-2 horas (revisão de inconsistências)

**Total:** 4-6 horas de trabalho

---

## 📌 PRÓXIMOS PASSOS

1. ✅ **Revisar esta estratégia** com o time
2. ⏳ **Criar scripts de migração** (Node.js + Sequelize)
3. ⏳ **Testar em ambiente de desenvolvimento**
4. ⏳ **Executar migração em produção**
5. ⏳ **Validar dados migrados**
6. ⏳ **Arquivar dados do sistema antigo**

---

**Documento criado por:** Claude Code AI
**Última atualização:** 2025-12-18
