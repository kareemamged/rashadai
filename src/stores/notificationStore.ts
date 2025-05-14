import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { NotificationType } from '../components/ui/Notification';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = uuidv4();
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));
    return id;
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    }));
  },
  clearNotifications: () => {
    set({ notifications: [] });
  },
}));

// Helper functions for common notifications
export const showSuccessNotification = (title: string, message: string, duration = 5000) => {
  return useNotificationStore.getState().addNotification({
    type: 'success',
    title,
    message,
    duration,
  });
};

export const showErrorNotification = (title: string, message: string, duration = 5000) => {
  return useNotificationStore.getState().addNotification({
    type: 'error',
    title,
    message,
    duration,
  });
};

export const showInfoNotification = (title: string, message: string, duration = 5000) => {
  return useNotificationStore.getState().addNotification({
    type: 'info',
    title,
    message,
    duration,
  });
};

export const showWarningNotification = (title: string, message: string, duration = 5000) => {
  return useNotificationStore.getState().addNotification({
    type: 'warning',
    title,
    message,
    duration,
  });
};
