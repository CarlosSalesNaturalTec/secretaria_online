# Scripts de Migração de Dados v3

Migração de dados do sistema antigo (CSV) para o novo sistema (MySQL).

## 📋 Estratégia v3

### Regras Principais:
1. **NÃO CRIAR novos cadastros** - Apenas mapear registros que JÁ EXISTEM
2. **USAR credenciais do sistema antigo** - Login e senha originais
3. **DADOS ÓRFÃOS** - Atribuídos ao usuário "Sistema Migração"

## 🗂️ Estrutura dos Scripts

### FASE 0: Preparação
- `00_create_migration_tables.sql` - Cria tabelas auxiliares de mapeamento

### FASE 1: Professores
- `01_create_professor_mapping.js` - Mapeia professores existentes
- `02_create_users_with_old_credentials.js` - Cria users com login/senha antigos
- `03_create_migration_admin_user.js` - Cria usuário "Sistema Migração"

### FASE 2: Alunos
- `04_map_existing_students.js` - Mapeia alunos existentes (via matricula)

### FASE 3: Turmas
- `05_create_classes_from_sub.js` - Cria classes a partir de sub.csv

### FASE 4: Associações
- `06_populate_class_students.js` - Associa alunos às turmas
- `07_populate_class_teachers.js` - Associa professores às turmas

### FASE 5: Disciplinas
- `08_create_discipline_mapping.js` - Mapeia disciplinas (match exato e fuzzy)

### FASE 6: Notas
- `09_import_boletim_to_temp.js` - Importa boletim_novo.csv para temp table
- `10_create_evaluations_with_fallback.js` - Cria avaliações com professor ou fallback
- `11_create_evaluation_mapping.js` - Mapeia tipos de avaliação → evaluation_id
- `12_migrate_grades.js` - Migra notas (teste, prova, final)

### FASE 7-8: Validação e Relatórios
- `13_validate_migration.js` - Valida dados migrados
- `14_generate_report.js` - Gera relatório final (JSON + MD)

## 🚀 Como Executar

### Execução Completa (Recomendado)
```bash
cd backend/database/migration_scripts
node run_migration.js
```

### Execução Individual
```bash
# Exemplo: executar apenas mapeamento de professores
node 01_create_professor_mapping.js
```

## ⚙️ Pré-requisitos

1. **Banco de dados configurado** - MySQL rodando com tabelas criadas
2. **Arquivos CSV** - Devem estar em `database/*.csv`
3. **Dependências instaladas**:
   ```bash
   cd backend
   npm install csv-parser iconv-lite
   ```

## 📊 Dados de Entrada (CSVs)

- `professor.csv` - Professores (7 registros, 4 serão mapeados)
- `cliente.csv` - Alunos (~304 registros)
- `sub.csv` - Turmas do sistema antigo
- `disciplina.csv` - Disciplinas
- `profmat.csv` - Relação professor-disciplina
- `profserie.csv` - Relação professor-turma
- `boletim_novo.csv` - Notas

## 🎯 Impacto Esperado

### Professores:
- ✅ **4 mapeados** (PATRICIA, ROSANA, JACKSON, TAINA)
- ❌ **3 ignorados** (TUTOR, Tony, Tony dup)

### Alunos:
- ✅ **~304 mapeados** (todos com matrícula válida)

### Avaliações:
- ⚠️ **~70%** atribuídas a "Sistema Migração" (eram de TUTOR)
- ✅ **~30%** com professores reais

## ⚠️ Avisos Importantes

1. **Backup antes de executar** - Scripts modificam o banco
2. **Verificar credenciais** - `.env` deve estar configurado
3. **Encoding UTF-8** - CSVs devem estar em UTF-8
4. **Dados órfãos** - Notas de alunos não mapeados serão IGNORADAS

## 📝 Logs e Debugging

Cada script gera logs detalhados:
- ✅ Operações bem-sucedidas
- ⚠️ Avisos (dados não encontrados)
- ❌ Erros críticos

## 🔍 Validação

Após migração, executar:
```bash
node 13_validate_migration.js
node 14_generate_report.js
```

Os relatórios serão gerados em:
- `migration_report_v3.json` - Dados estruturados
- `migration_report_v3.md` - Relatório legível

## 📚 Documentação Completa

Ver: `docs/ESTRATEGIA_MIGRACAO_v3.md`
