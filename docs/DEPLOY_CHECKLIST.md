# Checklist de Deploy - GCP Compute Engine

**Projeto:** Secretaria Online
**Ambiente:** GCP Compute Engine (Debian)
**Data:** ____/____/________

---

## ☁️ Fase 1: Preparação do GCP

- [ ] Conta GCP ativa com projeto criado
- [ ] Faturamento configurado
- [ ] gcloud CLI instalado e autenticado
- [ ] APIs necessárias ativadas (Compute Engine, Cloud SQL)

---

## 🖥️ Fase 2: Criação da VM

- [ ] VM Compute Engine criada
  - Machine type: `e2-medium` (2 vCPU, 4 GB RAM)
  - OS: Debian 11 (Bullseye)
  - Disco: 20 GB SSD
  - Tags: `http-server`, `https-server`
- [ ] IP externo estático reservado
- [ ] IP associado à VM
- [ ] Regras de firewall criadas (80, 443, 22)
- [ ] Conexão SSH funcionando

---

## 🔧 Fase 3: Provisionamento do Servidor

- [ ] Script `gcp-setup.sh` transferido para o servidor
- [ ] Script executado com sucesso (`sudo bash gcp-setup.sh`)
- [ ] Node.js v20 LTS instalado
- [ ] npm instalado
- [ ] PM2 instalado globalmente
- [ ] MySQL 8.0 instalado e rodando
- [ ] Nginx instalado
- [ ] Certbot instalado
- [ ] Firewall (UFW) configurado
- [ ] Usuário `deploy` criado
- [ ] Estrutura de diretórios criada em `/var/www/secretaria-online/`
- [ ] Permissões ajustadas corretamente

---

## 🗄️ Fase 4: Configuração do Banco de Dados

- [ ] `mysql_secure_installation` executado
- [ ] Senha root do MySQL definida
- [ ] Banco de dados `secretaria_online` criado
- [ ] Usuário `secretaria_user` criado com senha forte
- [ ] Permissões concedidas ao usuário
- [ ] Conexão ao banco testada

---

## 🌐 Fase 5: Configuração do DNS

- [ ] Domínio registrado ou disponível
- [ ] Registro A apontando para o IP da VM
  - `seu-dominio.com` → IP da VM
  - `www.seu-dominio.com` → IP da VM
- [ ] Propagação DNS verificada (pode levar até 24h)
- [ ] Ping para o domínio funcionando

---

## 🔧 Fase 6: Configuração do Nginx

- [ ] Arquivo `nginx.conf` copiado para `/etc/nginx/sites-available/secretaria-online`
- [ ] Domínio atualizado no arquivo de configuração
- [ ] Link simbólico criado em `/etc/nginx/sites-enabled/`
- [ ] Site padrão removido
- [ ] Configuração do Nginx testada (`nginx -t`)
- [ ] Nginx recarregado

---

## 🔒 Fase 7: Configuração do SSL/TLS

- [ ] Diretório `/var/www/certbot` criado
- [ ] Certbot executado para gerar certificado
- [ ] Certificado gerado com sucesso
- [ ] Nginx recarregado após instalação do certificado
- [ ] HTTPS funcionando corretamente
- [ ] Redirecionamento HTTP → HTTPS funcionando
- [ ] Renovação automática testada (`certbot renew --dry-run`)

---

## 📦 Fase 8: Preparação da Aplicação

### Backend

- [ ] Arquivo `.env` criado em `/var/www/secretaria-online/backend/`
- [ ] Variáveis de ambiente configuradas:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3000`
  - [ ] `BASE_URL=https://seu-dominio.com`
  - [ ] Credenciais do banco de dados
  - [ ] `JWT_SECRET` (32+ caracteres aleatórios)
  - [ ] Configurações de SMTP
  - [ ] Caminho de uploads
- [ ] Arquivo `.env` com permissões corretas (chmod 600)

### Frontend

- [ ] Build do frontend testado localmente
- [ ] Variáveis de ambiente do frontend configuradas (se necessário)

---

## 🚀 Fase 9: Deploy da Aplicação

- [ ] Script `gcp-deploy.sh` configurado:
  - [ ] `SSH_USER` atualizado
  - [ ] `SSH_HOST` atualizado (IP da VM)
