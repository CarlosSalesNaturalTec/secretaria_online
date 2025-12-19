# Resumo da Revisão - Estratégia de Migração de Professores

**Data:** 2025-12-18
**Documentos Atualizados:**
- `ESTRATEGIA_MIGRACAO.md` (v2.0)
- `ESTRATEGIA_MIGRACAO_v2.md` (novo)

---

## 🔄 O QUE MUDOU

### ❌ **VERSÃO ANTERIOR (INCORRETA)**

Criava professor fictício "Sistema Antigo" e ignorava professores reais:

```sql
INSERT INTO users (name, role)
VALUES ('Professor Sistema Antigo', 'teacher');

-- Todas as avaliações apontavam para este professor fictício
```

**Problemas:**
- Perdia informação de qual professor aplicou cada avaliação
- Ignorava dados de `profmat` e `profserie`
- Não usava professores já migrados em `teachers`

---

### ✅ **VERSÃO NOVA (CORRETA)**

Usa professores reais do sistema antigo mapeados para o sistema novo:

```javascript
// Professores já migrados
{ old_id: 4, nome: 'PATRICIA DA SILVA TEIXEIRA', new_teacher_id: 1 }
{ old_id: 5, nome: 'ROSANA SILVA COSTA', new_teacher_id: 2 }
{ old_id: 7, nome: 'JACKSON SANTOS SANTANA', new_teacher_id: 3 }
{ old_id: 8, nome: 'TAINA DA SILVA MACEDO', new_teacher_id: 4 }

// Migrar professor faltante
{ old_id: 3, nome: 'TUTOR', new_teacher_id: 5 }  // A ser criado
```

**Vantagens:**
- ✅ Preserva integridade histórica
- ✅ Usa relacionamentos `profmat` + `profserie`
- ✅ Determina professor correto de cada avaliação
- ✅ Vincula corretamente `teachers` ↔ `users`

---

## 🏗️ ARQUITETURA CONFIRMADA

### Estrutura de Professores no Sistema Novo:

```
┌─────────────┐
│  teachers   │  (Dados cadastrais)
│─────────────│
│ id          │  PK
│ nome        │  STRING(200) ←── Mapeia com professor.professor_nome
│ cpf         │
│ email       │
│ ...         │
└──────┬──────┘
       │
       │ 1:1 (opcional)
       ▼
┌─────────────┐
│    users    │  (Autenticação)
│─────────────│
│ id          │  PK
│ role        │  ENUM('admin','teacher','student')
│ teacher_id  │  FK → teachers.id (pode ser NULL)
│ login       │
│ password    │
└─────────────┘
```

### Relacionamentos nas Tabelas de Notas:

```
class_teachers.teacher_id  → teachers.id  ✅
evaluations.teacher_id     → users.id     ✅ (onde role='teacher')
```

**Por quê essa arquitetura?**
- `class_teachers`: Relaciona **cadastro** do professor com turma/disciplina
- `evaluations`: Relaciona **usuário autenticado** que criou a avaliação
- `users.teacher_id`: Vincula user de login ao cadastro completo

---

## 🗺️ FLUXO DE MAPEAMENTO

### Exemplo: Migrar Avaliação de "Português Instrumental"

**Sistema Antigo:**
```csv
boletim_novo:
  matricula=11
  disciplina="Português Instrumental"
  teste=4

profmat:
  professor_id=3 (TUTOR) → disciplina_id=42 (Português)

profserie:
  professor_id=3 (TUTOR) → sub_id=8 (Psicologia 8°)
```

**Sistema Novo (após migração):**

1. **Migrar professor TUTOR:**
   ```sql
   INSERT INTO teachers (nome) VALUES ('TUTOR');
   -- teachers.id = 5
   ```

2. **Criar usuário para TUTOR:**
   ```sql
   INSERT INTO users (name, role, teacher_id)
   VALUES ('TUTOR', 'teacher', 5);
   -- users.id = 10
   ```

3. **Popular class_teachers:**
   ```sql
   INSERT INTO class_teachers (class_id, teacher_id, discipline_id)
   VALUES (8, 5, 42);  -- teacher_id aponta para teachers.id
   ```

4. **Criar avaliação:**
   ```sql
   INSERT INTO evaluations (class_id, teacher_id, discipline_id, name)
   VALUES (8, 10, 42, 'Teste (histórico)');
   -- teacher_id aponta para users.id
   ```

5. **Criar nota:**
   ```sql
   INSERT INTO grades (evaluation_id, student_id, grade)
   VALUES (101, 11, 4.00);
   ```

