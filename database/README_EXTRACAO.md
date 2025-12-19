# Extração de Dados do Sistema Acadêmico Antigo

## Origem dos Dados

Os dados foram extraídos do arquivo `academico_bo.sql` (707KB), que contém o dump completo do banco de dados MySQL do sistema acadêmico antigo.

## Arquivos Gerados

### 1. DDL (Definição das Tabelas)

**Arquivo:** `ddl.txt`
**Descrição:** Contém as definições CREATE TABLE de todas as 7 tabelas extraídas.

### 2. Arquivos CSV

Todos os CSVs foram gerados com:
- **Encoding:** UTF-8
- **Delimitador:** `;` (ponto e vírgula)
- **Quotes:** Todos os campos entre aspas duplas

| Arquivo | Registros | Tamanho | Descrição |
|---------|-----------|---------|-----------|
| `boletim_novo.csv` | 2.880 | 399KB | Notas das avaliações dos estudantes |
| `cliente.csv` | 304 | 144KB | Dados completos dos estudantes |
| `disciplina.csv` | 314 | 13KB | Catálogo de disciplinas/matérias |
| `sub.csv` | 85 | 7.6KB | Séries/turmas por curso |
| `profmat.csv` | 29 | 478B | Relação Professor ↔ Disciplina (N:M) |
| `profserie.csv` | 19 | 328B | Relação Professor ↔ Série (N:M) |
| `professor.csv` | 7 | 530B | Cadastro de professores |
| `categoria.csv` | 3 | 162B | Categorias/turnos (Manhã, Noite, Diúrno) |

## Estrutura dos Dados

### boletim_novo (Notas)

Campos principais:
- `id`: Identificador único
- `matricula`: Número de matrícula do aluno (FK para cliente.cliente_matricula)
- `disciplina`: Nome da disciplina (string, não FK!)
- `teste`, `prova`, `final`: Notas das avaliações
- `resultado`: Nota final calculada
- `semestre`: Série e curso (ex: "8° Psicologia")

**⚠️ Observação:** O campo `disciplina` armazena o nome textual da disciplina, não o ID. Isso causa problemas de integridade referencial.

### cliente (Estudantes)

Campos principais:
- `cliente_id`: ID único
- `cliente_matricula`: Número de matrícula (usado em boletim_novo)
- `cliente_sub`: FK para sub (série em que está matriculado)
- `cliente_nome`, `cliente_cpf`, `cliente_email`, etc.
- `cliente_curso`, `cliente_semestre`: Curso e semestre atual

### disciplina (Disciplinas)

Campos:
- `disciplina_id`: ID único
- `disciplina_nome`: Nome da disciplina

### professor (Professores)

Campos:
- `professor_id`: ID único
- `professor_nome`: Nome do professor
- `professor_senha`: Hash da senha
- `professor_login`: Login de acesso

### profmat (Professor ↔ Disciplina)

Relacionamento Many-to-Many:
- `profmat_mat`: FK para disciplina.disciplina_id
- `profmat_prof`: FK para professor.professor_id

### profserie (Professor ↔ Série)

Relacionamento Many-to-Many:
- `profserie_prof`: FK para professor.professor_id
- `profserie_sub`: FK para sub.sub_id

### sub (Séries/Turmas)

Campos:
- `sub_id`: ID único
- `sub_title`: Nome da série (ex: "Bacharelado em Psicologia 8°")
- `sub_categoria`: FK para categoria (turno)

### categoria (Turnos/Categorias)

Campos:
- `categoria_id`: ID único
- `categoria_title`: Nome da categoria (ex: "Manhã", "Noite", "Diúrno")
- `categoria_url`: URL amigável
- `categoria_pos`: Posição/ordem

## Problemas Identificados

1. **Integridade Referencial em `boletim_novo`:**
   - Campo `disciplina` armazena string em vez de FK
   - Causa inconsistências e dificulta relacionamentos

2. **Encoding Inconsistente:**
   - Alguns caracteres especiais aparecem com problemas de encoding nos CSVs
   - Exemplo: "PortuguÃƒÂªs" em vez de "Português"

3. **Estrutura "Wide" de Avaliações:**
   - Campos `teste`, `prova`, `final` em colunas separadas
   - Dificulta adicionar novos tipos de avaliação

4. **Significado de Categoria:**
   - A tabela `categoria` representa turnos (Manhã, Noite, Diúrno), não cursos
   - Relaciona-se com `sub` (séries) para indicar o turno de cada série

## Recomendações para Migração

1. **Normalizar Relacionamentos:**
   - Criar FK `discipline_id` em vez de nome textual
   - Mapear `boletim_novo.disciplina` → `disciplina.disciplina_nome`

2. **Reestruturar Avaliações:**
   - Migrar de estrutura wide para long
   - Criar tabela `evaluations` (tipos de avaliação)
   - Criar tabela `grades` com um registro por nota

3. **Limpar Encoding:**
   - Converter dados para UTF-8 consistente
   - Corrigir caracteres especiais

4. **Preservar Histórico:**
   - Marcar registros migrados como `is_historical: true`
   - Não permitir edição de dados históricos

5. **Mapear Estruturas:**
   - `sub` → `classes` no novo sistema
   - `cliente` → `students` no novo sistema
   - `boletim_novo` → `grades` + `evaluations` no novo sistema

## Data da Extração

**Data:** 2024-12-18
**Fonte:** `academico_bo.sql`
**Script:** Python 3 com parsing manual de SQL

---

**Nota:** Este arquivo documenta a extração dos dados do sistema antigo. Os CSVs gerados serão utilizados como base para migração para o novo sistema "Secretaria Online".
