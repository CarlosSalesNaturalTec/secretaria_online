/**
 * Arquivo: backend/src/services/grade.service.js
 * Descrição: Lógica de negócio para o gerenciamento de notas
 * Feature: feat-052 - Criar GradeService com validações
 * Criado em: 2025-11-01
 *
 * Responsabilidades:
 * - Lançar notas validando tipo de avaliação (grade vs concept)
 * - Validar se aluno está inscrito na turma da avaliação
 * - Validar valores de nota (0-10 para grade, satisfactory/unsatisfactory para concept)
 * - Verificar se nota já existe antes de lançar
 * - Atualizar notas existentes
 * - Listar notas por avaliação
 * - Tratamento robusto de erros
 */

const { Grade, Evaluation, Class, ClassStudent, User } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const { Op } = require('sequelize');

class GradeService {
  /**
   * Valida se um aluno está inscrito em uma turma
   *
   * @param {number} studentId - ID do aluno
   * @param {number} classId - ID da turma
   * @returns {Promise<boolean>} True se aluno está na turma
   * @throws {AppError} Se validação falhar
   *
   * @private
   */
  async _validateStudentInClass(studentId, classId) {
    try {
      const classStudent = await ClassStudent.findOne({
        where: { student_id: studentId, class_id: classId }
      });

      return classStudent !== null;
    } catch (error) {
      throw new AppError(
        'Erro ao validar inscrição do aluno na turma',
        500,
        'STUDENT_CLASS_VALIDATION_ERROR'
      );
    }
  }

  /**
   * Valida o valor da nota conforme o tipo de avaliação
   *
   * @param {string} evaluationType - Tipo da avaliação ('grade' ou 'concept')
   * @param {number|string} grade - Valor numérico da nota (se aplicável)
   * @param {string} concept - Valor conceitual (se aplicável)
   * @returns {object} Objeto com grade e concept validados
   * @throws {AppError} Se valores forem inválidos
   *
   * @private
   */
  _validateGradeValue(evaluationType, grade, concept) {
    // Validar tipo de avaliação
    if (!['grade', 'concept'].includes(evaluationType)) {
      throw new AppError(
        'Tipo de avaliação inválido. Deve ser "grade" ou "concept"',
        422,
        'INVALID_EVALUATION_TYPE'
      );
    }

    const result = { grade: null, concept: null };

    if (evaluationType === 'grade') {
      // Para avaliações numéricas
      if (grade === null || grade === undefined) {
        throw new AppError(
          'Nota numérica é obrigatória para avaliações do tipo "grade"',
          422,
          'MISSING_GRADE_VALUE'
        );
      }

      const gradeValue = parseFloat(grade);

      // Validar se é um número válido
      if (isNaN(gradeValue)) {
        throw new AppError(
          'Nota deve ser um número válido',
          422,
          'INVALID_GRADE_FORMAT'
        );
      }

      // Validar intervalo [0, 10]
      if (gradeValue < 0 || gradeValue > 10) {
        throw new AppError(
          'Nota deve estar entre 0 e 10',
          422,
          'GRADE_OUT_OF_RANGE'
        );
      }

      result.grade = gradeValue;
    } else if (evaluationType === 'concept') {
      // Para avaliações conceituais
      if (!concept) {
        throw new AppError(
          'Conceito é obrigatório para avaliações do tipo "concept"',
          422,
          'MISSING_CONCEPT_VALUE'
        );
      }

      const conceptValue = concept.toLowerCase();

      // Validar valor de conceito
      if (!['satisfactory', 'unsatisfactory'].includes(conceptValue)) {
        throw new AppError(
          'Conceito deve ser "satisfactory" ou "unsatisfactory"',
          422,
          'INVALID_CONCEPT_VALUE'
        );
      }

      result.concept = conceptValue;
    }

    return result;
  }

