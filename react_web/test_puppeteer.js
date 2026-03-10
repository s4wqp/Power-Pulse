import puppeteer from 'puppeteer';
import axios from 'axios';

(async () => {
    try {
        console.log('Launching browser...');
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        console.log('Navigating to local admin page...');
        await page.goto('http://localhost:5173/admin/category/Food');
        // Wait longer to allow manual login if needed, or if it redirects
        await page.waitForTimeout(5000);

        const token = await page.evaluate(() => localStorage.getItem('auth_token'));
        const user = await page.evaluate(() => localStorage.getItem('user_id'));

        console.log('Token exists:', !!token);
        console.log('User ID:', user);

        if (token) {
            console.log('Test Delete with Token:');
            try {
                // Get products to find an ID to delete
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
    }
})();
