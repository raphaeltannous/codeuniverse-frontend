import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }

  return {
    success: (message: string, duration?: number) => context.addNotification(message, 'success', duration),
    error: (message: string, duration?: number) => context.addNotification(message, 'danger', duration),
    warning: (message: string, duration?: number) => context.addNotification(message, 'warning', duration),
    info: (message: string, duration?: number) => context.addNotification(message, 'info', duration),
  };
}
