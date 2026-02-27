const axios = require('axios');

async function testFetch() {
    try {
        console.log("Logging in...");
        const loginRes = await axios.post('https://pelaporan-fasilitas-uhamka.vercel.app/api/login', {
            email: 'admin@uhamka.ac.id', // Check with Bayu's normal student account since we want his info
            password: 'password' // We will just check via admin token since we don't have password. Or wait, let's login as a random user.
        });
        
    } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
    }
}
testFetch();
