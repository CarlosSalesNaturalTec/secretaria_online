/**
 * Arquivo: frontend/src/utils/constants.ts
 * Descrição: Constantes globais da aplicação
 * Feature: feat-102 - Criar constants.ts (Ampliação de feat-003)
 * Criado em: 2025-10-24
 * Atualizado em: 2025-11-04
 */

// ============================================================================
// TIPOS E ENUMS
// ============================================================================

/**
 * Perfis de usuário do sistema
 * Define os três tipos de usuários com acesso ao sistema
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

/**
 * Type para UserRole - garante type-safety ao usar os perfis
 */
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Status possíveis de uma matrícula
 *
 * - PENDING: Matrícula criada, aguardando aprovação dos documentos obrigatórios
 * - ACTIVE: Todos os documentos aprovados, aluno pode utilizar o sistema normalmente
 * - CANCELLED: Matrícula cancelada por solicitação aprovada
 */
export const ENROLLMENT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
} as const;

export type EnrollmentStatus = (typeof ENROLLMENT_STATUS)[keyof typeof ENROLLMENT_STATUS];

/**
 * Status possíveis de um documento enviado
 *
 * - PENDING: Documento foi enviado, aguardando análise
 * - APPROVED: Documento foi analisado e aprovado
 * - REJECTED: Documento foi analisado e reprovado, necessário reenvio
 */
export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type DocumentStatus = (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];

/**
 * Status possíveis de uma solicitação de aluno
 *
 * - PENDING: Solicitação foi criada e está aguardando análise
 * - APPROVED: Solicitação foi analisada e aprovada
 * - REJECTED: Solicitação foi analisada e reprovada
 */
export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type RequestStatus = (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];

/**
 * Tipos de solicitações que alunos podem fazer
 */
export const REQUEST_TYPES = {
  CERTIFICATE: 'certificate',
  HISTORY: 'history',
  ATTESTATION: 'attestation',
  COMPLEMENTARY: 'complementary',
  TRANSFER: 'transfer',
  CANCELLATION: 'cancellation',
} as const;

export type RequestType = (typeof REQUEST_TYPES)[keyof typeof REQUEST_TYPES];

/**
 * Tipos de avaliação que professores podem criar
 */
export const EVALUATION_TYPE = {
  GRADE: 'grade',
  CONCEPT: 'concept',
} as const;

export type EvaluationType = (typeof EVALUATION_TYPE)[keyof typeof EVALUATION_TYPE];

// ============================================================================
// ROTAS DA API
// ============================================================================

/**
 * Mapeamento de rotas da API
 * Centraliza todos os endpoints para fácil manutenção e refatoração
 */
