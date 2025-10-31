# PLANO DE TESTES - feat-040: Adicionar endpoint para listar matrículas por aluno

**Feature:** feat-040 - Adicionar endpoint para listar matrículas por aluno
**Grupo:** grupo-7 - Backend - API de Matrículas
**Data de criação:** 2025-10-30
**Status:** Aguardando execução

---

## 📋 RESUMO DA FEATURE

**Descrição:** Implementar GET /students/:id/enrollments retornando todas as matrículas do aluno com dados do curso

**Dependências Concluídas:**
- ✅ feat-039: Criar EnrollmentController e rotas
- ✅ feat-038: Criar EnrollmentService com regras de negócio

**Endpoint Implementado:**
```
GET /api/v1/students/:studentId/enrollments
```

**Resposta Esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "student_id": 1,
      "course_id": 2,
      "status": "pending",
      "enrollment_date": "2025-10-30",
      "course": {
        "id": 2,
        "name": "Engenharia de Software",
        "duration_semesters": 4
      }
    }
  ]
}
```

---

## 🧪 TESTES FUNCIONAIS

### Teste 1: Listar matrículas - Aluno com uma matrícula

**Objetivo:** Verificar se endpoint retorna matrícula do aluno com dados do curso

**Pré-requisitos:**
- Banco de dados poblado com dados de teste
- Aluno com ID 1 existente
- Curso com ID 2 existente
- Matrícula do aluno 1 no curso 2 com status "pending"
- Usuário autenticado com JWT válido

**Passos:**
1. Fazer requisição GET para `/api/v1/students/1/enrollments`
   ```bash
   curl -X GET http://localhost:3000/api/v1/students/1/enrollments \
     -H "Authorization: Bearer <token_jwt>" \
     -H "Content-Type: application/json"
   ```

2. Verificar status da resposta
3. Validar estrutura do JSON retornado
4. Confirmar presença de dados do curso na resposta

**Resultado Esperado:**
- Status HTTP: 200 OK
- Response body contém array com 1 matrícula
- Matrícula contém campos: id, student_id, course_id, status, enrollment_date
- Objeto course contém: id, name, duration_semesters
- Status da matrícula é "pending"

**Como verificar:**
```bash
# Resposta deve conter:
# "success": true
# "data": [ array com matrículas ]
# Cada matrícula deve ter "course" com dados do curso
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Listar matrículas - Aluno com múltiplas matrículas

**Objetivo:** Verificar se endpoint retorna todas as matrículas quando aluno tem mais de uma

**Pré-requisitos:**
- Aluno com ID 2 existente
- Múltiplos cursos (IDs 1, 2, 3) existentes
- Histórico: Aluno teve matrícula no curso 1 (cancelada), depois curso 2 (ativa), depois curso 3 (pending)
- Usuário autenticado

**Passos:**
1. Criar dados de teste com múltiplas matrículas para mesmo aluno:
   ```sql
   -- Matrícula 1 (cancelada)
   INSERT INTO enrollments (student_id, course_id, status, enrollment_date, created_at)
   VALUES (2, 1, 'cancelled', '2025-08-01', NOW());

   -- Matrícula 2 (ativa)
   INSERT INTO enrollments (student_id, course_id, status, enrollment_date, created_at)
   VALUES (2, 2, 'active', '2025-09-01', NOW());

   -- Matrícula 3 (pendente)
   INSERT INTO enrollments (student_id, course_id, status, enrollment_date, created_at)
   VALUES (2, 3, 'pending', '2025-10-30', NOW());
   ```

2. Fazer requisição GET para `/api/v1/students/2/enrollments`
   ```bash
   curl -X GET http://localhost:3000/api/v1/students/2/enrollments \
     -H "Authorization: Bearer <token_jwt>"
   ```

3. Verificar quantidade de matrículas retornadas
4. Validar que inclui matrículas com diferentes status

**Resultado Esperado:**
- Status HTTP: 200 OK
- Array contém 3 matrículas (todos os status: cancelled, active, pending)
- Cada matrícula tem dados completos incluindo course
- Matrículas estão ordenadas por data (mais recente primeiro)

