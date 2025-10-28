# PLANO DE TESTES - feat-028: Criar utilitários de formatação e constantes

**Feature:** feat-028 - Criar utilitários de formatação e constantes
**Grupo:** Backend - Middlewares e Utilitários
**Data de criação:** 2025-10-28
**Status:** Aguardando execução

---

## 📋 TESTE FUNCIONAL 1: Constantes - Validação de Enums

### Teste 1.1: Validar roles de usuário

**Objetivo:** Verificar se todas as constantes de roles estão definidas corretamente e as funções de validação funcionam

**Passos:**
1. No terminal, acesse o diretório backend:
   ```bash
   cd backend
   ```

2. Inicie o Node.js REPL e carregue o módulo:
   ```bash
   node
   ```

3. Execute no REPL:
   ```javascript
   const constants = require('./src/utils/constants.js');

   // Verificar roles
   console.log('Roles:', constants.USER_ROLES);
   console.log('Admin válido:', constants.isValidRole('admin'));
   console.log('Teacher válido:', constants.isValidRole('teacher'));
   console.log('Student válido:', constants.isValidRole('student'));
   console.log('Invalid válido:', constants.isValidRole('invalid'));
   ```

**Resultado Esperado:**
- ✓ USER_ROLES contém: { ADMIN: 'admin', TEACHER: 'teacher', STUDENT: 'student' }
- ✓ isValidRole('admin') retorna true
- ✓ isValidRole('teacher') retorna true
- ✓ isValidRole('student') retorna true
- ✓ isValidRole('invalid') retorna false

**Como verificar:**
- Todos os valores devem corresponder exatamente ao esperado
- Função de validação deve aceitar apenas os 3 roles definidos

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 1.2: Validar status de matrícula

**Objetivo:** Verificar se os status de matrícula estão corretos

**Passos:**
1. No REPL do Node.js (continuando do teste anterior):
   ```javascript
   // Verificar status de matrícula
   console.log('Status de matrícula:', constants.ENROLLMENT_STATUS);
   console.log('Pending válido:', constants.isValidEnrollmentStatus('pending'));
   console.log('Active válido:', constants.isValidEnrollmentStatus('active'));
   console.log('Cancelled válido:', constants.isValidEnrollmentStatus('cancelled'));
   console.log('Invalid válido:', constants.isValidEnrollmentStatus('invalid'));
   ```

**Resultado Esperado:**
- ✓ ENROLLMENT_STATUS contém: { PENDING: 'pending', ACTIVE: 'active', CANCELLED: 'cancelled' }
- ✓ isValidEnrollmentStatus('pending') retorna true
- ✓ isValidEnrollmentStatus('active') retorna true
- ✓ isValidEnrollmentStatus('cancelled') retorna true
- ✓ isValidEnrollmentStatus('invalid') retorna false

**Como verificar:**
- Enum deve ter exatamente 3 status
- Função de validação deve aceitar apenas os status definidos

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 1.3: Validar status de documentos

**Objetivo:** Verificar se os status de documentos estão corretos

**Passos:**
1. No REPL do Node.js:
   ```javascript
   // Verificar status de documentos
   console.log('Status de documento:', constants.DOCUMENT_STATUS);
   console.log('Pending válido:', constants.isValidDocumentStatus('pending'));
   console.log('Approved válido:', constants.isValidDocumentStatus('approved'));
   console.log('Rejected válido:', constants.isValidDocumentStatus('rejected'));
   console.log('Invalid válido:', constants.isValidDocumentStatus('invalid'));
   ```

