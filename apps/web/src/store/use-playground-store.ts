import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage, ConversationItem } from '@/api/ai-api';

interface PlaygroundState {
  conversations: ConversationItem[];
  activeConversationId: string | null;
  selectedModel: string;
  selectedProvider: string;

  // Actions
  createNewConversation: () => string;
  selectConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  getActiveConversation: () => ConversationItem | undefined;
}

export const usePlaygroundStore = create<PlaygroundState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      selectedModel: 'qwen2.5:7b',
      selectedProvider: 'Ollama (Local)',

      createNewConversation: () => {
        const newId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newConv: ConversationItem = {
          conversationId: newId,
          title: 'New Chat',
          messages: [],
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          conversations: [newConv, ...state.conversations],
          activeConversationId: newId,
        }));

        return newId;
      },

      selectConversation: (conversationId: string) => {
        set({ activeConversationId: conversationId });
      },

      deleteConversation: (conversationId: string) => {
        set((state) => {
          const updated = state.conversations.filter((c) => c.conversationId !== conversationId);
          const nextActive =
            state.activeConversationId === conversationId
              ? updated[0]?.conversationId || null
              : state.activeConversationId;

          return {
            conversations: updated,
            activeConversationId: nextActive,
          };
        });
      },

      addMessage: (conversationId: string, message: ChatMessage) => {
        set((state) => {
          const exists = state.conversations.some((c) => c.conversationId === conversationId);

          if (!exists) {
            const isUser = message.role === 'user';
            const title = isUser
              ? message.content.slice(0, 28) + (message.content.length > 28 ? '...' : '')
              : 'New Chat';

            const newConv: ConversationItem = {
              conversationId,
              title,
              messages: [message],
              updatedAt: new Date().toISOString(),
            };

            return {
              conversations: [newConv, ...state.conversations],
              activeConversationId: conversationId,
            };
          }

          const updatedConversations = state.conversations.map((conv) => {
            if (conv.conversationId === conversationId) {
              const isFirstUserMessage = conv.messages.length === 0 && message.role === 'user';
              const title = isFirstUserMessage
                ? message.content.slice(0, 28) + (message.content.length > 28 ? '...' : '')
                : conv.title;

              return {
                ...conv,
                title,
                messages: [...conv.messages, message],
                updatedAt: new Date().toISOString(),
              };
            }
            return conv;
          });

          return { conversations: updatedConversations };
        });
      },

      getActiveConversation: () => {
        const state = get();
        return state.conversations.find((c) => c.conversationId === state.activeConversationId);
      },
    }),
    {
      name: 'enterprise-ai-playground-storage',
    },
  ),
);