**Como verificar:**
```bash
# Contar itens no array
# Verificar status de cada matrícula
# Confirmar presence de course em cada item
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Listar matrículas - Aluno sem matrículas

**Objetivo:** Verificar se endpoint retorna array vazio quando aluno não tem matrículas

**Pré-requisitos:**
- Aluno com ID 3 existente
- Nenhuma matrícula cadastrada para este aluno
- Usuário autenticado

**Passos:**
1. Garantir que aluno 3 não tem matrículas:
   ```sql
   DELETE FROM enrollments WHERE student_id = 3;
   ```

2. Fazer requisição GET para `/api/v1/students/3/enrollments`
   ```bash
   curl -X GET http://localhost:3000/api/v1/students/3/enrollments \
     -H "Authorization: Bearer <token_jwt>"
   ```

3. Verificar resposta

**Resultado Esperado:**
- Status HTTP: 200 OK
- Response body: `{ "success": true, "data": [] }`
- Array vazio (sem mensagem de erro)

**Como verificar:**
- data array está vazio (length === 0)
- success é true
- Não há campos de erro na resposta

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 4: Validação - studentId inválido (não numérico)

**Objetivo:** Verificar se API rejeita studentId que não é número inteiro

**Pré-requisitos:**
- Usuário autenticado
- Middleware de validação ativo

**Passos:**
1. Fazer requisição com studentId não numérico:
   ```bash
   curl -X GET http://localhost:3000/api/v1/students/abc/enrollments \
     -H "Authorization: Bearer <token_jwt>"
   ```

2. Verificar resposta de erro

**Resultado Esperado:**
- Status HTTP: 400 Bad Request
- Resposta contém mensagem de validação
- Campo "details" ou "error.details" contém informação sobre studentId inválido
- Formato esperado:
  ```json
  {
    "success": false,
    "error": "ID do aluno inválido",
    "details": [
      {
        "field": "studentId",
        "message": "studentId deve ser um inteiro positivo"
      }
    ]
  }
  ```

**Como verificar:**
- Status é 400
- success é false
- Mensagem menciona validação ou inteiro

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5: Validação - studentId zero ou negativo

**Objetivo:** Verificar se API rejeita studentId <= 0

**Pré-requisitos:**
- Usuário autenticado

**Passos:**
1. Fazer requisição com studentId = 0:
   ```bash
   curl -X GET http://localhost:3000/api/v1/students/0/enrollments \
     -H "Authorization: Bearer <token_jwt>"
   ```

2. Fazer requisição com studentId negativo:
   ```bash
   curl -X GET http://localhost:3000/api/v1/students/-1/enrollments \
     -H "Authorization: Bearer <token_jwt>"
   ```

3. Verificar respostas

**Resultado Esperado:**
- Status HTTP: 400 Bad Request (ambos casos)
- Erro indica que studentId deve ser inteiro positivo

**Como verificar:**
- Ambas requisições retornam 400
- Mensagem de erro menciona "positivo"

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6: Autenticação - Sem token JWT

**Objetivo:** Verificar se endpoint rejeita requisições sem autenticação

**Pré-requisitos:**
- Endpoint configurado para requer autenticação
- Middleware de autenticação ativo

**Passos:**
1. Fazer requisição SEM header Authorization:
   ```bash
   curl -X GET http://localhost:3000/api/v1/students/1/enrollments \
     -H "Content-Type: application/json"
   ```

2. Verificar resposta

**Resultado Esperado:**
- Status HTTP: 401 Unauthorized
- Resposta contém mensagem: "Unauthorized" ou "Token not provided"
- Formato:
  ```json
  {
    "success": false,
    "error": "Unauthorized"
  }
  ```

**Como verificar:**
- Status é 401
- Mensagem menciona autenticação/token
- Não retorna dados de matrícula

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 7: Autenticação - Token JWT inválido

**Objetivo:** Verificar se endpoint rejeita token JWT inválido

**Pré-requisitos:**
- Middleware de validação JWT ativo

**Passos:**
1. Fazer requisição com token inválido:
   ```bash
   curl -X GET http://localhost:3000/api/v1/students/1/enrollments \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.INVALID.INVALID"
   ```

2. Fazer requisição com token expirado (se aplicável):
   ```bash
   # Usar um token gerado há mais de 15 minutos (tempo de expiração padrão)
   curl -X GET http://localhost:3000/api/v1/students/1/enrollments \
     -H "Authorization: Bearer <token_expirado>"
   ```

3. Verificar respostas

**Resultado Esperado:**
- Status HTTP: 401 Unauthorized
- Mensagem: "Invalid token" ou "Token expired"

**Como verificar:**
- Status é 401
- Mensagem menciona "invalid" ou "expired"

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 8: Dados da Resposta - Estrutura e Tipos

**Objetivo:** Verificar se resposta tem estrutura correta com tipos de dados apropriados

**Pré-requisitos:**
- Aluno com matrículas existentes
- Usuário autenticado

**Passos:**
1. Fazer requisição GET `/api/v1/students/1/enrollments`
2. Analisar resposta JSON

**Resultado Esperado:**

Validar estrutura raiz:
```
success: boolean (true)
data: array
```

Validar estrutura de cada matrícula em data:
```
id: number (inteiro)
student_id: number (inteiro)
course_id: number (inteiro)
status: string ("pending", "active" ou "cancelled")
enrollment_date: string (formato YYYY-MM-DD)
created_at: string (ISO 8601)
course: object
  - id: number (inteiro)
  - name: string
  - duration_semesters: number (inteiro)
