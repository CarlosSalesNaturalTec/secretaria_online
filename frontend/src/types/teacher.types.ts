/**
 * Arquivo: frontend/src/types/teacher.types.ts
 * Descrição: Tipos e interfaces específicas para professores
 * Feature: feat-101 - Criar types TypeScript
 * Feature: feat-110 - Separar tabela de professores
 * Criado em: 2025-11-04
 * Atualizado em: 2025-12-02
 */

/**
 * Interface para Professor (tabela teachers)
 *
 * Responsabilidades:
 * - Representar dados completos de professores da tabela teachers
 * - Pode ter um usuário associado (opcional)
 * - Armazena informações pessoais e acadêmicas
 *
 * @example
 * const teacher: ITeacher = {
 *   id: 1,
 *   nome: 'Maria Silva',
 *   cpf: '12345678901',
 *   email: 'maria@example.com',
 *   data_nascimento: '1980-05-20',
 *   sexo: 2,
 *   celular: '11999999999',
 *   user: {
 *     id: 5,
 *     login: 'maria.silva',
 *     email: 'maria@example.com',
 *     role: 'teacher'
 *   }
 * };
 */
export interface ITeacher {
  /** ID do professor */
  id: number;

  /** Nome completo do professor */
  nome: string | null;

  /** CPF do professor */
  cpf: string | null;

  /** Data de nascimento */
  data_nascimento: string | null;

  /** Telefone fixo */
  telefone: string | null;

  /** Celular */
  celular: string | null;

  /** Email do professor */
  email: string | null;

  /** Rua/Logradouro */
  endereco_rua: string | null;

  /** Número do endereço */
  endereco_numero: string | null;

  /** Complemento do endereço */
  endereco_complemento: string | null;

  /** Bairro */
  endereco_bairro: string | null;

  /** Cidade */
  endereco_cidade: string | null;

  /** UF (Estado) */
  endereco_uf: string | null;

  /** CEP */
  cep: string | null;

  /** Sexo: 1 = masculino, 2 = feminino */
  sexo: 1 | 2 | '1' | '2' | null;

  /** Nome da mãe */
  mae: string | null;

  /** Nome do pai */
  pai: string | null;

  /** Título de eleitor */
  titulo_eleitor: string | null;

  /** RG */
  rg: string | null;

  /** Data de expedição do RG */
  rg_data: string | null;

  /** Profissão/Formação */
  profissao: string | null;

  /** Matrícula */
  matricula: string | null;

  /** Caminho da foto do professor */
  foto: string | null;

  /** ID do usuário associado (se existir) */
  user_id: number | null;

  /** Data de criação */
  created_at?: string;

  /** Data de atualização */
  updated_at?: string;

  /** Data de exclusão (soft delete) */
  deleted_at?: string | null;

  /** Usuário associado (opcional) */
  user?: {
    id: number;
    login: string;
    email: string;
    role: 'teacher';
    created_at: string;
  };
}

/**
 * Dados para criar novo professor
 *
 * IMPORTANTE: Todos os campos são opcionais
 *
 * @example
 * const newTeacher: ITeacherCreateRequest = {
 *   cpf: '12345678901',
 *   nome: 'Dr. José Silva',
 *   email: 'jose@example.com',
 * };
 */
export interface ITeacherCreateRequest {
  /** CPF (opcional, pode ser null para limpar) */
  cpf?: string | null;

  /** Nome completo (opcional, pode ser null para limpar) */
  nome?: string | null;

  /** Email (opcional, pode ser null para limpar) */
  email?: string | null;

  /** Data de nascimento (opcional, pode ser null para limpar) */
  data_nascimento?: string | null;

  /** Telefone fixo (opcional, pode ser null para limpar) */
  telefone?: string | null;

  /** Celular (opcional, pode ser null para limpar) */
  celular?: string | null;

  /** Rua/Logradouro (opcional, pode ser null para limpar) */
  endereco_rua?: string | null;

