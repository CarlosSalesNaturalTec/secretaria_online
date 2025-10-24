# Requirements - Secretaria Online

## 1. DESCRIÇÃO GERAL

### Propósito da Aplicação
A **Secretaria Online** é uma aplicação web destinada à automação dos processos administrativos e acadêmicos de instituições de ensino. O sistema tem como objetivo principal centralizar e digitalizar o gerenciamento de alunos, professores, cursos, disciplinas, matrículas, turmas, contratos e documentos acadêmicos.

### Problema que Resolve
Instituições de ensino tradicionalmente lidam com processos manuais e burocráticos que envolvem papelada física, assinaturas presenciais, controle de documentos em papel e dificuldade de rastreamento de solicitações. Isso gera lentidão, retrabalho, perda de documentos e dificuldade de acesso às informações por parte de alunos e professores.

### Valor Entregue
O sistema digitaliza e automatiza o fluxo completo de gestão acadêmica, permitindo que:
- **Administradores** gerenciem de forma centralizada todos os cadastros, aprovações e validações
- **Alunos** acessem suas informações, documentos, notas e façam solicitações online de forma autônoma
- **Professores** gerenciem turmas, alunos e lançamento de notas de maneira simplificada

Isso resulta em redução de custos operacionais, maior agilidade nos processos, melhor experiência do usuário e rastreabilidade completa das operações.

---

## 2. FUNCIONALIDADES PRINCIPAIS

### 2.1 Módulo Administrativo

#### 2.1.1 Gestão de Usuários Administrativos
**Descrição:** Permitir que usuários administrativos cadastrem e gerenciem outros usuários administrativos do sistema.

**Critérios de Aceitação:**
- Sistema deve possuir um seeder que cria o primeiro usuário administrativo no banco de dados
- Usuários administrativos podem criar, editar e desativar outros usuários administrativos
- Usuários administrativos têm acesso irrestrito a todas as funcionalidades do sistema
- Campos obrigatórios: nome, email, login, senha

**Prioridade:** Alta

---

#### 2.1.2 Cadastro de Professores
**Descrição:** Permitir o cadastro completo de professores com seus dados pessoais e credenciais de acesso.

**Critérios de Aceitação:**
- Campos obrigatórios: nome, RG, CPF, nome da mãe, nome do pai, endereço, título, reservista, login e senha provisória
- Sistema deve validar CPF
- Senha provisória é gerada pelo sistema e deve ser alterada no primeiro acesso
- Dados podem ser editados posteriormente

**Prioridade:** Alta

---

#### 2.1.3 Cadastro de Alunos
**Descrição:** Permitir o cadastro completo de alunos com seus dados pessoais e credenciais de acesso.

**Critérios de Aceitação:**
- Campos obrigatórios: nome, RG, CPF, nome da mãe, nome do pai, endereço, título, reservista, login e senha provisória
- Sistema deve validar CPF
- Senha provisória é gerada pelo sistema e pode ser regenerada por usuários administrativos
- Senha provisória regenerada deve ser enviada para o email do aluno
- Dados podem ser editados posteriormente

**Prioridade:** Alta

---

#### 2.1.4 Cadastro de Disciplinas
**Descrição:** Permitir o cadastro e gerenciamento de disciplinas oferecidas pela instituição.

**Critérios de Aceitação:**
- Campos obrigatórios: nome da disciplina, código, carga horária
- Disciplinas podem ser editadas ou desativadas
- Disciplinas podem ser associadas a múltiplos cursos

**Prioridade:** Alta

---

#### 2.1.5 Cadastro de Cursos
**Descrição:** Permitir o cadastro de cursos e suas respectivas disciplinas.

**Critérios de Aceitação:**
- Campos obrigatórios: nome do curso, duração em semestres, descrição
- Cada curso deve ter sua quantidade específica de semestres
- Deve ser possível associar disciplinas ao curso
- Disciplinas podem ser ordenadas por semestre

**Prioridade:** Alta

---

#### 2.1.6 Cadastro de Matrículas
**Descrição:** Permitir a matrícula de alunos em cursos.

