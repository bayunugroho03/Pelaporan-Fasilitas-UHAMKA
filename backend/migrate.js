import { Sequelize } from "sequelize";
import fs from "fs";
import path from "path";

const db = new Sequelize("test", "3aP1hhR3tH3PUDm.root", "EG1GXXKzD5x9D8oI", {
    host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
    port: 4000,
    dialect: "mysql",
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

const Reports = db.define('reports', {
    image: Sequelize.DataTypes.TEXT('long'),
    report_date: Sequelize.DataTypes.STRING,
    description: Sequelize.DataTypes.TEXT,
    suggestion: Sequelize.DataTypes.TEXT,
    status: Sequelize.DataTypes.STRING,
    feedback: Sequelize.DataTypes.TEXT,
    userId: Sequelize.DataTypes.INTEGER
}, { freezeTableName: true, timestamps: true });

async function migrateImages() {
    try {
        await db.authenticate();
        console.log('Connected to TiDB for migration.');

        const reports = await Reports.findAll();
        
        for (let report of reports) {
            if (report.image && !report.image.startsWith('data:image')) {
                // It's a URL
                console.log(`Report [${report.id}] has old URL: ${report.image}`);
                
                // Extract filename
                const parts = report.image.split('/');
                const fileName = parts[parts.length - 1];
                
                const filePath = path.join('./public/uploads', fileName);
                if (fs.existsSync(filePath)) {
                    console.log(`Found local file for ${fileName}. Converting to Base64...`);
                    
                    const mimeType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
                    const fileData = fs.readFileSync(filePath);
                    const base64Image = `data:${mimeType};base64,${fileData.toString('base64')}`;
                    
                    await report.update({ image: base64Image });
                    console.log(`Report [${report.id}] successfully updated with Base64 image!`);
                } else {
                    console.log(`File ${fileName} not found locally at ${filePath}`);
                }
            } else {
                console.log(`Report [${report.id}] is already Base64 or skipped.`);
            }
        }
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrateImages();
