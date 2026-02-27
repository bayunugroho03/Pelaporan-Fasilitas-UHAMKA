# 🎓 PRESENTASI PROYEK — Lapor UHAMKA
### Sistem Pelaporan Fasilitas Kampus Berbasis Web

---

> **Tujuan dokumen ini:** Menjelaskan cara kerja program dari A sampai Z, disertai potongan kode aslinya, agar siapa pun bisa memahami alur sistem tanpa perlu membuka banyak file sekaligus.

---

## 📖 DAFTAR ISI

1. [Gambaran Besar Sistem](#1-gambaran-besar-sistem)
2. [Teknologi yang Digunakan](#2-teknologi-yang-digunakan)
3. [Alur 1 — Pengguna Buka Aplikasi](#3-alur-1--pengguna-buka-aplikasi)
4. [Alur 2 — Mahasiswa Daftar Akun](#4-alur-2--mahasiswa-daftar-akun)
5. [Alur 3 — Verifikasi Email](#5-alur-3--verifikasi-email)
6. [Alur 4 — Login](#6-alur-4--login)
7. [Alur 5 — Mahasiswa Kirim Laporan](#7-alur-5--mahasiswa-kirim-laporan)
8. [Alur 6 — Mahasiswa Lihat Riwayat Laporan](#8-alur-6--mahasiswa-lihat-riwayat-laporan)
9. [Alur 7 — Admin Lihat Laporan Masuk](#9-alur-7--admin-lihat-laporan-masuk)
10. [Alur 8 — Admin Terima atau Tolak Laporan](#10-alur-8--admin-terima-atau-tolak-laporan)
11. [Alur 9 — Logout](#11-alur-9--logout)
12. [Diagram Alur Lengkap](#12-diagram-alur-lengkap)
13. [Penjelasan Database](#13-penjelasan-database)
14. [Bagaimana Token JWT Bekerja](#14-bagaimana-token-jwt-bekerja)
15. [Bagaimana Gambar Disimpan](#15-bagaimana-gambar-disimpan)

---

## 1. Gambaran Besar Sistem

Lapor UHAMKA adalah aplikasi **web fullstack** yang terdiri dari:

```
┌─────────────────────────────────────────────────────┐
│                   INTERNET / BROWSER                │
│                                                     │
│   Mahasiswa / Admin buka:                           │
│   https://pelaporan-fasilitas-uhamka.vercel.app     │
└──────────────┬──────────────────────────────────────┘
               │  HTTP Request
               ▼
┌─────────────────────────────────────────────────────┐
│                     VERCEL                          │
│  ┌──────────────────┐    ┌───────────────────────┐  │
│  │   FRONTEND       │    │   BACKEND (API)        │  │
│  │   React + Vite   │───▶│   Express.js           │  │
│  │ (Tampilan UI)    │    │ (Logika & Data)        │  │
│  └──────────────────┘    └──────────┬────────────┘  │
└──────────────────────────────────── │ ───────────────┘
                                      │ SQL Query
                                      ▼
                          ┌───────────────────────┐
                          │    TiDB Cloud          │
                          │  (Database MySQL-like) │
                          │  Tabel: users          │
                          │  Tabel: reports        │
                          │  Tabel: questionnaires │
                          └───────────────────────┘
```

**Siapa yang menggunakan?**
- 👨‍🎓 **Mahasiswa** — daftar, login, kirim laporan kerusakan, lihat status laporan
- 👨‍💼 **Admin** — login, lihat laporan masuk, terima/tolak, beri feedback

---

## 2. Teknologi yang Digunakan

| Bagian | Teknologi | Peran |
|--------|-----------|-------|
| Tampilan | **React + Ant Design** | Membuat UI yang tampil di browser |
| Routing | **React Router** | Navigasi antar halaman tanpa reload |
| HTTP | **Axios** | Mengirim request dari frontend ke backend |
| Server | **Express.js** | Menerima request, menjalankan logika, balas response |
| Database ORM | **Sequelize** | "Jembatan" antara kode JS dan database |
| Database | **TiDB Cloud** | Menyimpan data user, laporan, kuesioner |
| Auth | **JWT** | Token digital sebagai "kartu identitas" setelah login |
| Password | **bcrypt** | Mengenkripsi password agar tidak tersimpan polos |
| Email | **Nodemailer** | Mengirim email verifikasi ke mahasiswa baru |
| Hosting | **Vercel** | Tempat aplikasi berjalan online 24/7 |

---

## 3. Alur 1 — Pengguna Buka Aplikasi

Ketika seseorang membuka URL aplikasi, yang pertama kali muncul adalah **halaman Login**.

### 📁 File: `frontend/src/App.jsx`

```jsx
function App() {
  return (
    <Routes>
      {/* "/" = halaman utama = Login */}
      <Route path="/"        element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Halaman Mahasiswa */}
      <Route path="/student"         element={<StudentMenu />} />
      <Route path="/student/create"  element={<CreateReport />} />
      <Route path="/student/history" element={<MyReports />} />

      {/* Halaman Admin */}
      <Route path="/admin"           element={<AdminMenu />} />
      <Route path="/admin/incoming"  element={<IncomingReports />} />
      <Route path="/admin/history"   element={<HistoryReports />} />
    </Routes>
  );
}
```

> 💡 **Penjelasan:** `App.jsx` adalah "peta" seluruh halaman. React Router menentukan komponen mana yang ditampilkan berdasarkan URL. Saat buka `/`, tampil Login. Saat buka `/admin`, tampil AdminMenu.

---

## 4. Alur 2 — Mahasiswa Daftar Akun

Mahasiswa klik link **"Register Mahasiswa"** di halaman Login, lalu mengisi form.

### Apa yang terjadi di FRONTEND?

📁 **File:** `frontend/src/components/Register.jsx`

```jsx
const onFinish = async (values) => {
    try {
        // Kirim data ke backend
        const res = await axios.post(`/api/users`, {
            name: values.name,
            email: values.email,
            password: values.password,
            confPassword: values.confPassword
        });
        
        alert(res.data.msg); // Muncul popup "Cek Email Anda"
        navigate("/");       // Pindah ke halaman Login
    } catch (error) {
        setMsg(error.response.data.msg); // Tampilkan pesan error
    }
};
```

> 💡 **Penjelasan:** Frontend mengirim data form ke URL `/api/users` menggunakan `axios.post`. Ini seperti "memasukkan surat ke kotak pos".

---

### Apa yang terjadi di BACKEND?

📁 **File:** `backend/controllers/Auth.js` — fungsi `Register`

```javascript
// LANGKAH 1: Validasi email domain
if(!email.endsWith("@uhamka.ac.id")){
    return res.status(400).json({msg: "Wajib menggunakan email @uhamka.ac.id"});
}

// LANGKAH 2: Cek apakah email sudah terdaftar
const userExist = await Users.findOne({ where: { email: email } });
if(userExist) return res.status(400).json({msg: "Email sudah terdaftar!"});

// LANGKAH 3: Enkripsi password
const salt = await bcrypt.genSalt();
const hashPassword = await bcrypt.hash(password, salt);

// LANGKAH 4: Simpan user ke database (status belum aktif)
await Users.create({
    name, email,
    password: hashPassword, // ← password terenkripsi, BUKAN password asli
    role: "mahasiswa",
    is_verified: false       // ← akun belum aktif!
});

// LANGKAH 5: Buat token verifikasi (berlaku 24 jam)
const verificationToken = jwt.sign({email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'});

// LANGKAH 6: Kirim email berisi link verifikasi
const url = `${apiUrl}/verify-email?token=${verificationToken}`;
await transporter.sendMail({
    to: email,
    subject: 'Verifikasi Akun Mahasiswa',
    html: `<a href="${url}">Verifikasi Akun Saya</a>`
});
```

> 💡 **Penjelasan:**  
> - `bcrypt.hash()` mengubah "password123" menjadi string acak panjang seperti `$2b$10$xKmFV...` — tidak bisa dikembalikan ke aslinya  
> - `jwt.sign()` membuat "token verifikasi" khusus yang dikirim via email  
> - User tersimpan di database **dengan `is_verified = false`** — artinya belum bisa login dulu

---

## 5. Alur 3 — Verifikasi Email

Mahasiswa membuka inbox email, klik link verifikasi yang dikirim sistem.

```
Link contoh:
https://pelaporan-fasilitas-uhamka.vercel.app/api/verify-email?token=eyJhbGci...
```

### Apa yang terjadi di BACKEND?

📁 **File:** `backend/controllers/Auth.js` — fungsi `VerifyEmailLink`

```javascript
export const VerifyEmailLink = async(req, res) => {
    // 1. Ambil token dari URL (?token=...)
    const { token } = req.query;
    if(!token) return res.redirect(`${frontendUrl}/?error=invalid_token`);

    // 2. Verifikasi token (apakah asli dan belum expired)
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // 3. Cari user berdasarkan email yang ada di dalam token
    const user = await Users.findOne({ where: { email: decoded.email } });
    
    // 4. Aktifkan akun user di database
    await Users.update({ is_verified: true }, { where: { id: user.id } });

    // 5. Redirect ke halaman login dengan pesan sukses
    res.redirect(`${frontendUrl}/?verified=true`);
}
```

> 💡 **Penjelasan:**  
> - `jwt.verify()` memeriksa apakah token di URL itu asli (bukan palsu) dan belum kadaluarsa  
> - Jika valid, kolom `is_verified` di database berubah dari `false` → `true`  
> - User di-redirect ke halaman login — sekarang sudah bisa login!

---

## 6. Alur 4 — Login

User (mahasiswa atau admin) mengisi form login dengan email dan password.

### Apa yang terjadi di FRONTEND?

📁 **File:** `frontend/src/components/Login.jsx`

```jsx
const onFinish = async (values) => {
    // 1. Kirim email + password ke backend
    const res = await axios.post(`/api/login`, values);
    
    // 2. Simpan token di browser (localStorage)
    localStorage.setItem('token', res.data.accessToken);
    
    // 3. Cek role untuk menentukan halaman tujuan
    if(res.data.role === 'admin'){
        navigate('/admin');   // ← Admin pergi ke halaman admin
    } else {
        navigate('/student'); // ← Mahasiswa pergi ke halaman mahasiswa
    }
}
```

---

### Apa yang terjadi di BACKEND?

📁 **File:** `backend/controllers/Auth.js` — fungsi `Login`

```javascript
// 1. Cari user di database berdasarkan email
const user = await Users.findOne({ where: { email: req.body.email }, raw: true });
if(!user) return res.status(404).json({msg: "Email tidak ditemukan"});

// 2. Khusus Mahasiswa: cek verifikasi email
if(user.role === 'mahasiswa') {
    if(user.is_verified !== true && user.is_verified !== 1) {
        return res.status(403).json({msg: "Akun belum aktif! Silahkan cek inbox email."});
    }
}

// 3. Cocokkan password (hash vs yang diketik)
const match = await bcrypt.compare(req.body.password, user.password);
if(!match) return res.status(400).json({msg: "Password Salah"});

// 4. Buat Access Token (untuk request API)
const accessToken = jwt.sign(
    { userId, name, email, role },  // ← Data yang "ditanam" di dalam token
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '365d' }
);

// 5. Kirim token ke frontend
res.json({ accessToken, role });
```

> 💡 **Penjelasan:**  
> - `bcrypt.compare()` membandingkan password yang diketik dengan hash yang tersimpan di database  
> - **Access Token** adalah "kartu identitas digital" — berisi data user (id, nama, email, role) yang terenkripsi  
> - Token disimpan di **localStorage** browser, dan dikirim di setiap request API selanjutnya

---

### Bagaimana Token Digunakan Selanjutnya?

📁 **File:** `backend/middleware/VerifyToken.js`

```javascript
export const verifyToken = (req, res, next) => {
    // 1. Ambil token dari header "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if(token == null) return res.sendStatus(401); // Tidak ada token = Tolak

    // 2. Periksa apakah token valid
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) return res.sendStatus(403); // Token palsu/expired = Tolak
        
        req.user = decoded; // ← Simpan data user dari dalam token ke req.user
        next(); // ← Lanjutkan ke controller
    });
}
```

> 💡 **Penjelasan:** Middleware ini seperti **satpam di pintu**. Setiap request ke endpoint yang dilindungi (misalnya `/api/reports`) akan melewati middleware ini dulu. Jika tidak ada token atau tokennya palsu, request langsung ditolak.

---

## 7. Alur 5 — Mahasiswa Kirim Laporan

Mahasiswa klik menu **"Buat Laporan"**, isi form, upload foto, lalu kirim.

### Form Laporan (2 Langkah)

📁 **File:** `frontend/src/pages/student/CreateReport.jsx`

```jsx
const CreateReport = () => {
    const [step, setStep] = useState(1); // Step 1 = Form, Step 2 = Kuesioner
    const token = localStorage.getItem('token'); // Ambil token dari browser

    // === STEP 1: Kirim Laporan ===
    const onFinishForm = async (values) => {
        // Kemas data sebagai FormData (karena ada file gambar)
        const formData = new FormData();
        formData.append("date",        values.date.format('YYYY-MM-DD'));
        formData.append("file",        fileList[0].originFileObj); // ← File gambar
        formData.append("description", values.description);
        formData.append("suggestion",  values.suggestion);

        // Kirim ke backend dengan token di header
        const res = await axios.post(`/api/reports`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        setReportId(res.data.reportId); // Simpan ID laporan
        setStep(2); // ← Pindah ke langkah kuesioner
    };

    // === STEP 2: Kirim Kuesioner ===
    const onFinishKuesioner = async (values) => {
        await axios.post(`/api/questionnaire`, {
            reportId: reportId,     // ← ID laporan yang barusan dibuat
            rating: values.rating   // ← Nilai 1-5 dari mahasiswa
        }, { headers: { 'Authorization': `Bearer ${token}` } });

        navigate('/student'); // Kembali ke dashboard
    };
}
```

---

### Apa yang terjadi di BACKEND saat menerima laporan?

📁 **File:** `backend/controllers/Reports.js` — fungsi `createReport`

```javascript
export const createReport = async(req, res) => {
    const file = req.files.file; // Ambil file gambar dari request

    // 1. Validasi tipe file
    const ext = path.extname(file.name);
    if(!['.png','.jpg','.jpeg'].includes(ext)) return res.status(422).json({msg: "Invalid Images"});
    
    // 2. Validasi ukuran file (max 5MB)
    if(file.data.length > 5000000) return res.status(422).json({msg: "Image must be less than 5 MB"});

    // 3. Konversi gambar ke Base64 (bukan simpan sebagai file)
    const mimeType = file.mimetype;
    const base64Image = `data:${mimeType};base64,${file.data.toString('base64')}`;
    //  ↑ Gambar jadi string panjang, disimpan langsung di database

    // 4. Ambil userId dari token (yang sudah diverifikasi middleware)
    let resolvedUserId = req.user.userId || req.user.id;

    // 5. Simpan laporan ke database
    const newReport = await Reports.create({
        userId:      resolvedUserId,
        image:       base64Image,  // ← Gambar tersimpan sebagai teks Base64
        report_date: req.body.date,
        description: req.body.description,
        suggestion:  req.body.suggestion,
        status:      'pending'     // ← Status awal selalu "pending"
    });

    res.status(201).json({msg: "Laporan Terkirim", reportId: newReport.id});
}
```

> 💡 **Penjelasan tentang Base64:**  
> Gambar diubah dari file binary menjadi teks panjang seperti `data:image/jpeg;base64,/9j/4AAQSkZJRgAB...`  
> Ini dilakukan karena **Vercel tidak mendukung penyimpanan file permanen** di servernya.  
> Dengan Base64, gambar langsung tersimpan di dalam database (kolom tipe `LONGTEXT`).

---

## 8. Alur 6 — Mahasiswa Lihat Riwayat Laporan

Mahasiswa klik menu **"Riwayat Laporan"** untuk melihat semua laporan yang pernah dikirim beserta statusnya.

### Yang terjadi di FRONTEND

📁 **File:** `frontend/src/pages/student/MyReports.jsx`

```jsx
const getReports = async () => {
    // Kirim request ke backend dengan token
    const res = await axiosJWT.get(`/api/reports`);
    // Backend otomatis tahu ini mahasiswa (dari token)
    // jadi hanya mengembalikan laporan MILIK mahasiswa ini saja
    setReports(res.data);
};
```

Status laporan ditampilkan dengan **warna berbeda**:

```jsx
render: (status) => {
    let color = status === 'pending'  ? 'gold'  :  // Kuning = Menunggu
                status === 'accepted' ? 'green' :  // Hijau = Diterima
                                        'red';     // Merah = Ditolak
    return <Tag color={color}>{status.toUpperCase()}</Tag>;
}
```

---

### Yang terjadi di BACKEND

📁 **File:** `backend/controllers/Reports.js` — fungsi `getReports`

```javascript
export const getReports = async(req, res) => {
    // Ambil userId dari token yang sudah diverifikasi
    let resolvedUserId = req.user.userId || req.user.id;

    if(req.user.role === "admin"){
        // Admin: ambil SEMUA laporan dari siapapun
        response = await Reports.findAll(opts);
    } else {
        // Mahasiswa: hanya ambil laporan MILIK dia sendiri
        response = await Reports.findAll({
            ...opts,
            where: { userId: resolvedUserId }  // ← Filter by userId
        });
    }
    
    // Format response: ganti kolom 'image' dengan URL endpoint gambar
    const formattedResponse = response.map(r => ({
        ...r.toJSON(),
        image: `${apiUrl}/api/reports/${r.id}/image`  // ← URL untuk ambil gambar
    }));

    res.status(200).json(formattedResponse);
}
```

> 💡 **Penjelasan:** Backend membedakan mahasiswa dan admin dari **role di dalam token**. Mahasiswa hanya melihat laporannya sendiri, admin melihat semua.

---

## 9. Alur 7 — Admin Lihat Laporan Masuk

Admin login, lalu masuk ke **Dashboard Admin** yang menampilkan statistik real-time.

### Dashboard Admin (Statistik)

📁 **File:** `frontend/src/pages/admin/AdminMenu.jsx`

```jsx
const getDashboardData = async () => {
    // 1. Ambil semua laporan
    const resReports = await axios.get(`/api/reports`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const reports = resReports.data;

    // 2. Hitung berdasarkan status
    setPendingCount(reports.filter(r => r.status === 'pending').length);
    setFinishedCount(reports.filter(r => r.status === 'accepted' 
                                      || r.status === 'rejected').length);

    // 3. Ambil data user untuk hitung mahasiswa
    const resUsers = await axios.get(`/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    setStudentCount(resUsers.data.filter(u => u.role === 'mahasiswa').length);
};
```

> 💡 **Penjelasan:** Dashboard menghitung statistik langsung dari data yang diambil API — bukan disimpan terpisah. Setiap kali halaman dibuka, angka selalu up-to-date.

---

### Tampilan Laporan Masuk

📁 **File:** `frontend/src/pages/admin/IncomingReports.jsx`

```jsx
const getReports = async () => {
    const res = await axios.get(`/api/reports`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    // Filter: hanya tampilkan laporan status 'pending'
    const pendingReports = res.data.filter(r => r.status === 'pending');
    setReports(pendingReports);
};

// Kolom tabel "Pelapor" — menampilkan nama mahasiswa pelapor
{ 
    title: 'Pelapor', 
    render: (_, record) => <b>{record.user?.name || "Tidak Diketahui"}</b>
    // record.user.name ← nama mahasiswa dari relasi JOIN tabel users
}
```

---

## 10. Alur 8 — Admin Terima atau Tolak Laporan

Admin klik tombol **Terima** atau **Tolak**, muncul popup untuk mengisi feedback, lalu konfirmasi.

### Di FRONTEND

📁 **File:** `frontend/src/pages/admin/IncomingReports.jsx`

```jsx
const submitResponse = async () => {
    if(!feedback) return message.warning("Harap isi feedback/alasan!");
    
    // Tentukan status berdasarkan tombol yang diklik
    const statusKeputusan = currentReport.actionType === 'accepted' 
        ? 'accepted' 
        : 'rejected';

    // Kirim update ke backend
    await axios.patch(`/api/reports/${currentReport.id}/respond`, {
        status: statusKeputusan, // 'accepted' atau 'rejected'
        feedback: feedback        // Pesan dari admin ke mahasiswa
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });

    getReports(); // Refresh tabel (laporan yang diproses hilang dari list)
}
```

---

### Di BACKEND

📁 **File:** `backend/controllers/Reports.js` — fungsi `updateReportStatus`

```javascript
export const updateReportStatus = async (req, res) => {
    const { id } = req.params;       // ID laporan dari URL
    const { status, feedback } = req.body; // Status + feedback dari admin

    // Update 2 kolom sekaligus di tabel reports
    await Reports.update(
        { status, feedback },    // ← Yang diubah
        { where: { id } }        // ← Laporan mana yang diubah
    );

    res.status(200).json({ msg: "Status Laporan Diupdate!" });
}
```

> 💡 **Penjelasan alur lengkap Terima/Tolak:**  
> 1. Admin klik "Terima" → muncul popup feedback  
> 2. Admin isi pesan → klik "Kirim Keputusan"  
> 3. Frontend kirim `PATCH /api/reports/:id/respond` ke backend  
> 4. Backend update kolom `status` dan `feedback` di tabel `reports`  
> 5. Laporan berubah dari `pending` → `accepted` atau `rejected`  
> 6. Di tabel Laporan Masuk, laporan itu hilang (sudah tidak `pending`)  
> 7. Di tabel History, laporan itu muncul (sudah `accepted`/`rejected`)  
> 8. Mahasiswa buka "Riwayat Laporan" → status dan feedback sudah ter-update

---

## 11. Alur 9 — Logout

📁 **File:** `frontend/src/components/DashboardLayout.jsx`

```jsx
const handleLogout = () => {
    localStorage.removeItem('token'); // ← Hapus token dari browser
    navigate('/');                    // ← Kembali ke halaman login
};
```

📁 **File:** `backend/controllers/Auth.js` — fungsi `Logout`

```javascript
export const Logout = async(req, res) => {
    const refreshToken = req.cookies.refreshToken;
    
    // Hapus refresh token dari database
    const user = await Users.findAll({ where: { refresh_token: refreshToken } });
    await Users.update({refresh_token: null}, { where: { id: user[0].id } });
    
    res.clearCookie('refreshToken'); // Hapus cookie dari browser
    return res.sendStatus(200);
}
```

> 💡 **Penjelasan:** Ada 2 langkah logout:  
> 1. **Di browser:** token dihapus dari `localStorage` → user tidak bisa request API lagi  
> 2. **Di server:** refresh token di database di-set null → token lama tidak bisa dipakai

---

## 12. Diagram Alur Lengkap

```
MAHASISWA                        BACKEND                    DATABASE (TiDB)
─────────                        ───────                    ───────────────
  │                                  │                            │
  │ Buka /register                   │                            │
  │ ─── POST /api/users ────────────▶│                            │
  │                                  │── INSERT users (is_verified=false) ──▶│
  │                                  │── Kirim email verifikasi              │
  │◀── "Cek email Anda" ─────────────│                            │
  │                                  │                            │
  │ Klik link di email               │                            │
  │ ─── GET /api/verify-email ──────▶│                            │
  │                                  │── UPDATE users SET is_verified=true ─▶│
  │◀── Redirect ke /login ───────────│                            │
  │                                  │                            │
  │ Isi form login                   │                            │
  │ ─── POST /api/login ────────────▶│                            │
  │                                  │── SELECT users WHERE email ──────────▶│
  │                                  │◀── user data ─────────────────────────│
  │                                  │── bcrypt.compare(password, hash)      │
  │◀── { accessToken, role } ────────│                            │
  │                                  │                            │
  │ Simpan token di localStorage     │                            │
  │ Navigasi ke /student             │                            │
  │                                  │                            │
  │ Isi form laporan + upload foto   │                            │
  │ ─── POST /api/reports ──────────▶│                            │
  │         (Bearer token)           │── Verifikasi JWT           │
  │                                  │── Konversi gambar → Base64 │
  │                                  │── INSERT reports ────────────────────▶│
  │◀── { reportId } ─────────────────│                            │
  │                                  │                            │
  │ Isi kuesioner (rating 1-5)       │                            │
  │ ─── POST /api/questionnaire ────▶│                            │
  │                                  │── INSERT questionnaires ─────────────▶│
  │◀── "Terimakasih!" ───────────────│                            │
  │                                  │                            │
  │ Lihat riwayat laporan            │                            │
  │ ─── GET /api/reports ───────────▶│                            │
  │         (Bearer token)           │── SELECT reports WHERE userId ───────▶│
  │◀── [ list laporan saya ] ────────│                            │
  │                                  │                            │

ADMIN                            BACKEND                    DATABASE (TiDB)
─────                            ───────                    ───────────────
  │ Login (admin@uhamka.ac.id)       │                            │
  │ ─── POST /api/login ────────────▶│                            │
  │◀── { accessToken, role:'admin' } │                            │
  │                                  │                            │
  │ Buka /admin/incoming             │                            │
  │ ─── GET /api/reports ───────────▶│                            │
  │◀── [ SEMUA laporan pending ] ────│                            │
  │                                  │                            │
  │ Klik "Terima" + isi feedback     │                            │
  │ ─── PATCH /api/reports/:id ─────▶│                            │
  │         /respond                 │── UPDATE reports SET status, feedback ▶│
  │◀── "Status Diupdate!" ───────────│                            │
  │                                  │                            │
```

---

## 13. Penjelasan Database

### Tabel `users`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INT AUTO_INCREMENT | ID unik tiap user |
| `name` | VARCHAR | Nama lengkap |
| `email` | VARCHAR UNIQUE | Email, harus `@uhamka.ac.id` untuk mahasiswa |
| `password` | VARCHAR | Password terenkripsi (bcrypt hash) |
| `role` | VARCHAR | `'mahasiswa'` atau `'admin'` |
| `is_verified` | BOOLEAN | `false` = belum aktif, `true` = sudah bisa login |
| `refresh_token` | TEXT | Token untuk memperbarui sesi, disimpan saat login |

### Tabel `reports`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INT AUTO_INCREMENT | ID unik laporan |
| `userId` | INT | Foreign key → tabel `users` (siapa yang melaporkan) |
| `image` | LONGTEXT | Foto bukti kerusakan dalam format **Base64** |
| `report_date` | VARCHAR | Tanggal bukti kerusakan |
| `description` | TEXT | Deskripsi detail kerusakan |
| `suggestion` | TEXT | Saran perbaikan dari mahasiswa |
| `status` | ENUM | `'pending'` / `'accepted'` / `'rejected'` |
| `feedback` | TEXT | Pesan balasan dari admin |

### Tabel `questionnaires`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INT AUTO_INCREMENT | ID unik |
| `reportId` | INT | Foreign key → tabel `reports` |
| `rating` | INT | Nilai kepuasan 1–5 dari mahasiswa |

### Relasi Antar Tabel

```
users ──────────────── reports ──────────────── questionnaires
  id ◀─── userId          id ◀─── reportId           id
  name                    image                       reportId
  email                   description                 rating
  ...                     status
                          feedback
```

📁 **File:** `backend/models/ReportModel.js`

```javascript
// Definisi relasi (JOIN antar tabel)
Users.hasMany(Reports, { foreignKey: 'userId', sourceKey: 'id' });
Reports.belongsTo(Users, { foreignKey: 'userId', targetKey: 'id' });
// Artinya: 1 User bisa punya banyak Report
// Setiap Report punya 1 User pemilik
```

---

## 14. Bagaimana Token JWT Bekerja

JWT (JSON Web Token) adalah cara sistem mengenali siapa Anda tanpa harus selalu cek database.

```
SAAT LOGIN:
─────────────────────────────────────
Backend mengambil data user dari DB:
  { userId: 6, name: "Bayu Cahyo", email: "bayu@uhamka.ac.id", role: "mahasiswa" }

Lalu "ditandatangani" dengan secret key dan dikemas jadi token:
  eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjYsIm5hbWUiOiJCYXl1IENhaHlvIn0.xyz...
  │─── Header ───│  │──────────── Payload (data user) ────────────│  │Signature│

Token dikirim ke browser, disimpan di localStorage.


SAAT REQUEST KE API:
─────────────────────────────────────
Browser mengirim:
  GET /api/reports
  Authorization: Bearer eyJhbGci...

Backend (middleware) membaca token:
  jwt.verify(token, SECRET) → { userId: 6, name: "Bayu", role: "mahasiswa" }

Sekarang backend tahu: "Yang request ini adalah Bayu, role mahasiswa"
→ Hanya tampilkan laporan milik userId=6
```

> ⚠️ **Penting:** Token yang tersimpan di `localStorage` TIDAK boleh dibagikan ke orang lain. Siapapun yang punya token bisa mengakses akun Anda. Itulah kenapa logout menghapus token.

---

## 15. Bagaimana Gambar Disimpan

Karena Vercel sebagai hosting tidak mendukung file upload permanen, gambar dikonversi ke **Base64**.

```
PROSES UPLOAD GAMBAR:
──────────────────────────────────────────────────────────

  Mahasiswa pilih file: foto_kerusakan.jpg (500KB)
                  │
                  ▼
  Frontend kirim via FormData ke /api/reports
                  │
                  ▼
  Backend terima file binary:
    file.data → <Buffer ff d8 ff e0 00 10 4a 46 49 46...>
                  │
                  ▼
  Backend konversi ke Base64 string:
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAw..."
    (string teks sangat panjang, sekitar 667KB untuk 500KB gambar asli)
                  │
                  ▼
  Disimpan di kolom `image` tabel reports (tipe LONGTEXT)


PROSES MENAMPILKAN GAMBAR:
──────────────────────────────────────────────────────────

  Admin/Mahasiswa buka halaman yang ada gambar
                  │
                  ▼
  Frontend request: GET /api/reports/:id/image
                  │
                  ▼
  Backend ambil kolom image dari database (string Base64)
  Deteksi format: "data:image/jpeg;base64,..."
  Konversi balik ke binary: Buffer.from(base64data, 'base64')
  Kirim sebagai response binary dengan Content-Type: image/jpeg
                  │
                  ▼
  Browser menampilkan gambar ✅
```

---

## 🎯 Ringkasan Singkat

| Aksi | Endpoint | Siapa |
|------|----------|-------|
| Daftar akun | `POST /api/users` | Mahasiswa (publik) |
| Verifikasi email | `GET /api/verify-email?token=...` | Sistem (via email) |
| Login | `POST /api/login` | Semua (publik) |
| Kirim laporan | `POST /api/reports` | Mahasiswa (butuh token) |
| Lihat laporan sendiri | `GET /api/reports` | Mahasiswa (butuh token) |
| Lihat semua laporan | `GET /api/reports` | Admin (butuh token) |
| Terima/Tolak laporan | `PATCH /api/reports/:id/respond` | Admin (butuh token) |
| Kirim kuesioner | `POST /api/questionnaire` | Mahasiswa (butuh token) |
| Logout | `DELETE /api/logout` | Semua (butuh token) |

---

*Dibuat 28 Februari 2026 — Projek PKL UHAMKA*
