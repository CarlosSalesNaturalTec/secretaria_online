/**
 * Script: 14_generate_report.js
 * Descrição: Gerar relatório completo da migração
 * Versão: 3.0
 * Data: 2025-12-19
 */

const fs = require('fs');
const path = require('path');
const { sequelize } = require('../../src/models');

/**
 * Coleta estatísticas completas
 */
async function collectStats() {
  const stats = {};

  // Professores
  const [profMapped] = await sequelize.query(`
    SELECT COUNT(*) AS total FROM migration_professor_mapping WHERE new_teacher_id IS NOT NULL
  `);
  const [profTotal] = await sequelize.query('SELECT COUNT(*) AS total FROM migration_professor_mapping');
  const [teacherUsers] = await sequelize.query(`
    SELECT COUNT(*) AS total FROM users WHERE role = 'teacher'
  `);

  stats.professores = {
    sistema_antigo: profTotal[0].total,
    mapeados: profMapped[0].total,
    ignorados: profTotal[0].total - profMapped[0].total,
    usuarios_criados: teacherUsers[0].total
  };

  // Alunos
  const [studentsMapped] = await sequelize.query('SELECT COUNT(*) AS total FROM migration_matricula_student');
  const [studentsWithGrades] = await sequelize.query(`
    SELECT COUNT(DISTINCT student_id) AS total
    FROM grades g
    JOIN evaluations e ON g.evaluation_id = e.id
    WHERE e.name LIKE '%(histórico)%'
  `);

  stats.alunos = {
    mapeados: studentsMapped[0].total,
    com_notas: studentsWithGrades[0].total
  };

  // Turmas
  const [classes] = await sequelize.query('SELECT COUNT(*) AS total FROM classes');
  const [classesWithStudents] = await sequelize.query(`
    SELECT COUNT(DISTINCT class_id) AS total FROM class_students
  `);

  stats.turmas = {
    criadas: classes[0].total,
    com_alunos: classesWithStudents[0].total
  };

  // Avaliações
  const [evalTotal] = await sequelize.query(`
    SELECT COUNT(*) AS total FROM evaluations WHERE name LIKE '%(histórico)%'
  `);
  const [evalWithRealTeacher] = await sequelize.query(`
    SELECT COUNT(*) AS total
    FROM evaluations e
    JOIN users u ON e.teacher_id = u.id
    WHERE e.name LIKE '%(histórico)%' AND u.role = 'teacher'
  `);
  const [evalWithMigration] = await sequelize.query(`
    SELECT COUNT(*) AS total
    FROM evaluations e
    JOIN users u ON e.teacher_id = u.id
    WHERE e.name LIKE '%(histórico)%' AND u.role = 'admin'
  `);

  stats.avaliacoes = {
    total: evalTotal[0].total,
    com_professor_real: evalWithRealTeacher[0].total,
    com_sistema_migracao: evalWithMigration[0].total
  };

  // Notas
  const [gradesTotal] = await sequelize.query(`
    SELECT COUNT(*) AS total
    FROM grades g
    JOIN evaluations e ON g.evaluation_id = e.id
    WHERE e.name LIKE '%(histórico)%'
  `);
  const [gradesWithValue] = await sequelize.query(`
    SELECT COUNT(*) AS total
    FROM grades g
    JOIN evaluations e ON g.evaluation_id = e.id
    WHERE e.name LIKE '%(histórico)%' AND g.grade IS NOT NULL
  `);
  const [avgGrade] = await sequelize.query(`
    SELECT AVG(g.grade) AS avg
    FROM grades g
    JOIN evaluations e ON g.evaluation_id = e.id
    WHERE e.name LIKE '%(histórico)%' AND g.grade IS NOT NULL
  `);

  stats.notas = {
    total_migradas: gradesTotal[0].total,
    com_valor: gradesWithValue[0].total,
    media_geral: avgGrade[0].avg ? Number(avgGrade[0].avg).toFixed(2) : null
  };

  // Disciplinas
  const [discTotal] = await sequelize.query('SELECT COUNT(*) AS total FROM migration_discipline_mapping');
  const [discMapped] = await sequelize.query(`
    SELECT COUNT(*) AS total FROM migration_discipline_mapping WHERE new_discipline_id IS NOT NULL
  `);

  stats.disciplinas = {
    total: discTotal[0].total,
    mapeadas: discMapped[0].total,
    nao_mapeadas: discTotal[0].total - discMapped[0].total
  };

  return stats;
}

/**
 * Gera relatório em formato JSON
 */
function generateJsonReport(stats) {
  const report = {
    timestamp: new Date().toISOString(),
    versao: '3.0',
    ...stats
  };

  const filePath = path.join(__dirname, 'migration_report_v3.json');
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8');

  return filePath;
}

/**
 * Gera relatório em formato Markdown
 */
