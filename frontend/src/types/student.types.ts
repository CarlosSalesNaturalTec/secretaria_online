/**
 * Arquivo: frontend/src/types/student.types.ts
 * Descrição: Tipos e interfaces específicas para alunos
 * Feature: feat-101 - Criar types TypeScript
 * Feature: feat-064 - Separar tabela de estudantes
 * Criado em: 2025-11-04
 * Atualizado em: 2025-12-01
 */

/**
 * Interface para Estudante (tabela students)
 *
 * Responsabilidades:
 * - Representar dados completos de estudantes da tabela students
 * - Pode ter um usuário associado (opcional)
 * - Armazena informações acadêmicas e pessoais
 *
 * @example
 * const student: IStudent = {
 *   id: 1,
 *   nome: 'João Silva',
 *   cpf: '12345678901',
 *   email: 'joao@example.com',
 *   data_nascimento: '2000-01-15',
 *   sexo: 1,
 *   celular: '11999999999',
 *   user: {
 *     id: 5,
 *     login: 'joao.silva',
 *     email: 'joao@example.com',
 *     role: 'student'
 *   }
 * };
 */
export interface IStudent {
  /** ID do estudante */
  id: number;

  /** Nome completo do estudante */
  nome: string | null;

  /** CPF do estudante */
  cpf: string | null;

  /** Data de nascimento */
  data_nascimento: string | null;

  /** Telefone fixo */
  telefone: string | null;

  /** Email do estudante */
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
  sexo: 1 | 2 | null;

  /** Celular */
  celular: string | null;

  /** Categoria do estudante */
  categoria: number | null;

  /** Sub-categoria do estudante */
  sub_categoria: number | null;

  /** Número de matrícula */
  matricula: number | null;

  /** Ano da matrícula */
  ano_matricula: number | null;

  /** Profissão do estudante */
  profissao: string | null;

  /** Responsável legal (se menor de idade) */
  responsavel: string | null;

  /** Referência ao contrato */
  contrato: string | null;

  /** Caminho da foto do estudante */
  foto: string | null;

  /** Nome da mãe */
  mae: string | null;

  /** Nome do pai */
  pai: string | null;

  /** Título de eleitor */
  titulo_eleitor: string | null;

  /** RG */
  rg: string | null;

  /** Data de emissão do RG */
  rg_data: string | null;

  /** Série/Período */
  serie: string | null;

  /** Curso */
  curso: string | null;

  /** Semestre atual */
  semestre: string | null;

  /** Contrato aceito: S/N */
  contrato_aceito: string | null;

  /** Dia de aceite do contrato */
  contrato_dia: string | null;

  /** Mês de aceite do contrato */
  contrato_mes: string | null;

  /** Ano de aceite do contrato */
  contrato_ano: number | null;

  /** Chave eletrônica de acesso */
  chave_eletronica: string | null;

  /** Data geral de cadastro */
  data_geral: string | null;

  /** Data de criação do registro */
  created_at: string;

  /** Data de atualização do registro */
  updated_at: string;

  /** Data de exclusão (soft delete) */
  deleted_at: string | null;

  /** Usuário associado (opcional) */
  user?: IStudentUser | null;

  /** Matrículas do aluno */
  enrollments?: IEnrollmentBasic[];

  /** Documentos enviados pelo aluno */
  documents?: IStudentDocument[];

  /** Notas do aluno */
  grades?: IStudentGrade[];
}

/**
 * Dados básicos do usuário associado a um estudante
 */
export interface IStudentUser {
  /** ID do usuário */
  id: number;

  /** Login de acesso */
  login: string;

  /** Email do usuário */
  email: string;

  /** Role do usuário */
  role: 'student';

  /** Data de criação do usuário */
  created_at: string;
}

/**
 * Dados básicos de matrícula para uso em contexto de aluno
 */
export interface IEnrollmentBasic {
  /** ID da matrícula */
  id: number;

  /** ID do aluno */
  studentId: number;

  /** ID do curso */
  courseId: number;

  /** Status da matrícula */
  status: 'pending' | 'active' | 'cancelled';

  /** Data da matrícula */
  enrollmentDate: string;
}

/**
 * Documento associado a um aluno
 */
export interface IStudentDocument {
  /** ID do documento */
  id: number;

  /** ID do aluno */
  userId: number;

  /** Tipo de documento */
  documentTypeId: number;

  /** Caminho do arquivo */
  filePath: string;

  /** Status do documento */
  status: 'pending' | 'approved' | 'rejected';

  /** Data de upload */
  createdAt: string;
}

/**
 * Nota associada a um aluno
 */
export interface IStudentGrade {
  /** ID da nota */
  id: number;

  /** ID do aluno */
  studentId: number;

  /** Valor da nota (0-10) ou conceito */
  grade: number | null;

  /** Conceito da avaliação */
  concept: 'satisfactory' | 'unsatisfactory' | null;

  /** Data da nota */
  createdAt: string;
}

/**
 * Dados para criar novo estudante
 *
 * @example
 * const newStudent: IStudentCreateRequest = {
 *   nome: 'João Silva',
 *   email: 'joao@example.com',
 *   cpf: '12345678901',
 *   data_nascimento: '2000-01-15',
 *   sexo: 1,
 *   celular: '11999999999'
 * };
 */
