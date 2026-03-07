import apiClient from './apiClient';

export const trainerService = {
    getTrainers: async () => {
        const response = await apiClient.get('/api/trainers');
        return response.data;
    },

    getTrainerDetails: async (id) => {
        const response = await apiClient.get(`/api/trainers/${id}`);
        return response.data;
    },

    getTrainerStats: async (id) => {
        try {
            const response = await apiClient.get(`/api/trainers/${id}/stats`);
            return response.data;
        } catch {
            return { totalClients: 0, todayAmount: 0.0, totalAmount: 0.0 };
        }
    },

    getTrainerSubscriptions: async (trainerId) => {
        const response = await apiClient.get(`/api/subscriptions/trainer/${trainerId}`);
        return response.data;
    },

    getPlans: async (trainerId) => {
        const response = await apiClient.get(`/api/trainers/${trainerId}/plans`);
        return response.data;
    },

    createPlan: async (trainerId, planData) => {
        const response = await apiClient.post(`/api/trainers/${trainerId}/plans`, planData);
        return response.data;
    },

    updatePlan: async (trainerId, planId, planData) => {
        const response = await apiClient.put(`/api/trainers/${trainerId}/plans/${planId}`, planData);
        return response.data;
    },

    deletePlan: async (trainerId, planId) => {
        const response = await apiClient.delete(`/api/trainers/${trainerId}/plans/${planId}`);
        return response.data;
    },

    addWorkout: async (trainerId, workoutData) => {
        const response = await apiClient.post(`/api/trainers/${trainerId}/workouts`, workoutData);
        return response.data;
    },

    updateProfile: async (trainerId, data) => {
        const response = await apiClient.put(`/api/trainers/${trainerId}`, data);
        return response.data;
    },

    updateProfileImage: async (trainerId, imageUrl) => {
        const response = await apiClient.put(`/api/trainers/${trainerId}`, { profileImageUrl: imageUrl });
        return response.data;
    },

    addDailyNote: async (subscriptionId, title, noteText) => {
        const data = { noteText };
        if (title && title.trim() !== '') {
            data.title = title;
        }
        const response = await apiClient.post(`/api/subscriptions/${subscriptionId}/notes`, data);
        return response.data;
    },

    getSubscriptionDetails: async (subscriptionId) => {
        const response = await apiClient.get(`/api/subscriptions/${subscriptionId}`);
        return response.data;
    },

    addCertificate: async (trainerId, certificateData) => {
        const response = await apiClient.post(`/api/trainers/${trainerId}/certificates`, certificateData);
        return response.data;
    },

    deleteCertificate: async (trainerId, certId) => {
        const response = await apiClient.delete(`/api/trainers/${trainerId}/certificates/${certId}`);
        return response.data;
    },

    getWorkouts: async (trainerId) => {
        const response = await apiClient.get(`/api/trainers/${trainerId}`);
        return response.data?.workouts || [];
    },

    getDailyNotes: async (subscriptionId) => {
        const response = await apiClient.get(`/api/subscriptions/${subscriptionId}/notes`);
        return response.data;
    },

    getSubscriptionSummary: async (subscriptionId) => {
        const response = await apiClient.get(`/api/subscriptions/${subscriptionId}/summary`);
        return response.data;
    },

    updateCertificate: async (trainerId, certId, certificateData) => {
        const response = await apiClient.put(`/api/trainers/${trainerId}/certificates/${certId}`, certificateData);
        return response.data;
    }
};
