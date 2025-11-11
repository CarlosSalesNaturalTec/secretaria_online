/**
 * Arquivo: backend/src/utils/constants.js
 * Descrição: Constantes e enums centralizados da aplicação
 * Feature: feat-028 - Criar utilitários de formatação e constantes
 * Criado em: 2025-10-28
 */

/**
 * Roles/Perfis de usuários do sistema
 */
const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

/**
 * Status possíveis de uma matrícula
 */
const ENROLLMENT_STATUS = {
  PENDING: 'pending',           // Aguardando confirmação (documentos não aprovados)
  ACTIVE: 'active',             // Ativa (todos documentos aprovados)
  CANCELLED: 'cancelled',       // Cancelada
};

/**
 * Status possíveis de um documento enviado
 */
const DOCUMENT_STATUS = {
  PENDING: 'pending',           // Aguardando aprovação
  APPROVED: 'approved',         // Aprovado
  REJECTED: 'rejected',         // Rejeitado
};

/**
 * Status possíveis de uma solicitação
 */
const REQUEST_STATUS = {
  PENDING: 'pending',           // Pendente de análise
  APPROVED: 'approved',         // Aprovada
  REJECTED: 'rejected',         // Rejeitada
};

/**
 * Tipos de avaliação
 */
const EVALUATION_TYPES = {
  GRADE: 'grade',               // Nota de 0 a 10
  CONCEPT: 'concept',           // Conceito (Satisfatório/Não Satisfatório)
};

/**
 * Conceitos possíveis para avaliações conceituais
 */
const EVALUATION_CONCEPTS = {
  SATISFACTORY: 'satisfactory',
  UNSATISFACTORY: 'unsatisfactory',
};

/**
 * Tipos de solicitação disponíveis para alunos
 */
const REQUEST_TYPES = {
  CERTIFICATE: 'certificate',                         // Atestado
  SCHOOL_RECORD: 'school_record',                     // Histórico escolar
  DIPLOMA: 'diploma',                                 // Certificado/Diploma
  COMPLEMENTARY_ACTIVITIES: 'complementary_activities', // Atividades complementares
  TRANSFER: 'transfer',                               // Transferência
  ENROLLMENT_CANCELLATION: 'enrollment_cancellation',  // Cancelamento de matrícula
};

/**
 * Tipos de documento obrigatório
 */
const DOCUMENT_TARGET_TYPES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  BOTH: 'both',
};

/**
 * Formatos de arquivo aceitos para upload
 */
const ALLOWED_FILE_TYPES = {
  DOCUMENTS: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png'],
  PDF: ['application/pdf'],
};

/**
 * Extensões de arquivo aceitas
 */
const ALLOWED_FILE_EXTENSIONS = {
  DOCUMENTS: ['.pdf', '.jpg', '.jpeg', '.png'],
  IMAGES: ['.jpg', '.jpeg', '.png'],
  PDF: ['.pdf'],
};

/**
 * Tamanho máximo de arquivo (em bytes)
 */
const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,        // 10MB
  MAX_FILE_SIZE_MB: 10,                    // 10MB (para exibição)
};

/**
 * Configurações de paginação
 */
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

/**
 * Configurações de JWT
 */
const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRATION: '15m',
  REFRESH_TOKEN_EXPIRATION: '7d',
};

/**
 * Configurações de senha
 */
const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  BCRYPT_SALT_ROUNDS: 10,
  PROVISIONAL_PASSWORD_LENGTH: 8,
};

/**
 * Regex patterns para validação
 */
const REGEX_PATTERNS = {
  // CPF: 000.000.000-00 ou 00000000000
  CPF: /^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})$/,

  // CPF apenas números
  CPF_NUMBERS_ONLY: /^\d{11}$/,

  // Email
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Telefone: (00) 00000-0000 ou (00) 0000-0000
  PHONE: /^\(?(\d{2})\)?[\s-]?(\d{4,5})[\s-]?(\d{4})$/,

  // CEP: 00000-000 ou 00000000
  CEP: /^(\d{5})-?(\d{3})$/,

  // Data no formato DD/MM/YYYY
  DATE_BR: /^(\d{2})\/(\d{2})\/(\d{4})$/,

  // Apenas letras e espaços (para nomes)
  LETTERS_AND_SPACES: /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/,

  // Código de disciplina (letras e números)
  DISCIPLINE_CODE: /^[A-Z0-9]{3,10}$/,
};

/**
 * Mensagens de erro padronizadas
 */
