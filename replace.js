import fs from 'fs';
import path from 'path';

const files = [
  'frontend/src/pages/student/MyReports.jsx',
  'frontend/src/pages/student/CreateReport.jsx',
  'frontend/src/pages/Register.jsx',
  'frontend/src/pages/Login.jsx',
  'frontend/src/pages/admin/IncomingReports.jsx',
  'frontend/src/pages/admin/HistoryReports.jsx',
  'frontend/src/pages/admin/AdminMenu.jsx',
  'frontend/src/components/AdminDashboard.jsx',
  'frontend/src/components/Login.jsx',
  'frontend/src/components/Register.jsx',
  'frontend/src/components/StudentDashboard.jsx'
];

for (const file of files) {
  const filePath = path.join('d:/Projek PKL Test', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // For single quotes
    content = content.replace(/'http:\/\/localhost:5000(.*?)'/g, '`${import.meta.env.VITE_API_URL}$1`');
    // For double quotes
    content = content.replace(/"http:\/\/localhost:5000(.*?)"/g, '`${import.meta.env.VITE_API_URL}$1`');
    // For template literals that already use backticks
    content = content.replace(/http:\/\/localhost:5000/g, '${import.meta.env.VITE_API_URL}');
    
    fs.writeFileSync(filePath, content);
  }
}
console.log('Done!');
