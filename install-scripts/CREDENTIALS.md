# 🔐 CREDENCIAIS E INFORMAÇÕES DE ACESSO

## ✅ Informações da VM

```
Nome da VM:     secretaria-online-prod
Usuário:        naturalbahia
Região:         us-central1
Zona:           us-central1-a
Tipo:           e2-medium
SO:             Debian 11 Bullseye
Disco:          20GB SSD
```

## 🌐 Como Conectar

### Via gcloud CLI (Recomendado)

```bash
gcloud compute ssh secretaria-online-prod --zone=us-central1-a
```

### Via SSH Local

```bash
# 1. Obter IP externo
gcloud compute instances describe secretaria-online-prod \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# 2. Conectar
ssh naturalbahia@<IP_EXTERNO>
```

### Via Google Cloud Console

1. Acesse https://console.cloud.google.com
2. Compute Engine > Instâncias de VM
3. Procure por `secretaria-online-prod`
4. Clique no botão SSH

---

## 📁 Diretórios Importantes

```
Repositório:     /home/naturalbahia/secretaria-online
Backend:         /home/naturalbahia/secretaria-online/backend
Frontend:        /home/naturalbahia/secretaria-online/frontend
Scripts:         /home/naturalbahia/secretaria-online/install-scripts
Uploads:         /home/naturalbahia/secretaria-online/backend/uploads
Logs PM2:        ~/.pm2/logs/
Logs App:        /home/naturalbahia/secretaria-online/backend/logs/
```

---

## 🔑 Credenciais Padrão (⚠️ ALTERE!)

### Admin da Aplicação

```
Usuário: admin
Senha:   admin123
```

**Alterar em**: Login web > Configurações/Perfil

### MariaDB Root

```
Usuário: root
Senha:   root_password_change_me
```

**ALTERE IMEDIATAMENTE:**
```bash
sudo mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'SENHA_NOVA_FORTE';
FLUSH PRIVILEGES;
EXIT;
```

### Database User

```
Usuário: secretaria_user
Senha:   secretaria_password_XXXXX (gerada aleatoriamente)
Banco:   secretaria_online
```

---

## 🌐 URLs de Acesso

Após a instalação, obtém o IP da VM:

```bash
gcloud compute instances describe secretaria-online-prod \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

Então acessa:

```
Frontend:        http://<IP_DA_VM>:5173
Backend API:     http://<IP_DA_VM>:3000
API Health:      http://<IP_DA_VM>:3000/health
```

---

## 🎮 Comandos Principais

### Ver Status da Aplicação

```bash
pm2 status
```

### Ver Logs em Tempo Real

```bash
pm2 logs
```

### Parar/Iniciar Aplicação

```bash
pm2 stop all        # Parar todos
pm2 start all       # Iniciar todos
pm2 restart all     # Reiniciar
```

### Menu de Gerenciamento

```bash
bash ~/secretaria-online/install-scripts/manage-app.sh
```

### Verificar Saúde

```bash
bash ~/secretaria-online/install-scripts/06-health-check.sh
```

---

## 🗄️ Banco de Dados

### Acessar MySQL

```bash
mysql -u secretaria_user -p secretaria_online
# Digite a senha
```

### Ou via Menu

```bash
bash ~/secretaria-online/install-scripts/manage-app.sh
# Opção: 12) Acessar MySQL shell
```

### Executar Migrations

```bash
cd ~/secretaria-online/backend
npm run db:migrate
npm run db:seed
```

---

## 📊 Estrutura de Diretórios

```
/home/naturalbahia/secretaria-online/
├── backend/
│   ├── src/
│   ├── uploads/
│   │   ├── documents/
│   │   ├── contracts/
│   │   └── temp/
│   ├── logs/
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── dist/
│   ├── .env
│   └── package.json
│
├── install-scripts/
│   ├── quick-install.sh
│   ├── manage-app.sh
│   ├── 06-health-check.sh
│   ├── QUICKSTART.md
│   ├── INSTALLATION_GUIDE.md
│   ├── GCP_VM_SETUP.md
│   ├── TROUBLESHOOTING.md
│   └── README.md
│
└── docs/
    ├── contextDoc.md
    ├── requirements.md
    └── api-documentation.md
```

---

## 🔧 Configurar SMTP (Email)

O arquivo `.env` deve ser editado com suas credenciais SMTP:

```bash
nano ~/secretaria-online/backend/.env
```

Busque e altere:

```
SMTP_HOST=smtp.seu_servidor.com
SMTP_PORT=587
SMTP_USER=seu_email@seu_dominio.com
SMTP_PASS=sua_senha_app
SMTP_FROM=noreply@seu_dominio.com
```

Depois reinicie:

```bash
pm2 restart secretaria-api
```

---

## 💾 Backup

### Backup Manual do Banco

```bash
mysqldump -u secretaria_user -p secretaria_online > ~/backup_$(date +%Y%m%d).sql
```

### Backup de Uploads

```bash
tar -czf ~/uploads_$(date +%Y%m%d).tar.gz ~/secretaria-online/backend/uploads/
```

---

## 🚀 Instalação Rápida

Se ainda não instalou, execute:

```bash
# Conectar
gcloud compute ssh secretaria-online-prod --zone=us-central1-a

# Clonar e instalar
git clone https://github.com/CarlosSalesNaturalTec/secretaria_online.git
cd secretaria_online/install-scripts
bash quick-install.sh
```

**Tempo**: 30-40 minutos

---

## 📞 Referências

- **GitHub**: https://github.com/CarlosSalesNaturalTec/secretaria_online
- **Issues**: https://github.com/CarlosSalesNaturalTec/secretaria_online/issues
- **Docs**: `/home/naturalbahia/secretaria-online/install-scripts/`

---

## ⏱️ Próximas Etapas Após Instalação

- [ ] Verificar saúde: `bash ~/secretaria-online/install-scripts/06-health-check.sh`
- [ ] Acessar em `http://<IP>:5173`
- [ ] Login com `admin/admin123`
- [ ] Alterar senha admin
- [ ] Alterar senha MariaDB root
- [ ] Configurar SMTP
- [ ] Fazer backup inicial
- [ ] Configurar firewall GCP
- [ ] Configurar monitoramento

---

**Documento criado em**: 2025-11-11
**Versão**: 1.0.0
**VM**: secretaria-online-prod
**Usuário**: naturalbahia

---

**Bem-vindo ao Secretaria Online! 🎉**
