# Análise de Modelagem de Dados para Rematrícula Global

**Data:** 2025-12-15
**Versão:** 1.0
**Status:** Concluída
**Responsável:** Sistema de Análise Técnica

---

## 1. OBJETIVO DA ANÁLISE

Analisar a estrutura atual do banco de dados e identificar campos/relacionamentos necessários para suportar o processo de **rematrícula global de estudantes**, conforme especificado no backlog de rematrícula.

---

## 2. ANÁLISE DOS MODELOS EXISTENTES

### 2.1. Model: Enrollment (`backend/src/models/Enrollment.js`)

**Campos Existentes:**

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| id | INTEGER | NOT NULL | Chave primária, auto-increment |
| student_id | INTEGER UNSIGNED | NOT NULL | FK para tabela `students` |
| course_id | INTEGER | NOT NULL | FK para tabela `courses` |
| status | ENUM('pending', 'active', 'cancelled') | NOT NULL | Status da matrícula |
| enrollment_date | DATEONLY | NOT NULL | Data da matrícula |
| created_at | DATE | NOT NULL | Timestamp de criação |
| updated_at | DATE | NOT NULL | Timestamp de atualização |
| deleted_at | DATE | NULL | Soft delete timestamp |

**Associações Existentes:**
- `belongsTo(Student, { foreignKey: 'student_id', as: 'student' })`
- `belongsTo(Course, { foreignKey: 'course_id', as: 'course' })`

**Regras de Negócio Implementadas:**
- Um aluno pode ter apenas UMA matrícula ativa/pending por vez
- Status padrão: 'pending' (aguardando aprovação de documentos)
- Soft delete habilitado (paranoid: true)

**✅ CONCLUSÃO:** Tabela `enrollments` **NÃO precisa** de campos `semester` e `year`.

**JUSTIFICATIVA:**
- Enrollment representa a matrícula de um estudante em um **curso completo** (não em um semestre específico)
- Um estudante permanece matriculado no curso por múltiplos semestres
- Contratos são renovados semestralmente, mas o enrollment permanece o mesmo
- Os campos `semester` e `year` pertencem ao contrato (documento de renovação semestral), não à matrícula

---

### 2.2. Model: Contract (`backend/src/models/Contract.js`)

**Campos Existentes:**

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| id | INTEGER | NOT NULL | Chave primária, auto-increment |
| user_id | INTEGER UNSIGNED | NOT NULL | FK para tabela `users` |
| template_id | INTEGER | NOT NULL | FK para tabela `contract_templates` |
| file_path | STRING(255) | **NOT NULL** ⚠️ | Caminho do arquivo PDF |
| file_name | STRING(255) | **NOT NULL** ⚠️ | Nome do arquivo PDF |
| accepted_at | DATE | NULL | Data/hora do aceite do contrato |
| semester | INTEGER | NOT NULL | Semestre do contrato (1-12) |
| year | INTEGER | NOT NULL | Ano do contrato (2020-2100) |
| created_at | DATE | NOT NULL | Timestamp de criação |
| updated_at | DATE | NOT NULL | Timestamp de atualização |
| deleted_at | DATE | NULL | Soft delete timestamp |

**Associações Existentes:**
- `belongsTo(User, { foreignKey: 'user_id', as: 'user' })`
- `belongsTo(ContractTemplate, { foreignKey: 'template_id', as: 'template' })`

**❌ PROBLEMA IDENTIFICADO:** Tabela `contracts` **NÃO possui** campo `enrollment_id`.

**IMPACTO:**
- Atualmente, contratos estão vinculados apenas a `user_id`, sem referência explícita à matrícula
- Impossível vincular um contrato a uma matrícula específica
- Dificulta rastreamento de contratos de rematrícula por curso/matrícula

**⚠️ PROBLEMA IDENTIFICADO:** Campos `file_path` e `file_name` são **NOT NULL**.

