import apiClient from './apiClient';

export const chatService = {
    getContacts: async (userId, role) => {
        const response = await apiClient.get('/api/chat/contacts', {
            params: { userId, role }
        });
        return response.data;
    },

    markChatAsRead: async (targetId) => {
        const response = await apiClient.put(`/api/Chat/${targetId}/read`);
        return response.data;
    },

    sendMessage: async (messageData) => {
        const response = await apiClient.post('/api/chat', messageData);
        return response.data;
    },

    getMessages: async (user1Id, user2Id) => {
        const response = await apiClient.get('/api/chat', {
            params: { userId1: user1Id, userId2: user2Id }
        });
        return response.data;
    }
};
