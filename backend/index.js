import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import db from "./config/Database.js";
import fileUpload from "express-fileupload";
import router from "./routes/index.js";
import os from "os";

// Import Models untuk auto generate table jika belum ada
import Users from "./models/UserModel.js";
import Reports from "./models/ReportModel.js";
import Questionnaires from "./models/QuestionnaireModel.js";

dotenv.config();
const app = express();

// Test DB Connection
try {
    await db.authenticate();
    console.log('Database connected successfully.');
    // Auto Migrate (TiDB tidak support MODIFY string ke LONGTEXT, jadi DROP dan ADD)
    await db.query('ALTER TABLE reports DROP COLUMN image;').catch(e => console.log('Drop image failed:', e.message));
    await db.query('ALTER TABLE reports ADD COLUMN image LONGTEXT;').catch(e => console.log('Add image failed:', e.message));
} catch (error) {
    console.error('Database connection failed:', error);
}

// Rute Migrasi Skema DB Langsung (Hanya digunakan sekali lewat browser)
app.get('/api/migrate', async (req, res) => {
    try {
        await db.query('ALTER TABLE reports MODIFY COLUMN image LONGTEXT;');
        res.json({ msg: "Database migrated successfully. Image column should now be LONGTEXT." });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.use(cors({ 
    credentials: true, 
    origin: process.env.FRONTEND_URL || 'http://localhost:5173' 
})); // Port Frontend Vite
app.use(cookieParser()); // Middleware untuk membaca cookies (refresh token)
app.use(express.json({ limit: '50mb' }));
app.use(fileUpload());
app.use(express.static("public")); // Untuk akses gambar
const uploadPath = process.env.NODE_ENV === 'production' || process.env.VERCEL ? os.tmpdir() : './public/uploads';
app.use('/api/uploads', express.static(uploadPath));

app.use('/api', router); // <--- Updated for vercel routing

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server running at port ${PORT}`));