**Critérios de Aceitação:**
- Campos obrigatórios: aluno, curso, data da matrícula
- Um aluno pode estar matriculado em apenas um curso por vez
- Matrícula deve gerar automaticamente um contrato para aceite do aluno
- Status da matrícula: ativa, aguardando confirmação, cancelada
- Matrícula fica com status "aguardando confirmação" até aprovação dos documentos obrigatórios

**Prioridade:** Alta

---

#### 2.1.7 Cadastro de Turmas
**Descrição:** Permitir a criação e gerenciamento de turmas vinculadas a cursos, professores e alunos.

**Critérios de Aceitação:**
- Campos obrigatórios: curso, semestre/período
- Deve ser possível vincular múltiplos alunos à turma
- Deve ser possível vincular múltiplos professores à turma, cada um lecionando uma disciplina diferente
- Deve ser possível visualizar a lista de alunos da turma
- Deve ser possível visualizar a lista de professores da turma
- Um professor pode lecionar em múltiplas turmas
- Não há limite de alunos por turma

**Prioridade:** Alta

---

#### 2.1.8 Gestão de Contratos
**Descrição:** Permitir a criação, edição e gerenciamento de templates de contratos.

**Critérios de Aceitação:**
- Usuários administrativos podem criar e editar templates de contratos
- Templates devem suportar campos dinâmicos (nome do aluno, curso, semestre, data, etc.)
- Contratos são gerados automaticamente em PDF quando aluno/professor acessa pela primeira vez
- Contratos de alunos são renovados automaticamente ao final de cada semestre até completar a duração do curso
- Contratos de professores são renovados a cada semestre

**Prioridade:** Alta

---

#### 2.1.9 Gestão de Documentos Obrigatórios
**Descrição:** Permitir o cadastro e gerenciamento da lista de documentos obrigatórios que alunos e professores devem enviar.

**Critérios de Aceitação:**
- Usuários administrativos podem criar, editar e remover tipos de documentos obrigatórios
- Documentos podem ser específicos para alunos ou professores
- Campos obrigatórios: nome do documento, descrição, tipo de usuário

**Prioridade:** Alta

---

#### 2.1.10 Validação de Documentos
**Descrição:** Permitir que usuários administrativos visualizem e aprovem/reprovem documentos enviados por alunos e professores.

**Critérios de Aceitação:**
- Listar todos os documentos pendentes de aprovação
- Visualizar o documento anexado
- Aprovar ou reprovar documento com possibilidade de adicionar observações
- Ao aprovar todos os documentos obrigatórios de um aluno, a matrícula passa de "aguardando confirmação" para "ativa"
- Sistema deve notificar visualmente quando há documentos pendentes

**Prioridade:** Alta

---

#### 2.1.11 Cadastro de Modelos de Solicitações
**Descrição:** Permitir que usuários administrativos cadastrem e gerenciem modelos de solicitações com seus respectivos prazos.

**Critérios de Aceitação:**
- Campos obrigatórios: nome da solicitação, descrição, prazo de resposta (em dias úteis)
- Modelos podem ser editados ou desativados
- Prazo de resposta é usado como referência para processar solicitações
- Tipos de solicitação: atestado, histórico escolar, certificado, atividades complementares, transferência, cancelamento de matrícula

**Prioridade:** Média

---

#### 2.1.12 Gestão de Solicitações de Alunos
**Descrição:** Permitir que usuários administrativos visualizem, processem e aprovem/reprovem solicitações feitas por alunos.

**Critérios de Aceitação:**
- Listar todas as solicitações com seus status (pendente, aprovada, reprovada)
- Visualizar detalhes da solicitação
- Aprovar ou reprovar solicitação

**Prioridade:** Alta

---

#### 2.1.13 Gestão de Transferências
**Descrição:** Permitir que usuários administrativos gerenciem transferências de alunos entre turmas.

**Critérios de Aceitação:**
- Selecionar aluno e nova turma de destino
- Validar se a turma de destino é do mesmo curso
- Registrar histórico de transferências
- Atualizar automaticamente a vinculação do aluno

**Prioridade:** Média

---

### 2.2 Módulo Aluno

#### 2.2.1 Primeiro Acesso e Aceite de Contrato
**Descrição:** No primeiro acesso, o aluno deve visualizar e aceitar o contrato de matrícula.

