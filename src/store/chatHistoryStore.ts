import { create } from 'zustand';
import { useConsultationStore } from './consultationStore';

export interface ChatSession {
  id: string;
  title: string;
  preview: string;
  date: Date;
  messageCount: number;
  messages?: any[]; // Store actual messages for each chat
}

interface ChatHistoryState {
  chatSessions: ChatSession[];
  currentChatId: string | null;
  addChat: (title: string, preview: string, messages: any[]) => string;
  updateChat: (id: string, data: Partial<ChatSession>) => void;
  deleteChat: (id: string) => void;
  loadChat: (id: string) => void;
  exportChats: (ids: string[]) => void;
  importChats: (importData: any) => boolean;
}

// Helper to save chat history to localStorage
const saveChatHistoryToStorage = (chatSessions: ChatSession[]) => {
  try {
    const userId = JSON.parse(localStorage.getItem('sb-voiwxfqryobznmxgpamq-auth-token') || '{}')?.user?.id;
    if (userId) {
      // Save without messages to keep storage size manageable
      const sessionsForStorage = chatSessions.map(session => ({
        ...session,
        date: session.date.toISOString(),
        messages: undefined // Don't store messages in localStorage
      }));
      localStorage.setItem(`chat_history_${userId}`, JSON.stringify(sessionsForStorage));
    }
  } catch (error) {
    console.error('Error saving chat history to localStorage:', error);
  }
};

// Helper to load chat history from localStorage
const loadChatHistoryFromStorage = (): ChatSession[] => {
  try {
    const userId = JSON.parse(localStorage.getItem('sb-voiwxfqryobznmxgpamq-auth-token') || '{}')?.user?.id;
    if (userId) {
      const storedHistory = localStorage.getItem(`chat_history_${userId}`);
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        return parsedHistory.map((session: any) => ({
          ...session,
          date: new Date(session.date)
        }));
      }
    }
  } catch (error) {
    console.error('Error loading chat history from localStorage:', error);
  }
  
  // Default chat history if nothing is stored
  return [
    {
      id: '1',
      title: 'Consultation about back pain',
      preview: 'I have been experiencing lower back pain for a week...',
      date: new Date(2023, 5, 15),
      messageCount: 12
    },
    {
      id: '2',
      title: 'Flu symptoms inquiry',
      preview: 'What are the symptoms of seasonal flu and how...',
      date: new Date(2023, 5, 10),
      messageCount: 8
    },
    {
      id: '3',
      title: 'Healthy nutrition advice',
      preview: 'I need a healthy diet to improve my overall health...',
      date: new Date(2023, 5, 5),
      messageCount: 15
    },
    {
      id: '4',
      title: 'General medical consultation',
      preview: 'I have been experiencing persistent headaches and insomnia...',
      date: new Date(2023, 4, 28),
      messageCount: 10
    },
    {
      id: '5',
      title: 'COVID-19 vaccine inquiry',
      preview: 'What are the potential side effects of the COVID-19 vaccine...',
      date: new Date(2023, 4, 20),
      messageCount: 7
    }
  ];
};

export const useChatHistoryStore = create<ChatHistoryState>((set, get) => ({
  chatSessions: loadChatHistoryFromStorage(),
  currentChatId: null,

  addChat: (title, preview, messages) => {
    const id = `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newChat: ChatSession = {
      id,
      title,
      preview,
      date: new Date(),
      messageCount: messages.length,
      messages
    };

    set(state => {
      const updatedSessions = [newChat, ...state.chatSessions];
      saveChatHistoryToStorage(updatedSessions);
      return { 
        chatSessions: updatedSessions,
        currentChatId: id
      };
    });

    return id;
  },

  updateChat: (id, data) => {
    set(state => {
      const updatedSessions = state.chatSessions.map(chat => 
        chat.id === id ? { ...chat, ...data } : chat
      );
      saveChatHistoryToStorage(updatedSessions);
      return { chatSessions: updatedSessions };
    });
  },

  deleteChat: (id) => {
    set(state => {
      const updatedSessions = state.chatSessions.filter(chat => chat.id !== id);
      saveChatHistoryToStorage(updatedSessions);
      return { 
        chatSessions: updatedSessions,
        currentChatId: state.currentChatId === id ? null : state.currentChatId
      };
    });
  },

  loadChat: (id) => {
    const { chatSessions } = get();
    const selectedChat = chatSessions.find(chat => chat.id === id);
    
    if (selectedChat) {
      // If we have stored messages, use them
      if (selectedChat.messages && selectedChat.messages.length > 0) {
        useConsultationStore.setState({
          messages: selectedChat.messages,
          isLoading: false,
          isTyping: false,
          typingMessage: null
        });
      } else {
        // Otherwise create a simulated chat based on the preview
        const userMessage = {
          id: `user-${Date.now()}`,
          content: selectedChat.preview,
          isAi: false,
          timestamp: new Date()
        };

        const aiResponse = {
          id: `ai-${Date.now()}`,
          content: `This is a simulated response to your query about "${selectedChat.title}". In a real application, this would load the actual conversation history from the database.`,
          isAi: true,
          timestamp: new Date(Date.now() + 1000)
        };

        useConsultationStore.setState({
          messages: [userMessage, aiResponse],
          isLoading: false,
          isTyping: false,
          typingMessage: null
        });
      }

      set({ currentChatId: id });
    }
  },

  exportChats: (ids) => {
    const { chatSessions } = get();
    const chatsToExport = chatSessions.filter(chat => ids.includes(chat.id));

    if (chatsToExport.length === 0) return;

    // Get user info from localStorage
    let userEmail = 'Anonymous';
    try {
      const userData = JSON.parse(localStorage.getItem('sb-voiwxfqryobznmxgpamq-auth-token') || '{}');
      userEmail = userData?.user?.email || 'Anonymous';
    } catch (error) {
      console.error('Error getting user data for export:', error);
    }

    // Create export data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: userEmail,
      chats: chatsToExport.map(chat => ({
        id: chat.id,
        title: chat.title,
        preview: chat.preview,
        date: chat.date.toISOString(),
        messageCount: chat.messageCount,
        messages: chat.messages || []
      }))
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create download link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importChats: (importData) => {
    try {
      // Validate the imported data structure
      if (!importData.chats || !Array.isArray(importData.chats)) {
        return false;
      }

      // Convert the imported chats to the correct format
      const importedChats: ChatSession[] = importData.chats.map((chat: any) => ({
        id: chat.id || `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: chat.title || 'Imported Chat',
        preview: chat.preview || 'No preview available',
        date: new Date(chat.date || new Date()),
        messageCount: chat.messageCount || 0,
        messages: chat.messages || []
      }));

      // Add the imported chats to the existing chats
      set(state => {
        // Filter out any duplicates by ID
        const existingIds = new Set(state.chatSessions.map(chat => chat.id));
        const newChats = importedChats.filter(chat => !existingIds.has(chat.id));
        const updatedSessions = [...state.chatSessions, ...newChats];
        
        saveChatHistoryToStorage(updatedSessions);
        return { chatSessions: updatedSessions };
      });

      return true;
    } catch (error) {
      console.error('Error importing chats:', error);
      return false;
    }
  }
}));
