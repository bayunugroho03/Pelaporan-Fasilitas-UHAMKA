import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';

dotenv.config();

async function run() {
  const token = jwt.sign({userId: 5, role: 'admin'}, process.env.ACCESS_TOKEN_SECRET || 'secret123', {expiresIn: '1d'});
  try {
    const res = await axios.get('https://pelaporan-fasilitas-uhamka.vercel.app/api/reports', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const pendingReports = res.data.filter(r => r.status === 'pending');
    fs.writeFileSync('prod_out.json', JSON.stringify(pendingReports, null, 2));
  } catch(e) { 
    console.error(e.response ? e.response.data : e.message);
  }
}
run();