**Critérios de Aceitação:**
- Sistema detecta automaticamente o primeiro acesso do aluno
- Exibe contrato em PDF gerado automaticamente com dados do aluno, curso e semestre
- Aluno só pode prosseguir após aceitar o contrato
- Sistema registra data e hora do aceite
- Contrato é renovado automaticamente a cada nova matrícula/semestre

**Prioridade:** Alta

---

#### 2.2.2 Upload de Documentos Obrigatórios
**Descrição:** Permitir que o aluno envie os documentos obrigatórios definidos pela instituição.

**Critérios de Aceitação:**
- Exibir lista de documentos obrigatórios ainda não enviados
- Permitir upload de documentos em formato PDF ou imagem (JPG, PNG)
- Exibir status de cada documento (pendente envio, aguardando aprovação, aprovado, reprovado)
- Permitir reenvio de documentos reprovados
- Matrícula permanece em "aguardando confirmação" até aprovação de todos os documentos

**Prioridade:** Alta

---

#### 2.2.3 Consulta de Notas
**Descrição:** Permitir que o aluno visualize suas notas e avaliações.

**Critérios de Aceitação:**
- Exibir lista de disciplinas do semestre atual
- Exibir todas as avaliações de cada disciplina com suas respectivas notas
- Exibir média final da disciplina (informada pelo professor)
- Exibir tipo de avaliação (0-10 ou conceito)

**Prioridade:** Alta

---

#### 2.2.4 Solicitações
**Descrição:** Permitir que o aluno faça solicitações de documentos e serviços acadêmicos.

**Critérios de Aceitação:**
- Tipos de solicitação disponíveis:
  - Pedido de atestado
  - Histórico escolar
  - Certificado
  - Atividades complementares
  - Transferência
  - Cancelamento de matrícula
- Exibir formulário específico para cada tipo de solicitação
- Registrar data da solicitação
- Exibir prazo estimado de resposta
- Permitir acompanhamento do status (pendente, aprovada, reprovada)
- Exibir histórico de solicitações

**Prioridade:** Alta

---

### 2.3 Módulo Professor

#### 2.3.1 Primeiro Acesso e Aceite de Contrato
**Descrição:** No primeiro acesso e a cada semestre, o professor deve visualizar e aceitar o contrato.

**Critérios de Aceitação:**
- Sistema detecta automaticamente o primeiro acesso ou início de novo semestre
- Exibe contrato em PDF gerado automaticamente com dados do professor
- Professor só pode prosseguir após aceitar o contrato
- Sistema registra data e hora do aceite
- Contrato é renovado automaticamente a cada semestre

**Prioridade:** Alta

---

#### 2.3.2 Upload de Documentos Obrigatórios
**Descrição:** Permitir que o professor envie os documentos obrigatórios definidos pela instituição.

**Critérios de Aceitação:**
- Exibir lista de documentos obrigatórios ainda não enviados
- Permitir upload de documentos em formato PDF ou imagem (JPG, PNG)
- Exibir status de cada documento (pendente envio, aguardando aprovação, aprovado, reprovado)
- Permitir reenvio de documentos reprovados

**Prioridade:** Alta

---

#### 2.3.3 Visualização de Turmas
**Descrição:** Permitir que o professor visualize as turmas em que está cadastrado.

**Critérios de Aceitação:**
- Exibir lista de todas as turmas do professor
- Exibir informações da turma: curso, disciplina, semestre, quantidade de alunos
- Permitir acesso aos detalhes de cada turma

**Prioridade:** Alta

---

#### 2.3.4 Visualização de Alunos das Turmas
**Descrição:** Permitir que o professor visualize a lista de alunos de cada turma.

**Critérios de Aceitação:**
- Exibir lista completa de alunos da turma selecionada
- Exibir informações básicas do aluno: nome, matrícula, status
- Permitir busca e filtro de alunos

**Prioridade:** Alta

---

#### 2.3.5 Cadastro de Avaliações
**Descrição:** Permitir que o professor cadastre avaliações para suas turmas.

