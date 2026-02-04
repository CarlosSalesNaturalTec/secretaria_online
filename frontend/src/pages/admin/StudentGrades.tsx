import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Grades from '@/pages/student/Grades';

export default function StudentGrades() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Converter ID para número
  const studentId = id ? parseInt(id, 10) : undefined;

  if (!studentId || isNaN(studentId)) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          ID do estudante inválido.
        </div>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/admin/students')}>
          Voltar para Lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="px-6 pt-4">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => navigate('/admin/students')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Lista de Alunos
        </Button>
      </div>
      <Grades studentId={studentId} isEditable={true} />
    </div>
  );
}
