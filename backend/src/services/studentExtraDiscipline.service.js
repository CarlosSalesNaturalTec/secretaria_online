/**
 * Arquivo: backend/src/services/studentExtraDiscipline.service.js
 * Descrição: Lógica de negócio para gerenciamento de disciplinas extras de alunos
 * Feature: feat-002 - Disciplinas Extras para Alunos
 * Criado em: 2026-01-18
 */

const {
  StudentExtraDiscipline,
  Student,
  Discipline,
  Class,
  ClassStudent,
  ClassTeacher,
  ClassSchedule,
  Teacher,
  sequelize
} = require('../models');
const { Op } = require('sequelize');

class StudentExtraDisciplineService {
  /**
   * Vincula uma disciplina extra a um aluno.
   * @param {object} extraDisciplineData - Dados da disciplina extra
   * @returns {Promise<StudentExtraDiscipline>} A disciplina extra criada
   */
  async create(extraDisciplineData) {
    // Validar que o aluno existe
    const student = await Student.findByPk(extraDisciplineData.student_id);
    if (!student) {
      throw new Error('Aluno não encontrado');
    }

    // Validar que a disciplina existe
    const discipline = await Discipline.findByPk(extraDisciplineData.discipline_id);
    if (!discipline) {
      throw new Error('Disciplina não encontrada');
    }

    // Validar turma se fornecida
    if (extraDisciplineData.class_id) {
      const turma = await Class.findByPk(extraDisciplineData.class_id);
      if (!turma) {
        throw new Error('Turma não encontrada');
      }
    }

    // Verificar se aluno já tem essa disciplina extra
    const hasExtra = await StudentExtraDiscipline.hasExtraDiscipline(
      extraDisciplineData.student_id,
      extraDisciplineData.discipline_id
    );

    if (hasExtra) {
      throw new Error('O aluno já possui esta disciplina extra cadastrada');
    }

    // Verificar se disciplina está na turma principal (aviso)
    const isInMainClass = await this.checkDisciplineInMainClass(
      extraDisciplineData.student_id,
      extraDisciplineData.discipline_id
    );

    if (isInMainClass) {
      console.warn(`[StudentExtraDiscipline] Aviso: Disciplina já está na turma principal do aluno`);
    }

    // Validar reason
    const validReasons = ['dependency', 'recovery', 'advancement', 'other'];
    if (extraDisciplineData.reason && !validReasons.includes(extraDisciplineData.reason)) {
      throw new Error('Motivo inválido. Deve ser: dependency, recovery, advancement ou other');
    }

    const extraDiscipline = await StudentExtraDiscipline.create(extraDisciplineData);

    // Retornar com associações
    return this.getById(extraDiscipline.id);
  }

  /**
   * Lista disciplinas extras de um aluno com filtros opcionais.
   * @param {number} studentId - ID do aluno
   * @param {object} options - Opções de filtro
   * @returns {Promise<StudentExtraDiscipline[]>} Lista de disciplinas extras
   */
  async getByStudent(studentId, options = {}) {
    const { status, reason } = options;

    // Verificar se o aluno existe
    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new Error('Aluno não encontrado');
    }

    const whereClause = { student_id: studentId };

    if (status) {
      whereClause.status = status;
    }

    if (reason) {
      whereClause.reason = reason;
    }

    const include = [
      {
        model: Discipline,
        as: 'discipline',
        attributes: ['id', 'name', 'code']
      },
      {
        model: Class,
        as: 'class',
        attributes: ['id', 'course_id', 'semester', 'year']
      }
    ];

    const extraDisciplines = await StudentExtraDiscipline.findAll({
      where: whereClause,
      include,
      order: [['enrollment_date', 'DESC']]
    });

