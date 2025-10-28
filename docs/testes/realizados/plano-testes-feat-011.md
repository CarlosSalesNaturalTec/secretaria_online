# PLANO DE TESTES - feat-011: Criar migration e model Enrollment

**Feature:** feat-011 - Criar migration e model Enrollment
**Grupo:** Banco de Dados e Modelos
**Data de criação:** 2025-10-26
**Status:** Aguardando execução

---

## 🔧 PREPARAÇÃO DO AMBIENTE

### Pré-requisitos

Certifique-se que o ambiente está configurado:

```bash
# Verificar se o banco de dados está rodando
mysql -u root -p -e "SELECT 1"

# Verificar se a migration foi executada
cd backend
npx sequelize-cli db:migrate:status

# Verificar se a tabela enrollments existe
mysql -u root -p secretaria_online -e "DESCRIBE enrollments"
```

**Esperado:** Tabela `enrollments` existe com os campos: id, student_id, course_id, status, enrollment_date, created_at, updated_at, deleted_at

### Variáveis de Ambiente Necessárias

- [ ] DB_HOST configurada
- [ ] DB_PORT configurada
- [ ] DB_NAME configurada (secretaria_online)
- [ ] DB_USER configurada
- [ ] DB_PASSWORD configurada

---

## 📋 TESTES FUNCIONAIS

### Teste 1: Criar matrícula com dados válidos

**Objetivo:** Verificar se é possível criar uma matrícula com todos os dados corretos

**Passos:**
1. Abra um terminal no diretório `backend/`
2. Execute o seguinte comando Node.js para criar uma matrícula de teste:
   ```bash
   node -e "const { Enrollment, User, Course } = require('./src/models'); (async () => { try { const student = await User.findOne({ where: { role: 'student' } }); const course = await Course.findOne(); if (!student || !course) { console.error('❌ Certifique-se de ter pelo menos 1 aluno e 1 curso no banco'); process.exit(1); } const enrollment = await Enrollment.create({ student_id: student.id, course_id: course.id, enrollment_date: '2025-01-15' }); console.log('✅ Matrícula criada com sucesso:'); console.log(enrollment.toJSON()); process.exit(0); } catch (error) { console.error('❌ Erro ao criar matrícula:', error.message); process.exit(1); } })();"
   ```

**Resultado Esperado:**
- ✓ Matrícula criada com sucesso
- ✓ Hook beforeValidate executado (log no console: `[Enrollment Hook] criando matrícula`)
- ✓ Hook afterCreate executado (log no console: `[Enrollment Hook] Matrícula criada com sucesso - ID: X, Status: pending`)
- ✓ Status padrão = `pending`
- ✓ Campos student_id e course_id preenchidos corretamente
- ✓ enrollment_date = '2025-01-15'

**Como verificar:**
- Verificar logs no console
- Consultar banco de dados:
  ```bash
  mysql -u root -p secretaria_online -e "SELECT * FROM enrollments ORDER BY id DESC LIMIT 1"
  ```

**Resultado Indesejado:**
- ✗ Erro ao criar matrícula
- ✗ Status diferente de `pending`
- ✗ Campos obrigatórios não preenchidos

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Verificar regra de negócio - apenas 1 matrícula ativa por aluno

**Objetivo:** Garantir que um aluno não possa ter mais de uma matrícula ativa/pending simultaneamente

**Passos:**
1. Crie uma primeira matrícula com status `active` para um aluno:
   ```bash
   node -e "const { Enrollment, User, Course } = require('./src/models'); (async () => { try { const student = await User.findOne({ where: { role: 'student' } }); const course1 = await Course.findOne(); const enrollment1 = await Enrollment.create({ student_id: student.id, course_id: course1.id, status: 'active', enrollment_date: '2025-01-15' }); console.log('✅ Primeira matrícula ativa criada - ID:', enrollment1.id); process.exit(0); } catch (error) { console.error('❌ Erro:', error.message); process.exit(1); } })();"
   ```