  /** Número do endereço (opcional, pode ser null para limpar) */
  endereco_numero?: string | null;

  /** Complemento do endereço (opcional, pode ser null para limpar) */
  endereco_complemento?: string | null;

  /** Bairro (opcional, pode ser null para limpar) */
  endereco_bairro?: string | null;

  /** Cidade (opcional, pode ser null para limpar) */
  endereco_cidade?: string | null;

  /** UF (opcional, pode ser null para limpar) */
  endereco_uf?: string | null;

  /** CEP (opcional, pode ser null para limpar) */
  cep?: string | null;

  /** Sexo: 1 = masculino, 2 = feminino (opcional, pode ser null para limpar) */
  sexo?: 1 | 2 | null;

  /** Nome da mãe (opcional, pode ser null para limpar) */
  mae?: string | null;

  /** Nome do pai (opcional, pode ser null para limpar) */
  pai?: string | null;

  /** Título de eleitor (opcional, pode ser null para limpar) */
  titulo_eleitor?: string | null;

  /** RG (opcional, pode ser null para limpar) */
  rg?: string | null;

  /** Data de expedição do RG (opcional, pode ser null para limpar) */
  rg_data?: string | null;

  /** Profissão/Formação (opcional, pode ser null para limpar) */
  profissao?: string | null;

  /** Matrícula (opcional, pode ser null para limpar) */
  matricula?: string | null;

  /** Foto (opcional, pode ser null para limpar) */
  foto?: string | null;
}

/**
 * Dados para editar professor
 */
export interface ITeacherUpdateRequest extends Partial<ITeacherCreateRequest> {}

/**
 * Dados para criar usuário para um professor
 */
export interface ICreateUserForTeacherRequest {
  /** Login personalizado (opcional, padrão: CPF) */
  login?: string;
}

/**
 * Resposta ao criar usuário para professor
 */
export interface ICreateUserForTeacherResponse {
  /** Indica sucesso */
  success: boolean;

  /** Dados do resultado */
  data: {
    /** Usuário criado */
    user: {
      id: number;
      login: string;
      email: string;
      role: 'teacher';
      teacher_id: number;
    };

    /** Senha provisória gerada */
    temporaryPassword: string;
  };

  /** Mensagem de sucesso */
  message: string;
}

/**
 * Resposta ao listar professores
 */
export interface ITeacherListResponse {
  /** Indica sucesso da operação */
  success: boolean;

  /** Array de professores */
  data: ITeacher[];

  /** Informações de paginação (opcional) */
  pagination?: {
    /** Total de registros */
    total: number;

    /** Página atual */
    page: number;

    /** Limite de registros por página */
    limit: number;

    /** Total de páginas */
    pages: number;
  };
}

/**
 * Resposta ao consultar professor específico
 */
export interface ITeacherResponse {
  /** Indica sucesso da operação */
  success: boolean;

  /** Dados do professor */
  data: ITeacher;

  /** Mensagem de sucesso (opcional) */
  message?: string;
}

/**
 * Resposta ao resetar senha
 */
export interface ITeacherResetPasswordResponse {
  /** Indica sucesso */
  success: boolean;

  /** Dados do resultado */
  data: {
    /** Senha provisória gerada */
    temporaryPassword: string;
  };
}

/**
 * Filtros para busca de professores
 */
export interface ITeacherFilters {
  /** Buscar por nome */
  nome?: string;

  /** Buscar por email */
  email?: string;

  /** Buscar por CPF */
  cpf?: string;

  /** Página atual */
  page?: number;

  /** Limite de registros por página */
  limit?: number;

  /** Campo para ordenação */
  sortBy?: 'nome' | 'email' | 'created_at';

  /** Ordem de classificação */
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Estatísticas de professores (para admin)
 */
export interface ITeacherStats {
  /** Total de professores cadastrados */
  totalTeachers: number;

  /** Professores com usuários criados */
  activeTeachers: number;

  /** Professores sem usuários */
  withoutUser: number;
}
