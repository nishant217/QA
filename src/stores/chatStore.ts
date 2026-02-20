import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sendChatMessage, getFallbackResponse, type ChatMessage as GroqChatMessage } from '@/lib/groqClient';
import type { ChatMessage, ChatConversation } from '@/types';

interface ChatState {
  conversations: ChatConversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  createConversation: () => string;
  addMessage: (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  deleteConversation: (conversationId: string) => void;
  clearAllConversations: () => void;
  getCurrentConversation: () => ChatConversation | null;
  setCurrentConversation: (id: string | null) => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      isLoading: false,
      error: null,

      createConversation: () => {
        const newConversation: ChatConversation = {
          id: generateId(),
          title: 'New Conversation',
          messages: [
            {
              id: generateId(),
              role: 'assistant',
              content: 'Hello! I\'m your NyneOS FinFlow AI Assistant. I can help you with Fixed Deposits, treasury operations, banking regulations, tax compliance, and any questions about this platform. How can I assist you today?',
              timestamp: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: newConversation.id,
        }));

        return newConversation.id;
      },

      addMessage: (conversationId, message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  updatedAt: new Date().toISOString(),
                  title: conv.messages.length === 1 && message.role === 'user'
                    ? message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '')
                    : conv.title,
                }
              : conv
          ),
        }));
      },

      sendMessage: async (conversationId, content) => {
        // Add user message
        get().addMessage(conversationId, { role: 'user', content });
        set({ isLoading: true, error: null });

        try {
          const conversation = get().conversations.find(c => c.id === conversationId);
          if (!conversation) throw new Error('Conversation not found');

          // Convert messages to Groq format
          const messages: GroqChatMessage[] = conversation.messages.map(m => ({
            role: m.role,
            content: m.content,
          }));

          // Send to Groq API using the client
          const result = await sendChatMessage(messages);

          if (result.success && result.content) {
            get().addMessage(conversationId, { role: 'assistant', content: result.content });
          } else {
            // Use fallback response if API fails
            const fallbackContent = getFallbackResponse(content);
            get().addMessage(conversationId, { 
              role: 'assistant', 
              content: fallbackContent 
            });
            set({ error: result.error || 'Using offline mode' });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'An error occurred',
          });
          // Use fallback response on error
          const fallbackContent = getFallbackResponse(content);
          get().addMessage(conversationId, {
            role: 'assistant',
            content: fallbackContent,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      deleteConversation: (conversationId) => {
        set((state) => ({
          conversations: state.conversations.filter(c => c.id !== conversationId),
          currentConversationId: state.currentConversationId === conversationId
            ? null
            : state.currentConversationId,
        }));
      },

      clearAllConversations: () => {
        set({
          conversations: [],
          currentConversationId: null,
        });
      },

      getCurrentConversation: () => {
        const { conversations, currentConversationId } = get();
        if (!currentConversationId) return null;
        return conversations.find(c => c.id === currentConversationId) || null;
      },

      setCurrentConversation: (id) => {
        set({ currentConversationId: id });
      },
    }),
    {
      name: 'nyneos-chat',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
      }),
    }
  )
);
