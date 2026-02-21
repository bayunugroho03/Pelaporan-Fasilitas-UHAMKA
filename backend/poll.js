import fs from 'fs';

async function poll() {
    let success = false;
    while (!success) {
        try {
            console.log("Fetching /api/debug-schema from Vercel...");
            const res = await fetch("https://pelaporan-fasilitas-uhamka.vercel.app/api/debug-schema");
            if (res.ok) {
                const text = await res.text();
                // Check if it's the HTML error page or valid JSON
                if (text.startsWith('<!DOCTYPE') || text.includes('Cannot GET')) {
                    console.log("Endpoint not ready yet...");
                } else {
                    console.log("SUCCESS! Got real data.");
                    fs.writeFileSync("vercel_schema.json", text, "utf-8");
                    success = true;
                }
            } else {
                console.log("Status not 200:", res.status);
            }
        } catch (e) {
            console.log("Fetch failed:", e.message);
        }
        if (!success) {
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}
poll();
