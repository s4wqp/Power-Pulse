import { create } from 'zustand';
import { trainerService } from '../services/trainerService';

const useTrainerStore = create((set, get) => ({
    trainers: [],
    currentTrainer: null,
    currentTrainerPlans: [],
    subscriptions: [],
    stats: null,
    isLoading: false,
    error: null,

    fetchTrainers: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await trainerService.getTrainers();
            // Filter out test trainers
            const filtered = data.filter(t =>
                !t.name.toLowerCase().includes('test ai trainer') &&
                !t.name.toLowerCase().startsWith('test')
            );
            set({ trainers: filtered, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchCurrentTrainer: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const [trainer, plans] = await Promise.all([
                trainerService.getTrainerDetails(id),
                trainerService.getPlans(id)
            ]);
            set({
                currentTrainer: trainer,
                currentTrainerPlans: plans,
                isLoading: false
            });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchTrainerStats: async (trainerId) => {
        try {
            let stats = await trainerService.getTrainerStats(trainerId);
            if (!stats.totalAmount || stats.totalAmount === 0) {
                // Fallback: compute from subscriptions
                const subs = await trainerService.getTrainerSubscriptions(trainerId);
                let totalAmount = 0.0;
                subs.forEach(sub => {
                    totalAmount += Number(sub.planPrice || sub.price || 0);
                });
                stats = {
                    totalClients: subs.length,
                    todayAmount: 0.0,
                    totalAmount
                };
            }
            set({ stats });
        } catch (error) {
            console.error('Failed to fetch trainer stats:', error);
        }
    },

    fetchTrainerSubscriptions: async (trainerId) => {
        try {
            const subscriptions = await trainerService.getTrainerSubscriptions(trainerId);
            set({ subscriptions });
            return subscriptions;
        } catch (error) {
            console.error('Failed to fetch trainer subscriptions', error);
            return [];
        }
    },

    createPlan: async (trainerId, planData) => {
        set({ isLoading: true, error: null });
        try {
            await trainerService.createPlan(trainerId, planData);
            const plans = await trainerService.getPlans(trainerId);
            set({ currentTrainerPlans: plans, isLoading: false });
            return true;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return false;
        }
    },

    saveDailyNote: async (trainerId, traineeId, title, content) => {
        set({ isLoading: true, error: null });
        try {
            const subs = await get().fetchTrainerSubscriptions(trainerId);
            const traineeSubs = subs.filter(s => s.traineeId === traineeId);

            if (traineeSubs.length === 0) {
                set({ error: 'No active subscription found.', isLoading: false });
                return false;
            }

            traineeSubs.sort((a, b) => b.id - a.id); // newest first
            const activeSubId = traineeSubs[0].id;

            await trainerService.addDailyNote(activeSubId, title, content);
            set({ isLoading: false });
            return true;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return false;
        }
    },

    updateProfile: async (trainerId, data) => {
        set({ isLoading: true, error: null });
        try {
            await trainerService.updateProfile(trainerId, data);
            await get().fetchCurrentTrainer(trainerId);
            set({ isLoading: false });
            return true;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return false;
        }
    }
}));

export default useTrainerStore;