```

**Como verificar:**
```javascript
// Verificar tipos usando JavaScript
const data = JSON.parse(response);
console.log(typeof data.success === 'boolean'); // true
console.log(Array.isArray(data.data)); // true
console.log(typeof data.data[0].id === 'number'); // true
console.log(typeof data.data[0].status === 'string'); // true
console.log(data.data[0].status === 'pending' || data.data[0].status === 'active' || data.data[0].status === 'cancelled'); // true
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 9: Dados da Resposta - Campos obrigatórios

**Objetivo:** Verificar se resposta contém todos os campos obrigatórios

**Pré-requisitos:**
- Aluno com matrícula(s)
- Usuário autenticado

**Passos:**
1. Fazer requisição GET `/api/v1/students/1/enrollments`
2. Verificar presença de campos obrigatórios

**Resultado Esperado:**

Cada matrícula deve conter:
- ✓ id
- ✓ student_id
- ✓ course_id
- ✓ status
- ✓ enrollment_date
- ✓ created_at
- ✓ course (objeto com id, name, duration_semesters)

Nenhum campo pode ser null/undefined (exceto updated_at, deleted_at que podem ser null)

**Como verificar:**
```javascript
const enrollment = data.data[0];
console.log(enrollment.id !== undefined); // true
console.log(enrollment.student_id !== undefined); // true
console.log(enrollment.course !== undefined); // true
console.log(enrollment.course.id !== undefined); // true
console.log(enrollment.course.name !== undefined); // true
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 10: Dados da Resposta - Consistência de Dados

**Objetivo:** Verificar se dados retornados são consistentes com banco de dados

**Pré-requisitos:**
- Banco de dados com dados conhecidos
- Usuário autenticado

**Passos:**
1. Inserir dados conhecidos no banco:
   ```sql
   INSERT INTO enrollments (student_id, course_id, status, enrollment_date, created_at)
   VALUES (1, 2, 'pending', '2025-10-30', NOW());

   -- Anote o ID da matrícula gerado (ex: 42)

   INSERT INTO courses (name, description, duration_semesters, created_at)
   VALUES ('Engenharia de Software', 'Curso de Engenharia', 4, NOW())
   WHERE id = 2;
   ```

2. Fazer requisição GET `/api/v1/students/1/enrollments`

3. Comparar dados retornados com dados inseridos

**Resultado Esperado:**
- Matrícula no array contém student_id = 1
- Matrícula contém course_id = 2
- Matrícula contém status = "pending"
- Matrícula contém enrollment_date = "2025-10-30"
- Curso aninhado contém name = "Engenharia de Software"
- Curso aninhado contém duration_semesters = 4

**Como verificar:**
```javascript
const enrollment = data.data.find(e => e.id === 42);
console.log(enrollment.status === 'pending'); // true
console.log(enrollment.course.name === 'Engenharia de Software'); // true
console.log(enrollment.course.duration_semesters === 4); // true
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 11: Filtro - Apenas matrículas não deletadas

**Objetivo:** Verificar se endpoint retorna apenas matrículas não deletadas (soft delete)

**Pré-requisitos:**
- Aluno com múltiplas matrículas
- Uma matrícula com deleted_at != null (soft deleted)
- Usuário autenticado

