# Guia de Deployment - Secretaria Online na GCP

## Informações do Projeto

- **Repositório**: https://github.com/CarlosSalesNaturalTec/secretaria_online.git
- **Usuário VM**: naturalbahia
- **Nome da VM**: secretaria-online
- **Servidor**: GCP Compute Engine (e2-medium, Debian 11)

---

## Pré-requisitos

- [ ] Acesso SSH à VM configurado
- [ ] Instância VM GCP criada e rodando
- [ ] Cliente SSH instalado no Windows (Git Bash, PuTTY, ou OpenSSH)
- [ ] Credenciais de acesso à VM (chave SSH ou senha)

---

## Parte 1: Preparação do Ambiente Local (Windows)

### 1.1 Verificar Acesso SSH

Abra o terminal (Git Bash, PowerShell, ou cmd) e teste a conexão SSH:

```bash
ssh naturalbahia@secretaria-online
```

Se for a primeira vez conectando, você verá uma mensagem perguntando se confia na chave do servidor. Digite `yes`.

**Nota**: Se você estiver usando IP público em vez do nome da VM, substitua por:
```bash
ssh naturalbahia@[IP_PUBLICO_DA_VM]
```

### 1.2 Transferir Scripts para a VM

Na sua máquina Windows, navegue até a pasta do projeto e transfira os scripts:

```bash
# Navegar até a pasta de deployment
cd C:\codeDiversos\secretaria_online\deployment

# Transferir scripts para a VM
gcloud compute scp setup-vm.sh deploy-app.sh manage-app.sh .env.production.example naturalbahia@secretaria-online:/home/naturalbahia/
```

**Ou usando IP público**:
```bash
gcloud compute scp setup-vm.sh deploy-app.sh manage-app.sh .env.production.example naturalbahia@[IP_PUBLICO_DA_VM]:/home/naturalbahia/
```

---

## Parte 2: Configuração Inicial da VM (Executar UMA VEZ)

### 2.1 Conectar à VM via SSH

```bash
ssh naturalbahia@secretaria-online
```

### 2.2 Dar Permissão de Execução aos Scripts

```bash
chmod +x setup-vm.sh deploy-app.sh manage-app.sh
```

### 2.3 Executar Setup da VM

Este script irá:
- Atualizar o sistema operacional
- Instalar Node.js v20 LTS
- Instalar PM2 (gerenciador de processos)
- Instalar MariaDB (banco de dados)
- Configurar firewall
- Criar estrutura de diretórios
- (Opcional) Instalar Nginx e Certbot

```bash
sed -i 's/\r$//' setup-vm.sh
bash setup-vm.sh
```

**Importante**: Durante a execução, o script pode perguntar se você deseja instalar Nginx e Certbot. Responda:
- **Nginx**: `Y` (recomendado para servir o frontend e fazer proxy reverso)
- **Certbot**: `Y` (recomendado para SSL gratuito)

O script levará alguns minutos para concluir.

### 2.4 Configurar Segurança do MariaDB (MANUAL)

Após o script terminar, execute:

```bash
sudo mysql_secure_installation
```

Responda às perguntas:
1. **Enter current password for root**: Pressione Enter (sem senha ainda)
2. **Switch to unix_socket authentication**: N
3. **Change the root password**: Y - Digite uma senha forte e anote
4. **Remove anonymous users**: Y
5. **Disallow root login remotely**: Y
6. **Remove test database**: Y
7. **Reload privilege tables**: Y

### 2.5 Criar Banco de Dados e Usuário (MANUAL)

Conecte ao MariaDB:

```bash
sudo mysql -u root -p
```

Digite a senha root que você criou no passo anterior.

Execute os seguintes comandos SQL:

```sql
-- Criar banco de dados
CREATE DATABASE secretaria_online CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário
CREATE USER 'secretaria_prod'@'localhost' IDENTIFIED BY 'SuaSenhaSeguraAqui123!';

-- Conceder permissões
GRANT ALL PRIVILEGES ON secretaria_online.* TO 'secretaria_prod'@'localhost';

-- Aplicar mudanças
FLUSH PRIVILEGES;

-- Sair
EXIT;
```

**IMPORTANTE**: Anote o usuário (`secretaria_prod`) e a senha que você criou. Você vai precisar no próximo passo.

### 2.6 Verificar Instalações

```bash
# Verificar Node.js
node -v
# Deve exibir: v20.x.x

# Verificar npm
npm -v
# Deve exibir: 10.x.x

# Verificar PM2
pm2 -v
# Deve exibir versão do PM2

# Verificar MariaDB
sudo systemctl status mariadb
# Deve exibir: active (running)
```

---

## Parte 3: Deploy da Aplicação

### 3.1 Executar Script de Deploy

