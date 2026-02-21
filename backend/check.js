import db from './config/Database.js';

import fs from 'fs';
async function check() {
    const res = await db.query('DESCRIBE reports');
    fs.writeFileSync('schema.json', JSON.stringify(res[0], null, 2), 'utf-8');
    process.exit();
}

check();
