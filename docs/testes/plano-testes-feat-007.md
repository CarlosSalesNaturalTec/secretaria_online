# PLANO DE TESTES - feat-007: Criar migration e model User

**Feature:** feat-007 - Criar migration e model User
**Grupo:** Banco de Dados e Modelos
**Data de criação:** 2025-10-25
**Status:** Aguardando execução

---

## 🔧 PREPARAÇÃO DO AMBIENTE

### Pré-requisitos

Certifique-se que o ambiente está configurado:

```bash
# 1. Acesse a pasta do backend
cd backend

# 2. Verifique se o arquivo .env está configurado corretamente
# Confirme as variáveis de banco de dados:
# DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

# 3. Certifique-se que o banco de dados foi criado
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS secretaria_online CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. Teste a conexão com o banco
node src/config/test-connection.js
```

**Esperado:**
```
✓ Database connection has been established successfully.
✓ SUCESSO: Conexão estabelecida com sucesso!
```

### Variáveis de Ambiente Necessárias

- [x] DB_HOST configurada (ex: localhost)
- [x] DB_PORT configurada (ex: 3306)
- [x] DB_NAME configurada (ex: secretaria_online)
- [x] DB_USER configurada (ex: root)
- [x] DB_PASSWORD configurada
- [x] NODE_ENV configurada (ex: development)

---

## 📋 TESTES FUNCIONAIS

### Teste 1: Executar Migration create-users

**Objetivo:** Verificar se a migration cria a tabela users corretamente com todos os campos e índices

**Passos:**
1. Execute a migration:
   ```bash
   cd backend
   npm run db:migrate
   ```

2. Verifique se a tabela foi criada:
   ```bash
   mysql -u root -p secretaria_online -e "DESCRIBE users;"
   ```

3. Verifique os índices criados:
   ```bash
   mysql -u root -p secretaria_online -e "SHOW INDEX FROM users;"
   ```

**Resultado Esperado:**
- ✓ Migration executada sem erros
- ✓ Tabela `users` criada com os campos:
  - id (INT UNSIGNED, PRIMARY KEY, AUTO_INCREMENT)
  - role (ENUM: admin, teacher, student)
  - name (VARCHAR 255, NOT NULL)
  - email (VARCHAR 255, NOT NULL, UNIQUE)
  - login (VARCHAR 100, NOT NULL, UNIQUE)
  - password_hash (VARCHAR 255, NOT NULL)
  - cpf (VARCHAR 11, NOT NULL, UNIQUE)
  - rg (VARCHAR 20, NULL)
  - created_at (DATETIME, NOT NULL)
  - updated_at (DATETIME, NOT NULL)
  - deleted_at (DATETIME, NULL)
- ✓ Índices criados:
  - idx_users_email (UNIQUE)
  - idx_users_login (UNIQUE)
  - idx_users_cpf (UNIQUE)
  - idx_users_role
  - idx_users_deleted_at
- ✓ Mensagem de sucesso exibida: "✓ Tabela users criada com sucesso"

**Como verificar:**
- Inspecionar output da migration
- Executar `DESCRIBE users` no MySQL
- Executar `SHOW INDEX FROM users` no MySQL

**Resultado Indesejado:**
- ✗ Erro ao criar tabela
- ✗ Campos faltando ou com tipo incorreto
- ✗ Índices não criados
- ✗ Constraints não aplicadas

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Reverter Migration (Rollback)

**Objetivo:** Verificar se a migration pode ser revertida corretamente (drop table)

**Passos:**
1. Reverta a última migration:
   ```bash
   npm run db:migrate:undo
   ```

2. Verifique se a tabela foi removida:
   ```bash
   mysql -u root -p secretaria_online -e "SHOW TABLES LIKE 'users';"
   ```

3. Re-execute a migration para preparar próximos testes:
   ```bash
   npm run db:migrate
   ```

