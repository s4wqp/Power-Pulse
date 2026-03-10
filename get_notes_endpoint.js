const fs = require('fs');

try {
    const data = JSON.parse(fs.readFileSync('d:\\power_pulse\\swagger.json', 'utf8'));
    const path = '/api/Subscriptions/{id}/notes';
    if (data.paths[path]) {
        console.log(JSON.stringify(data.paths[path], null, 2));
    } else {
        console.log('Path not found');
    }
} catch (e) {
    console.error(e);
}
