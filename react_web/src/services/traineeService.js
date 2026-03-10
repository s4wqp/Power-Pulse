import apiClient from './apiClient';

export const traineeService = {
    getProfile: async (id) => {
        const response = await apiClient.get(`/api/trainees/${id}`);
        return response.data;
    },

    updateProfile: async (id, data) => {
        const response = await apiClient.put(`/api/trainees/${id}`, data);
        return response.data;
    },

    updateProfileImage: async (id, imageUrl) => {
        const profile = await apiClient.get(`/api/trainees/${id}`);
        const currentData = profile.data || {};
        const payload = {
            name: currentData.name,
            phone: currentData.phone,
            weight: currentData.weight,
            height: currentData.height,
            profileImageUrl: imageUrl
        };
        const response = await apiClient.put(`/api/trainees/${id}`, payload);
        return response.data;
    },

    getAddresses: async (traineeId) => {
        const response = await apiClient.get(`/api/trainees/${traineeId}/addresses`);
        return response.data;
    },

    addAddress: async (traineeId, data) => {
        const response = await apiClient.post(`/api/trainees/${traineeId}/addresses`, data);
        return response.data;
    },

    updateAddress: async (traineeId, addressId, data) => {
        const response = await apiClient.put(`/api/trainees/${traineeId}/addresses/${addressId}`, data);
        return response.data;
    },

    deleteAddress: async (traineeId, addressId) => {
        const response = await apiClient.delete(`/api/trainees/${traineeId}/addresses/${addressId}`);
        return response.data;
    },

    checkHasAddress: async (traineeId) => {
        try {
            const response = await apiClient.get(`/api/trainees/${traineeId}/addresses/check`);
            return response.data?.hasAddress || false;
        } catch {
            return false;
        }
    },

    getTrainerWorkouts: async (traineeId) => {
        const response = await apiClient.get(`/api/chat/trainee/${traineeId}/workouts`);
        return response.data;
    },

    getTraineeSubscriptions: async (traineeId) => {
        const response = await apiClient.get(`/api/Subscriptions/trainee/${traineeId}`);
        return response.data;
    },

    subscribe: async (traineeId, trainingPlanId) => {
        const response = await apiClient.post('/api/subscriptions', { traineeId, trainingPlanId });
        return response.data;
    },

    placeOrder: async (orderData) => {
        const response = await apiClient.post('/api/orders', orderData);
        return response.data;
    },

    getOrderById: async (orderId) => {
        const response = await apiClient.get(`/api/orders/${orderId}`);
        return response.data;
    },

    getTraineeOrders: async (traineeId) => {
        const response = await apiClient.get(`/api/orders/trainee/${traineeId}`);
        return response.data;
    }
};
