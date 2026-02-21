import db from './config/Database.js';

async function alterDb() {
    try {
        await db.authenticate();
        console.log('Connected to DB. Altering table...');
        await db.query('ALTER TABLE reports MODIFY COLUMN image LONGTEXT;');
        console.log('Table altered successfully.');
    } catch (error) {
        console.error('Error altering table:', error);
    } finally {
        process.exit();
    }
}

alterDb();
