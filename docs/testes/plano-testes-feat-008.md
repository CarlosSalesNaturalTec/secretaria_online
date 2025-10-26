# PLANO DE TESTES - feat-008: Criar migrations para Course e Discipline

**Feature:** feat-008 - Criar migrations para Course e Discipline
**Grupo:** grupo-2 - Banco de Dados e Modelos
**Data de criação:** 2025-10-26
**Status:** Aguardando execução

---

## 🔧 PREPARAÇÃO DO AMBIENTE

### Pré-requisitos

Certifique-se que o ambiente está configurado:

```bash
# 1. Backend deve estar com dependências instaladas
cd backend
npm install

# 2. Banco de dados MySQL deve estar rodando
mysql -u root -p -e "SHOW DATABASES;"

# 3. Variáveis de ambiente devem estar configuradas
# Verifique se o arquivo .env existe e contém:
# DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
cat .env | grep DB_

# 4. Testar conexão com banco de dados
node src/config/test-connection.js
```

**Esperado:**
```
✓ Database connection has been established successfully.
✓ SUCESSO: Conexão estabelecida com sucesso!
```

### Variáveis de Ambiente Necessárias

- [x] DB_HOST configurada
- [x] DB_PORT configurada
- [x] DB_NAME configurada
- [x] DB_USER configurada
- [x] DB_PASSWORD configurada

---

## 📋 TESTES FUNCIONAIS

### Teste 1: Executar Migrations (Criar Tabelas)

**Objetivo:** Verificar se as migrations criam as tabelas courses e disciplines corretamente no banco de dados

**Passos:**
1. Garantir que as migrations anteriores foram executadas
   ```bash
   cd backend
   npm run db:migrate:status
   ```
2. Executar as novas migrations
   ```bash
   npm run db:migrate
   ```
3. Verificar se as tabelas foram criadas
   ```bash
   mysql -u root -p secretaria_online -e "SHOW TABLES;"
   ```
4. Verificar estrutura da tabela courses
   ```bash
   mysql -u root -p secretaria_online -e "DESCRIBE courses;"
   ```
5. Verificar estrutura da tabela disciplines
   ```bash
   mysql -u root -p secretaria_online -e "DESCRIBE disciplines;"
   ```

**Resultado Esperado:**
- ✓ Migration executada sem erros
- ✓ Tabela `courses` criada com os campos: id, name, description, duration_semesters, createdAt, updatedAt, deletedAt
- ✓ Tabela `disciplines` criada com os campos: id, name, code, workload_hours, createdAt, updatedAt, deletedAt
- ✓ Índices criados corretamente (courses_name_unique, disciplines_code_unique, etc.)
- ✓ Mensagens de log aparecem no console: "✓ Tabela courses criada com sucesso" e "✓ Tabela disciplines criada com sucesso"

**Como verificar:**
- Execute `SHOW CREATE TABLE courses;` e `SHOW CREATE TABLE disciplines;` para ver a estrutura completa
- Verifique se os índices foram criados: `SHOW INDEX FROM courses;` e `SHOW INDEX FROM disciplines;`

**Resultado Indesejado:**
- ✗ Erro de sintaxe SQL
- ✗ Tabelas não criadas
- ✗ Campos com tipos incorretos
- ✗ Índices ausentes

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Reverter Migrations (Rollback)

**Objetivo:** Verificar se as migrations podem ser revertidas corretamente (down)

**Passos:**
1. Reverter as migrations
   ```bash
   cd backend
   npm run db:migrate:undo
   npm run db:migrate:undo
   ```
2. Verificar se as tabelas foram removidas
   ```bash
   mysql -u root -p secretaria_online -e "SHOW TABLES;"
   ```

**Resultado Esperado:**
- ✓ Migrations revertidas sem erros
- ✓ Tabelas `courses` e `disciplines` removidas do banco
- ✓ Mensagens de log: "✓ Tabela courses removida" e "✓ Tabela disciplines removida"

**Resultado Indesejado:**
- ✗ Erro ao reverter migrations
- ✗ Tabelas ainda presentes no banco

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Re-executar Migrations

**Objetivo:** Garantir que as migrations podem ser executadas novamente após rollback

**Passos:**
1. Re-executar migrations
   ```bash
   npm run db:migrate
   ```
2. Verificar se as tabelas foram recriadas
   ```bash
   mysql -u root -p secretaria_online -e "SHOW TABLES;"
   ```

**Resultado Esperado:**
- ✓ Migrations executadas novamente sem erros
- ✓ Tabelas recriadas corretamente

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTES DE VALIDAÇÃO - MODEL COURSE

