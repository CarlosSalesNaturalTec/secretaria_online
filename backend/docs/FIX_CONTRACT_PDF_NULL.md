# Fix: Contratos com file_path e file_name NULL em Produção

## Problema Identificado

Contratos de **rematrícula** estavam sendo criados com `file_path` e `file_name` NULL porque o serviço de rematrícula (`reenrollment.service.js`) usava um **caminho relativo** ao invés do **caminho absoluto** para gerar PDFs.

## Causa Raiz

No arquivo `backend/src/services/reenrollment.service.js`, linha 195:

```javascript
// ❌ ANTES (ERRADO)
const pdfResult = await PDFService.generateContractPDF(
  placeholderData,
  processedContent,
  'uploads/contracts'  // Caminho relativo - falha em produção!
);
```

### Por Que Falhava em Produção

1. Em desenvolvimento, `process.cwd()` + `'uploads/contracts'` resolvia para o caminho correto
2. Em produção, o `process.cwd()` pode ser diferente (especialmente com PM2)
3. O `PDFService.generateContractPDF` usa `path.resolve(process.cwd(), outputDir)` na linha 102 do `pdf.service.js`
4. Se o caminho resolvido não existe ou não tem permissão, a geração de PDF **falha silenciosamente** (linha 206-217 do `reenrollment.service.js`)
5. O contrato é salvo no banco com `file_path: null` e `file_name: null`

## Correção Aplicada

### 1. Adicionado import do CONTRACTS_PATH

```javascript
// backend/src/services/reenrollment.service.js - Linha 37
const { CONTRACTS_PATH } = require('../config/pdf');
```

### 2. Substituído caminho relativo por absoluto

```javascript
// ✅ DEPOIS (CORRETO)
const pdfResult = await PDFService.generateContractPDF(
  placeholderData,
  processedContent,
  CONTRACTS_PATH  // Caminho absoluto - funciona em desenvolvimento e produção!
);
```

## Arquivos Modificados

- `backend/src/services/reenrollment.service.js`
  - Linha 37: Adicionado import `const { CONTRACTS_PATH } = require('../config/pdf');`
  - Linha 196: Substituído `'uploads/contracts'` por `CONTRACTS_PATH`

## Verificação da Correção

### Em Ambiente de Desenvolvimento

```bash
cd backend

# 1. Verificar que os scripts de diagnóstico passam
node scripts/check-contracts-permissions.js
node scripts/diagnose-pdf-generation.js

# 2. Executar análise de contratos
node scripts/check-contract-creation-flow.js
```

### Em Ambiente de Produção

```bash
# 1. Fazer pull das alterações
git pull origin develop

# 2. Reiniciar o servidor PM2
npm run pm2:restart

# 3. Verificar logs
npm run pm2:logs

# 4. Executar os scripts de diagnóstico
node scripts/check-contracts-permissions.js
node scripts/check-contract-creation-flow.js
```

### Teste Manual

1. Faça login como administrador
2. Acesse o processo de rematrícula de um aluno
3. Complete o processo de aceite de rematrícula
4. Verifique no banco de dados:
   ```sql
   SELECT id, user_id, enrollment_id, file_path, file_name, created_at
   FROM contracts
   ORDER BY created_at DESC
   LIMIT 1;
   ```
5. Verifique se `file_path` e `file_name` estão preenchidos (não NULL)
6. Verifique se o arquivo existe:
   ```bash
   ls -lh backend/uploads/contracts/
   ```

## Contratos Antigos Sem PDF

Os contratos que já foram criados sem PDF **permanecerão sem PDF**. Se necessário, você pode:

### Opção 1: Regenerar PDFs para Contratos Existentes

Criar um script para regenerar PDFs para contratos sem arquivo:

```javascript
// backend/scripts/regenerate-missing-pdfs.js
// (Script a ser criado se necessário)
```

### Opção 2: Manter Como Está

Os contratos sem PDF podem ser mantidos como "aceite digital" (sem PDF físico). O modelo `Contract.js` já suporta isso com os campos `file_path` e `file_name` nullable.

## Prevenção de Regressão

### 1. Sempre Usar CONTRACTS_PATH

Em qualquer serviço que gere PDFs de contratos, **sempre** usar:

```javascript
const { CONTRACTS_PATH } = require('../config/pdf');

// ...

const pdfResult = await PDFService.generateContractPDF(
  data,
  content,
  CONTRACTS_PATH  // ✅ SEMPRE usar a constante
);
```

**NUNCA** usar:

```javascript
const pdfResult = await PDFService.generateContractPDF(
  data,
  content,
  'uploads/contracts'  // ❌ NUNCA usar caminho relativo
);
```

### 2. Adicionar Validação no PDFService

Considerar adicionar validação no `PDFService.generateContractPDF` para rejeitar caminhos relativos:

```javascript
static async generateContractPDF(contractData, templateContent, outputDir = 'uploads/contracts') {
  // Validar se é caminho absoluto
  if (!path.isAbsolute(outputDir)) {
    logger.warn(`[PDFService] Caminho relativo detectado: ${outputDir}. Convertendo para absoluto.`);
    outputDir = path.resolve(process.cwd(), outputDir);
  }
  // ... resto do código
}
```

### 3. Logging Detalhado

O código já tem logging adequado. Sempre verificar logs em:
- `backend/logs/error.log`
- `backend/logs/combined.log`
- PM2 logs: `npm run pm2:logs`

## Commits Relacionados

- Commit anterior: `03774f0` - "fix(backend): use absolute path for contract uploads to fix production saving issue"
  - Corrigiu o `contract.service.js` mas **não** corrigiu o `reenrollment.service.js`

## Data da Correção

- Data: 2026-01-02
- Desenvolvedor: Claude Code
- Issue: Contratos com file_path e file_name NULL em produção (VM GCP)
