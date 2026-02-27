import db from "./config/Database.js";
import Users from "./models/UserModel.js";
async function x() {
  await db.authenticate();
  const user1 = await Users.findOne({ where: { role: 'mahasiswa' } });
  console.log("Normal:", user1 ? Object.keys(user1.get({plain:true})) : null);
  console.log("Normal ID:", user1 ? user1.id : null);
  const user2 = await Users.findOne({ where: { role: 'mahasiswa' }, raw: true });
  console.log("Raw:", user2 ? Object.keys(user2) : null);
  console.log("Raw ID:", user2 ? user2.id : null);
  process.exit();
}
x();
