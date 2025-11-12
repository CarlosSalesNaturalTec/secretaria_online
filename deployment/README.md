# Scripts de Deployment - Secretaria Online na GCP

Este diretório contém todos os scripts e arquivos necessários para realizar o deployment da aplicação Secretaria Online na Google Cloud Platform (GCP).

## 📋 Arquivos Incluídos

### Scripts Shell

| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| `setup-vm.sh` | Configuração inicial da VM | Uma vez, no primeiro setup |
| `deploy-app.sh` | Deploy/atualização da aplicação | A cada nova versão |
| `manage-app.sh` | Gerenciamento da aplicação | Para operações do dia a dia |

### Arquivos de Configuração

| Arquivo | Descrição |
|---------|-----------|
| `.env.production.example` | Template de variáveis de ambiente para produção |
| `GUIA-DEPLOYMENT.md` | Guia completo passo a passo (LEIA PRIMEIRO!) |

---

## 🚀 Início Rápido

### Primeira vez (Setup da VM)

1. **Leia o guia completo**: Abra `GUIA-DEPLOYMENT.md`

2. **Transfira os scripts para a VM**:
   ```bash
   scp *.sh .env.production.example naturalbahia@secretaria-online:/home/naturalbahia/
   ```

3. **Conecte à VM e execute o setup**:
   ```bash
   ssh naturalbahia@secretaria-online
   chmod +x *.sh
   bash setup-vm.sh
   ```

4. **Configure o banco de dados** (manual - veja guia)

5. **Execute o deploy**:
   ```bash
   bash deploy-app.sh
   ```

### Atualizações Futuras

Para deploy de novas versões:

```bash
ssh naturalbahia@secretaria-online
bash deploy-app.sh
```

---

## 📚 Documentação Detalhada

**Consulte o arquivo `GUIA-DEPLOYMENT.md`** para:

- Instruções passo a passo completas
- Configuração de SSL/HTTPS
- Troubleshooting
- Comandos úteis
- Monitoramento e backup

---

## 🔧 Detalhes dos Scripts

### setup-vm.sh

**Descrição**: Configura a VM do zero com todas as dependências necessárias.

**O que faz**:
- ✓ Atualiza o sistema Debian
- ✓ Instala Node.js v20 LTS
- ✓ Instala PM2 (gerenciador de processos)
- ✓ Instala MariaDB (banco de dados)
- ✓ Configura firewall (UFW)
- ✓ Cria estrutura de diretórios
- ✓ (Opcional) Instala Nginx como proxy reverso
- ✓ (Opcional) Instala Certbot para SSL gratuito

**Uso**:
```bash
bash setup-vm.sh
```

**Executar**: Uma vez, no primeiro setup da VM.

---

### deploy-app.sh

**Descrição**: Faz o deploy ou atualização da aplicação.

**O que faz**:
- ✓ Clone/pull do repositório Git
- ✓ Instalação de dependências (backend e frontend)
- ✓ Configuração de variáveis de ambiente
- ✓ Execução de migrations do banco de dados
- ✓ Build do frontend
- ✓ Configuração do Nginx (se instalado)
- ✓ Início/reinício da aplicação com PM2

**Uso**:
```bash
bash deploy-app.sh
```

**Executar**:
- Primeira vez após `setup-vm.sh`
- A cada nova versão da aplicação

---

### manage-app.sh

**Descrição**: Gerencia operações do dia a dia da aplicação.

**Funcionalidades**:
- ✓ Start/stop/restart da aplicação
- ✓ Visualização de logs
- ✓ Health check
- ✓ Backup/restore do banco de dados
- ✓ Limpeza de arquivos temporários

**Uso - Modo Interativo (Menu)**:
```bash
bash manage-app.sh
```

**Uso - Comandos Diretos**:
```bash
# Iniciar aplicação
bash manage-app.sh start

# Parar aplicação
bash manage-app.sh stop

# Reiniciar aplicação
bash manage-app.sh restart

# Ver status
bash manage-app.sh status

# Ver logs
bash manage-app.sh logs

# Ver logs em tempo real
bash manage-app.sh logs follow

# Health check
bash manage-app.sh health

# Backup do banco
bash manage-app.sh backup

# Limpar temp
bash manage-app.sh clean
```

**Executar**: Sempre que necessário gerenciar a aplicação.

---

## 🎯 Configurações Necessárias

### Variáveis de Ambiente (Backend)

Após executar `deploy-app.sh`, edite `/opt/secretaria-online/backend/.env`:

