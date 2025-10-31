# PLANO DE TESTES - feat-039: Criar EnrollmentController e rotas

**Feature:** feat-039 - Criar EnrollmentController e rotas
**Grupo:** Grupo 7 - Backend - API de Matrículas
**Data de Criação:** 2025-10-30
**Status:** Aguardando Execução

---

## 📋 TESTE FUNCIONAL

### Teste 1: Criar Nova Matrícula (POST /enrollments)

**Objetivo:** Verificar se o endpoint POST cria uma matrícula com status 'pending' corretamente

**Pré-requisitos:**
- Backend rodando em http://localhost:3000
- Aluno (student) com ID 1 cadastrado no banco
- Curso (course) com ID 2 cadastrado no banco
- JWT token válido para autenticação

**Passos:**
1. Obter token JWT de autenticação (login como admin)
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"login": "admin", "password": "admin123"}'
   ```
   - Extrair o `access_token` da resposta

2. Criar nova matrícula
   ```bash
   curl -X POST http://localhost:3000/api/v1/enrollments \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -d '{
       "student_id": 1,
       "course_id": 2,
       "enrollment_date": "2025-10-30"
     }'
   ```

3. Validar a resposta

**Resultado Esperado:**
- ✓ HTTP Status: 201 Created
- ✓ Response contém `"success": true`
- ✓ Response contém `"message"` mencionando status "pending"
- ✓ Campo `data.status` = "pending"
- ✓ Campo `data.student_id` = 1
- ✓ Campo `data.course_id` = 2
- ✓ Campo `data.enrollment_date` = "2025-10-30"
- ✓ Campo `data.id` está presente (ID gerado)
- ✓ Campos `created_at` e `updated_at` estão presentes

**Como Verificar:**
- Resposta JSON valida a estrutura esperada
- Banco de dados contém nova matrícula com status 'pending'
  ```sql
  SELECT * FROM enrollments WHERE student_id = 1 AND course_id = 2;
  ```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Validar Erro ao Criar Matrícula com student_id Inválido

**Objetivo:** Verificar se o endpoint rejeita student_id não fornecido ou inválido

**Pré-requisitos:**
- Backend rodando
- JWT token válido

**Passos:**
1. Tentar criar matrícula sem student_id
   ```bash
   curl -X POST http://localhost:3000/api/v1/enrollments \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -d '{
       "course_id": 2,
       "enrollment_date": "2025-10-30"
     }'
   ```

2. Tentar criar matrícula com student_id = 0 (inválido)
   ```bash
   curl -X POST http://localhost:3000/api/v1/enrollments \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -d '{
       "student_id": 0,
       "course_id": 2
     }'
   ```

3. Tentar criar matrícula com student_id negativo
   ```bash
   curl -X POST http://localhost:3000/api/v1/enrollments \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -d '{
       "student_id": -1,
       "course_id": 2
     }'
   ```

**Resultado Esperado:**
- ✓ HTTP Status: 400 Bad Request
- ✓ Response contém `"success": false`
- ✓ Response contém detalhes do erro em `details[0].msg`
- ✓ Mensagem de erro menciona "student_id deve ser um inteiro positivo"

**Como Verificar:**
- Resposta JSON valida a estrutura de erro
- Nenhuma matrícula foi criada no banco

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Validar Erro ao Criar Matrícula com Aluno Inválido

**Objetivo:** Verificar se o AppError é lançado quando student_id não existe no banco

**Pré-requisitos:**
- Backend rodando
- JWT token válido
- ID 99999 não existe no banco de usuários

**Passos:**
1. Tentar criar matrícula com aluno que não existe
   ```bash
   curl -X POST http://localhost:3000/api/v1/enrollments \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -d '{
       "student_id": 99999,
       "course_id": 2
     }'
   ```

**Resultado Esperado:**
- ✓ HTTP Status: 404 Not Found
- ✓ Response contém `"success": false`
- ✓ Message contém "Aluno não encontrado"
- ✓ Nenhuma matrícula foi criada

**Como Verificar:**
- Resposta JSON é de erro apropriado
- Logs mostram tentativa rejeitada

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 4: Validar Erro ao Matricular Aluno em Dois Cursos

**Objetivo:** Verificar se regra de negócio impede aluno de ter matrícula ativa/pendente em dois cursos

**Pré-requisitos:**
- Backend rodando
- JWT token válido
- Aluno com ID 1 já matriculado em curso 2 com status 'pending'
- Curso com ID 3 existe no banco

**Passos:**
1. Verificar se aluno já tem matrícula
   ```sql
   SELECT * FROM enrollments WHERE student_id = 1 AND status IN ('pending', 'active') AND deleted_at IS NULL;
   ```

2. Tentar matricular o mesmo aluno em outro curso
   ```bash
   curl -X POST http://localhost:3000/api/v1/enrollments \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -d '{
       "student_id": 1,
       "course_id": 3
     }'
   ```

**Resultado Esperado:**
- ✓ HTTP Status: 422 Unprocessable Entity
- ✓ Response contém `"success": false`
- ✓ Message menciona "Aluno já possui uma matrícula"
- ✓ Nenhuma nova matrícula foi criada

**Como Verificar:**
- Banco continua com apenas uma matrícula ativa/pendente para o aluno
- Logs mostram validação realizada

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5: Listar Todas as Matrículas (GET /enrollments)

**Objetivo:** Verificar se endpoint retorna lista completa de matrículas (admin only)

**Pré-requisitos:**
- Backend rodando
- JWT token de admin
- Pelo menos 2 matrículas no banco

**Passos:**
1. Listar todas as matrículas
   ```bash
   curl -X GET http://localhost:3000/api/v1/enrollments \
     -H "Authorization: Bearer SEU_TOKEN_ADMIN_AQUI"
   ```

2. Validar resposta

**Resultado Esperado:**
- ✓ HTTP Status: 200 OK
- ✓ Response contém `"success": true`
- ✓ `data` é um array
- ✓ Cada item contém `id`, `student_id`, `course_id`, `status`, `enrollment_date`
- ✓ Cada item inclui objeto `student` com `id`, `name`, `email`, `cpf`
- ✓ Cada item inclui objeto `course` com `id`, `name`, `duration_semesters`
- ✓ Array está ordenado por `enrollment_date` DESC

**Como Verificar:**
- JSON é válido e estruturado corretamente
- Quantidade de items corresponde ao esperado
- Informações de aluno e curso estão presentes

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6: Validar Erro ao Listar Matrículas Sem Admin

**Objetivo:** Verificar se endpoint nega acesso a não-administradores

**Pré-requisitos:**
- Backend rodando
- JWT token de student (não-admin)

**Passos:**
1. Tentar listar matrículas como student
   ```bash
   curl -X GET http://localhost:3000/api/v1/enrollments \
     -H "Authorization: Bearer SEU_TOKEN_STUDENT_AQUI"
   ```

**Resultado Esperado:**
- ✓ HTTP Status: 403 Forbidden
- ✓ Response contém erro de autorização
- ✓ Dados não são retornados

**Como Verificar:**
- Resposta JSON é de erro apropriado
- Logs mostram negação de acesso

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 7: Buscar Matrícula por ID (GET /enrollments/:id)

**Objetivo:** Verificar se endpoint retorna matrícula específica com detalhes

**Pré-requisitos:**
- Backend rodando
- JWT token válido
- Matrícula com ID 1 existe no banco

**Passos:**
1. Buscar matrícula por ID
   ```bash
   curl -X GET http://localhost:3000/api/v1/enrollments/1 \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