export const API_ROUTES = {
  // Autenticação
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH_TOKEN: '/api/v1/auth/refresh-token',
    CHANGE_PASSWORD: '/api/v1/auth/change-password',
  },

  // Usuários (Admin only)
  USERS: {
    LIST: '/api/v1/users',
    GET: (id: string | number) => `/api/v1/users/${id}`,
    CREATE: '/api/v1/users',
    UPDATE: (id: string | number) => `/api/v1/users/${id}`,
    DELETE: (id: string | number) => `/api/v1/users/${id}`,
    RESET_PASSWORD: (id: string | number) => `/api/v1/users/${id}/reset-password`,
  },

  // Alunos
  STUDENTS: {
    LIST: '/api/v1/students',
    GET: (id: string | number) => `/api/v1/students/${id}`,
    CREATE: '/api/v1/students',
    UPDATE: (id: string | number) => `/api/v1/students/${id}`,
    DELETE: (id: string | number) => `/api/v1/students/${id}`,
    RESET_PASSWORD: (id: string | number) => `/api/v1/students/${id}/reset-password`,
  },

  // Professores
  TEACHERS: {
    LIST: '/api/v1/teachers',
    GET: (id: string | number) => `/api/v1/teachers/${id}`,
    CREATE: '/api/v1/teachers',
    UPDATE: (id: string | number) => `/api/v1/teachers/${id}`,
    DELETE: (id: string | number) => `/api/v1/teachers/${id}`,
  },

  // Cursos
  COURSES: {
    LIST: '/api/v1/courses',
    GET: (id: string | number) => `/api/v1/courses/${id}`,
    CREATE: '/api/v1/courses',
    UPDATE: (id: string | number) => `/api/v1/courses/${id}`,
    DELETE: (id: string | number) => `/api/v1/courses/${id}`,
  },

  // Disciplinas
  DISCIPLINES: {
    LIST: '/api/v1/disciplines',
    GET: (id: string | number) => `/api/v1/disciplines/${id}`,
    CREATE: '/api/v1/disciplines',
    UPDATE: (id: string | number) => `/api/v1/disciplines/${id}`,
    DELETE: (id: string | number) => `/api/v1/disciplines/${id}`,
  },

  // Turmas
  CLASSES: {
    LIST: '/api/v1/classes',
    GET: (id: string | number) => `/api/v1/classes/${id}`,
    CREATE: '/api/v1/classes',
    UPDATE: (id: string | number) => `/api/v1/classes/${id}`,
    DELETE: (id: string | number) => `/api/v1/classes/${id}`,
  },

  // Matrículas
  ENROLLMENTS: {
    LIST: '/api/v1/enrollments',
    GET: (id: string | number) => `/api/v1/enrollments/${id}`,
    CREATE: '/api/v1/enrollments',
    UPDATE_STATUS: (id: string | number) => `/api/v1/enrollments/${id}/status`,
    DELETE: (id: string | number) => `/api/v1/enrollments/${id}`,
  },

  // Documentos
  DOCUMENTS: {
    LIST: '/api/v1/documents',
    GET: (id: string | number) => `/api/v1/documents/${id}`,
    UPLOAD: '/api/v1/documents',
    APPROVE: (id: string | number) => `/api/v1/documents/${id}/approve`,
    REJECT: (id: string | number) => `/api/v1/documents/${id}/reject`,
    DELETE: (id: string | number) => `/api/v1/documents/${id}`,
  },

  // Contratos
  CONTRACTS: {
    LIST: '/api/v1/contracts',
    GET: (id: string | number) => `/api/v1/contracts/${id}`,
    ACCEPT: (id: string | number) => `/api/v1/contracts/${id}/accept`,
    GET_PDF: (id: string | number) => `/api/v1/contracts/${id}/pdf`,
  },

  // Avaliações
  EVALUATIONS: {
    LIST: '/api/v1/evaluations',
    GET: (id: string | number) => `/api/v1/evaluations/${id}`,
    CREATE: '/api/v1/evaluations',
    UPDATE: (id: string | number) => `/api/v1/evaluations/${id}`,
    DELETE: (id: string | number) => `/api/v1/evaluations/${id}`,
  },

  // Notas e Grades
  GRADES: {
    LIST: '/api/v1/grades',
    GET_BY_CLASS: (classId: string | number) => `/api/v1/classes/${classId}/grades`,
    GET: (id: string | number) => `/api/v1/grades/${id}`,
    CREATE: '/api/v1/grades',
    UPDATE: (id: string | number) => `/api/v1/grades/${id}`,
    DELETE: (id: string | number) => `/api/v1/grades/${id}`,
  },

  // Solicitações
  REQUESTS: {
    LIST: '/api/v1/requests',
    GET: (id: string | number) => `/api/v1/requests/${id}`,
    CREATE: '/api/v1/requests',
    APPROVE: (id: string | number) => `/api/v1/requests/${id}/approve`,
    REJECT: (id: string | number) => `/api/v1/requests/${id}/reject`,
  },
} as const;

// ============================================================================
// CONFIGURAÇÕES DA APLICAÇÃO
// ============================================================================

/**
 * Configurações gerais da aplicação
 */
export const APP_CONFIG = {
  // Limites de arquivo
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB em bytes
  ALLOWED_FILE_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  ALLOWED_FILE_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png'],

  // Paginação
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Timeouts
  API_TIMEOUT: 30000, // 30 segundos

  // Local Storage keys
  LOCAL_STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'user',
    THEME: 'theme',
  },
} as const;

// Manter compatibilidade com código antigo
export const MAX_FILE_SIZE = APP_CONFIG.MAX_FILE_SIZE;
export const ALLOWED_FILE_TYPES = APP_CONFIG.ALLOWED_FILE_TYPES;

