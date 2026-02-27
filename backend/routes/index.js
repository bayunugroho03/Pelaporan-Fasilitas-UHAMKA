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
    getReportImage,
    fixReportOwner
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

// --- REPORT ROUTES ---
router.get('/reports/:id/image', getReportImage); // <--- OPEN ROUTE UNTUK GAMBAR LIMIT VERCEL
router.get('/reports', verifyToken, getReports);
router.post('/reports', verifyToken, createReport);
router.patch('/reports/:id/respond', verifyToken, updateReportStatus); 
router.patch('/reports/:id/fix-owner', verifyToken, fixReportOwner); // SEMENTARA - hapus setelah digunakan
router.post('/questionnaire', verifyToken, submitQuestionnaire);
router.delete('/reports/:id', verifyToken, deleteReport);

export default router;