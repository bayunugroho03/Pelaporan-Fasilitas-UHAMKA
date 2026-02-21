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
} catch (error) {
    console.error('Database connection failed:', error);
}

// Generate Table (Uncomment sekali untuk membuat tabel, lalu comment lagi)
// (async()=>{ await db.sync(); })();

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

import { Sequelize } from "sequelize";
app.post('/api/force-alter', async (req, res) => {
    try {
        await db.query('ALTER TABLE reports MODIFY COLUMN image LONGTEXT');
        res.json({ ok: true, message: 'Table altered successfully' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/debug-reports', async (req, res) => {
    try {
        const raw = await Reports.findAll();
        res.json({ count: raw.length, data: raw });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/debug-schema', async (req, res) => {
    try {
        const schema = await db.query('DESCRIBE reports');
        res.json(schema[0]);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/migrate-base64', async (req, res) => {
    try {
        const { url, base64 } = req.body;
        await Reports.update({ image: base64 }, { where: { image: { [Sequelize.Op.like]: '%' + url + '%' } } });
        res.json({ ok: true, migratedUrl: url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.use('/api', router); // <--- Updated for vercel routing

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server running at port ${PORT}`));