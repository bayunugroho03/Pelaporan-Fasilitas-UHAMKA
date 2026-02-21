import { Sequelize } from "sequelize";

const db = new Sequelize("test", "3aP1hhR3tH3PUDm.root", "EG1GXXKzD5x9D8oI", {
    host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
    port: 4000,
    dialect: "mysql",
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
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

async function debugTiDB() {
    try {
        await db.authenticate();
        console.log("Connected to TiDB");

        const reports = await Reports.findAll({ raw: true });
        console.log("ALL REPORTS IN TiDB:", JSON.stringify(reports, null, 2));

    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        process.exit();
    }
}

debugTiDB();
