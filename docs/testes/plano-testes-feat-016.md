# PLANO DE TESTES - feat-016: Criar seeders de dados iniciais

**Feature:** feat-016 - Criar seeders de dados iniciais
**Grupo:** Banco de Dados e Modelos
**Data de criação:** 2025-10-27
**Status:** Aguardando execução

---

## 🔧 PREPARAÇÃO DO AMBIENTE

### Pré-requisitos

Certifique-se que o ambiente está configurado:

```bash
# 1. Acesse a pasta do backend
cd backend

# 2. Certifique-se que as migrations foram executadas
npm run db:migrate

# 3. (Opcional) Limpar seeders anteriores se necessário
npm run db:seed:undo:all

# 4. Verificar conexão com banco de dados
node src/config/test-connection.js
```

**Esperado:** Mensagem "✓ SUCESSO: Conexão estabelecida com sucesso!"

---

## 📋 TESTE FUNCIONAL 01 - SEEDER DE USUÁRIO ADMIN

### Objetivo
Verificar se o seeder cria corretamente o usuário administrativo inicial do sistema

### Passos
1. Limpar usuários admin existentes (se houver):
   ```bash
   # Acesse o MySQL
   mysql -u root -p secretaria_online

   # Execute
   DELETE FROM users WHERE role = 'admin' AND login = 'admin';
   EXIT;
   ```

2. Executar o seeder:
   ```bash
   npx sequelize-cli db:seed --seed 20251027211219-admin-user.js
   ```

3. Verificar no banco de dados:
   ```bash
   mysql -u root -p secretaria_online -e "SELECT id, role, name, email, login, cpf, created_at FROM users WHERE role = 'admin';"
   ```

### Resultado Esperado
- ✓ Mensagem de sucesso no console:
  ```
  ✅ Usuário admin criado com sucesso!
     Login: admin
     Senha: admin123
     ⚠️  IMPORTANTE: Altere a senha no primeiro acesso!
  ```
- ✓ Query retorna 1 registro com os dados:
  - role: `admin`
  - name: `Administrador do Sistema`
  - email: `admin@secretariaonline.com`
  - login: `admin`
  - cpf: `00000000000`
- ✓ Campo `password_hash` está preenchido (NÃO exibe a senha em texto puro)
- ✓ Campos `created_at` e `updated_at` estão preenchidos
- ✓ Campo `deleted_at` está NULL

### Como verificar hash da senha
```bash
# Criar arquivo de teste temporário
cat > backend/test-password.js << 'EOF'
const bcrypt = require('bcryptjs');

async function testPassword() {
  const result = await bcrypt.compare('admin123', 'COLE_AQUI_O_HASH_DO_BANCO');
  console.log('Senha "admin123" corresponde ao hash?', result);
}

testPassword();
EOF

node backend/test-password.js
```

**Esperado:** `Senha "admin123" corresponde ao hash? true`

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE FUNCIONAL 02 - SEEDER DE TIPOS DE DOCUMENTOS

### Objetivo
Verificar se o seeder cria corretamente os 19 tipos de documentos padrão

### Passos
1. Limpar tipos de documentos existentes (se houver):
   ```bash
   mysql -u root -p secretaria_online -e "DELETE FROM document_types;"
   ```

2. Executar o seeder:
   ```bash
   npx sequelize-cli db:seed --seed 20251027211322-document-types.js
   ```

3. Verificar no banco de dados:
   ```bash
   mysql -u root -p secretaria_online -e "
   SELECT user_type, COUNT(*) as total,
          SUM(is_required) as obrigatorios,
          SUM(NOT is_required) as opcionais
   FROM document_types
   GROUP BY user_type;"
   ```

### Resultado Esperado
- ✓ Mensagem de sucesso no console:
  ```
  ✅ 19 tipos de documentos criados com sucesso!
     - 9 para alunos
     - 8 para professores
     - 1 para ambos
  ```
- ✓ Query retorna:
  - `student`: 9 total (6 obrigatórios, 3 opcionais)
  - `teacher`: 8 total (5 obrigatórios, 3 opcionais)
  - `both`: 1 total (0 obrigatórios, 1 opcional)

