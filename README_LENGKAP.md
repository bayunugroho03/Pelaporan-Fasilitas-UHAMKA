# 📋 Dokumentasi Lengkap — Lapor UHAMKA

Aplikasi pelaporan fasilitas kampus berbasis web untuk Universitas Muhammadiyah Prof. DR. HAMKA.  
Mahasiswa dapat melaporkan kerusakan fasilitas, dan Admin dapat memverifikasi serta memberikan feedback.

---

## 🔗 Link Penting

| Platform | URL |
|----------|-----|
| 🌐 **Aplikasi Live (Vercel)** | https://pelaporan-fasilitas-uhamka.vercel.app |
| 📦 **Repository GitHub** | https://github.com/bayunugroho03/Pelaporan-Fasilitas-UHAMKA |
| 🗄️ **Database (TiDB Cloud)** | https://tidbcloud.com/clusters/10854270596852900543/overview |

---

## 🗂️ Struktur Folder Proyek

```text
Projek PKL Test/
├── vercel.json                  ← Konfigurasi deployment Vercel
├── ANALISIS_PROYEK.md           ← Dokumentasi analisis proyek
├── README_LENGKAP.md            ← Dokumentasi ini
│
├── backend/
│   ├── .env                     ← Konfigurasi environment (tidak di-commit ke GitHub)
│   ├── .gitignore
│   ├── index.js                 ← Entry point server Express
│   ├── package.json
│   ├── config/
│   │   └── Database.js          ← Konfigurasi Sequelize + TiDB
│   ├── controllers/
│   │   ├── Auth.js              ← Login, Register, Verifikasi Email, Logout
│   │   ├── RefreshToken.js      ← Refresh JWT Access Token
│   │   └── Reports.js           ← CRUD Laporan + Gambar + Kuesioner
│   ├── middleware/
│   │   └── VerifyToken.js       ← Middleware autentikasi JWT
│   ├── models/
│   │   ├── UserModel.js         ← Model tabel users
│   │   ├── ReportModel.js       ← Model tabel reports (relasi ke users)
│   │   └── QuestionnaireModel.js← Model tabel questionnaires
│   ├── routes/
│   │   └── index.js             ← Semua routing API
│   └── public/
│       └── uploads/             ← Folder upload gambar (lokal)
│
└── frontend/
    ├── package.json
    └── src/
        ├── App.jsx              ← Routing utama aplikasi
        ├── main.jsx             ← Entry point React
        ├── assets/
        │   └── logo.png         ← Logo UHAMKA
        ├── components/
        │   ├── DashboardLayout.jsx ← Layout sidebar + header (reusable)
        │   ├── Login.jsx           ← Form halaman login
        │   └── Register.jsx        ← Form halaman register
        └── pages/
            ├── admin/
            │   ├── AdminMenu.jsx        ← Dashboard Admin (statistik)
            │   ├── IncomingReports.jsx  ← Laporan Masuk (pending)
            │   └── HistoryReports.jsx   ← Arsip Laporan Selesai
            └── student/
                ├── StudentMenu.jsx      ← Dashboard Mahasiswa
                ├── CreateReport.jsx     ← Form Buat Laporan + Kuesioner
                └── MyReports.jsx        ← Riwayat Laporan Mahasiswa
```

---

## ⚙️ Teknologi yang Digunakan

### Backend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Node.js** | v18+ | Runtime JavaScript |
| **Express.js** | ^5.2.1 | Web Framework |
| **Sequelize** | ^6.37.7 | ORM untuk TiDB/MySQL |
| **mysql2** | ^3.16.1 | Driver koneksi database |
| **JWT (jsonwebtoken)** | ^9.0.3 | Autentikasi token |
| **bcrypt** | ^6.0.0 | Hash password |
| **Nodemailer** | ^7.0.13 | Pengiriman email verifikasi |
| **express-fileupload** | ^1.5.2 | Upload file gambar |
| **cookie-parser** | ^1.4.7 | Parsing cookie (refresh token) |
| **dotenv** | ^17.2.3 | Environment variables |
| **cors** | ^2.8.6 | Cross-Origin Resource Sharing |