O script de deploy irá:
- Clonar o repositório do GitHub
- Instalar dependências
- Configurar variáveis de ambiente
- Executar migrations do banco
- Buildar o frontend
- Configurar Nginx (se instalado)
- Iniciar a aplicação com PM2

```bash
sed -i 's/\r$//' deploy-app.sh
bash deploy-app.sh
```

### 3.2 Configurar Variáveis de Ambiente (MANUAL)

Quando o script solicitar, edite o arquivo `.env` do backend:

```bash
nano /opt/secretaria-online/backend/.env
```

**Edite os seguintes campos obrigatórios**:

```env
# Banco de Dados
DB_HOST=localhost
DB_NAME=secretaria_online
DB_USER=secretaria_prod
DB_PASSWORD=SuaSenhaSeguraAqui123!    # A senha que você criou no passo 2.5

# JWT Secret (gere uma chave complexa)
JWT_SECRET=COLE_AQUI_UMA_CHAVE_SEGURA  # Veja instruções abaixo

# Email (configure com suas credenciais)
SMTP_HOST=smtp.seudominio.com
SMTP_USER=noreply@seudominio.com
SMTP_PASS=SuaSenhaEmailAqui

# URL Base (domínio da aplicação)
BASE_URL=https://seudominio.com

# CORS (domínio do frontend)
CORS_ORIGIN=https://seudominio.com
```

**Para gerar JWT_SECRET seguro**, execute em outro terminal da VM:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado e cole no campo `JWT_SECRET`.

**Salvar e sair do nano**: `Ctrl+O`, Enter, `Ctrl+X`

Após editar, pressione qualquer tecla no terminal do script para continuar.

### 3.3 Executar Migrations e Seeders

O script irá perguntar se você deseja executar seeders (dados iniciais).

Responda **Y** na primeira vez para criar o usuário admin inicial.

### 3.4 Configurar Nginx (se instalado)

O script perguntará se deseja configurar Nginx automaticamente.

Responda **Y** e forneça:
- **Domínio**: Digite o domínio da aplicação (ex: `secretaria.seudominio.com`)

O Nginx será configurado automaticamente.

### 3.5 Verificar Status da Aplicação

Ao final do script, será exibido:
- Status do PM2
- Logs recentes
- Resultado do health check da API

Se tudo estiver OK, você verá:
```
✓ API está respondendo!
```

---

## Parte 4: Configurar SSL (Certificado HTTPS)

### 4.1 Verificar DNS

Antes de gerar o certificado SSL, certifique-se de que o DNS do seu domínio está apontando para o IP público da VM.

Para verificar o IP público da VM:

```bash
curl ifconfig.me
```

Vá ao painel do seu provedor de DNS e crie um registro A:
- **Nome**: secretaria (ou @ para domínio raiz)
- **Tipo**: A
- **Valor**: [IP_PUBLICO_DA_VM]

Aguarde a propagação do DNS (pode levar até 24h, mas geralmente é rápido).

Para testar se o DNS está funcionando (no Windows):

```bash
nslookup secretaria.seudominio.com
```

### 4.2 Gerar Certificado SSL com Certbot

Na VM, execute:

```bash
sudo certbot --nginx -d secretaria.seudominio.com
```

Responda às perguntas:
1. **Email**: Digite seu email (para notificações de renovação)
2. **Terms of Service**: Y
3. **Share email with EFF**: N (opcional)
4. **Redirect HTTP to HTTPS**: 2 (recomendado)

O Certbot irá:
- Gerar certificado SSL gratuito
- Configurar Nginx automaticamente
- Configurar renovação automática

### 4.3 Testar SSL

Acesse no navegador: `https://seudominio.com`

Você deve ver o cadeado verde indicando conexão segura.

---

## Parte 5: Gerenciamento da Aplicação

### 5.1 Script de Gerenciamento

O script `manage-app.sh` fornece comandos úteis para gerenciar a aplicação.

**Modo interativo** (menu):
```bash
bash manage-app.sh
```

**Comandos diretos**:

```bash
# Iniciar aplicação
bash manage-app.sh start

# Parar aplicação
bash manage-app.sh stop

# Reiniciar aplicação
bash manage-app.sh restart

# Recarregar (zero downtime)
bash manage-app.sh reload

# Ver status
bash manage-app.sh status

# Ver logs (últimas 50 linhas)
bash manage-app.sh logs

# Ver logs em tempo real
bash manage-app.sh logs follow

# Health check
bash manage-app.sh health

# Backup do banco de dados
bash manage-app.sh backup

# Limpar arquivos temporários
bash manage-app.sh clean
```

### 5.2 Comandos PM2 Úteis

