# Regeneração de PDFs de Contratos

Este documento explica como regenerar PDFs para contratos que não foram gerados devido a problemas com dependências ou outros erros.

## Problema

Alguns contratos foram criados no banco de dados mas não tiveram seus respectivos PDFs gerados, resultando em `file_path` e `file_name` NULL na tabela `contracts`. Isso geralmente ocorre devido a:

1. **Dependências faltantes**: Falta de bibliotecas do sistema necessárias para geração de PDF (Chromium, Puppeteer)
2. **Erros de caminho**: Uso de caminhos relativos ao invés de absolutos (já corrigido)
3. **Problemas de permissão**: Falta de permissão para escrever na pasta de contratos
4. **Falhas silenciosas**: Erros durante a geração que não impediram a criação do registro do contrato

## Solução: Script de Regeneração

Foi criado um script que:
- Busca todos os contratos sem PDF no banco de dados
- Para cada contrato, recupera todos os dados necessários (usuário, template, enrollment, curso)
- Gera o PDF usando o mesmo `PDFService` utilizado pelo sistema
- Atualiza os campos `file_path` e `file_name` no banco de dados
- Gera um relatório detalhado de sucesso/falha

## Como Usar

### 1. Verificar Contratos Sem PDF

```bash
cd backend

node -e "const { Contract } = require('./src/models'); (async () => { const total = await Contract.count(); const withPDF = await Contract.count({ where: { file_path: { [require('sequelize').Op.ne]: null } } }); const withoutPDF = total - withPDF; console.log('Total:', total); console.log('Com PDF:', withPDF); console.log('Sem PDF:', withoutPDF); process.exit(0); })()"
```

### 2. Executar Script de Regeneração

```bash
cd backend

node scripts/regenerate-missing-contract-pdfs.js
```

O script irá:
1. Buscar todos os contratos sem PDF
2. Exibir a lista de contratos encontrados
3. Aguardar 5 segundos (você pode cancelar com Ctrl+C)
4. Regenerar os PDFs um por um
5. Exibir um relatório final com sucessos e falhas

### 3. Verificar Resultados

Após a execução, o script exibirá um relatório como:

```
=== RELATÓRIO DE REGENERAÇÃO ===

Total de contratos processados: 9
✓ Sucessos: 9
✗ Falhas: 0

Contratos regenerados com sucesso:
  1. Contract ID: 3, User: ADENILSON DOS ANJOS SANTOS, File: contract_150_s2_2025_...pdf
  2. Contract ID: 4, User: VALERIA DIAS COELHO, File: contract_81_s2_2025_...pdf
  ...

✓ Todos os PDFs foram regenerados com sucesso!
```

## Logs

Em caso de erros, verifique os logs do sistema:

```bash
# Logs gerais
cat backend/logs/combined.log

# Logs de erro
cat backend/logs/error.log
```

## Detalhes Técnicos

### Arquivo do Script
- **Localização**: `backend/scripts/regenerate-missing-contract-pdfs.js`
- **Dependências**: Mesmas do sistema principal (Sequelize, PDFService, etc.)

### Como Funciona

1. **Busca de Contratos**: Query SQL para encontrar contratos com `file_path IS NULL` ou `file_name IS NULL`

2. **Recuperação de Dados**: Para cada contrato:
   - Busca o usuário (aluno) vinculado
   - Busca o template utilizado
   - Busca o enrollment (matrícula) se houver `enrollment_id`
   - Busca o curso através do enrollment

3. **Preparação de Placeholders**: Monta objeto com todos os dados necessários para o template:
   - Dados do aluno: nome, CPF, RG, endereço, etc.
   - Dados do curso: nome, duração, etc.
   - Dados da matrícula: número, semestre atual, etc.
   - Dados do contrato: semestre, ano, data, etc.

4. **Geração do PDF**: Usa o `PDFService.generateContractPDF()` que:
   - Substitui placeholders no template HTML
   - Gera o PDF usando html-pdf-node (Chromium/Puppeteer)
   - Salva o arquivo em `backend/uploads/contracts/`
   - Retorna informações do arquivo gerado

5. **Atualização do Banco**: Atualiza os campos `file_path` e `file_name` do contrato

### Placeholders Suportados

O script preenche todos os placeholders necessários para o template de contrato:

- `{{studentName}}` - Nome do aluno
- `{{studentRG}}` - RG do aluno
- `{{studentCPF}}` - CPF do aluno (formatado)
- `{{studentBirthDate}}` - Data de nascimento
- `{{studentAddress}}` - Endereço completo
- `{{studentPhone}}` - Telefone
- `{{studentEmail}}` - E-mail
- `{{enrollmentNumber}}` - Número da matrícula
- `{{courseName}}` - Nome do curso
- `{{currentSemester}}` - Semestre atual do aluno
- `{{contractDate}}` - Data de criação do contrato
- `{{semester}}` - Semestre do contrato
- `{{year}}` - Ano do contrato
- `{{institutionName}}` - Nome da instituição
- `{{currentDate}}` - Data atual
- `{{currentDateTime}}` - Data e hora atual

### Tratamento de Dados Faltantes

Se algum dado não estiver disponível, o script usa valores padrão:
- Dados do aluno não encontrados: "N/A"
- Curso não encontrado: "Curso não especificado"
- Enrollment não encontrado: Busca enrollment ativo do aluno

## Troubleshooting

### Erro: "Campos obrigatórios faltando no contrato"

**Causa**: PDFService requer campos obrigatórios como `studentId`, `studentName`, `courseId`, `courseName`, `semester`, `year`.

**Solução**: Verificar se os dados do usuário e enrollment estão corretos no banco de dados.

### Erro: "Cannot use 'in' operator to search for..."

**Causa**: Placeholder faltando no objeto de dados passado para o template.

**Solução**: Adicionar o placeholder faltante na função `preparePlaceholderData()` do script.

### Erro: "html-pdf-node" ou "Chromium"

**Causa**: Dependências do sistema faltantes para geração de PDF.

**Solução**:
```bash
# Linux (Ubuntu/Debian)
sudo apt-get install -y chromium-browser

# ou instalar dependências manualmente
npx @sparticuz/chromium
```

Veja também: `backend/README.md` seção "Dependências do Sistema"

### PDFs Gerados Mas Campos Ainda NULL

**Causa**: Falha na atualização do banco de dados.

**Solução**: Verificar logs de erro e permissões de escrita no banco de dados.

## Manutenção Preventiva

Para evitar esse problema no futuro:

1. **Sempre usar caminhos absolutos**: Usar `CONTRACTS_PATH` de `backend/src/config/pdf.js`
2. **Verificar dependências**: Garantir que Chromium/Puppeteer estão instalados
3. **Monitorar logs**: Verificar `backend/logs/error.log` regularmente
4. **Testar em produção**: Após deploy, criar um contrato de teste e verificar se PDF foi gerado

## Referências

- **Documentação original do problema**: `backend/docs/FIX_CONTRACT_PDF_NULL.md`
- **Troubleshooting geral**: `backend/docs/TROUBLESHOOTING_CONTRACTS_PDF.md`
- **Script de diagnóstico**: `backend/scripts/diagnose-pdf-generation.js`
- **Configuração de PDF**: `backend/src/config/pdf.js`
- **Serviço de PDF**: `backend/src/services/pdf.service.js`
- **Serviço de contratos**: `backend/src/services/contract.service.js`

## Histórico

- **2026-01-02**: Criado script `regenerate-missing-contract-pdfs.js`
- **2025-12-23**: Correção do bug de caminho relativo em `reenrollment.service.js`
- **2025-12-15**: Identificado problema de PDFs NULL em produção
