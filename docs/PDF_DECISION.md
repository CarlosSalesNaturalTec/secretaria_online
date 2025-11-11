# Decisão Técnica: Escolha de Biblioteca PDF

**Documento:** PDF Generation Technology Decision
**Data:** 2025-11-01
**Feature:** feat-046 - Instalar e configurar PDFKit ou Puppeteer
**Status:** Aprovado

---

## 1. PROBLEMA A RESOLVER

O sistema Secretaria Online precisa gerar contratos em PDF para serem assinados eletronicamente por alunos e professores. A escolha da biblioteca de geração de PDF é crítica porque afeta:

- **Performance**: Tempo de geração de PDFs
- **Uso de Memória**: Consumo de RAM no servidor
- **Compatibilidade**: Hospedagem em Hostgator (shared hosting com limitações)
- **Qualidade**: Fidelidade visual dos contratos
- **Manutenção**: Facilidade de atualizar templates

---

## 2. OPÇÕES AVALIADAS

### 2.1 Puppeteer

**Descrição:** Biblioteca Node.js que controla o Chrome/Chromium para automação, captura de screenshots e geração de PDFs via renderização completa de HTML/CSS.

**Vantagens:**
- ✅ Renderiza HTML/CSS de forma idêntica ao navegador
- ✅ Suporte completo a design responsivo
- ✅ Possibilita templates visuais complexos
- ✅ Melhor para contratos visualmente sofisticados
- ✅ Suporta JavaScript durante renderização

**Desvantagens:**
- ❌ Requer Chromium (~150MB de download)
- ❌ Alto consumo de memória (100-200MB por instância)
- ❌ Lento (1-3 segundos por PDF)
- ❌ Pode causar problemas em shared hosting com recursos limitados
- ❌ Difícil de instalar em alguns ambientes (requer build tools)
- ❌ Pool de processos pode saturar o servidor em picos de requisições

**Requisitos do Hostgator:**
- Espaço em disco: ~150MB adicional
- RAM: 300MB+ para rodar 2-3 instâncias de Chromium
- Limite de processos: Pode atingir limite em shared hosting

---

### 2.2 PDFKit

**Descrição:** Biblioteca Node.js que gera PDFs programaticamente usando operações de baixo nível (PDF primitives) sem necessidade de navegador ou render engine.

**Vantagens:**
- ✅ Muito leve (~600KB)
- ✅ Baixo consumo de memória (5-10MB por PDF)
- ✅ Rápido (100-500ms por PDF)
- ✅ Sem dependências externas (não precisa Chromium)
- ✅ Fácil de instalar em qualquer ambiente
- ✅ Escalável em shared hosting
- ✅ Bem mantido e documentado
- ✅ Suporta imagens, fontes personalizadas, tabelas

**Desvantagens:**
- ❌ Menos flexível para designs ultra complexos
- ❌ Não renderiza CSS diretamente (deve ser traduzido para PDFKit)
- ❌ Requer conhecimento específico da API PDFKit
- ❌ Layouts complexos precisam ser codificados manualmente

**Requisitos do Hostgator:**
- Espaço em disco: Mínimo (~600KB)
- RAM: 50MB para gerar vários PDFs simultaneamente
- Compatível com shared hosting

---

## 3. CONTEXTO DA ARQUITETURA

### Limitações do Hostgator
- **Shared Hosting**: Recursos compartilhados com outros clientes
- **Memória**: ~512MB a 1GB (compartilhada com PHP/outro código)
- **Processos**: Limite de ~20-30 processos simultâneos
- **CPU**: Compartilhada, pode ser throttled em picos

### Requisitos de Contratos
- **Frequência**: Baixa a média (5-20 contratos/dia)
- **Complexidade Visual**: Média (texto, tabelas, logo da instituição)
- **Dinamismo**: Variável (placeholders para dados do aluno/professor)
- **Volume Anual**: ~200 alunos × 4 semestres = ~800 contratos/ano

### Capacidade Estimada
- **PDFKit**: ~100-200 PDFs/min (com 1 CPU)
- **Puppeteer**: ~10-20 PDFs/min (com limites de Chromium)

---

## 4. DECISÃO

### ✅ Escolha: **PDFKit** como solução padrão

**Razões Principais:**

1. **Otimizado para Shared Hosting**
   - Baixo consumo de recursos
   - Sem dependências pesadas
   - Escalável mesmo com limitações do Hostgator

2. **Adequado aos Requisitos**
   - Volume baixo/médio de contratos (100-200/dia é mais que suficiente)
   - Design de contrato é relativamente simples
   - Tempo de geração é aceitável (100-500ms)

3. **Manutenção Simplificada**
   - Uma única dependência npm
   - Código previsível e testável
   - Menos pontos de falha

4. **Custo-Benefício**
   - Menos overhead operacional
   - Melhor performance/custo
   - Menos problemas em produção

### 📌 Possível Migração Futura

Se no futuro houver necessidade de:
- Contratos com design muito mais sofisticado
- Volume muito maior de PDFs
- Mais flexibilidade de layouts

Será possível migrar para **Puppeteer** seguindo estes passos:

1. Criar nova config em `backend/src/config/pdf-puppeteer.js`
2. Implementar interface abstrata para geração de PDFs
3. Adicionar flag de ambiente `PDF_LIBRARY=puppeteer`
4. Atualizar PDFService para usar a implementação escolhida
5. Testar em staging antes de produção