  /**
   * Obtém informações de uma avaliação e valida existência
   *
   * @param {number} evaluationId - ID da avaliação
   * @returns {Promise<object>} Dados da avaliação
   * @throws {AppError} Se avaliação não existir
   *
   * @private
   */
  async _getAndValidateEvaluation(evaluationId) {
    try {
      const evaluation = await Evaluation.findByPk(evaluationId, {
        include: [
          {
            model: Class,
            attributes: ['id', 'semester', 'year']
          }
        ]
      });

      if (!evaluation) {
        throw new AppError(
          'Avaliação não encontrada',
          404,
          'EVALUATION_NOT_FOUND'
        );
      }

      return evaluation;
    } catch (error) {
      if (error.isOperational) throw error;
      throw new AppError(
        'Erro ao buscar avaliação',
        500,
        'EVALUATION_FETCH_ERROR'
      );
    }
  }

  /**
   * Obtém informações de um aluno e valida existência
   *
   * @param {number} studentId - ID do aluno
   * @returns {Promise<object>} Dados do aluno
   * @throws {AppError} Se aluno não existir
   *
   * @private
   */
  async _getAndValidateStudent(studentId) {
    try {
      const student = await User.findOne({
        where: { id: studentId, role: 'student' },
        attributes: ['id', 'name', 'email']
      });

      if (!student) {
        throw new AppError(
          'Aluno não encontrado',
          404,
          'STUDENT_NOT_FOUND'
        );
      }

      return student;
    } catch (error) {
      if (error.isOperational) throw error;
      throw new AppError(
        'Erro ao buscar aluno',
        500,
        'STUDENT_FETCH_ERROR'
      );
    }
  }

  /**
   * Lança uma nota para um aluno em uma avaliação
   *
   * Realiza as seguintes validações:
   * - Avaliação existe
   * - Aluno existe
   * - Aluno está inscrito na turma da avaliação
   * - Tipo e valor da nota estão corretos
   * - Nota não foi lançada anteriormente (ou atualiza se existir)
   *
   * @param {object} gradeData - Dados da nota
   * @param {number} gradeData.evaluation_id - ID da avaliação
   * @param {number} gradeData.student_id - ID do aluno
   * @param {number} gradeData.grade - Nota numérica (0-10) - opcional
   * @param {string} gradeData.concept - Conceito (satisfactory/unsatisfactory) - opcional
   * @returns {Promise<object>} Nota criada/atualizada
   * @throws {AppError} Se houver erro na validação
   *
   * @example
   * // Lançar nota numérica
   * const grade = await GradeService.createGrade({
   *   evaluation_id: 1,
   *   student_id: 5,
   *   grade: 8.5
   * });
   *
   * @example
   * // Lançar conceito
   * const grade = await GradeService.createGrade({
   *   evaluation_id: 2,
   *   student_id: 5,
   *   concept: 'satisfactory'
   * });
   */
  async createGrade(gradeData) {
    try {
      // 1. Validar e buscar avaliação
      const evaluation = await this._getAndValidateEvaluation(gradeData.evaluation_id);

      // 2. Validar e buscar aluno
      await this._getAndValidateStudent(gradeData.student_id);

      // 3. Validar se aluno está na turma da avaliação
      const isStudentInClass = await this._validateStudentInClass(
        gradeData.student_id,
        evaluation.class_id
      );

      if (!isStudentInClass) {
        throw new AppError(
          `Aluno ID ${gradeData.student_id} não está inscrito na turma ID ${evaluation.class_id}`,
          422,
          'STUDENT_NOT_IN_CLASS'
        );
      }

      // 4. Validar tipo e valor da nota
      const validatedGrade = this._validateGradeValue(
        evaluation.type,
        gradeData.grade,
        gradeData.concept
      );

      // 5. Verificar se nota já existe
      const existingGrade = await Grade.findOne({
        where: {
          evaluation_id: gradeData.evaluation_id,
          student_id: gradeData.student_id
        }
      });

      let grade;

      if (existingGrade) {
        // Atualizar nota existente
        grade = await existingGrade.update({
          grade: validatedGrade.grade,
          concept: validatedGrade.concept
        });
      } else {
        // Criar nova nota
        grade = await Grade.create({
          evaluation_id: gradeData.evaluation_id,
          student_id: gradeData.student_id,
          grade: validatedGrade.grade,
          concept: validatedGrade.concept
        });
      }

      return grade.toJSON();
    } catch (error) {
      if (error.isOperational) throw error;
      throw new AppError(
        'Erro ao lançar nota',
        500,
        'GRADE_CREATE_ERROR'
      );
    }
  }

