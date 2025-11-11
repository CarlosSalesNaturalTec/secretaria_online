# PLANO DE TESTES - feat-025: Criar middleware de validação com express-validator

**Feature:** feat-025 - Criar middleware de validação com express-validator
**Grupo:** Backend - Middlewares e Utilitários
**Data de criação:** 2025-10-28
**Status:** Aguardando execução

---

## 📋 TESTE FUNCIONAL

### Teste 1 - Validação de CPF com diferentes formatos

**Objetivo:** Verificar se o validador de CPF aceita formatos válidos e rejeita formatos inválidos

**Passos:**
1. Iniciar servidor backend em modo desenvolvimento:
   ```bash
   cd backend
   npm run dev
   ```

2. Testar CPF válido com formatação (pontos e traço):
   ```bash
   # Substitua por uma rota que use studentValidationRules() ou teacherValidationRules()
   curl -X POST http://localhost:3000/api/v1/students \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "name": "João Silva Teste",
       "cpf": "123.456.789-09",
       "rg": "12.345.678-9",
       "email": "joao.teste@email.com",
       "mother_name": "Maria Silva",
       "address": "Rua Teste, 123"
     }'
   ```

3. Testar CPF válido sem formatação (apenas números):
   ```bash
   curl -X POST http://localhost:3000/api/v1/students \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "name": "Maria Santos Teste",
       "cpf": "12345678909",
       "rg": "12.345.678-9",
       "email": "maria.teste@email.com",
       "mother_name": "Ana Santos",
       "address": "Rua Teste, 456"
     }'
   ```

4. Testar CPF inválido (dígitos verificadores incorretos):
   ```bash
   curl -X POST http://localhost:3000/api/v1/students \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "name": "Pedro Costa Teste",
       "cpf": "111.111.111-11",
       "rg": "12.345.678-9",
       "email": "pedro.teste@email.com",
       "mother_name": "Joana Costa",
       "address": "Rua Teste, 789"
     }'
   ```

5. Testar CPF com formato incorreto (menos de 11 dígitos):
   ```bash
   curl -X POST http://localhost:3000/api/v1/students \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "name": "Ana Oliveira Teste",
       "cpf": "123.456.789",
       "rg": "12.345.678-9",
       "email": "ana.teste@email.com",
       "mother_name": "Clara Oliveira",
       "address": "Rua Teste, 101"
     }'
   ```

