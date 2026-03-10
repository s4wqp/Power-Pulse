import puppeteer from 'puppeteer';
import axios from 'axios';

const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
    try {
        console.log('Launching browser...');
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        console.log('Navigating to local admin page...');
        await page.goto('http://127.0.0.1:5173/admin/category/Food');
        await delay(5000);

        const token = await page.evaluate(() => localStorage.getItem('auth_token'));
        const user = await page.evaluate(() => localStorage.getItem('user_id'));

        console.log('Token exists:', !!token);
        console.log('User ID:', user);

        if (token) {
            console.log('Test Delete with Token:');
            try {
                const productsRes = await axios.get('http://powerpuls.runasp.net/api/Products?storeType=HealthyMeals');
                if (productsRes.data.length > 0) {
                    const sampleId = productsRes.data[0].id;
                    console.log('Trying to delete product:', sampleId);

                    try {
                        await axios.delete(`http://powerpuls.runasp.net/api/Products/${sampleId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        console.log('Success: Deleted product via API!');
                    } catch (delError) {
                        console.error('Delete failed with status:', delError.response?.status);
                        console.error('Delete error message:', delError.response?.data);
                    }

                    console.log('Trying to update product:', sampleId);
                    try {
                        const updatePayload = {
                            name: productsRes.data[0].name.trim(),
                            price: productsRes.data[0].price,
                            description: productsRes.data[0].description || 'Updated by test script',
                            imageUrls: productsRes.data[0].imageUrls || [],
                            storeType: 'HealthyMeals',
                            productCategoryId: productsRes.data[0].productCategoryId || 1,
                            attributes: productsRes.data[0].attributes || []
                        };

                        await axios.put(`http://powerpuls.runasp.net/api/Products/${sampleId}`, updatePayload, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        console.log('Success: Updated product via API!');
                    } catch (updError) {
                        console.error('Update failed with status:', updError.response?.status);
                        console.error('Update error message:', updError.response?.data);
                    }
                }
            } catch (err) {
                console.error('Failed to get products:', err.message);
            }
        } else {
            console.log('No token found. Make sure you are logged in on the dev server browser.');
        }

        await browser.close();
    } catch (e) {
        console.error('Script error:', e);
        process.exit(1);
    }
})();
