const axios = require('axios');
const fs = require('fs');

async function test() {
    const apiClient = axios.create({
        baseURL: 'http://powerpuls.runasp.net',
    });

    try {
        // 1. Signup an admin
        const email = `testadmin_${Date.now()}@test.com`;
        const signupPayload = {
            email,
            password: "Password123!",
            fullName: "Test Admin",
            phoneNumber: "1234567890",
            city: "TestCity",
            age: 30,
            gender: "Male"
        };

        console.log("Signing up admin...", email);
        const signupRes = await apiClient.post('/api/Auth/signup/trainer', signupPayload).catch(e => e.response);
        let token = signupRes?.data?.token;

        if (!token) {
            console.log("Signup failed, trying login. Status:", signupRes?.status, signupRes?.data);
            const loginRes = await apiClient.post('/api/Auth/login', { email, password: "Password123!" }).catch(e => e.response);
            token = loginRes?.data?.token;
        }

        if (!token) {
            console.error("Failed to get token");
            return;
        }

        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        console.log("Logged in. Creating a product...");
        const createPayload = {
            name: "Test Delete Product",
            price: 100,
            description: "To be deleted",
            imageUrls: ["http://example.com/img.png"],
            storeType: "HealthyMeals",
            productCategoryId: 1, // Let's hope category 1 exists
            attributes: []
        };

        const createRes = await apiClient.post('/api/Products', createPayload).catch(e => e.response);
        console.log("Create status:", createRes?.status, createRes?.data);
        const productId = createRes?.data?.id;

        if (!productId) {
            console.error("Failed to create product");
            return;
        }

        console.log("Created product", productId, ". Deleting...");

        // DELTE request
        const deleteRes = await apiClient.delete(`/api/Products/${productId}`).catch(e => e.response || e);

        if (deleteRes.message === 'Network Error') {
            console.error("Axios Network Error reproduced!", deleteRes.message, deleteRes.stack);
        } else {
            console.log("Delete response status:", deleteRes?.status, deleteRes?.data);
            console.log("Delete response headers:", deleteRes?.headers);
        }

    } catch (err) {
        console.error("Unexpected error:", err.message);
    }
}

test();
