/**
 * Arquivo: frontend/src/components/ui/FileUpload.tsx
 * Descrição: Componente de upload de arquivos com drag-and-drop, preview, validação e progress bar
 * Feature: feat-070 - Criar componente FileUpload
 * Criado em: 2025-11-03
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image as ImageIcon, AlertCircle, Loader2, Check } from 'lucide-react';

/**
 * Tipos de arquivo aceitos
 */
const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

/**
 * Tamanho máximo de arquivo (10MB em bytes)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Interface para arquivo com metadados adicionais
 */
interface FileWithPreview extends File {
  preview?: string;
}

/**
 * Status do upload
 */
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

/**
 * Props do componente FileUpload
 */
interface FileUploadProps {
  /**
   * Label do campo de upload
   */
  label?: string;

  /**
   * Texto de ajuda exibido abaixo do dropzone
   */
  helperText?: string;

  /**
   * Mensagem de erro
   */
  error?: string;

  /**
   * Se true, permite upload de múltiplos arquivos
   * @default false
   */
  multiple?: boolean;

  /**
   * Se true, marca o campo como obrigatório
   * @default false
   */
  required?: boolean;

  /**
   * Callback executado quando arquivos são selecionados/validados
   * Recebe array de File objects
   */
  onFilesSelected?: (files: File[]) => void;

  /**
   * Callback para realizar o upload (deve retornar Promise)
   * Recebe o arquivo e retorna Promise que resolve quando upload completa
   */
  onUpload?: (file: File) => Promise<void>;

  /**
   * Valor inicial (arquivo já existente)
   * Útil para edição de formulários
   */
  initialFile?: File | null;

  /**
   * Se true, desabilita o upload
   * @default false
   */
  disabled?: boolean;

  /**
   * Classes CSS adicionais
   */
  className?: string;
}

/**
 * Valida tipo de arquivo
 *
 * @param file - Arquivo a ser validado
 * @returns true se o tipo é válido
 */
const validateFileType = (file: File): boolean => {
  const acceptedTypes = Object.keys(ACCEPTED_FILE_TYPES);
  return acceptedTypes.includes(file.type);
};

/**
 * Valida tamanho de arquivo
 *
 * @param file - Arquivo a ser validado
 * @returns true se o tamanho é válido
 */
const validateFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE;
};

/**
 * Formata bytes para formato legível
 *
 * @param bytes - Tamanho em bytes
 * @returns String formatada (ex: "2.5 MB")
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Obtém ícone apropriado para o tipo de arquivo
 *
 * @param file - Arquivo
 * @returns Componente de ícone
 */
const getFileIcon = (file: File) => {
  if (file.type.startsWith('image/')) {
    return <ImageIcon size={24} className="text-blue-600" aria-hidden="true" />;
  }
  if (file.type === 'application/pdf') {
    return <FileText size={24} className="text-red-600" aria-hidden="true" />;
  }
  return <FileText size={24} className="text-gray-600" aria-hidden="true" />;
};

/**
 * Componente FileUpload
 *
 * Componente de upload de arquivos com drag-and-drop, preview, validação de tipo/tamanho
 * e progress bar durante upload.
 *
 * Responsabilidades:
 * - Permitir seleção de arquivos via clique ou drag-and-drop
 * - Validar tipo de arquivo (PDF, JPG, PNG)
 * - Validar tamanho máximo (10MB)
 * - Exibir preview de imagens
 * - Mostrar progresso de upload
 * - Exibir mensagens de erro claras
 * - Permitir remoção de arquivo selecionado
 * - Garantir acessibilidade
 *
 * @example
 * // Upload simples
 * <FileUpload
 *   label="Documento de identificação"
 *   helperText="Formatos aceitos: PDF, JPG, PNG (máx. 10MB)"
 *   onFilesSelected={(files) => console.log(files)}
 *   required
 * />
 *
 * @example
 * // Upload com callback de upload
 * <FileUpload
 *   label="Enviar documento"
 *   onUpload={async (file) => {
 *     const formData = new FormData();
 *     formData.append('document', file);
 *     await api.post('/documents', formData);
 *   }}
 * />
 *
 * @example
 * // Upload múltiplo
 * <FileUpload
 *   multiple
 *   label="Enviar documentos"
 *   onFilesSelected={(files) => setDocuments(files)}
 * />
 */
