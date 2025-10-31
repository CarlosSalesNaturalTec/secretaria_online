# PLANO DE TESTES - feat-038: Criar EnrollmentService com regras de negócio

**Feature:** feat-038 - Criar EnrollmentService com regras de negócio
**Grupo:** Backend - API de Matrículas (grupo-7)
**Data de criação:** 2025-10-30
**Status:** Aguardando execução

---

## 📋 TESTE FUNCIONAL

### Teste 1: Criar Matrícula com Status Pending

**Objetivo:** Verificar se uma nova matrícula é criada com status 'pending' quando aluno válido é matriculado em curso válido

**Passos:**
1. Criar um aluno teste via API ou banco de dados
   ```bash
   # Inserir aluno no banco (ou usar criado anteriormente)
   # Role: student, nome: "Aluno Teste", email: "aluno@test.com", login: "aluno_teste"
   ```
2. Criar um curso teste via API ou banco de dados
   ```bash
   # Inserir curso no banco (ou usar criado anteriormente)
   # Nome: "Curso Teste", duração: 4 semestres
   ```
3. Chamar o método `EnrollmentService.create(studentId, courseId)`
   ```bash
   # Importar service e testar
   const enrollment = await EnrollmentService.create(1, 1);
   ```
4. Verificar resposta

**Resultado Esperado:**
- ✓ Matrícula criada com sucesso
- ✓ Status da matrícula é 'pending'
- ✓ student_id e course_id estão corretos
- ✓ enrollment_date está preenchida com a data atual (ou fornecida)
- ✓ Mensagem de log registrada: "Matrícula criada com sucesso"

**Como verificar:**
- Consultar banco de dados: `SELECT * FROM enrollments WHERE id = ?`
- Verificar status = 'pending'
- Verificar timestamps created_at e updated_at

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Validar Que Aluno Não Pode Ter Duas Matrículas Ativas Simultaneamente

**Objetivo:** Verificar se o sistema impede que um aluno seja matriculado em dois cursos ao mesmo tempo

**Passos:**
1. Criar aluno teste (usar "Aluno Teste" do teste anterior)
2. Criar duas matrículas: uma em curso_id=1 e outra em curso_id=2
   ```bash
   const enrollment1 = await EnrollmentService.create(1, 1);  // Primeira matrícula - OK
   const enrollment2 = await EnrollmentService.create(1, 2);  // Segunda matrícula - deve falhar
   ```
3. Tentar criar a segunda matrícula

**Resultado Esperado:**
- ✓ Primeira matrícula criada com sucesso (status: pending)
- ✓ Segunda matrícula gera erro AppError com mensagem específica
- ✓ Código HTTP: 422 (Unprocessable Entity)
- ✓ Mensagem de erro contém: "Aluno já possui uma matrícula..."

**Como verificar:**
- Verificar exceção lançada: `try/catch` deve capturar AppError
- Mensagem de erro deve descrever a restrição
- Logs devem registrar aviso: "Aluno já possui matrícula ativa/pendente"

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Verificar Validação de Documentos Obrigatórios

**Objetivo:** Confirmar que `validateDocuments()` retorna false se algum documento obrigatório não foi aprovado

**Passos:**
1. Criar aluno teste
2. Criar tipos de documentos obrigatórios (se não existirem)
   ```bash
   # Tipos obrigatórios para alunos: RG, CPF, Certidão de Nascimento, etc.
   # Inserir no banco com is_required = true, user_type = 'student' ou 'both'
   ```
3. Criar documentos para o aluno, mas deixar alguns com status 'pending' ou 'rejected'
   ```bash
   # Document 1: status = 'approved' (RG)
   # Document 2: status = 'pending' (CPF)  <- Não aprovado
   ```
4. Chamar `EnrollmentService.validateDocuments(studentId)`
   ```bash
   const isValid = await EnrollmentService.validateDocuments(1);
   ```
5. Verificar resultado

**Resultado Esperado:**
- ✓ Método retorna `false`
- ✓ Log registra: "Aluno não possui documento aprovado: [Nome do Documento]"
- ✓ Documentação não está completa

**Como verificar:**
- Consultar registros de documentos: `SELECT * FROM documents WHERE user_id = ?`
- Conferir que nem todos têm status = 'approved'
- Verificar retorno do método é `false`

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 4: Validar Documentos Aprovados Permite Ativação