**Passos:**
1. Inserir dados de teste:
   ```sql
   INSERT INTO enrollments (student_id, course_id, status, enrollment_date, created_at)
   VALUES (1, 1, 'active', '2025-01-01', NOW());

   INSERT INTO enrollments (student_id, course_id, status, enrollment_date, created_at, deleted_at)
   VALUES (1, 2, 'cancelled', '2025-06-01', NOW(), NOW());
   ```

2. Fazer requisição GET `/api/v1/students/1/enrollments`

3. Verificar resultado

**Resultado Esperado:**
- Array contém apenas 1 matrícula (a não deletada)
- Matrícula deletada não aparece na resposta
- Não há duplicatas

**Como verificar:**
- data.length === 1
- Matrícula retornada tem course_id = 1
- Nenhuma matrícula com deleted_at preenchido

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 12: Performance - Resposta rápida

**Objetivo:** Verificar se endpoint responde em tempo aceitável

**Pré-requisitos:**
- Aluno com múltiplas matrículas (mínimo 10)
- Banco de dados com índices otimizados
- Usuário autenticado

**Passos:**
1. Fazer requisição e medir tempo:
   ```bash
   time curl -X GET http://localhost:3000/api/v1/students/1/enrollments \
     -H "Authorization: Bearer <token_jwt>"
   ```

2. Registrar tempo de resposta

**Resultado Esperado:**
- Tempo de resposta < 500ms (para até 10+ matrículas)
- Em desenvolvimento < 1000ms é aceitável
- Tempo não aumenta significativamente com número de matrículas

**Como verificar:**
- Comando time mostra real < 500ms
- Sem timeout na resposta
- Resposta completa e sem erros

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔌 TESTES DE INTEGRAÇÃO

### Teste 13: Integração - Criação de matrícula e listagem

**Objetivo:** Verificar fluxo completo: criar matrícula e depois listar

**Pré-requisitos:**
- Aluno com ID 5 existente
- Curso com ID 3 existente
- Usuário autenticado com role admin

**Passos:**
1. Criar nova matrícula:
   ```bash
   curl -X POST http://localhost:3000/api/v1/enrollments \
     -H "Authorization: Bearer <token_admin>" \
     -H "Content-Type: application/json" \
     -d '{
       "student_id": 5,
       "course_id": 3,
       "enrollment_date": "2025-10-30"
     }'
   ```

2. Anote o ID da matrícula criada

3. Fazer requisição GET `/api/v1/students/5/enrollments`

4. Verificar se matrícula criada aparece na lista

**Resultado Esperado:**
- POST retorna 201 Created
- GET retorna array contendo a matrícula criada
- Dados da matrícula correspondem aos enviados

**Como verificar:**
```javascript
const createdEnrollment = createResponse.data;
const enrollments = listResponse.data;
const found = enrollments.find(e => e.id === createdEnrollment.id);
console.log(found !== undefined); // true
console.log(found.student_id === 5); // true
console.log(found.course_id === 3); // true
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 14: Integração - Alteração de status e listagem

**Objetivo:** Verificar se alteração de status é refletida na listagem

**Pré-requisitos:**
- Matrícula existente com ID 1 e status "pending"
- Usuário autenticado com role admin
- Documentos obrigatórios já aprovados

**Passos:**
1. Listar matrículas do aluno:
   ```bash
   curl -X GET http://localhost:3000/api/v1/students/1/enrollments \
     -H "Authorization: Bearer <token>"
   ```

2. Verificar status = "pending"

3. Alterar status para "active":
   ```bash
   curl -X PUT http://localhost:3000/api/v1/enrollments/1/status \
     -H "Authorization: Bearer <token_admin>" \
     -H "Content-Type: application/json" \
     -d '{ "status": "active" }'
   ```

4. Listar novamente as matrículas

5. Verificar se status foi atualizado

**Resultado Esperado:**
- Primeiro GET: status = "pending"
- PUT: retorna 200 com status = "active"
- Segundo GET: status = "active"

**Como verificar:**
```javascript
const enrollmentsBefore = listResponse1.data.find(e => e.id === 1);
console.log(enrollmentsBefore.status === 'pending'); // true

const enrollmentsAfter = listResponse2.data.find(e => e.id === 1);
console.log(enrollmentsAfter.status === 'active'); // true
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🛡️ TESTES DE SEGURANÇA