```bash
# Listar aplicações
pm2 list

# Ver logs em tempo real
pm2 logs secretaria-online-api

# Ver logs de erro
pm2 logs secretaria-online-api --err

# Informações detalhadas
pm2 show secretaria-online-api

# Monitorar recursos
pm2 monit

# Reiniciar aplicação
pm2 restart secretaria-online-api

# Parar aplicação
pm2 stop secretaria-online-api
```

### 5.3 Verificar Logs da Aplicação

```bash
# Logs do PM2
tail -f /opt/secretaria-online/backend/logs/pm2/combined.log

# Logs da aplicação
tail -f /opt/secretaria-online/backend/logs/app/combined.log

# Logs de erro
tail -f /opt/secretaria-online/backend/logs/app/error.log
```

### 5.4 Verificar Logs do Nginx

```bash
# Logs de acesso
sudo tail -f /var/log/nginx/secretaria-online-access.log

# Logs de erro
sudo tail -f /var/log/nginx/secretaria-online-error.log
```

---

## Parte 6: Atualizações e Deploy de Novas Versões

### 6.1 Deploy de Atualização

Sempre que houver uma nova versão no repositório Git:

```bash
# Conectar à VM
ssh naturalbahia@secretaria-online

# Executar deploy
bash deploy-app.sh
```

O script irá:
- Fazer backup do `.env` atual
- Fazer pull das atualizações do Git
- Instalar novas dependências (se houver)
- Executar migrations pendentes
- Rebuildar o frontend
- Reiniciar a aplicação

### 6.2 Rollback (em Caso de Problema)

Se algo der errado após uma atualização:

```bash
# Ver commits recentes
cd /opt/secretaria-online
git log --oneline -10

# Fazer checkout para commit anterior
git checkout [HASH_DO_COMMIT_ANTERIOR]

# Reinstalar dependências
cd backend && npm ci
cd ../frontend && npm ci && npm run build

# Reiniciar aplicação
pm2 restart secretaria-online-api
```

---

## Parte 7: Backup e Restore

### 7.1 Backup Manual do Banco de Dados

```bash
bash manage-app.sh backup
```

Os backups são salvos em: `/opt/secretaria-online/backups/database/`

**Backups automáticos**: Configure um cron job para backups diários:

```bash
# Editar crontab
crontab -e

# Adicionar linha (backup diário às 3h da manhã)
0 3 * * * /home/naturalbahia/manage-app.sh backup
```

### 7.2 Restore de Backup

```bash
bash manage-app.sh restore
```

Siga as instruções do script.

### 7.3 Backup Manual de Uploads

```bash
# Criar backup de uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /opt/secretaria-online/backend/uploads

# Mover para diretório de backup
mv uploads_backup_*.tar.gz /opt/secretaria-online/backups/
```

---

## Parte 8: Monitoramento e Troubleshooting

### 8.1 Verificar Saúde da Aplicação

```bash
bash manage-app.sh health
```

### 8.2 Problemas Comuns e Soluções

#### Aplicação não inicia

```bash
# Ver logs de erro
pm2 logs secretaria-online-api --err

# Verificar arquivo .env
cat /opt/secretaria-online/backend/.env | grep -v "PASSWORD\|SECRET"

# Testar conexão com banco
mysql -h localhost -u secretaria_prod -p secretaria_online
```

#### Erro de conexão com banco de dados

```bash
# Verificar se MariaDB está rodando
sudo systemctl status mariadb

# Se não estiver, iniciar
sudo systemctl start mariadb

# Ver logs do MariaDB
sudo tail -f /var/log/mysql/error.log
```

#### Porta 3000 já em uso

```bash
# Ver o que está usando a porta
sudo lsof -i :3000

# Se necessário, matar processo
sudo kill -9 [PID]

# Reiniciar aplicação
pm2 restart secretaria-online-api
```

#### Frontend não carrega (Nginx)

```bash
# Testar configuração do Nginx
sudo nginx -t

# Ver logs de erro
sudo tail -f /var/log/nginx/error.log

# Reiniciar Nginx
sudo systemctl restart nginx
```

#### SSL não funciona

```bash
# Verificar status do Certbot
sudo certbot certificates

# Renovar certificado manualmente
sudo certbot renew

# Ver logs do Certbot
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### 8.3 Monitoramento de Recursos

```bash
# Uso de CPU e memória
htop

# Uso de disco
df -h