**Objetivo:** Confirmar que `validateDocuments()` retorna true quando todos documentos obrigatórios estão aprovados

**Passos:**
1. Usar aluno do teste anterior
2. Aprovar todos os documentos pendentes
   ```bash
   # Atualizar documentos com status = 'approved'
   UPDATE documents SET status = 'approved' WHERE user_id = 1 AND status = 'pending';
   ```
3. Chamar `EnrollmentService.validateDocuments(studentId)` novamente
   ```bash
   const isValid = await EnrollmentService.validateDocuments(1);
   ```
4. Verificar resultado

**Resultado Esperado:**
- ✓ Método retorna `true`
- ✓ Log registra: "Aluno possui todos os documentos obrigatórios aprovados"
- ✓ Documentação está completa

**Como verificar:**
- Consultar documentos: `SELECT * FROM documents WHERE user_id = 1 AND status != 'approved'`
- Resultado deve estar vazio (ou NULL)
- Verificar retorno é `true`

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5: Ativar Matrícula Requer Documentação Completa

**Objetivo:** Verificar que `activateEnrollment()` falha se documentos não forem aprovados

**Passos:**
1. Criar nova matrícula com status 'pending' para um aluno
   ```bash
   const enrollment = await EnrollmentService.create(2, 3);  # Novo aluno
   ```
2. Não aprovar documentos (deixar alguns pending)
3. Chamar `EnrollmentService.activateEnrollment(enrollmentId)`
   ```bash
   const activated = await EnrollmentService.activateEnrollment(enrollment.id);
   ```
4. Verificar resultado

**Resultado Esperado:**
- ✓ Método lança AppError
- ✓ Código HTTP: 422
- ✓ Mensagem: "Não é possível ativar matrícula. Nem todos os documentos obrigatórios foram aprovados."
- ✓ Status da matrícula continua 'pending' no banco

**Como verificar:**
- Try/catch deve capturar erro
- Verificar `enrollment.status` no banco continua 'pending'
- Log registra aviso: "Documentos do aluno não foram totalmente aprovados"

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6: Ativar Matrícula com Documentação Completa

**Objetivo:** Verificar que `activateEnrollment()` muda status para 'active' quando todos documentos estão aprovados

**Passos:**
1. Criar novo aluno e matrícula (pendente)
   ```bash
   const enrollment = await EnrollmentService.create(3, 4);
   ```
2. Aprovar todos os documentos obrigatórios do aluno
   ```bash
   # Criar e aprovar documentos
   await Document.create({ user_id: 3, document_type_id: 1, status: 'approved', ... });
   await Document.create({ user_id: 3, document_type_id: 2, status: 'approved', ... });
   ```
3. Chamar `EnrollmentService.activateEnrollment(enrollmentId)`
   ```bash
   const activated = await EnrollmentService.activateEnrollment(enrollment.id);
   ```
4. Verificar resultado

**Resultado Esperado:**
- ✓ Matrícula ativada com sucesso
- ✓ Status alterado para 'active'
- ✓ Updated_at atualizado
- ✓ Log registra: "Matrícula ativada com sucesso"

**Como verificar:**
- Verificar retorno: `enrollment.status === 'active'`
- Consultar banco: `SELECT status FROM enrollments WHERE id = ?` deve retornar 'active'
- Verificar timestamp `updated_at` é recente

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 7: Não Permitir Ativar Matrícula Cancelada

**Objetivo:** Verificar que matrícula com status 'cancelled' não pode ser ativada

**Passos:**
1. Criar matrícula e cancelá-la
   ```bash
   const enrollment = await EnrollmentService.create(4, 5);
   await EnrollmentService.cancel(enrollment.id);
   ```
2. Tentar ativar matrícula cancelada
   ```bash
   const activated = await EnrollmentService.activateEnrollment(enrollment.id);
   ```
3. Verificar resultado

**Resultado Esperado:**
- ✓ Método lança AppError
- ✓ Código HTTP: 422
- ✓ Mensagem contém: "Apenas matrículas com status 'pending' podem ser ativadas"
- ✓ Status continua 'cancelled'

