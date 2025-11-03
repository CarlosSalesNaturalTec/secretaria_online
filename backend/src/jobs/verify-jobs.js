/**
 * Arquivo: backend/src/jobs/verify-jobs.js
 * Descrição: Script rápido para verificar jobs registrados
 * Feature: feat-063 - Criar job de limpeza de arquivos temporários
 * Criado em: 2025-11-03
 *
 * USO: node src/jobs/verify-jobs.js
 */

const jobs = require('./index');

console.log('\n=== JOBS REGISTRADOS NO SISTEMA ===\n');

const jobsList = jobs.listJobs();

if (jobsList.length === 0) {
  console.log('❌ Nenhum job registrado\n');
  process.exit(1);
}

console.log(`✓ Total de jobs: ${jobsList.length}\n`);

jobsList.forEach((job, index) => {
  console.log(`${index + 1}. ${job.name}`);
  console.log(`   Schedule: ${job.schedule}`);
  console.log(`   Registrado em: ${job.registeredAt.toLocaleString('pt-BR')}`);
  console.log('');
});

console.log('✅ Sistema de jobs funcionando corretamente!\n');

// Forçar saída do processo
setTimeout(() => process.exit(0), 100);