**Resultado Esperado:**
- ✓ Teste 2: CPF válido com formatação - HTTP 201 Created, estudante criado com sucesso
- ✓ Teste 3: CPF válido sem formatação - HTTP 201 Created, estudante criado com sucesso
- ✓ Teste 4: CPF inválido (todos iguais) - HTTP 400 Bad Request com erro de validação:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Dados inválidos fornecidos",
      "details": [
        {
          "field": "cpf",
          "message": "CPF inválido",
          "value": "111.111.111-11"
        }
      ]
    }
  }
  ```
- ✓ Teste 5: CPF incompleto - HTTP 400 Bad Request com erro de validação

**Como verificar:**
- Verificar código de status HTTP da resposta
- Verificar estrutura JSON da resposta de erro
- Conferir no banco de dados se estudantes válidos foram criados e inválidos foram rejeitados

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2 - Validação de Email

**Objetivo:** Verificar se o validador de email aceita formatos válidos e rejeita formatos inválidos

**Passos:**
1. Testar email válido padrão:
   ```bash
   curl -X POST http://localhost:3000/api/v1/students \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "name": "Carlos Pereira Teste",
       "cpf": "123.456.789-09",
       "rg": "12.345.678-9",
       "email": "carlos@exemplo.com.br",
       "mother_name": "Rosa Pereira",
       "address": "Rua Teste, 202"
     }'
   ```

2. Testar email inválido (sem @):
   ```bash
   curl -X POST http://localhost:3000/api/v1/students \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "name": "Fernanda Lima Teste",
       "cpf": "123.456.789-09",
       "rg": "12.345.678-9",
       "email": "fernanda.exemplo.com",
       "mother_name": "Paula Lima",
       "address": "Rua Teste, 303"
     }'
   ```

3. Testar email inválido (sem domínio):
   ```bash
   curl -X POST http://localhost:3000/api/v1/students \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "name": "Roberto Souza Teste",
       "cpf": "123.456.789-09",
       "rg": "12.345.678-9",
       "email": "roberto@",
       "mother_name": "Isabel Souza",
       "address": "Rua Teste, 404"
     }'
   ```

**Resultado Esperado:**
- ✓ Teste 1: Email válido - HTTP 201 Created
- ✓ Teste 2: Email sem @ - HTTP 400 Bad Request com mensagem "Email inválido"
- ✓ Teste 3: Email sem domínio - HTTP 400 Bad Request com mensagem "Email inválido"

**Como verificar:**
- Verificar resposta HTTP e mensagens de erro
- Confirmar que email é normalizado (lowercase) no banco

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3 - Validação de Telefone Brasileiro

**Objetivo:** Verificar se o validador de telefone aceita formatos brasileiros válidos

**Passos:**
1. Testar telefone celular com DDD e 9º dígito:
   ```bash
   curl -X POST http://localhost:3000/api/v1/students \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "name": "Lucas Martins Teste",
       "cpf": "123.456.789-09",
       "rg": "12.345.678-9",
       "email": "lucas@exemplo.com",
       "mother_name": "Julia Martins",
       "address": "Rua Teste, 505",
       "phone": "(11) 98765-4321"
     }'
   ```

2. Testar telefone fixo:
   ```bash
   curl -X POST http://localhost:3000/api/v1/students \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "name": "Amanda Rocha Teste",
       "cpf": "123.456.789-09",
       "rg": "12.345.678-9",
       "email": "amanda@exemplo.com",
       "mother_name": "Lucia Rocha",
       "address": "Rua Teste, 606",
       "phone": "(11) 3456-7890"
     }'
   ```

3. Testar telefone inválido (menos de 10 dígitos):
   ```bash
   curl -X POST http://localhost:3000/api/v1/students \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "name": "Rafael Costa Teste",
       "cpf": "123.456.789-09",
       "rg": "12.345.678-9",
       "email": "rafael@exemplo.com",
       "mother_name": "Mariana Costa",
       "address": "Rua Teste, 707",
       "phone": "1234-5678"
     }'
   ```

**Resultado Esperado:**
- ✓ Teste 1: Celular válido - HTTP 201 Created
- ✓ Teste 2: Fixo válido - HTTP 201 Created
- ✓ Teste 3: Telefone inválido - HTTP 400 Bad Request com mensagem "Telefone inválido"

**Como verificar:**
- Verificar resposta HTTP
- Conferir se telefone é armazenado corretamente no banco

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 4 - Validação de Senha Forte (changePasswordValidationRules)

**Objetivo:** Verificar se o validador de senha forte exige requisitos de segurança

**Passos:**
1. Testar senha forte válida:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/change-password \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "current_password": "admin123",
       "new_password": "SenhaForte123",
       "confirm_password": "SenhaForte123"
     }'
   ```

2. Testar senha fraca (sem maiúscula):
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/change-password \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "current_password": "admin123",
       "new_password": "senhafraca123",
       "confirm_password": "senhafraca123"
     }'
   ```

3. Testar senha fraca (sem números):
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/change-password \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "current_password": "admin123",
       "new_password": "SenhaFraca",
       "confirm_password": "SenhaFraca"
     }'
   ```

4. Testar senha muito curta:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/change-password \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "current_password": "admin123",
       "new_password": "Abc123",
       "confirm_password": "Abc123"
     }'
   ```

5. Testar senhas não conferem:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/change-password \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "current_password": "admin123",
       "new_password": "SenhaForte123",
       "confirm_password": "SenhaForte456"
     }'
   ```

**Resultado Esperado:**
- ✓ Teste 1: Senha forte - HTTP 200 OK
- ✓ Teste 2: Sem maiúscula - HTTP 400 Bad Request com mensagem sobre requisitos
- ✓ Teste 3: Sem números - HTTP 400 Bad Request com mensagem sobre requisitos
- ✓ Teste 4: Muito curta - HTTP 400 Bad Request com mensagem "Nova senha deve ter no mínimo 6 caracteres"
- ✓ Teste 5: Senhas diferentes - HTTP 400 Bad Request com mensagem "Senhas não conferem"