### Verificação Detalhada
```bash
# Listar todos os tipos criados
mysql -u root -p secretaria_online -e "
SELECT name, user_type, is_required
FROM document_types
ORDER BY user_type, is_required DESC, name;"
```

**Esperado:**
- ✓ Documentos obrigatórios para alunos: RG, CPF, Comprovante de Residência, Foto 3x4, Certificado Ensino Médio, Histórico Ensino Médio
- ✓ Documentos obrigatórios para professores: RG, CPF, Comprovante de Residência, Foto 3x4, Diploma de Graduação
- ✓ Documentos opcionais: Certidão, Título de Eleitor, Reservista, Pós-Graduação, Lattes, Atestado Médico

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE FUNCIONAL 03 - SEEDER DE TIPOS DE SOLICITAÇÕES

### Objetivo
Verificar se o seeder cria corretamente os 10 tipos de solicitações padrão

### Passos
1. Limpar tipos de solicitações existentes (se houver):
   ```bash
   mysql -u root -p secretaria_online -e "DELETE FROM request_types;"
   ```

2. Executar o seeder:
   ```bash
   npx sequelize-cli db:seed --seed 20251027211442-request-types.js
   ```

3. Verificar no banco de dados:
   ```bash
   mysql -u root -p secretaria_online -e "
   SELECT name, response_deadline_days, is_active
   FROM request_types
   ORDER BY response_deadline_days, name;"
   ```

### Resultado Esperado
- ✓ Mensagem de sucesso no console:
  ```
  ✅ 10 tipos de solicitações criados com sucesso!
     Tipos disponíveis:
     1. Pedido de Atestado de Matrícula (prazo: 3 dias úteis)
     2. Histórico Escolar (prazo: 5 dias úteis)
     ...
  ```
- ✓ Query retorna 10 registros
- ✓ Todos os registros têm `is_active = 1`
- ✓ Prazos configurados corretamente:
  - 3 dias: Atestado de Matrícula, Declaração de Frequência
  - 5 dias: Histórico Escolar, Transferência, Cancelamento, Trancamento, Reabertura
  - 7 dias: Atividades Complementares
  - 10 dias: Certificado
  - 15 dias: Segunda Via de Diploma

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE FUNCIONAL 04 - SEEDER DE CURSOS E DISCIPLINAS

### Objetivo
Verificar se o seeder cria corretamente cursos, disciplinas e suas associações

### Passos
1. Limpar dados existentes (se houver):
   ```bash
   mysql -u root -p secretaria_online << 'EOF'
   USE secretaria_online;
   DELETE FROM course_disciplines;
   DELETE FROM disciplines;
   DELETE FROM courses;
   EOF
   ```

2. Executar o seeder:
   ```bash
   npx sequelize-cli db:seed --seed 20251027211530-sample-courses-and-disciplines.js
   ```

3. Verificar cursos criados:
   ```bash
   mysql -u root -p secretaria_online -e "
   SELECT id, name, duration_semesters
   FROM courses
   ORDER BY id;"
   ```

4. Verificar disciplinas criadas:
   ```bash
   mysql -u root -p secretaria_online -e "
   SELECT COUNT(*) as total_disciplinas FROM disciplines;"
   ```

5. Verificar associações:
   ```bash
   mysql -u root -p secretaria_online -e "
   SELECT c.name as curso, COUNT(cd.id) as total_disciplinas
   FROM courses c
   LEFT JOIN course_disciplines cd ON c.id = cd.course_id
   GROUP BY c.id
   ORDER BY c.id;"
   ```

### Resultado Esperado
- ✓ Mensagem de sucesso no console:
  ```
  ✅ 3 cursos criados.
  ✅ 28 disciplinas criadas.
  ✅ 40 associações curso-disciplina criadas.

  📚 RESUMO DOS CURSOS CRIADOS:
     1. Análise e Desenvolvimento de Sistemas (14 disciplinas)
     2. Gestão de Recursos Humanos (9 disciplinas)
     3. Administração (13 disciplinas)
  ```
- ✓ Query 1 retorna 3 cursos:
  - Análise e Desenvolvimento de Sistemas (6 semestres)
  - Gestão de Recursos Humanos (4 semestres)
  - Administração (8 semestres)
