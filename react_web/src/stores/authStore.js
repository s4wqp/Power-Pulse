import { create } from 'zustand';
import { authService } from '../services/authService';

const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authService.login(email, password);
            // Expected response: { token, userId, role, fullName }
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user_id', response.userId.toString());
            localStorage.setItem('role', response.role);
            localStorage.setItem('full_name', response.fullName);

            set({
                user: {
                    id: response.userId,
                    role: response.role,
                    fullName: response.fullName,
                },
                token: response.token,
                isLoading: false,
            });
            return true;
        } catch (error) {
            let errorMessage = 'An unexpected error occurred.';
            if (error.response?.status === 401) {
                errorMessage = 'Invalid email or password.';
            } else if (error.response?.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            }
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    },

    registerTrainee: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authService.registerTrainee(data);
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user_id', response.userId.toString());
            localStorage.setItem('role', response.role);
            localStorage.setItem('full_name', response.fullName);

            set({
                user: { id: response.userId, role: response.role, fullName: response.fullName },
                token: response.token,
                isLoading: false,
            });
            return true;
        } catch (error) {
            let errorMessage = 'An error occurred during registration.';
            if (error.response?.status === 409) errorMessage = 'User already exists.';
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    },

    registerTrainer: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authService.registerTrainer(data);
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user_id', response.userId.toString());
            localStorage.setItem('role', response.role);
            localStorage.setItem('full_name', response.fullName);

            set({
                user: { id: response.userId, role: response.role, fullName: response.fullName },
                token: response.token,
                isLoading: false,
            });
            return true;
        } catch (error) {
            let errorMessage = 'An error occurred during registration.';
            if (error.response?.status === 409) errorMessage = 'User already exists.';
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('role');
        localStorage.removeItem('full_name');
        set({ user: null, token: null });
    },

    tryAutoLogin: () => {
        const token = localStorage.getItem('auth_token');
        const userId = localStorage.getItem('user_id');
        const role = localStorage.getItem('role');
        const fullName = localStorage.getItem('full_name');

        if (token && userId && role) {
            set({
                user: { id: parseInt(userId, 10), role, fullName },
                token,
            });
            return true;
        }
        return false;
    },

    clearError: () => set({ error: null }),
}));

export default useAuthStore;
