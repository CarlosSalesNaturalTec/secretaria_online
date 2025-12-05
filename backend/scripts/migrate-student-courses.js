/**
 * Arquivo: backend/database/scripts/migrate-student-courses.js
 * Descrição: Script para migrar cursos dos estudantes da tabela students para enrollments
 * Criado em: 2025-12-05
 *
 * FUNCIONALIDADE:
 * 1. Obter o curso de cada estudante na tabela 'students' (campo 'curso')
 * 2. Buscar o ID do respectivo curso na tabela 'courses' (campo 'name')
 * 3. Se encontrar o curso, lançar na tabela 'enrollments':
 *    - student_id
 *    - course_id
 *    - status = 'active'
 *    - enrollment_date = now()
 * 4. Gerar arquivo JSON com student_id dos alunos cujos cursos não foram encontrados
 *
 * COMO EXECUTAR:
 * node backend/database/scripts/migrate-student-courses.js
 */

'use strict';

const fs = require('fs').promises;
const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Cores para output no console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

/**
 * Configuração do Sequelize
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Desabilitar logs SQL
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

/**
 * Normaliza nome do curso para comparação
 * Remove acentos, caracteres especiais e converte para lowercase
 *
 * @param {string} str - String a ser normalizada
 * @returns {string} String normalizada
 */
function normalizeCourseName(str) {
  if (!str) return '';

  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
    .trim();
}

/**
 * Função principal do script
 */
