import fs from 'fs';

async function runSQL(query) {
    console.log("Running Query:", query);
    try {
        const res = await fetch("https://pelaporan-fasilitas-uhamka.vercel.app/api/run-sql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query })
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e.message);
    }
}

async function main() {
    await runSQL("DELETE FROM reports WHERE id IS NULL");
    await runSQL("ALTER TABLE reports MODIFY COLUMN id BIGINT NOT NULL");
    await runSQL("ALTER TABLE reports ADD PRIMARY KEY (id)");
    await runSQL("ALTER TABLE reports MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT");
    
    // Check schema again to confirm
    const schema = await fetch("https://pelaporan-fasilitas-uhamka.vercel.app/api/debug-schema").then(r => r.json());
    console.log("NEW SCHEMA:", schema);
}

main();
