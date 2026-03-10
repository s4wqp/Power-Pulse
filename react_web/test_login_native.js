import http from 'http';

const data = JSON.stringify({
    email: 'admin@gmail.com',
    password: 'Password123!'
});

const options = {
    hostname: 'powerpuls.runasp.net',
    port: 80,
    path: '/api/Auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        if (res.statusCode === 200) {
            const parsed = JSON.parse(body);
            console.log('Token:', parsed.token.substring(0, 20) + '...');
        } else {
            console.log('Body:', body);
        }
    });
});

req.on('error', error => {
    console.error('Error:', error);
});

req.write(data);
req.end();