**Resultado Esperado:**
- ✓ Migration revertida sem erros
- ✓ Tabela `users` removida do banco
- ✓ Índices removidos automaticamente
- ✓ Mensagem de sucesso: "✓ Tabela users removida com sucesso"
- ✓ Re-execução da migration funciona corretamente

**Como verificar:**
- Executar `SHOW TABLES` após rollback (não deve listar users)
- Verificar mensagem de sucesso no console

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 3: Criar Usuário Válido via Model

**Objetivo:** Verificar se o Model User cria registros corretamente com hash de senha automático

**Passos:**
1. Crie um script de teste `backend/test-user-create.js`:
   ```javascript
   const { User } = require('./src/models');

   (async () => {
     try {
       const user = await User.create({
         role: 'student',
         name: 'João da Silva Teste',
         email: 'joao.teste@exemplo.com',
         login: 'joaoteste',
         password: 'senha123456',  // Será hasheada automaticamente
         cpf: '11144477735',  // CPF válido para testes
         rg: 'MG1234567'
       });

       console.log('✓ Usuário criado com sucesso!');
       console.log('ID:', user.id);
       console.log('Nome:', user.name);
       console.log('Email:', user.email);
       console.log('Login:', user.login);
       console.log('Password Hash (deve estar hasheado):', user.password_hash);
       console.log('CPF:', user.cpf);
       console.log('RG:', user.rg);
       console.log('Role:', user.role);

       process.exit(0);
     } catch (error) {
       console.error('✗ Erro ao criar usuário:', error.message);
       if (error.errors) {
         error.errors.forEach(err => console.error('  -', err.message));
       }
       process.exit(1);
     }
   })();
   ```

2. Execute o script:
   ```bash
   node test-user-create.js
   ```

3. Verifique no banco de dados:
   ```bash
   mysql -u root -p secretaria_online -e "SELECT id, name, email, login, role, LEFT(password_hash, 20) AS password_preview FROM users WHERE login = 'joaoteste';"
   ```

**Resultado Esperado:**
- ✓ Usuário criado sem erros
- ✓ ID gerado automaticamente
- ✓ Senha foi hasheada (password_hash começa com $2a$ ou $2b$)
- ✓ Campos salvos corretamente
- ✓ Timestamps created_at e updated_at preenchidos
- ✓ deleted_at é NULL (usuário ativo)
- ✓ password_hash não é retornado por padrão (defaultScope)

**Como verificar:**
- Console deve exibir dados do usuário
- password_hash deve ser um hash bcrypt (60 caracteres começando com $2a$ ou $2b$)
- Consulta ao banco deve confirmar dados persistidos

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 4: Validar Senha com validatePassword()

**Objetivo:** Verificar se o método validatePassword() compara senhas corretamente

**Passos:**
1. Crie um script de teste `backend/test-user-validate-password.js`:
   ```javascript
   const { User } = require('./src/models');

   (async () => {
     try {
       // Buscar usuário (incluindo password_hash)
       const user = await User.scope('withPassword').findOne({
         where: { login: 'joaoteste' }
       });

       if (!user) {
         console.error('✗ Usuário não encontrado');
         process.exit(1);
       }

       // Testar senha correta
       const senhaCorretaValida = await user.validatePassword('senha123456');
       console.log('Senha correta "senha123456":', senhaCorretaValida ? '✓ VÁLIDA' : '✗ INVÁLIDA');

       // Testar senha incorreta
       const senhaIncorretaValida = await user.validatePassword('senhaErrada123');
       console.log('Senha incorreta "senhaErrada123":', senhaIncorretaValida ? '✗ VÁLIDA (ERRO!)' : '✓ INVÁLIDA');

       if (senhaCorretaValida && !senhaIncorretaValida) {
         console.log('\n✓ SUCESSO: Validação de senha funcionando corretamente!');
         process.exit(0);
       } else {
         console.error('\n✗ ERRO: Validação de senha não está funcionando corretamente!');
         process.exit(1);
       }
     } catch (error) {
       console.error('✗ Erro:', error.message);
       process.exit(1);
     }
   })();
   ```