- [ ] Arquivo `ecosystem.config.js` copiado para o servidor
- [ ] Chave SSH configurada para acesso sem senha (opcional)
- [ ] Deploy executado (`bash scripts/gcp-deploy.sh all`)
- [ ] Frontend enviado com sucesso
- [ ] Backend enviado com sucesso
- [ ] Dependências instaladas no servidor
- [ ] Migrations executadas com sucesso
- [ ] PM2 iniciado com sucesso
- [ ] PM2 configurado para iniciar no boot
- [ ] Status do PM2 verificado (`pm2 status`)

---

## ✅ Fase 10: Testes

### Testes de Backend

- [ ] API respondendo em `https://seu-dominio.com/api/health`
- [ ] Login de administrador funcionando
- [ ] CRUD de alunos funcionando
- [ ] CRUD de professores funcionando
- [ ] CRUD de cursos funcionando
- [ ] Upload de documentos funcionando
- [ ] Geração de PDFs funcionando
- [ ] Envio de emails funcionando

### Testes de Frontend

- [ ] Frontend carregando em `https://seu-dominio.com`
- [ ] Assets (CSS, JS, imagens) carregando corretamente
- [ ] Login funcionando
- [ ] Navegação entre páginas funcionando
- [ ] Formulários funcionando
- [ ] Modais e componentes interativos funcionando

### Testes de Segurança

- [ ] HTTPS forçado (HTTP redireciona para HTTPS)
- [ ] Headers de segurança presentes (verificar com dev tools)
- [ ] Certificado SSL válido
- [ ] Firewall configurado corretamente
- [ ] Senhas e segredos não expostos
- [ ] Logs não expõem informações sensíveis

---

## 📊 Fase 11: Monitoramento e Logs

- [ ] PM2 logs configurados
- [ ] Nginx logs acessíveis
- [ ] Logs da aplicação criados e acessíveis
- [ ] Logrotate configurado
- [ ] Monitoramento básico configurado (`pm2 monit`)
- [ ] Alertas configurados (opcional)

---

## 💾 Fase 12: Backups

- [ ] Script de backup do banco criado (`backup-db.sh`)
- [ ] Script de backup de uploads criado (`backup-uploads.sh`)
- [ ] Scripts tornados executáveis
- [ ] Cron jobs configurados para backups automáticos:
  - [ ] Backup diário do banco (2h da manhã)
  - [ ] Backup semanal de uploads (domingo 3h)
  - [ ] Limpeza de arquivos temporários (4h da manhã)
- [ ] Backups testados manualmente
- [ ] Sincronização com GCS configurada (opcional)

---

## 📖 Fase 13: Documentação

- [ ] Credenciais documentadas em local seguro
- [ ] IP da VM documentado
- [ ] Domínio documentado
- [ ] Senhas do banco de dados salvas com segurança
- [ ] JWT_SECRET salvo com segurança
- [ ] Credenciais de SMTP salvas
- [ ] Comandos úteis documentados
- [ ] Procedimento de rollback documentado

---

## 🎯 Fase 14: Handover

- [ ] Acesso à VM transferido ao cliente (se aplicável)
- [ ] Acesso ao GCP Console transferido ao cliente
- [ ] Documentação entregue
- [ ] Treinamento realizado
- [ ] Contatos de suporte fornecidos
- [ ] SLA acordado (se aplicável)

---

## ⚠️ Fase 15: Pós-Deploy

- [ ] Monitoramento ativo por 24h
- [ ] Logs verificados após 1h de operação
- [ ] Testes de carga realizados (se aplicável)
- [ ] Performance otimizada
- [ ] Ajustes finos realizados
- [ ] Deploy considerado estável

---

## 🔄 Fase 16: Manutenção Contínua

- [ ] Processo de atualização documentado
- [ ] Calendário de manutenção definido
- [ ] Plano de contingência criado
- [ ] Contato de emergência definido
- [ ] Renovação de certificado SSL monitorada

---

## 📝 Notas Adicionais

```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

## ✍️ Aprovações

| Papel | Nome | Assinatura | Data |
|-------|------|------------|------|
| Desenvolvedor |  |  |  |
| Cliente/Responsável |  |  |  |
| DevOps (se aplicável) |  |  |  |

---

**Deploy realizado por:** ____________________________________

**Data de conclusão:** ____/____/________

**Versão da aplicação:** v____________

**Ambiente:** Produção - GCP Compute Engine

---

**Status Final:** [ ] ✅ Sucesso  [ ] ⚠️ Com Ressalvas  [ ] ❌ Falha