2. Validar resposta

**Resultado Esperado:**
- ✓ HTTP Status: 200 OK
- ✓ Response contém `"success": true`
- ✓ `data` contém matrícula completa
- ✓ `data.student` está presente com informações do aluno
- ✓ `data.course` está presente com informações do curso
- ✓ Todos os campos estão preenchidos corretamente

**Como Verificar:**
- JSON é válido
- Informações correspondem ao banco de dados

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 8: Validar Erro ao Buscar Matrícula Inexistente

**Objetivo:** Verificar se endpoint retorna 404 para matrícula não encontrada

**Pré-requisitos:**
- Backend rodando
- JWT token válido
- ID 99999 não existe no banco

**Passos:**
1. Buscar matrícula que não existe
   ```bash
   curl -X GET http://localhost:3000/api/v1/enrollments/99999 \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

**Resultado Esperado:**
- ✓ HTTP Status: 404 Not Found
- ✓ Response contém `"success": false`
- ✓ Message menciona "Matrícula não encontrada"

**Como Verificar:**
- Resposta JSON é de erro apropriado

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 9: Listar Matrículas de um Aluno (GET /students/:studentId/enrollments)

**Objetivo:** Verificar se endpoint retorna apenas matrículas do aluno especificado

**Pré-requisitos:**
- Backend rodando
- JWT token válido
- Aluno com ID 1 tem pelo menos 1 matrícula

**Passos:**
1. Listar matrículas do aluno 1
   ```bash
   curl -X GET http://localhost:3000/api/v1/students/1/enrollments \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

