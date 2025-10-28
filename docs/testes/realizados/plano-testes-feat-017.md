# PLANO DE TESTES - feat-017: Configurar JWT e bcrypt

**Feature:** feat-017 - Configurar JWT e bcrypt
**Grupo:** Grupo 3 - Autenticação e Autorização
**Data de criação:** 2025-10-27
**Status:** Aguardando execução

---

## 🔧 PREPARAÇÃO DO AMBIENTE

### Pré-requisitos

Certifique-se que o ambiente está configurado:

```bash
# 1. Navegar para o backend
cd backend

# 2. Verificar se as dependências estão instaladas
npm list jsonwebtoken bcryptjs
```

**Esperado:**
```
secretaria-online-backend@0.1.0 C:\myProjects\secretaria_online\backend
├── bcryptjs@2.x.x
└── jsonwebtoken@9.x.x
```

Se as dependências não estiverem instaladas:
```bash
npm install
```

### Configurar variáveis de ambiente

**IMPORTANTE:** Certifique-se de que o arquivo `.env` existe e contém:

```env
JWT_SECRET=sua_chave_secreta_complexa_de_pelo_menos_32_caracteres
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

**Gerar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📋 TESTE FUNCIONAL

### Teste 1: Validar Existência dos Arquivos Criados

**Objetivo:** Verificar se os arquivos da feature foram criados corretamente na estrutura esperada

**Passos:**
1. Verificar existência de `backend/src/config/auth.js`
   ```bash
   ls backend/src/config/auth.js
   ```

2. Verificar existência de `backend/src/utils/generators.js`
   ```bash
   ls backend/src/utils/generators.js
   ```

**Resultado Esperado:**
- ✓ Arquivo `backend/src/config/auth.js` existe
- ✓ Arquivo `backend/src/utils/generators.js` existe
- ✓ Ambos contêm código JavaScript válido

**Como verificar:**
- Windows CMD/PowerShell: Use `dir` ou `ls` (PowerShell)
- Git Bash/Linux: Use `ls -la`
- Se os arquivos não existirem, o comando retornará erro

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

### Teste 2: Testar Importação dos Módulos (Sem Erros de Sintaxe)

**Objetivo:** Verificar se os módulos podem ser importados sem erros de sintaxe

**Passos:**
1. Criar arquivo de teste `backend/test-import.js`:
   ```javascript
   const authConfig = require('./src/config/auth');
   const generators = require('./src/utils/generators');

   console.log('✓ auth.js importado com sucesso');
   console.log('✓ generators.js importado com sucesso');
   console.log('\nConfigurações JWT:', {
     accessExpiration: authConfig.jwtConfig.accessExpiresIn,
     refreshExpiration: authConfig.jwtConfig.refreshExpiresIn,
     algorithm: authConfig.jwtConfig.algorithm
   });
   console.log('\nFunções disponíveis em generators:', Object.keys(generators));
   ```

2. Executar o teste:
   ```bash
   cd backend
   node test-import.js
   ```

**Resultado Esperado:**
- ✓ Sem erros de sintaxe ou importação
- ✓ Exibe configurações JWT corretamente
- ✓ Lista todas as funções exportadas por generators.js:
  - hashPassword
  - comparePassword
  - generateAccessToken
  - generateRefreshToken
  - verifyToken
  - decodeToken
  - generateProvisionalPassword
  - generateProvisionalPasswordWithHash

**Como verificar:**
- Executar `node test-import.js` e verificar output
- Não deve haver mensagens de erro (Error, SyntaxError, etc.)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔍 TESTE DE VALIDAÇÃO - CONFIG/AUTH.JS

### Teste 3: Validar Configurações JWT

**Objetivo:** Verificar se as configurações JWT estão corretas e carregadas

**Passos:**
1. Criar arquivo `backend/test-auth-config.js`:
   ```javascript
   require('dotenv').config();
   const { jwtConfig, bcryptConfig, passwordConfig, securityConfig } = require('./src/config/auth');

   console.log('=== Teste de Configurações JWT ===\n');

   // Teste 1: JWT Secret existe e tem tamanho adequado
   console.log('1. JWT_SECRET:');
   if (jwtConfig.secret && jwtConfig.secret.length >= 32) {
     console.log('   ✓ JWT_SECRET configurado e tem tamanho adequado');
   } else {
     console.log('   ✗ JWT_SECRET ausente ou muito curto (mínimo 32 caracteres)');
   }

   // Teste 2: Expiration configurados
   console.log('\n2. Expiration:');
   console.log(`   Access Token: ${jwtConfig.accessExpiresIn}`);
   console.log(`   Refresh Token: ${jwtConfig.refreshExpiresIn}`);

   // Teste 3: Bcrypt Salt Rounds
   console.log('\n3. Bcrypt:');
   console.log(`   Salt Rounds: ${bcryptConfig.saltRounds}`);
   if (bcryptConfig.saltRounds === 10) {
     console.log('   ✓ Salt rounds configurado corretamente');
   } else {
     console.log('   ⚠ Salt rounds diferente do recomendado (10)');
   }

   // Teste 4: Password Config
   console.log('\n4. Password Config:');
   console.log(`   Tamanho senha provisória: ${passwordConfig.provisionalPasswordLength}`);
   console.log(`   Caracteres permitidos: ${passwordConfig.allowedCharacters.substring(0, 20)}...`);

   console.log('\n=== Teste Concluído ===');
   ```

2. Executar:
   ```bash
   node test-auth-config.js
   ```

**Resultado Esperado:**
- ✓ JWT_SECRET existe e tem pelo menos 32 caracteres
- ✓ Access Token expira em 15m (ou valor definido em .env)
- ✓ Refresh Token expira em 7d (ou valor definido em .env)
- ✓ Salt rounds = 10
- ✓ Senha provisória tem 8 caracteres

**Como verificar:**
- Verificar output do script
- Todos os checks devem mostrar ✓

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔐 TESTE DE HASH DE SENHAS (BCRYPT)

### Teste 4: Hash de Senha e Comparação

**Objetivo:** Testar funções de hash e comparação de senhas

**Passos:**
1. Criar arquivo `backend/test-bcrypt.js`:
   ```javascript
   const { hashPassword, comparePassword } = require('./src/utils/generators');

   async function testHashPassword() {
     console.log('=== Teste de Hash de Senhas ===\n');

     const testPassword = 'minhasenha123';
     console.log(`Senha de teste: "${testPassword}"\n`);

     try {
       // Teste 1: Gerar hash
       console.log('1. Gerando hash...');
       const hash1 = await hashPassword(testPassword);
       console.log(`   ✓ Hash gerado: ${hash1.substring(0, 30)}...`);

       // Teste 2: Hash deve ser diferente a cada execução (salt aleatório)
       console.log('\n2. Testando aleatoriedade do salt...');
       const hash2 = await hashPassword(testPassword);
       if (hash1 !== hash2) {
         console.log('   ✓ Hashes diferentes (salt aleatório funcionando)');
       } else {
         console.log('   ✗ Hashes iguais (problema no salt)');
       }

       // Teste 3: Comparar senha correta
       console.log('\n3. Comparando senha correta...');
       const isValidCorrect = await comparePassword(testPassword, hash1);
       if (isValidCorrect) {
         console.log('   ✓ Senha correta validada com sucesso');
       } else {
         console.log('   ✗ Falha ao validar senha correta');
       }

       // Teste 4: Comparar senha incorreta
       console.log('\n4. Comparando senha incorreta...');
       const isValidWrong = await comparePassword('senhaerrada', hash1);
       if (!isValidWrong) {
         console.log('   ✓ Senha incorreta rejeitada corretamente');
       } else {
         console.log('   ✗ Senha incorreta foi aceita (ERRO CRÍTICO)');
       }

       // Teste 5: Validação de senha vazia
       console.log('\n5. Testando validação de senha vazia...');
       try {
         await hashPassword('');
         console.log('   ✗ Aceitou senha vazia (deveria rejeitar)');
       } catch (error) {
         console.log('   ✓ Senha vazia rejeitada corretamente');
       }

       // Teste 6: Validação de senha muito curta
       console.log('\n6. Testando validação de senha curta (< 6 caracteres)...');
       try {
         await hashPassword('12345');
         console.log('   ✗ Aceitou senha muito curta (deveria rejeitar)');
       } catch (error) {
         console.log('   ✓ Senha curta rejeitada corretamente');
       }

       console.log('\n=== Teste Concluído ===');

     } catch (error) {
       console.error('✗ Erro durante teste:', error.message);
     }
   }

   testHashPassword();
   ```

2. Executar:
   ```bash
   node test-bcrypt.js
   ```

**Resultado Esperado:**
- ✓ Hash gerado com sucesso
- ✓ Hashes diferentes para mesma senha (salt aleatório)
- ✓ Senha correta validada
- ✓ Senha incorreta rejeitada
- ✓ Senha vazia rejeitada
- ✓ Senha < 6 caracteres rejeitada

**Como verificar:**
- Todos os testes devem mostrar ✓
- Nenhum erro deve ser lançado inesperadamente

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🎫 TESTE DE GERAÇÃO DE TOKENS JWT

### Teste 5: Geração e Verificação de Access Token

**Objetivo:** Testar geração, verificação e validação de tokens JWT

**Passos:**
1. Criar arquivo `backend/test-jwt.js`:
   ```javascript
   const {
     generateAccessToken,
     generateRefreshToken,
     verifyToken,
     decodeToken
   } = require('./src/utils/generators');

   function testJWT() {
     console.log('=== Teste de JWT Tokens ===\n');

     const mockUser = { id: 1, role: 'student', email: 'aluno@teste.com' };

     try {
       // Teste 1: Gerar Access Token
       console.log('1. Gerando Access Token...');
       const accessToken = generateAccessToken(mockUser);
       console.log(`   ✓ Token gerado: ${accessToken.substring(0, 50)}...`);

       // Teste 2: Gerar Refresh Token
       console.log('\n2. Gerando Refresh Token...');
       const refreshToken = generateRefreshToken({ id: mockUser.id });
       console.log(`   ✓ Token gerado: ${refreshToken.substring(0, 50)}...`);

       // Teste 3: Verificar Access Token
       console.log('\n3. Verificando Access Token...');
       const decoded = verifyToken(accessToken);
       console.log('   Payload decodificado:', decoded);
       if (decoded.id === mockUser.id && decoded.role === mockUser.role) {
         console.log('   ✓ Token verificado e payload correto');
       } else {
         console.log('   ✗ Payload incorreto no token');
       }

       // Teste 4: Decodificar token sem verificar assinatura
       console.log('\n4. Decodificando token (sem verificação)...');
       const decodedNoVerify = decodeToken(accessToken);
       if (decodedNoVerify && decodedNoVerify.id === mockUser.id) {
         console.log('   ✓ Token decodificado com sucesso');
       } else {
         console.log('   ✗ Falha ao decodificar token');
       }

       // Teste 5: Tentar verificar token inválido
       console.log('\n5. Testando token inválido...');
       try {
         verifyToken('token.invalido.aqui');
         console.log('   ✗ Aceitou token inválido (deveria rejeitar)');
       } catch (error) {
         console.log('   ✓ Token inválido rejeitado corretamente');
       }

       // Teste 6: Validação de payload obrigatório
       console.log('\n6. Testando payload sem ID...');
       try {
         generateAccessToken({ role: 'student' }); // Sem ID
         console.log('   ✗ Aceitou payload sem ID (deveria rejeitar)');
       } catch (error) {
         console.log('   ✓ Payload incompleto rejeitado corretamente');
       }

       // Teste 7: Validação de role inválida
       console.log('\n7. Testando role inválida...');
       try {
         generateAccessToken({ id: 1, role: 'hacker' }); // Role não permitida
         console.log('   ✗ Aceitou role inválida (deveria rejeitar)');
       } catch (error) {
         console.log('   ✓ Role inválida rejeitada corretamente');
       }

       console.log('\n=== Teste Concluído ===');

     } catch (error) {
       console.error('✗ Erro durante teste:', error.message);
     }
   }

   testJWT();
   ```

2. Executar:
   ```bash
   node test-jwt.js
   ```

**Resultado Esperado:**
- ✓ Access Token gerado com sucesso
- ✓ Refresh Token gerado com sucesso
- ✓ Token verificado e payload correto
- ✓ Token decodificado sem verificação
- ✓ Token inválido rejeitado
- ✓ Payload sem ID rejeitado
- ✓ Role inválida rejeitada

**Como verificar:**
- Todos os testes devem mostrar ✓
- Verificar que os tokens têm formato JWT válido (3 partes separadas por ponto)

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔑 TESTE DE GERAÇÃO DE SENHAS PROVISÓRIAS

### Teste 6: Geração de Senhas Provisórias

**Objetivo:** Testar geração de senhas provisórias aleatórias

**Passos:**
1. Criar arquivo `backend/test-password-generator.js`:
   ```javascript
   const {
     generateProvisionalPassword,
     generateProvisionalPasswordWithHash
   } = require('./src/utils/generators');

   async function testPasswordGenerator() {
     console.log('=== Teste de Geração de Senhas Provisórias ===\n');

     try {
       // Teste 1: Gerar senha provisória
       console.log('1. Gerando senha provisória (tamanho padrão 8)...');
       const password1 = generateProvisionalPassword();
       console.log(`   Senha gerada: ${password1}`);
       console.log(`   Tamanho: ${password1.length}`);
       if (password1.length === 8) {
         console.log('   ✓ Tamanho correto (8 caracteres)');
       } else {
         console.log('   ✗ Tamanho incorreto');
       }

       // Teste 2: Aleatoriedade
       console.log('\n2. Testando aleatoriedade...');
       const password2 = generateProvisionalPassword();
       console.log(`   Segunda senha: ${password2}`);
       if (password1 !== password2) {
         console.log('   ✓ Senhas diferentes (geração aleatória funcionando)');
       } else {
         console.log('   ⚠ Senhas iguais (baixa probabilidade, execute novamente)');
       }

       // Teste 3: Tamanho customizado
       console.log('\n3. Testando tamanho customizado (12 caracteres)...');
       const password3 = generateProvisionalPassword(12);
       console.log(`   Senha gerada: ${password3}`);
       if (password3.length === 12) {
         console.log('   ✓ Tamanho correto (12 caracteres)');
       } else {
         console.log('   ✗ Tamanho incorreto');
       }

       // Teste 4: Caracteres permitidos
       console.log('\n4. Validando caracteres permitidos...');
       const allowedChars = /^[A-Za-z0-9]+$/;
       if (allowedChars.test(password1)) {
         console.log('   ✓ Apenas letras e números (conforme esperado)');
       } else {
         console.log('   ✗ Contém caracteres não permitidos');
       }

       // Teste 5: Gerar senha com hash
       console.log('\n5. Gerando senha provisória com hash...');
       const { password, hashedPassword } = await generateProvisionalPasswordWithHash();
       console.log(`   Senha: ${password}`);
       console.log(`   Hash: ${hashedPassword.substring(0, 30)}...`);
       if (password && hashedPassword && hashedPassword.length === 60) {
         console.log('   ✓ Senha e hash gerados corretamente');
       } else {
         console.log('   ✗ Erro na geração de senha com hash');
       }

       console.log('\n=== Teste Concluído ===');

     } catch (error) {
       console.error('✗ Erro durante teste:', error.message);
     }
   }

   testPasswordGenerator();
   ```

2. Executar:
   ```bash
   node test-password-generator.js
   ```

**Resultado Esperado:**
- ✓ Senha provisória tem 8 caracteres (padrão)
- ✓ Senhas geradas são diferentes (aleatoriedade)
- ✓ Tamanho customizado funciona corretamente
- ✓ Apenas letras (A-Z, a-z) e números (0-9)
- ✓ Senha com hash gerada corretamente (hash bcrypt tem 60 caracteres)

**Como verificar:**
- Verificar output do script
- Senhas devem ser legíveis e sem caracteres especiais

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🔗 TESTE DE INTEGRAÇÃO

### Teste 7: Fluxo Completo - Criar Usuário, Gerar Token, Validar

**Objetivo:** Simular fluxo completo de criação de usuário, login e validação de token

**Passos:**
1. Criar arquivo `backend/test-integration.js`:
   ```javascript
   const {
     hashPassword,
     comparePassword,
     generateAccessToken,
     verifyToken,
     generateProvisionalPasswordWithHash
   } = require('./src/utils/generators');

   async function testIntegration() {
     console.log('=== Teste de Integração Completo ===\n');

     try {
       // Simulação de Cadastro de Usuário
       console.log('CENÁRIO: Administrador cadastra novo aluno\n');

       console.log('1. Gerando senha provisória...');
       const { password: provisionalPassword, hashedPassword } =
         await generateProvisionalPasswordWithHash();
       console.log(`   Senha provisória: ${provisionalPassword}`);
       console.log(`   ✓ Senha provisória gerada e hashada`);

       // Simulando dados do usuário que seriam salvos no banco
       const newUser = {
         id: 1,
         name: 'João da Silva',
         email: 'joao@teste.com',
         login: 'joao.silva',
         password_hash: hashedPassword,
         role: 'student'
       };
       console.log('\n   Usuário criado (simulado no banco):');
       console.log(`   - ID: ${newUser.id}`);
       console.log(`   - Nome: ${newUser.name}`);
       console.log(`   - Login: ${newUser.login}`);
       console.log(`   - Role: ${newUser.role}`);

       // Simulação de Login
       console.log('\n2. Simulando LOGIN do usuário...');
       console.log(`   Tentando login com senha provisória: ${provisionalPassword}`);

       const isPasswordValid = await comparePassword(
         provisionalPassword,
         newUser.password_hash
       );

       if (!isPasswordValid) {
         console.log('   ✗ Senha inválida - LOGIN FALHOU');
         return;
       }

       console.log('   ✓ Senha validada com sucesso');

       // Geração de Token após login bem-sucedido
       console.log('\n3. Gerando tokens de autenticação...');
       const accessToken = generateAccessToken({
         id: newUser.id,
         role: newUser.role,
         email: newUser.email
       });
       console.log(`   Access Token: ${accessToken.substring(0, 50)}...`);
       console.log('   ✓ Token JWT gerado');

       // Simulação de Requisição Autenticada
       console.log('\n4. Simulando requisição autenticada...');
       console.log('   [Cliente] Enviando requisição com token no header Authorization');

       const decoded = verifyToken(accessToken);
       console.log('   [Servidor] Token verificado, usuário autenticado:');
       console.log(`   - ID: ${decoded.id}`);
       console.log(`   - Role: ${decoded.role}`);
       console.log(`   - Email: ${decoded.email}`);
       console.log('   ✓ Requisição autenticada com sucesso');

       // Simulação de Troca de Senha (Primeiro Acesso)
       console.log('\n5. Simulando TROCA DE SENHA (primeiro acesso)...');
       const newPassword = 'NovaS3nhaF0rte!';
       console.log(`   Nova senha: ${newPassword}`);

       const newPasswordHash = await hashPassword(newPassword);
       console.log('   ✓ Nova senha hashada com sucesso');

       // Validar que a nova senha funciona
       const isNewPasswordValid = await comparePassword(newPassword, newPasswordHash);
       if (isNewPasswordValid) {
         console.log('   ✓ Nova senha funciona corretamente');
       } else {
         console.log('   ✗ Erro ao validar nova senha');
       }

       console.log('\n=== ✓ FLUXO COMPLETO EXECUTADO COM SUCESSO ===');

     } catch (error) {
       console.error('✗ Erro durante integração:', error.message);
     }
   }

   testIntegration();
   ```

2. Executar:
   ```bash
   node test-integration.js
   ```

**Resultado Esperado:**
- ✓ Senha provisória gerada e hashada
- ✓ Dados do usuário simulados corretamente
- ✓ Login validado com senha provisória
- ✓ Token JWT gerado após login
- ✓ Token verificado em requisição autenticada
- ✓ Troca de senha funciona corretamente
- ✓ Fluxo completo sem erros

**Como verificar:**
- Todo o fluxo deve ser executado sem erros
- Todos os passos devem mostrar ✓
- Verificar se os dados do token decodificado correspondem ao usuário

**Status:** [ ] Não executado | [ ] Passou | [ ] Falhou
**Observações:** _[Preencher após execução]_

---

## 🧹 LIMPEZA PÓS-TESTES

Após executar todos os testes, remova os arquivos de teste criados:

```bash
cd backend
del test-*.js
```

Ou manualmente:
- `test-import.js`
- `test-auth-config.js`
- `test-bcrypt.js`
- `test-jwt.js`
- `test-password-generator.js`
- `test-integration.js`

---

## 📊 CRITÉRIOS DE ACEITAÇÃO

Para considerar a feature **feat-017** como validada, TODOS os testes devem passar:

- [x] Teste 1: Arquivos criados na estrutura correta
- [x] Teste 2: Módulos importados sem erros
- [x] Teste 3: Configurações JWT válidas
- [x] Teste 4: Hash de senha e comparação funcionando
- [x] Teste 5: Geração e verificação de JWT funcionando
- [x] Teste 6: Geração de senhas provisórias funcionando
- [x] Teste 7: Fluxo completo de integração funcionando

**IMPORTANTE:** Se algum teste falhar, revise o código antes de prosseguir para a próxima feature.

---

## 🛠️ FERRAMENTAS RECOMENDADAS

- **Terminal/CMD**: Para executar scripts de teste
- **VS Code**: Para editar e visualizar código
- **Git Bash** (Windows): Terminal Unix-like para Windows
- **Node.js v20+**: Certifique-se que está instalado

---

## 📝 NOTAS ADICIONAIS

### Segurança
- **NUNCA** commite o arquivo `.env` com o JWT_SECRET real
- Gere uma chave JWT_SECRET forte para produção (mínimo 32 caracteres)
- Use HTTPS em produção para proteger tokens em trânsito
- Tokens JWT devem ser armazenados de forma segura no frontend (httpOnly cookies recomendado)

### Performance
- Bcrypt com 10 salt rounds é adequado para a maioria dos casos
- Se o hash estiver muito lento, considere reduzir para 8 (menor segurança)
- Se necessitar mais segurança, aumente para 12 (mais lento)

### Próximos Passos
Após validação desta feature, seguir para:
- **feat-018**: Criar AuthService com lógica de autenticação
- **feat-019**: Criar AuthController e rotas de autenticação
- **feat-020**: Criar middleware de autenticação JWT
