# Analisis Proyek: Lapor UHAMKA

## 📋 Ringkasan Proyek

**Lapor UHAMKA** adalah aplikasi web full-stack untuk pelaporan kerusakan fasilitas kampus UHAMKA. Mahasiswa dapat melaporkan kerusakan fasilitas dengan bukti gambar, dan admin dapat mengelola laporan tersebut.

---

## 🏗️ Arsitektur Teknologi

```
Frontend (Port 5173)          Backend (Port 5000)          Database
├── React 19 + Vite    ──►    ├── Express.js 5      ──►   MySQL (XAMPP)
├── Ant Design 6              ├── Sequelize ORM
└── Axios HTTP Client         └── JWT Authentication
```

---

## 📁 Struktur Folder

| Folder | Deskripsi |
|--------|-----------|
| `backend/` | Server Node.js + Express |
| `backend/config/` | Konfigurasi database |
| `backend/controllers/` | Logic bisnis (Auth, Reports) |
| `backend/models/` | Model Sequelize (User, Report, Questionnaire) |
| `backend/routes/` | API endpoints |
| `frontend/` | React + Vite application |
| `frontend/src/components/` | Komponen reusable (Login, Register, Layout) |
| `frontend/src/pages/` | Halaman-halaman aplikasi |

---

## 👥 Fitur Berdasarkan Role

### 🎓 Mahasiswa
| Fitur | Route | Deskripsi |
|-------|-------|-----------|
| Login | `/` | Login dengan email @uhamka.ac.id |
| Register | `/register` | Daftar akun baru |
| Menu Utama | `/student` | Dashboard mahasiswa |
| Buat Laporan | `/student/create` | Form laporan + upload gambar + kuesioner |
| Riwayat | `/student/history` | Lihat laporan yang pernah dibuat |

### 👨‍💼 Admin  
| Fitur | Route | Deskripsi |
|-------|-------|-----------|
| Login | `/` | Login sebagai admin |
| Menu Utama | `/admin` | Dashboard admin |
| Laporan Masuk | `/admin/incoming` | Review & approve/reject laporan |
| Riwayat | `/admin/history` | Lihat semua laporan yang sudah diproses |

---

## 🔐 Sistem Autentikasi

**Akun Admin Default:**
- Email: `admin123@gmail.com`
- Password: `admin123`

**Pendaftaran Mahasiswa:**
- Wajib menggunakan email `@uhamka.ac.id`
- Verifikasi email melalui link di console backend (simulasi)

---

## 🗄️ Model Database

### Users
| Field | Type | Keterangan |
|-------|------|------------|
| id | INT | Primary Key |
| name | VARCHAR | Nama lengkap |
| email | VARCHAR | Email (unique) |
| password | VARCHAR | Password (bcrypt hash) |
| role | ENUM | 'admin' / 'mahasiswa' |
| is_verified | BOOLEAN | Status verifikasi email |

### Reports
| Field | Type | Keterangan |
|-------|------|------------|
| id | INT | Primary Key |
| user_id | INT | Foreign Key ke Users |
| image | VARCHAR | URL gambar bukti |
| report_date | VARCHAR | Tanggal laporan |
| description | TEXT | Deskripsi kerusakan |
| suggestion | TEXT | Saran perbaikan |
| status | ENUM | 'pending' / 'accepted' |
| feedback | TEXT | Tanggapan admin |

### Questionnaires
| Field | Type | Keterangan |
|-------|------|------------|
| id | INT | Primary Key |
| report_id | INT | Foreign Key ke Reports |
| rating | INT | Rating 1-10 |

---

## 🚀 Cara Menjalankan

### Prerequisites
1. **Node.js** terinstall
2. **XAMPP** berjalan (Apache & MySQL)
3. Database `uhamka_lapor_db` sudah dibuat

### Langkah-langkah

```bash
# 1. Jalankan Backend
cd backend
node index.js
# Server berjalan di http://localhost:5000

# 2. Jalankan Frontend (terminal baru)
cd frontend
npm run dev
# Aplikasi berjalan di http://localhost:5173
```

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/login` | ❌ | Login user |
| POST | `/users` | ❌ | Register mahasiswa |
| GET | `/verify-email` | ❌ | Verifikasi email |
| GET | `/reports` | ✅ | Ambil semua laporan |
| POST | `/reports` | ✅ | Buat laporan baru |
| DELETE | `/reports/:id` | ✅ | Hapus laporan |
| PATCH | `/reports/:id/respond` | ✅ | Update status laporan |
| POST | `/questionnaire` | ✅ | Submit kuesioner |

---

## 🎨 UI/UX Overview

Frontend menggunakan **Ant Design** untuk komponen UI yang modern:

- **Card** - Container untuk form dan konten
- **Form** - Input tervalidasi
- **Table** - Tampilan data laporan
- **Modal** - Dialog konfirmasi
- **Message** - Notifikasi feedback
- **Upload** - Upload gambar dengan preview

---

## ⚙️ Konfigurasi Environment

File `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=uhamka_lapor_db
ACCESS_TOKEN_SECRET=rahasia_token_123
```
