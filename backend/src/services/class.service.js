/**
 * Arquivo: backend/src/services/class.service.js
 * Descrição: Lógica de negócio para o CRUD de Turmas
 * Feature: feat-033
 * Criado em: 28/10/2025
 */

const { Class, Student, Teacher, Discipline, ClassTeacher, ClassStudent } = require('../models');

class ClassService {
  /**
   * Cria um novo Turma.
   * @param {object} classData - Dados do Turma.
   * @returns {Promise<Class>} O Turma criado.
   */
  async create(classData) {
    const classes = await Class.create({
      ...classData,
    });

    return { ...classes.toJSON() };
  }

  /**
   * Lista todos os Turmas.
   * @returns {Promise<Class[]>} Uma lista de Turmas com curso, alunos e professores.
   */
  async list() {
    return Class.findAll({
      include: [
        {
          association: 'course',
          attributes: ['id', 'name', 'duration', 'duration_type']
        },
        {
          association: 'students',
          attributes: ['id', 'nome', 'email'],
          through: { attributes: [] }
        },
        {
          association: 'teachers',
          attributes: ['id', 'nome', 'email'],
          through: { attributes: ['discipline_id'] }
        },
        {
          association: 'disciplines',
          attributes: ['id', 'name', 'code'],
          through: { attributes: [] }
        }
      ]
    });
  }

  /**
   * Busca um Turma pelo ID.
   * @param {number} id - O ID do Turma.
   * @returns {Promise<Class>} O Turma encontrado com curso, alunos e professores.
   */
  async getById(id) {
    return Class.findOne({
      where: { id },
      include: [
        {
          association: 'course',
          attributes: ['id', 'name', 'duration', 'duration_type']
        },
        {
          association: 'students',
          attributes: ['id', 'nome', 'email'],
          through: { attributes: [] }
        },
        {
          association: 'teachers',
          attributes: ['id', 'nome', 'email'],
          through: { attributes: ['discipline_id'] }
        },
        {
          association: 'disciplines',
          attributes: ['id', 'name', 'code'],
          through: { attributes: [] }
        }
      ]
    });
  }

  /**
   * Atualiza um Turma e sincroniza professores e alunos.
   * @param {number} id - O ID do Turma.
   * @param {object} classData - Dados do Turma a serem atualizados.
   * @returns {Promise<Class>} O Turma atualizado com professores e alunos sincronizados.
   */
  async update(id, classData) {
    const turma = await this.getById(id);
    if (!turma) {
      return null;
    }

    // Extrair professores e alunos dos dados
    const { teachers, student_ids, ...basicData } = classData;

    // Atualizar dados básicos da turma
    await turma.update(basicData);

    // Sincronizar professores se fornecidos
    if (teachers !== undefined && Array.isArray(teachers)) {
      // Remover todos os professores atuais
      await ClassTeacher.destroy({
        where: { class_id: id }
      });

      // Adicionar novos professores
      if (teachers.length > 0) {
        for (const teacher of teachers) {
          if (teacher.teacherId > 0 && teacher.disciplineId > 0) {
            await ClassTeacher.create({
              class_id: id,
              teacher_id: teacher.teacherId,
              discipline_id: teacher.disciplineId,
            });
          }
        }
      }
    }

    // Sincronizar alunos se fornecidos
    if (student_ids !== undefined && Array.isArray(student_ids)) {
      // Remover todos os alunos atuais
      await ClassStudent.destroy({
        where: { class_id: id }
      });

      // Adicionar novos alunos
      if (student_ids.length > 0) {
        for (const studentId of student_ids) {
          if (studentId > 0) {
            await ClassStudent.create({
              class_id: id,
              student_id: studentId,
            });
          }
        }
      }
    }

    // Retornar turma atualizada com todas as associações
    return this.getById(id);
  }

  /**
   * Deleta um Turma.
   * @param {number} id - O ID do Turma.
   * @returns {Promise<boolean>} True se o Turma foi deletado.
   */
  async delete(id) {
    const turma = await this.getById(id);
    if (!turma) {
      return false;
    }

    await turma.destroy();
    return true;
  }