2. Validar resposta

**Resultado Esperado:**
- ✓ HTTP Status: 200 OK
- ✓ Response contém `"success": true`
- ✓ `data` é um array
- ✓ Todos os items têm `student_id = 1`
- ✓ Cada item inclui informações do curso
- ✓ Array não contém matrículas de outros alunos

**Como Verificar:**
- JSON é válido
- Todos os registros pertencem ao aluno 1
- Informações do curso estão presentes

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 10: Alterar Status de Matrícula para Active (PUT /enrollments/:id/status)

**Objetivo:** Verificar se admin pode alterar status de pending para active com validação de documentos

**Pré-requisitos:**
- Backend rodando
- JWT token de admin
- Matrícula com ID 1 existe com status 'pending'
- Aluno dessa matrícula tem todos os documentos aprovados

**Passos:**
1. Verificar documentos do aluno estão aprovados
   ```bash
   # Ou verificar no banco
   SELECT * FROM documents WHERE user_id = (SELECT student_id FROM enrollments WHERE id = 1) AND status = 'approved';
   ```

2. Alterar status para active
   ```bash
   curl -X PUT http://localhost:3000/api/v1/enrollments/1/status \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_ADMIN_AQUI" \
     -d '{
       "status": "active"
     }'
   ```

3. Validar resposta

**Resultado Esperado:**
- ✓ HTTP Status: 200 OK
- ✓ Response contém `"success": true`
- ✓ Message menciona "Status da matrícula alterado para 'active'"
- ✓ `data.status = "active"`
- ✓ Matrícula no banco tem status atualizado

**Como Verificar:**
- JSON é válido
- Banco reflete a mudança: `SELECT status FROM enrollments WHERE id = 1;`

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 11: Validar Erro ao Ativar Matrícula Sem Documentos Aprovados

**Objetivo:** Verificar se ativação falha quando documentos obrigatórios não estão aprovados

**Pré-requisitos:**
- Backend rodando
- JWT token de admin
- Matrícula com ID 2 existe com status 'pending'
- Aluno dessa matrícula tem documentos pendentes/rejeitados

**Passos:**
1. Verificar documentos do aluno não estão todos aprovados
   ```sql
   SELECT * FROM documents
   WHERE user_id = (SELECT student_id FROM enrollments WHERE id = 2)
   AND status != 'approved';
   ```

2. Tentar alterar status para active
   ```bash
   curl -X PUT http://localhost:3000/api/v1/enrollments/2/status \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_ADMIN_AQUI" \
     -d '{
       "status": "active"
     }'
   ```

**Resultado Esperado:**
- ✓ HTTP Status: 422 Unprocessable Entity
- ✓ Response contém `"success": false`
- ✓ Message menciona "Não é possível ativar matrícula"
- ✓ Message menciona "documentos obrigatórios"
- ✓ Status no banco continua 'pending'

**Como Verificar:**
- Resposta JSON é de erro apropriado
- Banco continua com status 'pending'

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 12: Alterar Status de Matrícula para Cancelled

**Objetivo:** Verificar se status pode ser alterado para cancelled

**Pré-requisitos:**
- Backend rodando
- JWT token de admin
- Matrícula com ID 1 existe (status: pending ou active)

**Passos:**
1. Alterar status para cancelled
   ```bash
   curl -X PUT http://localhost:3000/api/v1/enrollments/1/status \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_ADMIN_AQUI" \
     -d '{
       "status": "cancelled"
     }'
   ```

2. Validar resposta

**Resultado Esperado:**
- ✓ HTTP Status: 200 OK
- ✓ Response contém `"success": true`
- ✓ `data.status = "cancelled"`
- ✓ Banco reflete a mudança

**Como Verificar:**
- JSON é válido
- Banco: `SELECT status FROM enrollments WHERE id = 1;` retorna 'cancelled'

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 13: Validar Erro ao Usar Status Inválido

**Objetivo:** Verificar se endpoint rejeita valores de status inválidos

**Pré-requisitos:**
- Backend rodando
- JWT token de admin
- Matrícula com ID 1 existe