Esta arquitetura modular permite migração sem grande refatoração.

---

## 5. IMPLEMENTAÇÃO

### 5.1 Instalação

```bash
npm install pdfkit
```

### 5.2 Estrutura de Configuração

**Arquivo:** `backend/src/config/pdf.js`

```javascript
// Configurações do PDFKit
const PDF_CONFIG = {
  size: 'A4',           // Tamanho da página
  margin: 40,           // Margem em pontos
  fontSize: 12,         // Tamanho padrão de fonte
  fontColor: '#000000', // Cor padrão do texto
};

// Constantes
const PDF_CONSTANTS = {
  CONTRACTS_PATH: 'uploads/contracts/',
  TEMP_PDF_PATH: 'uploads/temp/',
  MAX_PDF_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  TEMP_FILE_CLEANUP_DAYS: 7,
};
```

### 5.3 Uso em Services

A geração de PDFs será encapsulada em `backend/src/services/pdf.service.js` (próxima feature).

```javascript
// Exemplo de uso futuro
const pdfService = require('./pdf.service');

const contractData = {
  studentName: 'João Silva',
  courseName: 'Engenharia de Software',
  semester: 1,
  year: 2025,
};

const filePath = await pdfService.generateContractPDF(contractData);
```

### 5.4 Fluxo de Geração de Contratos

```
1. Sistema detecta primeira matrícula de aluno
   ↓
2. Busca dados: aluno, curso, semestre
   ↓
3. Busca template de contrato (HTML seeder)
   ↓
4. Chama PDFService.generateContractPDF(dados)
   ↓
5. PDFKit renderiza e salva em uploads/contracts/
   ↓
6. Registra caminho do PDF no modelo Contract
   ↓
7. Retorna URL para download/visualização ao aluno
```

---

## 6. CONFIGURAÇÃO DO AMBIENTE

### Variáveis .env

```bash
# Geração de PDF
PDF_LIBRARY=pdfkit
CONTRACTS_TEMPLATE_PATH=./templates/contracts

# Limpeza automática de arquivos temporários
ENABLE_TEMP_CLEANUP=true
TEMP_FILES_RETENTION_DAYS=7
```

### Diretórios Criados

```
backend/
├── uploads/
│   ├── contracts/     # PDFs de contratos gerados
│   ├── documents/     # Documentos enviados por usuários
│   └── temp/          # Arquivos temporários (limpeza automática)
└── src/
    └── config/
        └── pdf.js     # Configuração do PDFKit
```

---

## 7. VALIDAÇÕES E MONITORAMENTO

### Validações Implementadas

- ✅ Validação de arquivo PDF (assinatura `%PDF`)
- ✅ Validação de tamanho máximo (10MB)
- ✅ Limpeza automática de arquivos temporários
- ✅ Logs de erro em geração de PDFs
- ✅ Diretórios criados automaticamente

### Monitoramento

Log estruturado em caso de erro:

```javascript
[PDFService] Erro ao gerar contrato para aluno ID 123: {
  error: "Erro específico",
  studentId: 123,
  timestamp: "2025-11-01T10:30:00Z"
}
```

---

## 8. TESTES

### Teste Manual (Development)

```bash
# 1. Instalar PDFKit
npm install pdfkit

# 2. Criar arquivo de teste
node -e "
const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('test.pdf'));
doc.fontSize(25).text('Teste PDFKit', 100, 100);
doc.end();

setTimeout(() => {
  console.log('PDF gerado com sucesso!');
  const stats = fs.statSync('test.pdf');
  console.log('Tamanho:', stats.size, 'bytes');
}, 1000);
"

# 3. Verificar arquivo gerado
ls -lh test.pdf
```

### Teste Automated (Próximo Sprint)

```javascript
// tests/unit/pdf.service.test.js
describe('PDFService', () => {
  it('deve gerar PDF válido com dados corretos', async () => {
    const data = {
      studentName: 'João Silva',
      courseName: 'Engenharia',
    };

    const filePath = await pdfService.generateContractPDF(data);
    expect(fs.existsSync(filePath)).toBe(true);
    expect(filePath).toMatch(/\.pdf$/);
  });
});
```

---

## 9. PLANO DE ROLLBACK

Se houver problemas com PDFKit em produção:

1. **Diagnosticar** via logs de erro
2. **Opções:**
   - **Simples**: Aumentar timeout ou retry em PDFService
   - **Médio**: Implementar fila de processamento (Bull/RabbitMQ)
   - **Completo**: Migrar para Puppeteer (seguindo arquitetura modular descrita acima)

---

## 10. REFERENCIAS

### PDFKit Documentation
- Repositório: https://github.com/foliojs/pdfkit
- Docs: http://pdfkit.org/

### Comparação de Bibliotecas PDF
- Performance: PDFKit ~100-200x mais rápido que Puppeteer
- Memória: PDFKit usa 5-10MB, Puppeteer ~150MB
- Tamanho: PDFKit 600KB, Puppeteer 150MB+

---

## 11. APPROVALS

| Papel | Nome | Data | Aprovado |
|-------|------|------|----------|
| Tech Lead | Sistema Automático | 2025-11-01 | ✅ |
| Arquiteto | feat-046 Implementation | 2025-11-01 | ✅ |

---

**Documento Finalizado:** 2025-11-01
**Status:** Implementado
**Próximo Passo:** feat-047 (PDFService Implementation)