- ✓ Query 2 retorna `total_disciplinas = 28`
- ✓ Query 3 retorna:
  - ADS: 14 disciplinas
  - RH: 9 disciplinas
  - Administração: 13 disciplinas

### Verificação de Disciplinas por Semestre
```bash
# Exemplo: Ver disciplinas do curso ADS organizadas por semestre
mysql -u root -p secretaria_online -e "
SELECT cd.semester, d.name, d.code, d.workload_hours
FROM course_disciplines cd
JOIN disciplines d ON cd.discipline_id = d.id
JOIN courses c ON cd.course_id = c.id
WHERE c.name = 'Análise e Desenvolvimento de Sistemas'
ORDER BY cd.semester, d.name;"
```

**Esperado:**
- ✓ Disciplinas organizadas do semestre 1 ao 6
- ✓ Códigos de disciplinas únicos (não duplicados)
- ✓ Carga horária entre 40 e 80 horas

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE DE INTEGRAÇÃO 01 - IDEMPOTÊNCIA DOS SEEDERS

### Objetivo
Verificar se os seeders podem ser executados múltiplas vezes sem duplicar dados

### Passos
1. Executar todos os seeders pela primeira vez:
   ```bash
   npm run db:seed
   ```

2. Contar registros criados:
   ```bash
   mysql -u root -p secretaria_online << 'EOF'
   SELECT 'users' as tabela, COUNT(*) as total FROM users WHERE role = 'admin'
   UNION ALL
   SELECT 'document_types', COUNT(*) FROM document_types
   UNION ALL
   SELECT 'request_types', COUNT(*) FROM request_types
   UNION ALL
   SELECT 'courses', COUNT(*) FROM courses
   UNION ALL
   SELECT 'disciplines', COUNT(*) FROM disciplines
   UNION ALL
   SELECT 'course_disciplines', COUNT(*) FROM course_disciplines;
   EOF
   ```

3. Executar os seeders novamente (segunda vez):
   ```bash
   npm run db:seed
   ```

4. Contar registros novamente (repetir query do passo 2)

### Resultado Esperado
- ✓ Primeira execução:
  - users (admin): 1
  - document_types: 19
  - request_types: 10
  - courses: 3
  - disciplines: 28
  - course_disciplines: 40

- ✓ Segunda execução mostra mensagens de "já existe":
  ```
  ⚠️  Usuário admin já existe. Seeder ignorado.
  ⚠️  Tipos de documentos já existem. Seeder ignorado.
  ⚠️  Tipos de solicitações já existem. Seeder ignorado.
  ⚠️  Cursos já existem. Seeder ignorado.
  ```

- ✓ Contagem de registros PERMANECE IDÊNTICA (sem duplicação):
  - users (admin): 1
  - document_types: 19
  - request_types: 10
  - courses: 3
  - disciplines: 28
  - course_disciplines: 40

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE DE INTEGRAÇÃO 02 - RESET COMPLETO DO BANCO

### Objetivo
Verificar se o comando `npm run db:reset` funciona corretamente

### Passos
1. Executar reset do banco:
   ```bash
   npm run db:reset
   ```

2. Verificar se tabelas foram criadas:
   ```bash
   mysql -u root -p secretaria_online -e "SHOW TABLES;"
   ```

3. Verificar se seeders foram executados:
   ```bash
   mysql -u root -p secretaria_online -e "
   SELECT 'Admin criado' as status FROM users WHERE role = 'admin' LIMIT 1
   UNION ALL
   SELECT CONCAT(COUNT(*), ' tipos de documentos') FROM document_types
   UNION ALL
   SELECT CONCAT(COUNT(*), ' tipos de solicitações') FROM request_types
   UNION ALL
   SELECT CONCAT(COUNT(*), ' cursos') FROM courses;"
   ```

### Resultado Esperado
- ✓ Comando executa sem erros
- ✓ Console mostra:
  - Desfazendo migrations antigas
  - Executando migrations
  - Executando seeders
