import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// --- KONFIGURASI PENGIRIM (Nodemailer) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
    }
});

// --- LOGIN ---
export const Login = async(req, res) => {
    try {
        const user = await Users.findOne({
            where: { email: req.body.email }
        });
        
        if(!user) return res.status(404).json({msg: "Email tidak ditemukan"});

        // KHUSUS MAHASISWA: Cek Domain & Verifikasi
        if(user.role === 'mahasiswa') {
            // 1. Cek Domain
            if(!user.email.endsWith("@uhamka.ac.id")){
                 return res.status(403).json({msg: "Akses Ditolak. Mahasiswa wajib menggunakan email @uhamka.ac.id"});
            }
            // 2. Cek Status Verifikasi
            if(user.is_verified !== true){
                return res.status(403).json({msg: "Akun belum aktif! Silahkan cek inbox email Anda untuk verifikasi."});
            }
        }

        const match = await bcrypt.compare(req.body.password, user.password);
        if(!match) return res.status(400).json({msg: "Password Salah"});

        const userId = user.id || user.dataValues?.id || user.getDataValue('id');
        const name = user.name;
        const email = user.email;
        const role = user.role;
        
        const accessToken = jwt.sign({userId, name, email, role}, process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: '365d'
        });
        const refreshToken = jwt.sign({userId, name, email, role}, process.env.REFRESH_TOKEN_SECRET,{
            expiresIn: '365d'
        });

        await Users.update({refresh_token: refreshToken},{
            where:{ id: userId }
        });

        res.cookie('refreshToken', refreshToken,{
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 * 365
        });
        
        res.json({ accessToken,
            role: role
        });

    } catch (error) {
        res.status(404).json({msg: "Email tidak ditemukan"});
    }
}

// --- REGISTER ---
export const Register = async(req, res) => {
    const { name, email, password, confPassword } = req.body;
    
    // 1. VALIDASI: Wajib @uhamka.ac.id
    if(!email.endsWith("@uhamka.ac.id")){
        return res.status(400).json({msg: "Registrasi Gagal! Wajib menggunakan email @uhamka.ac.id"});
    }

    if(password !== confPassword) return res.status(400).json({msg: "Password dan Confirm Password tidak cocok"});
    
    // Cek duplikat email
    const userExist = await Users.findOne({ where: { email: email } });
    if(userExist) return res.status(400).json({msg: "Email sudah terdaftar!"});

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    try {
        // 2. Simpan User (Status Awal: Belum Aktif)
        await Users.create({
            name: name,
            email: email,
            password: hashPassword,
            role: "mahasiswa",
            is_verified: false 
        });

        // 3. Buat Token Verifikasi (Berlaku 1 Hari)
        const verificationToken = jwt.sign({email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'});

        // 4. Kirim Email Verifikasi
        // Hasilkan domain tujuan secara dinamik langsung dari Request Host
        // Mengabaikan process.env.API_URL karena terbukti malah berisi localhost:5000 di konfigurasi Vercel
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.get('host');
        const apiUrl = host ? `${protocol}://${host}/api` : 'http://localhost:5000/api';
        const url = `${apiUrl}/verify-email?token=${verificationToken}`;
        
        await transporter.sendMail({
            from: `"Lapor Fasilitas UHAMKA" <${process.env.EMAIL_USER}>`,
            to: email, 
            subject: 'Verifikasi Akun Mahasiswa',
            html: `
                <h3>Halo, ${name}</h3>
                <p>Silahkan klik link di bawah ini untuk mengaktifkan akun Anda:</p>
                <a href="${url}" style="background-color: blue; color: white; padding: 10px; text-decoration: none; border-radius: 5px;">Verifikasi Akun Saya</a>
                <p>Link berlaku 24 jam.</p>
            `
        });

        res.json({msg: "Registrasi Berhasil! Cek email Anda sekarang untuk verifikasi."});

    } catch (error) {
        console.log(error);
        res.status(500).json({msg: "Gagal mengirim email verifikasi."});
    }
}

// --- VERIFY LINK ---
export const VerifyEmailLink = async(req, res) => {
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
    const defaultFrontendUrl = isProduction ? `${protocol}://${host}` : 'http://localhost:5173';
    const frontendUrl = process.env.FRONTEND_URL || defaultFrontendUrl;
    try {
        const { token } = req.query;
        if(!token) return res.redirect(`${frontendUrl}/?error=invalid_token`);

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await Users.findOne({ where: { email: decoded.email } });
        
        if(!user) return res.redirect(`${frontendUrl}/?error=user_not_found`);
        
        // Aktifkan User
        await Users.update({ is_verified: true }, { where: { id: user.id } });

        // REDIRECT KE FRONTEND (Halaman Login) dengan parameter sukses
        res.redirect(`${frontendUrl}/?verified=true`);

    } catch (error) {
        console.log(error);
        res.redirect(`${frontendUrl}/?error=expired`);
    }
}

export const Logout = async(req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) return res.sendStatus(204);
    const user = await Users.findAll({ where:{ refresh_token: refreshToken } });
    if(!user[0]) return res.sendStatus(204);
    const userId = user[0].id;
    await Users.update({refresh_token: null},{ where:{ id: userId } });
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
}

export const getUsers = async(req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ['id', 'name', 'email', 'role', 'is_verified']
        });
        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: error.message});
    }
}