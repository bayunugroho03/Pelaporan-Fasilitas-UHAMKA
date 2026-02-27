# Dokumentasi Lengkap - Lapor UHAMKA

Aplikasi pelaporan fasilitas kampus berbasis web untuk Universitas Muhammadiyah Prof. DR. HAMKA.

---

## Persiapan Awal (Prerequisites)

1. **Node.js** (v18+)
2. **XAMPP/Laragon** (Apache & MySQL berjalan)
3. **Code Editor** (VS Code)

Jika sudah di hosting, tidak perlu XAMPP/Laragon, ini sudah memakai Vercel dan TiDB (akun kampus)

---

## Struktur Folder Proyek

```text
Projek PKL Test/
├── backend/
│   ├── config/
│   │   └── Database.js
│   ├── controllers/
│   │   ├── Auth.js
│   │   ├── RefreshToken.js
│   │   └── Reports.js
│   ├── middleware/
│   │   └── VerifyToken.js
│   ├── models/
│   │   ├── UserModel.js
│   │   ├── ReportModel.js
│   │   └── QuestionnaireModel.js
│   ├── routes/
│   │   └── index.js
│   ├── public/
│   │   └── uploads/
│   ├── .env
│   └── index.js
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   │   ├── logo.png
│   │   │   └── mahasiswa.png
│   │   ├── components/
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── StudentDashboard.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminMenu.jsx
│   │   │   │   ├── IncomingReports.jsx
│   │   │   │   └── HistoryReports.jsx
│   │   │   ├── student/
│   │   │   │   ├── StudentMenu.jsx
│   │   │   │   ├── CreateReport.jsx
│   │   │   │   └── MyReports.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
```

---

## STEP 1: Konfigurasi Database (MySQL)

Buka **phpMyAdmin** (`http://localhost/phpmyadmin`), buat database: `uhamka_lapor_db`

```sql
-- =============================================
-- DATABASE SETUP: Lapor UHAMKA
-- =============================================

CREATE DATABASE IF NOT EXISTS uhamka_lapor_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE uhamka_lapor_db;

-- TABEL USERS
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'mahasiswa',
    is_verified BOOLEAN DEFAULT FALSE,
    refresh_token TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- TABEL REPORTS
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(255),
    report_date VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    suggestion TEXT,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    feedback TEXT,
    userId INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- TABEL QUESTIONNAIRES
CREATE TABLE IF NOT EXISTS questionnaires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reportId INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reportId) REFERENCES reports(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- AKUN ADMIN (Password: admin123)
INSERT INTO users (name, email, password, role, is_verified) 
VALUES (
    'Super Admin', 
    'admin@uhamka.ac.id', 
    '$2b$10$abcdefghijklmnopqrstuuXYZ123456789abcdef', 
    'admin', 
    TRUE
);
```

---

## STEP 2: Setup Backend

### Install Dependencies

```bash
cd backend
npm install
```

### Dependencies yang Digunakan

```json
{
  "dependencies": {
    "bcrypt": "^6.0.0",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.6",
    "dotenv": "^17.2.3",
    "express": "^5.2.1",
    "express-fileupload": "^1.5.2",
    "jsonwebtoken": "^9.0.3",
    "mysql2": "^3.16.1",
    "nodemailer": "^7.0.13",
    "sequelize": "^6.37.7"
  },
  "devDependencies": {
    "nodemon": "^3.1.11"
  }
}
```

### File: `backend/.env`

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=uhamka_lapor_db

ACCESS_TOKEN_SECRET=rahasia_token_123
REFRESH_TOKEN_SECRET=rahasia_refresh_456

# KONFIGURASI EMAIL (Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### File: `backend/config/Database.js`

```javascript
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "mysql"
});

export default db;
```

### File: `backend/models/UserModel.js`

```javascript
import { Sequelize } from "sequelize";
import db from "../config/Database.js";
const { DataTypes } = Sequelize;

const Users = db.define('users', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    is_verified: DataTypes.BOOLEAN,
    refresh_token: DataTypes.TEXT
}, { freezeTableName: true });

export default Users;
```

### File: `backend/models/ReportModel.js`

