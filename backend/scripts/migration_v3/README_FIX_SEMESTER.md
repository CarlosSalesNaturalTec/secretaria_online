# Correção: Preservação de Informação de Semestre Original

## Problema Identificado

Durante a migração v3, foi identificada uma perda de informação crítica:

- O CSV `boletim_novo.csv` continha o campo `semestre` com informações como:
  - "1° Psicologia"
  - "Bacharelado em Administração de Empresas 8°"
  - "8° Serviço Social"

- Essa informação indicava **qual semestre do curso original** o aluno estava quando realizou a avaliação

- Durante a migração original (scripts 10-13), essa informação **não foi preservada** nas avaliações criadas

- Resultado: 1.383 avaliações históricas sem referência ao semestre acadêmico original

## Solução Implementada

### 1. Migration: Novos Campos na Tabela `evaluations`

**Arquivo:** `20251221150000-add-original-semester-fields-to-evaluations.js`

Adicionou 3 campos à tabela `evaluations`:

```sql
ALTER TABLE evaluations ADD COLUMN original_semester INT
  COMMENT 'Número do semestre extraído do sistema antigo (1-12)';

ALTER TABLE evaluations ADD COLUMN original_course_name VARCHAR(200)
  COMMENT 'Nome do curso do sistema antigo';

ALTER TABLE evaluations ADD COLUMN original_semester_raw VARCHAR(200)
  COMMENT 'Valor bruto do campo "semestre" do CSV (ex: "1° Psicologia")';

-- Índice para facilitar consultas
CREATE INDEX idx_evaluations_original_semester ON evaluations(original_semester);
```

### 2. Script de Correção: População dos Dados

**Arquivo:** `16_fix_original_semester_data.js`

O script:

1. **Lê os dados da tabela temporária** `boletim_novo_temp` (que ainda contém os dados originais do CSV)

2. **Parseia o campo `semestre`** usando expressões regulares que suportam múltiplos formatos:
   - "1° Psicologia" → semestre: 1, curso: "Psicologia"
   - "Bacharelado em Administração 8°" → semestre: 8, curso: "Bacharelado em Administração"
   - "Complementação Pedagógica em Geografia I°" → semestre: 1 (converte romano), curso: "Complementação Pedagógica em Geografia"

3. **Atualiza as avaliações históricas** com:
   - `original_semester`: número do semestre (1-12)
   - `original_course_name`: nome do curso
   - `original_semester_raw`: valor original do CSV para referência

### 3. Atualização do Model Sequelize

**Arquivo:** `src/models/Evaluation.js`

Adicionados:

#### Novos Campos
```javascript
original_semester: {
  type: DataTypes.INTEGER,
  allowNull: true,
  validate: {
    isInt: true,
    min: 1,
    max: 12
  }
},
original_course_name: {
  type: DataTypes.STRING(200),
  allowNull: true
},
original_semester_raw: {
  type: DataTypes.STRING(200),
  allowNull: true
}
```

#### Novos Métodos de Instância
```javascript
isHistorical()              // Verifica se é avaliação histórica migrada
hasOriginalSemester()       // Verifica se possui semestre original
getOriginalSemesterLabel()  // Retorna "1° Psicologia", "8° Administração", etc.
```

#### Novos Métodos Estáticos
```javascript
findByOriginalSemester(semester)    // Busca por semestre original
findByOriginalCourse(courseName)    // Busca por curso original
```

#### Novos Scopes
```javascript
.scope('historical')              // Apenas avaliações históricas
.scope('withOriginalSemester')    // Que têm semestre original
.scope('byOriginalSemester', 1)   // De um semestre específico
.scope('byOriginalCourse', 'Psicologia')  // De um curso específico
```

## Resultados da Correção

### Estatísticas

- **Total de avaliações históricas:** 1.383
- **Com semestre parseado:** 1.374 (99,3%)
- **Com nome do curso:** 1.383 (100%)
- **Com valor bruto preservado:** 1.383 (100%)

### Principais Semestres/Cursos Migrados

| Semestre | Curso | Quantidade de Avaliações |
|----------|-------|--------------------------|
| 1° | Bacharelado em Psicologia | 144 |
| 1° | Licenciatura em Pedagogia | 141 |
| 4° | Licenciatura em Pedagogia | 87 |
| 2° | Licenciatura em Pedagogia | 87 |
| 2° | Bacharelado em Psicologia | 78 |
| 7° | Licenciatura em Pedagogia | 78 |
| 6° | Licenciatura em Pedagogia | 75 |
| 3° | Licenciatura em Pedagogia | 72 |
| 9° | Bacharelado em Psicologia | 72 |
| 8° | Bacharelado em Psicologia | 60 |