**IMPACTO:**
- Sistema atual exige que todo contrato tenha PDF gerado
- Para rematrícula, contratos serão criados **APÓS aceite do estudante**
- Contratos de rematrícula **NÃO terão PDF** (apenas registro de aceite)
- Impossível criar contrato sem PDF com a estrutura atual

---

## 3. NECESSIDADES IDENTIFICADAS

### 3.1. Mudanças Necessárias em `contracts`

#### ✅ NECESSÁRIO: Adicionar campo `enrollment_id`

**Justificativa:**
- Vincular contratos a matrículas específicas
- Permitir múltiplos contratos para a mesma matrícula (renovação semestral)
- Rastrear histórico de contratos por matrícula
- Suportar processo de rematrícula global

**Especificação:**
```javascript
enrollment_id: {
  type: DataTypes.INTEGER,
  allowNull: true,  // Nullable para retrocompatibilidade com contratos antigos
  references: {
    model: 'enrollments',
    key: 'id'
  },
  onUpdate: 'CASCADE',
  onDelete: 'RESTRICT'
}
```

**Associação a Adicionar:**
```javascript
Contract.belongsTo(models.Enrollment, {
  foreignKey: 'enrollment_id',
  as: 'enrollment',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
```

**Associação Reversa em Enrollment:**
```javascript
Enrollment.hasMany(models.Contract, {
  foreignKey: 'enrollment_id',
  as: 'contracts',
});
```

#### ✅ NECESSÁRIO: Alterar `file_path` e `file_name` para nullable

**Justificativa:**
- Contratos de rematrícula serão criados APÓS aceite do estudante (Etapa 8 do backlog)
- **ATUALIZADO (2025-12-23):** Contratos de rematrícula AGORA terão PDF gerado automaticamente após aceite
- PDF é gerado usando PDFService após criação do contrato
- Campos nullable permitem criar contrato primeiro e preencher file_path/file_name depois
- Retrocompatibilidade: contratos antigos continuam com PDF
- Flexibilidade: sistema pode ter contratos com ou sem PDF (em caso de erro na geração)

**Especificação:**
```javascript
file_path: {
  type: DataTypes.STRING(255),
  allowNull: true,  // ALTERADO de false para true
  validate: {
    // Remover validação notNull
    isValidPath(value) {
      // Validação customizada: se fornecido, deve ser não-vazio
      if (value !== null && value !== undefined && value.trim() === '') {
        throw new Error('file_path, se fornecido, não pode estar vazio');
      }
    }
  },
},
file_name: {
  type: DataTypes.STRING(255),
  allowNull: true,  // ALTERADO de false para true
  validate: {
    // Remover validação notNull
    isValidFileName(value) {
      // Validação customizada: se fornecido, deve ser não-vazio
      if (value !== null && value !== undefined && value.trim() === '') {
        throw new Error('file_name, se fornecido, não pode estar vazio');
      }
    }
  },
}
```

---

### 3.2. Mudanças NÃO Necessárias

#### ❌ NÃO NECESSÁRIO: Adicionar `semester` e `year` em `enrollments`

**Justificativa:**
- Enrollment representa matrícula no curso completo, não em semestre específico
- Informações de semestre/ano já existem em `contracts`
- Um enrollment pode ter múltiplos contratos ao longo do tempo
- Cada contrato representa renovação de um semestre específico
- Separação de responsabilidades: enrollment (matrícula) vs contract (renovação semestral)

---

## 4. MIGRATIONS NECESSÁRIAS

### Migration 1: Adicionar campo `enrollment_id` em `contracts`

**Arquivo:** `backend/database/migrations/YYYYMMDDHHMMSS-add-enrollment-id-to-contracts.js`

**Operações:**
- Adicionar coluna `enrollment_id` (INT, nullable)
- Adicionar FK constraint para tabela `enrollments`
- Adicionar índice para performance

**Rollback:**
- Remover FK constraint
- Remover coluna `enrollment_id`

---

### Migration 2: Alterar `file_path` e `file_name` para nullable em `contracts`

