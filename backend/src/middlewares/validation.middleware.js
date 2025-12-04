/**
 * Arquivo: backend/src/middlewares/validation.middleware.js
 * Descrição: Middleware de validação usando express-validator e validadores customizados
 * Feature: feat-025 - Criar middleware de validação com express-validator
 * Criado em: 2025-10-28
 */

const { validationResult, body, param, query } = require('express-validator');
const {
  validateCPF,
  validateStrongPassword,
  validateBirthDate,
  validateOnlyLetters,
  validatePhone,
  validateCourseCode,
  validateSemester,
  validateGrade,
} = require('../utils/validators');

/**
 * Middleware para processar os resultados da validação
 *
 * Captura os erros de validação do express-validator e retorna
 * uma resposta JSON padronizada com os erros encontrados
 *
 * @param {Object} req - Request do Express
 * @param {Object} res - Response do Express
 * @param {Function} next - Next middleware
 * @returns {Object} Resposta JSON com erros ou chama next() se não houver erros
 *
 * @example
 * router.post('/students', studentValidationRules(), handleValidationErrors, controller.create);
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos fornecidos',
        details: errors.array().map((err) => ({
          field: err.path || err.param,
          message: err.msg,
          value: err.value,
        })),
      },
    });
  }

  next();
};

/**
 * Validadores para criação/atualização de Alunos
 *
 * Responsabilidades:
 * - Validar dados obrigatórios (nome, CPF, email, RG, etc)
 * - Validar formato de CPF
 * - Validar formato de email
 * - Validar senha provisória se fornecida
 *
 * @returns {Array} Array de validações do express-validator
 */
const studentValidationRules = () => {
  return [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Nome é obrigatório')
      .isLength({ min: 3, max: 255 })
      .withMessage('Nome deve ter entre 3 e 255 caracteres')
      .custom(validateOnlyLetters)
      .withMessage('Nome deve conter apenas letras'),

    body('cpf')
      .trim()
      .notEmpty()
      .withMessage('CPF é obrigatório')
      .custom(validateCPF)
      .withMessage('CPF inválido'),

    body('rg').trim().notEmpty().withMessage('RG é obrigatório'),

    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email é obrigatório')
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),

    body('mother_name')
      .trim()
      .notEmpty()
      .withMessage('Nome da mãe é obrigatório')
      .custom(validateOnlyLetters)
      .withMessage('Nome da mãe deve conter apenas letras'),

    body('father_name')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .custom((value) => !value || validateOnlyLetters(value))
      .withMessage('Nome do pai deve conter apenas letras'),

    body('address').trim().notEmpty().withMessage('Endereço é obrigatório'),

    body('birth_date')
      .optional({ nullable: true })
      .custom((value) => !value || validateBirthDate(value))
      .withMessage('Data de nascimento inválida ou menor de 16 anos'),

    body('phone')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .custom((value) => !value || validatePhone(value))
      .withMessage('Telefone inválido'),

    body('login')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Login deve ter entre 3 e 50 caracteres'),

    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Senha deve ter no mínimo 6 caracteres'),
  ];
};

/**
 * Validadores para criação/atualização de Professores
 *
 * Similar aos validadores de alunos, mas com campos específicos
 *
 * @returns {Array} Array de validações do express-validator
 */
const teacherValidationRules = () => {
  return [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Nome é obrigatório')
      .isLength({ min: 3, max: 255 })
      .withMessage('Nome deve ter entre 3 e 255 caracteres')
      .custom(validateOnlyLetters)
      .withMessage('Nome deve conter apenas letras'),

    body('cpf')
      .trim()
      .notEmpty()
      .withMessage('CPF é obrigatório')
      .custom(validateCPF)
      .withMessage('CPF inválido'),

    body('rg').trim().notEmpty().withMessage('RG é obrigatório'),

    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email é obrigatório')
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),

    body('mother_name')
      .trim()
      .notEmpty()
      .withMessage('Nome da mãe é obrigatório')
      .custom(validateOnlyLetters)
      .withMessage('Nome da mãe deve conter apenas letras'),

    body('father_name')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .custom((value) => !value || validateOnlyLetters(value))
      .withMessage('Nome do pai deve conter apenas letras'),

    body('address').trim().notEmpty().withMessage('Endereço é obrigatório'),

    body('title')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isIn(['Graduação', 'Especialização', 'Mestrado', 'Doutorado', 'Pós-Doutorado'])
      .withMessage('Título acadêmico inválido'),

    body('phone')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .custom((value) => !value || validatePhone(value))
      .withMessage('Telefone inválido'),

    body('login')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Login deve ter entre 3 e 50 caracteres'),

    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Senha deve ter no mínimo 6 caracteres'),
  ];
};

/**
 * Validadores para criação/atualização de Cursos
 *
 * @returns {Array} Array de validações do express-validator
 */
const courseValidationRules = () => {
  return [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Nome do curso é obrigatório')
      .isLength({ min: 3, max: 255 })
      .withMessage('Nome do curso deve ter entre 3 e 255 caracteres'),

    body('code')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .toUpperCase()
      .custom((value) => !value || validateCourseCode(value))
      .withMessage('Código do curso inválido (formato esperado: AAA999)'),

    body('duration_semesters')
      .notEmpty()
      .withMessage('Duração em semestres é obrigatória')
      .isInt({ min: 1, max: 12 })
      .withMessage('Duração deve ser entre 1 e 12 semestres'),

    body('description')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Descrição deve ter no máximo 1000 caracteres'),
  ];
};

/**
 * Validadores para criação/atualização de Disciplinas
 *
 * @returns {Array} Array de validações do express-validator
 */
