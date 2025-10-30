/**
 * Arquivo: src/models/CourseDiscipline.js
 * Descrição: Define o modelo CourseDiscipline para a tabela de associação entre Cursos e Disciplinas
 * Feature: feat-034
 * Criado em: 29/10/2025
 */

module.exports = (sequelize, DataTypes) => {
  const CourseDiscipline = sequelize.define(
    'CourseDiscipline',
    {
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Courses',
          key: 'id',
        },
      },
      discipline_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Disciplines',
          key: 'id',
        },
      },
      semester: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'course_disciplines',
      timestamps: false,
    }
  );

  CourseDiscipline.associate = (models) => {
    CourseDiscipline.belongsTo(models.Course, {
      foreignKey: 'course_id',
      as: 'course',
    });
    CourseDiscipline.belongsTo(models.Discipline, {
      foreignKey: 'discipline_id',
      as: 'discipline',
    });
  };

  return CourseDiscipline;
};
