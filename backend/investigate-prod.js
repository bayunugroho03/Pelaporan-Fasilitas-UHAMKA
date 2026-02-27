import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';

dotenv.config();

const BASE_URL = 'https://pelaporan-fasilitas-uhamka.vercel.app';
const SECRET = process.env.ACCESS_TOKEN_SECRET || 'rahasia_token_123';

async function fullInvestigate() {
  const token = jwt.sign({ userId: 1, name: 'Admin', email: 'admin@uhamka.ac.id', role: 'admin' }, SECRET, { expiresIn: '1d' });

  try {
    const resUsers = await axios.get(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const resReports = await axios.get(`${BASE_URL}/api/reports`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const output = {
      users: resUsers.data,
      reports: resReports.data.map(r => ({
        id: r.id,
        userId: r.userId,
        user_name: r.user ? r.user.name : null,
        status: r.status,
        report_date: r.report_date,
        description: r.description
      }))
    };

    fs.writeFileSync('full_investigation.json', JSON.stringify(output, null, 2));
    console.log('Output saved to full_investigation.json');
    console.log('Total laporan:', output.reports.length);
    console.log('Users:', JSON.stringify(output.users.map(u => ({id: u.id, name: u.name})), null, 2));
    console.log('Reports:', JSON.stringify(output.reports, null, 2));

  } catch(e) {
    console.error('ERROR:', e.response ? JSON.stringify(e.response.data) : e.message);
  }
}

fullInvestigate();
