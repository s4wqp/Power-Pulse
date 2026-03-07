const fs = require('fs');
try {
    const swagger = JSON.parse(fs.readFileSync('d:\\power_pulse\\swagger.json', 'utf8'));
    const endpoint = swagger.paths['/api/Trainers/{id}/workouts'];
    if (endpoint && endpoint.get) {
        fs.writeFileSync('d:\\power_pulse\\schema_get_workouts.json', JSON.stringify(endpoint.get.responses['200'], null, 2));
    } else {
        console.log('GET Endpoint not found');
    }
} catch (e) {
    console.error(e.message);
}
