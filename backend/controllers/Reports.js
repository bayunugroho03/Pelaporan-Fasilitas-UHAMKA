import Reports from "../models/ReportModel.js";
import Questionnaires from "../models/QuestionnaireModel.js";
import Users from "../models/UserModel.js";
import path from "path";
import fs from "fs";
import os from "os";

export const getReports = async(req, res) => {
    try {
        let response;
        // Jika user adalah ADMIN, tampilkan SEMUA laporan
        if(req.user.role === "admin"){
            response = await Reports.findAll({
                attributes:['id','image','report_date','description','suggestion','status','feedback'],
                include:[{
                    model: Users,
                    attributes:['name','email']
                }]
            });
        } else {
            // Jika user adalah MAHASISWA, tampilkan HANYA laporan miliknya (req.user.userId)
            response = await Reports.findAll({
                attributes:['id','image','report_date','description','suggestion','status','feedback'],
                where:{
                    userId: req.user.userId || req.user.id // Filter berdasarkan ID user yang login
                },
                include:[{
                    model: Users,
                    attributes:['name','email']
                }]
            });
        }

        // Fix CORS and Mixed Content on old data
        const apiUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
        const formattedResponse = response.map(r => {
            let img = r.image;
            if (img && img.includes('localhost:5000')) {
                img = img.replace(/http:\/\/localhost:5000\/uploads/g, `${apiUrl}/api/uploads`);
            }
            return {
                ...r.toJSON(),
                image: img
            };
        });

        res.status(200).json(formattedResponse);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const createReport = async(req, res) => {
    try {
        if(!req.files || !req.files.file) return res.status(400).json({msg: "No File Uploaded"});
        
        const file = req.files.file;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const allowedType = ['.png','.jpg','.jpeg'];

        if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({msg: "Invalid Images"});
        if(fileSize > 5000000) return res.status(422).json({msg: "Image must be less than 5 MB"});

        // CONVERT IMAGE DIRECTLY TO BASE64
        const mimeType = file.mimetype || 'image/jpeg';
        const base64Image = `data:${mimeType};base64,${file.data.toString('base64')}`;

        // Bypassing Token Requirement (Atas permohonan User)
        let resolvedUserId = null;
        if (req.user) {
            resolvedUserId = req.user.userId || req.user.id;
            if (!resolvedUserId && req.user.email) {
                const usr = await Users.findOne({ where: { email: req.user.email }, raw: true });
                if (usr) resolvedUserId = usr.id;
            }
        }

        // Jika tidak ada Token / Token rusak, PAKAI FALLBACK.
        if (!resolvedUserId) {
            console.log("Token ID missing/bypassed. Using fallback user to save report.");
             // Dicari mahasiswa acak sebagai pemilik laporan
            const fallbackUser = await Users.findOne({ where: { role: 'mahasiswa' }, raw: true });
            resolvedUserId = fallbackUser ? fallbackUser.id : 1; 
        }

        const newReport = await Reports.create({
            userId: resolvedUserId,
            image: base64Image,
            report_date: req.body.date,
            description: req.body.description,
            suggestion: req.body.suggestion,
            status: 'pending'
        });
        res.status(201).json({msg: "Laporan Terkirim", reportId: newReport.id});
    } catch (error) {
        console.error("General error in createReport:", error);
        res.status(500).json({msg: error.message, debugUser: req.user});
    }
}

export const deleteReport = async(req, res) =>{
    try {
        const report = await Reports.findOne({ where: { id: req.params.id } });
        if(!report) return res.status(404).json({msg: "No Data Found"});

        // Hapus file gambar jika itu bukan format base64
        if (report.image && !report.image.startsWith('data:image')) {
            try {
                const fileName = report.image.split('/uploads/')[1];
                if (fileName) {
                    const filepath = `./public/uploads/${fileName}`;
                    if(fs.existsSync(filepath)) fs.unlinkSync(filepath);
                }
            } catch (err) {
                console.log("File deletion skipped:", err.message);
            }
        }

        await Reports.destroy({ where: { id: req.params.id } });
        res.status(200).json({msg: "Laporan Dihapus"});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({msg: error.message});
    }
}

// Admin Menerima Laporan (Send Email Response)
export const acceptReport = async(req, res) => {
    try {
        const report = await Reports.findOne({ 
            where: { id: req.params.id },
            include: [{ model: Users }] 
        });

        if(!report) return res.status(404).json({msg: "Report not found"});

        // Update status
        await Reports.update({ status: 'accepted' }, { where: { id: req.params.id } });

        // Simulasi Kirim Email Balasan
        console.log("---------------------------------------------------");
        console.log(`To: ${report.user.email}`);
        console.log(`Subject: Tanggapan Laporan Fasilitas`);
        console.log(`Body: Terimakasih atas saranmu! Laporan kerusakan ${report.description} telah kami terima.`);
        console.log("---------------------------------------------------");

        res.status(200).json({msg: "Laporan Diterima & Email Terkirim"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, feedback } = req.body;

        console.log("Update Status Laporan:", id, status, feedback);

        await Reports.update(
            { status, feedback },
            { where: { id } }
        );

        res.status(200).json({ msg: "Status Laporan Diupdate!" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


export const submitQuestionnaire = async(req, res) => {
    try {
        await Questionnaires.create({
            reportId: req.body.reportId,
            rating: req.body.rating
        });
        res.json({msg: "Terimakasih!"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}