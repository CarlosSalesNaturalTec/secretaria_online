/**
 * Script: 13_validate_migration.js
 * Descrição: Validar dados migrados e detectar inconsistências
 * Versão: 3.0
 * Data: 2025-12-19
 */

const { sequelize } = require('../../src/models');

/**
 * Validação 1: Total de notas esperadas vs migradas
 */
async function validateGradeCount() {
  const [boletimCount] = await sequelize.query(`
    SELECT COUNT(*) AS total FROM boletim_novo_temp
  `);

  const [gradesCount] = await sequelize.query(`
    SELECT COUNT(*) AS total
    FROM grades g
    JOIN evaluations e ON g.evaluation_id = e.id
    WHERE e.name LIKE '%(histórico)%'
  `);

  const expected = boletimCount[0].total * 3; // 3 notas por registro
  const actual = gradesCount[0].total;
  const diff = expected - actual;
  const percentage = (actual / expected * 100).toFixed(1);

  return {
    expected,
    actual,
    diff,
    percentage,
    status: diff === 0 ? 'OK' : 'WARNING'
  };
}

/**
 * Validação 2: Professores utilizados
 */
async function validateTeachers() {
  const [teachers] = await sequelize.query(`
    SELECT
      u.name AS teacher_name,
      u.role,
      COUNT(DISTINCT e.id) AS num_evaluations
    FROM evaluations e
    JOIN users u ON e.teacher_id = u.id
    WHERE e.name LIKE '%(histórico)%'
    GROUP BY u.id, u.name, u.role
    ORDER BY num_evaluations DESC
  `);

  const migrationUser = teachers.find(t => t.role === 'admin');
  const realTeachers = teachers.filter(t => t.role === 'teacher');

  return {
    teachers,
    migrationUser,
    realTeachers,
    status: 'OK'
  };
}

/**
 * Validação 3: Alunos com notas
 */
async function validateStudents() {
  const [withGrades] = await sequelize.query(`
    SELECT COUNT(DISTINCT student_id) AS total
    FROM grades g
    JOIN evaluations e ON g.evaluation_id = e.id
    WHERE e.name LIKE '%(histórico)%'
  `);

  const [mapped] = await sequelize.query(`
    SELECT COUNT(*) AS total FROM migration_matricula_student
  `);

  const percentage = (withGrades[0].total / mapped[0].total * 100).toFixed(1);

  return {
    mapped: mapped[0].total,
    withGrades: withGrades[0].total,
    percentage,
    status: percentage >= 90 ? 'OK' : 'WARNING'
  };
}

/**
 * Validação 4: Disciplinas não mapeadas
 */
async function validateDisciplines() {
  const [notMapped] = await sequelize.query(`
    SELECT old_name
    FROM migration_discipline_mapping
    WHERE new_discipline_id IS NULL
    ORDER BY old_name
  `);

  const [total] = await sequelize.query(`
    SELECT COUNT(*) AS total FROM migration_discipline_mapping
  `);

  const percentage = ((total[0].total - notMapped.length) / total[0].total * 100).toFixed(1);

  return {
    total: total[0].total,
    notMapped: notMapped.length,
    notMappedList: notMapped.map(d => d.old_name),
    percentage,
    status: notMapped.length === 0 ? 'OK' : 'WARNING'
  };
}

/**
 * Validação 5: Turmas sem professores
 */
async function validateClassTeachers() {
  const [classesWithoutTeacher] = await sequelize.query(`
    SELECT
      c.id AS class_id,
      co.name AS course_name,
      c.semester,
      c.year,
      COUNT(DISTINCT cs.student_id) AS num_students
    FROM classes c
    JOIN courses co ON c.course_id = co.id
    LEFT JOIN class_students cs ON c.id = cs.class_id
    LEFT JOIN class_teachers ct ON c.id = ct.class_id
    WHERE cs.student_id IS NOT NULL
    GROUP BY c.id, co.name, c.semester, c.year
    HAVING COUNT(DISTINCT ct.teacher_id) = 0
  `);

  return {
    count: classesWithoutTeacher.length,
    classes: classesWithoutTeacher,
    status: classesWithoutTeacher.length === 0 ? 'OK' : 'INFO'
  };
}

/**
 * Validação 6: Notas fora do intervalo
 */
async function validateGradeValues() {
  const [invalidGrades] = await sequelize.query(`
    SELECT
      g.id,
      g.grade,
      s.nome AS student_name,
      e.name AS evaluation_name
    FROM grades g
    JOIN evaluations e ON g.evaluation_id = e.id
    JOIN students s ON g.student_id = s.id
    WHERE e.name LIKE '%(histórico)%'
      AND g.grade IS NOT NULL
      AND (g.grade < 0 OR g.grade > 10)
    LIMIT 20
  `);

  return {
    count: invalidGrades.length,
    invalid: invalidGrades,
    status: invalidGrades.length === 0 ? 'OK' : 'ERROR'
  };
}