**Arquivo:** `backend/database/migrations/YYYYMMDDHHMMSS-allow-null-file-fields-in-contracts.js`

**Operações:**
- Alterar coluna `file_path` para `allowNull: true`
- Alterar coluna `file_name` para `allowNull: true`

**Rollback:**
- Restaurar `file_path` para `allowNull: false`
- Restaurar `file_name` para `allowNull: false`

**⚠️ ATENÇÃO:** Rollback pode falhar se existirem contratos com file_path/file_name null no banco.

---

## 5. IMPACTO E RETROCOMPATIBILIDADE

### 5.1. Impacto da Adição de `enrollment_id`

**Dados Existentes:**
- Contratos antigos terão `enrollment_id = NULL`
- Sistema continua funcionando normalmente
- Novos contratos devem preencher `enrollment_id`

**Compatibilidade:**
- ✅ Queries existentes continuam funcionando (campo nullable)
- ✅ Contratos antigos continuam acessíveis via `user_id`
- ✅ Novos contratos terão vínculo explícito com enrollment

---

### 5.2. Impacto da Mudança de `file_path` e `file_name` para Nullable

**Dados Existentes:**
- Contratos antigos já possuem file_path e file_name preenchidos
- Nenhum impacto em dados existentes

**Compatibilidade:**
- ✅ Queries existentes continuam funcionando
- ✅ Download de PDFs continua funcionando para contratos antigos
- ⚠️ Sistema deve verificar se `file_path !== null` antes de tentar servir PDF
- ⚠️ Frontend deve exibir status diferente para contratos com/sem PDF

**Mudanças Necessárias no Código:**

**Backend - Services/Controllers:**
```javascript
// Antes (sempre assume que tem PDF)
const pdfPath = contract.file_path;
res.download(pdfPath);

// Depois (verificar se tem PDF)
if (contract.file_path) {
  res.download(contract.file_path);
} else {
  return res.status(404).json({
    error: 'Este contrato não possui PDF gerado'
  });
}
```

**Frontend:**
```typescript
// Verificar antes de exibir botão "Download PDF"
{contract.file_path && (
  <button onClick={() => downloadPDF(contract.id)}>
    Download PDF
  </button>
)}

// Exibir status apropriado
<span>
  {contract.file_path
    ? 'PDF Disponível'
    : 'Sem PDF (Aceite Digital)'}
</span>
```

---

## 6. ESTRUTURA DE DADOS PROPOSTA

### 6.1. Diagrama de Relacionamento (Após Mudanças)

```
┌─────────────────┐         ┌─────────────────┐
│   enrollments   │         │     courses     │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ student_id (FK) │         │ name            │
│ course_id (FK)  │────────▶│ duration        │
│ status          │         │ ...             │
│ enrollment_date │         └─────────────────┘
│ created_at      │
│ updated_at      │         ┌─────────────────┐
│ deleted_at      │         │    students     │
└────────┬────────┘         ├─────────────────┤
         │                  │ id (PK)         │
         │                  │ nome            │
         │ 1:N              │ cpf             │
         │                  │ ...             │
         │                  └─────────────────┘
         │                           ▲
         │                           │ FK
         │                           │
         ▼                           │
┌─────────────────┐         ┌─────────────────┐
│    contracts    │         │      users      │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ user_id (FK)    │────────▶│ student_id (FK) │
│ enrollment_id   │◀────┐   │ role            │
│   (FK, NULL) ✨ │     │   │ login           │
│ template_id (FK)│     │   │ ...             │
│ file_path (NULL)│ ✨  │   └─────────────────┘
│ file_name (NULL)│ ✨  │
│ accepted_at     │     │
│ semester        │     │
│ year            │     │
│ created_at      │     │
│ updated_at      │     └───────────────┘
│ deleted_at      │      Novo relacionamento
└─────────────────┘

Legenda:
✨ = Campos modificados/adicionados
FK = Foreign Key
PK = Primary Key
NULL = Permite valores nulos
1:N = Relacionamento um-para-muitos
```

