const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swag.json', 'utf8'));

// Find paths related to subscriptions
const paths = Object.keys(swagger.paths).filter(p => p.toLowerCase().includes('subscription'));
console.log("Paths:", paths);

// Find definitions related to subscriptions
const defs = Object.keys(swagger.components?.schemas || swagger.definitions || {}).filter(d => d.toLowerCase().includes('subscription'));
console.log("Defs:", defs);

if (defs.length > 0) {
    const schemas = swagger.components?.schemas || swagger.definitions || {};
    for (const def of defs) {
        console.log(`\n--- Schema: ${def} ---`);
        console.log(JSON.stringify(schemas[def], null, 2));
    }
}