2. Execute o script:
   ```bash
   node test-user-validate-password.js
   ```

**Resultado Esperado:**
- ✓ Senha correta retorna `true`
- ✓ Senha incorreta retorna `false`
- ✓ Método funciona sem erros
- ✓ Mensagem de sucesso exibida

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTES DE VALIDAÇÃO

### Teste 5: Validação de CPF Válido

**Objetivo:** Verificar se o model aceita CPFs válidos

**Input:** CPF válido `11144477735` (já usado no Teste 3)

**Método:** Criar usuário via Model (script de teste)

**Esperado:**
- ✓ CPF aceito sem erro de validação
- ✓ Usuário criado com sucesso

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 6: Validação de CPF Inválido

**Objetivo:** Verificar se o model rejeita CPFs inválidos

**Input:**
- CPF com dígitos verificadores errados: `12345678900`
- CPF com todos dígitos iguais: `11111111111`
- CPF com menos de 11 dígitos: `1234567890`
- CPF com mais de 11 dígitos: `123456789012`
- CPF com letras: `1234567890a`

**Método:** Tentar criar usuário para cada caso

**Script de teste:**
```javascript
const { User } = require('./src/models');

const cpfsInvalidos = [
  { cpf: '12345678900', motivo: 'dígitos verificadores errados' },
  { cpf: '11111111111', motivo: 'todos dígitos iguais' },
  { cpf: '1234567890', motivo: 'menos de 11 dígitos' },
  { cpf: '123456789012', motivo: 'mais de 11 dígitos' },
  { cpf: '1234567890a', motivo: 'contém letra' }
];

(async () => {
  let todosRejeitados = true;

  for (const { cpf, motivo } of cpfsInvalidos) {
    try {
      await User.create({
        role: 'student',
        name: 'Teste CPF Inválido',
        email: `teste.${cpf}@exemplo.com`,
        login: `teste.${cpf}`,
        password: 'senha123456',
        cpf: cpf,
        rg: 'MG1234567'
      });

      console.error(`✗ ERRO: CPF ${cpf} (${motivo}) foi ACEITO quando deveria ser REJEITADO!`);
      todosRejeitados = false;
    } catch (error) {
      console.log(`✓ CPF ${cpf} (${motivo}) foi corretamente REJEITADO`);
      console.log(`   Erro: ${error.errors[0].message}\n`);
    }
  }

  if (todosRejeitados) {
    console.log('✓ SUCESSO: Todos os CPFs inválidos foram rejeitados!');
    process.exit(0);
  } else {
    console.error('✗ FALHA: Alguns CPFs inválidos foram aceitos!');
    process.exit(1);
  }
})();
```

**Esperado:**
- ✓ Todos os CPFs inválidos devem ser rejeitados
- ✓ Mensagens de erro apropriadas (ex: "CPF inválido", "CPF deve ter exatamente 11 dígitos")
- ✓ Nenhum registro criado no banco

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 7: Validação de Email Inválido

**Objetivo:** Verificar se o model rejeita emails com formato inválido

**Input:**
- Email sem @ : `emailinvalido.com`
- Email sem domínio: `usuario@`
- Email sem usuário: `@dominio.com`
- Email vazio: `` (string vazia)

**Esperado:**
- ✓ Todos os emails inválidos devem ser rejeitados
- ✓ Mensagem de erro: "Email inválido"

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 8: Validação de Campos Obrigatórios

**Objetivo:** Verificar se o model exige campos obrigatórios

**Input:** Tentar criar usuário sem cada campo obrigatório:
- Sem role
- Sem name
- Sem email
- Sem login
- Sem password
- Sem cpf

**Esperado:**
- ✓ Cada tentativa deve falhar com erro específico
- ✓ Mensagens claras (ex: "Nome é obrigatório", "Email é obrigatório")
- ✓ Nenhum registro criado

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 9: Validação de Unicidade (Email, Login, CPF)