```javascript
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
    feedback: DataTypes.TEXT,
    userId: DataTypes.INTEGER
}, { freezeTableName: true });

Users.hasMany(Reports);
Reports.belongsTo(Users, { foreignKey: 'userId' });

export default Reports;
```

### File: `backend/models/QuestionnaireModel.js`

```javascript
import { Sequelize } from "sequelize";
import db from "../config/Database.js";
const { DataTypes } = Sequelize;

const Questionnaires = db.define('questionnaires', {
    reportId: DataTypes.INTEGER,
    rating: DataTypes.INTEGER
}, { freezeTableName: true });

export default Questionnaires;
```

### File: `backend/controllers/Auth.js`

```javascript
import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
    }
});

export const Login = async(req, res) => {
    try {
        const user = await Users.findOne({ where: { email: req.body.email } });
        if(!user) return res.status(404).json({msg: "Email tidak ditemukan"});

        if(user.role === 'mahasiswa') {
            if(!user.email.endsWith("@uhamka.ac.id")){
                 return res.status(403).json({msg: "Akses Ditolak. Mahasiswa wajib menggunakan email @uhamka.ac.id"});
            }
            if(user.is_verified !== true){
                return res.status(403).json({msg: "Akun belum aktif! Silahkan cek inbox email Anda untuk verifikasi."});
            }
        }

        const match = await bcrypt.compare(req.body.password, user.password);
        if(!match) return res.status(400).json({msg: "Password Salah"});

        const { id: userId, name, email, role } = user;
        
        const accessToken = jwt.sign({userId, name, email, role}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '365d' });
        const refreshToken = jwt.sign({userId, name, email, role}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '365d' });

        await Users.update({refresh_token: refreshToken}, { where: { id: userId } });

        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 * 365 });
        res.json({ accessToken, role });
    } catch (error) {
        res.status(404).json({msg: "Email tidak ditemukan"});
    }
}

export const Register = async(req, res) => {
    const { name, email, password, confPassword } = req.body;
    
    if(!email.endsWith("@uhamka.ac.id")){
        return res.status(400).json({msg: "Registrasi Gagal! Wajib menggunakan email @uhamka.ac.id"});
    }
    if(password !== confPassword) return res.status(400).json({msg: "Password tidak cocok"});
    
    const userExist = await Users.findOne({ where: { email } });
    if(userExist) return res.status(400).json({msg: "Email sudah terdaftar!"});

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    try {
        await Users.create({ name, email, password: hashPassword, role: "mahasiswa", is_verified: false });

        const verificationToken = jwt.sign({email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'});
        const url = `http://localhost:5000/verify-email?token=${verificationToken}`;
        
        await transporter.sendMail({
            from: `"Lapor Fasilitas UHAMKA" <${process.env.EMAIL_USER}>`,
            to: email, 
            subject: 'Verifikasi Akun Mahasiswa',
            html: `<h3>Halo, ${name}</h3><p>Klik link berikut untuk verifikasi:</p><a href="${url}">Verifikasi Akun</a>`
        });

        res.json({msg: "Registrasi Berhasil! Cek email Anda untuk verifikasi."});
    } catch (error) {
        res.status(500).json({msg: "Gagal mengirim email verifikasi."});
    }
}

export const VerifyEmailLink = async(req, res) => {
    try {
        const { token } = req.query;
        if(!token) return res.redirect('http://localhost:5173/?error=invalid_token');

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await Users.findOne({ where: { email: decoded.email } });
        if(!user) return res.redirect('http://localhost:5173/?error=user_not_found');
        
        await Users.update({ is_verified: true }, { where: { id: user.id } });
        res.redirect('http://localhost:5173/?verified=true');
    } catch (error) {
        res.redirect('http://localhost:5173/?error=expired');
    }
}

export const Logout = async(req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) return res.sendStatus(204);
    const user = await Users.findAll({ where: { refresh_token: refreshToken } });
    if(!user[0]) return res.sendStatus(204);
    await Users.update({refresh_token: null}, { where: { id: user[0].id } });
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
}
```

### File: `backend/controllers/Reports.js`

```javascript
import Reports from "../models/ReportModel.js";
import Questionnaires from "../models/QuestionnaireModel.js";
import Users from "../models/UserModel.js";
import path from "path";
import fs from "fs";

