/**
 * Arquivo: backend/src/models/Enrollment.js
 * Descrição: Model Sequelize para matrículas de alunos em cursos
 * Feature: feat-011 - Criar migration e model Enrollment
 * Criado em: 2025-10-26
 *
 * RESPONSABILIDADES:
 * - Representar matrículas de alunos em cursos
 * - Validar regras de negócio (um aluno por curso, status válidos)
 * - Gerenciar status de matrícula (pending, active, cancelled)
 * - Soft delete para histórico
 * - Relacionamentos com User (aluno) e Course
 *
 * REGRAS DE NEGÓCIO:
 * - Um aluno pode ter apenas UMA matrícula ativa/pending por vez
 * - Status padrão: pending (aguardando aprovação de documentos)
 * - Status ativa: todos os documentos obrigatórios aprovados
 * - Status cancelada: matrícula cancelada por solicitação
 *
 * @example
 * // Criar nova matrícula
 * const enrollment = await Enrollment.create({
 *   student_id: 1,
 *   course_id: 2,
 *   status: 'pending',
 *   enrollment_date: '2025-01-15'
 * });
 *
 * // Ativar matrícula
 * await enrollment.activate();
 *
 * // Buscar matrículas ativas de um aluno
 * const active = await Enrollment.findActiveByStudent(1);
 */

'use strict';

