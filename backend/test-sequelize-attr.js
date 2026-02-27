import { Sequelize, DataTypes } from 'sequelize';
const sequelize = new Sequelize('sqlite::memory:');

const User = sequelize.define('User', { name: DataTypes.STRING });
const Report = sequelize.define('Report', { desc: DataTypes.STRING });
User.hasMany(Report);
Report.belongsTo(User, { foreignKey: 'userId' });

async function test() {
  await sequelize.sync();
  await User.create({ id: 1, name: 'Bayu' });
  await User.create({ id: 2, name: 'Dimas' });
  await Report.create({ id: 1, desc: 'Laporan 1', userId: 1 });
  await Report.create({ id: 2, desc: 'Laporan 2', userId: 2 });
  
  const res = await Report.findAll({
    attributes: ['id', 'desc'], // OMIT userId
    include: [{ model: User, attributes: ['name'] }]
  });
  
  res.forEach(r => {
    const data = r.toJSON();
    console.log("Report:", data.desc, "| User:", data.User);
  });
}
test();