### Teste 15: Segurança - Validação de entrada (SQL Injection)

**Objetivo:** Verificar se API está protegida contra SQL Injection no parâmetro studentId

**Passos:**
1. Fazer requisição com payload SQL injection:
   ```bash
   curl -X GET "http://localhost:3000/api/v1/students/1 OR 1=1/enrollments" \
     -H "Authorization: Bearer <token>"
   ```

2. Fazer requisição com outro payload:
   ```bash
   curl -X GET "http://localhost:3000/api/v1/students/1; DROP TABLE enrollments--/enrollments" \
     -H "Authorization: Bearer <token>"
   ```

3. Verificar respostas

**Resultado Esperado:**
- Status HTTP: 400 Bad Request
- Erro de validação (não é inteiro positivo)
- Nenhuma alteração no banco de dados
- Nenhum erro SQL na resposta

**Como verificar:**
- Ambas requisições retornam 400
- Não há outputs do banco de dados expostos
- Logs não mostram execução de SQL malicioso

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 16: Segurança - Limitação de taxa (Rate Limiting)

**Objetivo:** Verificar se há proteção contra abuso (rate limiting)

**Pré-requisitos:**
- Rate limiting configurado (se implementado)

**Passos:**
1. Fazer múltiplas requisições rapidamente (>100 em 1 minuto):
   ```bash
   for i in {1..150}; do
     curl -X GET http://localhost:3000/api/v1/students/1/enrollments \
       -H "Authorization: Bearer <token>"
   done
   ```

2. Verificar se começa a retornar 429 (Too Many Requests) após X requisições

**Resultado Esperado:**
- Primeiras requisições: 200 OK
- Após limite: 429 Too Many Requests
- Headers retornam RateLimit-Remaining e RateLimit-Reset
- IP é bloqueado temporariamente

**Como verificar:**
- Contagem de 200 vs 429
- Headers de rate limit presentes
- Erro amigável ao usuário

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 17: Segurança - Acesso a dados de outros usuários

**Objetivo:** Verificar se aluno consegue acessar apenas suas próprias matrículas (se houver validação)

**Pré-requisitos:**
- Dois alunos: ID 1 e ID 2
- Aluno 1 autenticado com seu token
- Matrículas para ambos os alunos

**Passos:**
1. Com token do aluno 1, fazer requisição para suas matrículas:
   ```bash
   curl -X GET http://localhost:3000/api/v1/students/1/enrollments \
     -H "Authorization: Bearer <token_aluno_1>"
   ```

2. Com mesmo token, tentar acessar matrículas do aluno 2:
   ```bash
   curl -X GET http://localhost:3000/api/v1/students/2/enrollments \
     -H "Authorization: Bearer <token_aluno_1>"
   ```

3. Verificar se retorna dados de outro aluno ou erro de acesso

**Resultado Esperado:**
**Nota:** Conforme especificação, este endpoint não restringe aluno a ver apenas suas matrículas. Admins podem ver qualquer aluno, alunos podem ver qualquer aluno (conforme regra de negócio). Se houver restrição futura, esperado: 403 Forbidden

Atualmente esperado:
- GET /students/1/enrollments: Retorna dados do aluno 1
- GET /students/2/enrollments: Retorna dados do aluno 2 (acesso permitido)

**Como verificar:**
- Ambas requisições retornam 200
- Dados correspondem ao student_id solicitado

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📊 TESTES DE CASOS EXTREMOS

### Teste 18: Caso Extremo - studentId muito grande

**Objetivo:** Verificar como API lida com ID muito grande

**Passos:**
1. Fazer requisição com ID muito grande:
   ```bash
   curl -X GET http://localhost:3000/api/v1/students/999999999999999999/enrollments \
     -H "Authorization: Bearer <token>"
   ```

2. Verificar resposta

**Resultado Esperado:**
- Status HTTP: 200 OK
- Array vazio: `{ "success": true, "data": [] }`
- Sem erro, sem crash
- Sem mensagens de erro expondo detalhes

**Como verificar:**
- Status é 200
- data array está vazio
- Nenhuma exceção no servidor

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 19: Caso Extremo - studentId com espaços

**Objetivo:** Verificar validação de entrada com espaços em branco

