import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
    persist(
        (set) => ({
            items: [],

            addItem: (item) => set((state) => {
                const existingIndex = state.items.findIndex(el => el.id === item.id);
                if (existingIndex !== -1) {
                    const newItems = [...state.items];
                    newItems[existingIndex] = {
                        ...newItems[existingIndex],
                        quantity: newItems[existingIndex].quantity + item.quantity
                    };
                    return { items: newItems };
                } else {
                    return { items: [...state.items, item] };
                }
            }),

            removeItem: (index) => set((state) => ({
                items: state.items.filter((_, i) => i !== index)
            })),

            updateQuantity: (index, quantity) => set((state) => {
                const newItems = [...state.items];
                if (newItems[index]) {
                    newItems[index] = { ...newItems[index], quantity };
                }
                return { items: newItems };
            }),

            clearCart: () => set({ items: [] })
        }),
        {
            name: 'powerpulse-cart-storage', // name of the item in the storage (must be unique)
        }
    )
);

export default useCartStore;