---

## 📊 PROFESSORES DO SISTEMA ANTIGO

| old_id | professor_nome | Status | new_teacher_id | new_user_id |
|--------|----------------|--------|----------------|-------------|
| 3 | **TUTOR** | ⏳ A migrar | 5 (criar) | 10 (criar) |
| 4 | PATRICIA DA SILVA TEIXEIRA | ✅ Migrado | 1 | TBD |
| 5 | ROSANA SILVA COSTA | ✅ Migrado | 2 | TBD |
| 6 | Tony | ⚠️ Verificar se é aluno | - | - |
| 7 | JACKSON SANTOS SANTANA | ✅ Migrado | 3 | TBD |
| 8 | TAINA DA SILVA MACEDO | ✅ Migrado | 4 | TBD |
| 9 | Tony (duplicado) | ❌ Ignorar | - | - |

### Relações Professor-Disciplina (profmat):
- **TUTOR (3):** 9 disciplinas
- Outros: 20 relações

### Relações Professor-Série (profserie):
- **TUTOR (3):** 12 séries
- ROSANA (5): 1 série
- Tony (6): 1 série
- JACKSON (7): 1 série
- TAINA (8): 2 séries

---

## 🚀 FASES DE MIGRAÇÃO ATUALIZADAS

### **Fase 1: Preparação de Professores** (NOVA)

1. Criar tabela `migration_professor_mapping`
2. Mapear professores já migrados (4 professores)
3. Migrar professor "TUTOR" para `teachers`
4. Criar usuários (`users`) para todos os professores
5. Atualizar mapeamento com `user_id`

### **Fase 4: Associação Professor-Turma-Disciplina**

**Antes:**
```sql
-- Usava professor fictício
INSERT INTO class_teachers (class_id, teacher_id, discipline_id)
VALUES (1, @historical_teacher_id, 42);
```

**Agora:**
```sql
-- Usa professores reais via profmat + profserie
INSERT INTO class_teachers (class_id, teacher_id, discipline_id)
SELECT
  mscm.class_id,
  mpm.new_teacher_id,  -- ✅ teachers.id real
  pm.profmat_mat
FROM profserie_temp ps
JOIN profmat_temp pm ON ps.profserie_prof = pm.profmat_prof
JOIN migration_professor_mapping mpm ON ps.profserie_prof = mpm.old_professor_id
...
```

### **Fase 5: Criação de Avaliações**

**Antes:**
```sql
-- Usava @historical_teacher_id
INSERT INTO evaluations (class_id, teacher_id, discipline_id)
VALUES (1, @historical_teacher_id, 42);
```

**Agora:**
```sql
-- Busca professor correto via class_teachers → teachers → users
INSERT INTO evaluations (class_id, teacher_id, discipline_id)
SELECT
  ct.class_id,
  u.id,  -- ✅ users.id do professor correto
  ct.discipline_id
FROM class_teachers ct
JOIN teachers t ON ct.teacher_id = t.id
JOIN users u ON u.teacher_id = t.id
WHERE u.role = 'teacher';
```

---

## ✅ BENEFÍCIOS DA REVISÃO

1. **Integridade Histórica:** Preserva informação de qual professor aplicou cada avaliação
2. **Dados Reais:** Usa professores que de fato lecionaram as disciplinas
3. **Rastreabilidade:** Mantém vínculo com dados originais via `profmat` e `profserie`
4. **Conformidade:** Segue arquitetura correta do sistema novo (teachers + users)
5. **Flexibilidade:** Permite criar usuários de login posteriormente se necessário

---

## ⚠️ PONTOS DE ATENÇÃO

1. **Professor "Tony":**
   - Aparece em `professor` mas pode ser estudante
   - **Ação:** Verificar em `students` antes de migrar

2. **Usuários (users) para professores:**
   - Alguns professores podem não ter usuário ainda
   - **Ação:** Script criará automaticamente com login `prof{id}` e senha dummy

3. **Avaliações sem professor em class_teachers:**
   - Pode haver disciplinas sem relação em `profmat/profserie`
   - **Fallback:** Usar professor "TUTOR" como padrão

---

## 📝 PRÓXIMOS PASSOS

1. ✅ Estratégia revisada e documentada
2. ⏳ Criar scripts de migração (15 scripts)
3. ⏳ Testar em ambiente de desenvolvimento
4. ⏳ Validar mapeamento de professores
5. ⏳ Executar migração em produção

---

**Documento criado por:** Claude Code AI
**Última atualização:** 2025-12-18
