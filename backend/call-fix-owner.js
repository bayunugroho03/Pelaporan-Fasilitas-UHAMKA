import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';

dotenv.config();

const BASE_URL = 'https://pelaporan-fasilitas-uhamka.vercel.app';
const SECRET = process.env.ACCESS_TOKEN_SECRET || 'rahasia_token_123';

async function fixAndVerify() {
  const token = jwt.sign({ userId: 5, name: 'Super Admin', email: 'admin@uhamka.ac.id', role: 'admin' }, SECRET, { expiresIn: '1d' });

  const results = { fixes: [], reports: [] };

  const toFix = [30001, 90001];
  for (const id of toFix) {
    try {
      const res = await axios.patch(`${BASE_URL}/api/reports/${id}/fix-owner`, { userId: 6 }, { headers: { Authorization: `Bearer ${token}` } });
      results.fixes.push({ id, result: res.data });
    } catch(e) {
      results.fixes.push({ id, error: e.response ? e.response.data : e.message });
    }
  }

  // Verifikasi
  const reportsRes = await axios.get(`${BASE_URL}/api/reports`, { headers: { Authorization: `Bearer ${token}` } });
  results.reports = reportsRes.data.map(r => ({
    id: r.id, userId: r.userId, name: r.user ? r.user.name : null, status: r.status, date: r.report_date, desc: r.description
  }));

  fs.writeFileSync('fix_result2.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
}

fixAndVerify();