### 6.2. Exemplo de Dados (Fluxo de Rematrícula)

**Situação Inicial:**

```sql
-- Enrollment existente (estudante matriculado no curso)
enrollments:
  id: 1
  student_id: 146
  course_id: 2
  status: 'active'
  enrollment_date: '2025-01-15'

-- Contrato inicial (primeiro semestre)
contracts:
  id: 1
  user_id: 200
  enrollment_id: 1
  template_id: 1
  file_path: 'uploads/contracts/contract_1.pdf'
  file_name: 'contrato_joao_2025_1.pdf'
  accepted_at: '2025-01-20T10:30:00'
  semester: 1
  year: 2025
```

**Após Rematrícula Global (Etapa 3 do backlog):**

```sql
-- Enrollment atualizado para 'pending'
enrollments:
  id: 1
  student_id: 146
  course_id: 2
  status: 'pending'  ← ALTERADO
  enrollment_date: '2025-01-15'

-- Contrato antigo permanece inalterado
contracts (id: 1): [sem mudanças]
```

**Após Aceite do Estudante (Etapa 8 do backlog):**

```sql
-- Enrollment reativado
enrollments:
  id: 1
  student_id: 146
  course_id: 2
  status: 'active'  ← REATIVADO
  enrollment_date: '2025-01-15'

-- NOVO contrato de rematrícula (2º semestre)
contracts:
  id: 2
  user_id: 200
  enrollment_id: 1  ← VINCULADO À MATRÍCULA
  template_id: 1
  file_path: NULL   ← SEM PDF
  file_name: NULL   ← SEM PDF
  accepted_at: '2025-07-01T14:20:00'
  semester: 2
  year: 2025
```

---

## 7. VALIDAÇÕES E REGRAS DE NEGÓCIO

### 7.1. Regras para `enrollment_id` em Contracts

**Validação 1:** Enrollment deve existir
```javascript
// No service ou model
const enrollment = await Enrollment.findByPk(enrollment_id);
if (!enrollment) {
  throw new Error('Enrollment não encontrado');
}
```

**Validação 2:** Enrollment deve pertencer ao user_id do contrato
```javascript
const user = await User.findByPk(user_id, { include: ['student'] });
if (user.student_id !== enrollment.student_id) {
  throw new Error('Enrollment não pertence a este usuário');
}
```

**Validação 3:** Não duplicar contrato para mesmo enrollment/semester/year
```javascript
const existing = await Contract.findOne({
  where: {
    enrollment_id,
    semester,
    year,
    deleted_at: null
  }
});
if (existing) {
  throw new Error('Já existe contrato para este enrollment neste período');
}
```

---

### 7.2. Regras para `file_path` e `file_name` Nullable

**Regra 1:** Se file_path é fornecido, file_name também deve ser
```javascript
if ((file_path && !file_name) || (!file_path && file_name)) {
  throw new Error('file_path e file_name devem ser fornecidos juntos ou ambos nulos');
}
```

**Regra 2:** Contratos antigos (criados antes da rematrícula) devem ter PDF
```javascript
// Em migration ou seeder de validação
const oldContracts = await Contract.findAll({
  where: {
    created_at: { [Op.lt]: '2025-12-15' },
    file_path: null
  }
});
if (oldContracts.length > 0) {
  console.warn(`AVISO: ${oldContracts.length} contratos antigos sem PDF encontrados`);
}
```

**Regra 3 (ATUALIZADA 2025-12-23):** Contratos de rematrícula devem ter PDF gerado automaticamente
```javascript
// No ReenrollmentService ao criar contrato
const contract = await Contract.create({
  user_id,
  enrollment_id,
  template_id,
  file_path: null,     // Preenchido após geração do PDF
  file_name: null,     // Preenchido após geração do PDF
  semester,
  year,
  accepted_at: new Date()  // Aceite imediato
});

// Gerar PDF automaticamente após criação
const pdfResult = await PDFService.generateContractPDF(
  placeholderData,
  processedContent,
  'uploads/contracts'
);

// Atualizar contrato com file_path e file_name
contract.file_path = pdfResult.relativePath;
contract.file_name = pdfResult.fileName;
await contract.save();
```

