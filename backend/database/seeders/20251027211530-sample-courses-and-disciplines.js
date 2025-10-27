/**
 * Arquivo: backend/database/seeders/20251027211530-sample-courses-and-disciplines.js
 * Descrição: Seeder para criar cursos e disciplinas de exemplo para testes
 * Feature: feat-016 - Criar seeders de dados iniciais
 * Criado em: 2025-10-27
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Cria cursos e disciplinas de exemplo para testes do sistema
     *
     * Estrutura:
     * 1. Criar cursos
     * 2. Criar disciplinas
     * 3. Associar disciplinas aos cursos (tabela course_disciplines)
     */

    // Verificar se já existem cursos
    const [existingCourses] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM courses;`
    );

    if (existingCourses[0].count > 0) {
      console.log('⚠️  Cursos já existem. Seeder ignorado.');
      return;
    }

    // ============================================
    // 1. CRIAR CURSOS
    // ============================================
    const courses = [
      {
        name: 'Análise e Desenvolvimento de Sistemas',
        description: 'Curso tecnológico focado no desenvolvimento de software, análise de sistemas e gestão de projetos de TI',
        duration_semesters: 6,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Gestão de Recursos Humanos',
        description: 'Curso voltado para a formação de profissionais capacitados para gerenciar pessoas e processos organizacionais',
        duration_semesters: 4,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Administração',
        description: 'Curso de bacharelado em Administração com foco em gestão empresarial, finanças e estratégia',
        duration_semesters: 8,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    ];

    await queryInterface.bulkInsert('courses', courses, {});
    console.log(`✅ ${courses.length} cursos criados.`);

    // Buscar IDs dos cursos inseridos
    const [insertedCourses] = await queryInterface.sequelize.query(
      `SELECT id, name FROM courses ORDER BY id ASC;`
    );

    const adsId = insertedCourses.find(c => c.name === 'Análise e Desenvolvimento de Sistemas').id;
    const rhId = insertedCourses.find(c => c.name === 'Gestão de Recursos Humanos').id;
    const admId = insertedCourses.find(c => c.name === 'Administração').id;

    // ============================================
    // 2. CRIAR DISCIPLINAS
    // ============================================
    const disciplines = [
      // Disciplinas comuns a todos os cursos
      { name: 'Português Instrumental', code: 'PORT001', workload_hours: 60, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Matemática Básica', code: 'MAT001', workload_hours: 60, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Metodologia Científica', code: 'MET001', workload_hours: 40, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Ética e Cidadania', code: 'ETI001', workload_hours: 40, created_at: new Date(), updated_at: new Date(), deleted_at: null },

      // Disciplinas de Análise e Desenvolvimento de Sistemas
      { name: 'Lógica de Programação', code: 'ADS001', workload_hours: 80, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Algoritmos e Estruturas de Dados', code: 'ADS002', workload_hours: 80, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Programação Orientada a Objetos', code: 'ADS003', workload_hours: 80, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Banco de Dados', code: 'ADS004', workload_hours: 80, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Engenharia de Software', code: 'ADS005', workload_hours: 60, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Desenvolvimento Web', code: 'ADS006', workload_hours: 80, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Desenvolvimento Mobile', code: 'ADS007', workload_hours: 80, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Testes de Software', code: 'ADS008', workload_hours: 60, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Gerenciamento de Projetos de TI', code: 'ADS009', workload_hours: 60, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Segurança da Informação', code: 'ADS010', workload_hours: 60, created_at: new Date(), updated_at: new Date(), deleted_at: null },

      // Disciplinas de Gestão de Recursos Humanos
      { name: 'Introdução à Gestão de Pessoas', code: 'RH001', workload_hours: 60, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Recrutamento e Seleção', code: 'RH002', workload_hours: 60, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Treinamento e Desenvolvimento', code: 'RH003', workload_hours: 60, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Gestão de Desempenho', code: 'RH004', workload_hours: 60, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Legislação Trabalhista', code: 'RH005', workload_hours: 60, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Remuneração e Benefícios', code: 'RH006', workload_hours: 60, created_at: new Date(), updated_at: new Date(), deleted_at: null },

      // Disciplinas de Administração
      { name: 'Teoria Geral da Administração', code: 'ADM001', workload_hours: 80, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Contabilidade Geral', code: 'ADM002', workload_hours: 80, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Matemática Financeira', code: 'ADM003', workload_hours: 60, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Marketing', code: 'ADM004', workload_hours: 60, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Gestão Financeira', code: 'ADM005', workload_hours: 80, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Planejamento Estratégico', code: 'ADM006', workload_hours: 60, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Gestão de Operações', code: 'ADM007', workload_hours: 60, created_at: new Date(), updated_at: new Date(), deleted_at: null },
      { name: 'Empreendedorismo', code: 'ADM008', workload_hours: 60, created_at: new Date(), updated_at: new Date(), deleted_at: null },
    ];

    await queryInterface.bulkInsert('disciplines', disciplines, {});
    console.log(`✅ ${disciplines.length} disciplinas criadas.`);

    // Buscar IDs das disciplinas inseridas
    const [insertedDisciplines] = await queryInterface.sequelize.query(
      `SELECT id, code FROM disciplines ORDER BY id ASC;`
    );

    // Função auxiliar para buscar ID da disciplina pelo código
    const getDisciplineId = (code) => insertedDisciplines.find(d => d.code === code).id;

    // ============================================
    // 3. ASSOCIAR DISCIPLINAS AOS CURSOS
    // ============================================
    const courseDisciplines = [
      // Análise e Desenvolvimento de Sistemas (6 semestres)
      { course_id: adsId, discipline_id: getDisciplineId('PORT001'), semester: 1, created_at: new Date(), updated_at: new Date() },
      { course_id: adsId, discipline_id: getDisciplineId('MAT001'), semester: 1, created_at: new Date(), updated_at: new Date() },
      { course_id: adsId, discipline_id: getDisciplineId('ADS001'), semester: 1, created_at: new Date(), updated_at: new Date() },
      { course_id: adsId, discipline_id: getDisciplineId('ADS002'), semester: 2, created_at: new Date(), updated_at: new Date() },
      { course_id: adsId, discipline_id: getDisciplineId('ADS003'), semester: 2, created_at: new Date(), updated_at: new Date() },
      { course_id: adsId, discipline_id: getDisciplineId('ADS004'), semester: 3, created_at: new Date(), updated_at: new Date() },
      { course_id: adsId, discipline_id: getDisciplineId('ADS005'), semester: 3, created_at: new Date(), updated_at: new Date() },
      { course_id: adsId, discipline_id: getDisciplineId('MET001'), semester: 3, created_at: new Date(), updated_at: new Date() },
      { course_id: adsId, discipline_id: getDisciplineId('ADS006'), semester: 4, created_at: new Date(), updated_at: new Date() },
      { course_id: adsId, discipline_id: getDisciplineId('ADS007'), semester: 4, created_at: new Date(), updated_at: new Date() },
      { course_id: adsId, discipline_id: getDisciplineId('ADS008'), semester: 5, created_at: new Date(), updated_at: new Date() },
      { course_id: adsId, discipline_id: getDisciplineId('ADS009'), semester: 5, created_at: new Date(), updated_at: new Date() },
      { course_id: adsId, discipline_id: getDisciplineId('ADS010'), semester: 6, created_at: new Date(), updated_at: new Date() },
      { course_id: adsId, discipline_id: getDisciplineId('ETI001'), semester: 6, created_at: new Date(), updated_at: new Date() },

      // Gestão de Recursos Humanos (4 semestres)
      { course_id: rhId, discipline_id: getDisciplineId('PORT001'), semester: 1, created_at: new Date(), updated_at: new Date() },
      { course_id: rhId, discipline_id: getDisciplineId('RH001'), semester: 1, created_at: new Date(), updated_at: new Date() },
      { course_id: rhId, discipline_id: getDisciplineId('RH002'), semester: 2, created_at: new Date(), updated_at: new Date() },
      { course_id: rhId, discipline_id: getDisciplineId('RH003'), semester: 2, created_at: new Date(), updated_at: new Date() },
      { course_id: rhId, discipline_id: getDisciplineId('MET001'), semester: 2, created_at: new Date(), updated_at: new Date() },
      { course_id: rhId, discipline_id: getDisciplineId('RH004'), semester: 3, created_at: new Date(), updated_at: new Date() },
      { course_id: rhId, discipline_id: getDisciplineId('RH005'), semester: 3, created_at: new Date(), updated_at: new Date() },
      { course_id: rhId, discipline_id: getDisciplineId('RH006'), semester: 4, created_at: new Date(), updated_at: new Date() },
      { course_id: rhId, discipline_id: getDisciplineId('ETI001'), semester: 4, created_at: new Date(), updated_at: new Date() },

      // Administração (8 semestres)
      { course_id: admId, discipline_id: getDisciplineId('PORT001'), semester: 1, created_at: new Date(), updated_at: new Date() },
      { course_id: admId, discipline_id: getDisciplineId('MAT001'), semester: 1, created_at: new Date(), updated_at: new Date() },
      { course_id: admId, discipline_id: getDisciplineId('ADM001'), semester: 1, created_at: new Date(), updated_at: new Date() },
      { course_id: admId, discipline_id: getDisciplineId('ADM002'), semester: 2, created_at: new Date(), updated_at: new Date() },
      { course_id: admId, discipline_id: getDisciplineId('ADM003'), semester: 2, created_at: new Date(), updated_at: new Date() },
      { course_id: admId, discipline_id: getDisciplineId('MET001'), semester: 3, created_at: new Date(), updated_at: new Date() },
      { course_id: admId, discipline_id: getDisciplineId('ADM004'), semester: 3, created_at: new Date(), updated_at: new Date() },
      { course_id: admId, discipline_id: getDisciplineId('ADM005'), semester: 4, created_at: new Date(), updated_at: new Date() },
      { course_id: admId, discipline_id: getDisciplineId('RH001'), semester: 5, created_at: new Date(), updated_at: new Date() },
      { course_id: admId, discipline_id: getDisciplineId('ADM006'), semester: 6, created_at: new Date(), updated_at: new Date() },
      { course_id: admId, discipline_id: getDisciplineId('ADM007'), semester: 7, created_at: new Date(), updated_at: new Date() },
      { course_id: admId, discipline_id: getDisciplineId('ADM008'), semester: 8, created_at: new Date(), updated_at: new Date() },
      { course_id: admId, discipline_id: getDisciplineId('ETI001'), semester: 8, created_at: new Date(), updated_at: new Date() },
    ];

    await queryInterface.bulkInsert('course_disciplines', courseDisciplines, {});
    console.log(`✅ ${courseDisciplines.length} associações curso-disciplina criadas.`);

    console.log('\n📚 RESUMO DOS CURSOS CRIADOS:');
    console.log(`   1. Análise e Desenvolvimento de Sistemas (${courseDisciplines.filter(cd => cd.course_id === adsId).length} disciplinas)`);
    console.log(`   2. Gestão de Recursos Humanos (${courseDisciplines.filter(cd => cd.course_id === rhId).length} disciplinas)`);
    console.log(`   3. Administração (${courseDisciplines.filter(cd => cd.course_id === admId).length} disciplinas)`);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Remove todas as associações, disciplinas e cursos criados
     */
    await queryInterface.bulkDelete('course_disciplines', null, {});
    await queryInterface.bulkDelete('disciplines', null, {});
    await queryInterface.bulkDelete('courses', null, {});
    console.log('✅ Cursos, disciplinas e associações removidos.');
  }
};