# Espaço usado pela aplicação
du -sh /opt/secretaria-online/*

# Ver processos Node.js
ps aux | grep node
```

---

## Parte 9: Acesso Inicial à Aplicação

### 9.1 Credenciais do Admin Inicial

Após o primeiro deploy e execução dos seeders, o usuário admin padrão é:

- **Login**: admin
- **Senha**: admin123

**IMPORTANTE**: Faça login e altere a senha imediatamente!

### 9.2 Acessar a Aplicação

No navegador, acesse:

```
https://seudominio.com
```

Faça login com as credenciais do admin.

---

## Apêndice A: Comandos SSH Úteis

### Copiar arquivo do Windows para VM

```bash
scp arquivo.txt naturalbahia@secretaria-online:/home/naturalbahia/
```

### Copiar arquivo da VM para Windows

```bash
scp naturalbahia@secretaria-online:/home/naturalbahia/arquivo.txt C:\Downloads\
```

### Copiar pasta inteira

```bash
scp -r pasta/ naturalbahia@secretaria-online:/home/naturalbahia/
```

### Manter sessão SSH ativa

Edite o arquivo de configuração SSH no Windows:

```
C:\Users\[SEU_USUARIO]\.ssh\config
```

Adicione:

```
Host secretaria-online
    HostName [IP_OU_HOSTNAME]
    User naturalbahia
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

---

## Apêndice B: Comandos MariaDB Úteis

### Conectar ao banco

```bash
mysql -u secretaria_prod -p secretaria_online
```

### Listar tabelas

```sql
SHOW TABLES;
```

### Ver estrutura de uma tabela

```sql
DESCRIBE users;
```

### Contar registros

```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM students;
```

### Ver últimos registros

```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
```

### Fazer backup via SQL

```bash
mysqldump -u secretaria_prod -p secretaria_online > backup.sql
```

### Restaurar backup via SQL

```bash
mysql -u secretaria_prod -p secretaria_online < backup.sql
```

---

## Apêndice C: Estrutura de Diretórios no Servidor

```
/opt/secretaria-online/
├── backend/
│   ├── src/                    # Código-fonte do backend
│   ├── database/               # Migrations e seeders
│   ├── uploads/                # Arquivos enviados
│   │   ├── documents/
│   │   ├── contracts/
│   │   └── temp/
│   ├── logs/                   # Logs da aplicação
│   │   ├── pm2/
│   │   └── app/
│   ├── node_modules/           # Dependências Node.js
│   ├── .env                    # Variáveis de ambiente (NUNCA COMMITAR)
│   ├── package.json
│   └── ecosystem.config.js     # Configuração do PM2
├── frontend/
│   ├── src/                    # Código-fonte do frontend
│   ├── dist/                   # Build do frontend (servido pelo Nginx)
│   ├── node_modules/
│   └── package.json
└── backups/                    # Backups
    ├── database/
    └── uploads/
```

---

## Apêndice D: Checklist de Deploy

### Pré-Deploy
- [ ] VM criada e acessível via SSH
- [ ] DNS configurado e propagado
- [ ] Credenciais de email SMTP disponíveis
- [ ] Scripts transferidos para a VM

### Setup Inicial (Uma vez)
- [ ] Script `setup-vm.sh` executado com sucesso
- [ ] MariaDB seguro configurado (`mysql_secure_installation`)
- [ ] Banco de dados e usuário criados
- [ ] Firewall configurado e habilitado
- [ ] Nginx instalado (opcional)
- [ ] Certbot instalado (opcional)

### Deploy da Aplicação
- [ ] Script `deploy-app.sh` executado
- [ ] Arquivo `.env` configurado com credenciais reais
- [ ] Migrations executadas sem erros
- [ ] Seeders executados (primeira vez)
- [ ] Frontend buildado com sucesso
- [ ] Nginx configurado (se instalado)
- [ ] PM2 iniciou a aplicação
- [ ] Health check passou (API respondendo)

### Pós-Deploy
- [ ] SSL configurado com Certbot
- [ ] Aplicação acessível via HTTPS
- [ ] Login admin funcionando
- [ ] Senha admin alterada
- [ ] Backup automático configurado (cron)
- [ ] Monitoramento configurado

### Testes
- [ ] Login com usuário admin
- [ ] Cadastro de um aluno teste
- [ ] Upload de documento teste
- [ ] Envio de email teste (senha provisória)
- [ ] Acesso do aluno teste

---

## Suporte

### Logs a Verificar em Caso de Problema

1. **Logs do PM2**: `/opt/secretaria-online/backend/logs/pm2/`
2. **Logs da aplicação**: `/opt/secretaria-online/backend/logs/app/`
3. **Logs do Nginx**: `/var/log/nginx/`
4. **Logs do MariaDB**: `/var/log/mysql/`
5. **Logs do sistema**: `/var/log/syslog`

### Comandos de Diagnóstico

```bash
# Status geral do sistema
systemctl status

# Serviços críticos
sudo systemctl status mariadb
sudo systemctl status nginx
pm2 status

# Conexões de rede
sudo netstat -tulpn | grep -E "3000|80|443|3306"

# Uso de recursos
free -h
df -h
top
```

---

**Última atualização**: 2025-11-12
**Versão do Guia**: 1.0