---

## 8. CRONOGRAMA DE IMPLEMENTAÇÃO

### Etapa 1: ✅ Análise e Modelagem (CONCLUÍDA)
- ✅ Leitura dos models Enrollment e Contract
- ✅ Identificação de campos necessários
- ✅ Documentação de análise

### Etapa 2: Migrations e Atualização de Models (PRÓXIMA)
- ⏳ Criar migration para adicionar `enrollment_id`
- ⏳ Criar migration para nullable `file_path` e `file_name`
- ⏳ Atualizar model Contract.js
- ⏳ Atualizar model Enrollment.js (associação reversa)
- ⏳ Executar migrations

---

## 9. RISCOS E MITIGAÇÕES

### Risco 1: Contratos antigos sem enrollment_id

**Impacto:** Médio
**Probabilidade:** Alta (todos os contratos existentes)

**Mitigação:**
- Campo `enrollment_id` será nullable
- Contratos antigos continuam funcionando com `user_id`
- Implementar script de migração de dados (opcional):
  ```javascript
  // Script para vincular contratos antigos a enrollments
  const contracts = await Contract.findAll({ where: { enrollment_id: null } });
  for (const contract of contracts) {
    const user = await User.findByPk(contract.user_id, { include: ['student'] });
    if (user.student) {
      const enrollment = await Enrollment.findOne({
        where: { student_id: user.student.id }
      });
      if (enrollment) {
        await contract.update({ enrollment_id: enrollment.id });
      }
    }
  }
  ```

---

### Risco 2: Quebra de funcionalidade de download de PDF

**Impacto:** Alto
**Probabilidade:** Média

**Mitigação:**
- Sempre verificar `if (contract.file_path)` antes de servir PDF
- Retornar erro 404 apropriado se PDF não existir
- Atualizar frontend para exibir status correto
- Testes de regressão em funcionalidades de download

---

### Risco 3: Rollback de migration de nullable pode falhar

**Impacto:** Médio
**Probabilidade:** Baixa

**Mitigação:**
- Documentar que rollback pode falhar se houver contratos sem PDF
- Antes de rollback, verificar se existem contratos com file_path NULL
- Criar backup do banco antes de executar migrations

---

## 10. CHECKLIST DE VALIDAÇÃO

Antes de prosseguir para Etapa 2:

- [x] Models Enrollment e Contract foram lidos e analisados
- [x] Campos necessários foram identificados
- [x] Campos desnecessários foram descartados com justificativa
- [x] Impacto em retrocompatibilidade foi avaliado
- [x] Regras de negócio foram documentadas
- [x] Riscos foram identificados e mitigações propostas
- [x] Estrutura de dados proposta está documentada
- [x] Exemplos de dados foram fornecidos
- [x] Documento de análise foi criado

---

## 11. PRÓXIMOS PASSOS

1. ✅ **Atualizar backend/README.md** com início do módulo de rematrícula
2. ⏳ **Revisar e aprovar** este documento de análise
3. ⏳ **Iniciar Etapa 2:** Criar migrations identificadas
4. ⏳ **Atualizar models** Contract e Enrollment
5. ⏳ **Executar migrations** no ambiente de desenvolvimento
6. ⏳ **Testar rollback** das migrations

---

## 12. REFERÊNCIAS

- **Backlog de Rematrícula:** `backlog/backlog_rematricula.json`
- **Model Enrollment:** `backend/src/models/Enrollment.js`
- **Model Contract:** `backend/src/models/Contract.js`
- **Documentação de Contexto:** `docs/contextDoc.md`
- **Backend README:** `backend/README.md`

---

**Documento aprovado para implementação:** ✅
**Data de aprovação:** 2025-12-15
**Próxima revisão:** Após conclusão da Etapa 2
