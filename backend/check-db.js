import db from "./config/Database.js";
import Users from "./models/UserModel.js";
import dotenv from "dotenv";
dotenv.config();

async function checkDatabase() {
    try {
        // Test koneksi
        await db.authenticate();
        console.log("✅ Database terhubung!");
        
        // Cek semua users
        const users = await Users.findAll({
            attributes: ['id', 'name', 'email', 'role', 'is_verified']
        });
        
        if(users.length === 0) {
            console.log("⚠️ Tabel users KOSONG! Belum ada user terdaftar.");
            console.log("\n👉 Silakan register dulu melalui halaman Register.");
        } else {
            console.log(`\n📋 Daftar Users (${users.length} total):`);
            console.log("-------------------------------------------");
            users.forEach(u => {
                console.log(`ID: ${u.id} | ${u.name} | ${u.email} | Role: ${u.role} | Verified: ${u.is_verified}`);
            });
        }
        
    } catch (error) {
        console.log("❌ ERROR:", error.message);
        
        if(error.message.includes("Unknown database")) {
            console.log("\n⚠️ Database 'uhamka_lapor_db' belum dibuat!");
            console.log("👉 Buat database dulu di MySQL: CREATE DATABASE uhamka_lapor_db;");
        }
        
        if(error.message.includes("ECONNREFUSED")) {
            console.log("\n⚠️ MySQL Server tidak berjalan!");
            console.log("👉 Nyalakan MySQL/XAMPP terlebih dahulu.");
        }
    }
    
    process.exit();
}

checkDatabase();