**Como verificar:**
- Try/catch captura erro
- Verificar mensagem de erro
- Log registra aviso com status atual

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 8: Método `canEnroll()` Valida Corretamente

**Objetivo:** Verificar que `canEnroll()` retorna false quando aluno já possui matrícula ativa/pendente

**Passos:**
1. Criar aluno e uma matrícula (status pending)
   ```bash
   const enrollment1 = await EnrollmentService.create(5, 6);
   ```
2. Chamar `canEnroll()` para esse aluno com outro curso
   ```bash
   const canEnroll = await EnrollmentService.canEnroll(5, 7);
   ```
3. Verificar resultado

**Resultado Esperado:**
- ✓ Método retorna `false`
- ✓ Aluno não pode se matricular em outro curso
- ✓ Log registra: "Aluno já possui matrícula ativa/pendente"

**Como verificar:**
- Verificar retorno: `canEnroll === false`
- Tentar criar segunda matrícula deve falhar (ver Teste 2)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 9: Buscar Matrículas por Aluno

**Objetivo:** Verificar que `getByStudent()` retorna todas as matrículas de um aluno

**Passos:**
1. Criar aluno e múltiplas matrículas
   ```bash
   # Criar aluno e cancelar primeira matrícula, criar segunda
   const e1 = await EnrollmentService.create(6, 8);
   await EnrollmentService.cancel(e1.id);
   # Aguardar, depois criar segunda matrícula
   ```
2. Chamar `EnrollmentService.getByStudent(6)`
   ```bash
   const enrollments = await EnrollmentService.getByStudent(6);
   ```
3. Verificar resultado

**Resultado Esperado:**
- ✓ Retorna array com todas as matrículas do aluno
- ✓ Inclui informações do curso (via eager loading)
- ✓ Matrículas aparecem em ordem decrescente de enrollment_date

**Como verificar:**
- Verificar `enrollments.length > 0`
- Verificar cada matrícula tem `student_id = 6`
- Verificar relacionamento `course` está preenchido

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 10: Atualizar Status de Matrícula

**Objetivo:** Verificar que `updateStatus()` altera corretamente o status de uma matrícula

**Passos:**
1. Criar matrícula com status 'pending'
   ```bash
   const enrollment = await EnrollmentService.create(7, 9);
   ```
2. Alterar status para 'cancelled'
   ```bash
   const updated = await EnrollmentService.updateStatus(enrollment.id, 'cancelled');
   ```
3. Verificar resultado

**Resultado Esperado:**
- ✓ Status alterado para 'cancelled'
- ✓ Método retorna matrícula atualizada
- ✓ Verificação no banco mostra novo status

**Como verificar:**
- Verificar `updated.status === 'cancelled'`
- Consultar banco: `SELECT status FROM enrollments WHERE id = ?`

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 11: Rejeitar Status Inválido

**Objetivo:** Verificar que `updateStatus()` rejeita status inválido

**Passos:**
1. Criar matrícula
   ```bash
   const enrollment = await EnrollmentService.create(8, 10);
   ```
2. Tentar alterar para status inválido
   ```bash
   const updated = await EnrollmentService.updateStatus(enrollment.id, 'invalid_status');
   ```
3. Verificar resultado

**Resultado Esperado:**
- ✓ Método lança AppError
- ✓ Código HTTP: 400
- ✓ Mensagem: "Status inválido..."
- ✓ Status no banco não foi alterado

**Como verificar:**
- Try/catch captura erro
- Verificar mensagem lista status válidos
- Verificar status no banco continua original

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 12: Deletar Matrícula (Soft Delete)

**Objetivo:** Verificar que `delete()` faz soft delete de matrícula

**Passos:**
1. Criar matrícula
   ```bash
   const enrollment = await EnrollmentService.create(9, 11);
   ```
2. Deletar matrícula
   ```bash
   await EnrollmentService.delete(enrollment.id);
   ```
3. Verificar resultado

**Resultado Esperado:**
- ✓ Matrícula deletada (soft delete)
- ✓ Coluna `deleted_at` preenchida com data/hora
- ✓ Matrícula não aparece em queries normais
- ✓ Log registra: "Matrícula deletada"

**Como verificar:**
- Verificar banco: `SELECT deleted_at FROM enrollments WHERE id = ?` deve ter data
- Tentar buscar matrícula sem includeDeleted deve retornar null
- Buscar com includeDeleted deve retornar o registro

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 13: Buscar Documentos Pendentes de Aluno

