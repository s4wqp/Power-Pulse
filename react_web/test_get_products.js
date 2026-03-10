import http from 'http';

const options = {
    hostname: 'powerpuls.runasp.net',
    port: 80,
    path: '/api/Products?storeType=HealthyMeals',
    method: 'GET'
};

const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        if (res.statusCode === 200) {
            const parsed = JSON.parse(body);
            console.log('Total products:', parsed.length);
            if (parsed.length > 0) {
                console.log('First 3 products:', parsed.slice(0, 3).map(p => ({ id: p.id, name: p.name })));
            }
        } else {
            console.log('Body:', body);
        }
    });
});

req.on('error', error => {
    console.error('Error:', error);
});

req.end();
