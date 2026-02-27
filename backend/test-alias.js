import { Sequelize, DataTypes } from 'sequelize';
const sequelize = new Sequelize('sqlite::memory:');

const User = sequelize.define('users', { name: DataTypes.STRING });
const Report = sequelize.define('reports', { desc: DataTypes.STRING });
User.hasMany(Report);
Report.belongsTo(User, { foreignKey: 'userId' });

async function test() {
  await sequelize.sync();
  await User.create({ id: 1, name: 'Bayu' });
  await User.create({ id: 2, name: 'Dimas' });
  await Report.create({ id: 1, desc: 'Laporan 1', userId: 1 });
  
  const res = await Report.findAll({
    attributes: ['id', 'userId', 'desc'],
    include: [{ model: User, attributes: ['name'] }]
  });
  
  res.forEach(r => {
    const data = r.toJSON();
    console.log("Keys:", Object.keys(data));
    console.log("user:", data.user);
    console.log("User:", data.User);
    console.log("user data:", data.user || data.User);
  });
}
test();
