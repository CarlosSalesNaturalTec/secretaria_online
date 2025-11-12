# 🔧 Guia Completo de Troubleshooting

Solução para problemas comuns durante instalação e operação.

## 📋 Índice

1. [Problemas de Instalação](#problemas-de-instalação)
2. [Problemas de Banco de Dados](#problemas-de-banco-de-dados)
3. [Problemas de Aplicação](#problemas-de-aplicação)
4. [Problemas de Acesso](#problemas-de-acesso)
5. [Problemas de Performance](#problemas-de-performance)
6. [Problemas de Segurança](#problemas-de-segurança)

---

## 🔴 Problemas de Instalação

### Erro: "Permission denied" ao executar script

**Sintoma:**
```
bash: ./quick-install.sh: Permission denied
```

**Solução:**

```bash
# Tornar script executável
chmod +x quick-install.sh

# Ou executar com bash
bash quick-install.sh
```

---

### Erro: "command not found: npm"

**Sintoma:**
```
npm: command not found
```

**Causa:** Node.js não foi instalado corretamente

**Solução:**

```bash
# Reinstalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar
node --version
npm --version
```

---

### Erro: "sudo: command not found"

**Sintoma:**
```
sudo: command not found
```

**Causa:** Você está rodando como root (não deve)

**Solução:**

```bash
# Sair do root
exit

# Executar como usuário regular
bash quick-install.sh
```

---

### Erro: "git: command not found"

**Sintoma:**
```
git: command not found
```

**Solução:**

```bash
# Instalar git
sudo apt-get update
sudo apt-get install -y git

# Verificar
git --version
```

---

### Erro: "Cannot find module 'express'"

**Sintoma:**
```
Error: Cannot find module 'express'
```

**Causa:** npm install não foi executado

**Solução:**

```bash
cd ~/secretaria-online/backend
npm install --production

cd ~/secretaria-online/frontend
npm install --production
```

---

### Erro: Script trava/congela

**Sintoma:**
```
Script para de responder sem terminar
```

**Causas possíveis:**
- npm install muito lento
- Disco cheio
- Problema de conexão internet

**Solução:**

```bash
# Verificar disco
df -h

# Verificar conexão
ping google.com

# Verificar espaço em home
du -sh ~/

# Limpar cache npm se necessário
npm cache clean --force

# Tentar novamente
bash quick-install.sh
```

---

## 🔴 Problemas de Banco de Dados

### Erro: "Error: connect ECONNREFUSED 127.0.0.1:3306"

**Sintoma:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Causa:** MariaDB não está rodando

**Solução:**

```bash
# Iniciar MariaDB
sudo systemctl start mariadb

# Verificar status
sudo systemctl status mariadb

# Se não iniciar, reinstalar
sudo apt-get remove -y mariadb-server
sudo apt-get install -y mariadb-server
sudo systemctl start mariadb
```

---

### Erro: "ER_ACCESS_DENIED_FOR_USER"

**Sintoma:**
```
ER_ACCESS_DENIED_FOR_USER 'secretaria_user'@'localhost'
```

**Causa:** Credenciais de banco incorretas

**Solução:**

```bash
# 1. Verificar arquivo .env
cat ~/secretaria-online/backend/.env | grep DB_

# 2. Acessar MySQL como root
sudo mysql -u root -p
# Digite senha do root (padrão: root_temp_123 ou sua senha)

# 3. Verificar usuário
SELECT User, Host FROM mysql.user;

# 4. Se não existe, criar
CREATE USER 'secretaria_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON secretaria_online.* TO 'secretaria_user'@'localhost';
FLUSH PRIVILEGES;

# 5. Testar conexão
mysql -u secretaria_user -p secretaria_online
```

---

### Erro: "ER_DBACCESS_DENIED_ERROR"

**Sintoma:**
```
ER_DBACCESS_DENIED_ERROR: Access denied for user
```

**Causa:** Permissões insuficientes

**Solução:**

```bash
# Conectar como root
sudo mysql -u root -p

# Dar todas as permissões
GRANT ALL PRIVILEGES ON secretaria_online.* TO 'secretaria_user'@'localhost';
FLUSH PRIVILEGES;

# Ou recriar usuário
DROP USER 'secretaria_user'@'localhost';
CREATE USER 'secretaria_user'@'localhost' IDENTIFIED BY 'nova_senha';
GRANT ALL PRIVILEGES ON secretaria_online.* TO 'secretaria_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### Erro: "Unknown database 'secretaria_online'"

**Sintoma:**
```
Unknown database 'secretaria_online'
```

**Causa:** Banco não foi criado

**Solução:**

```bash
# Conectar como root
sudo mysql -u root -p

# Criar banco
CREATE DATABASE secretaria_online CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Verificar
SHOW DATABASES;

# Dar permissões ao usuário
GRANT ALL PRIVILEGES ON secretaria_online.* TO 'secretaria_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### Erro: "Too many connections"

**Sintoma:**
```
Too many connections
```

**Causa:** Limite de conexões simultâneas atingido

**Solução:**

```bash
# Aumentar limite em /etc/mysql/mariadb.conf.d/50-server.cnf
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf

# Encontrar linha:
# max_connections = 100

# Alterar para:
max_connections = 500

# Salvar (Ctrl+O, Enter, Ctrl+X)

# Reiniciar MariaDB
sudo systemctl restart mariadb
```

---

### Erro ao executar migrations

**Sintoma:**
```
npm ERR! code ELIFECYCLE
Migration failed
```

**Solução:**

```bash
# 1. Verificar status do MariaDB
sudo systemctl status mariadb

# 2. Verificar .env
cat ~/secretaria-online/backend/.env

# 3. Testar conexão manual
mysql -u secretaria_user -p secretaria_online -e "SELECT 1;"

# 4. Se tudo OK, executar novamente
cd ~/secretaria-online/backend
npm run db:migrate

# 5. Se continuar errando, desfazer e tentar novamente
npm run db:migrate:undo
npm run db:migrate
```

---

## 🔴 Problemas de Aplicação

### Erro: "Port 3000 already in use"

**Sintoma:**
```
Error: listen EADDRINUSE :::3000
```

**Causa:** Outra aplicação usando porta 3000

**Solução:**

```bash
# 1. Encontrar processo
sudo lsof -i :3000

# 2. Matar processo (substitua PID)
sudo kill -9 <PID>

# 3. Ou usar porta diferente
# Editar .env
nano ~/secretaria-online/backend/.env

# Alterar PORT=3000 para PORT=3001
# Salvar e reiniciar
pm2 restart secretaria-api
```

---

### Erro: "Cannot find module 'pdfkit'"

**Sintoma:**
```
Error: Cannot find module 'pdfkit'
```

**Solução:**

```bash
cd ~/secretaria-online/backend

# Instalar pdfkit
npm install pdfkit

# Ou reinstalar tudo
npm install --production

# Reiniciar
pm2 restart secretaria-api
```

---

### Erro: "ENOENT: no such file or directory"

**Sintoma:**
```
ENOENT: no such file or directory, mkdir 'uploads/documents'
```

**Causa:** Diretórios não existem

**Solução:**

```bash
# Criar diretórios
mkdir -p ~/secretaria-online/backend/uploads/documents
mkdir -p ~/secretaria-online/backend/uploads/contracts
mkdir -p ~/secretaria-online/backend/uploads/temp
mkdir -p ~/secretaria-online/backend/logs

# Verificar
ls -la ~/secretaria-online/backend/uploads/

# Reiniciar
pm2 restart secretaria-api
```

---

### Erro: "PM2 not found"

**Sintoma:**
```
pm2: command not found
```

**Solução:**

```bash
# Instalar PM2
sudo npm install -g pm2
pm2 update

# Verificar
pm2 --version

# Ativar startup
sudo pm2 startup systemd -u $USER --hp /home/$USER
pm2 save
```

---

### Erro: Backend iniciando mas morrendo

**Sintoma:**
```
pm2 status mostra: stopped / exited with code 1
```

**Solução:**

```bash
# 1. Ver erro detalhado
pm2 logs secretaria-api | tail -50

# 2. Verificar arquivo de erro
cat ~/.pm2/logs/secretaria-api-error.log

# 3. Verificar .env
cat ~/secretaria-online/backend/.env

# 4. Verificar banco de dados
mysql -u secretaria_user -p secretaria_online -e "SELECT 1;"

# 5. Deletar e reiniciar processo
pm2 delete secretaria-api
cd ~/secretaria-online/backend
pm2 start src/server.js --name "secretaria-api"
```

---

## 🔴 Problemas de Acesso

### Erro: "Cannot GET /health"

**Sintoma:**
```
Cannot GET /health
```

**Causa:** Backend não está rodando

**Solução:**

```bash
# Verificar status
pm2 status

# Ver logs
pm2 logs secretaria-api

# Reiniciar
pm2 restart secretaria-api

# Testar
curl http://localhost:3000/health
```

---

### Erro: "Connection refused" ao tentar acessar

**Sintoma:**
```
curl: (7) Failed to connect to localhost port 3000: Connection refused
```

**Causa:** Backend não está escutando na porta

**Solução:**

```bash
# 1. Verificar se processo está rodando
pm2 status

# 2. Se não está, iniciar
pm2 start ~/secretaria-online/backend/src/server.js --name "secretaria-api"

# 3. Se estava rodando, ver erro
pm2 logs secretaria-api

# 4. Verificar porta configurada
grep "^PORT=" ~/secretaria-online/backend/.env

# 5. Testar porta
netstat -tlnp | grep 3000
```

---

### Erro: "Frontend carrega mas API não responde"

**Sintoma:**
```
CORS error ou API_ERROR no console do navegador
```

**Causa:** .env do frontend tem URL errada ou backend não rodando

**Solução:**

```bash
# 1. Verificar .env frontend
cat ~/secretaria-online/frontend/.env

# 2. Verificar se está correto (tem IP correto e porta)
# Deve ser algo como: http://35.184.213.146:3000/api/v1

# 3. Verificar se backend está rodando
pm2 status

# 4. Testar backend direto
curl http://localhost:3000/health

# 5. Se OK mas frontend não consegue, é problema de firewall GCP
# Ir para seção "Firewall GCP" abaixo
```

---

### Erro: "Timeout ao tentar acessar"

**Sintoma:**
```
net::ERR_TIMED_OUT
```

**Causa:** Firewall bloqueando ou aplicação não responde

**Solução:**

```bash
# 1. Verificar se aplicação está rodando
pm2 status

# 2. Verificar porta
netstat -tlnp | grep 3000

# 3. Testar localmente
curl http://localhost:3000/health

# 4. Se falhar, ver logs
pm2 logs

# 5. Se funcionar localmente mas não de fora, é firewall GCP
# Ver seção "Firewall GCP" abaixo
```

---

## 🔴 Firewall GCP

### Erro: Não consegue acessar de fora da VM

**Sintoma:**
```
Página não carrega quando acesso de fora
curl: Connection timeout
```

**Causa:** Firewall GCP bloqueando porta

**Solução:**

```bash
# 1. Verificar regras de firewall
gcloud compute firewall-rules list

# 2. Se não existem, criar
gcloud compute firewall-rules create allow-backend \
  --allow=tcp:3000

gcloud compute firewall-rules create allow-frontend \
  --allow=tcp:5173

# 3. Via Console GCP também:
# VPC network > Firewalls and rules > CREATE FIREWALL RULE
# Nome: allow-backend-api
# Direction: Ingress
# Protocol: TCP
# Ports: 3000
# Source: 0.0.0.0/0

# 4. Testar de novo
# http://<IP_EXTERNO>:3000/health
```

---

## 🔴 Problemas de Performance

### Erro: "Application running but slow"

**Sintoma:**
```
Aplicação responde mas muito lentamente
```

**Causa possível:**
- Disco cheio
- Memória insuficiente
- Muitos logs
- Banco de dados lento

**Solução:**

```bash
# 1. Verificar uso de recursos
pm2 monit

# 2. Verificar disco
df -h

# 3. Se disco > 80%, limpar
# Limpar logs
pm2 logs --lines 0

# 4. Verificar memória
free -h

# 5. Se memória baixa, aumentar tamanho VM (GCP Console)

# 6. Otimizar banco
mysql -u secretaria_user -p secretaria_online
OPTIMIZE TABLE users;
OPTIMIZE TABLE documents;
OPTIMIZE TABLE enrollments;
EXIT;
```

---

### Erro: "500 errors intermitentes"

**Sintoma:**
```
Às vezes funciona, às vezes erro 500
```

**Causa possível:**
- Limite de conexões BD
- Memória insuficiente
- Muitas requisições

**Solução:**

```bash
# 1. Aumentar max_connections MySQL
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf
# max_connections = 500

sudo systemctl restart mariadb

# 2. Aumentar node workers
cd ~/secretaria-online/backend
# Editar .env, adicionar:
# NODE_CLUSTER_WORKERS=2

# 3. Habilitar connection pooling (já configurado no Sequelize)

# 4. Aumentar memória da VM
# Via GCP Console: Compute Engine > Instâncias > parar > alterar tipo
```

---

## 🔴 Problemas de Segurança

### Aviso: "Senha admin ainda é admin123"

**Solução:**

```bash
# Via Interface Web:
# 1. Fazer login com admin/admin123
# 2. Ir para Configurações/Perfil
# 3. Alterar senha

# Via Banco de Dados:
mysql -u secretaria_user -p secretaria_online
UPDATE users SET password='NOVO_HASH_BCRYPT' WHERE login='admin';
FLUSH PRIVILEGES;
EXIT;

# Para gerar hash bcrypt, use:
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('nova_senha', 10));"
```

---

### Aviso: "Senha SMTP em .env visível"

**Solução:**

```bash
# 1. Restringir permissões do .env
chmod 600 ~/secretaria-online/backend/.env

# 2. Usar environment variables ao invés de .env em produção
# Configurar via GCP Secret Manager

# 3. Nunca committar .env no Git
# Verificar .gitignore
cat ~/secretaria-online/.gitignore | grep env
```

---

## 📊 Debug Avançado

### Ver logs completos

```bash
# Backend
pm2 logs secretaria-api --lines 200

# Frontend
pm2 logs secretaria-frontend --lines 200

# Sistema
sudo journalctl -u mariadb -n 100
```

### Monitorar em tempo real

```bash
# PM2 monitor
pm2 monit

# MySQL
mysql -u secretaria_user -p secretaria_online
SHOW PROCESSLIST;
```

### Test API diretamente

```bash
# Teste health
curl http://localhost:3000/health

# Teste com auth
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"admin123"}'

# Debug detalhado
curl -v http://localhost:3000/health
```

---

## 🆘 Se Nada Funcionar

### 1. Reset Completo

```bash
# Parar tudo
pm2 stop all
sudo systemctl stop mariadb

# Limpar logs
rm -rf ~/.pm2/logs/*

# Reiniciar
sudo systemctl start mariadb
pm2 restart all
```

### 2. Reinstalar Aplicação

```bash
cd ~
rm -rf secretaria-online
git clone https://github.com/CarlosSalesNaturalTec/secretaria_online.git
cd secretaria-online/install-scripts
bash quick-install.sh
```

### 3. Abrir Issue no GitHub

Se o problema persistir, abra issue com:

```
- Descrição do problema
- Comando que executou
- Mensagem de erro (completa)
- Saída de: pm2 status, pm2 logs, df -h
```

GitHub: https://github.com/CarlosSalesNaturalTec/secretaria_online/issues

---

## 📞 Contato

- Email: [seu email]
- GitHub: https://github.com/CarlosSalesNaturalTec
- Issues: https://github.com/CarlosSalesNaturalTec/secretaria_online/issues

---

**Última atualização**: 2025-11-11
**Versão**: 1.0.0

---

Voltar para: [README.md](README.md) | [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)
