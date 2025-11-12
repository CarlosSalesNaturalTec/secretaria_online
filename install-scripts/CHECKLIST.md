# ✅ CHECKLIST DE INSTALAÇÃO - SECRETARIA ONLINE

## 📋 PRÉ-INSTALAÇÃO

### Preparação GCP

- [ ] Conta Google Cloud criada
- [ ] Projeto GCP criado
- [ ] Billing habilitado
- [ ] API Compute Engine ativada
- [ ] VM e2-medium criada (Debian 11)
- [ ] Acesso SSH à VM funcionando
- [ ] IP externo da VM anotado: `_________________`

**Tempo estimado**: 15 minutos

---

## 🚀 INSTALAÇÃO

### Passo 1: Preparação

- [ ] Conectado à VM via SSH
- [ ] Repositório clonado: `git clone https://github.com/CarlosSalesNaturalTec/secretaria_online.git`
- [ ] Entrou em `install-scripts/`: `cd secretaria_online/install-scripts`
- [ ] Script verificado: `ls -la quick-install.sh`
- [ ] Internet funcionando: `ping google.com`

**Tempo estimado**: 5 minutos

### Passo 2: Instalação Automática

- [ ] Script iniciado: `bash quick-install.sh`
- [ ] Confirmou instalação (digitou 's')
- [ ] Esperou conclusão (30-40 minutos)
- [ ] Script terminou com "✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
- [ ] Nenhum erro crítico apareceu

**Tempo estimado**: 30-40 minutos

### Passo 3: Configuração Pós-Instalação

- [ ] PM2 status verificado: `pm2 status`
- [ ] Ambos os processos rodando (secretaria-api e secretaria-frontend)
- [ ] Health check passou: `bash 06-health-check.sh`
- [ ] IP externo anotado
- [ ] Acesso de fora funciona: `http://<IP>:5173`

**Tempo estimado**: 5 minutos

---

## ✨ PÓSINSTALAÇÃO OBRIGATÓRIO

### Segurança

- [ ] Senha admin alterada (Login > Configurações)
  - Usuário: admin
  - Senha antiga: admin123
  - Nova senha: `_________________`

- [ ] Senha root MariaDB alterada
  ```bash
  sudo mysql -u root -p
  ALTER USER 'root'@'localhost' IDENTIFIED BY 'NOVA_SENHA';
  FLUSH PRIVILEGES;
  EXIT;
  ```
  - Nova senha: `_________________`

- [ ] SMTP configurado (se necessário)
  ```bash
  nano ~/secretaria-online/backend/.env
  # Alterar SMTP_HOST, SMTP_USER, SMTP_PASS
  pm2 restart secretaria-api
  ```

### Verificação

- [ ] Backend respondendo: `curl http://localhost:3000/health`
- [ ] MariaDB ativo: `sudo systemctl status mariadb`
- [ ] Firewall GCP configurado (portas 3000, 5173 abertas)
- [ ] Logs normais: `pm2 logs | tail -20`

**Tempo estimado**: 10 minutos

---

## 📊 PRIMEIRO ACESSO

### Acesso à Aplicação

- [ ] Frontend acessível: `http://<IP_DA_VM>:5173`
- [ ] Página de login carregou
- [ ] Login funcionando com `admin/admin123`
- [ ] Dashboard apareceu
- [ ] Tema carregou corretamente

### Primeira Ação Recomendada

- [ ] Alterar senha do admin
- [ ] Explorar dashboard
- [ ] Verificar documentação: `~/secretaria-online/docs/`
- [ ] Ler guia de uso: [docs/contextDoc.md](../docs/contextDoc.md)

**Tempo estimado**: 5 minutos

---

## 🔍 VERIFICAÇÕES PÓS-INSTALAÇÃO

### Aplicação

- [ ] Backend rodando: `pm2 status` ✅
- [ ] Frontend rodando: `pm2 status` ✅
- [ ] Ambos iniciando no boot: `pm2 startup` ✅
- [ ] Logs limpos sem erros: `pm2 logs` ✅
- [ ] Health check passou: `bash 06-health-check.sh` ✅

### Banco de Dados

- [ ] MariaDB ativo: `sudo systemctl status mariadb` ✅
- [ ] Banco `secretaria_online` existe: `mysql -u secretaria_user -p -e "SHOW DATABASES;"` ✅
- [ ] Tabelas criadas: `mysql -u secretaria_user -p secretaria_online -e "SHOW TABLES;"` ✅
- [ ] Dados iniciais carregados (admin user existe) ✅

### Rede/Firewall

- [ ] IP externo funciona: `http://<IP>:5173` ✅
- [ ] Porta 3000 acessível de fora ✅
- [ ] Porta 5173 acessível de fora ✅
- [ ] SSH ainda funciona ✅

### Disco/Recursos

- [ ] Disco tem espaço: `df -h` (>5GB livre) ✅
- [ ] Memória OK: `free -h` ✅
- [ ] Processos rodando: `pm2 monit` ✅
- [ ] CPU normal: `top` ✅

---

## 💾 BACKUP

### Configurar Backups

- [ ] Criou diretório de backup: `mkdir -p ~/backups`
- [ ] Backup manual do BD:
  ```bash
  mysqldump -u secretaria_user -p secretaria_online > ~/backups/backup_inicial.sql
  ```
- [ ] Verificou arquivo: `ls -lh ~/backups/`

- [ ] Backup manual de uploads:
  ```bash
  tar -czf ~/backups/uploads_inicial.tar.gz ~/secretaria-online/backend/uploads/
  ```

- [ ] Testou restore (opcional):
  ```bash
  mysql -u secretaria_user -p secretaria_online < ~/backups/backup_inicial.sql
  ```

