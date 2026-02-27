import dotenv from 'dotenv';
dotenv.config();

import db from './config/Database.js';

async function test() {
    try {
        await db.authenticate();
        console.log('--- DB AUTH OK ---');
        const [users] = await db.query('SELECT * FROM users LIMIT 1;');
        console.log('USERS QUERY RESULT:', JSON.stringify(users[0], null, 2));
    } catch(e) { 
        console.error('ERROR:', e); 
    }
    process.exit();
}
test();
