import { Sequelize } from "sequelize";
import db from "../config/Database.js";
const { DataTypes } = Sequelize;

const Questionnaires = db.define('questionnaires', {
    reportId: DataTypes.INTEGER,
    rating: DataTypes.INTEGER
}, { freezeTableName: true });

export default Questionnaires;