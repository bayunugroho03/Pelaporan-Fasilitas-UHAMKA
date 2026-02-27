import db from "./config/Database.js";
import Reports from "./models/ReportModel.js";
import Users from "./models/UserModel.js";

async function runTest() {
    try {
        await db.authenticate();
        const response = await Reports.findAll({
            attributes:['id','userId','report_date','description','suggestion','status','feedback'],
            include:[{
                model: Users,
                attributes:['name','email']
            }]
        });
        
        console.log("Response:", JSON.stringify(response.slice(0, 2), null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit();
}

runTest();
