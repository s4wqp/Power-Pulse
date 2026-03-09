const axios = require('axios');
axios.get('http://powerpuls.runasp.net/api/Subscriptions/trainee/1')
    .then(res => {
        const fs = require('fs');
        fs.writeFileSync('sub_data.json', JSON.stringify(res.data, null, 2));
        console.log('Saved to sub_data.json');
    })
    .catch(err => {
        console.error('Error fetching data:', err.message);
    });
