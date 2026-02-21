import { Sequelize } from "sequelize";
import db from "../config/Database.js";
const { DataTypes } = Sequelize;

const Users = db.define('users', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    is_verified: DataTypes.BOOLEAN,
    refresh_token: DataTypes.TEXT // Untuk menyimpan JWT refresh token
}, { freezeTableName: true });

export default Users;