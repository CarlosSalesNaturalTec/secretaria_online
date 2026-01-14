/**
 * Arquivo: backend/src/services/classDisciplineSchedule.service.js
 * Descrição: Service para gerenciamento de horários das disciplinas da turma
 * Feature: feat-grade-dias-horarios - Gerenciar dias e horários das disciplinas da turma
 * Criado em: 2026-01-14
 */

const { ClassDisciplineSchedule, ClassTeacher, Discipline, Class, Teacher } = require('../models');
const { Op } = require('sequelize');

class ClassDisciplineScheduleService {
  /**
   * Lista todos os horários de uma turma
   * @param {number} classId - ID da turma
   * @returns {Promise<Array>} Lista de horários
   */
  async getSchedulesByClass(classId) {
    try {
      // Primeiro, buscar todos os class_teachers da turma
      const classTeachers = await ClassTeacher.findAll({
        where: { class_id: classId },
        attributes: ['id']
      });

      if (classTeachers.length === 0) {
        return [];
      }

      const classTeacherIds = classTeachers.map(ct => ct.id);

      // Buscar schedules com includes
      const schedules = await ClassDisciplineSchedule.findAll({
        where: {
          class_teacher_id: classTeacherIds
        },
        include: [
          {
            model: ClassTeacher,
            as: 'classTeacher',
            required: false,
            include: [
              {
                model: Discipline,
                as: 'discipline',
                required: false,
                attributes: ['id', 'name', 'code']
              },
              {
                model: Teacher,
                as: 'teacher',
                required: false,
                attributes: ['id', 'nome', 'email']
              }
            ]
          }
        ],
        order: [
          ['day_of_week', 'ASC'],
          ['start_time', 'ASC']
        ]
      });

      return schedules;
    } catch (error) {
      console.error('[ClassDisciplineScheduleService] Erro ao buscar horários:', error);
      throw error;
    }
  }

  /**
   * Busca horários por class_teacher_id
   * @param {number} classTeacherId - ID da relação turma-professor-disciplina
   * @returns {Promise<Array>} Lista de horários
   */
  async getSchedulesByClassTeacher(classTeacherId) {
    try {
      const schedules = await ClassDisciplineSchedule.findAll({
        where: { class_teacher_id: classTeacherId },
        order: [
          ['day_of_week', 'ASC'],
          ['start_time', 'ASC']
        ]
      });

      return schedules;
    } catch (error) {
      console.error('[ClassDisciplineScheduleService] Erro ao buscar horários:', error);
      throw error;
    }
  }

  /**
   * Cria um novo horário
   * @param {Object} data - Dados do horário
   * @returns {Promise<Object>} Horário criado
   */
  async create(data) {
    try {
      // Validar se o class_teacher existe
      const classTeacher = await ClassTeacher.findByPk(data.class_teacher_id);
      if (!classTeacher) {
        throw new Error('Relação turma-professor-disciplina não encontrada');
      }

      // Validar conflito de horários
      await this.validateScheduleConflict(
        data.class_teacher_id,
        data.day_of_week,
        data.start_time,
        data.end_time
      );

      const schedule = await ClassDisciplineSchedule.create(data);

      // Retornar com includes
      return await ClassDisciplineSchedule.findByPk(schedule.id, {
        include: [
          {
            model: ClassTeacher,
            as: 'classTeacher',
            required: false,
            include: [
              {
                model: Discipline,
                as: 'discipline',
                required: false,
                attributes: ['id', 'name', 'code']
              },
              {
                model: Teacher,
                as: 'teacher',
                required: false,
                attributes: ['id', 'nome', 'email']
              }
            ]
          }
        ]
      });
    } catch (error) {
      console.error('[ClassDisciplineScheduleService] Erro ao criar horário:', error);
      throw error;
    }
  }

  /**
   * Atualiza um horário existente
   * @param {number} id - ID do horário
   * @param {Object} data - Dados para atualização
   * @returns {Promise<Object|null>} Horário atualizado ou null
   */
  async update(id, data) {
    try {
      const schedule = await ClassDisciplineSchedule.findByPk(id);
      if (!schedule) {
        return null;
      }

      // Se estiver alterando horário ou dia, validar conflito
      if (data.day_of_week || data.start_time || data.end_time) {
        await this.validateScheduleConflict(
          schedule.class_teacher_id,
          data.day_of_week || schedule.day_of_week,
          data.start_time || schedule.start_time,
          data.end_time || schedule.end_time,
          id // Excluir o próprio horário da validação
        );
      }

      await schedule.update(data);

      return await ClassDisciplineSchedule.findByPk(id, {
        include: [
          {
            model: ClassTeacher,
            as: 'classTeacher',
            required: false,
            include: [
              {
                model: Discipline,
                as: 'discipline',
                required: false,
                attributes: ['id', 'name', 'code']
              },
              {
                model: Teacher,
                as: 'teacher',
                required: false,
                attributes: ['id', 'nome', 'email']
              }
            ]
          }
        ]
      });
    } catch (error) {
      console.error('[ClassDisciplineScheduleService] Erro ao atualizar horário:', error);
      throw error;
    }
  }

  /**
   * Remove um horário
   * @param {number} id - ID do horário
   * @returns {Promise<boolean>} True se removido, false se não encontrado
   */
  async delete(id) {
    try {
      const schedule = await ClassDisciplineSchedule.findByPk(id);
      if (!schedule) {
        return false;
      }

      await schedule.destroy();
      return true;
    } catch (error) {
      console.error('[ClassDisciplineScheduleService] Erro ao deletar horário:', error);
      throw error;
    }
  }

  /**
   * Valida conflito de horários
   * @param {number} classTeacherId - ID da relação turma-professor-disciplina
   * @param {string} dayOfWeek - Dia da semana
   * @param {string} startTime - Horário de início
   * @param {string} endTime - Horário de término
   * @param {number|null} excludeId - ID do horário a excluir da validação
   * @throws {Error} Se houver conflito
   */
  async validateScheduleConflict(classTeacherId, dayOfWeek, startTime, endTime, excludeId = null) {
    const whereClause = {
      class_teacher_id: classTeacherId,
      day_of_week: dayOfWeek,
      [Op.or]: [
        // Novo horário começa durante um horário existente
        {
          start_time: { [Op.lte]: startTime },
          end_time: { [Op.gt]: startTime }
        },
        // Novo horário termina durante um horário existente
        {
          start_time: { [Op.lt]: endTime },
          end_time: { [Op.gte]: endTime }
        },
        // Novo horário engloba um horário existente
        {
          start_time: { [Op.gte]: startTime },
          end_time: { [Op.lte]: endTime }
        }
      ]
    };

    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const conflictingSchedule = await ClassDisciplineSchedule.findOne({
      where: whereClause
    });

    if (conflictingSchedule) {
      throw new Error(
        `Conflito de horário: já existe uma aula neste horário (${conflictingSchedule.start_time} - ${conflictingSchedule.end_time})`
      );
    }
  }

  /**
   * Cria múltiplos horários de uma vez
   * @param {Array<Object>} schedules - Array de horários para criar
   * @returns {Promise<Array>} Horários criados
   */
  async bulkCreate(schedules) {
    try {
      const createdSchedules = [];

      for (const scheduleData of schedules) {
        const created = await this.create(scheduleData);
        createdSchedules.push(created);
      }

      return createdSchedules;
    } catch (error) {
      console.error('[ClassDisciplineScheduleService] Erro ao criar horários em lote:', error);
      throw error;
    }
  }
}

module.exports = new ClassDisciplineScheduleService();
