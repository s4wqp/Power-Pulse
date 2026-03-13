import { create } from 'zustand';
import { trainerService } from '../services/trainerService';

const toNumber = (v) => {
    if (v == null) return 0;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

const extractPlanId = (sub) =>
    sub?.trainingPlanId ??
    sub?.TrainingPlanId ??
    sub?.trainingPlanID ??
    sub?.TrainingPlanID ??
    sub?.training_plan_id ??
    sub?.planId ??
    sub?.PlanId ??
    sub?.planID ??
    sub?.PlanID ??
    sub?.plan_id ??
    sub?.trainingPlan?.id ??
    sub?.trainingPlan?.Id ??
    sub?.plan?.id ??
    sub?.plan?.Id ??
    null;

const extractPlanPrice = (sub, plansById) => {
    const direct =
        sub?.priceSnapshot ??
        sub?.PriceSnapshot ??
        sub?.planPrice ??
        sub?.PlanPrice ??
        sub?.plan_price ??
        sub?.price ??
        sub?.Price ??
        sub?.plan?.price ??
        sub?.trainingPlan?.price;
    if (direct != null) return toNumber(direct);
    const planId = extractPlanId(sub);
    if (planId == null) return 0;
    return toNumber(plansById?.get?.(String(planId))?.price);
};

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
            const totalAmount = toNumber(stats?.totalAmount ?? stats?.TotalAmount);
            if (totalAmount === 0) {
                // Fallback: compute from subscriptions (and plans if needed)
                const [subs, plans] = await Promise.all([
                    trainerService.getTrainerSubscriptions(trainerId),
                    trainerService.getPlans(trainerId),
                ]);
                const plansById = new Map(
                    (plans || [])
                        .filter(p => p && (p.id != null || p.trainingPlanId != null || p.ID != null || p.Id != null))
                        .map(p => [String(p.id ?? p.trainingPlanId ?? p.ID ?? p.Id), p])
                );
                const computedTotalAmount = (subs || []).reduce(
                    (sum, sub) => sum + extractPlanPrice(sub, plansById),
                    0
                );
                stats = {
                    ...stats,
                    totalClients: toNumber(stats?.totalClients ?? stats?.TotalClients) || (subs || []).length,
                    todayAmount: toNumber(stats?.todayAmount ?? stats?.TodayAmount) || 0.0,
                    totalAmount: computedTotalAmount
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