**Como verificar:**
- Verificar resposta HTTP
- Confirmar mensagens de erro específicas
- Para teste 1, verificar se senha foi realmente alterada tentando login com nova senha

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5 - Validação de Notas (gradeValidationRules)

**Objetivo:** Verificar se o validador de notas aceita valores entre 0-10 com máximo 2 casas decimais

**Passos:**
1. Testar nota válida inteira:
   ```bash
   curl -X POST http://localhost:3000/api/v1/grades \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "student_id": 1,
       "evaluation_id": 1,
       "grade": 8
     }'
   ```

2. Testar nota válida decimal (1 casa):
   ```bash
   curl -X POST http://localhost:3000/api/v1/grades \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "student_id": 1,
       "evaluation_id": 2,
       "grade": 7.5
     }'
   ```

3. Testar nota válida decimal (2 casas):
   ```bash
   curl -X POST http://localhost:3000/api/v1/grades \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "student_id": 1,
       "evaluation_id": 3,
       "grade": 9.75
     }'
   ```

4. Testar nota inválida (acima de 10):
   ```bash
   curl -X POST http://localhost:3000/api/v1/grades \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "student_id": 1,
       "evaluation_id": 4,
       "grade": 11
     }'
   ```

5. Testar nota inválida (negativa):
   ```bash
   curl -X POST http://localhost:3000/api/v1/grades \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "student_id": 1,
       "evaluation_id": 5,
       "grade": -1
     }'
   ```

6. Testar nota inválida (mais de 2 casas decimais):
   ```bash
   curl -X POST http://localhost:3000/api/v1/grades \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "student_id": 1,
       "evaluation_id": 6,
       "grade": 8.753
     }'
   ```

**Resultado Esperado:**
- ✓ Teste 1, 2, 3: Notas válidas - HTTP 201 Created
- ✓ Teste 4: Nota acima de 10 - HTTP 400 Bad Request
- ✓ Teste 5: Nota negativa - HTTP 400 Bad Request
- ✓ Teste 6: Mais de 2 casas decimais - HTTP 400 Bad Request

**Como verificar:**
- Verificar resposta HTTP
- Para testes bem-sucedidos, verificar se nota foi armazenada corretamente no banco
- Consultar tabela `grades` diretamente:
  ```sql
  SELECT * FROM grades WHERE student_id = 1 ORDER BY created_at DESC LIMIT 5;
  ```

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6 - Validação de Paginação (paginationValidationRules)

**Objetivo:** Verificar se os validadores de paginação aceitam valores válidos e rejeitam valores inválidos

**Passos:**
1. Testar paginação válida:
   ```bash
   curl -X GET "http://localhost:3000/api/v1/students?page=2&limit=20&sort=asc" \
     -H "Authorization: Bearer SEU_TOKEN_JWT"
   ```

2. Testar página inválida (zero):
   ```bash
   curl -X GET "http://localhost:3000/api/v1/students?page=0&limit=20" \
     -H "Authorization: Bearer SEU_TOKEN_JWT"
   ```

3. Testar limite inválido (acima de 100):
   ```bash
   curl -X GET "http://localhost:3000/api/v1/students?page=1&limit=200" \
     -H "Authorization: Bearer SEU_TOKEN_JWT"
   ```

4. Testar ordenação inválida:
   ```bash
   curl -X GET "http://localhost:3000/api/v1/students?page=1&limit=20&sort=invalido" \
     -H "Authorization: Bearer SEU_TOKEN_JWT"
   ```

**Resultado Esperado:**
- ✓ Teste 1: Paginação válida - HTTP 200 OK com resultados paginados
- ✓ Teste 2: Página zero - HTTP 400 Bad Request com mensagem "Página deve ser um número maior que 0"
- ✓ Teste 3: Limite alto - HTTP 400 Bad Request com mensagem "Limite deve ser entre 1 e 100"
- ✓ Teste 4: Sort inválido - HTTP 400 Bad Request com mensagem "Ordenação deve ser 'asc' ou 'desc'"

