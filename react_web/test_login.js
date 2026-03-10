const axios = require('axios');

const BASE_URL = 'http://powerpuls.runasp.net';

async function testApi() {
    try {
        const loginRes = await axios.post(`${BASE_URL}/api/Auth/login`, {
            email: "admin@gmail.com",
            password: "Password123!"
        });

        console.log('Login successful. Token:', loginRes.data.token.substring(0, 20) + '...');
    } catch (err) {
        console.error('Login failed:', err.response ? err.response.data : err.message);
    }
}

testApi();