const disciplineValidationRules = () => {
  return [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Nome da disciplina é obrigatório')
      .isLength({ min: 3, max: 255 })
      .withMessage('Nome da disciplina deve ter entre 3 e 255 caracteres'),

    body('code')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .toUpperCase()
      .isLength({ min: 2, max: 50 })
      .withMessage('Código deve ter entre 2 e 50 caracteres'),

    body('workload_hours')
      .optional({ nullable: true, checkFalsy: true })
      .isInt({ min: 1, max: 500 })
      .withMessage('Carga horária deve ser entre 1 e 500 horas'),

    body('description')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Descrição deve ter no máximo 1000 caracteres'),
  ];
};

/**
 * Validadores para criação de Matrículas
 *
 * @returns {Array} Array de validações do express-validator
 */
const enrollmentValidationRules = () => {
  return [
    body('student_id')
      .notEmpty()
      .withMessage('ID do aluno é obrigatório')
      .isInt({ min: 1 })
      .withMessage('ID do aluno inválido'),

    body('course_id')
      .notEmpty()
      .withMessage('ID do curso é obrigatório')
      .isInt({ min: 1 })
      .withMessage('ID do curso inválido'),

    body('enrollment_date')
      .optional()
      .isISO8601()
      .withMessage('Data de matrícula inválida'),

    body('status')
      .optional()
      .isIn(['pending', 'active', 'cancelled'])
      .withMessage('Status inválido'),
  ];
};

/**
 * Validadores para lançamento de Notas
 *
 * @returns {Array} Array de validações do express-validator
 */
const gradeValidationRules = () => {
  return [
    body('student_id')
      .notEmpty()
      .withMessage('ID do aluno é obrigatório')
      .isInt({ min: 1 })
      .withMessage('ID do aluno inválido'),

    body('evaluation_id')
      .notEmpty()
      .withMessage('ID da avaliação é obrigatório')
      .isInt({ min: 1 })
      .withMessage('ID da avaliação inválido'),

    body('grade')
      .optional({ nullable: true })
      .custom((value) => value === null || validateGrade(value))
      .withMessage('Nota deve estar entre 0 e 10 com no máximo 2 casas decimais'),

    body('concept')
      .optional({ nullable: true })
      .isIn(['satisfactory', 'unsatisfactory', null])
      .withMessage('Conceito deve ser "satisfactory" ou "unsatisfactory"'),
  ];
};

/**
 * Validadores para criação de Avaliações
 *
 * @returns {Array} Array de validações do express-validator
 */
const evaluationValidationRules = () => {
  return [
    body('class_id')
      .notEmpty()
      .withMessage('ID da turma é obrigatório')
      .isInt({ min: 1 })
      .withMessage('ID da turma inválido'),

    body('discipline_id')
      .notEmpty()
      .withMessage('ID da disciplina é obrigatório')
      .isInt({ min: 1 })
      .withMessage('ID da disciplina inválido'),

    body('name')
      .trim()
      .notEmpty()
      .withMessage('Nome da avaliação é obrigatório')
      .isLength({ min: 3, max: 255 })
      .withMessage('Nome da avaliação deve ter entre 3 e 255 caracteres'),

    body('date').notEmpty().withMessage('Data da avaliação é obrigatória').isISO8601().withMessage('Data inválida'),

    body('type')
      .notEmpty()
      .withMessage('Tipo de avaliação é obrigatório')
      .isIn(['grade', 'concept'])
      .withMessage('Tipo deve ser "grade" (nota) ou "concept" (conceito)'),

    body('weight')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('Peso deve estar entre 0 e 10'),
  ];
};

/**
 * Validadores para autenticação (login)
 *
 * @returns {Array} Array de validações do express-validator
 */
const loginValidationRules = () => {
  return [
    body('login').trim().notEmpty().withMessage('Login é obrigatório'),

    body('password').notEmpty().withMessage('Senha é obrigatória'),
  ];
};

/**
 * Validadores para alteração de senha
 *
 * @returns {Array} Array de validações do express-validator
 */
const changePasswordValidationRules = () => {
  return [
    body('current_password').notEmpty().withMessage('Senha atual é obrigatória'),

    body('new_password')
      .notEmpty()
      .withMessage('Nova senha é obrigatória')
      .isLength({ min: 6 })
      .withMessage('Nova senha deve ter no mínimo 6 caracteres')
      .custom(validateStrongPassword)
      .withMessage(
        'Senha deve ter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas e números',
      ),

    body('confirm_password')
      .notEmpty()
      .withMessage('Confirmação de senha é obrigatória')
      .custom((value, { req }) => value === req.body.new_password)
      .withMessage('Senhas não conferem'),
  ];
};

/**
 * Validadores para parâmetros de ID em rotas
 *
 * @returns {Array} Array de validações do express-validator
 */
const idParamValidationRules = () => {
  return [param('id').isInt({ min: 1 }).withMessage('ID inválido')];
};

/**
 * Validadores para paginação em queries
 *
 * @returns {Array} Array de validações do express-validator
 */
const paginationValidationRules = () => {
  return [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número maior que 0'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser entre 1 e 100'),

    query('sort')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Ordenação deve ser "asc" ou "desc"'),
  ];
};

module.exports = {
  handleValidationErrors,
  studentValidationRules,
  teacherValidationRules,
  courseValidationRules,
  disciplineValidationRules,
  enrollmentValidationRules,
  gradeValidationRules,
  evaluationValidationRules,
  loginValidationRules,
  changePasswordValidationRules,
  idParamValidationRules,
  paginationValidationRules,
};
