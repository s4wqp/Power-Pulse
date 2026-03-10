const axios = require('axios');

const BASE_URL = 'http://powerpuls.runasp.net';

async function testApi() {
    try {
        console.log('Logging in as admin...');
        // Replace with actual admin credentials if known, or trainee
        // I'll try generic auth approach, wait, I don't have the password.
        // Let me try to make a generic fetch to get products, see if I can.
        const res = await axios.get(`${BASE_URL}/api/Products?storeType=HealthyMeals`);
        console.log(`Fetched ${res.data.length} products`);
        if (res.data.length > 0) {
            const p = res.data[0];
            console.log('Sample product:', p.id, p.name);
        }
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}

testApi();
