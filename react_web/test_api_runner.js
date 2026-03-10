import axios from 'axios';

const BASE_URL = 'http://powerpuls.runasp.net';

async function testApi() {
    try {
        console.log('Fetching products...');
        const res = await axios.get(`${BASE_URL}/api/Products?storeType=HealthyMeals`);
        if (res.data.length > 0) {
            const p = res.data[0];
            console.log('Sample product ID:', p.id);
            console.log('Trying to delete product', p.id);

            // Attempt to delete with no auth to see what the exact error is
            try {
                await axios.delete(`${BASE_URL}/api/Products/${p.id}`);
                console.log('Delete succeeded (unexpected without auth)');
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