## Como Usar

### Executar a Correção em Outro Ambiente

```bash
# 1. Executar a migration
cd backend
npm run db:migrate

# 2. Executar o script de correção
node scripts/migration_v3/16_fix_original_semester_data.js
```

### Consultar Avaliações por Semestre Original

```javascript
// Buscar todas as avaliações do 1° semestre
const avaliacoes = await Evaluation.scope('byOriginalSemester', 1).findAll();

// Buscar avaliações de Psicologia
const psico = await Evaluation.scope('byOriginalCourse', 'Psicologia').findAll();

// Buscar avaliações históricas com semestre original
const historicas = await Evaluation.scope(['historical', 'withOriginalSemester']).findAll();

// Buscar avaliações de um aluno específico com informação de semestre
const grades = await Grade.findAll({
  where: { student_id: 123 },
  include: [{
    model: Evaluation,
    as: 'evaluation',
    attributes: ['id', 'name', 'date', 'original_semester', 'original_course_name']
  }]
});
```

### Exemplo de Uso em Controller

```javascript
// Obter histórico acadêmico de um aluno por semestre
const getStudentHistoryBySemester = async (studentId) => {
  const grades = await Grade.findAll({
    where: { student_id: studentId },
    include: [{
      model: Evaluation,
      as: 'evaluation',
      where: {
        name: { [Op.like]: '%(histórico)%' }
      },
      attributes: ['id', 'name', 'date', 'original_semester', 'original_course_name', 'original_semester_raw'],
      include: [{
        model: Discipline,
        as: 'discipline',
        attributes: ['id', 'name']
      }]
    }],
    order: [
      [{ model: Evaluation, as: 'evaluation' }, 'original_semester', 'ASC'],
      [{ model: Evaluation, as: 'evaluation' }, 'date', 'ASC']
    ]
  });

  // Agrupar por semestre
  const groupedBySemester = grades.reduce((acc, grade) => {
    const semester = grade.evaluation.original_semester || 'Sem semestre';
    if (!acc[semester]) {
      acc[semester] = {
        semester,
        courseName: grade.evaluation.original_course_name,
        grades: []
      };
    }
    acc[semester].grades.push({
      discipline: grade.evaluation.discipline.name,
      evaluationType: grade.evaluation.name,
      grade: grade.grade,
      date: grade.evaluation.date
    });
    return acc;
  }, {});

  return Object.values(groupedBySemester);
};
```

## Observações Importantes

### Casos sem Semestre Parseado (9 avaliações)

Alguns registros do CSV tinham valores no campo `semestre` que não seguiam os padrões esperados (como "1Ã‚Â° Psicologia" com encoding incorreto). Nesses casos:
- `original_semester`: NULL
- `original_course_name`: valor bruto do campo
- `original_semester_raw`: valor bruto preservado

Isso permite identificar e corrigir manualmente esses casos, se necessário.

### Compatibilidade

- ✅ A solução é **retrocompatível**: avaliações novas (não históricas) terão esses campos como NULL
- ✅ Não afeta o funcionamento existente do sistema
- ✅ Apenas adiciona informação extra para avaliações históricas

### Manutenção Futura

Se novos dados históricos forem importados:
1. Certifique-se de que a tabela temporária contém o campo `semestre`
2. Execute o script `16_fix_original_semester_data.js` para popular os novos registros

## Arquivos Modificados/Criados

```
backend/
├── database/
│   └── migrations/
│       └── 20251221150000-add-original-semester-fields-to-evaluations.js
├── scripts/
│   └── migration_v3/
│       ├── 16_fix_original_semester_data.js
│       └── README_FIX_SEMESTER.md (este arquivo)
└── src/
    └── models/
        └── Evaluation.js (atualizado)
```

## Conclusão

A solução implementada:

✅ Recupera a informação perdida de semestre original
✅ Preserva 100% dos dados brutos para referência
✅ Parseia 99,3% dos semestres automaticamente
✅ Adiciona métodos convenientes para consultas
✅ É totalmente retrocompatível
✅ Não requer refazer toda a migração

A relação entre avaliações e semestres agora está completa:
- **Semestre atual:** via `class.semester` (semestre da turma no sistema novo)
- **Semestre original:** via `evaluation.original_semester` (semestre do sistema antigo)

Isso permite rastreabilidade completa do histórico acadêmico dos alunos.
