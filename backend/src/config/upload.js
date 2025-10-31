/**
 * Arquivo: src/config/upload.js
 * Descrição: Configuração do Multer para upload de arquivos
 * Feature: feat-041 - Configurar Multer para upload de arquivos
 * Criado em: 2025-10-30
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Tipos de arquivo permitidos para upload
 * Formatos aceitos: PDF, JPG, PNG
 */
const ALLOWED_MIMETYPES = ['application/pdf', 'image/jpeg', 'image/png'];

/**
 * Extensões permitidas para upload
 */
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

/**
 * Tamanho máximo de arquivo (10MB em bytes)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Diretório base para armazenamento de uploads
 */
const UPLOAD_BASE_PATH = path.join(__dirname, '../../uploads');

/**
 * Diretório de documentos de usuários (alunos e professores)
 */
const DOCUMENTS_PATH = path.join(UPLOAD_BASE_PATH, 'documents');

/**
 * Configuração de storage do Multer
 * Define como e onde os arquivos serão salvos
 */
const storage = multer.diskStorage({
  /**
   * Define o diretório de destino dos arquivos
   * Estrutura: uploads/documents/[userId]/[timestamp]-[filename]
   *
   * @param {Object} req - Objeto da requisição Express
   * @param {Object} file - Informações do arquivo
   * @param {Function} cb - Callback para definir o diretório
   */
  destination: (req, file, cb) => {
    // Criar diretório de documentos se não existir
    if (!fs.existsSync(DOCUMENTS_PATH)) {
      fs.mkdirSync(DOCUMENTS_PATH, { recursive: true });
    }

    // Usar ID do usuário autenticado para organizar uploads
    const userId = req.user ? req.user.id : 'unknown';
    const userUploadDir = path.join(DOCUMENTS_PATH, String(userId));

    // Criar diretório específico do usuário se não existir
    if (!fs.existsSync(userUploadDir)) {
      fs.mkdirSync(userUploadDir, { recursive: true });
    }

    cb(null, userUploadDir);
  },

  /**
   * Define o nome do arquivo salvo no servidor
   * Formato: [timestamp]-[nome original]
   * Exemplo: 1698700200000-document.pdf
   *
   * @param {Object} req - Objeto da requisição Express
   * @param {Object} file - Informações do arquivo
   * @param {Function} cb - Callback para definir o nome do arquivo
   */
  filename: (req, file, cb) => {
    // Preservar extensão do arquivo original
    const ext = path.extname(file.originalname);
    // Gerar timestamp para criar nome único
    const timestamp = Date.now();
    // Sanitizar nome do arquivo removendo caracteres perigosos
    const baseFileName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .substring(0, 50);

    const filename = `${timestamp}-${baseFileName}${ext}`;
    cb(null, filename);
  },
});

/**
 * Função para validar arquivos
 * Verifica:
 * - MIME type permitido
 * - Extensão permitida
 * - Tamanho máximo
 *
 * @param {Object} file - Informações do arquivo
 * @param {Function} cb - Callback para aceitar ou rejeitar arquivo
 * @returns {void}
 */
const fileFilter = (req, file, cb) => {
  // Validar MIME type
  if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
    return cb(
      new Error(
        `Tipo de arquivo não permitido: ${file.mimetype}. Tipos aceitos: PDF, JPG, PNG`
      ),
      false
    );
  }

  // Validar extensão
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new Error(
        `Extensão não permitida: ${ext}. Extensões aceitas: ${ALLOWED_EXTENSIONS.join(', ')}`
      ),
      false
    );
  }

  // Se passou em todas validações, aceitar arquivo
  cb(null, true);
};

/**
 * Configuração do Multer para upload de documentos
 *
 * @type {Object}
 * @property {Object} storage - Configuração de armazenamento de disco
 * @property {Function} fileFilter - Função para validar arquivos
 * @property {number} limits.fileSize - Tamanho máximo de arquivo (10MB)
 * @property {number} limits.files - Número máximo de arquivos por requisição (5)
 */
const uploadConfig = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // Máximo 5 arquivos por upload
  },
});

/**
 * Validações constantes para documentos
 *
 * @type {Object}
 */
const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIMETYPES,
  DOCUMENTS_PATH,
  UPLOAD_BASE_PATH,
  MAX_FILES_PER_REQUEST: 5,
};

/**
 * Exporta configuração do Multer e constantes
 * Uso em middlewares: multer(uploadConfig).single('document')
 */
module.exports = {
  uploadConfig,
  UPLOAD_CONSTANTS,
  storage,
  fileFilter,
};