**Resultado Esperado:**
- ✓ DOCUMENT_STATUS contém: { PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected' }
- ✓ isValidDocumentStatus('pending') retorna true
- ✓ isValidDocumentStatus('approved') retorna true
- ✓ isValidDocumentStatus('rejected') retorna true
- ✓ isValidDocumentStatus('invalid') retorna false

**Como verificar:**
- Enum deve ter exatamente 3 status
- Função de validação deve aceitar apenas os status definidos

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 1.4: Validar tipos de avaliação

**Objetivo:** Verificar se os tipos de avaliação estão corretos

**Passos:**
1. No REPL do Node.js:
   ```javascript
   // Verificar tipos de avaliação
   console.log('Tipos de avaliação:', constants.EVALUATION_TYPES);
   console.log('Grade válido:', constants.isValidEvaluationType('grade'));
   console.log('Concept válido:', constants.isValidEvaluationType('concept'));
   console.log('Invalid válido:', constants.isValidEvaluationType('invalid'));

   // Verificar conceitos
   console.log('Conceitos:', constants.EVALUATION_CONCEPTS);
   ```

**Resultado Esperado:**
- ✓ EVALUATION_TYPES contém: { GRADE: 'grade', CONCEPT: 'concept' }
- ✓ EVALUATION_CONCEPTS contém: { SATISFACTORY: 'satisfactory', UNSATISFACTORY: 'unsatisfactory' }
- ✓ isValidEvaluationType('grade') retorna true
- ✓ isValidEvaluationType('concept') retorna true
- ✓ isValidEvaluationType('invalid') retorna false

**Como verificar:**
- Tipos de avaliação devem ser exatamente 2: grade e concept
- Conceitos devem ser exatamente 2: satisfactory e unsatisfactory

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 1.5: Validar mensagens de erro e sucesso

**Objetivo:** Verificar se as mensagens padrão estão definidas

**Passos:**
1. No REPL do Node.js:
   ```javascript
   // Verificar mensagens de erro
   console.log('Mensagens de erro:', Object.keys(constants.ERROR_MESSAGES).length);
   console.log('Exemplo erro - CPF inválido:', constants.ERROR_MESSAGES.INVALID_CPF);
   console.log('Exemplo erro - Não autorizado:', constants.ERROR_MESSAGES.UNAUTHORIZED);

   // Verificar mensagens de sucesso
   console.log('Mensagens de sucesso:', Object.keys(constants.SUCCESS_MESSAGES).length);
   console.log('Exemplo sucesso - Criado:', constants.SUCCESS_MESSAGES.CREATED);
   console.log('Exemplo sucesso - Atualizado:', constants.SUCCESS_MESSAGES.UPDATED);
   ```

**Resultado Esperado:**
- ✓ ERROR_MESSAGES tem no mínimo 15 mensagens definidas
- ✓ SUCCESS_MESSAGES tem no mínimo 8 mensagens definidas
- ✓ Mensagens são strings não vazias e em português
- ✓ Todas as mensagens importantes estão presentes (login, validação, recursos, arquivos, servidor)

**Como verificar:**
- Contar número de chaves em cada objeto
- Verificar que mensagens são claras e amigáveis

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 1.6: Validar configurações de arquivo e regex

**Objetivo:** Verificar se as configurações de arquivo e patterns regex estão corretos

**Passos:**
1. No REPL do Node.js:
   ```javascript
   // Verificar configurações de arquivo
   console.log('Tipos permitidos:', constants.ALLOWED_FILE_TYPES.DOCUMENTS);
   console.log('Extensões permitidas:', constants.ALLOWED_FILE_EXTENSIONS.DOCUMENTS);
   console.log('Tamanho máximo:', constants.FILE_SIZE_LIMITS.MAX_FILE_SIZE_MB, 'MB');

   // Testar regex patterns
   console.log('\n--- Testando Regex ---');
   console.log('CPF válido:', constants.REGEX_PATTERNS.CPF.test('123.456.789-00'));
   console.log('CPF inválido:', constants.REGEX_PATTERNS.CPF.test('12345'));
   console.log('Email válido:', constants.REGEX_PATTERNS.EMAIL.test('teste@email.com'));
   console.log('Email inválido:', constants.REGEX_PATTERNS.EMAIL.test('teste@'));
   console.log('Data válida:', constants.REGEX_PATTERNS.DATE_BR.test('28/10/2025'));
   console.log('Data inválida:', constants.REGEX_PATTERNS.DATE_BR.test('2025-10-28'));
   ```

**Resultado Esperado:**
- ✓ ALLOWED_FILE_TYPES.DOCUMENTS inclui: PDF, JPEG, JPG, PNG
- ✓ Tamanho máximo é 10MB (10485760 bytes)
- ✓ CPF '123.456.789-00' é válido no regex
- ✓ CPF '12345' é inválido no regex
- ✓ Email 'teste@email.com' é válido no regex
- ✓ Email 'teste@' é inválido no regex
- ✓ Data '28/10/2025' é válida no regex (formato BR)
- ✓ Data '2025-10-28' é inválida no regex (formato ISO)

**Como verificar:**
- Todos os regex patterns devem validar corretamente
- Configurações de arquivo devem corresponder ao requirements.md

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE FUNCIONAL 2: Formatters - Formatação de CPF

### Teste 2.1: Formatar CPF válido

**Objetivo:** Verificar se a formatação de CPF adiciona pontos e hífen corretamente

**Passos:**
1. No REPL do Node.js:
   ```bash
   node
   ```

2. Execute:
   ```javascript
   const formatters = require('./src/utils/formatters.js');

   // Testar formatação de CPF
   console.log('CPF 1:', formatters.formatCPF('12345678901'));
   console.log('CPF 2:', formatters.formatCPF('98765432100'));
   console.log('CPF já formatado:', formatters.formatCPF('123.456.789-01'));
   ```

**Resultado Esperado:**
- ✓ '12345678901' é formatado como '123.456.789-01'
- ✓ '98765432100' é formatado como '987.654.321-00'
- ✓ '123.456.789-01' permanece '123.456.789-01' (já formatado)

**Como verificar:**
- CPF deve ter formato XXX.XXX.XXX-XX
- Pontos e hífen devem estar nas posições corretas

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2.2: Remover máscara de CPF

**Objetivo:** Verificar se a remoção de máscara retorna apenas números

**Passos:**
1. No REPL do Node.js:
   ```javascript
   // Testar remoção de máscara
   console.log('CPF limpo 1:', formatters.removeCPFMask('123.456.789-01'));
   console.log('CPF limpo 2:', formatters.removeCPFMask('987.654.321-00'));
   console.log('CPF já limpo:', formatters.removeCPFMask('12345678901'));
   console.log('CPF vazio:', formatters.removeCPFMask(''));
   console.log('CPF null:', formatters.removeCPFMask(null));
   ```

**Resultado Esperado:**
- ✓ '123.456.789-01' retorna '12345678901'
- ✓ '987.654.321-00' retorna '98765432100'
- ✓ '12345678901' permanece '12345678901'
- ✓ String vazia retorna string vazia
- ✓ null retorna string vazia

**Como verificar:**
- CPF limpo deve conter apenas números (11 dígitos)
- Não deve conter pontos, hífens ou espaços

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2.3: Formatar CPF inválido

**Objetivo:** Verificar comportamento com CPF de tamanho incorreto

**Passos:**
1. No REPL do Node.js:
   ```javascript
   // Testar CPF com tamanho incorreto
   console.log('CPF curto:', formatters.formatCPF('123'));
   console.log('CPF longo:', formatters.formatCPF('123456789012345'));
   console.log('CPF vazio:', formatters.formatCPF(''));
   console.log('CPF null:', formatters.formatCPF(null));
   ```

**Resultado Esperado:**
- ✓ CPF com menos de 11 dígitos retorna valor original sem formatar
- ✓ CPF com mais de 11 dígitos retorna valor original sem formatar
- ✓ String vazia retorna string vazia
- ✓ null retorna string vazia

**Como verificar:**
- Função não deve quebrar com valores inválidos
- Deve retornar valor original se não for possível formatar

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE FUNCIONAL 3: Formatters - Formatação de Datas

### Teste 3.1: Formatar data no formato brasileiro

**Objetivo:** Verificar se datas são formatadas para DD/MM/YYYY

**Passos:**
1. No REPL do Node.js:
   ```javascript
   // Testar formatação de data
   console.log('Data 1:', formatters.formatDate(new Date('2025-10-28')));
   console.log('Data 2:', formatters.formatDate('2025-01-15T10:30:00'));
   console.log('Data 3:', formatters.formatDate('2024-12-25'));
   ```

**Resultado Esperado:**
- ✓ new Date('2025-10-28') retorna '28/10/2025'
- ✓ '2025-01-15T10:30:00' retorna '15/01/2025'
- ✓ '2024-12-25' retorna '25/12/2024'

**Como verificar:**
- Formato deve ser exatamente DD/MM/YYYY
- Dia, mês e ano devem estar corretos

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3.2: Formatar data com hora

**Objetivo:** Verificar se datas com hora são formatadas para DD/MM/YYYY HH:mm

**Passos:**
1. No REPL do Node.js:
   ```javascript
   // Testar formatação de data com hora
   console.log('DateTime 1:', formatters.formatDateTime(new Date('2025-10-28T10:30:00')));
   console.log('DateTime 2:', formatters.formatDateTime('2025-01-15T23:59:00'));
   console.log('DateTime 3:', formatters.formatDateTime('2024-12-25T00:00:00'));
   ```

**Resultado Esperado:**
- ✓ '2025-10-28T10:30:00' retorna '28/10/2025 10:30'
- ✓ '2025-01-15T23:59:00' retorna '15/01/2025 23:59'
- ✓ '2024-12-25T00:00:00' retorna '25/12/2024 00:00'

**Como verificar:**
- Formato deve ser DD/MM/YYYY HH:mm
- Hora deve estar em formato 24h

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3.3: Parsear data do formato brasileiro

**Objetivo:** Verificar conversão de string BR (DD/MM/YYYY) para objeto Date

**Passos:**
1. No REPL do Node.js:
   ```javascript
   // Testar parse de data BR
   const date1 = formatters.parseBRDate('28/10/2025');
   const date2 = formatters.parseBRDate('15/01/2025');
   const date3 = formatters.parseBRDate('32/13/2025'); // Inválida

   console.log('Parse 1:', date1, '- É Date?', date1 instanceof Date);
   console.log('Parse 2:', date2, '- É Date?', date2 instanceof Date);
   console.log('Parse inválido:', date3);
   ```

**Resultado Esperado:**
- ✓ '28/10/2025' retorna objeto Date válido
- ✓ '15/01/2025' retorna objeto Date válido
- ✓ '32/13/2025' retorna null (data inválida)
- ✓ Objetos Date criados devem ser instâncias de Date

**Como verificar:**
- Função deve retornar Date válido para datas corretas
- Deve retornar null para datas inválidas

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE FUNCIONAL 4: Formatters - Formatação de Moeda

### Teste 4.1: Formatar valores monetários

**Objetivo:** Verificar se valores são formatados para o padrão brasileiro (R$ 0.000,00)

**Passos:**
1. No REPL do Node.js:
   ```javascript
   // Testar formatação de moeda
   console.log('Valor 1:', formatters.formatCurrency(1234.56));
   console.log('Valor 2:', formatters.formatCurrency(0));
   console.log('Valor 3:', formatters.formatCurrency(999999.99));
   console.log('Valor 4:', formatters.formatCurrency('1500.75'));
   console.log('Valor negativo:', formatters.formatCurrency(-100.50));
   ```

**Resultado Esperado:**
- ✓ 1234.56 retorna 'R$ 1.234,56'
- ✓ 0 retorna 'R$ 0,00'
- ✓ 999999.99 retorna 'R$ 999.999,99'
- ✓ '1500.75' (string) retorna 'R$ 1.500,75'
- ✓ -100.50 retorna 'R$ -100,50'

**Como verificar:**
- Formato deve ser R$ X.XXX,XX
- Separador de milhar: ponto (.)
- Separador decimal: vírgula (,)
- Sempre 2 casas decimais

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 4.2: Formatar valores decimais

**Objetivo:** Verificar formatação de números decimais sem símbolo de moeda

**Passos:**
1. No REPL do Node.js:
   ```javascript
   // Testar formatação decimal
   console.log('Decimal 1:', formatters.formatDecimal(1234.567, 2));
   console.log('Decimal 2:', formatters.formatDecimal(1234.567, 3));
   console.log('Decimal 3:', formatters.formatDecimal(9.5, 2));
   console.log('Decimal 4:', formatters.formatDecimal(0, 2));
   ```

**Resultado Esperado:**
- ✓ formatDecimal(1234.567, 2) retorna '1.234,57'
- ✓ formatDecimal(1234.567, 3) retorna '1.234,567'
- ✓ formatDecimal(9.5, 2) retorna '9,50'
- ✓ formatDecimal(0, 2) retorna '0,00'

**Como verificar:**
- Formato deve ser X.XXX,XX (sem R$)
- Número de casas decimais deve respeitar parâmetro
- Arredondamento correto

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE FUNCIONAL 5: Formatters - Formatação de Telefone e CEP

### Teste 5.1: Formatar números de telefone

**Objetivo:** Verificar formatação de telefones brasileiros (celular e fixo)

**Passos:**
1. No REPL do Node.js:
   ```javascript
   // Testar formatação de telefone
   console.log('Celular:', formatters.formatPhone('11987654321'));
   console.log('Fixo:', formatters.formatPhone('1134567890'));
   console.log('Já formatado:', formatters.formatPhone('(11) 98765-4321'));
   console.log('Inválido:', formatters.formatPhone('123'));
   ```

**Resultado Esperado:**
- ✓ '11987654321' retorna '(11) 98765-4321' (celular)
- ✓ '1134567890' retorna '(11) 3456-7890' (fixo)
- ✓ '(11) 98765-4321' permanece formatado
- ✓ '123' retorna '123' (não formata se inválido)

**Como verificar:**
- Celular (11 dígitos): (XX) XXXXX-XXXX
- Fixo (10 dígitos): (XX) XXXX-XXXX
- Números inválidos não devem quebrar a função

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 5.2: Formatar CEP

**Objetivo:** Verificar formatação de CEP brasileiro

**Passos:**
1. No REPL do Node.js:
   ```javascript
   // Testar formatação de CEP
   console.log('CEP 1:', formatters.formatCEP('01310100'));
   console.log('CEP 2:', formatters.formatCEP('13090000'));
   console.log('Já formatado:', formatters.formatCEP('01310-100'));
   console.log('Inválido:', formatters.formatCEP('123'));

   // Testar remoção de máscara
   console.log('CEP limpo:', formatters.removeCEPMask('01310-100'));
   ```

**Resultado Esperado:**
- ✓ '01310100' retorna '01310-100'
- ✓ '13090000' retorna '13090-000'
- ✓ '01310-100' permanece formatado
- ✓ '123' retorna '123' (não formata se não tiver 8 dígitos)
- ✓ removeCEPMask('01310-100') retorna '01310100'

**Como verificar:**
- Formato: XXXXX-XXX
- Hífen na posição correta (após 5º dígito)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE FUNCIONAL 6: Formatters - Manipulação de Texto

### Teste 6.1: Capitalizar palavras

**Objetivo:** Verificar capitalização de nomes próprios

**Passos:**
1. No REPL do Node.js:
   ```javascript
   // Testar capitalização
   console.log('Nome 1:', formatters.capitalizeWords('joão da silva'));
   console.log('Nome 2:', formatters.capitalizeWords('MARIA JOSÉ SANTOS'));
   console.log('Nome 3:', formatters.capitalizeWords('pedro'));
   console.log('Vazio:', formatters.capitalizeWords(''));
   ```

**Resultado Esperado:**
- ✓ 'joão da silva' retorna 'João Da Silva'
- ✓ 'MARIA JOSÉ SANTOS' retorna 'Maria José Santos'
- ✓ 'pedro' retorna 'Pedro'
- ✓ '' retorna ''

**Como verificar:**
- Primeira letra de cada palavra deve ser maiúscula
- Demais letras devem ser minúsculas
- Conectores (de, da, do) também são capitalizados

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6.2: Remover acentuação

**Objetivo:** Verificar remoção de acentos de strings

**Passos:**
1. No REPL do Node.js:
   ```javascript
   // Testar remoção de acentos
   console.log('Nome 1:', formatters.removeAccents('José Pedrão'));
   console.log('Nome 2:', formatters.removeAccents('Maria Conceição'));
   console.log('Nome 3:', formatters.removeAccents('Ação'));
   console.log('Sem acento:', formatters.removeAccents('teste'));
   ```

**Resultado Esperado:**
- ✓ 'José Pedrão' retorna 'Jose Pedrao'
- ✓ 'Maria Conceição' retorna 'Maria Conceicao'
- ✓ 'Ação' retorna 'Acao'
- ✓ 'teste' retorna 'teste'

**Como verificar:**
- Todos os caracteres acentuados devem ser convertidos para versão sem acento
- Letras normais devem permanecer iguais

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6.3: Sanitizar nome de arquivo

**Objetivo:** Verificar conversão de nomes de arquivo para formato seguro

**Passos:**
1. No REPL do Node.js:
   ```javascript
   // Testar sanitização de filename
   console.log('File 1:', formatters.sanitizeFilename('Meu Documento.pdf'));
   console.log('File 2:', formatters.sanitizeFilename('Arquivo Importante 2024.docx'));
   console.log('File 3:', formatters.sanitizeFilename('Relatório (Final) - Versão 2.xlsx'));
   console.log('File 4:', formatters.sanitizeFilename('José & Maria - Contrato.pdf'));

   // Testar geração de nome único
   console.log('File único:', formatters.generateUniqueFilename('documento.pdf'));
   ```

**Resultado Esperado:**
- ✓ 'Meu Documento.pdf' retorna 'meu-documento.pdf'
- ✓ 'Arquivo Importante 2024.docx' retorna 'arquivo-importante-2024.docx'
- ✓ 'Relatório (Final) - Versão 2.xlsx' retorna 'relatorio-final-versao-2.xlsx'
- ✓ 'José & Maria - Contrato.pdf' retorna 'jose-maria-contrato.pdf'
- ✓ generateUniqueFilename retorna nome com timestamp (ex: 1698765432123-documento.pdf)

**Como verificar:**
- Apenas letras minúsculas, números, hífens, underscores e pontos
- Espaços convertidos para hífens
- Sem acentos
- Sem caracteres especiais
- Nome único deve incluir timestamp

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6.4: Formatar bytes

**Objetivo:** Verificar formatação de tamanhos de arquivo

**Passos:**
1. No REPL do Node.js:
   ```javascript
   // Testar formatação de bytes
   console.log('Bytes 1:', formatters.formatBytes(0));
   console.log('Bytes 2:', formatters.formatBytes(1024));
   console.log('Bytes 3:', formatters.formatBytes(1048576));
   console.log('Bytes 4:', formatters.formatBytes(10485760));
   console.log('Bytes 5:', formatters.formatBytes(1073741824));
   ```

**Resultado Esperado:**
- ✓ 0 retorna '0 Bytes'
- ✓ 1024 retorna '1.00 KB'
- ✓ 1048576 retorna '1.00 MB'
- ✓ 10485760 retorna '10.00 MB'
- ✓ 1073741824 retorna '1.00 GB'

**Como verificar:**
- Conversão correta entre Bytes, KB, MB, GB
- Precisão de 2 casas decimais
- Unidade correta exibida

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE DE INTEGRAÇÃO: Uso dos Utilitários em Conjunto

### Teste 7.1: Simular validação e formatação de cadastro de aluno

**Objetivo:** Verificar uso combinado de constantes e formatters em cenário real

**Passos:**
1. No REPL do Node.js:
   ```javascript
   const constants = require('./src/utils/constants.js');
   const formatters = require('./src/utils/formatters.js');

   // Simular dados de entrada (do formulário)
   const inputData = {
     name: 'joão da silva',
     cpf: '12345678901',
     email: 'joao@email.com',
     phone: '11987654321',
     role: 'student',
     enrollmentDate: '2025-10-28'
   };

   // Processar dados
   const processedData = {
     name: formatters.capitalizeWords(inputData.name),
     cpf: formatters.formatCPF(inputData.cpf),
     cpfClean: formatters.removeCPFMask(inputData.cpf),
     email: inputData.email.toLowerCase(),
     phone: formatters.formatPhone(inputData.phone),
     role: inputData.role,
     roleValid: constants.isValidRole(inputData.role),
     enrollmentDate: formatters.formatDate(inputData.enrollmentDate)
   };

   console.log('Dados processados:', JSON.stringify(processedData, null, 2));
   ```

**Resultado Esperado:**
- ✓ name: 'João Da Silva'
- ✓ cpf: '123.456.789-01'
- ✓ cpfClean: '12345678901'
- ✓ email: 'joao@email.com'
- ✓ phone: '(11) 98765-4321'
- ✓ role: 'student'
- ✓ roleValid: true
- ✓ enrollmentDate: '28/10/2025'

**Como verificar:**
- Todos os campos devem ser formatados corretamente
- Validação de role deve retornar true
- Dados processados devem estar prontos para armazenamento no banco

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 7.2: Simular validação de arquivo de documento

**Objetivo:** Verificar validação de tipo e tamanho de arquivo

**Passos:**
1. No REPL do Node.js:
   ```javascript
   // Simular upload de arquivo
   const file = {
     originalName: 'RG Frente e Verso.jpg',
     mimeType: 'image/jpeg',
     size: 2048576 // 2MB em bytes
   };

   // Validar arquivo
   const validation = {
     allowedTypes: constants.ALLOWED_FILE_TYPES.DOCUMENTS,
     typeValid: constants.ALLOWED_FILE_TYPES.DOCUMENTS.includes(file.mimeType),
     sizeValid: file.size <= constants.FILE_SIZE_LIMITS.MAX_FILE_SIZE,
     maxSizeMB: constants.FILE_SIZE_LIMITS.MAX_FILE_SIZE_MB,
     sanitizedName: formatters.sanitizeFilename(file.originalName),
     uniqueName: formatters.generateUniqueFilename(file.originalName),
     fileSize: formatters.formatBytes(file.size)
   };

   console.log('Validação de arquivo:', JSON.stringify(validation, null, 2));
   ```

**Resultado Esperado:**
- ✓ typeValid: true (JPEG está em ALLOWED_FILE_TYPES.DOCUMENTS)
- ✓ sizeValid: true (2MB < 10MB)
- ✓ maxSizeMB: 10
- ✓ sanitizedName: 'rg-frente-e-verso.jpg'
- ✓ uniqueName: '{timestamp}-rg-frente-e-verso.jpg'
- ✓ fileSize: '2.00 MB'

**Como verificar:**
- Validações de tipo e tamanho devem estar corretas
- Nome sanitizado deve estar seguro (sem espaços e caracteres especiais)
- Nome único deve conter timestamp

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📋 TESTE DE PERFORMANCE

### Teste 8.1: Performance de formatação em lote

**Objetivo:** Verificar se funções de formatação são rápidas o suficiente para processar múltiplos registros

**Passos:**
1. No REPL do Node.js:
   ```javascript
   const formatters = require('./src/utils/formatters.js');

   // Gerar array com 1000 CPFs
   const cpfs = Array.from({ length: 1000 }, (_, i) => {
     const num = String(i).padStart(11, '0');
     return num;
   });

   // Medir tempo de formatação
   console.time('Formatação de 1000 CPFs');
   const formattedCpfs = cpfs.map(cpf => formatters.formatCPF(cpf));
   console.timeEnd('Formatação de 1000 CPFs');

   console.log('Total formatado:', formattedCpfs.length);
   console.log('Exemplo:', formattedCpfs[0]);
   ```

**Resultado Esperado:**
- ✓ Formatação de 1000 CPFs deve completar em menos de 100ms
- ✓ Todos os 1000 CPFs devem estar formatados corretamente
- ✓ Não deve haver erros ou exceções

**Como verificar:**
- Tempo total deve ser inferior a 100ms
- Array resultante deve ter 1000 elementos
- Formato deve estar correto em todos os CPFs

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 📊 RESUMO DOS TESTES

**Total de testes:** 18 testes funcionais + 1 teste de performance = 19 testes

**Categorias:**
- ✅ Constantes - Validação de Enums: 6 testes
- ✅ Formatters - CPF: 3 testes
- ✅ Formatters - Datas: 3 testes
- ✅ Formatters - Moeda: 2 testes
- ✅ Formatters - Telefone e CEP: 2 testes
- ✅ Formatters - Texto: 4 testes
- ✅ Integração: 2 testes
- ✅ Performance: 1 teste

**Critérios de Sucesso:**
- Todos os testes devem passar sem erros
- Funções devem tratar casos extremos (null, vazio, inválido)
- Performance deve ser adequada para processamento em lote
- Formatação deve seguir padrões brasileiros
- Constantes devem estar completas e corretas

**Próximos Passos Após Testes:**
1. Executar todos os testes e documentar resultados
2. Corrigir quaisquer falhas identificadas
3. Marcar feature como "Concluída" no backlog.json após aprovação
4. Integrar os utilitários nos controllers e middlewares existentes
