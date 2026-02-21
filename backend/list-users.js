import db from "./config/Database.js";
import dotenv from "dotenv";
dotenv.config();

const [results] = await db.query('SELECT id, name, email, role, is_verified FROM users');
console.log("=== USERS DI DATABASE ===");
results.forEach(u => {
    console.log(`${u.id}. ${u.email} (${u.role}) - Verified: ${u.is_verified ? 'Ya' : 'Tidak'}`);
});
process.exit();
