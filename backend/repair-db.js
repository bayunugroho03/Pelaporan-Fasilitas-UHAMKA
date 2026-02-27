import dotenv from 'dotenv';
dotenv.config();
import db from "./config/Database.js";
import Reports from "./models/ReportModel.js";
import Users from "./models/UserModel.js";

async function repair() {
    try {
        await db.authenticate();
        console.log('DB Connected');
        
        // Find a valid mahasiswa user
        const validUser = await Users.findOne({ 
            where: { role: 'mahasiswa' },
            raw: true 
        });
        
        if (!validUser) {
            console.log("NO MAHASISWA AVAILABLE TO REPAIR");
            process.exit();
        }
        
        const validId = validUser.id || validUser.ID || validUser.userId;
        console.log("Found valid user ID:", validId);
        
        // Update reports that have non-existent users
        const sql = `UPDATE reports SET userId = ${validId} WHERE userId NOT IN (SELECT id FROM users)`;
        await db.query(sql);
        console.log("Repair SQL Ran!");
        
    } catch(e) {
        console.error(e);
    }
    process.exit();
}
repair();
