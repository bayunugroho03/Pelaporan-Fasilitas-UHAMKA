import fs from 'fs';

async function runSQL(query) {
    console.log("Running Query:", query.substring(0, 100) + "...");
    try {
        const res = await fetch("https://pelaporan-fasilitas-uhamka.vercel.app/api/run-sql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query })
        });
        const data = await res.json();
        return data;
    } catch (e) {
        console.error(e.message);
        return null;
    }
}

async function main() {
    const raw = JSON.parse(fs.readFileSync('vercel_raw.json', 'utf-8'));
    for (const report of raw.data) {
        // Skip the buggy one with id=null
        if (!report.id || report.id === null) continue;

        // Escape helper
        const esc = s => s === null ? 'NULL' : `'${s.toString().replace(/'/g, "\\'")}'`;
        
        const q = `INSERT INTO reports (id, image, report_date, description, suggestion, status, feedback, userId, createdAt, updatedAt) VALUES (
            ${report.id},
            ${esc(report.image)},
            ${esc(report.report_date)},
            ${esc(report.description)},
            ${esc(report.suggestion)},
            ${esc(report.status)},
            ${esc(report.feedback)},
            ${report.userId || report.userid},
            ${esc(report.createdAt || report.createdat)},
            ${esc(report.updatedAt || report.updatedat)}
        )`;
        await runSQL(q);
    }
    console.log("Restore finished!");
}

main();
