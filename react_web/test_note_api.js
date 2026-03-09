const axios = require('axios');

async function testNote() {
    try {
        console.log('Logging in as trainer...');
        const loginRes = await axios.post('http://powerpuls.runasp.net/api/Auth/login', {
            email: 'youseef@gmail.com',
            password: 'yousef12345'
        });
        const token = loginRes.data.token;
        const trainerId = loginRes.data.userId;

        console.log(`Getting subscriptions for trainer ${trainerId}...`);
        const subsRes = await axios.get(`http://powerpuls.runasp.net/api/Trainers/${trainerId}/subscriptions`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (subsRes.data.length === 0) {
            console.log('No subscriptions found for this trainer.');
            return;
        }

        const sub = subsRes.data.find(s => s.traineeId === 28) || subsRes.data[0];
        console.log(`Found subscription ID: ${sub.id}`);

        console.log(`Attempting to add note to subscription ${sub.id}...`);
        const noteRes = await axios.post(`http://powerpuls.runasp.net/api/Subscriptions/${sub.id}/notes`, {
            title: 'Test Note from Script',
            noteText: 'This is a test note.'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Success!', noteRes.status);
    } catch (e) {
        if (e.response) {
            console.error('API Error:', e.response.status, e.response.statusText);
            console.error(e.response.data);
        } else {
            console.error('Network Error:', e.message);
        }
    }
}

testNote();
