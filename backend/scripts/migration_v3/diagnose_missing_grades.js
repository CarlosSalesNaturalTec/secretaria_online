const db = require('../../src/models');

async function diagnoseMissingGrades() {
  try {
    const matriculas = ['20240003', '20240024', '20240133'];

    console.log('='.repeat(80));
    console.log('DIAGNÓSTICO DE NOTAS NÃO IMPORTADAS');
    console.log('='.repeat(80));

    for (const matricula of matriculas) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`MATRÍCULA: ${matricula}`);
      console.log('='.repeat(80));

      // 1. Verificar se existe no boletim_novo_temp
      console.log('\n1️⃣ Verificando boletim_novo_temp...');
      const [boletimRecords] = await db.sequelize.query(`
        SELECT * FROM boletim_novo_temp WHERE matricula = ?
      `, { replacements: [matricula] });

      if (boletimRecords.length === 0) {
        console.log(`❌ PROBLEMA: Matrícula ${matricula} NÃO encontrada no boletim_novo_temp`);
        console.log('   → Esta matrícula não está no arquivo CSV boletim_novo.csv');
        continue;
      }
      console.log(`✅ Encontradas ${boletimRecords.length} linhas no boletim_novo_temp`);
      console.log('   Disciplinas:', [...new Set(boletimRecords.map(r => r.disciplina))].join(', '));

      // 2. Verificar mapeamento de matrícula -> student_id
      console.log('\n2️⃣ Verificando migration_matricula_student...');
      const [studentMapping] = await db.sequelize.query(`
        SELECT * FROM migration_matricula_student WHERE old_matricula = ?
      `, { replacements: [matricula] });

      if (studentMapping.length === 0) {
        console.log(`❌ PROBLEMA: Matrícula ${matricula} NÃO encontrada em migration_matricula_student`);
        console.log('   → O aluno não foi mapeado. Possíveis causas:');

        // Verificar na tabela students
        const [student] = await db.sequelize.query(`
          SELECT id, name, matricula, sub_categoria, deleted_at
          FROM students
          WHERE matricula = ?
        `, { replacements: [matricula] });

        if (student.length === 0) {
          console.log('   → Aluno NÃO existe na tabela students');
        } else {
          console.log('   → Aluno EXISTE na tabela students:', student[0]);
          if (student[0].deleted_at) {
            console.log('   → ATENÇÃO: Aluno está marcado como DELETADO (deleted_at não é NULL)');
          }
          if (!student[0].sub_categoria) {
            console.log('   → ATENÇÃO: Aluno não tem sub_categoria preenchido');
          }
        }
        continue;
      }

      const mapping = studentMapping[0];
      console.log(`✅ Mapeamento encontrado:`, mapping);

      // 3. Verificar se tem class_id
      if (!mapping.class_id) {
        console.log(`⚠️ ALERTA: student_id ${mapping.student_id} NÃO tem class_id associado`);
        console.log('   → O aluno não foi vinculado a nenhuma turma');

        // Verificar se o sub_id tem mapeamento
        if (mapping.sub_id) {
          const [subMapping] = await db.sequelize.query(`
            SELECT * FROM migration_sub_class_mapping WHERE old_sub_id = ?
          `, { replacements: [mapping.sub_id] });

          if (subMapping.length === 0) {
            console.log(`   → Sub ${mapping.sub_id} NÃO tem mapeamento em migration_sub_class_mapping`);
          } else {
            console.log(`   → Sub ${mapping.sub_id} tem mapeamento:`, subMapping[0]);
          }
        } else {
          console.log('   → Aluno não tem sub_id');
        }
        continue;
      }

      console.log(`✅ Aluno está na turma (class_id): ${mapping.class_id}`);

      // 4. Verificar mapeamento sub -> class
      console.log('\n3️⃣ Verificando migration_sub_class_mapping...');
      const [subClassMapping] = await db.sequelize.query(`
        SELECT * FROM migration_sub_class_mapping WHERE class_id = ?
      `, { replacements: [mapping.class_id] });

      if (subClassMapping.length === 0) {
        console.log(`❌ PROBLEMA: class_id ${mapping.class_id} NÃO encontrado em migration_sub_class_mapping`);
        continue;
      }
      console.log(`✅ Mapeamento sub->class encontrado:`, subClassMapping[0]);

      // 5. Verificar mapeamento de disciplinas
      console.log('\n4️⃣ Verificando migration_discipline_mapping...');
      const uniqueDisciplines = [...new Set(boletimRecords.map(r => r.disciplina))];

      for (const disciplina of uniqueDisciplines) {
        const [disciplineMapping] = await db.sequelize.query(`
          SELECT * FROM migration_discipline_mapping WHERE old_name = ?
        `, { replacements: [disciplina] });

        if (disciplineMapping.length === 0) {
          console.log(`❌ PROBLEMA: Disciplina "${disciplina}" NÃO tem mapeamento`);
        } else if (!disciplineMapping[0].new_discipline_id) {
          console.log(`❌ PROBLEMA: Disciplina "${disciplina}" mapeada mas new_discipline_id é NULL`);
        } else {
          console.log(`✅ Disciplina "${disciplina}" → discipline_id ${disciplineMapping[0].new_discipline_id}`);

          // 6. Verificar mapeamento de avaliações
          console.log(`   Verificando avaliações para esta disciplina...`);
          const [evalMapping] = await db.sequelize.query(`
            SELECT * FROM migration_evaluation_mapping
            WHERE class_id = ? AND discipline_id = ?
          `, { replacements: [mapping.class_id, disciplineMapping[0].new_discipline_id] });

          if (evalMapping.length === 0) {
            console.log(`   ❌ PROBLEMA: Nenhuma avaliação criada para class_id ${mapping.class_id} + discipline_id ${disciplineMapping[0].new_discipline_id}`);
          } else {
            console.log(`   ✅ ${evalMapping.length} avaliações encontradas:`,
              evalMapping.map(e => `${e.eval_type} (id=${e.evaluation_id})`).join(', '));

            // Verificar se já tem notas
            const [existingGrades] = await db.sequelize.query(`
              SELECT g.*, e.name as eval_name, e.type as eval_type
              FROM grades g
              JOIN evaluations e ON g.evaluation_id = e.id
              WHERE g.student_id = ? AND e.discipline_id = ?
            `, { replacements: [mapping.student_id, disciplineMapping[0].new_discipline_id] });

            if (existingGrades.length > 0) {
              console.log(`   ℹ️ Aluno JÁ tem ${existingGrades.length} notas para esta disciplina:`);
              existingGrades.forEach(g => {
                console.log(`      - ${g.eval_type}: ${g.grade}`);
              });
            } else {
              console.log(`   ❌ Aluno NÃO tem notas cadastradas para esta disciplina`);
            }
          }
        }
      }

      // 7. Testar a query de migração
      console.log('\n5️⃣ Testando query de migração (TESTE)...');
      const [testQuery] = await db.sequelize.query(`
        SELECT
          bn.matricula,
          bn.disciplina,
          bn.teste,
          bn.prova,
          bn.final,
          mms.student_id,
          mms.class_id,
          mscm.old_sub_id,
          mdm.old_name,
          mdm.new_discipline_id,
          mem.evaluation_id,
          mem.eval_type
        FROM boletim_novo_temp bn
        JOIN migration_matricula_student mms ON bn.matricula = mms.old_matricula
        JOIN migration_sub_class_mapping mscm ON mms.class_id = mscm.class_id
        JOIN migration_discipline_mapping mdm ON bn.disciplina = mdm.old_name
        JOIN migration_evaluation_mapping mem
          ON mem.class_id = mscm.class_id
          AND mem.discipline_id = mdm.new_discipline_id
          AND mem.eval_type = 'teste'
        WHERE bn.matricula = ?
          AND mdm.new_discipline_id IS NOT NULL
          AND mscm.class_id IS NOT NULL
          AND mms.student_id IS NOT NULL
          AND bn.teste IS NOT NULL
      `, { replacements: [matricula] });

      console.log(`Query retornou ${testQuery.length} registros que seriam inseridos para TESTE`);
      if (testQuery.length === 0) {
        console.log('❌ A query de migração não retorna resultados para esta matrícula');
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('DIAGNÓSTICO CONCLUÍDO');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  } finally {
    await db.sequelize.close();
  }
}

if (require.main === module) {
  diagnoseMissingGrades();
}

module.exports = diagnoseMissingGrades;