export function FileUpload({
  label,
  helperText = 'Formatos aceitos: PDF, JPG, PNG (máx. 10MB)',
  error,
  multiple = false,
  required = false,
  onFilesSelected,
  onUpload,
  initialFile = null,
  disabled = false,
  className = '',
}: FileUploadProps) {
  // Estado
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>(
    initialFile ? [initialFile] : []
  );
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Ref para o input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Valida um arquivo
   *
   * @param file - Arquivo a validar
   * @returns Mensagem de erro ou null se válido
   */
  const validateFile = useCallback((file: File): string | null => {
    if (!validateFileType(file)) {
      return 'Tipo de arquivo não permitido. Use PDF, JPG ou PNG.';
    }

    if (!validateFileSize(file)) {
      return `Arquivo muito grande. Tamanho máximo: ${formatFileSize(MAX_FILE_SIZE)}.`;
    }

    return null;
  }, []);

  /**
   * Processa arquivos selecionados
   *
   * @param files - Lista de arquivos
   */
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setValidationError(null);

      const fileArray = Array.from(files);

      // Valida cada arquivo
      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          setValidationError(error);
          return;
        }
      }

      // Se multiple é false, pega apenas o primeiro arquivo
      const filesToProcess = multiple ? fileArray : [fileArray[0]];

      // Cria preview para imagens
      const filesWithPreview = filesToProcess.map((file) => {
        if (file.type.startsWith('image/')) {
          const preview = URL.createObjectURL(file);
          return Object.assign(file, { preview });
        }
        return file;
      });

      setSelectedFiles(filesWithPreview);

      // Callback
      if (onFilesSelected) {
        onFilesSelected(filesToProcess);
      }

      // Se há callback de upload, inicia automaticamente
      if (onUpload && filesToProcess.length > 0) {
        handleUpload(filesToProcess[0]);
      }
    },
    [multiple, validateFile, onFilesSelected, onUpload]
  );

  /**
   * Realiza o upload de um arquivo
   *
   * @param file - Arquivo a ser enviado
   */
  const handleUpload = async (file: File) => {
    if (!onUpload) return;

    try {
      setUploadStatus('uploading');
      setUploadProgress(0);

      // Simula progresso (em implementação real, isso viria do Axios onUploadProgress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      await onUpload(file);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
    } catch (error) {
      console.error('[FileUpload] Erro ao fazer upload:', error);
      setUploadStatus('error');
      setValidationError('Erro ao enviar arquivo. Tente novamente.');
    }
  };

  /**
   * Remove arquivo selecionado
   */
  const handleRemoveFile = useCallback(
    (index: number) => {
      setSelectedFiles((prev) => {
        // Revoga URL de preview se existir
        const file = prev[index] as FileWithPreview;
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }

        const newFiles = prev.filter((_, i) => i !== index);

        // Callback
        if (onFilesSelected) {
          onFilesSelected(newFiles);
        }

        return newFiles;
      });

      setUploadStatus('idle');
      setUploadProgress(0);
      setValidationError(null);

      // Reseta input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onFilesSelected]
  );

  /**
   * Handler para clique no dropzone
   */
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  /**
   * Handler para drag over
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  /**
   * Handler para drag leave
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  /**
   * Handler para drop
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (!disabled) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [disabled, handleFiles]
  );

  /**
   * Handler para mudança do input
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  // Classes do dropzone baseadas no estado
  const dropzoneClasses = [
    'relative border-2 border-dashed rounded-lg p-8',
    'transition-all duration-200 cursor-pointer',
    isDragging
      ? 'border-blue-500 bg-blue-50'
      : validationError || error
      ? 'border-red-300 bg-red-50'
      : 'border-gray-300 hover:border-gray-400 bg-gray-50',
    disabled ? 'cursor-not-allowed opacity-60' : '',
  ].join(' ');

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="obrigatório">*</span>}
        </label>
      )}

      {/* Dropzone ou Preview */}
      {selectedFiles.length === 0 ? (
        <div
          className={dropzoneClasses}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Área de upload de arquivo"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
        >
          {/* Ícone e texto */}
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="p-3 bg-white rounded-full">
              <Upload
                size={32}
                className={isDragging ? 'text-blue-600' : 'text-gray-400'}
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">
                {isDragging ? 'Solte o arquivo aqui' : 'Clique para selecionar ou arraste o arquivo'}
              </p>
              <p className="text-xs text-gray-500 mt-1">{helperText}</p>
            </div>
          </div>

          {/* Input oculto */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple={multiple}
            accept={Object.values(ACCEPTED_FILE_TYPES).flat().join(',')}
            onChange={handleInputChange}
            disabled={disabled}
            aria-hidden="true"
          />
        </div>
      ) : (
        /* Preview de arquivos selecionados */
        <div className="space-y-3">
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="flex items-start gap-3">
                {/* Preview de imagem ou ícone */}
                <div className="flex-shrink-0">
                  {file.type.startsWith('image/') && (file as FileWithPreview).preview ? (
                    <img
                      src={(file as FileWithPreview).preview}
                      alt={file.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded">
                      {getFileIcon(file)}
                    </div>
                  )}
                </div>

                {/* Info do arquivo */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatFileSize(file.size)}</p>

                  {/* Progress bar */}
                  {uploadStatus === 'uploading' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                          role="progressbar"
                          aria-valuenow={uploadProgress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Enviando... {uploadProgress}%</p>
                    </div>
                  )}

                  {/* Status de sucesso */}
                  {uploadStatus === 'success' && (
                    <div className="flex items-center gap-1 mt-2 text-green-600">
                      <Check size={14} aria-hidden="true" />
                      <span className="text-xs">Enviado com sucesso</span>
                    </div>
                  )}
                </div>

                {/* Botão de remover ou loading */}
                <div className="flex-shrink-0">
                  {uploadStatus === 'uploading' ? (
                    <Loader2 size={20} className="animate-spin text-blue-600" aria-hidden="true" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      aria-label="Remover arquivo"
                      disabled={disabled}
                    >
                      <X size={20} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensagem de erro de validação */}
      {validationError && (
        <div className="mt-2 flex items-center gap-1 text-sm text-red-600" role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Mensagem de erro externa */}
      {error && !validationError && (
        <div className="mt-2 flex items-center gap-1 text-sm text-red-600" role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