- ✓ Query 1 retorna ~15 tabelas (users, courses, disciplines, etc.)
- ✓ Query 2 confirma dados inseridos:
  - Admin criado
  - 19 tipos de documentos
  - 10 tipos de solicitações
  - 3 cursos

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE DE VALIDAÇÃO 01 - VERIFICAR CONSTRAINTS

### Objetivo
Verificar se as foreign keys e constraints estão funcionando corretamente

### Passos
1. Tentar criar uma associação curso-disciplina com IDs inválidos:
   ```bash
   mysql -u root -p secretaria_online -e "
   INSERT INTO course_disciplines (course_id, discipline_id, semester, created_at, updated_at)
   VALUES (9999, 9999, 1, NOW(), NOW());"
   ```

### Resultado Esperado
- ✓ Erro de constraint:
  ```
  ERROR 1452 (23000): Cannot add or update a child row:
  a foreign key constraint fails
  ```
- ✓ Registro NÃO é inserido no banco

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE DE VALIDAÇÃO 02 - VERIFICAR ÍNDICES ÚNICOS

### Objetivo
Verificar se não é possível duplicar associações curso-disciplina para o mesmo semestre

### Passos
1. Buscar uma associação existente:
   ```bash
   mysql -u root -p secretaria_online -e "
   SELECT course_id, discipline_id, semester
   FROM course_disciplines
   LIMIT 1;"
   ```

2. Tentar inserir duplicata (usar valores da query acima):
   ```bash
   mysql -u root -p secretaria_online -e "
   INSERT INTO course_disciplines (course_id, discipline_id, semester, created_at, updated_at)
   VALUES ([course_id], [discipline_id], [semester], NOW(), NOW());"
   ```

### Resultado Esperado
- ✓ Erro de constraint unique:
  ```
  ERROR 1062 (23000): Duplicate entry 'X-Y-Z' for key
  'course_disciplines.course_discipline_semester_unique'
  ```
- ✓ Registro duplicado NÃO é inserido

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🛠️ FERRAMENTAS RECOMENDADAS

### Cliente MySQL
- **MySQL Workbench** (GUI) - https://dev.mysql.com/downloads/workbench/
- **DBeaver** (GUI multiplataforma) - https://dbeaver.io/
- **mysql** (CLI) - cliente de linha de comando padrão

### Comandos úteis de verificação

```bash
# Ver estrutura de uma tabela
mysql -u root -p secretaria_online -e "DESCRIBE users;"

# Ver índices de uma tabela
mysql -u root -p secretaria_online -e "SHOW INDEX FROM course_disciplines;"

# Contar registros em todas as tabelas
mysql -u root -p secretaria_online << 'EOF'
SELECT 'users', COUNT(*) FROM users
UNION SELECT 'courses', COUNT(*) FROM courses
UNION SELECT 'disciplines', COUNT(*) FROM disciplines
UNION SELECT 'document_types', COUNT(*) FROM document_types
UNION SELECT 'request_types', COUNT(*) FROM request_types;
EOF
```

---

## ✅ CHECKLIST FINAL

Antes de marcar a feature como concluída, certifique-se de que:

- [ ] Todos os 4 seeders executam sem erros
- [ ] Usuário admin foi criado com senha hash correta
- [ ] 19 tipos de documentos foram criados (9 alunos, 8 professores, 1 ambos)
- [ ] 10 tipos de solicitações foram criados com prazos corretos
- [ ] 3 cursos, 28 disciplinas e 40 associações foram criadas
- [ ] Seeders são idempotentes (podem ser executados múltiplas vezes)
- [ ] `npm run db:reset` funciona corretamente
- [ ] Foreign keys e constraints estão funcionando
- [ ] README.md foi atualizado com documentação dos seeders
- [ ] backlog.json foi atualizado com status "Em Andamento"

---

## 📝 OBSERVAÇÕES

**Atenção:**
- Execute os testes em um banco de dados de **desenvolvimento/teste**, nunca em produção
- Guarde os outputs dos comandos para documentação
- Em caso de falha, anote a mensagem de erro completa
- Após aprovação nos testes, a feature pode ser marcada como "Concluída" no backlog

**Próximos passos após aprovação:**
1. Executar `/versionamento-branch-push` para commitar e fazer push
2. Prosseguir para próxima feature do backlog
