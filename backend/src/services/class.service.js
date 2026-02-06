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
   * Lista todos os Turmas (ou filtra por professor se teacherId for fornecido).
   * @param {number} teacherId - ID do professor para filtrar turmas (opcional)
   * @returns {Promise<Class[]>} Uma lista de Turmas com curso, alunos e professores.
   */
  async list(teacherId = null) {
    const { Course, Discipline, CourseDiscipline, Enrollment } = require('../models');
    const { Op } = require('sequelize');

    const teachersInclude = {
      association: 'teachers',
      attributes: ['id', 'nome', 'email'],
      through: { attributes: ['discipline_id'] }
    };

    // Se teacherId for fornecido, filtrar turmas desse professor
    if (teacherId) {
      teachersInclude.where = { id: teacherId };
      teachersInclude.required = true;
    }

    const queryOptions = {
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
        teachersInclude
      ]
    };

    const classes = await Class.findAll(queryOptions);

    // Mapear dados e buscar disciplinas do curso para cada turma
    const classesWithDisciplines = await Promise.all(
      classes.map(async (cls) => {
        const clsJSON = cls.toJSON();

        // Filtrar alunos com matrícula ativa no curso da turma
        if (clsJSON.students && clsJSON.course?.id) {
          const studentIds = clsJSON.students.map(s => s.id);

          // Buscar matrículas ativas dos alunos neste curso
          const activeEnrollments = await Enrollment.findAll({
            where: {
              student_id: { [Op.in]: studentIds },
              course_id: clsJSON.course.id,
              status: { [Op.notIn]: ['cancelled'] }
            },
            attributes: ['student_id']
          });

          const activeStudentIds = activeEnrollments.map(e => e.student_id);

          // Filtrar apenas alunos com matrícula ativa
          clsJSON.students = clsJSON.students.filter(student =>
            activeStudentIds.includes(student.id)
          ).map(student => ({
            ...student,
            name: student.nome
          }));
        } else if (clsJSON.students) {
          // Converter 'nome' para 'name' nos alunos
          clsJSON.students = clsJSON.students.map(student => ({
            ...student,
            name: student.nome
          }));
        }

        // Converter 'nome' para 'name' nos professores
        if (clsJSON.teachers) {
          clsJSON.teachers = clsJSON.teachers.map(teacher => ({
            ...teacher,
            name: teacher.nome
          }));
        }

        // Buscar disciplinas do curso (todas as disciplinas vinculadas ao curso, não apenas as que têm professor)
        if (clsJSON.course && clsJSON.course.id) {
          const courseDisciplines = await CourseDiscipline.findAll({
            where: { course_id: clsJSON.course.id },
            include: [
              {
                model: Discipline,
                as: 'discipline',
                attributes: ['id', 'name', 'code']
              }
            ]
          });

          clsJSON.disciplines = courseDisciplines.map(cd => cd.discipline);
        } else {
          clsJSON.disciplines = [];
        }

        return clsJSON;
      })
    );

    return classesWithDisciplines;
  }

  /**
   * Busca um Turma pelo ID.
   * @param {number} id - O ID do Turma.
   * @returns {Promise<Class>} O Turma encontrado com curso, alunos e professores.
   */
  async getById(id) {
    const { Course, Discipline, CourseDiscipline, Enrollment } = require('../models');
    const { Op } = require('sequelize');

    const cls = await Class.findOne({
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
        }
      ]
    });

    if (!cls) return null;

    // Converter para JSON e mapear 'nome' para 'name'
    const clsJSON = cls.toJSON();

    // Filtrar alunos com matrícula ativa no curso da turma
    if (clsJSON.students && clsJSON.course?.id) {
      const studentIds = clsJSON.students.map(s => s.id);

      // Buscar matrículas ativas dos alunos neste curso
      const activeEnrollments = await Enrollment.findAll({
        where: {
          student_id: { [Op.in]: studentIds },
          course_id: clsJSON.course.id,
          status: { [Op.notIn]: ['cancelled'] }
        },
        attributes: ['student_id']
      });

      const activeStudentIds = activeEnrollments.map(e => e.student_id);

      // Filtrar apenas alunos com matrícula ativa
      clsJSON.students = clsJSON.students.filter(student =>
        activeStudentIds.includes(student.id)
      ).map(student => ({
        ...student,
        name: student.nome
      }));
    } else if (clsJSON.students) {
      // Converter 'nome' para 'name' nos alunos
      clsJSON.students = clsJSON.students.map(student => ({
        ...student,
        name: student.nome
      }));
    }

    // Converter 'nome' para 'name' nos professores
    if (clsJSON.teachers) {
      clsJSON.teachers = clsJSON.teachers.map(teacher => ({
        ...teacher,
        name: teacher.nome
      }));
    }

    // Buscar disciplinas do curso (todas as disciplinas vinculadas ao curso, não apenas as que têm professor)
    if (clsJSON.course && clsJSON.course.id) {
      const courseDisciplines = await CourseDiscipline.findAll({
        where: { course_id: clsJSON.course.id },
        include: [
          {
            model: Discipline,
            as: 'discipline',
            attributes: ['id', 'name', 'code']
          }
        ]
      });

      clsJSON.disciplines = courseDisciplines.map(cd => cd.discipline);
    } else {
      clsJSON.disciplines = [];
    }

    return clsJSON;
  }

  /**
   * Atualiza um Turma e sincroniza professores e alunos.
   * @param {number} id - O ID do Turma.
   * @param {object} classData - Dados do Turma a serem atualizados.
   * @returns {Promise<Class>} O Turma atualizado com professores e alunos sincronizados.
   */
  async update(id, classData) {
    // Buscar instância do Sequelize (não o JSON transformado)
    const turma = await Class.findByPk(id);
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
    // Buscar a instância do model (não usar getById que retorna JSON)
    const turma = await Class.findByPk(id);
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

    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new Error('Aluno não encontrado');
    }

    // Verificar se o aluno já está nesta turma específica
    const existingAssociation = await ClassStudent.findOne({
      where: {
        class_id: classId,
        student_id: studentId,
      }
    });

    if (existingAssociation) {
      throw new Error('Este aluno já está cadastrado nesta turma');
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
