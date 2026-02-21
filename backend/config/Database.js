import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

import mysql2 from 'mysql2';

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    dialectModule: mysql2,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

export default db;