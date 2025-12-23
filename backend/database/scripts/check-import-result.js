const db = require('../../src/models');

(async () => {
  try {
    const count = await db.Enrollment.count({
      where: {
        current_semester: {
          [db.Sequelize.Op.ne]: null
        }
      }
    });

    console.log('Total de enrollments com current_semester preenchido:', count);

    const dist = await db.Enrollment.findAll({
      attributes: [
        'current_semester',
        [db.Sequelize.fn('COUNT', '*'), 'count']
      ],
      where: {
        current_semester: {
          [db.Sequelize.Op.ne]: null
        }
      },
      group: ['current_semester'],
      order: [['current_semester', 'ASC']],
      raw: true
    });

    console.log('\nDistribuição por semestre:');
    dist.forEach(d => {
      console.log(`  ${d.current_semester}° semestre: ${d.count} alunos`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
})();