**Passos:**
1. Fazer requisição com espaços:
   ```bash
   curl -X GET "http://localhost:3000/api/v1/students/ 1 /enrollments" \
     -H "Authorization: Bearer <token>"
   ```

2. Fazer requisição com espaços no parâmetro:
   ```bash
   curl -X GET "http://localhost:3000/api/v1/students/1%20/enrollments" \
     -H "Authorization: Bearer <token>"
   ```

**Resultado Esperado:**
- Status HTTP: 400 Bad Request
- Mensagem indicando studentId inválido

**Como verificar:**
- Status é 400
- Não retorna dados de matrícula

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📝 TESTES DE REGRESSÃO

### Teste 20: Regressão - Endpoints relacionados não foram quebrados

**Objetivo:** Verificar se a nova rota não quebrou endpoints relacionados

**Pré-requisitos:**
- Aluno com IDs conhecidos
- Matrículas criadas
- Usuário autenticado

**Passos:**
1. Testar endpoint de listar todas matrículas:
   ```bash
   curl -X GET http://localhost:3000/api/v1/enrollments \
     -H "Authorization: Bearer <token_admin>"
   ```

2. Testar endpoint de buscar matrícula por ID:
   ```bash
   curl -X GET http://localhost:3000/api/v1/enrollments/1 \
     -H "Authorization: Bearer <token>"
   ```

3. Testar endpoint de criar matrícula:
   ```bash
   curl -X POST http://localhost:3000/api/v1/enrollments \
     -H "Authorization: Bearer <token_admin>" \
     -H "Content-Type: application/json" \
     -d '{
       "student_id": 10,
       "course_id": 2
     }'
   ```

4. Testar endpoint de atualizar status:
   ```bash
   curl -X PUT http://localhost:3000/api/v1/enrollments/1/status \
     -H "Authorization: Bearer <token_admin>" \
     -H "Content-Type: application/json" \
     -d '{ "status": "active" }'
   ```

**Resultado Esperado:**
- Todos os endpoints retornam respostas válidas
- Nenhum erro 500
- Dados não foram alterados inesperadamente

**Como verificar:**
- Todos status são 200 ou 201 (conforme esperado)
- Nenhum erro na resposta
- Estrutura de resposta mantém padrão

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE DE LOGS E MONITORAMENTO

### Teste 21: Logging - Operação registrada nos logs

**Objetivo:** Verificar se requisição é registrada no sistema de logs

**Pré-requisitos:**
- Sistema de logs (Winston) configurado
- Arquivo de log acessível
- Usuário autenticado

**Passos:**
1. Limpar arquivo de log:
   ```bash
   # Linux/Mac
   truncate -s 0 backend/logs/combined.log

   # Windows
   type nul > backend/logs/combined.log
   ```

2. Fazer requisição GET `/api/v1/students/1/enrollments`

3. Verificar arquivo de log:
   ```bash
   tail -f backend/logs/combined.log
   ```

4. Procurar por entrada relacionada à requisição

**Resultado Esperado:**
- Arquivo de log contém entrada
- Log menciona endpoint acessado
- Log contém studentId
- Log contém status da resposta (200)
- Log contém timestamp

**Como verificar:**
```bash
grep "students.*enrollments" backend/logs/combined.log
grep "200" backend/logs/combined.log
```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🎯 RESUMO EXECUTIVO

**Total de Testes:** 21
**Testes Funcionais:** 12
**Testes de Integração:** 2
**Testes de Segurança:** 3
**Testes de Casos Extremos:** 2
**Testes de Regressão:** 1
**Testes de Logs:** 1

**Pré-requisitos para Execução:**
- Banco de dados MySQL configurado e ativo
- Backend Node.js rodando em http://localhost:3000
- Dados de teste inseridos
- JWT válido para autenticação

**Como Executar:**
1. Preparar ambiente de teste com dados
2. Executar testes na ordem indicada
3. Registrar resultados em cada teste
4. Fazer correções se necessário
5. Re-executar testes que falharam

**Critério de Sucesso:**
- ✅ Todos os 21 testes devem passar
- ✅ Nenhuma regressão em endpoints relacionados
- ✅ Resposta dentro de 500ms
- ✅ Logs registrando operações
- ✅ Validações funcionando corretamente

---

**Documento criado em:** 2025-10-30
**Versão:** 1.0
**Status:** Pronto para execução