2. Tente criar uma segunda matrícula `pending` para o MESMO aluno:
   ```bash
   node -e "const { Enrollment, User, Course } = require('./src/models'); (async () => { try { const student = await User.findOne({ where: { role: 'student' } }); const course2 = await Course.findAll({ limit: 2 })[1] || await Course.findOne(); const enrollment2 = await Enrollment.create({ student_id: student.id, course_id: course2.id, status: 'pending', enrollment_date: '2025-02-01' }); console.log('❌ ERRO: Segunda matrícula criada (não deveria acontecer!) - ID:', enrollment2.id); process.exit(1); } catch (error) { if (error.name === 'SequelizeUniqueConstraintError') { console.log('✅ CORRETO: Índice único impediu criação de 2ª matrícula ativa/pending'); console.log('   Mensagem:', error.message); process.exit(0); } else { console.error('❌ Erro inesperado:', error.message); process.exit(1); } } })();"
   ```

**Resultado Esperado:**
- ✓ Primeira matrícula criada com sucesso
- ✓ Segunda tentativa gera erro `SequelizeUniqueConstraintError`
- ✓ Mensagem de erro menciona índice `enrollments_student_active_unique`
- ✓ Banco de dados mantém apenas 1 matrícula ativa/pending por aluno

**Resultado Indesejado:**
- ✗ Segunda matrícula criada sem erro (violação de regra de negócio)
- ✗ Erro diferente de `SequelizeUniqueConstraintError`

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Verificar que aluno pode ter múltiplas matrículas se uma estiver cancelada

**Objetivo:** Garantir que o índice único não impede matrículas se a anterior foi cancelada

**Passos:**
1. Crie uma matrícula e cancele-a:
   ```bash
   node -e "const { Enrollment, User, Course } = require('./src/models'); (async () => { try { const student = await User.findOne({ where: { role: 'student' }, order: [['id', 'DESC']] }); const course1 = await Course.findOne(); const enrollment1 = await Enrollment.create({ student_id: student.id, course_id: course1.id, status: 'active' }); await enrollment1.cancel(); console.log('✅ Matrícula cancelada - ID:', enrollment1.id); process.exit(0); } catch (error) { console.error('❌ Erro:', error.message); process.exit(1); } })();"
   ```

2. Tente criar nova matrícula para o mesmo aluno:
   ```bash
   node -e "const { Enrollment, User, Course } = require('./src/models'); (async () => { try { const student = await User.findOne({ where: { role: 'student' }, order: [['id', 'DESC']] }); const course2 = await Course.findAll({ limit: 2 })[1] || await Course.findOne(); const enrollment2 = await Enrollment.create({ student_id: student.id, course_id: course2.id, status: 'pending' }); console.log('✅ CORRETO: Nova matrícula criada após cancelamento - ID:', enrollment2.id); process.exit(0); } catch (error) { console.error('❌ Erro ao criar nova matrícula:', error.message); process.exit(1); } })();"
   ```

**Resultado Esperado:**
- ✓ Matrícula cancelada com sucesso (status = cancelled)
- ✓ Nova matrícula criada sem erros
- ✓ Índice único não impede, pois matrícula anterior está cancelada

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTES DE VALIDAÇÃO

### Teste 4: Validação de campos obrigatórios

**Input:** Tentar criar matrícula sem student_id
**Método:**

```bash
node -e "const { Enrollment } = require('./src/models'); (async () => { try { await Enrollment.create({ course_id: 1, enrollment_date: '2025-01-15' }); console.log('❌ ERRO: Matrícula criada sem student_id'); process.exit(1); } catch (error) { if (error.name === 'SequelizeValidationError') { console.log('✅ CORRETO: Validação impediu criação sem student_id'); console.log('   Mensagens:', error.errors.map(e => e.message).join(', ')); process.exit(0); } else { console.error('❌ Erro inesperado:', error.message); process.exit(1); } } })();"
```

**Esperado:**
- ✓ Erro `SequelizeValidationError`
- ✓ Mensagem de validação: "student_id é obrigatório"
- ✓ Matrícula NÃO é criada no banco

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5: Validação de status ENUM

**Input:** Tentar criar matrícula com status inválido
**Método:**

```bash
node -e "const { Enrollment, User, Course } = require('./src/models'); (async () => { try { const student = await User.findOne({ where: { role: 'student' } }); const course = await Course.findOne(); await Enrollment.create({ student_id: student.id, course_id: course.id, status: 'invalid_status', enrollment_date: '2025-01-15' }); console.log('❌ ERRO: Matrícula criada com status inválido'); process.exit(1); } catch (error) { if (error.name === 'SequelizeValidationError' || error.message.includes('invalid input value for enum')) { console.log('✅ CORRETO: Validação impediu status inválido'); console.log('   Mensagem:', error.message); process.exit(0); } else { console.error('❌ Erro inesperado:', error.message); process.exit(1); } } })();"
```

