# Sistema de Cron Jobs - Secretaria Online

## Visão Geral

Este diretório contém o sistema de tarefas agendadas (cron jobs) da aplicação Secretaria Online, implementado com a biblioteca `node-cron`.

## Arquitetura

O sistema é composto por:

- **`index.js`**: Gerenciador central que registra e controla todos os jobs
- **`*.job.js`**: Arquivos individuais de jobs (ex: `cleanupTemp.job.js`)

## Expressões Cron

As expressões cron seguem o formato: `minuto hora dia mês dia-da-semana`

### Exemplos:

```javascript
// Todo dia à meia-noite
'0 0 * * *'

// Todo dia às 2h da manhã
'0 2 * * *'

// A cada hora
'0 * * * *'

// A cada 30 minutos
'*/30 * * * *'

// Segunda a sexta às 9h
'0 9 * * 1-5'

// Todo domingo às 3h
'0 3 * * 0'

// Primeiro dia de cada mês à meia-noite
'0 0 1 * *'
```

### Formato Detalhado:

```
┌───────────── minuto (0 - 59)
│ ┌───────────── hora (0 - 23)
│ │ ┌───────────── dia do mês (1 - 31)
│ │ │ ┌───────────── mês (1 - 12)
│ │ │ │ ┌───────────── dia da semana (0 - 6) (Domingo = 0)
│ │ │ │ │
* * * * *
```

## Como Criar um Novo Job

### 1. Criar o arquivo do job

Crie um arquivo `nomeDoJob.job.js` com a seguinte estrutura:

```javascript
/**
 * Arquivo: backend/src/jobs/nomeDoJob.job.js
 * Descrição: Descrição do que o job faz
 * Feature: feat-XXX
 */

const logger = require('../utils/logger');

/**
 * Executa a tarefa principal do job
 */
async function execute() {
  try {
    logger.info('[NOME_DO_JOB] Iniciando execução...');

    // Lógica do job aqui

    logger.info('[NOME_DO_JOB] Execução concluída com sucesso');
  } catch (error) {
    logger.error('[NOME_DO_JOB] Erro durante execução:', error);
    throw error;
  }
}

module.exports = {
  execute,
  name: 'nome-do-job',
  description: 'Descrição do job',
  schedule: '0 2 * * *', // Expressão cron
};
```

### 2. Registrar o job no index.js

No arquivo `index.js`, importe e registre seu job:

```javascript
// Importar o job
const nomeDoJobJob = require('./nomeDoJob.job');

// Registrar o job
registerJob(
  nomeDoJobJob.name,
  nomeDoJobJob.schedule,
  nomeDoJobJob.execute,
  { timezone: 'America/Sao_Paulo' }
);
```

## API do Sistema de Jobs

### `registerJob(name, schedule, task, options)`

Registra um novo cron job.

**Parâmetros:**
- `name` (string): Nome identificador único do job
- `schedule` (string): Expressão cron
- `task` (function): Função assíncrona ou síncrona a ser executada
- `options` (object): Opções adicionais
  - `timezone` (string): Timezone (default: 'America/Sao_Paulo')
  - `scheduled` (boolean): Se o job deve iniciar automaticamente (default: true)

**Retorno:** Objeto do cron job criado

### `start()`

Inicia todos os jobs registrados.

```javascript
jobs.start();
```

### `stop()`

Para todos os jobs em execução.

```javascript
jobs.stop();
```

### `stopJob(name)`

Para um job específico.

```javascript
jobs.stopJob('cleanup-temp');
```

### `restartJob(name)`

Reinicia um job específico.

```javascript
jobs.restartJob('cleanup-temp');
```

### `listJobs()`

Lista todos os jobs registrados.

```javascript
const jobsList = jobs.listJobs();
console.log(jobsList);
// [
//   { name: 'cleanup-temp', schedule: '0 2 * * *', registeredAt: Date, isRunning: true }
// ]
```

### `runJob(name)`

Executa um job manualmente (fora do schedule).

```javascript
await jobs.runJob('cleanup-temp');
```

## Jobs Implementados

### Planejados (feat-063+)

- **`cleanupTemp.job.js`** (feat-063): Limpeza de arquivos temporários
  - Schedule: Diariamente às 2h da manhã
  - Remove arquivos em `uploads/temp/` mais antigos que 7 dias

- **`contractRenewal.job.js`**: Renovação automática de contratos
  - Schedule: Verificação diária ou semanal
  - Renova contratos de alunos ao final de cada semestre
  - Renova contratos de professores no início de cada semestre

## Logs

Todos os jobs são automaticamente envolvidos em logging estruturado:

- Log de início de execução
- Log de conclusão com duração
- Log de erros com stack trace
- Timestamps em UTC convertidos para timezone configurado

## Boas Práticas

1. **Tratamento de Erros**: Sempre use try-catch dentro da função execute
2. **Logs**: Use o logger para registrar o progresso do job
3. **Idempotência**: Jobs devem ser seguros para executar múltiplas vezes
4. **Performance**: Evite jobs que bloqueiem por muito tempo
5. **Timezone**: Configure corretamente para evitar execução em horários indesejados
6. **Validações**: Valide dados antes de processar
7. **Cleanup**: Sempre limpe recursos (conexões, arquivos) após uso

## Debugging

Para executar um job manualmente durante desenvolvimento:

```javascript
const jobs = require('./jobs');
await jobs.runJob('nome-do-job');
```

## Monitoramento

Verifique os logs para acompanhar a execução dos jobs:

- **Console**: Durante desenvolvimento
- **Arquivo `logs/combined.log`**: Todos os logs em produção
- **Arquivo `logs/error.log`**: Apenas erros em produção

## Timezone

O timezone padrão é `America/Sao_Paulo` (horário de Brasília). Isso garante que os jobs executem no horário local da instituição.

Para alterar o timezone de um job específico:

```javascript
registerJob(
  'meu-job',
  '0 2 * * *',
  execute,
  { timezone: 'UTC' } // ou outro timezone válido
);
```

## Recursos Adicionais

- [node-cron Documentation](https://github.com/node-cron/node-cron)
- [Crontab Guru](https://crontab.guru/) - Editor visual de expressões cron
- [Winston Documentation](https://github.com/winstonjs/winston) - Sistema de logging
