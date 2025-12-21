# Diagrama de Relacionamentos - Sistema Acadêmico Antigo

## Visão Geral

O sistema antigo possui 8 tabelas principais organizadas em uma estrutura relacional que gerencia:
- Estudantes (cliente)
- Professores
- Disciplinas
- Séries/Turmas (sub)
- Turnos (categoria)
- Notas (boletim_novo)
- Relacionamentos Professor-Disciplina e Professor-Série

## Diagrama ER (Entity-Relationship)

```
┌─────────────────┐
│   categoria     │ (Turnos: Manhã, Noite, Diúrno)
│─────────────────│
│ PK categoria_id │
│    title        │
│    url          │
│    pos          │
└────────┬────────┘
         │
         │ 1:N (sub_categoria)
         │
         ▼
┌─────────────────┐         ┌──────────────────┐
│      sub        │ N:1     │     cliente      │ (Estudantes)
│ (Séries/Turmas) │◄────────│──────────────────│
│─────────────────│         │ PK cliente_id    │
│ PK sub_id       │         │    nome          │
│    title        │         │    cpf           │
│    url          │         │ FK cliente_sub ──┼──┐
│    pos          │         │    matricula     │  │
│ FK sub_categoria│         │    email         │  │
└────────┬────────┘         │    curso         │  │
         │                  │    semestre      │  │
         │                  │    ...           │  │
         │                  └──────────────────┘  │
         │                           │            │
         │                           │            │
         └───────────────────────────┘            │
                                     │            │
         ┌───────────────────────────┘            │
         │                                        │
         │ N:M (profserie)                        │
         │                                        │
         ▼                                        │
┌─────────────────┐                               │
│   profserie     │ (Professor ↔ Série)           │
│─────────────────│                               │
│ PK profserie_id │                               │
│ FK profserie_prof                               │
│ FK profserie_sub │                              │
└────────┬────────┘                               │
         │                                        │
         │ N:1                                    │
         ▼                                        │
┌─────────────────┐                               │
│   professor     │                               │
│─────────────────│                               │
│ PK professor_id │                               │
│    nome         │                               │
│    senha        │                               │
│    login        │                               │
└────────┬────────┘                               │
         │                                        │
         │ N:M (profmat)                          │
         │                                        │
         ▼                                        │
┌─────────────────┐                               │
│    profmat      │ (Professor ↔ Disciplina)      │
│─────────────────│                               │
│ PK profmat_id   │                               │
│ FK profmat_prof │                               │
│ FK profmat_mat ─┼──┐                            │
└─────────────────┘  │                            │
                     │                            │
                     │ N:1                        │
                     ▼                            │
┌─────────────────┐                               │
│   disciplina    │                               │
│─────────────────│                               │
│ PK disciplina_id│                               │
│    nome         │                               │
└────────┬────────┘                               │
         │                                        │
         │ (relacionamento por nome textual)     │
         │ ⚠️ NÃO É FK!                           │
         ▼                                        │
┌─────────────────────────┐                      │
│    boletim_novo         │ (Notas)              │
│─────────────────────────│                      │
│ PK id                   │                      │
│    matricula ───────────┼──────────────────────┘
│    disciplina (STRING!) │ ⚠️
│    periodo              │
│    teste                │
│    prova                │
│    final                │
│    resultado            │
│    status               │
│    semestre             │
└─────────────────────────┘
```

## Relacionamentos Detalhados

### 1. categoria → sub (1:N)
- Uma categoria (turno) pode ter múltiplas séries
- Cada série pertence a uma categoria
- **FK:** `sub.sub_categoria` → `categoria.categoria_id`

### 2. sub → cliente (1:N)
- Uma série pode ter múltiplos estudantes
- Cada estudante está matriculado em uma série
- **FK:** `cliente.cliente_sub` → `sub.sub_id`

### 3. professor → profserie → sub (N:M)
- Um professor pode lecionar em múltiplas séries
- Uma série pode ter múltiplos professores
- **Tabela de Junção:** `profserie`
- **FKs:**
  - `profserie.profserie_prof` → `professor.professor_id`
  - `profserie.profserie_sub` → `sub.sub_id`

### 4. professor → profmat → disciplina (N:M)
- Um professor pode lecionar múltiplas disciplinas
- Uma disciplina pode ser lecionada por múltiplos professores
- **Tabela de Junção:** `profmat`
- **FKs:**
  - `profmat.profmat_prof` → `professor.professor_id`
  - `profmat.profmat_mat` → `disciplina.disciplina_id`

