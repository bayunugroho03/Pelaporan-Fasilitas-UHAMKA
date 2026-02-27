import db from "./config/Database.js";
import Reports from "./models/ReportModel.js";
import Users from "./models/UserModel.js";

async function runTest() {
    try {
        await db.authenticate();
        // Check raw db query for reports and users to see actual column names
        const [reportsRaw] = await db.query('SELECT * FROM reports LIMIT 1');
        console.log("Reports columns from TiDB:", Object.keys(reportsRaw[0] || {}));

        const response = await Reports.findAll({
            attributes: { exclude: ['image'] },
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