**Objetivo:** Verificar que `getPendingDocuments()` lista corretamente status de documentos

**Passos:**
1. Criar aluno e documentos variados
   ```bash
   # Document 1: approved
   # Document 2: pending
   # Document 3: rejected
   ```
2. Chamar `EnrollmentService.getPendingDocuments(studentId)`
   ```bash
   const docStatus = await EnrollmentService.getPendingDocuments(10);
   ```
3. Verificar resultado

**Resultado Esperado:**
- ✓ Retorna array com todos documentos obrigatórios
- ✓ Cada item indica status (approved, pending, rejected, not_submitted)
- ✓ Indica corretamente quais estão aprovados

**Como verificar:**
- Verificar array não está vazio
- Verificar `isApproved` é true para documentos aprovados
- Verificar `status` campo indica estado correto
- Verificar `submitted` é true se documento foi enviado

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 14: Tratamento de Erros - Aluno Inexistente

**Objetivo:** Verificar que métodos tratam corretamente quando aluno não existe

**Passos:**
1. Chamar `EnrollmentService.create(99999, 1)` com aluno que não existe
   ```bash
   const result = await EnrollmentService.create(99999, 1);
   ```
2. Verificar erro

**Resultado Esperado:**
- ✓ Método lança AppError
- ✓ Código HTTP: 404
- ✓ Mensagem: "Aluno não encontrado"
- ✓ Nenhuma matrícula criada no banco

**Como verificar:**
- Try/catch captura erro com código 404
- Verificar log contém aviso: "aluno inválido"
- Conferir banco não tem registro novo

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 15: Tratamento de Erros - Curso Inexistente

**Objetivo:** Verificar que métodos tratam corretamente quando curso não existe

**Passos:**
1. Chamar `EnrollmentService.create(1, 99999)` com curso que não existe
   ```bash
   const result = await EnrollmentService.create(1, 99999);
   ```
2. Verificar erro

**Resultado Esperado:**
- ✓ Método lança AppError
- ✓ Código HTTP: 404
- ✓ Mensagem: "Curso não encontrado"
- ✓ Nenhuma matrícula criada no banco

**Como verificar:**
- Try/catch captura erro com código 404
- Verificar log contém aviso: "curso inválido"
- Conferir banco não tem registro novo

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE DE INTEGRAÇÃO

### Teste Integrado 1: Fluxo Completo de Matrícula (Pending → Active)

**Objetivo:** Validar fluxo completo: criar matrícula, aprovar documentos, ativar matrícula

**Passos:**
1. Criar aluno teste
   ```bash
   # Inserir aluno com role='student'
   ```
2. Criar matrícula (status: pending)
   ```bash
   const enrollment = await EnrollmentService.create(studentId, courseId);
   ```
3. Verificar status é 'pending'
4. Aprovar todos os documentos obrigatórios
   ```bash
   # Buscar documentos obrigatórios
   # Aprovar cada um
   ```
5. Ativar matrícula
   ```bash
   const activated = await EnrollmentService.activateEnrollment(enrollment.id);
   ```
6. Verificar status mudou para 'active'

**Resultado Esperado:**
- ✓ Matrícula criada com status 'pending'
- ✓ Documentos aprovados conforme necessário
- ✓ Matrícula ativada com sucesso
- ✓ Status final é 'active'
- ✓ Logs registram todo processo

**Como verificar:**
- Seguir cada passo e confirmar resultado
- Verificar banco de dados em cada fase
- Conferir logs mostram processo correto

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste Integrado 2: Fluxo Com Falha de Documentação

**Objetivo:** Validar que sistema impede ativação sem documentos completos

**Passos:**
1. Criar aluno e matrícula (pending)
   ```bash
   const enrollment = await EnrollmentService.create(studentId, courseId);
   ```
2. Aprovar ALGUNS documentos (não todos)
   ```bash
   # Aprovar documento tipo A, deixar tipo B como pending
   ```
3. Tentar ativar matrícula
   ```bash
   const activated = await EnrollmentService.activateEnrollment(enrollment.id);
   ```