**Passos:**
1. Tentar alterar para status inválido
   ```bash
   curl -X PUT http://localhost:3000/api/v1/enrollments/1/status \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_ADMIN_AQUI" \
     -d '{
       "status": "invalid_status"
     }'
   ```

**Resultado Esperado:**
- ✓ HTTP Status: 400 Bad Request
- ✓ Response contém erro de validação
- ✓ Message menciona "status deve ser"

**Como Verificar:**
- Resposta JSON é de erro apropriado

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 14: Validar Erro ao Alterar Status Sem Admin

**Objetivo:** Verificar se apenas admin pode alterar status

**Pré-requisitos:**
- Backend rodando
- JWT token de student
- Matrícula existe

**Passos:**
1. Tentar alterar status como student
   ```bash
   curl -X PUT http://localhost:3000/api/v1/enrollments/1/status \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_STUDENT_AQUI" \
     -d '{
       "status": "active"
     }'
   ```

**Resultado Esperado:**
- ✓ HTTP Status: 403 Forbidden
- ✓ Response contém erro de autorização

**Como Verificar:**
- Resposta JSON é de erro apropriado

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 15: Deletar Matrícula (DELETE /enrollments/:id)

**Objetivo:** Verificar se matrícula é soft-deletada corretamente

**Pré-requisitos:**
- Backend rodando
- JWT token de admin
- Matrícula com ID 1 existe

**Passos:**
1. Deletar matrícula
   ```bash
   curl -X DELETE http://localhost:3000/api/v1/enrollments/1 \
     -H "Authorization: Bearer SEU_TOKEN_ADMIN_AQUI"
   ```

2. Verificar resposta

3. Tentar buscar matrícula deletada
   ```bash
   curl -X GET http://localhost:3000/api/v1/enrollments/1 \
     -H "Authorization: Bearer SEU_TOKEN_ADMIN_AQUI"
   ```

**Resultado Esperado:**
- ✓ HTTP Status: 204 No Content (para DELETE)
- ✓ GET subsequente retorna 404
- ✓ Banco: `SELECT * FROM enrollments WHERE id = 1;` retorna NULL (soft delete)
- ✓ Banco: `SELECT * FROM enrollments WHERE id = 1 AND deleted_at IS NOT NULL;` retorna o registro

**Como Verificar:**
- DELETE retorna status correto
- GET subsequente falha apropriadamente
- Banco contém registro com deleted_at preenchido

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 16: Validar Erro ao Deletar Sem Admin

**Objetivo:** Verificar se apenas admin pode deletar matrículas

**Pré-requisitos:**
- Backend rodando
- JWT token de student
- Matrícula existe

**Passos:**
1. Tentar deletar como student
   ```bash
   curl -X DELETE http://localhost:3000/api/v1/enrollments/1 \
     -H "Authorization: Bearer SEU_TOKEN_STUDENT_AQUI"
   ```

**Resultado Esperado:**
- ✓ HTTP Status: 403 Forbidden
- ✓ Matrícula não foi deletada

**Como Verificar:**
- Resposta JSON é de erro apropriado
- Matrícula ainda existe no banco

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 17: Validar Autenticação (Sem Token JWT)

**Objetivo:** Verificar se endpoints requerem autenticação

**Pré-requisitos:**
- Backend rodando

**Passos:**
1. Tentar acessar endpoint sem token
   ```bash
   curl -X GET http://localhost:3000/api/v1/enrollments
   ```

2. Tentar criar matrícula sem token
   ```bash
   curl -X POST http://localhost:3000/api/v1/enrollments \
     -H "Content-Type: application/json" \
     -d '{"student_id": 1, "course_id": 2}'
   ```

**Resultado Esperado:**
- ✓ HTTP Status: 401 Unauthorized
- ✓ Response contém erro de autenticação
- ✓ Mensagem menciona token inválido ou ausente

**Como Verificar:**
- Resposta JSON é de erro apropriado

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 18: Validar Logging de Operações

**Objetivo:** Verificar se operações são logadas corretamente para auditoria

**Pré-requisitos:**
- Backend rodando
- Arquivo de log existente em `backend/logs/`
- Uma matrícula foi criada/alterada/deletada

**Passos:**
1. Verificar logs após criar matrícula
   ```bash
   tail -f backend/logs/combined.log
   # Ou
   grep "Criando matrícula\|matrícula criada" backend/logs/combined.log
   ```