export interface IStudentCreateRequest {
  /** Nome completo */
  nome?: string;

  /** Email */
  email?: string;

  /** CPF com validação */
  cpf?: string;

  /** Data de nascimento */
  data_nascimento?: string;

  /** Telefone fixo */
  telefone?: string;

  /** Rua/Logradouro */
  endereco_rua?: string;

  /** Número do endereço */
  endereco_numero?: string;

  /** Complemento do endereço */
  endereco_complemento?: string;

  /** Bairro */
  endereco_bairro?: string;

  /** Cidade */
  endereco_cidade?: string;

  /** UF (Estado) */
  endereco_uf?: string;

  /** CEP */
  cep?: string;

  /** Sexo: 1 = masculino, 2 = feminino */
  sexo?: 1 | 2;

  /** Celular */
  celular?: string;

  /** Categoria */
  categoria?: number;

  /** Sub-categoria */
  sub_categoria?: number;

  /** Número de matrícula */
  matricula?: number;

  /** Ano da matrícula */
  ano_matricula?: number;

  /** Profissão */
  profissao?: string;

  /** Responsável legal */
  responsavel?: string;

  /** Referência ao contrato */
  contrato?: string;

  /** Nome da mãe */
  mae?: string;

  /** Nome do pai */
  pai?: string;

  /** Título de eleitor */
  titulo_eleitor?: string;

  /** RG */
  rg?: string;

  /** Data de emissão do RG */
  rg_data?: string;

  /** Série/Período */
  serie?: string;

  /** Curso */
  curso?: string;

  /** Semestre */
  semestre?: string;
}

/**
 * Dados para editar estudante
 */
export interface IStudentUpdateRequest extends Partial<IStudentCreateRequest> {}

/**
 * Dados para criar usuário para um estudante
 */
export interface ICreateUserForStudentRequest {
  /** Login personalizado (opcional, padrão: CPF) */
  login?: string;
}

/**
 * Resposta ao criar usuário para estudante
 */
export interface ICreateUserForStudentResponse {
  /** Indica sucesso da operação */
  success: boolean;

  /** Dados retornados */
  data: {
    /** Usuário criado */
    user: IStudentUser & {
      id: number;
      name: string;
      cpf: string;
      rg: string | null;
      voter_title: string | null;
      mother_name: string | null;
      father_name: string | null;
      address: string | null;
      student_id: number;
    };

    /** Senha provisória gerada */
    temporaryPassword: string;
  };

  /** Mensagem de sucesso */
  message: string;
}

/**
 * Resposta ao verificar se estudante possui usuário
 */
export interface ICheckUserResponse {
  /** Indica sucesso da operação */
  success: boolean;

  /** Dados retornados */
  data: {
    /** Se o estudante possui usuário */
    hasUser: boolean;

    /** Dados do usuário (se existir) */
    user: IStudentUser | null;
  };
}

/**
 * Resposta ao listar alunos
 */
export interface IStudentListResponse {
  /** Indica sucesso da operação */
  success: boolean;

  /** Array de alunos */
  data: IStudent[];

  /** Informações de paginação */
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
 * Resposta ao consultar aluno específico
 */
export interface IStudentResponse {
  /** Indica sucesso da operação */
  success: boolean;

  /** Dados do aluno */
  data: IStudent;

  /** Mensagem de sucesso (opcional) */
  message?: string;
}

/**
 * Filtros para busca de alunos
 */
export interface IStudentFilters {
  /** Buscar por nome */
  name?: string;

  /** Buscar por email */
  email?: string;

  /** Buscar por CPF */
  cpf?: string;

  /** Buscar por ID de curso */
  courseId?: number;

  /** Status de matrícula */
  enrollmentStatus?: 'pending' | 'active' | 'cancelled';

  /** Página atual */
  page?: number;

  /** Limite de registros por página */
  limit?: number;

  /** Campo para ordenação */
  sortBy?: 'name' | 'email' | 'createdAt';

  /** Ordem de classificação */
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Resumo do aluno para dashboard
 */
export interface IStudentDashboard {
  /** Dados do aluno */
  student: IStudent;

  /** Matrículas ativas */
  activeEnrollments: IEnrollmentBasic[];

  /** Documentos pendentes de aprovação */
  pendingDocuments: IStudentDocument[];

  /** Últimas notas recebidas */
  recentGrades: IStudentGrade[];

  /** Total de solicitações pendentes */
  pendingRequests: number;

  /** Data do primeiro acesso */
  firstAccessAt: string | null;

  /** Indica se precisa aceitar contrato */
  needsContractAcceptance: boolean;
}

/**
 * Estatísticas de alunos (para admin)
 */
export interface IStudentStats {
  /** Total de alunos cadastrados */
  totalStudents: number;

  /** Alunos com matrícula ativa */
  activeEnrollments: number;

  /** Alunos com documentos pendentes */
  pendingDocuments: number;

  /** Alunos que ainda não fizeram primeiro acesso */
  neverAccessed: number;
}