**Critérios de Aceitação:**
- Campos obrigatórios: nome da avaliação, data, turma, tipo de avaliação
- Tipos de avaliação: Nota (0-10) ou Conceito (Satisfatório/Não Satisfatório)
- Avaliação é vinculada automaticamente a todos os alunos da turma
- Professor pode editar avaliações cadastradas

**Prioridade:** Alta

---

#### 2.3.6 Lançamento de Notas
**Descrição:** Permitir que o professor lance as notas das avaliações para cada aluno.

**Critérios de Aceitação:**
- Exibir lista de alunos da turma
- Permitir lançamento de nota individual ou em lote
- Validar formato da nota conforme tipo de avaliação (0-10 ou conceito)
- Notas podem ser editadas sem restrição de período
- Sistema registra data e hora do lançamento/edição
- Professor deve informar a média final da disciplina para cada aluno

**Prioridade:** Alta

---

## 3. USUÁRIOS/PERSONAS

### 3.1 Usuário Administrativo

**Descrição do Perfil:**
Funcionário da secretaria responsável pela gestão administrativa e acadêmica da instituição. Possui conhecimento dos processos internos e é o ponto central de controle do sistema.

**Necessidades Principais:**
- Controle total sobre cadastros e configurações do sistema
- Validação e aprovação de documentos e solicitações
- Gestão eficiente de matrículas, turmas e usuários
- Rastreabilidade e histórico de operações

**Ações no Sistema:**
- Cadastrar e gerenciar usuários administrativos, professores e alunos
- Configurar cursos, disciplinas e turmas
- Gerenciar templates de contratos e documentos obrigatórios
- Validar documentos enviados por alunos e professores
- Processar e aprovar solicitações de alunos
- Gerenciar transferências e cancelamentos de matrícula
- Gerar e regenerar senhas provisórias

---

### 3.2 Aluno

**Descrição do Perfil:**
Estudante matriculado em um curso da instituição. Busca autonomia para acessar informações acadêmicas, fazer solicitações e acompanhar seu desempenho.

**Necessidades Principais:**
- Acesso fácil às suas notas e informações acadêmicas
- Fazer solicitações online sem precisar ir presencialmente à secretaria
- Enviar documentos obrigatórios de forma digital
- Acompanhar status de solicitações e documentos

**Ações no Sistema:**
- Aceitar contrato de matrícula
- Enviar documentos obrigatórios
- Consultar notas e média final
- Fazer solicitações (atestados, históricos, certificados, transferência, cancelamento)
- Acompanhar status de solicitações

---

### 3.3 Professor

**Descrição do Perfil:**
Docente responsável por lecionar disciplinas e avaliar alunos. Busca praticidade para gerenciar suas turmas e lançar notas.

**Necessidades Principais:**
- Visualizar de forma organizada suas turmas e alunos
- Lançar notas de forma ágil e sem restrições de horário
- Enviar documentos obrigatórios digitalmente
- Aceitar contratos semestrais online

**Ações no Sistema:**
- Aceitar contrato semestral
- Enviar documentos obrigatórios
- Visualizar turmas e alunos
- Cadastrar avaliações
- Lançar notas (individuais ou em lote)
- Informar média final dos alunos

---

## 4. RESTRIÇÕES E REQUISITOS TÉCNICOS

### 4.1 Performance

| Requisito | Especificação |
|-----------|---------------|
| Tempo de resposta | < 3 segundos para operações comuns |
| Carregamento de páginas | < 2 segundos |
| Upload de documentos | Suporte a arquivos de até 10MB |
| Concorrência | Suportar até 50 usuários simultâneos |

---

### 4.2 Segurança e Privacidade

| Requisito | Especificação |
|-----------|---------------|
| Autenticação | Login e senha com hash seguro (bcrypt ou similar) |
| Senhas | Senha provisória deve ser alterada no primeiro acesso |
| Recuperação de senha | Apenas via usuário administrativo (gera nova senha provisória) |
| Controle de acesso | Baseado em perfis (admin, professor, aluno) |
| Dados sensíveis | CPF e RG devem ser armazenados de forma segura |
| Logs | Registrar operações críticas (aceite de contratos, aprovações, mudanças de status) |
| LGPD | Dados pessoais devem ter retenção de 5 anos e possibilidade de exclusão |

---

