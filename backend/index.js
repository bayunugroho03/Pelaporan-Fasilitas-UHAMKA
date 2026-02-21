import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import db from "./config/Database.js";
import fileUpload from "express-fileupload";
import router from "./routes/index.js";
// Import Models untuk auto generate table jika belum ada
import Users from "./models/UserModel.js";
import Reports from "./models/ReportModel.js";
import Questionnaires from "./models/QuestionnaireModel.js";

dotenv.config();
const app = express();

// Generate Table (Uncomment sekali untuk membuat tabel, lalu comment lagi)
// (async()=>{ await db.sync(); })();

app.use(cors({ 
    credentials: true, 
    origin: process.env.FRONTEND_URL || 'http://localhost:5173' 
})); // Port Frontend Vite
app.use(cookieParser()); // Middleware untuk membaca cookies (refresh token)
app.use(express.json());
app.use(fileUpload());
app.use(express.static("public")); // Untuk akses gambar
app.use('/api', router); // <--- Updated for vercel routing

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server running at port ${PORT}`));