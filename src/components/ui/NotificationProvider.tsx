import React from 'react';
import { NotificationContainer } from './Notification';
import { useNotificationStore } from '../../stores/notificationStore';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <>
      {children}
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </>
  );
};

export default NotificationProvider;