2. Verificar logs após alterar status
   ```bash
   grep "Atualizando status\|Status atualizado" backend/logs/combined.log
   ```

**Resultado Esperado:**
- ✓ Logs contêm entrada de criação de matrícula
- ✓ Logs contêm entry de alteração de status
- ✓ Logs incluem IDs relevantes (enrollment_id, student_id, etc.)
- ✓ Timestamps estão presentes
- ✓ Níveis de log apropriados (info, warn, error)

**Como Verificar:**
- Arquivo de log contém entradas esperadas
- Informações são completas e estruturadas

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 19: Validar Comportamento com Campos Opcionais

**Objetivo:** Verificar que enrollment_date é opcional e usa data padrão

**Pré-requisitos:**
- Backend rodando
- JWT token válido

**Passos:**
1. Criar matrícula sem enrollment_date
   ```bash
   curl -X POST http://localhost:3000/api/v1/enrollments \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -d '{
       "student_id": 2,
       "course_id": 3
     }'
   ```

2. Validar resposta

**Resultado Esperado:**
- ✓ HTTP Status: 201 Created
- ✓ `data.enrollment_date` está preenchido com data atual (ou padrão)
- ✓ Matrícula foi criada com sucesso

**Como Verificar:**
- JSON é válido
- enrollment_date está presente e é válido

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 20: Validar Integridade de Dados (Relationships)

**Objetivo:** Verificar se informações de aluno e curso são carregadas corretamente

**Pré-requisitos:**
- Backend rodando
- JWT token válido
- Matrícula com ID 1 existe com student_id=1 e course_id=2

**Passos:**
1. Buscar matrícula com detalhes
   ```bash
   curl -X GET http://localhost:3000/api/v1/enrollments/1 \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" | jq '.data.student, .data.course'
   ```

2. Comparar com dados no banco
   ```sql
   SELECT u.name, u.email, u.cpf FROM users u WHERE u.id = 1;
   SELECT c.name, c.duration_semesters FROM courses c WHERE c.id = 2;
   ```

**Resultado Esperado:**
- ✓ `data.student.id` = 1
- ✓ `data.student.name` corresponde ao banco
- ✓ `data.student.email` corresponde ao banco
- ✓ `data.course.id` = 2
- ✓ `data.course.name` corresponde ao banco
- ✓ `data.course.duration_semesters` corresponde ao banco

**Como Verificar:**
- Dados no JSON correspondem aos do banco de dados

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📊 RESUMO DOS TESTES

| Teste | Descrição | Status |
|-------|-----------|--------|
| 1 | Criar nova matrícula | [ ] |
| 2 | Erro: student_id inválido | [ ] |
| 3 | Erro: aluno não existe | [ ] |
| 4 | Erro: aluno em dois cursos | [ ] |
| 5 | Listar todas as matrículas | [ ] |
| 6 | Erro: listar sem admin | [ ] |
| 7 | Buscar matrícula por ID | [ ] |
| 8 | Erro: matrícula inexistente | [ ] |
| 9 | Listar matrículas do aluno | [ ] |
| 10 | Alterar status para active | [ ] |
| 11 | Erro: ativar sem documentos | [ ] |
| 12 | Alterar status para cancelled | [ ] |
| 13 | Erro: status inválido | [ ] |
| 14 | Erro: alterar status sem admin | [ ] |
| 15 | Deletar matrícula | [ ] |
| 16 | Erro: deletar sem admin | [ ] |
| 17 | Validar autenticação | [ ] |
| 18 | Validar logging | [ ] |
| 19 | Campos opcionais | [ ] |
| 20 | Integridade de dados | [ ] |

---

**Total de Testes:** 20
**Testes Passados:** ___
**Testes Falhados:** ___
**Taxa de Sucesso:** ____%

---

## 🔍 NOTAS IMPORTANTES

1. **Sequência de Testes:** Execute-os na ordem apresentada para evitar dependências
2. **Dados Iniciais:** Certifique-se de ter alunos, cursos e documentos configurados no banco antes de iniciar
3. **Documentos Obrigatórios:** O teste 11 requer que documentos obrigatórios estejam cadastrados via seeder
4. **Logs:** Verifique os logs em tempo real para entender o fluxo de execução
5. **Banco de Dados:** Use `npm run db:reset` antes dos testes para estado limpo

---

**Data de Atualização:** 2025-10-30
**Versão do Plano:** 1.0
