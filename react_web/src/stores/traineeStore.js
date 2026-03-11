import { create } from 'zustand';
import { traineeService } from '../services/traineeService';

// Helper to extract arrays from .NET API responses that may wrap in {value:[]} or {$values:[]}
const extractArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.value)) return data.value;
    if (data && Array.isArray(data.$values)) return data.$values;
    return [];
};

const useTraineeStore = create((set) => ({
    trainee: null,
    trainerWorkouts: [],
    orders: [],
    addresses: [],
    subscriptions: [],
    isLoading: false,
    error: null,
    fetchProfile: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const data = await traineeService.getProfile(id);
            set({ trainee: data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    updateProfile: async (id, updatedFields) => {
        set({ isLoading: true, error: null });
        try {
            const currentProfile = await traineeService.getProfile(id) || {};
            const payload = {
                name: currentProfile.name,
                phone: currentProfile.phone,
                weight: currentProfile.weight,
                height: currentProfile.height,
                profileImageUrl: currentProfile.profileImageUrl,
                ...updatedFields
            };
            const data = await traineeService.updateProfile(id, payload);
            set({ trainee: data, isLoading: false });
            return true;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return false;
        }
    },

    fetchAddresses: async (traineeId) => {
        set({ isLoading: true, error: null });
        try {
            const data = await traineeService.getAddresses(traineeId);
            const addresses = extractArray(data);
            set({ addresses, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchTrainerWorkouts: async (traineeId) => {
        set({ isLoading: true, error: null });
        try {
            const data = await traineeService.getTrainerWorkouts(traineeId);
            const workouts = extractArray(data);
            set({ trainerWorkouts: workouts, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchSubscriptions: async (traineeId) => {
        set({ isLoading: true, error: null });
        try {
            const data = await traineeService.getTraineeSubscriptions(traineeId);
            const subscriptions = extractArray(data);
            set({ subscriptions, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchOrders: async (traineeId) => {
        set({ isLoading: true, error: null });
        try {
            const data = await traineeService.getTraineeOrders(traineeId);
            const ordersList = extractArray(data);
            set({ orders: ordersList.sort((a, b) => b.id - a.id), isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    addAddress: async (traineeId, addressData) => {
        set({ isLoading: true, error: null });
        try {
            const newAddress = await traineeService.addAddress(traineeId, addressData);
            set(state => ({
                addresses: [...state.addresses, newAddress],
                isLoading: false
            }));
            return true;
        } catch (error) {
            console.error('Failed to add address:', error.response?.data || error);
            const errorMessage = error.response?.data?.message || error.response?.data?.title || error.message || 'Failed to add address';
            set({ error: errorMessage, isLoading: false });
            // Provide exact message back so components can show it
            return { success: false, message: errorMessage };
        }
    },

    placeOrder: async (orderData) => {
        set({ isLoading: true, error: null });
        try {
            const order = await traineeService.placeOrder(orderData);
            set(state => ({ orders: [order, ...state.orders], isLoading: false }));
            return order;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return null;
        }
    }
}));

export default useTraineeStore;
