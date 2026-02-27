import dotenv from 'dotenv';
dotenv.config();
import db from "./config/Database.js";
import Reports from "./models/ReportModel.js";
import Users from "./models/UserModel.js";
async function test() {
  await db.authenticate();
  try {
      const response = await Reports.findAll({
          attributes:['id','image','report_date','description','suggestion','status','feedback'],
          where:{ userId: 1 },
          include:[{
              model: Users,
              attributes:['name','email']
          }]
      });
      console.log(response.map(r => r.id));
      const formatted = response.map(r => {
          let img = r.image;
          return {
              ...r.toJSON(),
              image: img ? img.substring(0, 50) + '...' : null
          };
      });
      console.log(formatted);
  } catch (e) {
      console.error("FAIL:", e);
  }
  process.exit();
}
test();
