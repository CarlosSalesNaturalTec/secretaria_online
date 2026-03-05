/**
 * Arquivo: backend/src/services/studentDisciplineExemption.service.js
 * Descrição: Lógica de negócio para aproveitamento de disciplinas (dispensa)
 * Feature: feat-003 - Aproveitamento de Disciplinas
 * Criado em: 2026-03-05
 */

const { StudentDisciplineExemption, Student, Discipline, Class } = require('../models');
const { Op } = require('sequelize');

class StudentDisciplineExemptionService {
  /**
   * Cria uma dispensa de disciplina para um aluno.
   * Valida existência do aluno e disciplina, e unicidade da dispensa.
   */
  async create({ student_id, discipline_id, class_id, origin_institution, notes }) {
    // Validar existência do aluno
    const student = await Student.findByPk(student_id);
    if (!student) {
      throw Object.assign(new Error('Aluno não encontrado'), { statusCode: 404 });
    }

    // Validar existência da disciplina
    const discipline = await Discipline.findByPk(discipline_id);
    if (!discipline) {
      throw Object.assign(new Error('Disciplina não encontrada'), { statusCode: 404 });
    }

    // Validar existência da turma se fornecida
    if (class_id) {
      const turma = await Class.findByPk(class_id);
      if (!turma) {
        throw Object.assign(new Error('Turma não encontrada'), { statusCode: 404 });
      }
    }

    // Verificar unicidade: mesmo aluno + mesma disciplina (não deletada)
    const existing = await StudentDisciplineExemption.findOne({
      where: { student_id, discipline_id, deleted_at: null }
    });
    if (existing) {
      throw Object.assign(
        new Error('Já existe uma dispensa ativa para esta disciplina e este aluno'),
        { statusCode: 409 }
      );
    }

    const exemption = await StudentDisciplineExemption.create({
      student_id,
      discipline_id,
      class_id: class_id || null,
      origin_institution: origin_institution || null,
      notes: notes || null
    });

    return this.getById(exemption.id);
  }

  /**
   * Lista dispensas de um aluno com Discipline e Class incluídos.
   */
  async listByStudent(studentId) {
    return StudentDisciplineExemption.findAll({
      where: { student_id: studentId },
      include: [
        { model: Discipline, as: 'discipline', attributes: ['id', 'name', 'code'] },
        { model: Class, as: 'class', attributes: ['id', 'semester', 'year'] }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Lista todas as dispensas com paginação e filtros opcionais.
   */
  async listAll({ page = 1, limit = 20, student_id, class_id } = {}) {
    const where = {};
    if (student_id) where.student_id = student_id;
    if (class_id) where.class_id = class_id;

    const offset = (page - 1) * limit;

    const { count, rows } = await StudentDisciplineExemption.findAndCountAll({
      where,
      include: [
        { model: Student, as: 'student', attributes: ['id', 'nome', 'matricula'] },
        { model: Discipline, as: 'discipline', attributes: ['id', 'name', 'code'] },
        { model: Class, as: 'class', attributes: ['id', 'semester', 'year'] }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      total: count,
      page,
      limit,
      data: rows
    };
  }

  /**
   * Retorna uma dispensa por ID.
   */
  async getById(id) {
    return StudentDisciplineExemption.findByPk(id, {
      include: [
        { model: Student, as: 'student', attributes: ['id', 'nome', 'matricula'] },
        { model: Discipline, as: 'discipline', attributes: ['id', 'name', 'code'] },
        { model: Class, as: 'class', attributes: ['id', 'semester', 'year'] }
      ]
    });
  }

  /**
   * Remove uma dispensa (soft delete).
   */
  async delete(id) {
    const exemption = await StudentDisciplineExemption.findByPk(id);
    if (!exemption) {
      return false;
    }
    await exemption.destroy();
    return true;
  }

  /**
   * Retorna array de discipline_ids dispensados para um aluno.
   * Se class_id fornecido, filtra por turma; senão retorna todos.
   */
  async getExemptDisciplineIds(studentId, classId = null) {
    const where = { student_id: studentId };
    if (classId) {
      where[Op.or] = [{ class_id: classId }, { class_id: null }];
    }

    const exemptions = await StudentDisciplineExemption.findAll({
      where,
      attributes: ['discipline_id']
    });

    return exemptions.map(e => e.discipline_id);
  }
}

module.exports = new StudentDisciplineExemptionService();