// ============================================================================
// LABELS PARA EXIBIÇÃO NA UI
// ============================================================================

/**
 * Textos e labels para exibição na UI
 * Facilita tradução e manutenção de labels usados em componentes
 */
export const UI_LABELS = {
  // Perfis de usuário
  ROLES: {
    [USER_ROLES.ADMIN]: 'Administrador',
    [USER_ROLES.TEACHER]: 'Professor',
    [USER_ROLES.STUDENT]: 'Aluno',
  },

  // Status de matrícula
  ENROLLMENT_STATUS_LABELS: {
    [ENROLLMENT_STATUS.PENDING]: 'Aguardando Confirmação',
    [ENROLLMENT_STATUS.ACTIVE]: 'Ativa',
    [ENROLLMENT_STATUS.CANCELLED]: 'Cancelada',
  },

  // Status de documentos
  DOCUMENT_STATUS_LABELS: {
    [DOCUMENT_STATUS.PENDING]: 'Pendente',
    [DOCUMENT_STATUS.APPROVED]: 'Aprovado',
    [DOCUMENT_STATUS.REJECTED]: 'Rejeitado',
  },

  // Status de solicitações
  REQUEST_STATUS_LABELS: {
    [REQUEST_STATUS.PENDING]: 'Pendente',
    [REQUEST_STATUS.APPROVED]: 'Aprovada',
    [REQUEST_STATUS.REJECTED]: 'Rejeitada',
  },

  // Tipos de solicitações
  REQUEST_TYPE_LABELS: {
    [REQUEST_TYPES.CERTIFICATE]: 'Certificado',
    [REQUEST_TYPES.HISTORY]: 'Histórico Escolar',
    [REQUEST_TYPES.ATTESTATION]: 'Atestado',
    [REQUEST_TYPES.COMPLEMENTARY]: 'Atividades Complementares',
    [REQUEST_TYPES.TRANSFER]: 'Transferência',
    [REQUEST_TYPES.CANCELLATION]: 'Cancelamento de Matrícula',
  },

  // Tipos de avaliação
  EVALUATION_TYPE_LABELS: {
    [EVALUATION_TYPE.GRADE]: 'Nota (0-10)',
    [EVALUATION_TYPE.CONCEPT]: 'Conceito',
  },
} as const;

// ============================================================================
// MENSAGENS
// ============================================================================

/**
 * Mensagens de erro comuns
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Você não está autenticado. Por favor, realize login.',
  FORBIDDEN: 'Você não tem permissão para acessar este recurso.',
  NOT_FOUND: 'O recurso solicitado não foi encontrado.',
  VALIDATION_ERROR: 'Erro na validação dos dados. Verifique os campos.',
  SERVER_ERROR: 'Erro ao processar sua requisição. Tente novamente mais tarde.',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet e tente novamente.',
  FILE_TOO_LARGE: `Arquivo muito grande. Tamanho máximo: ${APP_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
  INVALID_FILE_TYPE: 'Tipo de arquivo não suportado.',
  INVALID_CPF: 'CPF inválido.',
  INVALID_EMAIL: 'Email inválido.',
  PASSWORD_MISMATCH: 'As senhas não coincidem.',
  WEAK_PASSWORD: 'A senha deve ter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas e números.',
  REQUIRED_FIELD: 'Este campo é obrigatório.',
} as const;

/**
 * Mensagens de sucesso comuns
 */
export const SUCCESS_MESSAGES = {
  CREATED: 'Registro criado com sucesso.',
  UPDATED: 'Registro atualizado com sucesso.',
  DELETED: 'Registro excluído com sucesso.',
  SAVED: 'Dados salvos com sucesso.',
  UPLOADED: 'Arquivo enviado com sucesso.',
  APPROVED: 'Aprovado com sucesso.',
  REJECTED: 'Rejeitado com sucesso.',
  LOGIN_SUCCESS: 'Login realizado com sucesso.',
  LOGOUT_SUCCESS: 'Você foi desconectado.',
  PASSWORD_CHANGED: 'Senha alterada com sucesso.',
} as const;