**Esperado:**
- ✓ Erro de validação (SequelizeValidationError ou erro de ENUM do MySQL)
- ✓ Mensagem indica que status deve ser: pending, active ou cancelled
- ✓ Matrícula NÃO é criada

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6: Validação de enrollment_date (não pode ser futura)

**Input:** Tentar criar matrícula com data futura
**Método:**

```bash
node -e "const { Enrollment, User, Course } = require('./src/models'); (async () => { try { const student = await User.findOne({ where: { role: 'student' }, order: [['id', 'DESC']] }); const course = await Course.findOne(); const futureDate = new Date(); futureDate.setDate(futureDate.getDate() + 30); const futureDateStr = futureDate.toISOString().split('T')[0]; await Enrollment.create({ student_id: student.id, course_id: course.id, enrollment_date: futureDateStr }); console.log('❌ ERRO: Matrícula criada com data futura'); process.exit(1); } catch (error) { if (error.name === 'SequelizeValidationError' && error.message.includes('futur')) { console.log('✅ CORRETO: Validação impediu data futura'); console.log('   Mensagem:', error.message); process.exit(0); } else { console.error('❌ Erro inesperado:', error.name, error.message); process.exit(1); } } })();"
```

**Esperado:**
- ✓ Erro `SequelizeValidationError`
- ✓ Mensagem: "enrollment_date não pode ser no futuro"
- ✓ Matrícula NÃO é criada

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔗 TESTES DE INTEGRAÇÃO

### Teste 7: Integração com tabela users (alunos)

**Verificar:**
- ✓ Foreign key student_id funciona corretamente
- ✓ Associação `enrollment.getStudent()` retorna o aluno
- ✓ Associação reversa `student.getEnrollments()` retorna matrículas

**Como verificar:**
```bash
node -e "const { Enrollment, User } = require('./src/models'); (async () => { try { const enrollment = await Enrollment.findOne({ include: [{ association: 'student' }] }); if (!enrollment) { console.log('⚠️  Nenhuma matrícula encontrada. Crie uma primeiro.'); process.exit(0); } console.log('Matrícula ID:', enrollment.id); console.log('Aluno:', enrollment.student?.name || 'não carregado'); const student = await User.findOne({ where: { id: enrollment.student_id }, include: [{ association: 'enrollments' }] }); console.log('Aluno tem', student.enrollments.length, 'matrícula(s)'); process.exit(0); } catch (error) { console.error('❌ Erro:', error.message); process.exit(1); } })();"
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 8: Integração com tabela courses

**Verificar:**
- ✓ Foreign key course_id funciona corretamente
- ✓ Associação `enrollment.getCourse()` retorna o curso
- ✓ Associação reversa `course.getEnrollments()` retorna matrículas

**Como verificar:**
```bash
node -e "const { Enrollment, Course } = require('./src/models'); (async () => { try { const enrollment = await Enrollment.findOne({ include: [{ association: 'course' }] }); if (!enrollment) { console.log('⚠️  Nenhuma matrícula encontrada'); process.exit(0); } console.log('Matrícula ID:', enrollment.id); console.log('Curso:', enrollment.course?.name || 'não carregado'); const course = await Course.findOne({ where: { id: enrollment.course_id }, include: [{ association: 'enrollments' }] }); console.log('Curso tem', course.enrollments.length, 'matrícula(s)'); process.exit(0); } catch (error) { console.error('❌ Erro:', error.message); process.exit(1); } })();"
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 9: Testar constraint RESTRICT de foreign keys

**Cenário:** Tentar deletar um aluno que tem matrícula ativa

**Esperado:**
- ✓ Erro ao tentar deletar (foreign key com RESTRICT impede)
- ✓ Aluno NÃO é deletado
- ✓ Matrícula permanece intacta

