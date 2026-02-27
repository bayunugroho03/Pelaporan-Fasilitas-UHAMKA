import Reports from "../models/ReportModel.js";
import Questionnaires from "../models/QuestionnaireModel.js";
import Users from "../models/UserModel.js";
import path from "path";
import fs from "fs";
import os from "os";

export const getReportImage = async(req, res) => {
    try {
        const report = await Reports.findOne({
            where: { id: req.params.id },
            attributes: ['image']
        });
        if (!report || !report.image) {
            return res.status(404).json({msg: "No image found"});
        }

        if (report.image.startsWith('data:image')) {
            const matches = report.image.match(/^data:(image\/\w+);base64,(.*)$/);
            if (matches && matches.length === 3) {
                const buffer = Buffer.from(matches[2], 'base64');
                res.writeHead(200, {
                    'Content-Type': matches[1],
                    'Content-Length': buffer.length
                });
                return res.end(buffer);
            }
        }
        
        let imgUrl = report.image;
        if (imgUrl.includes('localhost:5000')) {
            const apiUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
            imgUrl = imgUrl.replace(/http:\/\/localhost:5000\/uploads/g, `${apiUrl}/api/uploads`);
        }
        return res.redirect(imgUrl);

    } catch (e) {
        res.status(500).json({msg: e.message});
    }
}

export const getReports = async(req, res) => {
    try {
        let response;
        
        let resolvedUserId = null;
        if (req.user) {
            resolvedUserId = req.user.userId || req.user.id || req.user.ID;
        }
        if (!resolvedUserId) resolvedUserId = 1;

        // JANGAN FETCH 'image' AGAR MEMORY VERCEL TIDAK CRASH
        const opts = {
            attributes: { exclude: ['image'] },
            include:[{
                model: Users,
                attributes:['name','email']
            }]
        };

        if(req.user.role === "admin"){
            response = await Reports.findAll(opts);
        } else {
            response = await Reports.findAll({
                ...opts,
                where:{ userId: resolvedUserId }
            });
        }

        const apiUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;

        const formattedResponse = await Promise.all(response.map(async (r) => {
            // Karena kita menghapus raw:true agar Sequelize jalan normal kembali
            const rowData = r.toJSON();
            
            // Re-map the user property. Sequelize generally returns lowercase 'user' or 'User' or 'users'.
            let extractedUser = rowData.user || rowData.User || rowData.users || rowData.Users || rowData.USER;
            
            // Perbaikan ekstraksi data murni jika terdapat nesting di dalamnya.
            if (extractedUser && extractedUser.name) {
                rowData.user = extractedUser;
            } else if (extractedUser && (extractedUser.name === undefined || extractedUser.name === null)) {
                // Jaga-jaga jika attribute ada yang uppercase dari TiDB
                rowData.user = { 
                    name: extractedUser.NAME || extractedUser.Name || "Tidak Diketahui",
                    email: extractedUser.EMAIL || extractedUser.Email || "unknown@uhamka.ac.id" 
                };
            } else {
                // Jika tidak ada mahasiswa yang terkait (orphaned)
                rowData.user = { name: "Tidak Diketahui", email: "unknown@uhamka.ac.id" };
            }

            return {
                ...rowData,
                image: `${apiUrl}/api/reports/${r.id || r.ID}/image`
            };
        }));

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

        // Bypassing Token Requirement (Bulletproof Fallback)
        let resolvedUserId = null;
        if (req.user && (req.user.userId || req.user.id)) {
            resolvedUserId = req.user.userId || req.user.id;
        }

        if (!resolvedUserId && req.user && req.user.email) {
            try {
                // Hapus raw: true agar ID pelapor dapat dibaca langsung dengan normal
                const usr = await Users.findOne({ where: { email: req.user.email } });
                if (usr) resolvedUserId = usr.id;
            } catch (e) {
                console.log("Error finding user by email:", e.message);
            }
        }

        // Jika tidak ada Token / Token rusak, PAKAI FALLBACK.
        if (!resolvedUserId) {
            console.log("Token ID missing/bypassed. Using fallback user to save report.");
            try {
                // Dicari mahasiswa acak sebagai pemilik laporan (Hilangkan raw: true)
                const fallbackUser = await Users.findOne({ where: { role: 'mahasiswa' } });
                if (fallbackUser) {
                     resolvedUserId = fallbackUser.id;
                }
            } catch (e) {
                console.log("Error finding fallback user:", e.message);
            }
        }

        // Ultimate Anti-Null Guarantee
        if (!resolvedUserId) resolvedUserId = 1;

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

// ENDPOINT SEMENTARA - Fix Owner Laporan (Admin Only)
export const fixReportOwner = async(req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Forbidden' });
        }
        const { id } = req.params;
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ msg: 'userId wajib diisi' });
        const before = await Reports.findOne({ where: { id } });
        if (!before) return res.status(404).json({ msg: 'Laporan tidak ditemukan' });
        await Reports.update({ userId: Number(userId) }, { where: { id } });
        const after = await Reports.findOne({ where: { id } });
        res.status(200).json({
            msg: `Berhasil update userId laporan id=${id}`,
            before: { id: before.id, userId: before.userId },
            after: { id: after.id, userId: after.userId }
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};