/**
 * Factory function do Model Enrollment
 * Executada pelo models/index.js durante inicialização do Sequelize
 *
 * @param {import('sequelize').Sequelize} sequelize - Instância do Sequelize
 * @param {import('sequelize').DataTypes} DataTypes - Tipos de dados do Sequelize
 * @returns {import('sequelize').Model} Model Enrollment configurado
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * Model Enrollment
   * Representa matrículas de alunos em cursos
   */
  const Enrollment = sequelize.define(
    'Enrollment',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      student_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'student_id é obrigatório',
          },
          notEmpty: {
            msg: 'student_id não pode ser vazio',
          },
          isInt: {
            msg: 'student_id deve ser um número inteiro',
          },
          /**
           * Validação customizada: Garante que um aluno tenha apenas UMA matrícula active/pending
           *
           * REGRA DE NEGÓCIO:
           * - Um aluno pode ter apenas uma matrícula com status 'active' OU 'pending' por vez
           * - Matrículas 'cancelled' não contam para essa restrição
           * - Matrículas deletadas (soft delete) não contam
           *
           * Esta validação substitui o índice único que não funcionava corretamente no MySQL
           */
          async uniqueActiveEnrollment(value) {
            // Só valida se for um novo registro ou se student_id foi modificado
            if (!this.isNewRecord && !this.changed('student_id')) {
              return;
            }

            // Só aplica a regra se o status for 'active' ou 'pending'
            if (this.status !== 'active' && this.status !== 'pending') {
              return;
            }

            // Busca matrícula ativa/pending existente para este aluno
            const existingEnrollment = await this.constructor.findOne({
              where: {
                student_id: value,
                status: ['active', 'pending'],
                deleted_at: null,
              },
            });

            if (existingEnrollment) {
              throw new Error(
                `O aluno já possui uma matrícula ${existingEnrollment.status === 'active' ? 'ativa' : 'pendente'}. ` +
                  `Finalize ou cancele a matrícula atual antes de criar uma nova.`
              );
            }
          },
        },
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'course_id é obrigatório',
          },
          notEmpty: {
            msg: 'course_id não pode ser vazio',
          },
          isInt: {
            msg: 'course_id deve ser um número inteiro',
          },
        },
      },
      status: {
        type: DataTypes.ENUM('pending', 'active', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          notNull: {
            msg: 'status é obrigatório',
          },
          isIn: {
            args: [['pending', 'active', 'cancelled']],
            msg: 'status deve ser: pending, active ou cancelled',
          },
        },
      },
      enrollment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          notNull: {
            msg: 'enrollment_date é obrigatória',
          },
          isDate: {
            msg: 'enrollment_date deve ser uma data válida',
          },
          /**
           * Valida que a data de matrícula não é futura
           */
          isNotFuture(value) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const enrollmentDate = new Date(value);
            enrollmentDate.setHours(0, 0, 0, 0);

            if (enrollmentDate > today) {
              throw new Error('enrollment_date não pode ser no futuro');
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Enrollment',
      tableName: 'enrollments',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      hooks: {
        /**
         * Hook executado ANTES de validar o registro
         * Normaliza os dados antes da validação
         */
        beforeValidate: (enrollment, options) => {
          // Converte status para lowercase (prevenção de erros)
          if (enrollment.status) {
            enrollment.status = enrollment.status.toLowerCase();
          }

          // Log de criação/edição
          const action = enrollment.isNewRecord ? 'criando' : 'editando';
          console.log(
            `[Enrollment Hook] ${action} matrícula - student_id: ${enrollment.student_id}, course_id: ${enrollment.course_id}, status: ${enrollment.status}`
          );
        },

        /**
         * Hook executado DEPOIS de criar registro
         */
        afterCreate: (enrollment, options) => {
          console.log(
            `[Enrollment Hook] Matrícula criada com sucesso - ID: ${enrollment.id}, Status: ${enrollment.status}`
          );
        },

        /**
         * Hook executado DEPOIS de atualizar registro
         */
        afterUpdate: (enrollment, options) => {
          console.log(
            `[Enrollment Hook] Matrícula atualizada - ID: ${enrollment.id}, Novo Status: ${enrollment.status}`
          );
        },

        /**
         * Hook executado DEPOIS de deletar (soft delete)
         */
        afterDestroy: (enrollment, options) => {
          console.log(`[Enrollment Hook] Matrícula deletada (soft delete) - ID: ${enrollment.id}`);
        },
      },
      scopes: {
        /**
         * Scope: Apenas matrículas ativas
         */
        active: {
          where: {
            status: 'active',
            deleted_at: null,
          },
        },

        /**
         * Scope: Apenas matrículas pendentes
         */
        pending: {
          where: {
            status: 'pending',
            deleted_at: null,
          },
        },

        /**
         * Scope: Apenas matrículas canceladas
         */
        cancelled: {
          where: {
            status: 'cancelled',
          },
        },

        /**
         * Scope: Matrículas recentes (últimos 30 dias)
         */
        recent: {
          where: sequelize.where(
            sequelize.fn('DATEDIFF', sequelize.fn('NOW'), sequelize.col('enrollment_date')),
            '<=',
            30
          ),
          order: [['enrollment_date', 'DESC']],
        },

        /**
         * Scope: Com informações do aluno e curso (eager loading)
         */
        withRelations: {
          include: [
            {
              association: 'student',
              attributes: ['id', 'name', 'email', 'cpf'],
            },
            {
              association: 'course',
              attributes: ['id', 'name', 'duration_semesters'],
            },
          ],
        },
      },
    }
  );

  // ========================================
  // ASSOCIAÇÕES
  // ========================================

  /**
   * Define as associações do model
   *
   * @param {Object} models - Objeto contendo todos os models
   */
  Enrollment.associate = function (models) {
    // Enrollment pertence a um Student (aluno)
    Enrollment.belongsTo(models.Student, {
      foreignKey: 'student_id',
      as: 'student',
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',
    });

    // Enrollment pertence a um Course
    Enrollment.belongsTo(models.Course, {
      foreignKey: 'course_id',
      as: 'course',
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',
    });
  };

  // ========================================
  // MÉTODOS DE INSTÂNCIA
  // ========================================

  /**
   * Verifica se a matrícula está ativa
   *
   * @returns {boolean}
   */
  Enrollment.prototype.isActive = function () {
    return this.status === 'active' && !this.deleted_at;
  };

  /**
   * Verifica se a matrícula está pendente
   *
   * @returns {boolean}
   */
  Enrollment.prototype.isPending = function () {
    return this.status === 'pending' && !this.deleted_at;
  };

  /**
   * Verifica se a matrícula está cancelada
   *
   * @returns {boolean}
   */
  Enrollment.prototype.isCancelled = function () {
    return this.status === 'cancelled';
  };

  /**
   * Retorna label legível do status
   *
   * @returns {string}
   */
  Enrollment.prototype.getStatusLabel = function () {
    const labels = {
      pending: 'Aguardando Confirmação',
      active: 'Ativa',
      cancelled: 'Cancelada',
    };
    return labels[this.status] || 'Status Desconhecido';
  };

  /**
   * Ativa a matrícula (quando documentos são aprovados)
   *
   * @returns {Promise<Enrollment>}
   */
  Enrollment.prototype.activate = async function () {
    if (this.status === 'active') {
      throw new Error('Matrícula já está ativa');
    }
    if (this.status === 'cancelled') {
      throw new Error('Não é possível ativar uma matrícula cancelada');
    }

    this.status = 'active';
    await this.save();
    console.log(`[Enrollment] Matrícula ID ${this.id} ativada com sucesso`);
    return this;
  };

  /**
   * Cancela a matrícula
   *
   * @returns {Promise<Enrollment>}
   */
  Enrollment.prototype.cancel = async function () {
    if (this.status === 'cancelled') {
      throw new Error('Matrícula já está cancelada');
    }

    this.status = 'cancelled';
    await this.save();
    console.log(`[Enrollment] Matrícula ID ${this.id} cancelada com sucesso`);
    return this;
  };

  // ========================================
  // MÉTODOS ESTÁTICOS (CLASS METHODS)
  // ========================================

  /**
   * Busca matrículas por aluno
   *
   * @param {number} studentId - ID do aluno
   * @param {Object} options - Opções adicionais (includeDeleted, status)
   * @returns {Promise<Enrollment[]>}
   */
  Enrollment.findByStudent = async function (studentId, options = {}) {
    const where = { student_id: studentId };

    // Por padrão, não inclui deletados
    if (!options.includeDeleted) {
      where.deleted_at = null;
    }

    // Filtro por status se especificado
    if (options.status) {
      where.status = options.status;
    }

    return this.findAll({
      where,
      include: options.withCourse
        ? [
            {
              association: 'course',
              attributes: ['id', 'name', 'duration_semesters'],
            },
          ]
        : [],
      order: [['enrollment_date', 'DESC']],
    });
  };

  /**
   * Busca matrículas por curso
   *
   * @param {number} courseId - ID do curso
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Enrollment[]>}
   */
  Enrollment.findByCourse = async function (courseId, options = {}) {
    const where = { course_id: courseId };

    if (!options.includeDeleted) {
      where.deleted_at = null;
    }

    if (options.status) {
      where.status = options.status;
    }

    return this.findAll({
      where,
      include: options.withStudent
        ? [
            {
              association: 'student',
              attributes: ['id', 'name', 'email', 'cpf'],
            },
          ]
        : [],
      order: [['enrollment_date', 'DESC']],
    });
  };

  /**
   * Verifica se o aluno já possui uma matrícula ativa/pending
   *
   * @param {number} studentId - ID do aluno
   * @returns {Promise<Enrollment|null>}
   */
  Enrollment.findActiveByStudent = async function (studentId) {
    return this.findOne({
      where: {
        student_id: studentId,
        status: ['active', 'pending'],
        deleted_at: null,
      },
      include: [
        {
          association: 'course',
          attributes: ['id', 'name'],
        },
      ],
    });
  };

  /**
   * Conta matrículas ativas de um curso
   *
   * @param {number} courseId - ID do curso
   * @returns {Promise<number>}
   */
  Enrollment.countActiveByCourse = async function (courseId) {
    return this.count({
      where: {
        course_id: courseId,
        status: 'active',
        deleted_at: null,
      },
    });
  };

  return Enrollment;
};
