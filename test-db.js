import dotenv from 'dotenv';
dotenv.config({path: './backend/.env'});
import db from './backend/config/Database.js';

(async () => {
    try {
        await db.authenticate();
        const [users] = await db.query('SELECT * FROM users LIMIT 1;');
        console.log("USER RECORD: ", users);
        const [desc] = await db.query('DESCRIBE users;');
        console.log("USER DESCRIBE: ", desc);
    } catch(e) { console.error('ERROR:', e.message); }
    process.exit();
})();