async function migrateStudentCourses() {
  console.log(`\n${colors.bright}${colors.cyan}============================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  Migração de Cursos de Estudantes${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}============================================${colors.reset}\n`);

  try {
    // Testar conexão
    await sequelize.authenticate();
    console.log(`${colors.green}✓${colors.reset} Conexão com banco de dados estabelecida\n`);

    // Estatísticas
    const stats = {
      totalStudents: 0,
      studentsWithCourse: 0,
      coursesFound: 0,
      coursesNotFound: 0,
      enrollmentsCreated: 0,
      enrollmentsSkipped: 0,
      errors: 0,
    };

    const studentsWithoutCourse = [];

    // 1. Buscar todos os estudantes
    console.log(`${colors.cyan}[1/4]${colors.reset} Buscando estudantes...`);
    const students = await sequelize.query(
      'SELECT id, nome, curso FROM students WHERE deleted_at IS NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    stats.totalStudents = students.length;
    console.log(`${colors.green}✓${colors.reset} ${stats.totalStudents} estudantes encontrados\n`);

    // 2. Buscar todos os cursos
    console.log(`${colors.cyan}[2/4]${colors.reset} Buscando cursos...`);
    const courses = await sequelize.query(
      'SELECT id, name FROM courses WHERE deleted_at IS NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log(`${colors.green}✓${colors.reset} ${courses.length} cursos encontrados\n`);

    // Criar mapa de cursos normalizados para busca rápida
    const courseMap = new Map();
    courses.forEach(course => {
      const normalizedName = normalizeCourseName(course.name);
      courseMap.set(normalizedName, course);
    });

    // 3. Processar cada estudante
    console.log(`${colors.cyan}[3/4]${colors.reset} Processando estudantes...\n`);

    for (const student of students) {
      try {
        // Verificar se estudante tem curso definido
        if (!student.curso || student.curso.trim() === '') {
          console.log(`  ${colors.yellow}⚠${colors.reset} Estudante ${student.id} (${student.nome}) sem curso definido`);
          continue;
        }

        stats.studentsWithCourse++;

        // Buscar curso correspondente
        const normalizedStudentCourse = normalizeCourseName(student.curso);
        const matchedCourse = courseMap.get(normalizedStudentCourse);

        if (!matchedCourse) {
          console.log(`  ${colors.yellow}✗${colors.reset} Curso "${student.curso}" não encontrado para estudante ${student.id} (${student.nome})`);
          stats.coursesNotFound++;
          studentsWithoutCourse.push({
            student_id: student.id,
            student_name: student.nome,
            course_name: student.curso,
          });
          continue;
        }

        stats.coursesFound++;

        // Verificar se já existe matrícula ativa para este estudante
        const existingEnrollments = await sequelize.query(
          `SELECT id FROM enrollments
           WHERE student_id = ? AND deleted_at IS NULL`,
          {
            replacements: [student.id],
            type: Sequelize.QueryTypes.SELECT,
          }
        );

        if (existingEnrollments.length > 0) {
          console.log(`  ${colors.yellow}⚠${colors.reset} Estudante ${student.id} (${student.nome}) já possui matrícula - pulando`);
          stats.enrollmentsSkipped++;
          continue;
        }

        // Criar matrícula
        await sequelize.query(
          `INSERT INTO enrollments (student_id, course_id, status, enrollment_date, created_at, updated_at)
           VALUES (?, ?, 'active', NOW(), NOW(), NOW())`,
          {
            replacements: [student.id, matchedCourse.id],
            type: Sequelize.QueryTypes.INSERT,
          }
        );

        console.log(`  ${colors.green}✓${colors.reset} Matrícula criada: Estudante ${student.id} (${student.nome}) → Curso "${matchedCourse.name}"`);
        stats.enrollmentsCreated++;

      } catch (error) {
        console.error(`  ${colors.red}✗${colors.reset} Erro ao processar estudante ${student.id}: ${error.message}`);
        stats.errors++;
      }
    }

    // 4. Gerar arquivo JSON com estudantes sem curso encontrado
    console.log(`\n${colors.cyan}[4/4]${colors.reset} Gerando arquivo de relatório...`);

    const outputPath = path.join(__dirname, 'students-without-course.json');
    await fs.writeFile(
      outputPath,
      JSON.stringify({
        generated_at: new Date().toISOString(),
        total_students_without_course: studentsWithoutCourse.length,
        students: studentsWithoutCourse,
      }, null, 2)
    );

    console.log(`${colors.green}✓${colors.reset} Arquivo gerado: ${outputPath}\n`);

    // Exibir estatísticas finais
    console.log(`${colors.bright}${colors.cyan}============================================${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}  Resumo da Migração${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}============================================${colors.reset}\n`);
    console.log(`Total de estudantes processados:    ${stats.totalStudents}`);
    console.log(`Estudantes com curso definido:      ${stats.studentsWithCourse}`);
    console.log(`Cursos encontrados:                  ${colors.green}${stats.coursesFound}${colors.reset}`);
    console.log(`Cursos não encontrados:              ${colors.yellow}${stats.coursesNotFound}${colors.reset}`);
    console.log(`Matrículas criadas:                  ${colors.green}${stats.enrollmentsCreated}${colors.reset}`);
    console.log(`Matrículas já existentes (puladas):  ${colors.yellow}${stats.enrollmentsSkipped}${colors.reset}`);
    console.log(`Erros:                               ${colors.red}${stats.errors}${colors.reset}`);
    console.log();

    if (stats.coursesNotFound > 0) {
      console.log(`${colors.yellow}⚠${colors.reset} ${stats.coursesNotFound} estudantes com cursos não encontrados.`);
      console.log(`  Verifique o arquivo: ${outputPath}\n`);
    }

    if (stats.enrollmentsCreated > 0) {
      console.log(`${colors.green}✓${colors.reset} Migração concluída com sucesso!`);
      console.log(`  ${stats.enrollmentsCreated} matrículas foram criadas.\n`);
    }

  } catch (error) {
    console.error(`\n${colors.red}✗ Erro fatal:${colors.reset}`, error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Fechar conexão
    await sequelize.close();
  }
}

// Executar script
migrateStudentCourses()
  .then(() => {
    console.log(`${colors.bright}Processo finalizado.${colors.reset}\n`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`${colors.red}Erro inesperado:${colors.reset}`, error);
    process.exit(1);
  });