const ERROR_MESSAGES = {
  // Autenticação
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  UNAUTHORIZED: 'Não autorizado',
  FORBIDDEN: 'Acesso negado',
  TOKEN_EXPIRED: 'Token expirado',
  TOKEN_INVALID: 'Token inválido',

  // Validação
  REQUIRED_FIELD: 'Campo obrigatório',
  INVALID_FORMAT: 'Formato inválido',
  INVALID_CPF: 'CPF inválido',
  INVALID_EMAIL: 'Email inválido',
  INVALID_DATE: 'Data inválida',

  // Recursos
  NOT_FOUND: 'Recurso não encontrado',
  ALREADY_EXISTS: 'Recurso já existe',

  // Arquivo
  FILE_TOO_LARGE: 'Arquivo muito grande',
  INVALID_FILE_TYPE: 'Tipo de arquivo inválido',

  // Regras de negócio
  STUDENT_ALREADY_ENROLLED: 'Aluno já está matriculado em um curso',
  DOCUMENTS_NOT_APPROVED: 'Documentos obrigatórios não foram aprovados',
  ENROLLMENT_NOT_ACTIVE: 'Matrícula não está ativa',

  // Servidor
  INTERNAL_ERROR: 'Erro interno do servidor',
  DATABASE_ERROR: 'Erro ao acessar banco de dados',
};

/**
 * Mensagens de sucesso padronizadas
 */
const SUCCESS_MESSAGES = {
  CREATED: 'Criado com sucesso',
  UPDATED: 'Atualizado com sucesso',
  DELETED: 'Removido com sucesso',
  APPROVED: 'Aprovado com sucesso',
  REJECTED: 'Rejeitado com sucesso',
  PASSWORD_CHANGED: 'Senha alterada com sucesso',
  PASSWORD_RESET: 'Senha redefinida e enviada por email',
  DOCUMENT_UPLOADED: 'Documento enviado com sucesso',
  CONTRACT_ACCEPTED: 'Contrato aceito com sucesso',
};

/**
 * Níveis de log do Winston
 */
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  VERBOSE: 'verbose',
  DEBUG: 'debug',
  SILLY: 'silly',
};

/**
 * Configurações de ambiente
 */
const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
};

/**
 * Configurações de rate limiting
 */
const RATE_LIMIT_CONFIG = {
  LOGIN_WINDOW_MS: 15 * 60 * 1000,      // 15 minutos
  LOGIN_MAX_ATTEMPTS: 5,                 // 5 tentativas
  API_WINDOW_MS: 15 * 60 * 1000,        // 15 minutos
  API_MAX_REQUESTS: 100,                 // 100 requisições
};

/**
 * Tempo de retenção de dados (LGPD)
 */
const DATA_RETENTION = {
  YEARS: 5,
  DAYS: 365 * 5,
};

/**
 * Códigos HTTP personalizados para erros de negócio
 */
const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * Valida se um valor é um role válido
 *
 * @param {string} role - Role a ser validado
 * @returns {boolean} True se válido
 */
function isValidRole(role) {
  return Object.values(USER_ROLES).includes(role);
}

/**
 * Valida se um valor é um status de matrícula válido
 *
 * @param {string} status - Status a ser validado
 * @returns {boolean} True se válido
 */
function isValidEnrollmentStatus(status) {
  return Object.values(ENROLLMENT_STATUS).includes(status);
}

/**
 * Valida se um valor é um status de documento válido
 *
 * @param {string} status - Status a ser validado
 * @returns {boolean} True se válido
 */
function isValidDocumentStatus(status) {
  return Object.values(DOCUMENT_STATUS).includes(status);
}

/**
 * Valida se um valor é um tipo de avaliação válido
 *
 * @param {string} type - Tipo a ser validado
 * @returns {boolean} True se válido
 */
function isValidEvaluationType(type) {
  return Object.values(EVALUATION_TYPES).includes(type);
}

/**
 * Retorna array com todos os valores válidos de um enum
 *
 * @param {Object} enumObject - Objeto enum
 * @returns {Array} Array com valores válidos
 */
function getEnumValues(enumObject) {
  return Object.values(enumObject);
}

module.exports = {
  // Enums
  USER_ROLES,
  ENROLLMENT_STATUS,
  DOCUMENT_STATUS,
  REQUEST_STATUS,
  EVALUATION_TYPES,
  EVALUATION_CONCEPTS,
  REQUEST_TYPES,
  DOCUMENT_TARGET_TYPES,

  // Arquivos
  ALLOWED_FILE_TYPES,
  ALLOWED_FILE_EXTENSIONS,
  FILE_SIZE_LIMITS,

  // Paginação
  PAGINATION,

  // JWT e Senha
  JWT_CONFIG,
  PASSWORD_CONFIG,

  // Validação
  REGEX_PATTERNS,

  // Mensagens
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,

  // Logging
  LOG_LEVELS,

  // Ambiente
  ENVIRONMENTS,

  // Rate Limiting
  RATE_LIMIT_CONFIG,

  // LGPD
  DATA_RETENTION,

  // HTTP
  HTTP_STATUS_CODES,

  // Funções utilitárias
  isValidRole,
  isValidEnrollmentStatus,
  isValidDocumentStatus,
  isValidEvaluationType,
  getEnumValues,
};
