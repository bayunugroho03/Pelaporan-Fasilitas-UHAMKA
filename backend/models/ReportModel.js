import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";
const { DataTypes } = Sequelize;

const Reports = db.define('reports', {
    image: DataTypes.STRING,
    report_date: DataTypes.STRING,
    description: DataTypes.TEXT,
    suggestion: DataTypes.TEXT,
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending'
    },
    feedback: DataTypes.TEXT, // <--- TAMBAHAN UNTUK REVISI 3 & 4
    userId: DataTypes.INTEGER
}, { freezeTableName: true });

Users.hasMany(Reports);
Reports.belongsTo(Users, { foreignKey: 'userId' });

export default Reports;