/**
 * Arquivo: backend/src/services/classSchedule.service.js
 * Descrição: Lógica de negócio para gerenciamento de grade de horários das turmas
 * Feature: feat-001 - Grade de Horários por Turma
 * Criado em: 2026-01-18
 */

const { ClassSchedule, Class, Discipline, Teacher, sequelize } = require('../models');
const { Op } = require('sequelize');

class ClassScheduleService {
  /**
   * Cria um novo horário na grade.
   * @param {object} scheduleData - Dados do horário
   * @returns {Promise<ClassSchedule>} O horário criado
   */
  async create(scheduleData) {
    // Validar que a turma existe
    const turma = await Class.findByPk(scheduleData.class_id);
    if (!turma) {
      throw new Error('Turma não encontrada');
    }

    // Validar que a disciplina existe
    const discipline = await Discipline.findByPk(scheduleData.discipline_id);
    if (!discipline) {
      throw new Error('Disciplina não encontrada');
    }

    // Validar professor se fornecido
    if (scheduleData.teacher_id) {
      const teacher = await Teacher.findByPk(scheduleData.teacher_id);
      if (!teacher) {
        throw new Error('Professor não encontrado');
      }
    }

    // Validar day_of_week
    if (scheduleData.day_of_week < 1 || scheduleData.day_of_week > 7) {
      throw new Error('O dia da semana deve estar entre 1 (Segunda) e 7 (Domingo)');
    }

    // Validar start_time < end_time
    if (scheduleData.start_time >= scheduleData.end_time) {
      throw new Error('O horário de início deve ser menor que o horário de término');
    }

    // Validar conflito de horário (hook já faz, mas verificamos antes para mensagem clara)
    const hasConflict = await ClassSchedule.validateTimeConflict(
      scheduleData.class_id,
      scheduleData.day_of_week,
      scheduleData.start_time,
      scheduleData.end_time
    );

    if (hasConflict) {
      throw new Error('Conflito de horário: já existe uma aula neste horário para esta turma');
    }

    // Validar formato de URL se fornecido
    if (scheduleData.online_link && !this.isValidUrl(scheduleData.online_link)) {
      throw new Error('O link online deve ser uma URL válida');
    }

    const schedule = await ClassSchedule.create(scheduleData);

    // Retornar com associações
    return this.getById(schedule.id);
  }

  /**
   * Lista horários de uma turma com filtros opcionais.
   * @param {number} classId - ID da turma
   * @param {object} options - Opções de filtro
   * @returns {Promise<ClassSchedule[]>} Lista de horários
   */
  async getByClass(classId, options = {}) {
    const { dayOfWeek, disciplineId, includeTeacher = true } = options;

    // Verificar se a turma existe
    const turma = await Class.findByPk(classId);
    if (!turma) {
      throw new Error('Turma não encontrada');
    }

    const whereClause = { class_id: classId };

    if (dayOfWeek) {
      whereClause.day_of_week = dayOfWeek;
    }

    if (disciplineId) {
      whereClause.discipline_id = disciplineId;
    }

    const include = [
      {
        model: Discipline,
        as: 'discipline',
        attributes: ['id', 'name', 'code']
      }
    ];

    if (includeTeacher) {
      include.push({
        model: Teacher,
        as: 'teacher',
        attributes: ['id', 'nome', 'email']
      });
    }

    const schedules = await ClassSchedule.findAll({
      where: whereClause,
      include,
      order: [['day_of_week', 'ASC'], ['start_time', 'ASC']]
    });

    return schedules.map(s => this.formatSchedule(s));
  }

  /**
   * Busca um horário pelo ID.
   * @param {number} id - ID do horário
   * @returns {Promise<ClassSchedule|null>} O horário encontrado
   */
  async getById(id) {
    const schedule = await ClassSchedule.findByPk(id, {
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
      ]
    });

    if (!schedule) {
      return null;
    }

