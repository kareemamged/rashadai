import { create } from 'zustand';

export interface SavedMessage {
  id: string;
  content: string;
  timestamp: Date;
  source?: string; // Optional source or context of the message
}

interface SavedMessagesState {
  savedMessages: SavedMessage[];
  addMessage: (message: SavedMessage) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  isMessageSaved: (id: string) => boolean;
}

// Helper to save messages to localStorage
const saveSavedMessagesToStorage = (savedMessages: SavedMessage[]) => {
  try {
    const userId = JSON.parse(localStorage.getItem('sb-voiwxfqryobznmxgpamq-auth-token') || '{}')?.user?.id;
    if (userId) {
      const messagesForStorage = savedMessages.map(message => ({
        ...message,
        timestamp: message.timestamp.toISOString(),
      }));
      localStorage.setItem(`saved_messages_${userId}`, JSON.stringify(messagesForStorage));
    }
  } catch (error) {
    console.error('Error saving messages to localStorage:', error);
  }
};

// Helper to load saved messages from localStorage
const loadSavedMessagesFromStorage = (): SavedMessage[] => {
  try {
    const userId = JSON.parse(localStorage.getItem('sb-voiwxfqryobznmxgpamq-auth-token') || '{}')?.user?.id;
    if (userId) {
      const storedMessages = localStorage.getItem(`saved_messages_${userId}`);
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        return parsedMessages.map((message: any) => ({
          ...message,
          timestamp: new Date(message.timestamp)
        }));
      }
    }
  } catch (error) {
    console.error('Error loading saved messages from localStorage:', error);
  }
  return [];
};

export const useSavedMessagesStore = create<SavedMessagesState>((set, get) => ({
  savedMessages: loadSavedMessagesFromStorage(),
  
  addMessage: (message) => {
    set(state => {
      // Check if message already exists to avoid duplicates
      if (state.savedMessages.some(m => m.id === message.id)) {
        return state;
      }
      
      const updatedMessages = [...state.savedMessages, message];
      saveSavedMessagesToStorage(updatedMessages);
      return { savedMessages: updatedMessages };
    });
  },
  
  removeMessage: (id) => {
    set(state => {
      const updatedMessages = state.savedMessages.filter(message => message.id !== id);
      saveSavedMessagesToStorage(updatedMessages);
      return { savedMessages: updatedMessages };
    });
  },
  
  clearMessages: () => {
    set(() => {
      saveSavedMessagesToStorage([]);
      return { savedMessages: [] };
    });
  },
  
  isMessageSaved: (id) => {
    return get().savedMessages.some(message => message.id === id);
  }
}));
