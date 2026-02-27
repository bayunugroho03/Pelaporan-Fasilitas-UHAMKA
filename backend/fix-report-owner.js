// Fix: Update userId laporan id=90002 dari userId=6 (Bayu Cahyo) ke userId=7 (Dimas Ferdian)
// Laporan "Kerusakan Gambar" 2026-02-27 harusnya milik Dimas Ferdian (id=7)

import dotenv from 'dotenv';
dotenv.config();

import db from './config/Database.js';

async function fixReportOwner() {
    try {
        await db.authenticate();
        console.log('=== DB TiDB CONNECTED ===');

        // Lihat semua laporan SEBELUM fix
        const [before] = await db.query(
            "SELECT id, userId, status, description, report_date FROM reports ORDER BY id"
        );
        console.log('\n[SEBELUM] Semua Laporan:');
        before.forEach(r => console.log(`  id=${r.id} | userId=${r.userId} | status=${r.status} | date=${r.report_date} | "${r.description}"`));

        // Fix: laporan id=90002 harusnya userId=7 (Dimas Ferdian)
        const [result] = await db.query(
            "UPDATE reports SET userId=7 WHERE id=90002"
        );
        console.log('\n[FIX] update laporan id=90002 -> userId=7 (Dimas Ferdian)');
        console.log('Affected rows:', result.affectedRows);

        // Lihat SESUDAH fix
        const [after] = await db.query(
            "SELECT id, userId, status, description, report_date FROM reports ORDER BY id"
        );
        console.log('\n[SESUDAH] Semua Laporan:');
        after.forEach(r => console.log(`  id=${r.id} | userId=${r.userId} | status=${r.status} | date=${r.report_date} | "${r.description}"`));

        console.log('\n✅ SELESAI! Data sudah diperbaiki.');

    } catch(e) {
        console.error('ERROR:', e.message);
    }
    process.exit();
}

fixReportOwner();