**Tempo estimado**: 10 minutos

---

## 🔐 SEGURANÇA

### Configuração de Firewall GCP

- [ ] Regra HTTP (80): Criada
- [ ] Regra HTTPS (443): Criada (opcional)
- [ ] Regra Backend (3000): Criada
- [ ] Regra Frontend (5173): Criada
- [ ] Regra SSH (22): Permitida
- [ ] Origem IPs restrita (opcional)

### SSH Keys

- [ ] SSH keys configuradas (se não usar Cloud Shell)
- [ ] Acesso passwordless habilitado
- [ ] Chave privada armazenada com segurança

### Senhas

- [ ] Admin: `_______` ✅ (foi alterada)
- [ ] MariaDB root: `_______` ✅ (foi alterada)
- [ ] SMTP: `_______` ✅ (configurado se necessário)
- [ ] Nenhuma senha em .env commitada no Git ✅

---

## 🎮 OPERAÇÕES DIÁRIAS

### Comandos Úteis

- [ ] Memorizou: `pm2 status`
- [ ] Memorizou: `pm2 logs`
- [ ] Memorizou: `bash manage-app.sh`
- [ ] Memorizou: `sudo systemctl status mariadb`
- [ ] Sabe onde está o .env: `~/secretaria-online/backend/.env`

### Documentação Local

- [ ] Leu [install-scripts/README.md](README.md)
- [ ] Leu [docs/contextDoc.md](../docs/contextDoc.md)
- [ ] Bookmarked [install-scripts/TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- [ ] Salvou link do GitHub: https://github.com/CarlosSalesNaturalTec/secretaria_online

---

## 🚨 MONITORAMENTO

### Logs

- [ ] Sabe onde ver logs: `~/.pm2/logs/`
- [ ] Configurou rotação de logs: `pm2 install pm2-logrotate`
- [ ] Sabe como ver logs em tempo real: `pm2 logs`
- [ ] Sabe filtrar logs: `pm2 logs secretaria-api`

### Alertas

- [ ] Configurou monitoramento (opcional)
- [ ] Sabe como reiniciar: `pm2 restart all`
- [ ] Sabe como reloadar: `pm2 reload all`
- [ ] Sabe como parar: `pm2 stop all`

### Performance

- [ ] Checou recursos mensalmente: `pm2 monit`
- [ ] Limpou arquivos antigos se necessário
- [ ] Otimizou BD se necessário
- [ ] Aumentou VM se performance baixa

---

## 📚 DOCUMENTAÇÃO CRIADA

### Scripts

- [x] `quick-install.sh` - Instalação automatizada
- [x] `manage-app.sh` - Menu de gerenciamento
- [x] `06-health-check.sh` - Verificação de saúde
- [x] `01-06-*.sh` - Scripts individuais

### Guias

- [x] `QUICKSTART.md` - Começar aqui
- [x] `INSTALLATION_GUIDE.md` - Guia detalhado
- [x] `GCP_VM_SETUP.md` - Setup da VM
- [x] `TROUBLESHOOTING.md` - Solução de problemas
- [x] `README.md` - Referência rápida
- [x] `CHECKLIST.md` - Este arquivo

### Índices

- [x] `INSTALLATION_INDEX.md` - Índice principal
- [x] `DEPLOYMENT_SUMMARY.md` - Resumo

---

## ✅ CONCLUSÃO

### Tudo Pronto?

- [ ] Instalação concluída com sucesso ✅
- [ ] Aplicação rodando ✅
- [ ] Acesso funcionando ✅
- [ ] Segurança configurada ✅
- [ ] Backup configurado ✅
- [ ] Documentação lida ✅
- [ ] Equipe treinada ✅

### Próximas Etapas

1. [ ] Usar a aplicação em produção
2. [ ] Monitorar logs regularmente
3. [ ] Fazer backups periódicos
4. [ ] Manter sistema atualizado
5. [ ] Reportar issues no GitHub
6. [ ] Contribuir melhorias (opcional)

---

## 📞 INFORMAÇÕES IMPORTANTES

### URLs da Aplicação

```
Frontend:    http://<IP_DA_VM>:5173
Backend API: http://<IP_DA_VM>:3000
API Health:  http://<IP_DA_VM>:3000/health
```

IP da VM: `_______________________`

### Contatos Importantes

```
GitHub Repo: https://github.com/CarlosSalesNaturalTec/secretaria_online
Issues:      https://github.com/CarlosSalesNaturalTec/secretaria_online/issues
Documentação: ~/secretaria-online/install-scripts/
```

### Credenciais (Alterar após primeiro acesso!)

```
Admin Login: admin
Admin Senha: admin123 → ALTERAR PARA: _______________________

MariaDB Root Senha: _______________________
DB User: secretaria_user
DB Senha: _______________________
```

---

## 📝 NOTAS

```
Data de Instalação: ____/____/______
Pessoa Responsável: _______________________
VM IP Externo: _______________________
Versão do Código: _______________________
Observações:
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## 🎉 PARABÉNS!

Você completou a instalação da **Secretaria Online** em uma VM GCP!

**Agora você pode:**
- ✅ Acessar aplicação em `http://<IP>:5173`
- ✅ Fazer login com credenciais admin
- ✅ Gerenciar banco de dados
- ✅ Visualizar logs em tempo real
- ✅ Fazer backups regulares
- ✅ Monitorar performance
- ✅ Escalar conforme necessário

**Bem-vindo ao Secretaria Online! 🚀**

---

**Última atualização**: 2025-11-11
**Versão**: 1.0.0
**Status**: ✅ Pronto para Produção

---

Documentação: [INSTALLATION_INDEX.md](../INSTALLATION_INDEX.md)