**Como verificar:**
- Verificar resposta HTTP
- Para teste 1, verificar se resultado contém dados paginados corretamente
- Verificar mensagens de erro específicas

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔧 TESTE DE INTEGRAÇÃO

### Teste 7 - Middleware handleValidationErrors

**Objetivo:** Verificar se o middleware handleValidationErrors captura corretamente os erros de validação e retorna resposta padronizada

**Passos:**
1. Criar requisição com múltiplos erros de validação:
   ```bash
   curl -X POST http://localhost:3000/api/v1/students \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "name": "AB",
       "cpf": "123",
       "rg": "",
       "email": "email-invalido",
       "mother_name": "",
       "address": ""
     }'
   ```

2. Verificar estrutura da resposta de erro

**Resultado Esperado:**
- ✓ HTTP 400 Bad Request
- ✓ Resposta JSON com estrutura padronizada:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Dados inválidos fornecidos",
      "details": [
        {
          "field": "name",
          "message": "Nome deve ter entre 3 e 255 caracteres",
          "value": "AB"
        },
        {
          "field": "cpf",
          "message": "CPF inválido",
          "value": "123"
        },
        {
          "field": "rg",
          "message": "RG é obrigatório",
          "value": ""
        },
        {
          "field": "email",
          "message": "Email inválido",
          "value": "email-invalido"
        },
        {
          "field": "mother_name",
          "message": "Nome da mãe é obrigatório",
          "value": ""
        },
        {
          "field": "address",
          "message": "Endereço é obrigatório",
          "value": ""
        }
      ]
    }
  }
  ```

**Como verificar:**
- Verificar que todos os erros de validação são capturados em um único array
- Confirmar estrutura padronizada com campos: field, message, value
- Verificar que código HTTP é 400
- Confirmar que campo `success` é `false`

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🛡️ TESTE DE SEGURANÇA

### Teste 8 - Sanitização de Inputs

**Objetivo:** Verificar se campos são sanitizados corretamente (trim, normalização)

**Passos:**
1. Testar criação de estudante com espaços extras e email em maiúsculas:
   ```bash
   curl -X POST http://localhost:3000/api/v1/students \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_JWT" \
     -d '{
       "name": "  Beatriz Alves Teste  ",
       "cpf": "  123.456.789-09  ",
       "rg": "  12.345.678-9  ",
       "email": "  BEATRIZ@EXEMPLO.COM  ",
       "mother_name": "  Claudia Alves  ",
       "address": "  Rua Teste, 808  "
     }'
   ```

2. Verificar no banco de dados se valores foram sanitizados:
   ```sql
   SELECT name, email FROM users WHERE email = 'beatriz@exemplo.com';
   ```

**Resultado Esperado:**
- ✓ HTTP 201 Created
- ✓ Nome sem espaços extras: "Beatriz Alves Teste"
- ✓ Email normalizado para minúsculas: "beatriz@exemplo.com"
- ✓ Demais campos sem espaços extras

**Como verificar:**
- Consultar diretamente no banco de dados
- Verificar que valores não contêm espaços no início/fim
- Confirmar que email está em minúsculas

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📊 TESTE DE PERFORMANCE

### Teste 9 - Performance de Validação em Massa

**Objetivo:** Verificar se o middleware de validação tem performance aceitável ao processar múltiplas requisições

**Passos:**
1. Criar script de teste de carga (salvar como `test-validation-load.sh`):
   ```bash
   #!/bin/bash

   TOKEN="SEU_TOKEN_JWT"

   for i in {1..100}
   do
     curl -X POST http://localhost:3000/api/v1/students \
       -H "Content-Type: application/json" \
       -H "Authorization: Bearer $TOKEN" \
       -d "{
         \"name\": \"Teste Usuario $i\",
         \"cpf\": \"123.456.789-09\",
         \"rg\": \"12.345.678-9\",
         \"email\": \"teste$i@exemplo.com\",
         \"mother_name\": \"Mae Teste $i\",
         \"address\": \"Rua Teste, $i\"
       }" \
       -w "Request $i: %{time_total}s\n" \
       -o /dev/null -s &
   done

   wait
   echo "Teste de carga concluído"
   ```

2. Executar script:
   ```bash
   chmod +x test-validation-load.sh
   ./test-validation-load.sh
   ```

3. Analisar tempo de resposta médio

**Resultado Esperado:**
- ✓ Tempo médio de resposta < 500ms por requisição
- ✓ Servidor não deve travar ou apresentar erros de memória
- ✓ Validações devem continuar funcionando corretamente sob carga

**Como verificar:**
- Observar tempos de resposta no output do script
- Monitorar uso de CPU/memória do servidor durante o teste
- Verificar logs do servidor para erros

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📝 RESUMO DE TESTES

| # | Nome do Teste | Tipo | Status | Observações |
|---|---------------|------|--------|-------------|
| 1 | Validação de CPF | Funcional | ⏳ | - |
| 2 | Validação de Email | Funcional | ⏳ | - |
| 3 | Validação de Telefone | Funcional | ⏳ | - |
| 4 | Validação de Senha Forte | Funcional | ⏳ | - |
| 5 | Validação de Notas | Funcional | ⏳ | - |
| 6 | Validação de Paginação | Funcional | ⏳ | - |
| 7 | Middleware handleValidationErrors | Integração | ⏳ | - |
| 8 | Sanitização de Inputs | Segurança | ⏳ | - |
| 9 | Performance em Massa | Performance | ⏳ | - |

**Legenda:**
- ⏳ Aguardando execução
- ✅ Passou
- ❌ Falhou
- ⚠️ Passou com ressalvas

---

## 🔍 CRITÉRIOS DE ACEITAÇÃO

Para que a feature seja considerada concluída, todos os testes devem passar com os seguintes critérios:

1. **Validação de CPF:**
   - ✓ Aceitar CPF válido com ou sem formatação
   - ✓ Rejeitar CPF inválido (dígitos verificadores incorretos)
   - ✓ Rejeitar CPF com todos dígitos iguais
   - ✓ Rejeitar CPF incompleto

2. **Validação de Email:**
   - ✓ Aceitar emails válidos
   - ✓ Rejeitar emails sem @, sem domínio ou malformados
   - ✓ Normalizar email para minúsculas

3. **Validação de Campos Obrigatórios:**
   - ✓ Retornar erro se campo obrigatório estiver vazio
   - ✓ Mensagens de erro claras e específicas

4. **Resposta Padronizada:**
   - ✓ Estrutura JSON consistente em todas as validações
   - ✓ Código HTTP correto (400 para validação, 201 para sucesso)
   - ✓ Array `details` com todos os erros encontrados

5. **Sanitização:**
   - ✓ Remover espaços extras (trim)
   - ✓ Normalizar email para lowercase
   - ✓ Preservar dados originais quando apropriado

6. **Performance:**
   - ✓ Tempo de resposta < 500ms sob carga moderada
   - ✓ Sem vazamento de memória em requisições repetidas

---

## 📌 NOTAS IMPORTANTES

1. **Pré-requisitos para execução:**
   - Servidor backend rodando (`npm run dev`)
   - Banco de dados configurado e migrations executadas
   - Token JWT válido de usuário admin (obter via login)
   - Rotas de API implementadas (students, teachers, grades, etc.)

2. **Obter token JWT para testes:**
   ```bash
   # Login como admin
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"login": "admin", "password": "admin123"}'

   # Copiar o token da resposta e usar nos testes
   ```

3. **Limpeza após testes:**
   ```sql
   -- Remover dados de teste criados
   DELETE FROM users WHERE email LIKE '%@exemplo.com' OR email LIKE '%teste@%';
   DELETE FROM users WHERE name LIKE '%Teste%';
   ```

4. **Ferramentas alternativas:**
   - **Postman**: Importar collection com os requests acima
   - **Insomnia**: Ferramenta similar ao Postman
   - **Thunder Client**: Extensão do VS Code

---

**Última atualização:** 2025-10-28
**Responsável pelos testes:** _[A definir]_