### 5. cliente → boletim_novo (1:N)
- Um estudante pode ter múltiplas notas
- Cada nota pertence a um estudante
- **Relacionamento:** `boletim_novo.matricula` = `cliente.cliente_matricula`
- ⚠️ **Observação:** Não há FK formal no banco

### 6. disciplina ~~→~~ boletim_novo (PROBLEMA!)
- **⚠️ PROBLEMA DE DESIGN:**
- O campo `boletim_novo.disciplina` armazena o **nome textual** da disciplina
- Não há FK para `disciplina.disciplina_id`
- Isso causa:
  - Inconsistências de dados (variações de nome)
  - Problemas de encoding
  - Dificuldade em queries e relatórios
  - Violação de normalização

## Hierarquia de Dados

```
categoria (Turno: Manhã/Noite/Diúrno)
    │
    └─► sub (Série: "Bacharelado em Psicologia 8°")
            │
            ├─► cliente (Estudante)
            │       │
            │       └─► boletim_novo (Notas do estudante)
            │
            └─► profserie ──► professor
                                  │
                                  └─► profmat ──► disciplina
```

## Regras de Negócio Inferidas

1. **Estudante:**
   - Pertence a uma única série (sub) por vez
   - Série define: curso, semestre/período, turno (através de categoria)
   - Possui múltiplas notas em diferentes disciplinas

2. **Professor:**
   - Pode lecionar múltiplas disciplinas
   - Pode atuar em múltiplas séries
   - Relacionamento com disciplinas (o que leciona) é separado do relacionamento com séries (onde leciona)

3. **Série (sub):**
   - Representa uma turma específica de um curso em um semestre
   - Exemplo: "Bacharelado em Psicologia 8°" no turno "Noite"
   - Agrupa estudantes e professores

4. **Categoria:**
   - Define o turno/período das aulas
   - 3 opções: Manhã, Noite, Diúrno
   - Aplicada no nível de série, não de estudante individual

5. **Notas (boletim_novo):**
   - Sistema de avaliação com 3 componentes: teste, prova, final
   - Resultado é calculado a partir desses componentes
   - Armazena informações redundantes (semestre já está em cliente através de sub)

## Inconsistências e Problemas

### ❌ Problemas Identificados

1. **Falta de Integridade Referencial:**
   - `boletim_novo.disciplina` não é FK
   - `boletim_novo.matricula` não é FK

2. **Redundância de Dados:**
   - `boletim_novo.semestre` duplica informação de `sub.sub_title`
   - Informações do curso estão tanto em `cliente` quanto podem ser inferidas de `sub`

3. **Inconsistência de Tipos:**
   - `boletim_novo.final` é VARCHAR mas armazena valores numéricos
   - `cliente.cliente_sexo` é INT quando deveria ser CHAR/ENUM

4. **Falta de Normalização:**
   - Estrutura "wide" de avaliações (teste, prova, final como colunas)
   - Dificulta adicionar novos tipos de avaliação

### ✅ Pontos Fortes

1. **Relacionamentos N:M bem modelados:**
   - `profmat` e `profserie` implementam corretamente relacionamentos muitos-para-muitos

2. **Separação de Responsabilidades:**
   - Dados de estudantes separados de dados de login (cliente vs potencial tabela user)
   - Professores, disciplinas e séries em tabelas separadas

3. **Flexibilidade:**
   - Professor pode lecionar múltiplas disciplinas em múltiplas séries
   - Permite configuração complexa de grade curricular

## Recomendações para o Novo Sistema

1. **Criar FKs adequadas:**
   - `grades.discipline_id` → `disciplines.id`
   - `grades.student_id` → `students.id`

2. **Normalizar avaliações:**
   - Criar tabela `evaluation_types` (teste, prova, final, etc.)
   - Cada nota referencia um tipo de avaliação

3. **Separar entidades:**
   - `students` (dados acadêmicos)
   - `users` (autenticação)
   - `enrollments` (matrícula em curso/série)

4. **Adicionar constraints:**
   - CHECK constraints para validar valores
   - NOT NULL onde apropriado
   - UNIQUE constraints para CPF, email, matrícula

---

**Última atualização:** 2024-12-18