### Teste 4: Criar Curso Válido

**Objetivo:** Verificar se o Model Course consegue criar um registro válido

**Método:** Script Node.js ou console do Sequelize

**Passos:**
1. Criar arquivo de teste `backend/test-course-create.js`:
   ```javascript
   const { Course } = require('./src/models');

   async function testCreateCourse() {
     try {
       const course = await Course.create({
         name: 'Administração',
         description: 'Curso de Bacharelado em Administração de Empresas',
         duration_semesters: 8
       });

       console.log('✓ Curso criado com sucesso:', course.toJSON());
     } catch (error) {
       console.error('✗ Erro ao criar curso:', error.message);
     } finally {
       process.exit();
     }
   }

   testCreateCourse();
   ```

2. Executar o teste:
   ```bash
   node test-course-create.js
   ```

**Resultado Esperado:**
- ✓ Curso criado sem erros
- ✓ ID gerado automaticamente
- ✓ Timestamps (createdAt, updatedAt) preenchidos
- ✓ deletedAt é null
- ✓ Log do hook afterCreate aparece: `[Course] Curso criado: Administração (ID: 1)`
- ✓ JSON retornado não contém deletedAt

**Resultado Indesejado:**
- ✗ Erro de validação
- ✗ Campos obrigatórios não preenchidos
- ✗ ID não gerado

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5: Validação de Nome Obrigatório (Course)

**Objetivo:** Verificar se o campo `name` é obrigatório

**Input:**
```javascript
const course = await Course.create({
  // name ausente
  duration_semesters: 8
});
```

**Resultado Esperado:**
- ✓ Erro de validação: "Nome do curso é obrigatório"
- ✓ Registro não criado no banco

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6: Validação de Nome Duplicado (Course)

**Objetivo:** Verificar se o índice UNIQUE impede nomes duplicados

**Input:**
```javascript
// Primeiro curso
await Course.create({
  name: 'Enfermagem',
  duration_semesters: 8
});

// Tentar criar curso com mesmo nome
await Course.create({
  name: 'Enfermagem',
  duration_semesters: 10
});
```

**Resultado Esperado:**
- ✓ Segundo curso rejeita com erro: "Já existe um curso com este nome"
- ✓ Apenas 1 curso "Enfermagem" no banco

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 7: Validação de Duração Mínima (Course)

**Objetivo:** Verificar validação de duration_semesters >= 1

**Input:**
```javascript
await Course.create({
  name: 'Curso Teste',
  duration_semesters: 0
});
```

**Resultado Esperado:**
- ✓ Erro de validação: "Duração mínima é de 1 semestre"

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 8: Validação de Duração Máxima (Course)

**Objetivo:** Verificar validação de duration_semesters <= 20

**Input:**
```javascript
await Course.create({
  name: 'Curso Longo',
  duration_semesters: 25
});
```

**Resultado Esperado:**
- ✓ Erro de validação: "Duração máxima é de 20 semestres"

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 9: Hook beforeValidate - Normalização de Nome (Course)

**Objetivo:** Verificar se o hook remove espaços extras do nome

**Input:**
```javascript
await Course.create({
  name: '   Administração   ',
  duration_semesters: 8
});
```

**Resultado Esperado:**
- ✓ Curso criado com name = "Administração" (sem espaços extras)

**Como verificar:**
```javascript
const course = await Course.findOne({ where: { name: 'Administração' }});
console.log('Nome salvo:', `"${course.name}"`);
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTES DE VALIDAÇÃO - MODEL DISCIPLINE

### Teste 10: Criar Disciplina Válida

**Objetivo:** Verificar se o Model Discipline consegue criar um registro válido

**Input:**
```javascript
const discipline = await Discipline.create({
  name: 'Matemática Aplicada',
  code: 'MAT101',
  workload_hours: 80
});
```

**Resultado Esperado:**
- ✓ Disciplina criada sem erros
- ✓ Log do hook afterCreate: `[Discipline] Disciplina criada: MAT101 - Matemática Aplicada (ID: 1)`
- ✓ JSON retornado contém campo computado `credits: 5` (80h / 15h = ~5 créditos)
- ✓ Campo `code` armazenado em MAIÚSCULAS

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 11: Validação de Código Obrigatório (Discipline)

**Objetivo:** Verificar se o campo `code` é obrigatório

**Input:**
```javascript
await Discipline.create({
  name: 'Física',
  // code ausente
  workload_hours: 60
});
```

**Resultado Esperado:**
- ✓ Erro: "Código da disciplina é obrigatório"

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 12: Validação de Código Duplicado (Discipline)

**Objetivo:** Verificar se o índice UNIQUE impede códigos duplicados

**Input:**
```javascript
await Discipline.create({
  name: 'Biologia I',
  code: 'BIO101',
  workload_hours: 60
});