### Frontend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **React** | ^19.2.0 | UI Library |
| **Ant Design** | ^6.2.2 | Komponen UI |
| **React Router DOM** | ^7.12.0 | Client-side routing |
| **Axios** | ^1.13.2 | HTTP Client |
| **Vite (rolldown-vite)** | 7.2.5 | Build tool / dev server |

### Hosting & Database
| Platform | Fungsi |
|----------|--------|
| **Vercel** | Hosting fullstack (Frontend + Backend Serverless) |
| **TiDB Cloud** | Database MySQL-compatible (serverless, cloud) |

---

## 🚀 Cara Menjalankan Lokal (Development)

### Prasyarat
- **Node.js** v18 atau lebih baru
- Akun **TiDB Cloud** (atau MySQL lokal jika tidak pakai TiDB)
- Akun **Gmail** dengan **App Password** untuk fitur email verifikasi

---

### STEP 1 — Konfigurasi `.env` Backend

Buka file `backend/.env` dan isi dengan konfigurasi yang sesuai:

```env
PORT=5000

# === KONEKSI DATABASE ===
# Untuk TiDB Cloud, isi dengan kredensial dari dashboard TiDB
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_USER=<username_tidb>
DB_PASS=<password_tidb>
DB_NAME=uhamka_lapor_db
DB_PORT=4000

# Untuk MySQL lokal (uncomment jika tidak pakai TiDB):
# DB_HOST=localhost
# DB_USER=root
# DB_PASS=
# DB_NAME=uhamka_lapor_db

# === JWT SECRETS ===
ACCESS_TOKEN_SECRET=rahasia_token_123
REFRESH_TOKEN_SECRET=rahasia_refresh_456

# === KONFIGURASI EMAIL (Gmail App Password) ===
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# === URL FRONTEND (untuk redirect email verifikasi) ===
# Lokal:
FRONTEND_URL=http://localhost:5173
# Production (Vercel):
# FRONTEND_URL=https://pelaporan-fasilitas-uhamka.vercel.app
```

> **Catatan:** Cara mendapatkan Gmail App Password:  
> Gmail → Manage Account → Security → 2-Step Verification → App Passwords

---

### STEP 2 — Setup Skema Database

Jika memakai **TiDB Cloud** atau **MySQL**, jalankan SQL berikut di dashboard/client SQL:

```sql
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
);

-- TABEL REPORTS
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image LONGTEXT,
    report_date VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    suggestion TEXT,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    feedback TEXT,
    userId INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- TABEL QUESTIONNAIRES (Kuesioner Kepuasan)
CREATE TABLE IF NOT EXISTS questionnaires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reportId INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reportId) REFERENCES reports(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- AKUN ADMIN (Password: admin123 — hash bcrypt di bawah)
-- Ganti hash password dengan yang di-generate ulang jika perlu
INSERT INTO users (name, email, password, role, is_verified)
VALUES (
    'Super Admin',
    'admin@uhamka.ac.id',
    '$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'admin',
    TRUE
);
```

> **Penting:** Kolom `image` harus bertipe `LONGTEXT` karena gambar disimpan sebagai **Base64** (bukan path file).

---

### STEP 3 — Jalankan Backend

```bash
cd backend
npm install
node index.js
# atau untuk development dengan auto-reload:
npx nodemon index.js
```

Server berjalan di: `http://localhost:5000`

---

### STEP 4 — Jalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka browser di: `http://localhost:5173`

---

## 🔌 API Endpoints

Semua endpoint berprefiks `/api` (contoh: `https://pelaporan-fasilitas-uhamka.vercel.app/api/login`)

### Auth & User

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| `POST` | `/api/users` | ❌ | Register mahasiswa baru |
| `POST` | `/api/login` | ❌ | Login, menghasilkan `accessToken` |
| `GET` | `/api/token` | ❌ | Refresh access token via cookie |
| `DELETE` | `/api/logout` | ❌ | Logout, hapus refresh token |
| `GET` | `/api/verify-email?token=...` | ❌ | Verifikasi email dari link yang dikirim |
| `GET` | `/api/users` | ✅ Admin | Daftar semua user |

