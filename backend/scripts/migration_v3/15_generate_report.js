const fs = require('fs');
const path = require('path');
const db = require('../../src/models');

async function generateReport() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('Generating Migration Report...');
    
    const countQuery = async (sql) => {
        const [res] = await db.sequelize.query(sql, { transaction });
        return res[0].c || res[0].count || 0;
    };

    const report = {
      timestamp: new Date().toISOString(),
      professores: {
        total_mapeados: await countQuery('SELECT COUNT(*) as c FROM migration_professor_mapping'),
        usuarios_criados: await countQuery('SELECT COUNT(*) as c FROM migration_professor_mapping WHERE new_user_id IS NOT NULL'),
      },
      alunos: {
        mapeados: await countQuery('SELECT COUNT(*) as c FROM migration_matricula_student'),
        com_turma: await countQuery('SELECT COUNT(*) as c FROM migration_matricula_student WHERE class_id IS NOT NULL'),
      },
      turmas: {
        criadas_ou_mapeadas: await countQuery('SELECT COUNT(*) as c FROM migration_sub_class_mapping'),
      },
      avaliacoes: {
        total_historicas: await countQuery('SELECT COUNT(*) as c FROM evaluations WHERE name LIKE "%(histórico)%"'),
        por_professor_real: await countQuery(`
          SELECT COUNT(*) as c FROM evaluations e
          JOIN users u ON e.teacher_id = u.id
          WHERE e.name LIKE '%histórico%' AND u.role = 'teacher'
        `),
        por_sistema_migracao: await countQuery(`
          SELECT COUNT(*) as c FROM evaluations e
          JOIN users u ON e.teacher_id = u.id
          WHERE e.name LIKE '%histórico%' AND u.name = 'Sistema Migração'
        `),
      },
      notas: {
        total_migradas: await countQuery(`
            SELECT COUNT(*) as c FROM grades 
            WHERE evaluation_id IN (SELECT id FROM evaluations WHERE name LIKE '%(histórico)%')
        `),
      },
      disciplinas: {
        total_nomes_antigos: await countQuery('SELECT COUNT(*) as c FROM migration_discipline_mapping'),
        mapeadas: await countQuery('SELECT COUNT(*) as c FROM migration_discipline_mapping WHERE new_discipline_id IS NOT NULL'),
        nao_mapeadas: await countQuery('SELECT COUNT(*) as c FROM migration_discipline_mapping WHERE new_discipline_id IS NULL'),
      },
    };

    const outputPath = path.join(__dirname, 'migration_report_v3.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`✅ Report saved to ${outputPath}`);
    console.log(report);

    await transaction.commit();

  } catch (error) {
    await transaction.rollback();
    console.error('Error:', error);
  } finally {
    await db.sequelize.close();
  }
}

if (require.main === module) {
  generateReport();
}