await Discipline.create({
  name: 'Biologia Geral',
  code: 'BIO101', // Código duplicado
  workload_hours: 80
});
```

**Resultado Esperado:**
- ✓ Segundo registro rejeita: "Já existe uma disciplina com este código"

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 13: Hook beforeValidate - Código em Maiúsculas (Discipline)

**Objetivo:** Verificar se o hook converte código para maiúsculas

**Input:**
```javascript
await Discipline.create({
  name: 'Química',
  code: 'qui101', // minúsculas
  workload_hours: 60
});
```

**Resultado Esperado:**
- ✓ Disciplina criada com code = "QUI101" (maiúsculas)

**Como verificar:**
```javascript
const discipline = await Discipline.findOne({ where: { name: 'Química' }});
console.log('Código salvo:', discipline.code); // Deve ser "QUI101"
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 14: Validação de Carga Horária Mínima (Discipline)

**Objetivo:** Verificar validação de workload_hours >= 1

**Input:**
```javascript
await Discipline.create({
  name: 'Teste',
  code: 'TST001',
  workload_hours: 0
});
```

**Resultado Esperado:**
- ✓ Erro: "Carga horária mínima é de 1 hora"

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 15: Método Estático findByCode (Discipline)

**Objetivo:** Verificar se o método findByCode funciona

**Passos:**
1. Criar disciplina de teste
2. Buscar por código

**Input:**
```javascript
await Discipline.create({
  name: 'História',
  code: 'HIS101',
  workload_hours: 40
});

const found = await Discipline.findByCode('HIS101');
const notFound = await Discipline.findByCode('INEXISTENTE');
```

**Resultado Esperado:**
- ✓ `found` retorna a disciplina História
- ✓ `notFound` retorna null

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔗 TESTES DE INTEGRAÇÃO

### Teste 16: Carregar Models via index.js

**Objetivo:** Verificar se os models são carregados corretamente pelo Sequelize

**Passos:**
1. Criar script `backend/test-models-loading.js`:
   ```javascript
   const db = require('./src/models');

   console.log('Models disponíveis:', Object.keys(db));
   console.log('Course model:', typeof db.Course);
   console.log('Discipline model:', typeof db.Discipline);

   if (db.Course && db.Discipline) {
     console.log('✓ Models Course e Discipline carregados com sucesso');
   } else {
     console.error('✗ Erro ao carregar models');
   }

   process.exit();
   ```

2. Executar:
   ```bash
   node test-models-loading.js
   ```

**Resultado Esperado:**
- ✓ Models aparecem na lista: `['sequelize', 'Sequelize', 'User', 'Course', 'Discipline']`
- ✓ typeof Course é 'function'
- ✓ typeof Discipline é 'function'

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 17: Verificar Integridade do Banco após Inserções

**Objetivo:** Verificar se múltiplos registros podem ser criados e consultados

**Passos:**
1. Criar 5 cursos diferentes
2. Criar 10 disciplinas diferentes
3. Consultar todos os registros

**Comandos:**
```bash
# Via MySQL
mysql -u root -p secretaria_online -e "SELECT * FROM courses;"
mysql -u root -p secretaria_online -e "SELECT * FROM disciplines;"
```

**Resultado Esperado:**
- ✓ Todos os registros aparecem corretamente
- ✓ IDs são sequenciais
- ✓ Timestamps estão preenchidos
- ✓ Dados consistentes

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🎯 TESTES DE SCOPES

### Teste 18: Scope active (Course e Discipline)

**Objetivo:** Verificar se o scope active retorna apenas registros não deletados

**Passos:**
1. Criar 3 cursos
2. Fazer soft delete de 1 curso
3. Buscar com scope active

**Input:**
```javascript
// Criar cursos
await Course.create({ name: 'Curso A', duration_semesters: 4 });
await Course.create({ name: 'Curso B', duration_semesters: 6 });
const courseC = await Course.create({ name: 'Curso C', duration_semesters: 8 });

// Soft delete
await courseC.destroy();

// Buscar ativos
const activeCourses = await Course.scope('active').findAll();
console.log('Cursos ativos:', activeCourses.length); // Deve ser 2
```

**Resultado Esperado:**
- ✓ Retorna apenas 2 cursos (A e B)
- ✓ Curso C não aparece (soft deleted)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 19: Scope longDuration (Course)

