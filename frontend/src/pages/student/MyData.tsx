/**
 * Arquivo: frontend/src/pages/student/MyData.tsx
 * Descrição: Página de visualização dos dados pessoais do estudante logado
 * Feature: Visualização de dados pessoais do estudante
 * Criado em: 2026-01-02
 *
 * Responsabilidades:
 * - Exibir dados do estudante logado em modo somente leitura
 * - Buscar dados do estudante através do student_id do usuário logado
 * - Organizar informações em seções (Dados Básicos, Endereço, Filiação, Documentos, Dados Acadêmicos)
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import StudentService from '@/services/student.service';
import type { IStudent } from '@/types/student.types';
import { formatDate } from '@/utils/formatters';

export default function MyData() {
  const { user } = useAuth();
  const [student, setStudent] = useState<IStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obter studentId do usuário logado
        const studentId = (user as any)?.student_id || (user as any)?.studentId;

        if (!studentId) {
          throw new Error('ID do estudante não encontrado');
        }

        const data = await StudentService.getById(studentId);
        setStudent(data);
      } catch (err: any) {
        console.error('[MyData] Erro ao buscar dados do estudante:', err);
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStudentData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Dados não encontrados'}</p>
        </div>
      </div>
    );
  }

  // Função auxiliar para exibir valor ou "Não informado"
  const displayValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">Não informado</span>;
    }
    return value;
  };

  // Cast para acessar propriedades em camelCase
  const studentData = student as any;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meus Dados</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visualize seus dados pessoais cadastrados no sistema
        </p>
      </div>

      {/* Card Principal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Dados Básicos */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Dados Básicos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo
              </label>
              <p className="text-gray-900">{displayValue(studentData.nome)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900">{displayValue(studentData.email)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF
              </label>
              <p className="text-gray-900">{displayValue(studentData.cpf)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento
              </label>
              <p className="text-gray-900">
                {displayValue(
                  studentData.data_nascimento || studentData.dataNascimento
                    ? formatDate(studentData.data_nascimento || studentData.dataNascimento)
                    : null
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexo
              </label>
              <p className="text-gray-900">
                {studentData.sexo === 1
                  ? 'Masculino'
                  : studentData.sexo === 2
                  ? 'Feminino'
                  : displayValue(null)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <p className="text-gray-900">{displayValue(studentData.telefone)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Celular
              </label>
              <p className="text-gray-900">{displayValue(studentData.celular)}</p>
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Endereço
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CEP
              </label>
              <p className="text-gray-900">{displayValue(studentData.cep)}</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rua/Logradouro
              </label>
              <p className="text-gray-900">
                {displayValue(studentData.endereco_rua || studentData.enderecoRua)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número
              </label>
              <p className="text-gray-900">
                {displayValue(studentData.endereco_numero || studentData.enderecoNumero)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complemento
              </label>
              <p className="text-gray-900">
                {displayValue(studentData.endereco_complemento || studentData.enderecoComplemento)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bairro
              </label>
              <p className="text-gray-900">
                {displayValue(studentData.endereco_bairro || studentData.enderecoBairro)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <p className="text-gray-900">
                {displayValue(studentData.endereco_cidade || studentData.enderecoCidade)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UF
              </label>
              <p className="text-gray-900">
                {displayValue(studentData.endereco_uf || studentData.enderecoUf)}
              </p>
            </div>
          </div>
        </div>

        {/* Filiação */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Filiação
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Mãe
              </label>
              <p className="text-gray-900">{displayValue(studentData.mae)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Pai
              </label>
              <p className="text-gray-900">{displayValue(studentData.pai)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsável Legal
              </label>
              <p className="text-gray-900">{displayValue(studentData.responsavel)}</p>
            </div>
          </div>
        </div>

        {/* Documentos */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Documentos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RG
              </label>
              <p className="text-gray-900">{displayValue(studentData.rg)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Emissão do RG
              </label>
              <p className="text-gray-900">
                {displayValue(
                  studentData.rg_data || studentData.rgData
                    ? formatDate(studentData.rg_data || studentData.rgData)
                    : null
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título de Eleitor
              </label>
              <p className="text-gray-900">
                {displayValue(studentData.titulo_eleitor || studentData.tituloEleitor)}
              </p>
            </div>
          </div>
        </div>

        {/* Dados Acadêmicos */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Dados Acadêmicos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matrícula
              </label>
              <p className="text-gray-900">{displayValue(studentData.matricula)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano da Matrícula
              </label>
              <p className="text-gray-900">
                {displayValue(studentData.ano_matricula || studentData.anoMatricula)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profissão
              </label>
              <p className="text-gray-900">{displayValue(studentData.profissao)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