**Objetivo:** Verificar se o model impede duplicação de email, login e CPF

**Passos:**
1. Tente criar segundo usuário com mesmo email:
   ```javascript
   // Já existe joao.teste@exemplo.com
   await User.create({
     role: 'teacher',
     name: 'Maria Silva',
     email: 'joao.teste@exemplo.com',  // DUPLICADO
     login: 'mariasilva',
     password: 'senha123456',
     cpf: '52998224725',  // CPF válido diferente
     rg: 'SP9876543'
   });
   ```

2. Tente criar com mesmo login

3. Tente criar com mesmo CPF

**Esperado:**
- ✓ Todas as tentativas devem falhar
- ✓ Mensagens de erro específicas:
  - "Este email já está cadastrado"
  - "Este login já está cadastrado"
  - "Este CPF já está cadastrado"
- ✓ Erro Sequelize UniqueConstraintError

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 10: Validação de Role (Enum)

**Objetivo:** Verificar se apenas roles válidas são aceitas

**Input:**
- Role válida: `admin`, `teacher`, `student`
- Role inválida: `moderator`, `guest`, `superuser`, `123`, vazio

**Esperado:**
- ✓ Roles válidas são aceitas
- ✓ Roles inválidas são rejeitadas
- ✓ Mensagem de erro: "Role deve ser: admin, teacher ou student"

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔗 TESTES DE INTEGRAÇÃO

### Teste 11: Model Carregado Automaticamente pelo models/index.js

**Objetivo:** Verificar se o model User é carregado dinamicamente

**Passos:**
1. Crie script de teste:
   ```javascript
   const db = require('./src/models');

   console.log('Models carregados:', Object.keys(db));
   console.log('User model existe?', db.User ? 'SIM' : 'NÃO');
   console.log('Sequelize instance existe?', db.sequelize ? 'SIM' : 'NÃO');

   if (db.User && db.sequelize) {
     console.log('✓ Model User carregado com sucesso!');
     process.exit(0);
   } else {
     console.error('✗ Erro ao carregar model User!');
     process.exit(1);
   }
   ```

2. Execute:
   ```bash
   node test-models-loading.js
   ```

**Esperado:**
- ✓ `User` aparece na lista de models
- ✓ db.User é um objeto válido
- ✓ db.sequelize é instância do Sequelize

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 12: Scopes Personalizados

**Objetivo:** Verificar se os scopes (admins, teachers, students, withPassword) funcionam

**Passos:**
1. Crie usuários de diferentes roles:
   ```bash
   # Criar admin
   # Criar teacher
   # Criar student (já existe joaoteste)
   ```

2. Teste cada scope:
   ```javascript
   const { User } = require('./src/models');

   (async () => {
     // Scope students
     const students = await User.scope('students').findAll();
     console.log('Alunos encontrados:', students.length);

     // Scope teachers
     const teachers = await User.scope('teachers').findAll();
     console.log('Professores encontrados:', teachers.length);

     // Scope admins
     const admins = await User.scope('admins').findAll();
     console.log('Admins encontrados:', admins.length);

     // Scope withPassword (deve incluir password_hash)
     const userWithPassword = await User.scope('withPassword').findOne();
     console.log('password_hash incluído?', userWithPassword.password_hash ? 'SIM' : 'NÃO');

     // Sem scope (não deve incluir password_hash)
     const userWithoutPassword = await User.findOne();
     console.log('password_hash oculto por padrão?', userWithoutPassword.password_hash ? 'NÃO (ERRO)' : 'SIM');

     process.exit(0);
   })();
   ```

**Esperado:**
- ✓ Scope `students` retorna apenas alunos
- ✓ Scope `teachers` retorna apenas professores
- ✓ Scope `admins` retorna apenas admins
- ✓ Scope `withPassword` inclui password_hash
- ✓ Sem scope, password_hash é ocultado (defaultScope)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 13: Métodos Auxiliares (isAdmin, isTeacher, isStudent)

