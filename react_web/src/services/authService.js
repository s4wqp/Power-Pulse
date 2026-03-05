import apiClient from './apiClient';

export const authService = {
    login: async (email, password) => {
        const response = await apiClient.post('/api/auth/login', { email, password });
        return response.data;
    },

    registerTrainee: async (data) => {
        const response = await apiClient.post('/api/auth/signup/trainee', { ...data, role: 'Trainee' });
        return response.data;
    },

    registerTrainer: async (data) => {
        const response = await apiClient.post('/api/auth/signup/trainer', {
            ...data,
            certificates: data.certificates || [],
            role: 'Trainer'
        });
        return response.data;
    }
};