    return extraDisciplines.map(ed => this.formatExtraDiscipline(ed));
  }

  /**
   * Busca uma disciplina extra pelo ID.
   * @param {number} id - ID da disciplina extra
   * @returns {Promise<StudentExtraDiscipline|null>} A disciplina extra encontrada
   */
  async getById(id) {
    const extraDiscipline = await StudentExtraDiscipline.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'nome', 'email', 'matricula']
        },
        {
          model: Discipline,
          as: 'discipline',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'course_id', 'semester', 'year']
        }
      ]
    });

    if (!extraDiscipline) {
      return null;
    }

    return this.formatExtraDiscipline(extraDiscipline);
  }

  /**
   * Atualiza uma disciplina extra.
   * @param {number} id - ID da disciplina extra
   * @param {object} updateData - Dados a serem atualizados
   * @returns {Promise<StudentExtraDiscipline|null>} A disciplina extra atualizada
   */
  async update(id, updateData) {
    const extraDiscipline = await StudentExtraDiscipline.findByPk(id);
    if (!extraDiscipline) {
      return null;
    }

    // Campos permitidos para atualização
    const allowedFields = ['class_id', 'status', 'notes', 'reason'];
    const filteredData = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    // Validar turma se fornecida
    if (filteredData.class_id) {
      const turma = await Class.findByPk(filteredData.class_id);
      if (!turma) {
        throw new Error('Turma não encontrada');
      }
    }

    // Validar status
    const validStatuses = ['active', 'completed', 'cancelled'];
    if (filteredData.status && !validStatuses.includes(filteredData.status)) {
      throw new Error('Status inválido. Deve ser: active, completed ou cancelled');
    }

    // Validar reason
    const validReasons = ['dependency', 'recovery', 'advancement', 'other'];
    if (filteredData.reason && !validReasons.includes(filteredData.reason)) {
      throw new Error('Motivo inválido. Deve ser: dependency, recovery, advancement ou other');
    }

    await extraDiscipline.update(filteredData);

    return this.getById(id);
  }

  /**
   * Remove uma disciplina extra (soft delete).
   * @param {number} id - ID da disciplina extra
   * @returns {Promise<boolean>} True se deletada
   */
  async delete(id) {
    const extraDiscipline = await StudentExtraDiscipline.findByPk(id);
    if (!extraDiscipline) {
      return false;
    }

    await extraDiscipline.destroy();
    return true;
  }

  /**
   * Obtém a grade completa do aluno (turma principal + disciplinas extras).
   * @param {number} studentId - ID do aluno
   * @returns {Promise<Object>} Grade completa organizada
   */
  async getStudentFullSchedule(studentId) {
    // Verificar se o aluno existe
    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new Error('Aluno não encontrado');
    }

    // 1. Buscar turmas do aluno
    const studentClasses = await ClassStudent.findAll({
      where: { student_id: studentId },
      attributes: ['class_id']
    });

    const classIds = studentClasses.map(sc => sc.class_id);

    // 2. Buscar horários das turmas principais
    let mainClassSchedules = [];
    if (classIds.length > 0) {
      mainClassSchedules = await ClassSchedule.findAll({
        where: { class_id: { [Op.in]: classIds } },
        include: [
          {
            model: Class,
            as: 'class',
            attributes: ['id', 'course_id', 'semester', 'year']
          },
          {
            model: Discipline,
            as: 'discipline',
            attributes: ['id', 'name', 'code']
          },
          {
            model: Teacher,
            as: 'teacher',
            attributes: ['id', 'nome', 'email']
          }
        ],
        order: [['day_of_week', 'ASC'], ['start_time', 'ASC']]
      });
    }

    // 3. Buscar disciplinas extras ativas com horários
    const extraDisciplines = await StudentExtraDiscipline.findAll({
      where: {
        student_id: studentId,
        status: 'active',
        deleted_at: null
      },
      include: [
        {
          model: Discipline,
          as: 'discipline',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'course_id', 'semester', 'year']
        }
      ]
    });

    // 4. Converter disciplinas extras em formato de schedule
    const extraDisciplineSchedules = extraDisciplines
      .filter(extra => extra.day_of_week && extra.start_time && extra.end_time) // Apenas com horário definido
      .map(extra => ({
        id: `extra_${extra.id}`,
        discipline_id: extra.discipline_id,
        day_of_week: extra.day_of_week,
        start_time: extra.start_time,
        end_time: extra.end_time,
        online_link: extra.online_link,
        is_extra: true,
        extra_reason: extra.reason,
        extra_id: extra.id,
        discipline: extra.discipline,
        class: extra.class,
        teacher: null
      }));

    // 5. Mesclar e organizar por dia da semana
    const allSchedules = [...mainClassSchedules, ...extraDisciplineSchedules];
    const weekSchedule = {
      1: [], // Segunda
      2: [], // Terça
      3: [], // Quarta
      4: [], // Quinta
      5: [], // Sexta
      6: [], // Sábado
      7: []  // Domingo
    };

    allSchedules.forEach(schedule => {
      const formatted = this.formatSchedule(schedule);
      weekSchedule[schedule.day_of_week].push(formatted);
    });

    // Ordenar cada dia por horário
    for (const day in weekSchedule) {
      weekSchedule[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
    }

    return {
      mainClassSchedules: mainClassSchedules.map(s => this.formatSchedule(s)),
      extraDisciplineSchedules: extraDisciplineSchedules.map(s => this.formatSchedule(s)),
      extraDisciplines: extraDisciplines.map(ed => this.formatExtraDiscipline(ed)),
      weekSchedule
    };
  }

  /**
   * Verifica se uma disciplina está na turma principal do aluno.
   * @param {number} studentId - ID do aluno
   * @param {number} disciplineId - ID da disciplina
   * @returns {Promise<boolean>} True se está na turma principal
   */
  async checkDisciplineInMainClass(studentId, disciplineId) {
    // Buscar turmas do aluno
    const studentClasses = await ClassStudent.findAll({
      where: { student_id: studentId },
      attributes: ['class_id']
    });

    if (!studentClasses.length) {
      return false;
    }

    const classIds = studentClasses.map(sc => sc.class_id);

    // Verificar se alguma turma tem a disciplina
    const classTeacher = await ClassTeacher.findOne({
      where: {
        class_id: { [Op.in]: classIds },
        discipline_id: disciplineId
      }
    });

    return !!classTeacher;
  }

  /**
   * Busca alunos matriculados em uma disciplina específica como extra.
   * @param {number} disciplineId - ID da disciplina
   * @param {object} options - Opções de filtro
   * @returns {Promise<StudentExtraDiscipline[]>} Lista de matrículas extras
   */
  async getByDiscipline(disciplineId, options = {}) {
    const { status } = options;

    const whereClause = { discipline_id: disciplineId };

    if (status) {
      whereClause.status = status;
    }

    const extraDisciplines = await StudentExtraDiscipline.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'nome', 'email', 'matricula']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'course_id', 'semester', 'year']
        }
      ],
      order: [['enrollment_date', 'DESC']]
    });

    return extraDisciplines.map(ed => this.formatExtraDiscipline(ed));
  }

  /**
   * Formata uma disciplina extra para resposta.
   * @param {StudentExtraDiscipline} extraDiscipline - Disciplina extra a formatar
   * @returns {Object} Disciplina extra formatada
   */
  formatExtraDiscipline(extraDiscipline) {
    const json = extraDiscipline.toJSON();

    // Adicionar labels traduzidas
    json.reason_label = StudentExtraDiscipline.REASON_LABELS[json.reason] || json.reason;
    json.status_label = StudentExtraDiscipline.STATUS_LABELS[json.status] || json.status;
    json.is_active = json.status === 'active' && json.deleted_at === null;

    // Adicionar informações de horário formatadas
    if (json.start_time && json.end_time) {
      const startTime = json.start_time.substring(0, 5);
      const endTime = json.end_time.substring(0, 5);
      json.formatted_time = `${startTime} - ${endTime}`;
    } else {
      json.formatted_time = '';
    }

    if (json.day_of_week) {
      const DAY_NAMES = {
        1: 'Segunda-feira',
        2: 'Terça-feira',
        3: 'Quarta-feira',
        4: 'Quinta-feira',
        5: 'Sexta-feira',
        6: 'Sábado',
        7: 'Domingo'
      };
      json.day_name = DAY_NAMES[json.day_of_week] || '';
    } else {
      json.day_name = '';
    }

    json.has_schedule = !!(json.day_of_week && json.start_time && json.end_time);
    json.has_online_link = !!(json.online_link && json.online_link.trim() !== '');

    // Normalizar nome do aluno
    if (json.student && json.student.nome) {
      json.student.name = json.student.nome;
    }

    return json;
  }

  /**
   * Formata um horário para resposta.
   * @param {ClassSchedule|Object} schedule - Horário a formatar (instância Sequelize ou objeto simples)
   * @returns {Object} Horário formatado
   */
  formatSchedule(schedule) {
    // Verificar se é instância Sequelize ou objeto simples
    const json = typeof schedule.toJSON === 'function' ? schedule.toJSON() : { ...schedule };

    // Adicionar campos calculados
    const startTime = json.start_time ? json.start_time.substring(0, 5) : '';
    const endTime = json.end_time ? json.end_time.substring(0, 5) : '';
    json.formatted_time = `${startTime} - ${endTime}`;
    json.day_name = ClassSchedule.DAY_NAMES ? ClassSchedule.DAY_NAMES[json.day_of_week] : this.getDayName(json.day_of_week);
    json.has_online_link = !!(json.online_link && json.online_link.trim() !== '');

    // Normalizar nome do professor
    if (json.teacher && json.teacher.nome) {
      json.teacher.name = json.teacher.nome;
    }

    return json;
  }

  /**
   * Retorna o nome do dia da semana.
   * @param {number} dayOfWeek - Dia da semana (1-7)
   * @returns {string} Nome do dia
   */
  getDayName(dayOfWeek) {
    const days = {
      1: 'Segunda-feira',
      2: 'Terça-feira',
      3: 'Quarta-feira',
      4: 'Quinta-feira',
      5: 'Sexta-feira',
      6: 'Sábado',
      7: 'Domingo'
    };
    return days[dayOfWeek] || '';
  }
}

module.exports = new StudentExtraDisciplineService();