  /**
   * Lista todas as notas de uma avaliação
   *
   * @param {number} evaluationId - ID da avaliação
   * @param {object} options - Opções adicionais
   * @param {boolean} options.includePending - Incluir notas não lançadas (default: false)
   * @returns {Promise<Array>} Lista de notas
   * @throws {AppError} Se avaliação não existir
   */
  async listByEvaluation(evaluationId, options = {}) {
    try {
      // Validar avaliação existe
      await this._getAndValidateEvaluation(evaluationId);

      const where = { evaluation_id: evaluationId };

      // Por padrão, listar apenas notas lançadas (grade ou concept preenchido)
      if (!options.includePending) {
        where[Op.or] = [
          { grade: { [Op.ne]: null } },
          { concept: { [Op.ne]: null } }
        ];
      }

      const grades = await Grade.findAll({
        where,
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return grades.map(g => g.toJSON());
    } catch (error) {
      if (error.isOperational) throw error;
      throw new AppError(
        'Erro ao listar notas',
        500,
        'GRADE_LIST_ERROR'
      );
    }
  }

  /**
   * Obtém uma nota específica de um aluno em uma avaliação
   *
   * @param {number} evaluationId - ID da avaliação
   * @param {number} studentId - ID do aluno
   * @returns {Promise<object|null>} Nota encontrada ou null
   * @throws {AppError} Se houver erro na busca
   */
  async getGradeByEvaluationAndStudent(evaluationId, studentId) {
    try {
      const grade = await Grade.findOne({
        where: {
          evaluation_id: evaluationId,
          student_id: studentId
        },
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      return grade ? grade.toJSON() : null;
    } catch (error) {
      throw new AppError(
        'Erro ao buscar nota',
        500,
        'GRADE_FETCH_ERROR'
      );
    }
  }

  /**
   * Atualiza uma nota existente
   *
   * @param {number} gradeId - ID da nota
   * @param {object} updateData - Dados a atualizar (grade ou concept)
   * @returns {Promise<object>} Nota atualizada
   * @throws {AppError} Se nota não existir ou dados forem inválidos
   */
  async updateGrade(gradeId, updateData) {
    try {
      const grade = await Grade.findByPk(gradeId, {
        include: [
          {
            model: Evaluation,
            attributes: ['id', 'type', 'class_id']
          }
        ]
      });

      if (!grade) {
        throw new AppError(
          'Nota não encontrada',
          404,
          'GRADE_NOT_FOUND'
        );
      }

      // Validar novo valor
      const validatedGrade = this._validateGradeValue(
        grade.evaluation.type,
        updateData.grade,
        updateData.concept
      );

      // Atualizar
      await grade.update({
        grade: validatedGrade.grade,
        concept: validatedGrade.concept
      });

      return grade.toJSON();
    } catch (error) {
      if (error.isOperational) throw error;
      throw new AppError(
        'Erro ao atualizar nota',
        500,
        'GRADE_UPDATE_ERROR'
      );
    }
  }

  /**
   * Deleta uma nota (soft delete)
   *
   * @param {number} gradeId - ID da nota
   * @returns {Promise<boolean>} True se deletada com sucesso
   * @throws {AppError} Se nota não existir
   */
  async deleteGrade(gradeId) {
    try {
      const grade = await Grade.findByPk(gradeId);

      if (!grade) {
        throw new AppError(
          'Nota não encontrada',
          404,
          'GRADE_NOT_FOUND'
        );
      }

      await grade.destroy();
      return true;
    } catch (error) {
      if (error.isOperational) throw error;
      throw new AppError(
        'Erro ao deletar nota',
        500,
        'GRADE_DELETE_ERROR'
      );
    }
  }

  /**
   * Verifica se uma nota já foi lançada para um aluno em uma avaliação
   *
   * @param {number} evaluationId - ID da avaliação
   * @param {number} studentId - ID do aluno
   * @returns {Promise<boolean>} True se nota foi lançada
   */
  async gradeExists(evaluationId, studentId) {
    try {
      const grade = await Grade.findOne({
        where: {
          evaluation_id: evaluationId,
          student_id: studentId
        }
      });

      return grade !== null;
    } catch (error) {
      throw new AppError(
        'Erro ao verificar nota',
        500,
        'GRADE_EXISTS_ERROR'
      );
    }
  }

  /**
   * Lista notas pendentes de lançamento de uma avaliação
   *
   * Retorna todos os alunos da turma que não têm nota lançada
   *
   * @param {number} evaluationId - ID da avaliação
   * @returns {Promise<Array>} Lista de alunos sem nota lançada
   * @throws {AppError} Se avaliação não existir
   */
  async listPendingGrades(evaluationId) {
    try {
      // Validar avaliação existe
      const evaluation = await this._getAndValidateEvaluation(evaluationId);

      // Buscar todos os alunos da turma
      const classStudents = await ClassStudent.findAll({
        where: { class_id: evaluation.class_id },
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      // Buscar notas lançadas
      const launchedGrades = await Grade.findAll({
        where: { evaluation_id: evaluationId },
        attributes: ['student_id']
      });

      const launchedStudentIds = launchedGrades.map(g => g.student_id);

      // Filtrar alunos sem nota
      const pending = classStudents
        .filter(cs => !launchedStudentIds.includes(cs.student_id))
        .map(cs => ({
          id: cs.student.id,
          name: cs.student.name,
          email: cs.student.email
        }));

      return pending;
    } catch (error) {
      if (error.isOperational) throw error;
      throw new AppError(
        'Erro ao listar notas pendentes',
        500,
        'PENDING_GRADES_LIST_ERROR'
      );
    }
  }

  /**
   * Conta quantas notas foram lançadas em uma avaliação
   *
   * @param {number} evaluationId - ID da avaliação
   * @returns {Promise<object>} Objeto com contagem: { total, launched, pending }
   */
  async countGradesByEvaluation(evaluationId) {
    try {
      // Validar avaliação existe
      const evaluation = await this._getAndValidateEvaluation(evaluationId);

      // Total de alunos na turma
      const totalStudents = await ClassStudent.count({
        where: { class_id: evaluation.class_id }
      });

      // Notas lançadas (grade ou concept preenchido)
      const launchedGrades = await Grade.count({
        where: {
          evaluation_id: evaluationId,
          [Op.or]: [
            { grade: { [Op.ne]: null } },
            { concept: { [Op.ne]: null } }
          ]
        }
      });

      return {
        total: totalStudents,
        launched: launchedGrades,
        pending: totalStudents - launchedGrades
      };
    } catch (error) {
      if (error.isOperational) throw error;
      throw new AppError(
        'Erro ao contar notas',
        500,
        'GRADE_COUNT_ERROR'
      );
    }
  }

  /**
   * Valida dados de entrada antes de lançar nota (uso em validação de requisição)
   *
   * Utilizado pelo controller para validação básica antes de chamar createGrade
   *
   * @param {object} data - Dados a validar
   * @param {number} data.evaluation_id - ID da avaliação
   * @param {number} data.student_id - ID do aluno
   * @param {number} data.grade - Nota (opcional)
   * @param {string} data.concept - Conceito (opcional)
   * @returns {object} Erros encontrados ou objeto vazio se válido
   */
  validateGradeInput(data) {
    const errors = {};

    // Validar evaluation_id
    if (!data.evaluation_id) {
      errors.evaluation_id = 'ID da avaliação é obrigatório';
    } else if (isNaN(parseInt(data.evaluation_id))) {
      errors.evaluation_id = 'ID da avaliação deve ser um número';
    }

    // Validar student_id
    if (!data.student_id) {
      errors.student_id = 'ID do aluno é obrigatório';
    } else if (isNaN(parseInt(data.student_id))) {
      errors.student_id = 'ID do aluno deve ser um número';
    }

    // Validar que há grade ou concept
    if (!data.grade && !data.concept) {
      errors.grade = 'É necessário informar nota (grade) ou conceito (concept)';
    }

    return errors;
  }

  /**
   * Obtém todas as notas de um aluno com filtros opcionais
   *
   * Retorna as notas do aluno com as informações de disciplina, avaliação e turma.
   * Permite filtrar por semestre e/ou disciplina.
   *
   * @param {number} studentId - ID do aluno
   * @param {object} filters - Filtros opcionais
   * @param {number} filters.semester - Número do semestre (filtro opcional)
   * @param {number} filters.discipline_id - ID da disciplina (filtro opcional)
   * @returns {Promise<Array>} Lista de notas do aluno com detalhes
   * @throws {AppError} Se aluno não existir
   *
   * @example
   * // Obter todas as notas do aluno
   * const grades = await GradeService.getStudentGrades(5);
   *
   * @example
   * // Obter notas do 1º semestre
   * const grades = await GradeService.getStudentGrades(5, { semester: 1 });
   *
   * @example
   * // Obter notas de uma disciplina específica
   * const grades = await GradeService.getStudentGrades(5, { discipline_id: 3 });
   */
  async getStudentGrades(studentId, filters = {}) {
    try {
      // 1. Validar que aluno existe
      await this._getAndValidateStudent(studentId);

      // 2. Construir query com relacionamentos
      let query = {
        where: { student_id: studentId },
        include: [
          {
            model: Evaluation,
            as: 'evaluation',
            attributes: ['id', 'name', 'date', 'type'],
            include: [
              {
                model: require('../models').Class,
                as: 'class',
                attributes: ['id', 'semester', 'year']
              },
              {
                model: require('../models').Discipline,
                as: 'discipline',
                attributes: ['id', 'name', 'code']
              }
            ]
          },
          {
            model: User,
            as: 'student',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['created_at', 'DESC']]
      };

      // 3. Aplicar filtros se fornecidos
      if (filters.semester) {
        // Filtro por semestre - filtra notas cujas avaliações pertencem a uma turma do semestre especificado
        query.include[0].where = {
          ...query.include[0].where,
          '$evaluation.class.semester$': filters.semester
        };
        query.subQuery = false;
      }

      if (filters.discipline_id) {
        // Filtro por disciplina
        query.include[0].where = {
          ...query.include[0].where,
          '$evaluation.discipline_id$': filters.discipline_id
        };
        query.subQuery = false;
      }

      // 4. Buscar notas
      const grades = await Grade.findAll(query);

      // 5. Estruturar resposta com agrupamento opcional por disciplina
      return grades.map(g => {
        const gradeData = g.toJSON();
        return {
          id: gradeData.id,
          evaluation: {
            id: gradeData.evaluation.id,
            name: gradeData.evaluation.name,
            date: gradeData.evaluation.date,
            type: gradeData.evaluation.type
          },
          class: {
            id: gradeData.evaluation.class.id,
            semester: gradeData.evaluation.class.semester,
            year: gradeData.evaluation.class.year
          },
          discipline: {
            id: gradeData.evaluation.discipline.id,
            name: gradeData.evaluation.discipline.name,
            code: gradeData.evaluation.discipline.code
          },
          grade: gradeData.grade,
          concept: gradeData.concept,
          created_at: gradeData.created_at,
          updated_at: gradeData.updated_at
        };
      });
    } catch (error) {
      if (error.isOperational) throw error;
      throw new AppError(
        'Erro ao buscar notas do aluno',
        500,
        'STUDENT_GRADES_FETCH_ERROR'
      );
    }
  }
}

module.exports = new GradeService();