**Como verificar:**
```bash
node -e "const { User, Enrollment } = require('./src/models'); (async () => { try { const student = await User.findOne({ where: { role: 'student' } }); if (!student) { console.log('⚠️  Nenhum aluno encontrado'); process.exit(0); } const enrollment = await Enrollment.create({ student_id: student.id, course_id: 1, status: 'active' }); console.log('Matrícula criada para aluno ID:', student.id); await student.destroy({ force: true }); console.log('❌ ERRO: Aluno deletado mesmo com matrícula ativa (RESTRICT não funcionou)'); process.exit(1); } catch (error) { if (error.name === 'SequelizeForeignKeyConstraintError') { console.log('✅ CORRETO: Foreign key RESTRICT impediu exclusão'); process.exit(0); } else { console.error('❌ Erro inesperado:', error.message); process.exit(1); } } })();"
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ⚡ TESTES DE MÉTODOS DE INSTÂNCIA

### Teste 10: Método activate()

**Objetivo:** Verificar se o método `activate()` muda o status de `pending` para `active`

**Como testar:**
```bash
node -e "const { Enrollment, User, Course } = require('./src/models'); (async () => { try { const student = await User.findOne({ where: { role: 'student' }, order: [['id', 'DESC']] }); const course = await Course.findOne(); const enrollment = await Enrollment.create({ student_id: student.id, course_id: course.id, status: 'pending' }); console.log('Status inicial:', enrollment.status); await enrollment.activate(); console.log('Status após activate():', enrollment.status); if (enrollment.status === 'active') { console.log('✅ Método activate() funcionou'); process.exit(0); } else { console.log('❌ Status não mudou para active'); process.exit(1); } } catch (error) { console.error('❌ Erro:', error.message); process.exit(1); } })();"
```

**Esperado:**
- ✓ Status muda de `pending` para `active`
- ✓ Log no console: `[Enrollment] Matrícula ID X ativada com sucesso`
- ✓ Mudança persistida no banco de dados

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 11: Método cancel()

**Objetivo:** Verificar se o método `cancel()` muda o status para `cancelled`

**Como testar:**
```bash
node -e "const { Enrollment, User, Course } = require('./src/models'); (async () => { try { const student = await User.findOne({ where: { role: 'student' }, order: [['id', 'DESC']] }); const course = await Course.findOne(); const enrollment = await Enrollment.create({ student_id: student.id, course_id: course.id, status: 'active' }); console.log('Status inicial:', enrollment.status); await enrollment.cancel(); console.log('Status após cancel():', enrollment.status); if (enrollment.status === 'cancelled') { console.log('✅ Método cancel() funcionou'); process.exit(0); } else { console.log('❌ Status não mudou para cancelled'); process.exit(1); } } catch (error) { console.error('❌ Erro:', error.message); process.exit(1); } })();"
```

**Esperado:**
- ✓ Status muda para `cancelled`
- ✓ Log no console: `[Enrollment] Matrícula ID X cancelada com sucesso`

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 12: Métodos de verificação de status (isActive, isPending, isCancelled)

**Como testar:**
```bash
node -e "const { Enrollment, User, Course } = require('./src/models'); (async () => { try { const student = await User.findOne({ where: { role: 'student' }, order: [['id', 'DESC']] }); const course = await Course.findOne(); const pending = await Enrollment.create({ student_id: student.id, course_id: course.id, status: 'pending' }); console.log('Pending - isActive:', pending.isActive(), 'isPending:', pending.isPending(), 'isCancelled:', pending.isCancelled()); const active = await Enrollment.create({ student_id: student.id + 1, course_id: course.id, status: 'active' }); console.log('Active - isActive:', active.isActive(), 'isPending:', active.isPending(), 'isCancelled:', active.isCancelled()); const cancelled = await Enrollment.create({ student_id: student.id + 2, course_id: course.id, status: 'cancelled' }); console.log('Cancelled - isActive:', cancelled.isActive(), 'isPending:', cancelled.isPending(), 'isCancelled:', cancelled.isCancelled()); process.exit(0); } catch (error) { console.error('❌ Erro:', error.message); process.exit(1); } })();"
```

**Esperado:**
- ✓ Pending: isPending() = true, outros = false
- ✓ Active: isActive() = true, outros = false
- ✓ Cancelled: isCancelled() = true, outros = false

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔎 TESTES DE MÉTODOS ESTÁTICOS

### Teste 13: Método findByStudent()

**Objetivo:** Verificar se o método retorna todas as matrículas de um aluno

**Como testar:**
```bash
node -e "const { Enrollment } = require('./src/models'); (async () => { try { const studentId = 1; const enrollments = await Enrollment.findByStudent(studentId, { withCourse: true }); console.log('Matrículas do aluno', studentId + ':', enrollments.length); enrollments.forEach(e => console.log('  - ID:', e.id, 'Curso:', e.course?.name, 'Status:', e.status)); process.exit(0); } catch (error) { console.error('❌ Erro:', error.message); process.exit(1); } })();"
```

**Esperado:**
- ✓ Retorna array com matrículas do aluno
- ✓ Com `withCourse: true`, inclui dados do curso
- ✓ Ordenado por enrollment_date DESC

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 14: Método findActiveByStudent()

**Objetivo:** Verificar se retorna apenas matrícula ativa/pending do aluno

**Como testar:**
```bash
node -e "const { Enrollment } = require('./src/models'); (async () => { try { const studentId = 1; const activeEnrollment = await Enrollment.findActiveByStudent(studentId); if (activeEnrollment) { console.log('✅ Matrícula ativa/pending encontrada - ID:', activeEnrollment.id, 'Status:', activeEnrollment.status); } else { console.log('⚠️  Nenhuma matrícula ativa/pending para este aluno'); } process.exit(0); } catch (error) { console.error('❌ Erro:', error.message); process.exit(1); } })();"
```

**Esperado:**
- ✓ Retorna matrícula com status `active` ou `pending`
- ✓ Retorna `null` se não houver matrícula ativa/pending
- ✓ Inclui dados do curso

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 15: Método countActiveByCourse()

**Objetivo:** Verificar contagem de matrículas ativas por curso

**Como testar:**
```bash
node -e "const { Enrollment } = require('./src/models'); (async () => { try { const courseId = 1; const count = await Enrollment.countActiveByCourse(courseId); console.log('Curso', courseId, 'tem', count, 'matrícula(s) ativa(s)'); process.exit(0); } catch (error) { console.error('❌ Erro:', error.message); process.exit(1); } })();"
```

**Esperado:**
- ✓ Retorna número correto de matrículas com status `active`
- ✓ Não conta matrículas `pending` ou `cancelled`
- ✓ Não conta matrículas soft-deleted

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🌐 TESTES DE SCOPES

### Teste 16: Scopes personalizados (active, pending, cancelled, recent)

**Como testar:**
```bash
node -e "const { Enrollment } = require('./src/models'); (async () => { try { const active = await Enrollment.scope('active').findAll(); console.log('Matrículas ativas:', active.length); const pending = await Enrollment.scope('pending').findAll(); console.log('Matrículas pendentes:', pending.length); const cancelled = await Enrollment.scope('cancelled').findAll(); console.log('Matrículas canceladas:', cancelled.length); const recent = await Enrollment.scope('recent').findAll(); console.log('Matrículas recentes (30 dias):', recent.length); process.exit(0); } catch (error) { console.error('❌ Erro:', error.message); process.exit(1); } })();"
```

**Esperado:**
- ✓ Scope `active` retorna apenas matrículas com status `active`
- ✓ Scope `pending` retorna apenas matrículas com status `pending`
- ✓ Scope `cancelled` retorna matrículas canceladas
- ✓ Scope `recent` retorna matrículas dos últimos 30 dias

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🗑️ TESTE DE SOFT DELETE

### Teste 17: Soft delete (paranoid)

**Objetivo:** Verificar que matrículas deletadas são mantidas no banco com deleted_at preenchido

**Como testar:**
```bash
node -e "const { Enrollment, User, Course } = require('./src/models'); (async () => { try { const student = await User.findOne({ where: { role: 'student' }, order: [['id', 'DESC']] }); const course = await Course.findOne(); const enrollment = await Enrollment.create({ student_id: student.id, course_id: course.id, status: 'cancelled' }); const id = enrollment.id; console.log('Matrícula criada - ID:', id); await enrollment.destroy(); console.log('Matrícula deletada (soft delete)'); const deleted = await Enrollment.findByPk(id); console.log('Busca normal (findByPk):', deleted ? 'encontrada' : 'não encontrada'); const withDeleted = await Enrollment.findByPk(id, { paranoid: false }); console.log('Busca com paranoid:false:', withDeleted ? 'encontrada' : 'não encontrada'); if (withDeleted && withDeleted.deleted_at) { console.log('✅ Soft delete funcionou - deleted_at:', withDeleted.deleted_at); } else { console.log('❌ Soft delete não funcionou corretamente'); } process.exit(0); } catch (error) { console.error('❌ Erro:', error.message); process.exit(1); } })();"
```

**Esperado:**
- ✓ `findByPk()` normal NÃO retorna matrícula deletada
- ✓ `findByPk(id, { paranoid: false })` RETORNA matrícula com `deleted_at` preenchido
- ✓ Registro permanece no banco de dados

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ✅ CHECKLIST FINAL

### Funcionalidade
- [ ] Todos os testes funcionais passaram
- [ ] Validações funcionam corretamente
- [ ] Integrações (User, Course) estão operacionais
- [ ] Métodos de instância funcionam (activate, cancel, isActive, etc)
- [ ] Métodos estáticos funcionam (findByStudent, findActiveByStudent, countActiveByCourse)
- [ ] Scopes retornam dados corretos
- [ ] Soft delete funciona

### Código
- [ ] Sem console.log desnecessários (apenas logs de hooks)
- [ ] Sem código comentado ou "TODO"
- [ ] Funções e métodos documentados
- [ ] Nomes de variáveis claros e descritivos
- [ ] Código segue padrões do projeto

### Segurança
- [ ] Validações impedem dados inválidos
- [ ] Foreign keys com RESTRICT impedem exclusões indevidas
- [ ] Índice único garante regra de negócio (1 matrícula ativa por aluno)

### Documentação
- [ ] README.md atualizado com tabela enrollments
- [ ] backlog.json atualizado com status "Em Andamento"
- [ ] Comentários inline explicam lógica complexa
- [ ] Migration e Model documentados no cabeçalho

### Performance
- [ ] Índices criados para student_id, course_id, status, enrollment_date
- [ ] Índice único composto para otimizar consultas e garantir unicidade
- [ ] Scopes utilizam queries otimizadas

---

## 🛠️ FERRAMENTAS RECOMENDADAS

### Banco de Dados
- **DBeaver** (interface gráfica universal) - https://dbeaver.io/
- **MySQL Workbench** (MySQL oficial) - https://www.mysql.com/products/workbench/
- **mysql command line** (incluído no MySQL)

### Node.js/Backend
- **Terminal/Command Line** - Para executar os comandos de teste
- **VS Code** - Editor recomendado com extensão MySQL
- **Postman** - Para testes futuros de API (quando controllers forem criados)

### Específicos para esta feature
- **Node.js REPL** - Para executar os scripts de teste (`node -e "..."`)
- **Sequelize CLI** - Para verificar status de migrations (`npx sequelize-cli db:migrate:status`)

---

## 📊 RESULTADO FINAL DOS TESTES

**Data de execução:** _[Preencher]_
**Executado por:** _[Preencher]_

### Resumo
- **Total de testes:** 17
- **Testes aprovados:** _[Preencher]_
- **Testes reprovados:** _[Preencher]_
- **Testes não executados:** _[Preencher]_

### Decisão
- [ ] **APROVADO** - Feature pronta para versionamento (`/versionamento-branch-push`)
- [ ] **REPROVADO** - Necessita ajustes (detalhar abaixo)

### Problemas Encontrados
_[Descrever problemas encontrados durante os testes]_

### Próximas Ações
_[Descrever ações necessárias se reprovado, ou próximos passos se aprovado]_

---

## 📝 NOTAS ADICIONAIS

**Regras de Negócio Importantes:**
1. Um aluno pode ter apenas UMA matrícula com status `active` ou `pending` por vez
2. Matrículas canceladas NÃO contam para a restrição acima (aluno pode criar nova matrícula)
3. Status padrão ao criar matrícula: `pending` (aguardando aprovação de documentos)
4. Status `active` só deve ser definido após aprovação de todos os documentos obrigatórios
5. Data de matrícula não pode ser no futuro

**Comandos Úteis:**
```bash
# Limpar todas as matrículas de teste
mysql -u root -p secretaria_online -e "TRUNCATE TABLE enrollments"

# Ver todas as matrículas
mysql -u root -p secretaria_online -e "SELECT id, student_id, course_id, status, enrollment_date, deleted_at FROM enrollments"

# Ver matrículas ativas agrupadas por aluno
mysql -u root -p secretaria_online -e "SELECT student_id, COUNT(*) as total FROM enrollments WHERE status IN ('active', 'pending') AND deleted_at IS NULL GROUP BY student_id"
```

**Dúvidas?**
- Consulte a documentação do Sequelize: https://sequelize.org/docs/v6/
- Revise o arquivo `backend/src/models/Enrollment.js` para entender a implementação
- Verifique a migration em `backend/database/migrations/20251026230800-create-enrollments.js`