function generateMarkdownReport(stats) {
  const md = `# Relatório de Migração v3

**Data:** ${new Date().toLocaleString('pt-BR')}
**Versão:** 3.0

---

## 📊 Resumo Geral

### Professores
- Sistema Antigo: **${stats.professores.sistema_antigo}**
- Mapeados: **${stats.professores.mapeados}**
- Ignorados: **${stats.professores.ignorados}**
- Usuários Criados: **${stats.professores.usuarios_criados}**

### Alunos
- Mapeados: **${stats.alunos.mapeados}**
- Com Notas: **${stats.alunos.com_notas}**

### Turmas
- Criadas: **${stats.turmas.criadas}**
- Com Alunos: **${stats.turmas.com_alunos}**

### Avaliações
- Total: **${stats.avaliacoes.total}**
- Com Professor Real: **${stats.avaliacoes.com_professor_real}** (${(stats.avaliacoes.com_professor_real / stats.avaliacoes.total * 100).toFixed(1)}%)
- Com Sistema Migração: **${stats.avaliacoes.com_sistema_migracao}** (${(stats.avaliacoes.com_sistema_migracao / stats.avaliacoes.total * 100).toFixed(1)}%)

### Notas
- Total Migradas: **${stats.notas.total_migradas}**
- Com Valor: **${stats.notas.com_valor}**
- Média Geral: **${stats.notas.media_geral || 'N/A'}**

### Disciplinas
- Total: **${stats.disciplinas.total}**
- Mapeadas: **${stats.disciplinas.mapeadas}** (${(stats.disciplinas.mapeadas / stats.disciplinas.total * 100).toFixed(1)}%)
- Não Mapeadas: **${stats.disciplinas.nao_mapeadas}**

---

## ✅ Conclusão

${stats.disciplinas.nao_mapeadas === 0 && stats.professores.usuarios_criados === stats.professores.mapeados
  ? '**Migração concluída com sucesso!** Todos os dados foram migrados corretamente.'
  : '**Migração concluída com avisos.** Revisar dados não mapeados antes de produção.'}

---

*Gerado automaticamente pelo script de migração v3*
`;

  const filePath = path.join(__dirname, 'migration_report_v3.md');
  fs.writeFileSync(filePath, md, 'utf-8');

  return filePath;
}

/**
 * Função principal
 */
async function main() {
  console.log('\n========================================');
  console.log('FASE 8: Geração de Relatório Final');
  console.log('========================================\n');

  try {
    console.log('📊 Coletando estatísticas...\n');
    const stats = await collectStats();

    // Exibir resumo
    console.log('═══════════════════════════════════════');
    console.log('         RELATÓRIO DE MIGRAÇÃO v3      ');
    console.log('═══════════════════════════════════════\n');

    console.log('👥 PROFESSORES:');
    console.log(`   Sistema Antigo: ${stats.professores.sistema_antigo}`);
    console.log(`   ✅ Mapeados: ${stats.professores.mapeados}`);
    console.log(`   ❌ Ignorados: ${stats.professores.ignorados}`);
    console.log(`   👤 Usuários Criados: ${stats.professores.usuarios_criados}\n`);

    console.log('🎓 ALUNOS:');
    console.log(`   Mapeados: ${stats.alunos.mapeados}`);
    console.log(`   Com Notas: ${stats.alunos.com_notas}\n`);

    console.log('🏫 TURMAS:');
    console.log(`   Criadas: ${stats.turmas.criadas}`);
    console.log(`   Com Alunos: ${stats.turmas.com_alunos}\n`);

    console.log('📝 AVALIAÇÕES:');
    console.log(`   Total: ${stats.avaliacoes.total}`);
    console.log(`   Professor Real: ${stats.avaliacoes.com_professor_real} (${(stats.avaliacoes.com_professor_real / stats.avaliacoes.total * 100).toFixed(1)}%)`);
    console.log(`   Sistema Migração: ${stats.avaliacoes.com_sistema_migracao} (${(stats.avaliacoes.com_sistema_migracao / stats.avaliacoes.total * 100).toFixed(1)}%)\n`);

    console.log('📊 NOTAS:');
    console.log(`   Total Migradas: ${stats.notas.total_migradas}`);
    console.log(`   Com Valor: ${stats.notas.com_valor}`);
    console.log(`   Média Geral: ${stats.notas.media_geral || 'N/A'}\n`);

    console.log('📚 DISCIPLINAS:');
    console.log(`   Total: ${stats.disciplinas.total}`);
    console.log(`   Mapeadas: ${stats.disciplinas.mapeadas} (${(stats.disciplinas.mapeadas / stats.disciplinas.total * 100).toFixed(1)}%)`);
    console.log(`   Não Mapeadas: ${stats.disciplinas.nao_mapeadas}\n`);

    console.log('═══════════════════════════════════════\n');

    // Gerar arquivos
    console.log('💾 Gerando arquivos de relatório...\n');

    const jsonPath = generateJsonReport(stats);
    console.log(`✅ JSON: ${jsonPath}`);

    const mdPath = generateMarkdownReport(stats);
    console.log(`✅ Markdown: ${mdPath}\n`);

    console.log('✅ Relatório gerado com sucesso!');
    console.log('=========================================\n');

  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = main;