/**
 * Função principal
 */
async function main() {
  console.log('\n====================================');
  console.log('FASE 7: Validação de Migração');
  console.log('====================================\n');

  const results = {};

  try {
    // 1. Validar contagem de notas
    console.log('1️⃣  Validando contagem de notas...');
    results.grades = await validateGradeCount();
    console.log(`   Esperado: ${results.grades.expected} (${results.grades.expected / 3} × 3 tipos)`);
    console.log(`   Migrado: ${results.grades.actual}`);
    console.log(`   Diferença: ${results.grades.diff}`);
    console.log(`   Taxa: ${results.grades.percentage}%`);
    console.log(`   Status: ${results.grades.status}\n`);

    // 2. Validar professores
    console.log('2️⃣  Validando professores...');
    results.teachers = await validateTeachers();
    console.log(`   Professores reais: ${results.teachers.realTeachers.length}`);
    if (results.teachers.migrationUser) {
      console.log(`   Sistema Migração: ${results.teachers.migrationUser.num_evaluations} avaliações`);
    }
    console.log(`   Status: ${results.teachers.status}\n`);

    // 3. Validar alunos
    console.log('3️⃣  Validando alunos...');
    results.students = await validateStudents();
    console.log(`   Alunos mapeados: ${results.students.mapped}`);
    console.log(`   Alunos com notas: ${results.students.withGrades}`);
    console.log(`   Taxa: ${results.students.percentage}%`);
    console.log(`   Status: ${results.students.status}\n`);

    // 4. Validar disciplinas
    console.log('4️⃣  Validando disciplinas...');
    results.disciplines = await validateDisciplines();
    console.log(`   Total: ${results.disciplines.total}`);
    console.log(`   Não mapeadas: ${results.disciplines.notMapped}`);
    console.log(`   Taxa de sucesso: ${results.disciplines.percentage}%`);
    console.log(`   Status: ${results.disciplines.status}`);
    if (results.disciplines.notMapped > 0) {
      console.log(`\n   ⚠️  Disciplinas não mapeadas:`);
      results.disciplines.notMappedList.slice(0, 10).forEach(d => {
        console.log(`      - ${d}`);
      });
      if (results.disciplines.notMapped > 10) {
        console.log(`      ... e mais ${results.disciplines.notMapped - 10}`);
      }
    }
    console.log();

    // 5. Validar turmas sem professor
    console.log('5️⃣  Validando turmas sem professores...');
    results.classTeachers = await validateClassTeachers();
    console.log(`   Turmas sem professor: ${results.classTeachers.count}`);
    console.log(`   Status: ${results.classTeachers.status}`);
    if (results.classTeachers.count > 0) {
      console.log(`\n   ℹ️  Essas turmas eram do professor TUTOR (não migrado):`);
      results.classTeachers.classes.slice(0, 5).forEach(c => {
        console.log(`      - ${c.course_name} ${c.semester}° (${c.num_students} alunos)`);
      });
      if (results.classTeachers.count > 5) {
        console.log(`      ... e mais ${results.classTeachers.count - 5}`);
      }
    }
    console.log();

    // 6. Validar valores de notas
    console.log('6️⃣  Validando valores de notas...');
    results.gradeValues = await validateGradeValues();
    console.log(`   Notas inválidas (< 0 ou > 10): ${results.gradeValues.count}`);
    console.log(`   Status: ${results.gradeValues.status}`);
    if (results.gradeValues.count > 0) {
      console.log(`\n   ❌ Notas inválidas encontradas:`);
      results.gradeValues.invalid.forEach(g => {
        console.log(`      - ${g.student_name}: ${g.grade} em ${g.evaluation_name}`);
      });
    }
    console.log();

    // 7. Resumo Final
    console.log('═══════════════════════════════════');
    console.log('RESUMO DA VALIDAÇÃO');
    console.log('═══════════════════════════════════\n');

    const hasErrors = Object.values(results).some(r => r.status === 'ERROR');
    const hasWarnings = Object.values(results).some(r => r.status === 'WARNING');

    if (!hasErrors && !hasWarnings) {
      console.log('✅ Todas as validações passaram com sucesso!\n');
    } else if (hasErrors) {
      console.log('❌ Validação FALHOU - Erros críticos detectados!\n');
    } else {
      console.log('⚠️  Validação com AVISOS - Revisar antes de produção\n');
    }

    console.log('====================================\n');

  } catch (error) {
    console.error('❌ Erro durante validação:', error);
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