**Objetivo:** Verificar se os métodos de instância funcionam corretamente

**Script:**
```javascript
const { User } = require('./src/models');

(async () => {
  const student = await User.findOne({ where: { role: 'student' } });

  console.log('Aluno:');
  console.log('  isStudent():', student.isStudent() ? '✓ true' : '✗ false');
  console.log('  isTeacher():', student.isTeacher() ? '✗ true (ERRO!)' : '✓ false');
  console.log('  isAdmin():', student.isAdmin() ? '✗ true (ERRO!)' : '✓ false');

  // Repetir para teacher e admin (se existirem)

  process.exit(0);
})();
```

**Esperado:**
- ✓ isStudent() retorna true para students
- ✓ isTeacher() retorna true para teachers
- ✓ isAdmin() retorna true para admins
- ✓ Métodos retornam false para outras roles

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 14: Soft Delete (Paranoid)

**Objetivo:** Verificar se a exclusão lógica (soft delete) funciona

**Passos:**
1. Crie um usuário de teste
2. Exclua o usuário com `destroy()`
3. Tente buscar o usuário normalmente
4. Busque incluindo registros excluídos

**Script:**
```javascript
const { User } = require('./src/models');

(async () => {
  // 1. Criar usuário temporário
  const tempUser = await User.create({
    role: 'student',
    name: 'Usuário Temporário Teste Soft Delete',
    email: 'temp.softdelete@exemplo.com',
    login: 'tempsoftdelete',
    password: 'senha123456',
    cpf: '19619766056',  // CPF válido para testes
    rg: 'MG9998887'
  });
  console.log('✓ Usuário temporário criado, ID:', tempUser.id);

  // 2. Excluir (soft delete)
  await tempUser.destroy();
  console.log('✓ Usuário excluído (soft delete)');

  // 3. Tentar buscar normalmente (não deve encontrar)
  const buscaNormal = await User.findByPk(tempUser.id);
  console.log('Busca normal encontrou?', buscaNormal ? '✗ SIM (ERRO!)' : '✓ NÃO');

  // 4. Buscar incluindo excluídos
  const buscaComExcluidos = await User.findByPk(tempUser.id, { paranoid: false });
  console.log('Busca com paranoid:false encontrou?', buscaComExcluidos ? '✓ SIM' : '✗ NÃO (ERRO!)');

  if (buscaComExcluidos) {
    console.log('deleted_at preenchido?', buscaComExcluidos.deleted_at ? '✓ SIM' : '✗ NÃO (ERRO!)');
  }

  // 5. Restaurar (opcional - para testar restore)
  if (buscaComExcluidos) {
    await buscaComExcluidos.restore();
    console.log('✓ Usuário restaurado');

    const buscaAposRestore = await User.findByPk(tempUser.id);
    console.log('Usuário visível após restore?', buscaAposRestore ? '✓ SIM' : '✗ NÃO (ERRO!)');
  }

  process.exit(0);
})();
```

**Esperado:**
- ✓ destroy() não remove fisicamente do banco
- ✓ deleted_at é preenchido com timestamp
- ✓ Busca normal não encontra usuários excluídos
- ✓ Busca com paranoid:false encontra excluídos
- ✓ restore() torna usuário visível novamente (deleted_at = NULL)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ⚠️ TESTES DE EDGE CASES

### Teste 15: Nome com Caracteres Especiais

**Objetivo:** Verificar se o model aceita nomes com acentos, cedilha, etc.

**Input:**
- `José da Conceição Júnior`
- `María José García`
- `François Müller`

**Esperado:**
- ✓ Nomes aceitos corretamente
- ✓ Caracteres especiais armazenados sem corrupção (UTF-8)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 16: Senha Muito Curta

**Objetivo:** Verificar validação de tamanho mínimo de senha

**Input:**
- Senha com 1 caractere: `a`
- Senha com 5 caracteres: `12345`

