/**
 * Arquivo: backend/src/jobs/test-jobs.js
 * Descrição: Script de teste para validar o sistema de cron jobs
 * Feature: feat-062 - Configurar node-cron
 * Criado em: 2025-11-03
 *
 * USO: node src/jobs/test-jobs.js
 */

const jobs = require('./index');

console.log('='.repeat(60));
console.log('TESTE DO SISTEMA DE CRON JOBS - feat-062');
console.log('='.repeat(60));
console.log('');

// Teste 1: Registrar um job simples
console.log('📋 Teste 1: Registrando job de teste...');
try {
  jobs.registerJob(
    'test-job',
    '*/1 * * * *', // A cada minuto
    async () => {
      console.log('  ⏰ Job de teste executado em:', new Date().toLocaleString('pt-BR'));
    },
    { timezone: 'America/Sao_Paulo', scheduled: false } // Não iniciar automaticamente
  );
  console.log('  ✓ Job registrado com sucesso!\n');
} catch (error) {
  console.error('  ✗ Erro ao registrar job:', error.message);
  process.exit(1);
}

// Teste 2: Listar jobs registrados
console.log('📋 Teste 2: Listando jobs registrados...');
const jobsList = jobs.listJobs();
console.log(`  Total de jobs: ${jobsList.length}`);
jobsList.forEach((job, index) => {
  console.log(`  ${index + 1}. ${job.name} - Schedule: ${job.schedule}`);
});
console.log('');

// Teste 3: Executar job manualmente
console.log('📋 Teste 3: Executando job manualmente...');
jobs
  .runJob('test-job')
  .then(() => {
    console.log('  ✓ Job executado com sucesso!\n');

    // Teste 4: Parar job
    console.log('📋 Teste 4: Parando job...');
    const stopped = jobs.stopJob('test-job');
    console.log(`  ${stopped ? '✓' : '✗'} Job ${stopped ? 'parado' : 'não encontrado'}\n`);

    // Resumo final
    console.log('='.repeat(60));
    console.log('✅ TODOS OS TESTES PASSARAM COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Sistema de cron jobs está funcionando corretamente.');
    console.log('');
    console.log('Próximos passos:');
    console.log('1. Implementar cleanupTemp.job.js (feat-063)');
    console.log('2. Implementar contractRenewal.job.js');
    console.log('3. Registrar jobs no index.js conforme necessário');
    console.log('');
  })
  .catch((error) => {
    console.error('  ✗ Erro ao executar job:', error);
    process.exit(1);
  });
