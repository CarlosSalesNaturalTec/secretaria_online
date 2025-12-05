# Scripts Manuais - Backend

Este diretório contém scripts que devem ser executados **manualmente** para tarefas administrativas específicas.

## 📋 Scripts Disponíveis

### 1. `create-student-users.js`

**Descrição:** Cria usuários de login para todos os estudantes cadastrados que ainda não possuem usuário.

**Funcionalidade:**
- Busca todos os estudantes ativos (não deletados)
- Filtra apenas estudantes que **não** possuem usuário de login
- Filtra apenas estudantes que **possuem** matrícula
- Cria usuário usando:
  - **Login:** Número da matrícula
  - **Senha:** Número da matrícula (com hash bcrypt)
  - **Role:** `student`
  - **Name:** Nome do estudante
  - **Email:** Email do estudante (se disponível)
  - **student_id:** ID do estudante na tabela `students`

**Quando usar:**
- Após importação de dados de estudantes
- Quando houver estudantes cadastrados sem usuário de login
- Para criar acesso em massa para estudantes

**Como executar:**

```bash
# A partir do diretório raiz do backend
cd backend

# Executar script
node scripts/create-student-users.js
```

**Exemplo de saída:**

```
🚀 Iniciando script de criação de usuários para estudantes...

✓ Conexão com banco de dados estabelecida!

========================================
CRIANDO USUÁRIOS PARA ESTUDANTES
========================================

[1/5] Buscando estudantes...
      ✓ Total de estudantes encontrados: 150

[2/5] Filtrando estudantes sem usuário...
      ✓ Estudantes sem usuário: 120
      ✓ Estudantes com usuário: 30

[3/5] Criando usuários...
      ✓ [1/120] Usuário criado para: João Silva (Matrícula: 20231001)
      ✓ [2/120] Usuário criado para: Maria Santos (Matrícula: 20231002)
      ...
      ✓ [120/120] Usuário criado para: Carlos Oliveira (Matrícula: 20231120)

[4/5] Processamento concluído!
      ✓ Usuários criados: 120
      ✗ Erros: 0

[5/5] Nenhum erro encontrado!

========================================
RELATÓRIO FINAL
========================================
Total de estudantes: 150
Estudantes sem usuário: 120
Estudantes com usuário: 30
Usuários criados: 120
Erros: 0
========================================
```

**Observações importantes:**
- ⚠️ Este script deve ser executado **apenas uma vez** após importação de dados
- ⚠️ Estudantes que já possuem usuário serão **ignorados**
- ⚠️ Estudantes sem matrícula serão **ignorados**
- ✅ O script é **idempotente**: pode ser executado múltiplas vezes sem duplicar usuários
- ✅ A senha padrão será a **matrícula** do estudante
- ✅ Os estudantes deverão **alterar a senha** no primeiro acesso

**Verificações pós-execução:**

```bash
# Conectar ao MySQL
mysql -u root -p secretaria_online

# Verificar usuários criados
SELECT u.id, u.login, u.name, u.role, s.matricula, s.nome
FROM users u
INNER JOIN students s ON u.student_id = s.id
WHERE u.role = 'student'
ORDER BY u.created_at DESC
LIMIT 20;

# Contar usuários por role
SELECT role, COUNT(*) as total
FROM users
WHERE deleted_at IS NULL
GROUP BY role;
```

---

### 2. `create-student-users.sql`

**Descrição:** Documentação SQL de referência (não executável diretamente).

**Observação:** Este arquivo serve apenas como **documentação**. MySQL não possui função nativa para gerar hashes bcrypt, portanto use o script JavaScript (`create-student-users.js`) para execução real.

O arquivo SQL contém:
- Queries de verificação
- Consultas para análise de dados
- Referências para entender a lógica

---

## 🔒 Segurança

### Senhas Provisórias

Todos os usuários criados pelos scripts terão **senhas provisórias** baseadas na matrícula.

**Recomendações:**
1. Implementar fluxo de **primeiro acesso** que force alteração de senha
2. Orientar estudantes a alterarem senha imediatamente
3. Configurar política de senha forte (mínimo 8 caracteres, letras + números)
4. Considerar envio de email com instruções de primeiro acesso

### Hash de Senhas

- Algoritmo: **bcrypt**
- Salt rounds: **10** (padrão seguro)
- Senha nunca é armazenada em texto plano
- Hash é gerado automaticamente pelo model `User`

---

## 📝 Logs

Os scripts exibem logs detalhados durante execução:
- ✓ Sucesso (verde)
- ✗ Erro (vermelho)
- ℹ Informação (azul)

Todos os logs são exibidos no console em tempo real.

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"

**Problema:** Dependências não instaladas

**Solução:**
```bash
cd backend
npm install
```

### Erro: "Error: connect ECONNREFUSED"

**Problema:** Banco de dados não está rodando

**Solução:**
```bash
# Windows
net start MySQL80

# Linux/Mac
sudo systemctl start mysql
```

### Erro: "Unique constraint violation"

**Problema:** Login já existe (matrícula duplicada)

**Solução:**
- Verificar se há matrículas duplicadas na tabela `students`
- O script exibirá erro detalhado para cada caso
- Corrigir matrículas duplicadas manualmente

### Erro: "SequelizeValidationError"

**Problema:** Dados inválidos (email, CPF, etc)

**Solução:**
- Verificar dados do estudante na tabela `students`
- Corrigir dados inválidos antes de executar o script
- O script continuará e criará usuários para estudantes com dados válidos

---

## 📚 Referências

- [Documentação Backend](../README.md)
- [Documentação de Context](../../docs/contextDoc.md)
- [Model User](../src/models/User.js)
- [Model Student](../src/models/Student.js)

---

**Última atualização:** 2025-12-03
**Versão:** 1.0.0
