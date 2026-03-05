import apiClient from './apiClient';

export const productService = {
    // GET /api/Products?storeType=X
    getProducts: async (storeType) => {
        const response = await apiClient.get('/api/Products', {
            params: { storeType }
        });
        return response.data;
    },

    // GET /api/Products/{id}
    getProductById: async (id) => {
        const response = await apiClient.get(`/api/Products/${id}`);
        return response.data;
    },

    // POST /api/Products?adminId=X
    createProduct: async (adminId, productData) => {
        const response = await apiClient.post(`/api/Products?adminId=${adminId}`, productData);
        return response.data;
    },

    // DELETE /api/Products/{id}
    deleteProduct: async (id) => {
        await apiClient.delete(`/api/Products/${id}`);
    },

    // GET /api/referencedata/productcategories?storeType=X
    getProductCategories: async (storeType) => {
        const response = await apiClient.get('/api/referencedata/productcategories', {
            params: { storeType }
        });
        return response.data;
    },

    // GET /api/ReferenceData/muscles
    getMuscles: async () => {
        const response = await apiClient.get('/api/ReferenceData/muscles');
        return response.data;
    },

    // GET /api/ReferenceData/specializations
    getSpecializations: async () => {
        const response = await apiClient.get('/api/ReferenceData/specializations');
        return response.data;
    },
};