### 4.3 Compatibilidade

| Categoria | Requisito |
|-----------|-----------|
| Navegadores | Chrome (últimas 2 versões), Firefox (últimas 2 versões), Edge (últimas 2 versões) |
| Dispositivos | Desktop , tablets e smartphones  |
| Resolução mínima | 1024x768 |

---

### 4.4 Infraestrutura

| Componente | Especificação |
|------------|---------------|
| Servidor de produção | Hostgator |
| Banco de dados | MySQL |
| Ambiente de desenvolvimento | Windows |
| Armazenamento de arquivos | Sistema de arquivos local ou storage do servidor |

---

### 4.5 Volumes Estimados

| Métrica | Valor Inicial | Crescimento Anual Estimado |
|---------|---------------|----------------------------|
| Alunos ativos | ~200 | +50 |
| Professores ativos | ~10 | +2 |
| Cursos | ~5 | +1 |
| Turmas simultâneas | ~10 | +3 |
| Documentos armazenados | ~400 (alunos + professores) | +100 |
| Retenção de dados históricos | 5 anos | - |

---

### 4.6 Backup e Recuperação

| Requisito | Especificação |
|-----------|---------------|
| Backup do banco de dados | Diário |
| Backup de documentos | Semanal |
| Recuperação | Dados devem poder ser restaurados em até 24h |

---

## 5. FORA DO ESCOPO

As seguintes funcionalidades **NÃO** serão desenvolvidas nesta versão do sistema:

### 5.1 Relatórios e Analytics
- Geração de relatórios gerenciais
- Dashboards com indicadores e métricas
- Exportação de dados em planilhas (Excel, CSV)
- Estatísticas de desempenho acadêmico

### 5.2 Integrações Externas
- Integração com sistemas do MEC
- Integração com sistemas de pagamento
- Integração com plataformas de e-mail marketing
- APIs externas para terceiros

### 5.3 Comunicação
- Sistema de mensagens internas entre usuários
- Chat ou fórum
- Notificações por email ou SMS
- Murais de avisos

### 5.4 Gestão Acadêmica Avançada
- Calendário acadêmico
- Controle de presença/frequência
- Plano de ensino
- Biblioteca virtual ou controle de acervo
- Agendamento de provas ou salas

### 5.5 Gestão Financeira
- Controle de mensalidades
- Gestão de bolsas e descontos
- Emissão de boletos
- Controle de inadimplência
- Relatórios financeiros

### 5.6 Portal Público
- Website institucional
- Área de matrícula online para novos alunos
- Processo seletivo/vestibular online

### 5.7 Mobile
- Aplicativo mobile nativo (iOS/Android)
- PWA (Progressive Web App)
- Notificações push

### 5.8 Outras Funcionalidades
- Autenticação de dois fatores (2FA)
- Suporte multi-idioma
- Customização de interface por usuário
- Modo escuro/claro

---

## 6. OBSERVAÇÕES TÉCNICAS

### 6.1 Seed Inicial
O sistema deve incluir um seeder que cria o primeiro usuário administrativo com as seguintes credenciais padrão:
- Login: admin
- Senha: admin123 (deve ser alterada no primeiro acesso)

### 6.2 Renovação de Contratos
A lógica de renovação automática de contratos deve considerar:
- **Alunos:** Renovação ao final de cada semestre até completar a quantidade de semestres definida no curso
- **Professores:** Renovação a cada início de semestre

### 6.3 Status de Matrícula
Os possíveis status de uma matrícula são:
- **Aguardando Confirmação:** Matrícula criada, mas documentos obrigatórios ainda não foram aprovados
- **Ativa:** Todos os documentos aprovados e aluno pode utilizar o sistema normalmente
- **Cancelada:** Matrícula cancelada por solicitação aprovada

### 6.4 Validações de CPF
O sistema deve validar o formato de CPF (11 dígitos, com validação do dígito verificador) ao cadastrar alunos e professores.

### 6.5 Formatos de Arquivo Aceitos
- **Documentos:** PDF, JPG, PNG
- **Tamanho máximo:** 10MB por arquivo

---

**Documento gerado em:** 2025-10-23
**Versão:** 1.0
**Status:** Aprovado
