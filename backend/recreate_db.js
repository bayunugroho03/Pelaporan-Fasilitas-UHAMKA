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
        return data;
    } catch (e) {
        console.error(e.message);
        return null;
    }
}

async function main() {
    console.log("Dropping table...");
    await runSQL("DROP TABLE IF EXISTS reports");
    
    console.log("Creating table...");
    const createStmt = `CREATE TABLE reports (
      id int NOT NULL AUTO_INCREMENT,
      image longtext,
      report_date varchar(255) NOT NULL,
      description text NOT NULL,
      suggestion text,
      status enum('pending','accepted','rejected') DEFAULT 'pending',
      feedback text,
      userId int NOT NULL,
      createdAt datetime DEFAULT CURRENT_TIMESTAMP,
      updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )`;
    await runSQL(createStmt);

    console.log("Checking schema...");
    const schema = await fetch("https://pelaporan-fasilitas-uhamka.vercel.app/api/debug-schema").then(r => r.json());
    console.log("Schema generated:", schema.length);
}

main();
