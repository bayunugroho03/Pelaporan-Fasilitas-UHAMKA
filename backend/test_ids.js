import db from './config/Database.js';
import Reports from './models/ReportModel.js';
import fs from "fs";

async function test() {
    try {
        await db.authenticate();
        const rep = await Reports.findAll();
        const formatted = rep.map(r => {
            let img = r.image;
            return {
                ...r.toJSON(),
                image: img
            };
        });
        fs.writeFileSync("output.json", JSON.stringify(formatted, null, 2), "utf-8");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
test();
