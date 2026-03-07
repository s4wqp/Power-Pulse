const fs = require('fs');
try {
    const swagger = JSON.parse(fs.readFileSync('d:\\power_pulse\\swagger.json', 'utf8'));
    fs.writeFileSync('d:\\power_pulse\\schema_output.json', JSON.stringify(swagger.components.schemas.CreateWorkoutRequest, null, 2));
} catch (e) {
    console.error(e.message);
}
