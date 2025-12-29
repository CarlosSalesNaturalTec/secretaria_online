/**
 * Arquivo: backend/src/models/Enrollment.js
 * Descrição: Model Sequelize para matrículas de alunos em cursos
 * Feature: feat-011 - Criar migration e model Enrollment
 * Criado em: 2025-10-26
 *
 * RESPONSABILIDADES:
 * - Representar matrículas de alunos em cursos
 * - Validar regras de negócio (status válidos)
 * - Gerenciar status de matrícula (pending, active, cancelled, contract, reenrollment, completed)
 * - Soft delete para histórico
 * - Relacionamentos com User (aluno) e Course
 *
 * REGRAS DE NEGÓCIO:
 * - Um aluno pode ter múltiplas matrículas simultâneas em diferentes cursos
 * - Status padrão: contract (aguardando aceite de contrato)
 * - Status contract: aguardando aceite de contrato pelo aluno
 * - Status pending: aguardando aprovação de documentos
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
        type: DataTypes.ENUM('pending', 'active', 'cancelled', 'reenrollment', 'completed', 'contract'),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          notNull: {
            msg: 'status é obrigatório',
          },
          isIn: {
            args: [['pending', 'active', 'cancelled', 'reenrollment', 'completed', 'contract']],
            msg: 'status deve ser: pending, active, cancelled, reenrollment, completed ou contract',
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
      current_semester: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        validate: {
          isInt: {
            msg: 'current_semester deve ser um número inteiro',
          },
          min: {
            args: [1],
            msg: 'current_semester deve ser no mínimo 1',
          },
          max: {
            args: [12],
            msg: 'current_semester deve ser no máximo 12',
          },
        },
        comment: 'Semestre atual do aluno no curso (1, 2, 3, etc.)',
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
              attributes: ['id', 'name', 'duration', 'duration_type', 'description', 'courseType'],
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

    // Enrollment pode ter múltiplos Contracts (renovações semestrais) - NOVO
    // Um enrollment pode ter vários contratos ao longo do tempo (1 por semestre)
    Enrollment.hasMany(models.Contract, {
      foreignKey: 'enrollment_id',
      as: 'contracts',
      onDelete: 'RESTRICT', // Não permite deletar enrollment com contratos
      onUpdate: 'CASCADE',
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
      reenrollment: 'Rematrícula',
      completed: 'Concluída',
      contract: 'Aguardando Aceite de Contrato',
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

  /**
   * Retorna o semestre atual formatado
   *
   * @returns {string} "1º semestre", "2º semestre", etc. ou "Não definido"
   */
  Enrollment.prototype.getCurrentSemesterLabel = function () {
    if (!this.current_semester) {
      return 'Não definido';
    }
    return `${this.current_semester}º semestre`;
  };

  /**
   * Verifica se o aluno está no último semestre do curso
   *
   * @returns {Promise<boolean>}
   */
  Enrollment.prototype.isLastSemester = async function () {
    if (!this.current_semester || !this.course) {
      // Precisa eager load do course
      await this.reload({ include: ['course'] });
    }

    if (!this.course || !this.course.duration || this.course.duration_type !== 'semestres') {
      return false;
    }

    return this.current_semester >= this.course.duration;
  };

  /**
   * Avança para o próximo semestre
   *
   * @returns {Promise<Enrollment>}
   */
  Enrollment.prototype.advanceSemester = async function () {
    if (!this.current_semester) {
      this.current_semester = 1;
    } else {
      this.current_semester += 1;
    }
    await this.save();
    console.log(`[Enrollment] Matrícula ID ${this.id} avançada para o ${this.current_semester}º semestre`);
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
              attributes: ['id', 'name', 'duration', 'duration_type', 'description', 'course_type'],
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
   * Verifica se o aluno já possui uma matrícula ativa/pending/contract
   *
   * @param {number} studentId - ID do aluno
   * @returns {Promise<Enrollment|null>}
   */
  Enrollment.findActiveByStudent = async function (studentId) {
    return this.findOne({
      where: {
        student_id: studentId,
        status: ['active', 'pending', 'contract'],
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