**Objetivo:** Verificar se retorna apenas cursos >= 8 semestres

**Input:**
```javascript
await Course.create({ name: 'Curso Curto', duration_semesters: 4 });
await Course.create({ name: 'Curso Longo 1', duration_semesters: 8 });
await Course.create({ name: 'Curso Longo 2', duration_semesters: 10 });

const longCourses = await Course.scope('longDuration').findAll();
```

**Resultado Esperado:**
- ✓ Retorna 2 cursos (Longo 1 e Longo 2)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 20: Scope highWorkload (Discipline)

**Objetivo:** Verificar se retorna apenas disciplinas >= 80 horas

**Input:**
```javascript
await Discipline.create({ name: 'Leve', code: 'LEV01', workload_hours: 40 });
await Discipline.create({ name: 'Pesada 1', code: 'PES01', workload_hours: 80 });
await Discipline.create({ name: 'Pesada 2', code: 'PES02', workload_hours: 120 });

const heavyDisciplines = await Discipline.scope('highWorkload').findAll();
```

**Resultado Esperado:**
- ✓ Retorna 2 disciplinas (Pesada 1 e Pesada 2)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🧪 TESTES DE MÉTODOS AUXILIARES

### Teste 21: Método getDurationInYears (Course)

**Objetivo:** Verificar conversão de semestres para anos

**Input:**
```javascript
const course8 = await Course.create({ name: 'Curso 8 sem', duration_semesters: 8 });
const course5 = await Course.create({ name: 'Curso 5 sem', duration_semesters: 5 });

console.log('8 semestres =', course8.getDurationInYears(), 'anos'); // Deve ser 4
console.log('5 semestres =', course5.getDurationInYears(), 'anos'); // Deve ser 3 (arredondado)
```

**Resultado Esperado:**
- ✓ 8 semestres = 4 anos
- ✓ 5 semestres = 3 anos (arredondado para cima)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 22: Método getCredits (Discipline)

**Objetivo:** Verificar cálculo de créditos (horas / 15)

**Input:**
```javascript
const disc60 = await Discipline.create({ name: 'Disc 60h', code: 'D60', workload_hours: 60 });
const disc80 = await Discipline.create({ name: 'Disc 80h', code: 'D80', workload_hours: 80 });

console.log('60h =', disc60.getCredits(), 'créditos'); // 4
console.log('80h =', disc80.getCredits(), 'créditos'); // 5
```

**Resultado Esperado:**
- ✓ 60 horas = 4 créditos
- ✓ 80 horas = 5 créditos

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 23: Método isHighWorkload (Discipline)

**Objetivo:** Verificar se identifica disciplinas >= 80h

**Input:**
```javascript
const light = await Discipline.create({ name: 'Leve', code: 'LV', workload_hours: 40 });
const heavy = await Discipline.create({ name: 'Pesada', code: 'PS', workload_hours: 120 });

console.log('40h é pesada?', light.isHighWorkload()); // false
console.log('120h é pesada?', heavy.isHighWorkload()); // true
```

**Resultado Esperado:**
- ✓ 40h retorna false
- ✓ 120h retorna true

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ⚠️ TESTES DE EDGE CASES

### Teste 24: Nome de Curso com Caracteres Especiais

**Objetivo:** Verificar se aceita nomes com caracteres especiais válidos

**Input:**
```javascript
await Course.create({
  name: 'Administração & Gestão - Nível Superior',
  duration_semesters: 8
});
```

**Resultado Esperado:**
- ✓ Curso criado normalmente
- ✓ Nome armazenado com caracteres especiais preservados

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 25: Código de Disciplina com Formatos Variados

**Objetivo:** Verificar se aceita códigos com hífen e underscore

**Input:**
```javascript
await Discipline.create({ name: 'Teste 1', code: 'MAT-101', workload_hours: 60 });
await Discipline.create({ name: 'Teste 2', code: 'FIS_201', workload_hours: 80 });
await Discipline.create({ name: 'Teste 3', code: 'QUIM101A', workload_hours: 40 });
```

**Resultado Esperado:**
- ✓ Todos os códigos aceitos
- ✓ Convertidos para maiúsculas (MAT-101, FIS_201, QUIM101A)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 26: Código de Disciplina Inválido (com espaços)

**Objetivo:** Verificar rejeição de código com espaços

**Input:**
```javascript
await Discipline.create({
  name: 'Teste',
  code: 'MAT 101', // Espaço no meio
  workload_hours: 60
});
```

