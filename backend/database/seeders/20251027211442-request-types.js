/**
 * Arquivo: backend/database/seeders/20251027211442-request-types.js
 * Descrição: Seeder para criar tipos de solicitações padrão que alunos podem fazer
 * Feature: feat-016 - Criar seeders de dados iniciais
 * Criado em: 2025-10-27
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Cria tipos de solicitações que alunos podem fazer
     *
     * Tipos conforme requirements.md:
     * - Atestado
     * - Histórico escolar
     * - Certificado
     * - Atividades complementares
     * - Transferência
     * - Cancelamento de matrícula
     *
     * response_deadline_days: prazo de resposta em dias úteis
     */

    // Verificar se já existem tipos de solicitações
    const [existingTypes] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM request_types;`
    );

    if (existingTypes[0].count > 0) {
      console.log('⚠️  Tipos de solicitações já existem. Seeder ignorado.');
      return;
    }

    const requestTypes = [
      {
        name: 'Pedido de Atestado de Matrícula',
        description: 'Solicitação de atestado comprovando matrícula ativa no curso',
        response_deadline_days: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Histórico Escolar',
        description: 'Solicitação de histórico escolar completo com notas e disciplinas cursadas',
        response_deadline_days: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Certificado de Conclusão',
        description: 'Solicitação de certificado de conclusão de curso',
        response_deadline_days: 10,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Validação de Atividades Complementares',
        description: 'Solicitação de validação de horas de atividades complementares',
        response_deadline_days: 7,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Transferência de Turma',
        description: 'Solicitação de transferência para outra turma do mesmo curso',
        response_deadline_days: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Cancelamento de Matrícula',
        description: 'Solicitação de cancelamento de matrícula no curso',
        response_deadline_days: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Declaração de Frequência',
        description: 'Solicitação de declaração de frequência escolar',
        response_deadline_days: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Segunda Via de Diploma',
        description: 'Solicitação de segunda via do diploma de conclusão',
        response_deadline_days: 15,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Trancamento de Matrícula',
        description: 'Solicitação de trancamento temporário da matrícula',
        response_deadline_days: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: 'Reabertura de Matrícula',
        description: 'Solicitação de reabertura de matrícula trancada',
        response_deadline_days: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    ];

    await queryInterface.bulkInsert('request_types', requestTypes, {});

    console.log(`✅ ${requestTypes.length} tipos de solicitações criados com sucesso!`);
    console.log('   Tipos disponíveis:');
    requestTypes.forEach((type, index) => {
      console.log(`   ${index + 1}. ${type.name} (prazo: ${type.response_deadline_days} dias úteis)`);
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Remove todos os tipos de solicitações criados
     */
    await queryInterface.bulkDelete('request_types', null, {});
    console.log('✅ Tipos de solicitações removidos.');
  }
};
