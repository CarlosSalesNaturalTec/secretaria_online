# Scripts de Migração de Dados

Este diretório contém scripts utilitários para migração e transformação de dados.

## migrate-student-courses.js

Script para migrar cursos dos estudantes da tabela `students` para a tabela `enrollments`.

### O que o script faz:

1. **Busca todos os estudantes** ativos na tabela `students`
2. **Para cada estudante com curso definido:**
   - Normaliza o nome do curso (remove acentos, lowercase, etc.)
   - Busca o curso correspondente na tabela `courses` (comparação fuzzy)
   - Se encontrar o curso:
     - Verifica se já existe uma matrícula para este estudante
     - Se não existir, cria uma nova matrícula com:
       - `student_id` (do estudante)
       - `course_id` (do curso encontrado)
       - `status = 'active'`
       - `enrollment_date = NOW()`
   - Se não encontrar o curso:
     - Adiciona ao relatório de cursos não encontrados
3. **Gera arquivo JSON** com lista de estudantes cujos cursos não foram localizados

### Como executar:

```bash
# A partir da raiz do projeto
node backend/database/scripts/migrate-student-courses.js

# Ou a partir do diretório backend
cd backend
node database/scripts/migrate-student-courses.js
```

### Pré-requisitos:

- Arquivo `.env` configurado no diretório `backend/`
- Banco de dados MySQL rodando
- Tabelas `students`, `courses` e `enrollments` criadas

### Output:

O script exibe no console:

- Progresso da migração em tempo real
- Estatísticas finais:
  - Total de estudantes processados
  - Estudantes com curso definido
  - Cursos encontrados vs. não encontrados
  - Matrículas criadas vs. já existentes
  - Erros (se houver)

### Arquivo gerado:

**`students-without-course.json`** - Contém lista de estudantes cujos cursos não foram encontrados:

```json
{
  "generated_at": "2025-12-05T10:30:00.000Z",
  "total_students_without_course": 3,
  "students": [
    {
      "student_id": 45,
      "student_name": "João Silva",
      "course_name": "Engenharia Civil"
    },
    {
      "student_id": 78,
      "student_name": "Maria Santos",
      "course_name": "Administraçao"
    }
  ]
}
```

### Comportamento importante:

- **Não duplica matrículas**: Se um estudante já possui matrícula, ela não será recriada
- **Normalização de nomes**: O script compara cursos de forma "fuzzy" (remove acentos, maiúsculas, caracteres especiais)
- **Soft deletes**: Ignora estudantes e cursos deletados (soft delete)
- **Transações**: Cada matrícula é criada individualmente (erros não afetam as outras)
- **Idempotente**: Pode ser executado múltiplas vezes sem causar duplicação

### Casos especiais:

1. **Estudante sem curso definido**: Será pulado com aviso no console
2. **Curso não encontrado**: Adicionado ao arquivo JSON de relatório
3. **Matrícula já existe**: Pulada com aviso no console
4. **Erro ao criar matrícula**: Registrado no console, não interrompe o processo

### Exemplo de execução:

```
============================================
  Migração de Cursos de Estudantes
============================================

✓ Conexão com banco de dados estabelecida

[1/4] Buscando estudantes...
✓ 150 estudantes encontrados

[2/4] Buscando cursos...
✓ 12 cursos encontrados

[3/4] Processando estudantes...

  ✓ Matrícula criada: Estudante 1 (João Silva) → Curso "Administração"
  ✓ Matrícula criada: Estudante 2 (Maria Santos) → Curso "Ciências Contábeis"
  ✗ Curso "Engenharia Civil" não encontrado para estudante 3 (Pedro Costa)
  ⚠ Estudante 4 (Ana Lima) já possui matrícula - pulando
  ...

[4/4] Gerando arquivo de relatório...
✓ Arquivo gerado: backend/database/scripts/students-without-course.json

============================================
  Resumo da Migração
============================================

Total de estudantes processados:    150
Estudantes com curso definido:      145
Cursos encontrados:                  142
Cursos não encontrados:              3
Matrículas criadas:                  138
Matrículas já existentes (puladas):  4
Erros:                               0

⚠ 3 estudantes com cursos não encontrados.
  Verifique o arquivo: backend/database/scripts/students-without-course.json

✓ Migração concluída com sucesso!
  138 matrículas foram criadas.

Processo finalizado.
```

### Resolução de problemas:

**Erro: "Error: connect ECONNREFUSED"**
- Verifique se o MySQL está rodando
- Verifique as credenciais no arquivo `.env`

**Erro: "ER_NO_SUCH_TABLE"**
- Execute as migrations antes de rodar o script: `npm run db:migrate`

**Muitos cursos não encontrados**
- Verifique se os nomes dos cursos na tabela `courses` estão corretos
- O script faz normalização, mas diferenças muito grandes não são detectadas
- Exemplo: "ADM" não vai encontrar "Administração de Empresas"

### Próximos passos após a migração:

1. Revisar o arquivo `students-without-course.json`
2. Para os cursos não encontrados:
   - Opção 1: Cadastrar os cursos faltantes na tabela `courses`
   - Opção 2: Corrigir o campo `curso` na tabela `students`
   - Opção 3: Executar o script novamente após correções
3. Considerar remover o campo `curso` da tabela `students` (opcional)
