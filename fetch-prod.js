const axios = require('axios');

async function testFetch() {
    try {
        console.log("Logging in...");
        const loginRes = await axios.post('https://pelaporan-fasilitas-uhamka.vercel.app/api/login', {
            email: 'admin@uhamka.ac.id', // Assuming there's an admin account
            password: 'admin' // Or whatever it is. Wait, I can just use Bayu's student account!
        });
        const token = loginRes.data.accessToken;

        console.log("Fetching reports...");
        const res = await axios.get('https://pelaporan-fasilitas-uhamka.vercel.app/api/reports', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Status:", res.status);
        console.log("First 2 Reports Data:", JSON.stringify(res.data.slice(0, 2), null, 2));

    } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
    }
}
testFetch();