**Resultado Esperado:**
- ✓ Erro: "Código deve conter apenas letras, números, hífen ou underscore"

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 27: Soft Delete e Restauração

**Objetivo:** Verificar funcionamento do soft delete (paranoid)

**Passos:**
1. Criar curso
2. Fazer soft delete (destroy)
3. Tentar buscar normalmente
4. Buscar com paranoid: false
5. Restaurar (restore)
6. Buscar novamente

**Input:**
```javascript
const course = await Course.create({
  name: 'Curso Teste Delete',
  duration_semesters: 6
});

// Soft delete
await course.destroy();

// Buscar normalmente (não deve encontrar)
const notFound = await Course.findByPk(course.id);
console.log('Busca normal:', notFound); // null

// Buscar com paranoid: false (deve encontrar)
const found = await Course.findByPk(course.id, { paranoid: false });
console.log('Busca com paranoid false:', found ? 'Encontrado' : 'Não encontrado');

// Restaurar
await found.restore();

// Buscar novamente (deve encontrar)
const restored = await Course.findByPk(course.id);
console.log('Após restore:', restored ? 'Encontrado' : 'Não encontrado');
```

**Resultado Esperado:**
- ✓ Após destroy: não aparece em busca normal
- ✓ Aparece em busca com paranoid: false
- ✓ deletedAt preenchido após destroy
- ✓ deletedAt null após restore
- ✓ Aparece em busca normal após restore

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ✅ CHECKLIST FINAL

### Funcionalidade
- [ ] Migrations executam sem erros
- [ ] Migrations podem ser revertidas
- [ ] Tabelas criadas com estrutura correta
- [ ] Índices aplicados corretamente
- [ ] Models criam registros válidos
- [ ] Validações funcionam (campos obrigatórios, únicos, min/max)
- [ ] Hooks normalizam dados (trim, uppercase)
- [ ] Scopes retornam resultados corretos
- [ ] Métodos auxiliares calculam valores corretamente
- [ ] Soft delete funciona (paranoid)

### Código
- [ ] Sem console.log desnecessários (apenas nos hooks como definido)
- [ ] Sem código comentado
- [ ] Funções e métodos documentados
- [ ] Nomes de variáveis claros e descritivos
- [ ] Código segue padrões do projeto

### Segurança
- [ ] Inputs validados pelo Sequelize
- [ ] Nenhuma credencial exposta
- [ ] Tratamento de erros adequado
- [ ] Logs não expõem informações sensíveis

### Documentação
- [ ] README.md atualizado com novas migrations
- [ ] backlog.json atualizado
- [ ] Comentários inline onde necessário
- [ ] JSDoc completo nos models

### Performance
- [ ] Índices otimizados para queries comuns
- [ ] Validações executam rapidamente
- [ ] Sem N+1 queries identificadas

---

## 🛠️ FERRAMENTAS RECOMENDADAS

### Banco de Dados
- **DBeaver** - Interface gráfica universal (https://dbeaver.io/)
- **MySQL Workbench** - Cliente oficial MySQL
- **Terminal MySQL** - Linha de comando direto

### Testes de Código
- **Node.js REPL** - Console interativo do Node
  ```bash
  node
  > const db = require('./backend/src/models');
  > db.Course.findAll().then(console.log);
  ```

### Específicos para esta feature
- **Sequelize CLI** - Ferramenta de migrations
  ```bash
  npx sequelize-cli migration:status
  npx sequelize-cli db:migrate
  npx sequelize-cli db:migrate:undo
  ```

---

## 📊 RESULTADO FINAL DOS TESTES

**Data de execução:** _[Preencher]_
**Executado por:** _[Preencher]_

### Resumo
- **Total de testes:** 27
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
- Os Models Course e Discipline ainda NÃO possuem associações (belongsToMany) - isso será implementado na feat-009
- Soft delete está habilitado - registros "deletados" permanecem no banco com deletedAt preenchido
- Códigos de disciplinas são sempre convertidos para MAIÚSCULAS pelo hook beforeValidate
- Nomes de cursos e disciplinas têm trim() aplicado automaticamente
- Campo `credits` no JSON de Discipline é computado dinamicamente (não está no banco)

### Dicas para Execução
1. Execute os testes na ordem apresentada
2. Limpe o banco entre testes para evitar conflitos de dados
3. Use `npm run db:reset` com cuidado - apaga TODOS os dados
4. Marque cada checkbox conforme executa
5. Documente qualquer comportamento inesperado nas observações

---

**Plano de testes criado automaticamente pela feat-008**