export const getReports = async(req, res) => {
    try {
        let response;
        if(req.user.role === "admin"){
            response = await Reports.findAll({
                attributes:['id','image','report_date','description','suggestion','status','feedback'],
                include:[{ model: Users, attributes:['name','email'] }]
            });
        } else {
            response = await Reports.findAll({
                attributes:['id','image','report_date','description','suggestion','status','feedback'],
                where: { userId: req.user.userId },
                include:[{ model: Users, attributes:['name','email'] }]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const createReport = async(req, res) => {
    if(req.files === null) return res.status(400).json({msg: "No File Uploaded"});
    const file = req.files.file;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;
    const allowedType = ['.png','.jpg','.jpeg'];

    if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({msg: "Invalid Images"});
    if(file.data.length > 5000000) return res.status(422).json({msg: "Image must be less than 5 MB"});

    file.mv(`./public/uploads/${fileName}`, async(err) => {
        if(err) return res.status(500).json({msg: err.message});
        try {
            const newReport = await Reports.create({
                userId: req.user.userId,
                image: url,
                report_date: req.body.date,
                description: req.body.description,
                suggestion: req.body.suggestion,
                status: 'pending'
            });
            res.status(201).json({msg: "Laporan Terkirim", reportId: newReport.id});
        } catch (error) {
            res.status(500).json({msg: error.message});
        }
    });
}

export const updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, feedback } = req.body;
        await Reports.update({ status, feedback }, { where: { id } });
        res.status(200).json({ msg: "Status Laporan Diupdate!" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const deleteReport = async(req, res) => {
    const report = await Reports.findOne({ where: { id: req.params.id } });
    if(!report) return res.status(404).json({msg: "No Data Found"});
    try {
        const fileName = report.image.split('/uploads/')[1];
        const filepath = `./public/uploads/${fileName}`;
        if(fs.existsSync(filepath)) fs.unlinkSync(filepath);
        await Reports.destroy({ where: { id: req.params.id } });
        res.status(200).json({msg: "Laporan Dihapus"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const submitQuestionnaire = async(req, res) => {
    try {
        await Questionnaires.create({ reportId: req.body.reportId, rating: req.body.rating });
        res.json({msg: "Terimakasih!"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}
```

### File: `backend/controllers/RefreshToken.js`

```javascript
import Users from "../models/UserModel.js";
import jwt from "jsonwebtoken";

export const refreshToken = async(req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.sendStatus(401);
        
        const user = await Users.findAll({ where: { refresh_token: refreshToken } });
        if(!user[0]) return res.sendStatus(403);
        
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if(err) return res.sendStatus(403);
            const { id: userId, name, email, role } = user[0];
            const accessToken = jwt.sign({userId, name, email, role}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20s' });
            res.json({ accessToken });
        });
    } catch (error) {
        console.log(error);
    }
}
```

### File: `backend/middleware/VerifyToken.js`

```javascript
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) return res.sendStatus(403);
        req.user = decoded;
        next();
    });
}
```

### File: `backend/routes/index.js`

```javascript
import express from "express";
import { Login, Register, Logout, VerifyEmailLink } from "../controllers/Auth.js"; 
import { getReports, createReport, deleteReport, submitQuestionnaire, updateReportStatus } from "../controllers/Reports.js"; 
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";

const router = express.Router();

// AUTH ROUTES
router.post('/users', Register);
router.post('/login', Login);
router.get('/token', refreshToken);
router.delete('/logout', Logout);
router.get('/verify-email', VerifyEmailLink);

// REPORT ROUTES (Protected)
router.get('/reports', verifyToken, getReports);
router.post('/reports', verifyToken, createReport);
router.patch('/reports/:id/respond', verifyToken, updateReportStatus); 
router.post('/questionnaire', verifyToken, submitQuestionnaire);
router.delete('/reports/:id', verifyToken, deleteReport);

export default router;
```

### File: `backend/index.js`

```javascript
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import db from "./config/Database.js";
import fileUpload from "express-fileupload";
import router from "./routes/index.js";
import Users from "./models/UserModel.js";
import Reports from "./models/ReportModel.js";
import Questionnaires from "./models/QuestionnaireModel.js";

dotenv.config();
const app = express();

// Uncomment sekali untuk generate tabel
// (async()=>{ await db.sync(); })();

app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
app.use(cookieParser());
app.use(express.json());
app.use(fileUpload());
app.use(express.static("public"));
app.use(router);

app.listen(5000, () => console.log('Server running at port 5000'));
```

### Cara Jalankan Backend

```bash
cd backend
nodemon index
# atau
node index.js
```

---

## STEP 3: Setup Frontend

### Install Dependencies

```bash
cd frontend
npm install
```

### Dependencies yang Digunakan

```json
{
  "dependencies": {
    "@ant-design/icons": "^6.1.0",
    "antd": "^6.2.2",
    "axios": "^1.13.2",
    "jwt-decode": "^4.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.12.0"
  }
}
```

### File: `frontend/src/main.jsx`

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import axios from "axios";
import { BrowserRouter } from "react-router-dom";

axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

### File: `frontend/src/App.jsx`

```javascript
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
// Student Pages
import StudentMenu from "./pages/student/StudentMenu";
import CreateReport from "./pages/student/CreateReport";
import MyReports from "./pages/student/MyReports";
// Admin Pages
import AdminMenu from "./pages/admin/AdminMenu";
import IncomingReports from "./pages/admin/IncomingReports";
import HistoryReports from "./pages/admin/HistoryReports";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Student Routes */}
      <Route path="/student" element={<StudentMenu />} />
      <Route path="/student/create" element={<CreateReport />} />
      <Route path="/student/history" element={<MyReports />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminMenu />} />
      <Route path="/admin/incoming" element={<IncomingReports />} />
      <Route path="/admin/history" element={<HistoryReports />} />
    </Routes>
  );
}

export default App;
```

### Cara Jalankan Frontend

```bash
cd frontend
npm run dev
```

Buka browser di `http://localhost:5173`

---

## Ringkasan Alur Kerja Aplikasi

### 1. Register Mahasiswa
- User mengisi form register dengan email `@uhamka.ac.id`
- Backend mengirim email verifikasi ke inbox user
- User klik link verifikasi untuk mengaktifkan akun

### 2. Login & Dashboard Mahasiswa
- Login → Masuk ke Dashboard Mahasiswa (`/student`)
- Menu: **Dashboard**, **Buat Laporan**, **Riwayat Laporan**
- Isi Form Laporan → Upload Gambar → Isi Kuesioner (1-5) → Selesai

### 3. Login & Dashboard Admin
- Login dengan akun admin → Masuk ke Dashboard Admin (`/admin`)
- Menu: **Dashboard**, **Laporan Masuk**, **History Laporan**
- Lihat statistik: Pending, Selesai, Mahasiswa Terdaftar
- Verifikasi laporan: **Terima** atau **Tolak** dengan feedback

---

## API Endpoints

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST | `/users` | Register mahasiswa |
| POST | `/login` | Login user |
| GET | `/token` | Refresh access token |
| DELETE | `/logout` | Logout user |
| GET | `/verify-email` | Verifikasi email |
| GET | `/reports` | Get semua laporan (admin) / laporan sendiri (mahasiswa) |
| POST | `/reports` | Buat laporan baru |
| PATCH | `/reports/:id/respond` | Update status laporan (admin) |
| DELETE | `/reports/:id` | Hapus laporan |
| POST | `/questionnaire` | Kirim kuesioner |

---

## Teknologi yang Digunakan

### Backend
- **Express.js** - Web framework
- **Sequelize** - ORM untuk MySQL
- **JWT** - Autentikasi token
- **Nodemailer** - Pengiriman email
- **bcrypt** - Hash password

### Frontend
- **React 19** - UI Library
- **Ant Design 6** - UI Component Library
- **React Router 7** - Client-side routing
- **Axios** - HTTP client

---

## Catatan Penting

1. **Pastikan XAMPP berjalan** sebelum menjalankan backend
2. **Buat folder `public/uploads`** di backend untuk menyimpan gambar
3. **Konfigurasi email Gmail** memerlukan App Password (bukan password biasa)
4. Token akses berlaku **365 hari** untuk kemudahan development