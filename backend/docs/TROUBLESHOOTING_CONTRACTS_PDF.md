# Troubleshooting: Contratos com file_path e file_name NULL em Produção

## Problema

Contratos estão sendo criados em produção com os campos `file_path` e `file_name` definidos como NULL, enquanto em desenvolvimento esses campos são preenchidos corretamente.

## Causa Raiz Provável

O problema NÃO ocorre durante o aceite do contrato (que apenas atualiza `accepted_at`), mas sim durante a **geração do contrato**. As causas mais prováveis são:

1. **Permissões de pasta** - Diretório sem permissão de escrita
2. **Pasta não existe** - Diretório não foi criado em produção
3. **Caminho incorreto** - `process.cwd()` diferente em produção vs desenvolvimento
4. **Erro silencioso** - Erro na geração que não está sendo propagado

## Diagnóstico Passo a Passo

### 1. Executar Script de Verificação de Permissões

```bash
cd backend
node scripts/check-contracts-permissions.js
```

Este script irá:
- Verificar se os diretórios existem
- Verificar permissões de leitura e escrita
- Tentar criar diretórios se não existirem
- Testar criação de arquivos
- Fornecer comandos para correção

### 2. Executar Script de Diagnóstico Completo

```bash
cd backend
node scripts/diagnose-pdf-generation.js
```

Este script irá:
- Verificar variáveis de ambiente
- Verificar caminhos configurados
- Simular geração de caminho como no PDFService
- Tentar gerar um PDF de teste
- Verificar contratos sem PDF no banco de dados

### 3. Verificar Logs do Sistema

```bash
# Verificar logs do Winston
tail -f backend/logs/error.log
tail -f backend/logs/combined.log

# Verificar logs do PM2
npm run pm2:logs

# Ou diretamente
pm2 logs secretaria-online --lines 100
```

Procure por erros relacionados a:
- `[PDFService]`
- `[ContractService]`
- `EACCES` (permissão negada)
- `ENOENT` (arquivo/diretório não encontrado)

### 4. Verificar Estrutura de Diretórios

```bash
# Verificar estrutura
ls -la backend/uploads/

# Deve mostrar algo como:
# drwxr-xr-x 5 user group 4096 Dec 30 10:00 .
# drwxr-xr-x 8 user group 4096 Dec 30 10:00 ..
# drwxr-xr-x 2 user group 4096 Dec 30 10:00 contracts
# drwxr-xr-x 2 user group 4096 Dec 30 10:00 documents
# drwxr-xr-x 2 user group 4096 Dec 30 10:00 temp
```

### 5. Verificar Permissões Específicas

```bash
# Verificar permissões do diretório de contratos
ls -la backend/uploads/contracts/

# Verificar proprietário dos arquivos
stat backend/uploads/contracts/

# Verificar usuário do processo PM2
pm2 describe secretaria-online | grep "exec mode\|username\|user"
```

## Soluções

### Solução 1: Corrigir Permissões

Se o problema for de permissões, execute:

```bash
# Dar permissões de escrita ao diretório
chmod -R 755 backend/uploads/

# Se necessário, alterar proprietário (substitua 'user:group' pelo usuário correto)
# ATENÇÃO: Pode ser necessário executar como root/sudo
sudo chown -R $USER:$USER backend/uploads/
```

### Solução 2: Recriar Diretórios

Se os diretórios não existem:

```bash
# Criar estrutura de diretórios
mkdir -p backend/uploads/contracts
mkdir -p backend/uploads/documents
mkdir -p backend/uploads/temp

# Dar permissões adequadas
chmod -R 755 backend/uploads/
```

### Solução 3: Verificar Usuário do PM2

O processo PM2 pode estar rodando com um usuário diferente:

```bash
# Ver informações do processo
pm2 describe secretaria-online

# Se o usuário estiver incorreto, reiniciar com usuário correto
pm2 delete secretaria-online
pm2 start ecosystem.config.js --env production
```

### Solução 4: Adicionar Logging Adicional

Se o erro ainda não está claro, adicione logging temporário:

Edite `backend/src/services/pdf.service.js` na função `_ensureDirectoryExists`:

```javascript
static async _ensureDirectoryExists(dirPath) {
  try {
    console.log('[PDFService DEBUG] Criando diretório:', dirPath);
    console.log('[PDFService DEBUG] process.cwd():', process.cwd());
    console.log('[PDFService DEBUG] __dirname:', __dirname);

    await fsPromises.mkdir(dirPath, { recursive: true });

    console.log('[PDFService DEBUG] Diretório criado com sucesso');

    // Testar permissões de escrita
    await fsPromises.access(dirPath, fsPromises.constants.W_OK);
    console.log('[PDFService DEBUG] Permissões de escrita verificadas');

  } catch (error) {
    console.error('[PDFService DEBUG] Erro ao criar/verificar diretório:', error);
    const newError = new Error(`Erro ao criar diretório de uploads: ${error.message}`);
    newError.code = 'DIRECTORY_ERROR';
    throw newError;
  }
}
```

Depois reinicie o servidor e tente gerar um contrato.

### Solução 5: Usar Caminho Absoluto Explícito

Se `process.cwd()` estiver incorreto, force o caminho absoluto:

Edite `backend/src/config/pdf.js`:

```javascript
// ANTES:
const UPLOADS_BASE_PATH = path.join(__dirname, '../../uploads');

// DEPOIS (use o caminho completo do seu servidor):
const UPLOADS_BASE_PATH = '/home/user/app/backend/uploads';
// ou
const UPLOADS_BASE_PATH = path.resolve(__dirname, '../../uploads');
```

### Solução 6: Verificar Dependências de PDF

Verifique se as dependências de geração de PDF estão instaladas:

```bash
cd backend
npm list pdfkit html-pdf-node

# Se não estiverem instaladas
npm install pdfkit html-pdf-node
```

## Verificação de Sucesso

Após aplicar as correções:

1. **Reinicie o servidor**:
   ```bash
   npm run pm2:restart
   # ou
   npm run pm2:reload
   ```

2. **Execute o script de diagnóstico novamente**:
   ```bash
   node scripts/diagnose-pdf-generation.js
   ```

3. **Tente gerar um contrato de teste** (via interface admin)

4. **Verifique o banco de dados**:
   ```sql
   SELECT id, user_id, file_path, file_name, created_at
   FROM contracts
   ORDER BY created_at DESC
   LIMIT 5;
   ```

5. **Verifique se o arquivo foi criado**:
   ```bash
   ls -lh backend/uploads/contracts/
   ```

## Prevenção

Para evitar esse problema no futuro:

1. **Sempre execute os scripts de verificação após deploy**:
   ```bash
   node scripts/check-contracts-permissions.js
   ```

2. **Adicione verificação de diretórios ao iniciar o servidor**:

   Em `backend/src/server.js` ou `backend/src/app.js`, adicione:
   ```javascript
   const { initializePDFDirectories } = require('./config/pdf');

   // Antes de iniciar o servidor
   try {
     initializePDFDirectories();
     console.log('✓ Diretórios de PDF inicializados');
   } catch (err) {
     console.error('✗ Erro ao inicializar diretórios de PDF:', err);
     process.exit(1);
   }
   ```

3. **Configure alertas de erro** para falhas na geração de PDFs

4. **Documente o processo de deploy** incluindo verificação de permissões

## Comandos Rápidos de Diagnóstico

```bash
# Verificação completa em um comando
cd backend && \
node scripts/check-contracts-permissions.js && \
node scripts/diagnose-pdf-generation.js && \
ls -lh uploads/contracts/ && \
echo "Últimos contratos no banco:" && \
mysql -u user -p database -e "SELECT id, file_path, file_name FROM contracts ORDER BY created_at DESC LIMIT 3;"
```

## Suporte

Se o problema persistir após todas essas verificações:

1. Capture a saída completa dos scripts de diagnóstico
2. Capture os logs de erro do Winston e PM2
3. Capture a saída de `ls -la backend/uploads/`
4. Verifique se há algum erro no console do navegador ao tentar gerar contrato
5. Documente o comportamento exato (contrato é criado no banco? Com que valores?)
