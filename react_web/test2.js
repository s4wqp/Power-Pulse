import axios from 'axios';

async function test() {
    try {
        const r = await axios.post('http://powerpuls.runasp.net/api/Trainers/83d6a782-99a3-44bd-9079-dae3b6a9a7a1/plans', {
            name: 'test minutes plan',
            description: 'test',
            price: 100,
            durationMonths: 0,
            durationDays: 0,
            durationHours: 10 / 60, // 10 minutes
            badge: null,
            features: ['test'],
            isActive: true
        });
        console.log('OK', r.status);
    } catch (e) {
        if (e.response) {
            console.log('ERR STATUS', e.response.status, e.response.statusText);
            console.log('ERR DATA', JSON.stringify(e.response.data, null, 2));
        } else {
            console.log('ERR', e.message);
        }
    }
}
test();
