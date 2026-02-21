import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const ENDPOINT = "https://pelaporan-fasilitas-uhamka.vercel.app/api/migrate-base64";

async function pushImagesToVercel() {
    console.log("Reading local directory:", UPLOADS_DIR);
    if (!fs.existsSync(UPLOADS_DIR)) {
        console.error("Local directory does not exist. Nothing to do.");
        return;
    }

    try {
        console.log("Forcing TiDB ALTER TABLE...");
        const altRes = await fetch("https://pelaporan-fasilitas-uhamka.vercel.app/api/force-alter", { method: "POST" });
        const altData = await altRes.json();
        console.log("Alter response:", altData);
    } catch (e) {
        console.log("Alter request failed:", e.message);
    }

    const files = fs.readdirSync(UPLOADS_DIR);
    for (const file of files) {
        if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;

        console.log(`Processing ${file}...`);
        const filePath = path.join(UPLOADS_DIR, file);
        const fileData = fs.readFileSync(filePath);
        const mimeType = file.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        const base64Image = `data:${mimeType};base64,${fileData.toString('base64')}`;

        try {
            console.log(`Sending Base64 payload for ${file} to Vercel...`);
            const res = await fetch(ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: file,
                    base64: base64Image
                })
            });
            const data = await res.json();
            console.log(`Success tracking ${file}:`, data);
        } catch (error) {
            console.error(`Failed to update ${file}:`, error.message);
        }
    }
    console.log("Migration complete!");
}

console.log("Waiting 30 seconds for Vercel deployment to finish safely...");
setTimeout(() => {
    pushImagesToVercel();
}, 20000);

