// Script untuk memanggil endpoint fix-owner di production Vercel
// Fix: laporan id=90002 harus diubah userId dari 6 (Bayu Cahyo) menjadi 7 (Dimas Ferdian)

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const BASE_URL = 'https://pelaporan-fasilitas-uhamka.vercel.app';
const SECRET = process.env.ACCESS_TOKEN_SECRET || 'rahasia_token_123';

async function fixData() {
  // Buat token admin
  const token = jwt.sign({ userId: 5, name: 'Super Admin', email: 'admin@uhamka.ac.id', role: 'admin' }, SECRET, { expiresIn: '1d' });

  try {
    console.log('Memanggil endpoint fix-owner untuk laporan id=90002...');
    
    // Fix laporan id=90002 -> userId=7 (Dimas Ferdian)
    const res = await axios.patch(
      `${BASE_URL}/api/reports/90002/fix-owner`,
      { userId: 7 },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ BERHASIL:', JSON.stringify(res.data, null, 2));

    // Verifikasi: ambil laporan pending setelah fix
    const reportsRes = await axios.get(`${BASE_URL}/api/reports`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('\n=== LAPORAN PENDING SETELAH FIX ===');
    reportsRes.data
      .filter(r => r.status === 'pending')
      .forEach(r => {
        console.log(`  id=${r.id} | userId=${r.userId} | user.name="${r.user ? r.user.name : 'NULL'}" | date=${r.report_date}`);
      });

  } catch(e) {
    console.error('ERROR:', e.response ? JSON.stringify(e.response.data) : e.message);
  }
}

fixData();
