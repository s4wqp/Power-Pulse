import { create } from 'zustand';
import { chatService } from '../services/chatService';
import * as signalR from '@microsoft/signalr';

const useChatStore = create((set, get) => ({
    contacts: [],
    messages: [],
    isLoading: false,
    error: null,

    hubConnection: null,
    activeChatPartnerId: null,
    pollingTimer: null,
    isReconnecting: false,
    _userId: null,
    _userRole: null,

    connectSignalR: async (userId, role) => {
        const { hubConnection } = get();

        set({ _userId: userId, _userRole: role });

        if (hubConnection && hubConnection.state === signalR.HubConnectionState.Connected) {
            return;
        }

        if (hubConnection) {
            try {
                await hubConnection.stop();
            } catch {
                // ignore
            }
        }

        const hubUrl = window.location.hostname !== 'localhost'
            ? '/chathub'
            : 'http://powerpuls.runasp.net/chathub';

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl)
            .withAutomaticReconnect()
            .build();

        newConnection.on("ReceiveMessage", (message) => {
            const state = get();
            if (!message || typeof message !== 'object') return;

            const { activeChatPartnerId } = state;
            const mapMsg = message instanceof Array ? message[0] : message;

            if (activeChatPartnerId !== null) {
                const senderId = mapMsg.senderId;
                const receiverId = mapMsg.receiverId;
                const belongsToChat = senderId === activeChatPartnerId || receiverId === activeChatPartnerId;

                if (belongsToChat) {
                    const exists = state.messages.some(m => m.id === mapMsg.id && mapMsg.id != null);
                    if (!exists) {
                        set({ messages: [mapMsg, ...state.messages] });
                    }
                }
            }

            // refresh contacts
            const s = get();
            if (s._userId && s._userRole) {
                get().fetchContacts(s._userId, s._userRole, false);
            }
        });

        newConnection.onclose((error) => {
            console.log("SignalR disconnected:", error);
            get().attemptReconnect();
        });

        newConnection.onreconnecting((error) => {
            console.log("SignalR reconnecting:", error);
        });

        newConnection.onreconnected((connectionId) => {
            console.log("SignalR reconnected with id:", connectionId);
            const s = get();
            if (s._userId && s._userRole) {
                s.hubConnection.invoke("JoinUserGroup", s._userId.toString(), s._userRole).catch(err => {
                    console.error("Failed to re-join group:", err);
                });
            }
        });

        try {
            await newConnection.start();
            await newConnection.invoke("JoinUserGroup", userId.toString(), role);
            set({ hubConnection: newConnection });
            console.log("Successfully connected to SignalR");
        } catch (err) {
            console.error("SignalR connection error:", err);
            get().attemptReconnect();
        }
    },

    attemptReconnect: () => {
        const state = get();
        if (state.isReconnecting) return;
        set({ isReconnecting: true });

        setTimeout(async () => {
            set({ isReconnecting: false });
            const current = get();
            if (current._userId && current._userRole) {
                if (!current.hubConnection || current.hubConnection.state !== signalR.HubConnectionState.Connected) {
                    console.log("Attempting reconnect...");
                    set({ hubConnection: null });
                    await get().connectSignalR(current._userId, current._userRole);
                }
            }
        }, 3000);
    },

    disconnectSignalR: () => {
        const { hubConnection } = get();
        if (hubConnection) {
            hubConnection.stop();
            set({ hubConnection: null });
        }
    },

    startPolling: (myUserId, partnerId, myRole) => {
        const { pollingTimer } = get();
        if (pollingTimer) clearInterval(pollingTimer);

        set({ activeChatPartnerId: partnerId });

        const newTimer = setInterval(async () => {
            try {
                const fetchedMessages = await chatService.getMessages(myUserId, partnerId, myRole);
                const newMessages = fetchedMessages.reverse();

                const state = get();
                const currentLatestId = state.messages.length > 0 ? state.messages[0].id : null;
                const fetchedLatestId = newMessages.length > 0 ? newMessages[0].id : null;

                if (currentLatestId !== fetchedLatestId || state.messages.length !== newMessages.length) {
                    set({ messages: newMessages });
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 5000);

        set({ pollingTimer: newTimer });
    },

    stopPolling: () => {
        const { pollingTimer } = get();
        if (pollingTimer) {
            clearInterval(pollingTimer);
        }
        set({ pollingTimer: null, activeChatPartnerId: null });
    },

    fetchContacts: async (userId, role, showLoading = true) => {
        get().connectSignalR(userId.toString(), role);
        if (showLoading) set({ isLoading: true, error: null });

        try {
            const contacts = await chatService.getContacts(userId, role);
            set({ contacts, ...(showLoading && { isLoading: false }) });
        } catch (error) {
            set({ error: error.message, ...(showLoading && { isLoading: false }) });
        }
    },

    markChatAsRead: async (targetId) => {
        try {
            await chatService.markChatAsRead(targetId);
            const { contacts } = get();
            const updatedContacts = contacts.map(c =>
                c.userId === targetId ? { ...c, unreadCount: 0 } : c
            );
            set({ contacts: updatedContacts });
        } catch (error) {
            console.error("Failed to mark chat as read:", error);
        }
    },

    fetchMessages: async (user1Id, user2Id, user1Role) => {
        get().connectSignalR(user1Id.toString(), user1Role || '');
        set({ activeChatPartnerId: user2Id, isLoading: true, error: null });

        try {
            const fetchedMessages = await chatService.getMessages(user1Id, user2Id);
            set({ messages: fetchedMessages.reverse(), isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    sendMessage: async (data) => {
        set({ error: null });
        try {
            const newMessage = await chatService.sendMessage(data);
            set(state => ({ messages: [newMessage, ...state.messages] }));
            return true;
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || error.message;
            set({ error: msg });
            return false;
        }
    },

    clearError: () => set({ error: null })
}));

export default useChatStore;