  /**
   * Adiciona um Profesor + Disciplina a uma Turma.
   * @param {number} id - O ID da Turma.
   * @param {number} teacherId - O ID do professor.
   * @param {number} disciplineId - O ID da discplina.
   * @returns {Promise<ClassTeacher>} A associação criada.
   */
  async addTeacherToClass(id, teacherId, disciplineId) {
    const turma = await Class.findOne({
      where: { id },
    });
    if (!turma) {
      throw new Error('Turma não encontrada.');
    }

    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      throw new Error('Professor não encontrado');
    }

    const discipline = await Discipline.findByPk(disciplineId);
    if (!discipline) {
      throw new Error('Disciplina não encontrada');
    }

    return ClassTeacher.create({
      class_id: id,
      teacher_id: teacherId,
      discipline_id: disciplineId,
    });
  }

  /**
   * Remove professor/disciplina da turma.
   * @param {number} classId - O ID da turma.
   * @param {number} teacherId - O ID do professor.
   * @param {number} disciplineId - O ID da disciplina.
   * @returns {Promise<boolean>} True se a associação foi removida.
   */
  async removeTeacherFromClass(classId, teacherId, disciplineId) {
    const result = await ClassTeacher.destroy({
      where: {
        class_id: classId,
        teacher_id: teacherId,
        discipline_id: disciplineId,
      },
    });

    return result > 0;
  }

  /**
   * Adiciona um Aluno a uma Turma.
   * @param {number} classId - O ID da Turma.
   * @param {number} studentId - O ID do aluno.
   * @returns {Promise<ClassStudent>} A associação criada.
   */
  async addStudentToClass(classId, studentId) {
    const turma = await Class.findOne({
      where: { id: classId },
    });
    if (!turma) {
      throw new Error('Turma não encontrada.');
    }

    const student = await User.findOne({ where: { id: studentId, role: 'student' } });
    if (!student) {
      throw new Error('Aluno não encontrado');
    }

    return ClassStudent.create({
      class_id: classId,
      student_id: studentId,
    });
  }

  /**
   * Remove um Aluno de uma Turma.
   * @param {number} classId - O ID da turma.
   * @param {number} studentId - O ID do aluno.
   * @returns {Promise<boolean>} True se a associação foi removida.
   */
  async removeStudentFromClass(classId, studentId) {
    const result = await ClassStudent.destroy({
      where: {
        class_id: classId,
        student_id: studentId,
      },
    });

    return result > 0;
  }

  /**
   * Lista todos os alunos de uma turma.
   * @param {number} classId - O ID da turma.
   * @returns {Promise<User[]>} Lista de alunos da turma.
   */
  async getStudentsByClass(classId) {
    const turma = await Class.findOne({
      where: { id: classId },
      include: [
        {
          model: User,
          as: 'students',
          through: { attributes: [] },
          attributes: ['id', 'name', 'email', 'cpf'],
        },
      ],
    });

    if (!turma) {
      throw new Error('Turma não encontrada.');
    }

    return turma.students || [];
  }

  /**
   * Lista todos os professores e disciplinas de uma turma.
   * @param {number} classId - O ID da turma.
   * @returns {Promise<Array>} Lista de professores e disciplinas associados.
   */
  async getTeachersByClass(classId) {
    const turma = await Class.findOne({
      where: { id: classId },
      include: [
        {
          model: Teacher,
          as: 'teachers',
          through: {
            attributes: ['discipline_id'],
          },
          attributes: ['id', 'nome', 'email'],
        },
        {
          model: Discipline,
          as: 'disciplines',
          through: { attributes: [] },
          attributes: ['id', 'name', 'code'],
        },
      ],
    });

    if (!turma) {
      throw new Error('Turma não encontrada.');
    }

    return {
      teachers: turma.teachers || [],
      disciplines: turma.disciplines || [],
    };
  }
}

module.exports = new ClassService();
