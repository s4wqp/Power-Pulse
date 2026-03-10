import axios from 'axios';
import fs from 'fs';

const BASE_URL = 'http://powerpuls.runasp.net';

async function testApi() {
    try {
        // Attempt to read raw_chat.json or something similar from the previous conversation
        // Or, we can use the login endpoint to get a token if we know the admin email/password.
        // Let me try to log in using a generic admin email
        console.log('Logging in...');
        var loginRes = await axios.post(`${BASE_URL}/api/Auth/login`, {
            email: "admin@gmail.com",
            password: "Password123!"
        });

        const token = loginRes.data.token;
        console.log('Got token for role:', loginRes.data.role);

        const res = await axios.get(`${BASE_URL}/api/Products?storeType=HealthyMeals`);
        if (res.data.length > 0) {
            const p = res.data[0];
            console.log('Trying to delete product', p.id);

            try {
                await axios.delete(`${BASE_URL}/api/Products/${p.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Delete succeeded!');
            } catch (delErr) {
                console.error('Delete error status:', delErr.response?.status);
                console.error('Delete error data:', delErr.response?.data);
            }
        }
    } catch (err) {
        console.error('Initial Error:', err.response ? err.response.data : err.message);
    }
}

testApi();