**Esperado:**
- ✓ Rejeitado com erro: "Senha deve ter entre 6 e 100 caracteres"

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 17: Senha Muito Longa

**Objetivo:** Verificar validação de tamanho máximo de senha

**Input:** Senha com 101 caracteres

**Esperado:**
- ✓ Rejeitado com erro: "Senha deve ter entre 6 e 100 caracteres"

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 18: Login com Espaços ou Caracteres Especiais

**Objetivo:** Verificar validação de formato do login

**Input:**
- Login com espaço: `joao silva`
- Login com caracteres especiais: `joão.silva`, `joao@silva`, `joao-silva`

**Esperado:**
- ✓ Rejeitado com erro: "Login deve conter apenas letras e números (sem espaços ou caracteres especiais)"

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 19: Atualização de Senha

**Objetivo:** Verificar se hook beforeUpdate re-hasheia senha quando alterada

**Script:**
```javascript
const { User } = require('./src/models');

(async () => {
  const user = await User.scope('withPassword').findOne({ where: { login: 'joaoteste' } });
  const oldHash = user.password_hash;

  console.log('Hash antigo:', oldHash.substring(0, 20) + '...');

  // Atualizar senha
  user.password = 'novaSenha789';
  await user.save();

  const userAtualizado = await User.scope('withPassword').findByPk(user.id);
  const newHash = userAtualizado.password_hash;

  console.log('Hash novo:', newHash.substring(0, 20) + '...');
  console.log('Hash foi alterado?', oldHash !== newHash ? '✓ SIM' : '✗ NÃO (ERRO!)');

  // Validar nova senha
  const senhaNovaValida = await userAtualizado.validatePassword('novaSenha789');
  const senhaAntigaInvalida = await userAtualizado.validatePassword('senha123456');

  console.log('Nova senha válida?', senhaNovaValida ? '✓ SIM' : '✗ NÃO (ERRO!)');
  console.log('Senha antiga inválida?', !senhaAntigaInvalida ? '✓ SIM' : '✗ NÃO (ERRO!)');

  process.exit(0);
})();
```

**Esperado:**
- ✓ password_hash é alterado
- ✓ Nova senha é validada corretamente
- ✓ Senha antiga não funciona mais

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 20: getPublicData() Não Expõe Senha

**Objetivo:** Verificar se método getPublicData() oculta informações sensíveis

**Script:**
```javascript
const { User } = require('./src/models');

(async () => {
  const user = await User.scope('withPassword').findOne();
  const publicData = user.getPublicData();

  console.log('Public Data:', JSON.stringify(publicData, null, 2));
  console.log('password_hash presente?', publicData.password_hash ? '✗ SIM (ERRO!)' : '✓ NÃO');
  console.log('password presente?', publicData.password ? '✗ SIM (ERRO!)' : '✓ NÃO');

  process.exit(0);
})();
```

**Esperado:**
- ✓ password_hash não está presente
- ✓ password não está presente
- ✓ Apenas dados públicos retornados (id, role, name, email, login, cpf, rg, timestamps)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## ✅ CHECKLIST FINAL

### Funcionalidade
- [ ] Migration create-users executada com sucesso
- [ ] Tabela users criada com todos os campos corretos
- [ ] Índices criados (email, login, cpf, role, deleted_at)
- [ ] Rollback de migration funciona
- [ ] Model User cria registros corretamente
- [ ] Hash de senha automático funciona (bcrypt)
- [ ] Validação de senha funciona (validatePassword)
- [ ] Validação de CPF aceita CPFs válidos
- [ ] Validação de CPF rejeita CPFs inválidos
- [ ] Validação de email funciona
- [ ] Campos obrigatórios são validados
- [ ] Constraints de unicidade funcionam (email, login, cpf)
- [ ] Validação de role (enum) funciona
- [ ] Model carregado automaticamente por models/index.js
- [ ] Scopes personalizados funcionam
- [ ] Métodos auxiliares (isAdmin, isTeacher, isStudent) funcionam
- [ ] Soft delete (paranoid) funciona
- [ ] getPublicData() não expõe dados sensíveis