4. Verificar que falha
5. Consultar documentos pendentes
   ```bash
   const pending = await EnrollmentService.getPendingDocuments(studentId);
   ```
6. Aprovar documentos faltantes
7. Ativar matrícula novamente

**Resultado Esperado:**
- ✓ Ativação falha quando há documentos pendentes
- ✓ Mensagem indica que nem todos documentos foram aprovados
- ✓ getPendingDocuments lista corretamente o que falta
- ✓ Após aprovar tudo, ativação funciona
- ✓ Status final é 'active'

**Como verificar:**
- Primeira tentativa deve falhar
- getPendingDocuments deve mostrar documentos não aprovados
- Segunda tentativa deve funcionar
- Status final no banco é 'active'

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE DE PERFORMANCE

### Teste de Performance 1: Validação de Documentos em Massa

**Objetivo:** Verificar performance quando há muitos documentos obrigatórios

**Passos:**
1. Criar curso com muitos documentos obrigatórios (ex: 20 tipos)
2. Criar aluno com todos os documentos (alguns aprovados, alguns pendentes)
3. Medir tempo de execução de `validateDocuments()`
   ```bash
   console.time('validate');
   const isValid = await EnrollmentService.validateDocuments(studentId);
   console.timeEnd('validate');
   ```
4. Registrar tempo

**Resultado Esperado:**
- ✓ Tempo de execução < 1 segundo (ou < 500ms se possível)
- ✓ Método retorna resultado correto
- ✓ Banco de dados não fica sobrecarregado

**Como verificar:**
- Usar console.time/console.timeEnd
- Usar ferramentas de profile do Node.js
- Monitorar conexões ativas ao banco

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE DE SEGURANÇA

### Teste de Segurança 1: Validação de IDs (Injection Prevention)

**Objetivo:** Verificar que service valida IDs para evitar injection

**Passos:**
1. Tentar chamar métodos com IDs inválidos
   ```bash
   await EnrollmentService.create("'; DROP TABLE--", 1);
   await EnrollmentService.getById("1 OR 1=1");
   ```
2. Verificar se métodos tratam corretamente
3. Verificar banco não foi afetado

**Resultado Esperado:**
- ✓ Métodos rejeitam IDs inválidos ou não encontram registros
- ✓ Nenhuma query SQL maliciosa executada
- ✓ Banco de dados permanece intacto
- ✓ Logs registram tentativas suspeitas

**Como verificar:**
- Usar ferramentas de SQL injection test
- Monitorar queries executadas no banco
- Verificar que Sequelize usa prepared statements

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE DE DADOS

### Teste de Dados 1: Transações ACID

**Objetivo:** Verificar integridade de dados em operações concorrentes

**Passos:**
1. Criar dois requests simultâneos tentando matricular mesmo aluno em cursos diferentes
   ```bash
   Promise.all([
     EnrollmentService.create(studentId, courseId1),
     EnrollmentService.create(studentId, courseId2)
   ])
   ```
2. Verificar resultado

**Resultado Esperado:**
- ✓ Apenas uma matrícula é criada (ou uma falha)
- ✓ Nenhuma integridade de dados comprometida
- ✓ Banco consistente

**Como verificar:**
- Usar ferramentas de teste de concorrência
- Verificar banco tem apenas uma matrícula válida
- Logs mostram qual tentativa falhou

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 OBSERVAÇÕES GERAIS

### Pré-requisitos para Execução
- Banco de dados MySQL configurado e vazio (ou com dados de teste)
- Tipos de documentos obrigatórios inseridos (para testes de documentação)
- Service importado corretamente no ambiente de teste
- Logger configurado para capturar logs

### Dados de Teste Recomendados
- **Alunos de Teste:** IDs 1-10 com dados válidos
- **Cursos de Teste:** IDs 1-15 com duração variada
- **Documentos Obrigatórios:** Pelo menos 3 tipos (RG, CPF, Certidão)

### Limpeza Após Testes
- Limpar registros de testes do banco
- Restaurar estado inicial do banco
- Verificar logs para investigar falhas

### Contato e Dúvidas
- Consultar documentação de models: `backend/src/models/Enrollment.js`
- Consultar contextDoc.md para arquitetura
- Revisar error.middleware.js para códigos HTTP esperados

---

**Data de atualização:** 2025-10-30
**Versão:** 1.0
