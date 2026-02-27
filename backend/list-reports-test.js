import db from "./config/Database.js";
import dotenv from "dotenv";
dotenv.config();

try {
    const [results] = await db.query("SELECT id, userId, description, status FROM reports");
    console.log("=== REPORTS ===");
    console.log(results);
    const [users] = await db.query("SELECT id, name, email FROM users");
    console.log("=== USERS ===");
    console.log(users);
} catch (e) {
    console.error(e);
}
process.exit();