### Código
- [ ] Sem console.log desnecessários
- [ ] Sem código comentado ou "TODO"
- [ ] Funções e métodos documentados com JSDoc
- [ ] Nomes de variáveis claros e descritivos
- [ ] Código segue padrões do projeto

### Segurança
- [ ] Senhas sempre hasheadas (nunca em texto plano)
- [ ] CPF validado com dígitos verificadores
- [ ] Email validado com formato correto
- [ ] password_hash oculto por padrão (defaultScope)
- [ ] Campos obrigatórios validados
- [ ] Constraints de unicidade no banco de dados
- [ ] Tratamento de erros adequado

### Documentação
- [ ] README.md atualizado com informações da migration
- [ ] backlog.json atualizado (status "Em Andamento")
- [ ] Migration documentada com comentários
- [ ] Model documentado com JSDoc completo
- [ ] Plano de testes criado

### Performance
- [ ] Índices criados para campos de busca frequente (email, login, cpf)
- [ ] Índice para role (filtros por perfil)
- [ ] Índice para deleted_at (paranoid queries)
- [ ] Sem queries N+1 (não aplicável nesta feature)

---

## 🛠️ FERRAMENTAS RECOMENDADAS

### Banco de Dados
- **MySQL Workbench** - Interface gráfica para MySQL
- **DBeaver** - Cliente universal de banco de dados
- **phpMyAdmin** - Interface web para MySQL
- **MySQL CLI** - Linha de comando (`mysql -u root -p`)

### Teste de APIs (para próximas features)
- **Postman** - https://www.postman.com/
- **Insomnia** - https://insomnia.rest/
- **Thunder Client** (extensão VS Code)

### Node.js
- **Node.js v20 LTS** (obrigatório)
- **npm** (gerenciador de pacotes)

### Específicos para esta feature
- Scripts de teste JavaScript personalizados (fornecidos neste plano)
- Console do MySQL para inspeção de tabelas

---

## 📊 RESULTADO FINAL DOS TESTES

**Data de execução:** _[Preencher]_
**Executado por:** _[Preencher]_

### Resumo
- **Total de testes:** 20
- **Testes aprovados:** _[Preencher]_
- **Testes reprovados:** _[Preencher]_
- **Testes não executados:** _[Preencher]_

### Decisão
- [ ] **APROVADO** - Feature pronta para versionamento
- [ ] **REPROVADO** - Necessita ajustes (detalhar abaixo)

### Problemas Encontrados
_[Descrever problemas encontrados durante os testes]_

### Próximas Ações
_[Descrever ações necessárias]_

---

## 📝 NOTAS ADICIONAIS

### Limpeza Após Testes

Após executar todos os testes, você pode limpar os dados de teste:

```bash
# Opção 1: Deletar usuários de teste manualmente
mysql -u root -p secretaria_online -e "DELETE FROM users WHERE email LIKE '%@exemplo.com';"

# Opção 2: Resetar banco completo (CUIDADO: apaga tudo!)
cd backend
npm run db:reset
```

### Próxima Feature

Após aprovação desta feature (feat-007), você pode prosseguir para:
- **feat-008**: Criar migrations para Course e Discipline

### Observações do Desenvolvedor

- Migration implementada com índices otimizados para melhor performance
- Model inclui validação robusta de CPF com dígitos verificadores
- Hash de senha usa bcrypt com salt rounds = 10 (padrão seguro)
- Soft delete implementado permite recuperar usuários excluídos acidentalmente
- Scopes personalizados facilitam queries por role
- Métodos auxiliares tornam código mais legível (ex: `user.isAdmin()` ao invés de `user.role === 'admin'`)
- defaultScope oculta password_hash automaticamente para evitar exposição acidental
