# Scripts de Importação - Semestre Atual do Aluno

Este diretório contém scripts para importar a informação de **semestre acadêmico atual** dos alunos do sistema antigo (academico_bo.sql) para o sistema novo.

## Contexto

No sistema atual, foi adicionado o campo `current_semester` à tabela `enrollments` para rastrear em qual semestre do curso cada aluno está (1°, 2°, 3°, etc.).

Esta informação não estava diretamente armazenada no banco antigo, mas pode ser extraída da tabela `boletim_novo`, que registra as notas históricas dos alunos com informação do semestre cursado.

## Scripts Disponíveis

### 1. `import-current-semester-from-boletim.js` (Recomendado)

**Descrição:** Extrai o semestre acadêmico da tabela `boletim_novo` do banco antigo.

**Como funciona:**
1. Lê o arquivo `database/academico_bo.sql`
2. Faz parsing dos INSERTs da tabela `boletim_novo`
3. Extrai o campo `semestre` que suporta múltiplos formatos:
   - `"I° Semestre Psicologia"` → 1
   - `"Bacharelado em Psicologia 9°"` → 9
   - `"8° Psicologia"` → 8
   - `"Técnico em Enfermagem I"` → 1
   - `"Especialização em Docência"` → 1 (padrão)
4. Converte números romanos e arábicos para inteiros
5. Agrupa por matrícula e seleciona o **semestre mais alto** (último semestre cursado)
6. Atualiza o campo `current_semester` da enrollment ativa de cada estudante

**Como executar:**
```bash
cd backend
node database/scripts/import-current-semester-from-boletim.js
```

**Resultado esperado:**
```
[Import] Total de matrículas processadas: 255
[Import] Enrollments atualizados: 239
[Import] Estudantes não encontrados: 16
[Import] Estudantes sem enrollment ativa: 0
[Import] Erros: 0
```

**Cobertura:**
- De 288 estudantes cadastrados, 239 foram atualizados (83%)
- 49 estudantes não têm histórico no banco antigo (17%)

### 2. `import-current-semester.js` (Não recomendado)

**Descrição:** Tenta extrair da tabela `cliente`, campo `cliente_semestre`.

**Problema:** O campo `cliente_semestre` no banco antigo armazena o **período letivo** (ex: "2025.1", "2024.2"), não o semestre acadêmico do aluno no curso. Por isso, este script não consegue importar os dados corretamente.

## Pré-requisitos

1. O arquivo `database/academico_bo.sql` deve estar presente na raiz do projeto
2. A migration `20251223002004-add-current-semester-to-enrollments.js` deve ter sido executada
3. O banco de dados atual deve ter estudantes com enrollments ativas

## Estrutura do Campo current_semester

- **Tipo:** INTEGER
- **Valores:** 1 a 12 (1° ao 12° semestre)
- **Nullable:** Sim (pode ser NULL para alunos sem informação histórica)
- **Localização:** Tabela `enrollments`, coluna `current_semester`

## Métodos Adicionados ao Model Enrollment

```javascript
// Retorna label formatado
enrollment.getCurrentSemesterLabel(); // "1º semestre", "2º semestre", etc.

// Verifica se está no último semestre do curso
await enrollment.isLastSemester(); // true/false

// Avança para o próximo semestre
await enrollment.advanceSemester(); // Incrementa +1 semestre
```

## Migration

A migration adiciona:
- Campo `current_semester` na tabela `enrollments`
- Índice `idx_enrollments_current_semester` para otimizar queries

Para executar a migration:
```bash
cd backend
npm run db:migrate
```

Para reverter:
```bash
cd backend
npm run db:migrate:undo
```

## Notas Importantes

- O script é **idempotente**: pode ser executado múltiplas vezes sem problemas
- Apenas enrollments **ativas ou pendentes** são atualizadas
- Se um estudante não for encontrado pelo número de matrícula, ele é ignorado
- O semestre importado é o **mais alto** encontrado no histórico de notas
- Estudantes sem histórico de notas na tabela `boletim_novo` não terão o campo atualizado

## Troubleshooting

### Erro: "Arquivo não encontrado"
**Solução:** Certifique-se de que o arquivo `database/academico_bo.sql` existe no caminho correto.

### Erro: "Nenhum dado para importar"
**Possíveis causas:**
1. O arquivo SQL não contém INSERTs da tabela `boletim_novo`
2. Os INSERTs não estão no formato esperado
3. Nenhuma matrícula do banco antigo corresponde às do banco atual

### Estudantes não encontrados
**Causa:** O número de matrícula do banco antigo não existe na tabela `students` do banco atual.

**Solução:** Executar primeiro o script de importação de estudantes.

### Estudantes sem enrollment ativa
**Causa:** O estudante existe na tabela `students`, mas não possui uma matrícula ativa/pendente em `enrollments`.

**Solução:** Criar a enrollment do estudante antes de executar este script.