### Laporan (Reports)

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| `GET` | `/api/reports` | ✅ | Admin: semua laporan. Mahasiswa: laporan sendiri |
| `POST` | `/api/reports` | ✅ | Kirim laporan baru (multipart/form-data + gambar) |
| `PATCH` | `/api/reports/:id/respond` | ✅ Admin | Update status (`accepted`/`rejected`) + feedback |
| `DELETE` | `/api/reports/:id` | ✅ | Hapus laporan |
| `GET` | `/api/reports/:id/image` | ❌ | Ambil gambar laporan (Base64 → binary) |

### Kuesioner

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| `POST` | `/api/questionnaire` | ✅ | Kirim rating kuesioner (1–5) setelah buat laporan |

---

## 🗺️ Routing Frontend

| Path | Komponen | Role |
|------|----------|------|
| `/` | `Login.jsx` | Semua |
| `/register` | `Register.jsx` | Semua |
| `/student` | `StudentMenu.jsx` | Mahasiswa |
| `/student/create` | `CreateReport.jsx` | Mahasiswa |
| `/student/history` | `MyReports.jsx` | Mahasiswa |
| `/admin` | `AdminMenu.jsx` | Admin |
| `/admin/incoming` | `IncomingReports.jsx` | Admin |
| `/admin/history` | `HistoryReports.jsx` | Admin |

---

## 🔄 Alur Kerja Aplikasi

### Mahasiswa
```
Register (@uhamka.ac.id)
    → Cek Email → Klik Link Verifikasi
    → Login
    → Dashboard Mahasiswa
    → Buat Laporan (foto + deskripsi + saran)
    → Isi Kuesioner (1–5 bintang)
    → Lihat Status Laporan di Riwayat
    → Baca Feedback dari Admin
```

### Admin
```
Login (admin@uhamka.ac.id)
    → Dashboard Admin (statistik: pending, selesai, jumlah mahasiswa)
    → Laporan Masuk → Terima / Tolak + isi Feedback
    → History Laporan (arsip semua yang sudah selesai)
```

---

## 📦 Deployment (Vercel)

Aplikasi di-deploy sebagai **monorepo** ke Vercel menggunakan `vercel.json`:

- **Frontend** → di-build dengan Vite, diservicekan sebagai static files
- **Backend** → berjalan sebagai **Serverless Function** (`@vercel/node`)
- **Routing** → semua request ke `/api/*` diteruskan ke backend Express

### Environment Variables di Vercel Dashboard

Tambahkan variabel berikut di **Vercel Project → Settings → Environment Variables**:

| Key | Value |
|-----|-------|
| `DB_HOST` | Host TiDB Cloud |
| `DB_USER` | Username TiDB Cloud |
| `DB_PASS` | Password TiDB Cloud |
| `DB_NAME` | `uhamka_lapor_db` |
| `DB_PORT` | `4000` |
| `ACCESS_TOKEN_SECRET` | Secret JWT access token |
| `REFRESH_TOKEN_SECRET` | Secret JWT refresh token |
| `EMAIL_USER` | Email Gmail pengirim |
| `EMAIL_PASS` | Gmail App Password |
| `FRONTEND_URL` | `https://pelaporan-fasilitas-uhamka.vercel.app` |

---

## 📌 Catatan Penting

1. **Gambar disimpan sebagai Base64** di kolom `LONGTEXT` di database — bukan sebagai file fisik. Ini dilakukan karena Vercel serverless tidak mendukung penyimpanan file permanen.

2. **Email verifikasi wajib** untuk mahasiswa. Akun mahasiswa tidak dapat login sebelum mengklik link verifikasi di inbox email `@uhamka.ac.id`.

3. **Admin tidak perlu verifikasi email**. Akun admin dibuat langsung via SQL insert ke database.

4. **Token JWT berlaku 365 hari** — untuk kemudahan saat development/PKL.

5. **`.env` tidak boleh di-commit** ke GitHub (sudah ada di `.gitignore`). Konfigurasi production diatur via Vercel Dashboard.