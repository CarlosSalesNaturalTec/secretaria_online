const db = require('../../src/models');

/**
 * Script para corrigir o mapeamento de turmas de cursos de especialização
 * que não foram processados no script 05 porque não tinham número de semestre no nome.
 *
 * Problema: Scripts de migração usavam regex /(.+?)\s+(\d+)/ que não funciona
 * para cursos tipo "Especialização em X" (sem número de semestre).
 *
 * Solução: Criar turmas manualmente para esses cursos e fazer o mapeamento.
 */

async function fixEspecializacaoMigration() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('='.repeat(80));
    console.log('CORREÇÃO: Criando turmas para cursos de especialização sem semestre');
    console.log('='.repeat(80));

    // Mapeamento direto sub_id → course_id
    const especializacoes = [
      {
        sub_id: 41,
        sub_title: 'Especialização em Docência no Ensino Superior',
        course_id: 14,
        course_name: 'Especialização em Docência no Ensino Superior',
      },
      {
        sub_id: 100,
        sub_title: 'Especialização em Psicopedagogia Institucional e Clinica',
        course_id: 17,
        course_name: 'Especialização em Psicopedagogia Institucional e Clinica',
      },
      {
        sub_id: 102,
        sub_title: 'Especialização em Neuropsicopedagogia Institucional e Clinica',
        course_id: 15,
        course_name: 'Especialização em Neuropsicopedagogia Institucional e Clinica',
      },
      {
        sub_id: 113,
        sub_title: 'Especialização em Educação Antirracista',
        course_id: 33,
        course_name: 'Pós Graduação em Educação Antirracista',
      },
      {
        sub_id: 119,
        sub_title: 'Especialização em Educação Especial e Inclusiva',
        course_id: 34,
        course_name: 'Pós Graduação em Educação Especial e Inclusiva',
      }
    ];

    console.log(`\nProcessando ${especializacoes.length} cursos de especialização...`);

    // Para especializações, usamos semestre 1 e ano 2024 como padrão
    const semester = 1;
    const year = 2024;

    for (const esp of especializacoes) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`Processando: ${esp.sub_title} (sub_id=${esp.sub_id})`);
      console.log(`Curso destino: ${esp.course_name} (course_id=${esp.course_id})`);
      console.log('='.repeat(80));

      // Verificar se o curso existe
      const course = await db.Course.findByPk(esp.course_id, { transaction });
      if (!course) {
        console.error(`❌ Curso não encontrado: course_id=${esp.course_id}`);
        console.log('   → Você precisa criar o curso manualmente primeiro.');
        continue;
      }

      // Criar ou encontrar turma
      let classInstance = await db.Class.findOne({
        where: {
          course_id: esp.course_id,
          semester: semester,
          year: year,
          deleted_at: null
        },
        transaction
      });

      if (!classInstance) {
        classInstance = await db.Class.create({
          course_id: esp.course_id,
          semester: semester,
          year: year,
        }, { transaction });
        console.log(`✅ Turma criada: class_id=${classInstance.id} (semestre=${semester}, ano=${year})`);
      } else {
        console.log(`ℹ️ Turma já existe: class_id=${classInstance.id}`);
      }

      // Criar ou atualizar mapeamento sub -> class
      await db.sequelize.query(`
        INSERT INTO migration_sub_class_mapping (sub_id, class_id, course_name, semester, year)
        VALUES (:sub_id, :class_id, :course_name, :semester, :year)
        ON DUPLICATE KEY UPDATE
          class_id = VALUES(class_id),
          course_name = VALUES(course_name),
          semester = VALUES(semester),
          year = VALUES(year)
      `, {
        replacements: {
          sub_id: esp.sub_id,
          class_id: classInstance.id,
          course_name: esp.sub_title,
          semester: semester,
          year: year
        },
        transaction
      });
      console.log(`✅ Mapeamento sub->class criado/atualizado`);

      // Atualizar migration_matricula_student com class_id
      const [updateResult] = await db.sequelize.query(`
        UPDATE migration_matricula_student
        SET class_id = :class_id
        WHERE sub_id = :sub_id AND class_id IS NULL
      `, {
        replacements: {
          class_id: classInstance.id,
          sub_id: esp.sub_id
        },
        transaction
      });

      console.log(`✅ ${updateResult.affectedRows} alunos atualizados com class_id=${classInstance.id}`);

      // Vincular alunos à turma (class_students)
      await db.sequelize.query(`
        INSERT INTO class_students (class_id, student_id, created_at, updated_at)
        SELECT DISTINCT
          :class_id,
          mms.student_id,
          NOW(),
          NOW()
        FROM migration_matricula_student mms
        WHERE mms.sub_id = :sub_id
          AND mms.student_id IS NOT NULL
        ON DUPLICATE KEY UPDATE updated_at = NOW()
      `, {
        replacements: {
          class_id: classInstance.id,
          sub_id: esp.sub_id
        },
        transaction
      });

      console.log(`✅ Alunos vinculados à turma (class_students)`);

      // Listar alunos afetados
      const [students] = await db.sequelize.query(`
        SELECT
          s.id,
          s.nome,
          s.matricula,
          mms.old_matricula
        FROM migration_matricula_student mms
        JOIN students s ON mms.student_id = s.id
        WHERE mms.sub_id = :sub_id
      `, {
        replacements: { sub_id: esp.sub_id },
        transaction
      });

      console.log(`\n📋 Alunos vinculados a esta turma (${students.length}):`);
      students.forEach(s => {
        console.log(`   - ${s.nome} (matrícula: ${s.matricula || s.old_matricula})`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ CORREÇÃO DE TURMAS CONCLUÍDA COM SUCESSO');
    console.log('='.repeat(80));

    await transaction.commit();

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await db.sequelize.close();
  }
}

if (require.main === module) {
  fixEspecializacaoMigration();
}

module.exports = fixEspecializacaoMigration;