```env
# Banco de Dados (use as credenciais criadas no setup)
DB_HOST=localhost
DB_NAME=secretaria_online
DB_USER=secretaria_user
DB_PASSWORD=SuaSenhaAqui

# JWT Secret (gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=chave_gerada_aqui

# Email SMTP
SMTP_HOST=smtp.seudominio.com
SMTP_USER=noreply@seudominio.com
SMTP_PASS=SuaSenhaEmailAqui

# URLs
BASE_URL=https://seudominio.com
CORS_ORIGIN=https://seudominio.com
```

### Nginx (se instalado)

O script `deploy-app.sh` pode configurar automaticamente, ou você pode editar manualmente:

```bash
sudo nano /etc/nginx/sites-available/secretaria-online
```

### SSL (HTTPS)

Após configurar DNS e Nginx:

```bash
sudo certbot --nginx -d seudominio.com
```

---

## ⚠️ Importante

### Segurança

- ✓ **Nunca** commite arquivos `.env` no Git
- ✓ Use senhas fortes para banco de dados
- ✓ Gere JWT_SECRET aleatório e complexo
- ✓ Configure firewall corretamente
- ✓ Use HTTPS em produção (SSL/TLS)

### Backup

- ✓ Configure backup automático do banco (cron)
- ✓ Faça backup antes de atualizações importantes
- ✓ Mantenha backups fora do servidor

### Monitoramento

- ✓ Monitore logs regularmente: `pm2 logs`
- ✓ Verifique saúde da aplicação: `bash manage-app.sh health`
- ✓ Configure alertas de disco/memória

---

## 🐛 Troubleshooting

### Aplicação não inicia

```bash
# Ver logs de erro
pm2 logs secretaria-online-api --err

# Verificar configuração
cat /opt/secretaria-online/backend/.env
```

### Erro de conexão com banco

```bash
# Verificar se MariaDB está rodando
sudo systemctl status mariadb

# Testar conexão
mysql -u secretaria_user -p secretaria_online
```

### Problemas com Nginx

```bash
# Testar configuração
sudo nginx -t

# Ver logs
sudo tail -f /var/log/nginx/error.log

# Reiniciar
sudo systemctl restart nginx
```

**Para troubleshooting completo, consulte `GUIA-DEPLOYMENT.md`**.

---

## 📞 Informações do Servidor

- **Instância**: e2-medium (GCP Compute Engine)
- **OS**: Debian 11 (Bullseye)
- **Node.js**: v20 LTS
- **Banco**: MariaDB 10.5+
- **Proxy**: Nginx
- **Process Manager**: PM2
- **SSL**: Let's Encrypt (Certbot)

---

## 📂 Estrutura no Servidor

```
/opt/secretaria-online/
├── backend/
│   ├── src/
│   ├── uploads/
│   ├── logs/
│   ├── .env              # Configuração (EDITAR!)
│   └── ecosystem.config.js
├── frontend/
│   ├── dist/             # Build (servido pelo Nginx)
│   └── ...
└── backups/
    ├── database/
    └── uploads/
```

---

## 🔄 Fluxo de Deploy

```
1. Setup Inicial (uma vez)
   └─ setup-vm.sh
   └─ Configurar MariaDB
   └─ Criar banco/usuário

2. Primeiro Deploy
   └─ deploy-app.sh
   └─ Editar .env
   └─ Executar migrations/seeders

3. Configurar Produção
   └─ Configurar Nginx
   └─ Configurar SSL (Certbot)
   └─ Configurar backup automático

4. Atualizações Futuras
   └─ deploy-app.sh (sempre)

5. Gerenciamento Diário
   └─ manage-app.sh
```

---

## 📝 Checklist Rápido

### Pré-Deploy
- [ ] VM criada e SSH funcionando
- [ ] DNS configurado (se usar domínio)
- [ ] Credenciais de email prontas

### Setup Inicial
- [ ] `setup-vm.sh` executado
- [ ] MariaDB configurado
- [ ] Banco de dados criado

### Deploy
- [ ] `deploy-app.sh` executado
- [ ] `.env` configurado
- [ ] Migrations executadas
- [ ] PM2 rodando aplicação

### Pós-Deploy
- [ ] Nginx configurado
- [ ] SSL habilitado
- [ ] Aplicação acessível via HTTPS
- [ ] Login admin funcionando
- [ ] Backup configurado

---

## 🆘 Precisa de Ajuda?

1. **Leia primeiro**: `GUIA-DEPLOYMENT.md` (documentação completa)
2. **Verifique logs**: `pm2 logs secretaria-online-api`
3. **Health check**: `bash manage-app.sh health`
4. **Ver status**: `pm2 status`

---

**Data de Criação**: 2025-11-12
**Versão dos Scripts**: 1.0
**Compatível com**: Debian 11, Node.js v20, MariaDB 10.5+
