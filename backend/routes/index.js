import express from "express";
// Tambahkan VerifyEmailLink ke import
import { Login, Register, Logout, VerifyEmailLink, getUsers } from "../controllers/Auth.js"; 
import { 
    getReports, 
    createReport, 
    deleteReport, 
    acceptReport, 
    submitQuestionnaire,
    updateReportStatus,
    getReportImage
} from "../controllers/Reports.js"; 
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";

const router = express.Router();

// --- AUTH & USER ROUTES ---
router.post('/users', Register);
router.get('/users', verifyToken, getUsers);
router.post('/login', Login);
router.get('/token', refreshToken);
router.delete('/logout', Logout);
router.get('/verify-email', VerifyEmailLink); // <--- Route Baru untuk Link Email
router.delete('/users/reset/:email', async (req, res) => {
    // Route darurat: hapus user yang stuck (is_verified = false) agar bisa register ulang
    try {
        const Users = (await import('../models/UserModel.js')).default;
        const email = decodeURIComponent(req.params.email);
        const user = await Users.findOne({ where: { email, is_verified: false } });
        if (!user) return res.status(404).json({ msg: "User tidak ditemukan atau sudah aktif." });
        await Users.destroy({ where: { id: user.id } });
        res.json({ msg: `User ${email} berhasil dihapus. Silahkan register ulang.` });
    } catch (e) {
        res.status(500).json({ msg: e.message });
    }
});

// --- REPORT ROUTES ---
router.get('/reports/:id/image', getReportImage); // <--- OPEN ROUTE UNTUK GAMBAR LIMIT VERCEL
router.get('/reports', verifyToken, getReports);
router.post('/reports', verifyToken, createReport);
router.patch('/reports/:id/respond', verifyToken, updateReportStatus); 
router.post('/questionnaire', verifyToken, submitQuestionnaire);
router.delete('/reports/:id', verifyToken, deleteReport);

export default router;