    return this.formatSchedule(schedule);
  }

  /**
   * Atualiza um horário existente.
   * @param {number} id - ID do horário
   * @param {object} updateData - Dados a serem atualizados
   * @returns {Promise<ClassSchedule|null>} O horário atualizado
   */
  async update(id, updateData) {
    const schedule = await ClassSchedule.findByPk(id);
    if (!schedule) {
      return null;
    }

    // Se mudando turma, validar que existe
    if (updateData.class_id && updateData.class_id !== schedule.class_id) {
      const turma = await Class.findByPk(updateData.class_id);
      if (!turma) {
        throw new Error('Turma não encontrada');
      }
    }

    // Se mudando disciplina, validar que existe
    if (updateData.discipline_id && updateData.discipline_id !== schedule.discipline_id) {
      const discipline = await Discipline.findByPk(updateData.discipline_id);
      if (!discipline) {
        throw new Error('Disciplina não encontrada');
      }
    }

    // Se mudando professor, validar que existe
    if (updateData.teacher_id !== undefined && updateData.teacher_id !== null) {
      const teacher = await Teacher.findByPk(updateData.teacher_id);
      if (!teacher) {
        throw new Error('Professor não encontrado');
      }
    }

    // Validar day_of_week se fornecido
    if (updateData.day_of_week && (updateData.day_of_week < 1 || updateData.day_of_week > 7)) {
      throw new Error('O dia da semana deve estar entre 1 (Segunda) e 7 (Domingo)');
    }

    // Validar start_time < end_time
    const startTime = updateData.start_time || schedule.start_time;
    const endTime = updateData.end_time || schedule.end_time;
    if (startTime >= endTime) {
      throw new Error('O horário de início deve ser menor que o horário de término');
    }

    // Validar conflito de horário se campos relevantes mudaram
    const classId = updateData.class_id || schedule.class_id;
    const dayOfWeek = updateData.day_of_week || schedule.day_of_week;

    const hasConflict = await ClassSchedule.validateTimeConflict(
      classId,
      dayOfWeek,
      startTime,
      endTime,
      id // Excluir o próprio registro
    );

    if (hasConflict) {
      throw new Error('Conflito de horário: já existe uma aula neste horário para esta turma');
    }

    // Validar formato de URL se fornecido
    if (updateData.online_link && !this.isValidUrl(updateData.online_link)) {
      throw new Error('O link online deve ser uma URL válida');
    }

    await schedule.update(updateData);

    return this.getById(id);
  }

  /**
   * Deleta um horário (soft delete).
   * @param {number} id - ID do horário
   * @returns {Promise<boolean>} True se deletado
   */
  async delete(id) {
    const schedule = await ClassSchedule.findByPk(id);
    if (!schedule) {
      return false;
    }

    await schedule.destroy();
    return true;
  }

  /**
   * Valida se há conflito de horário.
   * @param {number} classId - ID da turma
   * @param {number} dayOfWeek - Dia da semana
   * @param {string} startTime - Horário de início
   * @param {string} endTime - Horário de término
   * @param {number|null} excludeId - ID a excluir (para updates)
   * @returns {Promise<boolean>} True se há conflito
   */
  async validateTimeConflict(classId, dayOfWeek, startTime, endTime, excludeId = null) {
    return ClassSchedule.validateTimeConflict(classId, dayOfWeek, startTime, endTime, excludeId);
  }

  /**
   * Obtém a grade completa da semana organizada.
   * @param {number} classId - ID da turma
   * @returns {Promise<Object>} Grade organizada por dia
   */
  async getWeekSchedule(classId) {
    // Verificar se a turma existe
    const turma = await Class.findByPk(classId);
    if (!turma) {
      throw new Error('Turma não encontrada');
    }

    const schedules = await ClassSchedule.findAll({
      where: { class_id: classId },
      include: [
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

    // Organizar por dia da semana
    const weekSchedule = {
      1: [], // Segunda
      2: [], // Terça
      3: [], // Quarta
      4: [], // Quinta
      5: [], // Sexta
      6: [], // Sábado
      7: []  // Domingo
    };

    schedules.forEach(schedule => {
      const formatted = this.formatSchedule(schedule);
      weekSchedule[schedule.day_of_week].push(formatted);
    });

    return weekSchedule;
  }

  /**
   * Cria múltiplos horários em lote usando transação.
   * @param {number} classId - ID da turma
   * @param {Array} schedulesArray - Array de horários a criar
   * @returns {Promise<Object>} Resultado com criados e erros
   */
  async bulkCreate(classId, schedulesArray) {
    // Verificar se a turma existe
    const turma = await Class.findByPk(classId);
    if (!turma) {
      throw new Error('Turma não encontrada');
    }

    const created = [];
    const errors = [];

    const transaction = await sequelize.transaction();

    try {
      for (let i = 0; i < schedulesArray.length; i++) {
        const scheduleData = { ...schedulesArray[i], class_id: classId };

        try {
          // Validações
          const discipline = await Discipline.findByPk(scheduleData.discipline_id);
          if (!discipline) {
            errors.push({ index: i, error: 'Disciplina não encontrada' });
            continue;
          }

          if (scheduleData.teacher_id) {
            const teacher = await Teacher.findByPk(scheduleData.teacher_id);
            if (!teacher) {
              errors.push({ index: i, error: 'Professor não encontrado' });
              continue;
            }
          }

          if (scheduleData.day_of_week < 1 || scheduleData.day_of_week > 7) {
            errors.push({ index: i, error: 'Dia da semana inválido' });
            continue;
          }

          if (scheduleData.start_time >= scheduleData.end_time) {
            errors.push({ index: i, error: 'Horário de início deve ser menor que término' });
            continue;
          }

          // Verificar conflito considerando os já criados neste lote
          const hasConflict = await ClassSchedule.validateTimeConflict(
            classId,
            scheduleData.day_of_week,
            scheduleData.start_time,
            scheduleData.end_time
          );

          if (hasConflict) {
            errors.push({ index: i, error: 'Conflito de horário detectado' });
            continue;
          }

          if (scheduleData.online_link && !this.isValidUrl(scheduleData.online_link)) {
            errors.push({ index: i, error: 'URL inválida' });
            continue;
          }

          const schedule = await ClassSchedule.create(scheduleData, { transaction });
          created.push(schedule);
        } catch (err) {
          errors.push({ index: i, error: err.message });
        }
      }

      // Se todos deram erro, rollback
      if (created.length === 0 && errors.length > 0) {
        await transaction.rollback();
        return { success: false, created: [], errors };
      }

      await transaction.commit();

      // Buscar os criados com associações
      const createdWithRelations = await Promise.all(
        created.map(s => this.getById(s.id))
      );

      return {
        success: true,
        created: createdWithRelations,
        errors
      };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  /**
   * Formata um horário para resposta.
   * @param {ClassSchedule} schedule - Horário a formatar
   * @returns {Object} Horário formatado
   */
  formatSchedule(schedule) {
    const json = schedule.toJSON();

    // Adicionar campos calculados
    json.formatted_time = schedule.getFormattedTime ? schedule.getFormattedTime() : this.formatTime(json.start_time, json.end_time);
    json.day_name = schedule.getDayName ? schedule.getDayName() : ClassSchedule.DAY_NAMES[json.day_of_week];
    json.has_online_link = !!(json.online_link && json.online_link.trim() !== '');

    // Normalizar nome do professor
    if (json.teacher && json.teacher.nome) {
      json.teacher.name = json.teacher.nome;
    }

    return json;
  }

  /**
   * Formata horário para exibição.
   * @param {string} startTime - Horário de início
   * @param {string} endTime - Horário de término
   * @returns {string} Horário formatado
   */
  formatTime(startTime, endTime) {
    const start = startTime ? startTime.substring(0, 5) : '';
    const end = endTime ? endTime.substring(0, 5) : '';
    return `${start} - ${end}`;
  }

  /**
   * Valida se uma string é uma URL válida.
   * @param {string} url - URL a validar
   * @returns {boolean} True se válida
   */
  isValidUrl(url) {
    if (!url) return true; // Campo opcional
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = new ClassScheduleService();
